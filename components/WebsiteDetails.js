import React, { useState } from 'react';
import classNames from 'classnames';
import WebsiteChart from 'components/metrics/WebsiteChart';
import WorldMap from 'components/common/WorldMap';
import Page from 'components/layout/Page';
import WebsiteHeader from 'components/metrics/WebsiteHeader';
import MenuLayout from 'components/layout/MenuLayout';
import Button from 'components/common/Button';
import { getDateRange } from 'lib/date';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteDetails.module.css';
import PagesTable from './metrics/PagesTable';
import ReferrersTable from './metrics/ReferrersTable';
import BrowsersTable from './metrics/BrowsersTable';
import OSTable from './metrics/OSTable';
import DevicesTable from './metrics/DevicesTable';
import CountriesTable from './metrics/CountriesTable';
import EventsTable from './metrics/EventsTable';
import EventsChart from './metrics/EventsChart';
import useFetch from 'hooks/useFetch';
import Loading from 'components/common/Loading';

export default function WebsiteDetails({ websiteId, defaultDateRange = '7day' }) {
  const [chartLoaded, setChartLoaded] = useState(false);
  const [countryData, setCountryData] = useState();
  const [eventsData, setEventsData] = useState();
  const [expand, setExpand] = useState();
  const [refresh, setRefresh] = useState(0);
  const [dateRange, setDateRange] = useState(getDateRange(defaultDateRange));
  const { startDate, endDate, unit } = dateRange;
  const { data } = useFetch(`/api/website/${websiteId}`);

  const BackButton = () => (
    <Button
      className={styles.backButton}
      icon={<Arrow />}
      size="xsmall"
      onClick={() => setExpand(null)}
    >
      <div>Back</div>
    </Button>
  );

  const menuOptions = [
    {
      render: BackButton,
    },
    { label: 'Pages', value: 'url', component: PagesTable },
    { label: 'Referrers', value: 'referrer', component: ReferrersTable },
    { label: 'Browsers', value: 'browser', component: BrowsersTable },
    { label: 'Operating system', value: 'os', component: OSTable },
    { label: 'Devices', value: 'device', component: DevicesTable },
    {
      label: 'Countries',
      value: 'country',
      component: props => <CountriesTable {...props} onDataLoad={data => setCountryData(data)} />,
    },
    { label: 'Events', value: 'event', component: EventsTable },
  ];

  const dataProps = {
    websiteId,
    startDate,
    endDate,
    unit,
  };

  const tableProps = {
    ...dataProps,
    websiteDomain: data?.domain,
    limit: 10,
    onExpand: handleExpand,
  };

  const DetailsComponent = expand?.component;

  function getSelectedMenuOption(value) {
    return menuOptions.find(e => e.value === value);
  }

  function handleDataLoad() {
    if (!chartLoaded) setTimeout(() => setChartLoaded(true), 300);
  }

  function handleDateChange(values) {
    setTimeout(() => setDateRange(values), 300);
  }

  function handleExpand(value) {
    setExpand(getSelectedMenuOption(value));
  }

  function handleMenuSelect(value) {
    setExpand(getSelectedMenuOption(value));
  }

  function handleRefresh() {
    setRefresh(state => state + 1);
  }

  if (!data) {
    return null;
  }

  return (
    <Page>
      <div className="row">
        <div className={classNames(styles.chart, 'col')}>
          <WebsiteHeader
            websiteId={websiteId}
            title={data.name}
            onRefresh={handleRefresh}
            showLink={false}
          />
          <WebsiteChart
            key={refresh}
            websiteId={websiteId}
            onDataLoad={handleDataLoad}
            onDateChange={handleDateChange}
            stickyHeader
          />
        </div>
      </div>
      {!chartLoaded && <Loading />}
      {chartLoaded && !expand && (
        <>
          <div className={classNames(styles.row, 'row')}>
            <div className="col-md-12 col-lg-6">
              <PagesTable {...tableProps} />
            </div>
            <div className="col-md-12 col-lg-6">
              <ReferrersTable {...tableProps} />
            </div>
          </div>
          <div className={classNames(styles.row, 'row')}>
            <div className="col-md-12 col-lg-4">
              <BrowsersTable {...tableProps} />
            </div>
            <div className="col-md-12 col-lg-4">
              <OSTable {...tableProps} />
            </div>
            <div className="col-md-12 col-lg-4">
              <DevicesTable {...tableProps} />
            </div>
          </div>
          <div className={classNames(styles.row, 'row')}>
            <div className="col-12 col-md-12 col-lg-8">
              <WorldMap data={countryData} />
            </div>
            <div className="col-12 col-md-12 col-lg-4">
              <CountriesTable {...tableProps} onDataLoad={setCountryData} />
            </div>
          </div>
          <div
            className={classNames(styles.row, 'row', { [styles.hidden]: !eventsData?.length > 0 })}
          >
            <div className="col-12 col-md-12 col-lg-4">
              <EventsTable {...tableProps} onDataLoad={setEventsData} />
            </div>
            <div className="col-12 col-md-12 col-lg-8 pt-5 pb-5">
              <EventsChart {...dataProps} />
            </div>
          </div>
        </>
      )}
      {expand && (
        <MenuLayout
          className={styles.expand}
          menuClassName={styles.menu}
          optionClassName={styles.option}
          menu={menuOptions}
          selectedOption={expand.value}
          onMenuSelect={handleMenuSelect}
        >
          <DetailsComponent {...tableProps} limit={false} />
        </MenuLayout>
      )}
    </Page>
  );
}
