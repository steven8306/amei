import { ClickHouse } from 'clickhouse';
import dateFormat from 'dateformat';
import debug from 'debug';
import { CLICKHOUSE } from 'lib/db';
import { QueryFilters } from './types';
import { FILTER_COLUMNS, IGNORED_FILTERS } from './constants';
import { loadWebsite } from './load';
import { maxDate } from './date';

export const CLICKHOUSE_DATE_FORMATS = {
  minute: '%Y-%m-%d %H:%M:00',
  hour: '%Y-%m-%d %H:00:00',
  day: '%Y-%m-%d',
  month: '%Y-%m-01',
  year: '%Y-01-01',
};

const log = debug('umami:clickhouse');

let clickhouse: ClickHouse;
const enabled = Boolean(process.env.CLICKHOUSE_URL);

function getClient() {
  const {
    hostname,
    port,
    pathname,
    username = 'default',
    password,
  } = new URL(process.env.CLICKHOUSE_URL);

  const client = new ClickHouse({
    url: hostname,
    port: Number(port),
    format: 'json',
    config: {
      database: pathname.replace('/', ''),
    },
    basicAuth: password ? { username, password } : null,
  });

  if (process.env.NODE_ENV !== 'production') {
    global[CLICKHOUSE] = client;
  }

  log('Clickhouse initialized');

  return client;
}

function getDateStringQuery(data, unit) {
  return `formatDateTime(${data}, '${CLICKHOUSE_DATE_FORMATS[unit]}')`;
}

function getDateQuery(field, unit, timezone?) {
  if (timezone) {
    return `date_trunc('${unit}', ${field}, '${timezone}')`;
  }
  return `date_trunc('${unit}', ${field})`;
}

function getDateFormat(date) {
  return `'${dateFormat(date, 'UTC:yyyy-mm-dd HH:MM:ss')}'`;
}

function getFilterQuery(filters = {}) {
  const query = Object.keys(filters).reduce((arr, key) => {
    const filter = filters[key];

    if (filter !== undefined && !IGNORED_FILTERS.includes(key)) {
      const column = FILTER_COLUMNS[key] || key;
      arr.push(`and ${column} = {${key}:String}`);
    }

    if (key === 'referrer') {
      arr.push('and referrer_domain != {websiteDomain:String}');
    }

    return arr;
  }, []);

  return query.join('\n');
}

async function parseFilters(
  websiteId: string,
  filters: QueryFilters & { [key: string]: any } = {},
) {
  const website = await loadWebsite(websiteId);

  return {
    filterQuery: getFilterQuery(filters),
    params: {
      ...filters,
      websiteId,
      startDate: maxDate(filters.startDate, website.resetAt),
      websiteDomain: website.domain,
    },
  };
}

async function rawQuery<T>(query: string, params: object = {}): Promise<T> {
  if (process.env.LOG_QUERY) {
    log('QUERY:\n', query);
    log('PARAMETERS:\n', params);
  }

  await connect();

  return clickhouse.query(query, { params }).toPromise() as Promise<T>;
}

async function findUnique(data) {
  if (data.length > 1) {
    throw `${data.length} records found when expecting 1.`;
  }

  return findFirst(data);
}

async function findFirst(data) {
  return data[0] ?? null;
}

async function connect() {
  if (enabled && !clickhouse) {
    clickhouse = process.env.CLICKHOUSE_URL && (global[CLICKHOUSE] || getClient());
  }

  return clickhouse;
}

export default {
  enabled,
  client: clickhouse,
  log,
  connect,
  getDateStringQuery,
  getDateQuery,
  getDateFormat,
  getFilterQuery,
  parseFilters,
  findUnique,
  findFirst,
  rawQuery,
};
