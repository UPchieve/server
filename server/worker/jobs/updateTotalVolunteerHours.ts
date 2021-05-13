import moment from 'moment-timezone'
import VolunteerModel from '../../models/Volunteer'
import { getVolunteers } from '../../services/VolunteerService'
import { log } from '../logger'
import { generateTelecomAnalytics } from '../../utils/reportUtils'
import { Jobs } from '.'
import config from '../../config'

async function updateTotalVolunteerHours(): Promise<void> {
  const partnerOrg = config.customPartnerVolunteerReport
  const startDate = moment()  // TODO: track last time this ran
  const endDate = moment()

  const dateQuery = { $gt: startDate.toDate(), $lte: endDate.toDate() }
  const volunteers = await getVolunteers(
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
  // TODO: call reportUtils.generateTelecomAnalytics
  let totalUpdated = 0
  let errors = []
  for (const volunteer of volunteers) {
    try {
      await VolunteerModel.updateOne(
        { _id: volunteer._id },
        { totalVolunteerHours: FOO }
      )
    } catch (error) {
      errors.push(
        `Volunteer ${volunteer._id} failed to update total volunteer hours: ${error}`
      )
      continue
    }
    totalUpdated += 1
  }
  log(
    `Successfully ${Jobs.UpdateTotalVolunteerHours} for ${totalUpdated} volunteers`
  )
  if (errors.length) {
    throw new Error(
      `Failed to ${Jobs.UpdateTotalVolunteerHours} for volunteers ${errors}`
    )
  }
}

export default updateTotalVolunteerHours