import moment from 'moment-timezone'
import {
  incrementTotalVolunteerHours,
  getVolunteers
} from '../../services/VolunteerService'
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

  const dateQuery = { $gt: startDate.toDate(), $lte: endDate.toDate() }
  const volunteers = await getVolunteers(
    {
      isTestUser: false,
      isFakeUser: false,
      volunteerPartnerOrg: {
        $in: config.customVolunteerPartnerOrgs
      },
      isOnboarded: true,
      isApproved: true
    },
    {
      _id: 1,
      certifications: 1,
      totalVolunteerHours: 1
    }
  )

  let totalUpdated = 0
  const errors = []
  for (const volunteer of volunteers) {
    try {
      const stats = await telecomHourSummaryStats(volunteer, dateQuery)
      await incrementTotalVolunteerHours(
        { _id: volunteer._id },
        stats.totalVolunteerHours
      )
    } catch (error) {
      errors.push(`${volunteer._id}: ${error}\n`)
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
