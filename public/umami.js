!function(){"use strict";function e(e){var n=this.constructor;return this.then((function(t){return n.resolve(e()).then((function(){return t}))}),(function(t){return n.resolve(e()).then((function(){return n.reject(t)}))}))}var n=setTimeout;function t(e){return Boolean(e&&void 0!==e.length)}function r(){}function o(e){if(!(this instanceof o))throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],f(e,this)}function i(e,n){for(;3===e._state;)e=e._value;0!==e._state?(e._handled=!0,o._immediateFn((function(){var t=1===e._state?n.onFulfilled:n.onRejected;if(null!==t){var r;try{r=t(e._value)}catch(e){return void s(n.promise,e)}u(n.promise,r)}else(1===e._state?u:s)(n.promise,e._value)}))):e._deferreds.push(n)}function u(e,n){try{if(n===e)throw new TypeError("A promise cannot be resolved with itself.");if(n&&("object"==typeof n||"function"==typeof n)){var t=n.then;if(n instanceof o)return e._state=3,e._value=n,void c(e);if("function"==typeof t)return void f((r=t,i=n,function(){r.apply(i,arguments)}),e)}e._state=1,e._value=n,c(e)}catch(n){s(e,n)}var r,i}function s(e,n){e._state=2,e._value=n,c(e)}function c(e){2===e._state&&0===e._deferreds.length&&o._immediateFn((function(){e._handled||o._unhandledRejectionFn(e._value)}));for(var n=0,t=e._deferreds.length;n<t;n++)i(e,e._deferreds[n]);e._deferreds=null}function a(e,n,t){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof n?n:null,this.promise=t}function f(e,n){var t=!1;try{e((function(e){t||(t=!0,u(n,e))}),(function(e){t||(t=!0,s(n,e))}))}catch(e){if(t)return;t=!0,s(n,e)}}o.prototype["catch"]=function(e){return this.then(null,e)},o.prototype.then=function(e,n){var t=new this.constructor(r);return i(this,new a(e,n,t)),t},o.prototype["finally"]=e,o.all=function(e){return new o((function(n,r){if(!t(e))return r(new TypeError("Promise.all accepts an array"));var o=Array.prototype.slice.call(e);if(0===o.length)return n([]);var i=o.length;function u(e,t){try{if(t&&("object"==typeof t||"function"==typeof t)){var s=t.then;if("function"==typeof s)return void s.call(t,(function(n){u(e,n)}),r)}o[e]=t,0==--i&&n(o)}catch(e){r(e)}}for(var s=0;s<o.length;s++)u(s,o[s])}))},o.resolve=function(e){return e&&"object"==typeof e&&e.constructor===o?e:new o((function(n){n(e)}))},o.reject=function(e){return new o((function(n,t){t(e)}))},o.race=function(e){return new o((function(n,r){if(!t(e))return r(new TypeError("Promise.race accepts an array"));for(var i=0,u=e.length;i<u;i++)o.resolve(e[i]).then(n,r)}))},o._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e)}||function(e){n(e,0)},o._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)};var l=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw new Error("unable to locate global object")}();"Promise"in l?l.Promise.prototype["finally"]||(l.Promise.prototype["finally"]=e):l["Promise"]=o,self.fetch||(self.fetch=function(e,n){return n=n||{},new Promise((function(t,r){var o=new XMLHttpRequest,i=[],u=[],s={},c=function(){return{ok:2==(o.status/100|0),statusText:o.statusText,status:o.status,url:o.responseURL,text:function(){return Promise.resolve(o.responseText)},json:function(){return Promise.resolve(JSON.parse(o.responseText))},blob:function(){return Promise.resolve(new Blob([o.response]))},clone:c,headers:{keys:function(){return i},entries:function(){return u},get:function(e){return s[e.toLowerCase()]},has:function(e){return e.toLowerCase()in s}}}};for(var a in o.open(n.method||"get",e,!0),o.onload=function(){o.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,(function(e,n,t){i.push(n=n.toLowerCase()),u.push([n,t]),s[n]=s[n]?s[n]+","+t:t})),t(c())},o.onerror=r,o.withCredentials="include"==n.credentials,n.headers)o.setRequestHeader(a,n.headers[a]);o.send(n.body||null)}))});var d=window.screen,p=d.width,h=d.height,v=window.navigator.language,y=window.location,w=y.hostname,m=y.pathname,_=y.search,g=window.localStorage,b=window.document,j=window.history,P=b.querySelector("script[data-website-id]");if(P){var S=P.getAttribute("data-website-id");if(S){var T="umami.session",R=new URL(P.src).origin,x=p+"x"+h,F=""+m+_,O=b.referrer,E=function(e,n){return fetch(e,{method:"post",cache:"no-cache",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(n)}).then((function(e){return e.json()}))},I=function(e){return E(R+"/api/session",e).then((function(e){var n=e.success,t=function(e,n){var t={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&-1===n.indexOf(r)&&(t[r]=e[r]);return t}(e,["success"]);if(n)return g.setItem(T,JSON.stringify(t)),n}))},L=function(e,n){return E(R+"/api/collect",{type:"pageview",payload:{url:e,referrer:n,session:JSON.parse(g.getItem(T))}}).then((function(e){var n=e.success;return n||g.removeItem(T),n}))},A=function(e,n){var t=function(e){return{website_id:S,hostname:w,url:e,screen:x,language:v}}(e);g.getItem(T)?L(e,n).then((function(e){return!e&&I(t)})):I(t).then((function(t){return t&&L(e,n)}))},C=function(e,n,t){O=F,A(F=t,O)},J=function(e,n){var t=j[e];return function(e,r,o){var i=[e,r,o];return n.apply(null,i),t.apply(j,i)}};j.pushState=J("pushState",C),j.replaceState=J("replaceState",C),A(F,O)}}}();
