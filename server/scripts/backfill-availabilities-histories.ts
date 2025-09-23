import moment from 'moment'
import 'moment-timezone'
import { Job } from 'bull'
import * as db from '../db'
import {
  getAvailabilityForVolunteerByDate,
  saveAvailabilityAsHistoryByDate,
} from '../models/Availability'
import { getVolunteerIdsForElapsedAvailability } from '../models/Volunteer/queries'
import { Jobs } from '../worker/jobs'
import { log } from '../worker/logger'
import countAvailabilitySelected from '../utils/count-availability-selected'
import { asString } from '../utils/type-utils'

type BackfillAvailabilityHistoriesData = {
  // Example: '2025-09-01'
  fromDate: string
  toDate?: string
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
  let totalUpdated = 0

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

        // Grab the most recent availability snapshot time instant
        const availability = await getAvailabilityForVolunteerByDate(
          volunteerId,
          snapshotTimeUtc
        )
        if (!availability || countAvailabilitySelected(availability) === 0)
          continue

        await saveAvailabilityAsHistoryByDate(volunteerId, snapshotTimeUtc)
        totalUpdated += 1
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
    `${Jobs.BackfillAvailabilityHistories}: inserted ${totalUpdated} history rows`
  )

  if (errors.length)
    throw new Error(
      `${Jobs.BackfillAvailabilityHistories}: errors (${errors.length}):\n${errors.join('\n')}`
    )
}
