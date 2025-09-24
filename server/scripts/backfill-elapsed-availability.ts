import moment from 'moment'
import 'moment-timezone'
import {
  getVolunteerIdsForElapsedAvailability,
  setVolunteerElapsedAvailabilityById,
} from '../models/Volunteer/queries'
import { getTotalElapsedAvailabilityForDateRange } from '../services/AvailabilityService'
import { Jobs } from '../worker/jobs'
import { log } from '../worker/logger'

export default async function backfillElapsedAvailability() {
  // Don't run before the daily 4:00 AM ET cron job
  const nowEt = moment.tz('America/New_York')
  if (nowEt.hour() < 5) {
    log(
      `${Jobs.BackfillElapsedAvailability}: exiting — must run after 8:00 AM ET`
    )
    return
  }

  const volunteerIds = await getVolunteerIdsForElapsedAvailability()
  const errors: string[] = []
  let totalUpdated = 0
  // Fixed early start date so we capture all records.
  // We can optionally use the volunteer's createdAt instead
  const start = new Date('2000-01-01T00:00:00Z')
  const endEt = nowEt.clone().subtract(1, 'day').endOf('day')
  const endUtc = endEt.clone().utc().toDate()

  for (const volunteerId of volunteerIds) {
    try {
      const total = await getTotalElapsedAvailabilityForDateRange(
        volunteerId,
        start,
        endUtc
      )
      if (total === 0) continue

      await setVolunteerElapsedAvailabilityById(volunteerId, total)
      totalUpdated += 1
    } catch (error) {
      errors.push(
        `Volunteer ${volunteerId} failed to update elapsed availability: ${error}`
      )
    }
  }

  log(
    `Successfully ${Jobs.BackfillElapsedAvailability}: ${totalUpdated} volunteers`
  )

  if (errors.length) {
    throw new Error(
      `${Jobs.BackfillElapsedAvailability}: has errors ${errors.join('\n')}`
    )
  }
}
