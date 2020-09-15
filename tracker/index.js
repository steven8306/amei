import 'promise-polyfill/src/polyfill';
import 'unfetch/polyfill';
import { doNotTrack, hook, post } from '../lib/web';
import { removeTrailingSlash } from '../lib/url';

(window => {
  const {
    screen: { width, height },
    navigator: { language },
    location: { hostname, pathname, search },
    document,
    history,
  } = window;

  const script = document.querySelector('script[data-website-id]');

  // eslint-disable-next-line no-undef
  if (!script || (__DNT__ && doNotTrack())) return;

  const website = script.getAttribute('data-website-id');
  const hostUrl = script.getAttribute('data-host-url');
  const skipAuto = script.getAttribute('data-skip-auto');
  const root = hostUrl
    ? removeTrailingSlash(hostUrl)
    : new URL(script.src).href.split('/').slice(0, -1).join('/');
  const screen = `${width}x${height}`;
  const listeners = [];

  let currentUrl = `${pathname}${search}`;
  let currentRef = document.referrer;

  /* Collect metrics */
  const pageViewWithAutoEvents = (url, referrer) => window.umami.pageView(url, referrer).then(() => setTimeout(loadEvents, 300));

  /* Handle history */

  const handlePush = (state, title, url) => {
    removeEvents();
    currentRef = currentUrl;
    const newUrl = url.toString();

    if (newUrl.substring(0, 4) === 'http') {
      const { pathname, search } = new URL(newUrl);
      currentUrl = `${pathname}${search}`;
    } else {
      currentUrl = newUrl;
    }

    pageViewWithAutoEvents(currentUrl, currentRef);
  };

  /* Handle events */

  const removeEvents = () => {
    listeners.forEach(([element, type, listener]) => {
      element && element.removeEventListener(type, listener, true);
    });
    listeners.length = 0;
  };

  const loadEvents = () => {
    document.querySelectorAll('[class*=\'umami--\']').forEach(element => {
      element.className.split(' ').forEach(className => {
        if (/^umami--([a-z]+)--([a-z0-9_]+[a-z0-9-_]+)$/.test(className)) {
          const [, type, value] = className.split('--');
          const listener = () => window.umami.event(type, value);

          listeners.push([element, type, listener]);
          element.addEventListener(type, listener, true);
        }
      });
    });
  };

  if (!window.umami) {
    window.umami = event_value => window.umami.event('custom', event_value, currentUrl);
    window.umami.collect = (type, params, id) => {
      if (!id) {
        id = website;
      }
      const payload = {
        website: id,
        hostname,
        screen,
        language,
      };

      if (params) {
        Object.keys(params).forEach(key => {
          payload[key] = params[key];
        });
      }

      return post(`${root}/api/collect`, {
        type,
        payload,
      });
    };
    window.umami.pageView = (url = currentUrl, referrer = currentRef) => window.umami.collect('pageview', {
      url,
      referrer,
    });
    window.umami.event = (event_type, event_value, url = currentUrl) => window.umami.collect('event', {
      url,
      event_type,
      event_value,
    });
    window.umami.registerAutoEvents = () => {
      history.pushState = hook(history, 'pushState', handlePush);
      history.replaceState = hook(history, 'replaceState', handlePush);
      return pageViewWithAutoEvents(currentUrl, currentRef);
    };
  }

  /* Start */
  if (!skipAuto) {
    window.umami.registerAutoEvents().catch(e => console.error(e));
  }
})(window);
