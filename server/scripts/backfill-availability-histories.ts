import moment from 'moment'
import 'moment-timezone'
import { Job } from 'bull'
import * as db from '../db'
import { getVolunteerIdsForElapsedAvailability } from '../models/Volunteer/queries'
import { Jobs } from '../worker/jobs'
import { log } from '../worker/logger'
import { asString } from '../utils/type-utils'

type BackfillAvailabilityHistoriesData = {
  // Inclusive - Example: '2025-09-01'
  fromDate: string
  // Exclusive - Example: '2025-09-03' will have last record processed as '2025-09-02'
  toDate?: string
}

type AvailabilityRow = {
  available_start: number
  available_end: number
  timezone: string
  weekday: string
}

async function hasAvailabilityHistoryAtRecordedAt(
  userId: string,
  recordedAt: Date
): Promise<boolean> {
  const { rows } = await db.getClient().query(
    `
    SELECT EXISTS (
      SELECT 1
      FROM availability_histories
      WHERE user_id = $1
        AND recorded_at = $2
    ) AS exists;
    `,
    [userId, recordedAt]
  )
  return rows[0]?.exists === true
}

async function getAvailabilityHistoryRowsAtOrBefore(
  userId: string,
  recordedAt: Date
): Promise<AvailabilityRow[]> {
  const { rows } = await db.getClient().query(
    `
    SELECT
        ah.available_start,
        ah.available_end,
        ah.timezone,
        weekdays.day AS weekday
    FROM
        availability_histories ah
        JOIN weekdays ON weekdays.id = ah.weekday_id
    WHERE
        ah.user_id = $1
        AND ah.recorded_at = (
            SELECT
                MAX(recorded_at)
            FROM
                availability_histories
            WHERE
                user_id = $1
                AND recorded_at <= $2);
    `,
    [userId, recordedAt]
  )
  return rows
}

async function insertAvailabilityHistoryRows(
  userId: string,
  recordedAt: Date,
  rows: AvailabilityRow[]
): Promise<number> {
  if (rows.length === 0) return 0

  const startTimes: number[] = []
  const endTimes: number[] = []
  const days: string[] = []

  for (const row of rows) {
    startTimes.push(row.available_start)
    endTimes.push(row.available_end)
    days.push(row.weekday)
  }
  const timezone = rows[0]?.timezone

  const results = await db.getClient().query(
    `
      WITH args AS (
          SELECT
              $1::uuid AS user_id,
              $2::timestamptz AS recorded_at,
              $6::text AS timezone)
      INSERT INTO availability_histories (id, user_id, recorded_at, available_start, available_end, timezone, weekday_id, created_at, updated_at)
      SELECT
          generate_ulid (),
          args.user_id,
          args.recorded_at,
          time_ranges.available_start,
          time_ranges.available_end,
          args.timezone,
          weekdays.id,
          NOW(),
          NOW()
      FROM
          args
          JOIN unnest($3::int[], $4::int[], $5::text[]) AS time_ranges (available_start,
              available_end,
              weekday_name) ON TRUE
          JOIN weekdays ON weekdays.day = time_ranges.weekday_name;
    `,
    [userId, recordedAt, startTimes, endTimes, days, timezone]
  )
  return results.rowCount ?? 0
}

export default async function backfillAvailabilityHistories(
  job: Job<BackfillAvailabilityHistoriesData>
): Promise<void> {
  const { fromDate, toDate } = job.data
  await db.connect()

  // Get a snapshot at 4:00 am ET, since that is when the cron job runs
  let snapshotTimeEt = moment
    .tz(asString(fromDate), 'America/New_York')
    .startOf('day')
    .hour(4)
  const endSnapshotTimeEt = (
    toDate
      ? moment.tz(toDate, 'America/New_York')
      : moment.tz('America/New_York')
  )
    .startOf('day')
    .hour(4)

  if (snapshotTimeEt.isSameOrAfter(endSnapshotTimeEt)) {
    log(
      `${Jobs.BackfillAvailabilityHistories}: start date must be before end date`
    )
    return
  }

  const volunteerIds = await getVolunteerIdsForElapsedAvailability()
  const errors: string[] = []
  let totalRowsInserted = 0

  while (snapshotTimeEt.isBefore(endSnapshotTimeEt)) {
    const snapshotTimeUtc = snapshotTimeEt.clone().utc().toDate()
    for (const volunteerId of volunteerIds) {
      try {
        /**
         *
         * When we calculate elapsed hours given a date range with getTotalElapsedAvailabilityForDateRange,
         * we only use one snapshot per calendar day.
         * Extra snapshots for the same day won't change the total calculated for elapsed availability.
         * The reason why we check if a snapshot exists here is so that we don't bloat the table
         * with snapshots on backfill re-runs
         *
         */
        const alreadyHasSnapshot = await hasAvailabilityHistoryAtRecordedAt(
          volunteerId,
          snapshotTimeUtc
        )
        if (alreadyHasSnapshot) continue

        // Grab the most recent availability snapshots and duplicate them for today's
        // daily snapshot. Note: This could grab either the daily snapshot, or the
        // snapshot taken when the user changes their availability.
        const rows = await getAvailabilityHistoryRowsAtOrBefore(
          volunteerId,
          snapshotTimeUtc
        )
        if (rows.length === 0) continue

        const insertedRows = await insertAvailabilityHistoryRows(
          volunteerId,
          snapshotTimeUtc,
          rows
        )
        if (insertedRows > 0) totalRowsInserted += insertedRows
      } catch (error) {
        errors.push(
          `${Jobs.BackfillAvailabilityHistories}: snapshot ${snapshotTimeUtc.toISOString()} for volunteer ${volunteerId} failed: ${error}`
        )
      }
    }

    // Next day's 4:00 AM ET
    snapshotTimeEt = snapshotTimeEt.add(1, 'day')
  }

  log(
    `${Jobs.BackfillAvailabilityHistories}: inserted ${totalRowsInserted} history rows`
  )

  if (errors.length)
    throw new Error(
      `${Jobs.BackfillAvailabilityHistories}: errors (${errors.length}):\n${errors.join('\n')}`
    )
}
