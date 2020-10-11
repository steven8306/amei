import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { subMinutes, startOfMinute } from 'date-fns';
import firstBy from 'thenby';
import Page from 'components/layout/Page';
import GridLayout, { GridRow, GridColumn } from 'components/layout/GridLayout';
import RealtimeChart from 'components/metrics/RealtimeChart';
import RealtimeLog from 'components/metrics/RealtimeLog';
import RealtimeHeader from 'components/metrics/RealtimeHeader';
import WorldMap from 'components/common/WorldMap';
import DataTable from 'components/metrics/DataTable';
import useFetch from 'hooks/useFetch';
import useLocale from 'hooks/useLocale';
import useCountryNames from 'hooks/useCountryNames';
import { percentFilter } from 'lib/filters';
import styles from './RealtimeDashboard.module.css';

const REALTIME_RANGE = 30;
const REALTIME_INTERVAL = 3000;

function mergeData(state, data, time) {
  const ids = state.map(({ __id }) => __id);
  return state
    .concat(data.filter(({ __id }) => !ids.includes(__id)))
    .filter(({ created_at }) => new Date(created_at).getTime() >= time);
}

function filterWebsite(data, id) {
  return data.filter(({ website_id }) => website_id === id);
}

export default function RealtimeDashboard() {
  const [locale] = useLocale();
  const countryNames = useCountryNames(locale);
  const [data, setData] = useState();
  const [websiteId, setWebsiteId] = useState(0);
  const { data: init, loading } = useFetch('/api/realtime/init');
  const { data: updates } = useFetch('/api/realtime/update', {
    params: { start_at: data?.timestamp },
    disabled: !init?.websites?.length || !data,
    interval: REALTIME_INTERVAL,
    headers: { 'x-umami-token': init?.token },
  });

  const renderCountryName = useCallback(({ x }) => countryNames[x], []);

  const realtimeData = useMemo(() => {
    if (data) {
      const { pageviews, sessions, events } = data;

      if (websiteId) {
        return {
          pageviews: filterWebsite(pageviews, websiteId),
          sessions: filterWebsite(sessions, websiteId),
          events: filterWebsite(events, websiteId),
        };
      }
    }

    return data;
  }, [data, websiteId]);

  const countries = useMemo(() => {
    if (realtimeData?.sessions) {
      return percentFilter(
        realtimeData.sessions
          .reduce((arr, { country }) => {
            if (country) {
              const row = arr.find(({ x }) => x === country);

              if (!row) {
                arr.push({ x: country, y: 1 });
              } else {
                row.y += 1;
              }
            }
            return arr;
          }, [])
          .sort(firstBy('y', -1)),
      );
    }
    return [];
  }, [realtimeData?.sessions]);

  const referrers = useMemo(() => {
    if (realtimeData?.pageviews) {
      return percentFilter(
        realtimeData.pageviews
          .reduce((arr, { referrer }) => {
            if (referrer?.startsWith('http')) {
              const { hostname } = new URL(referrer);

              if (!data.domains.includes(hostname)) {
                const row = arr.find(({ x }) => x === hostname);

                if (!row) {
                  arr.push({ x: hostname, y: 1 });
                } else {
                  row.y += 1;
                }
              }
            }
            return arr;
          }, [])
          .sort(firstBy('y', -1)),
      );
    }
    return [];
  }, [realtimeData?.pageviews]);

  useEffect(() => {
    if (init && !data) {
      const { websites, data } = init;
      const domains = init.websites.map(({ domain }) => domain);

      setData({ websites, domains, ...data });
    }
  }, [init]);

  useEffect(() => {
    if (updates) {
      const { pageviews, sessions, events, timestamp } = updates;
      const time = subMinutes(startOfMinute(new Date()), REALTIME_RANGE).getTime();

      setData(state => ({
        ...state,
        pageviews: mergeData(state.pageviews, pageviews, time),
        sessions: mergeData(state.sessions, sessions, time),
        events: mergeData(state.events, events, time),
        timestamp,
      }));
    }
  }, [updates]);

  if (!init || !data || loading) {
    return null;
  }

  const { websites } = data;

  return (
    <Page>
      <RealtimeHeader
        websites={websites}
        websiteId={websiteId}
        data={{ ...realtimeData, countries }}
        onSelect={setWebsiteId}
      />
      <div className={styles.chart}>
        <RealtimeChart
          websiteId={websiteId}
          data={realtimeData}
          unit="minute"
          records={REALTIME_RANGE}
        />
      </div>
      <GridLayout>
        <GridRow>
          <GridColumn xs={12} lg={4}>
            <DataTable
              title={<FormattedMessage id="metrics.referrers" defaultMessage="Referrers" />}
              metric={<FormattedMessage id="metrics.views" defaultMessage="Views" />}
              data={referrers}
              height={400}
            />
          </GridColumn>
          <GridColumn xs={12} lg={8}>
            <RealtimeLog data={realtimeData} websites={websites} />
          </GridColumn>
        </GridRow>
        <GridRow>
          <GridColumn xs={12} lg={4}>
            <DataTable
              title={<FormattedMessage id="metrics.countries" defaultMessage="Countries" />}
              metric={<FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />}
              data={countries}
              renderLabel={renderCountryName}
              height={500}
            />
          </GridColumn>
          <GridColumn xs={12} lg={8}>
            <WorldMap data={countries} />
          </GridColumn>
        </GridRow>
      </GridLayout>
    </Page>
  );
}
