import { subMinutes } from 'date-fns';
import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export async function getActiveVisitors(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(website_id) {
  const date = subMinutes(new Date(), 5);
  const params = [website_id, date];

  return prisma.rawQuery(
    `select count(distinct session_id) x
    from pageview
    where website_id = $1
    and created_at >= $2`,
    params,
  );
}

async function clickhouseQuery(website_uuid) {
  const { rawQuery, getDateFormat } = clickhouse;
  const params = [website_uuid];

  return rawQuery(
    `select count(distinct session_id) x
    from event
    where website_id = $1
    and created_at >= ${getDateFormat(subMinutes(new Date(), 5))}`,
    params,
  );
}
