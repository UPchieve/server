import moment from 'moment'
import 'moment-timezone'
import {
  getVolunteersForTotalHours,
  updateVolunteerTotalHoursById,
} from '../../models/Volunteer/queries'
import { log } from '../logger'
import { telecomHourSummaryStats } from '../../utils/reportUtils'
import config from '../../config'
import * as cache from '../../cache'
import { Jobs } from './index'

async function updateTotalVolunteerHours(): Promise<void> {
  const startDate = moment(
    await cache.get(config.cacheKeys.updateTotalVolunteerHoursLastRun)
  )
  const endDate = moment()
  const volunteers = await getVolunteersForTotalHours()

  let totalUpdated = 0
  const errors: string[] = []
  for (const volunteer of volunteers) {
    try {
      const stats = await telecomHourSummaryStats(
        volunteer,
        startDate.toDate(),
        endDate.toDate()
      )
      await updateVolunteerTotalHoursById(
        volunteer.id,
        stats.totalVolunteerHours
      )
    } catch (error) {
      errors.push(`${volunteer.id}: ${error}\n`)
      continue
    }
    totalUpdated += 1
  }
  log(
    `Successfully ${Jobs.UpdateTotalVolunteerHours} for ${totalUpdated} volunteers`
  )
  await cache.save(
    config.cacheKeys.updateTotalVolunteerHoursLastRun,
    endDate.format()
  )

  if (errors.length) {
    throw new Error(
      `Failed to ${Jobs.UpdateTotalVolunteerHours} for volunteers:\n${errors}`
    )
  }
}

export default updateTotalVolunteerHours
