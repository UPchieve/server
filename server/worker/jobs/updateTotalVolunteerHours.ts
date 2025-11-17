import moment from 'moment'
import 'moment-timezone'
import { Job } from 'bull'
import {
  getVolunteersForTotalHours,
  updateVolunteerTotalHoursById,
} from '../../models/Volunteer/queries'
import { log } from '../logger'
import { telecomHourSummaryStats } from '../../utils/reportUtils'
import config from '../../config'
import * as cache from '../../cache'
import { Jobs } from './index'

export type UpdateTotalVolunteerHoursJobData = {
  // Example: '2025-11-01T04:00:00.000Z'
  startDate?: string
}

// TODO: Update the name to make it more clear this is only
// for the `customVolunteerPartnerOrgs`.
async function updateTotalVolunteerHours(
  job: Job<UpdateTotalVolunteerHoursJobData>
): Promise<void> {
  const cachedDate = await cache.getIfExists(
    config.cacheKeys.updateTotalVolunteerHoursLastRun
  )
  const endDate = moment.tz('America/New_York')
  // The default start date is last Monday at 6am ET
  const defaultStart = endDate
    .clone()
    .startOf('isoWeek')
    .hour(6)
    .startOf('hour')
    .subtract(7, 'days')

  // Use the custom date passed in if provided
  // If not provided, use the cached last run date
  // If no cache value exists, default to last Monday at 6am ET,
  // which is when the cron job runs
  const startDate = job.data?.startDate
    ? moment.tz(job.data.startDate, 'America/New_York')
    : cachedDate
      ? moment(cachedDate)
      : defaultStart

  const volunteers = await getVolunteersForTotalHours()

  let totalUpdated = 0
  const errors: string[] = []
  for (const volunteer of volunteers) {
    try {
      const stats = await telecomHourSummaryStats(
        volunteer.id,
        startDate.toDate(),
        endDate.toDate()
      )
      await updateVolunteerTotalHoursById(
        volunteer.id,
        stats.totalVolunteerHours
      )
      totalUpdated += 1
    } catch (error) {
      errors.push(`${volunteer.id}: ${error}\n`)
    }
  }
  log(
    `Successfully ${Jobs.UpdateTotalVolunteerHours} for ${totalUpdated} volunteers`
  )
  await cache.save(
    config.cacheKeys.updateTotalVolunteerHoursLastRun,
    endDate.toISOString()
  )

  if (errors.length) {
    throw new Error(
      `Failed to ${Jobs.UpdateTotalVolunteerHours} for volunteers:\n${errors}`
    )
  }
}

export default updateTotalVolunteerHours
