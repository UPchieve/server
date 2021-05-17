import moment from 'moment-timezone'
import {
  incrementTotalVolunteerHours,
  getVolunteers
} from '../../services/VolunteerService'
import { log } from '../logger'
import { generateTelecomAnalytics } from '../../utils/reportUtils'
import config from '../../config'
import * as cache from '../../cache'
import { Jobs } from './index'

async function updateTotalVolunteerHours(): Promise<void> {
  const startDate = moment(
    cache.get(config.cacheKeys.updateTotalVolunteerHoursLastRun)
  )
  const endDate = moment()

  const dateQuery = { $gt: startDate.toDate(), $lte: endDate.toDate() }
  const volunteers = await getVolunteers(
    {
      isTestUser: false,
      isFakeUser: false,
      volunteerPartnerOrg: config.customPartnerVolunteerReport,
      isOnboarded: true,
      isApproved: true
    },
    {
      _id: 1,
      createdAt: 1,
      firstname: 1,
      lastname: 1,
      email: 1,
      certifications: 1,
      volunteerPartnerOrg: 1,
      elapsedAvailability: 1,
      totalVolunteerHours: 1
    }
  )

  const stats = await generateTelecomAnalytics(volunteers, dateQuery)

  let totalUpdated = 0
  const errors = []
  for (const volunteer of volunteers) {
    try {
      const hours = stats[volunteer._id.toString()].totalVolunteerHours
      await incrementTotalVolunteerHours({ _id: volunteer._id }, hours)
    } catch (error) {
      errors.push(`${volunteer._id} could not update total hours: ${error}`)
      continue
    }
    totalUpdated += 1
  }
  log(
    `Successfully ${Jobs.UpdateTotalVolunteerHours} for ${totalUpdated} volunteers`
  )
  cache.save(
    config.cacheKeys.updateTotalVolunteerHoursLastRun,
    endDate.toString()
  )

  if (errors.length) {
    throw new Error(
      `Failed to ${Jobs.UpdateTotalVolunteerHours} for volunteers: ${errors}`
    )
  }
}

export default updateTotalVolunteerHours
