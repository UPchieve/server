import moment from 'moment-timezone'
import {
  incrementVolunteer,
  getVolunteers
} from '../../services/VolunteerService'
import { log } from '../logger'
import { generateTelecomAnalytics } from '../../utils/reportUtils'
import config from '../../config'
import { Jobs } from './index'

async function updateTotalVolunteerHours(): Promise<void> {
  // TODO: track last time this ran to ensure full time coverage
  const startDate = moment().subtract(1, 'week')
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

  const rows = await generateTelecomAnalytics(volunteers, dateQuery)

  let totalUpdated = 0
  const errors = []
  for (const volunteer of volunteers) {
    try {
      const hours = rows[volunteer._id.toString()].totalHours
      await incrementVolunteer(
        { _id: volunteer._id },
        { totalVolunteerHours: hours }
      )
    } catch (error) {
      errors.push(`${volunteer._id} could not update total hours: ${error}`)
      continue
    }
    totalUpdated += 1
  }
  log(
    `Successfully ${Jobs.UpdateTotalVolunteerHours} for ${totalUpdated} volunteers`
  )
  if (errors.length) {
    throw new Error(
      `Failed to ${Jobs.UpdateTotalVolunteerHours} for volunteers: ${errors}`
    )
  }
}

export default updateTotalVolunteerHours
