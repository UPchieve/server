import moment from 'moment-timezone'
import { getVolunteers } from '../../services/VolunteerService'
import { log } from '../logger'
import { generateTelecomReport } from '../../utils/reportUtils'
import { Jobs } from '.'
import config from '../../config'
import volunteers from '../../router/api/volunteers'

async function updateTotalVolunteerHours(): Promise<void> {
  const partnerOrg = config.customPartnerVolunteerReport
  const startDate = moment()  // TODO: track last time this ran
  const endDate = moment()

  let volunteers
  try {
    const dateQuery = { $gt: startDate.toDate(), $lte: endDate.toDate() }
    volunteers = await getVolunteers(
      {
        isTestUser: false,
        isFakeUser: false,
        volunteerPartnerOrg: partnerOrg,
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
        elapsedAvailability: 1
      }
    )
  } catch (error) {
    throw new Error('Failed to look up telecom volunteers')
  }
  if (volunteers.length === 0) {
    throw new Error('No telecom volunteers found')
  }
}

export default updateTotalVolunteerHours