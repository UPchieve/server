import moment from 'moment-timezone'
import { log } from '../../logger'
import { getVolunteers } from '../../../services/VolunteerService'
import MailService from '../../../services/MailService'
import VolunteerModel from '../../../models/Volunteer'
import { Jobs } from '../'
import config from '../../../config'
import { generateTelecomAnalytics } from '../../../utils/reportUtils'

// Runs weekly at 6am EST on Monday
async function emailCustomWeeklyHourSummary(): Promise<void> {
  const lastMonday = moment()
    .utc()
    .subtract(1, 'weeks')
    .startOf('isoWeek')
  const lastSunday = moment()
    .utc()
    .subtract(1, 'weeks')
    .endOf('isoWeek')
  const dateQuery = { $gt: lastMonday.toDate(), $lte: lastSunday.toDate() }
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

  let totalEmailed = 0
  const errors = []
  for (const volunteer of volunteers) {
    const {
      _id,
      firstname: firstName,
      email,
      sentHourSummaryIntroEmail
    } = volunteer
    try {
      const summaryStats = rows[volunteer._id.toString()]
      // A volunteer must have non-zero totalVolunteerHours for the prior week (Monday-Sunday) to receive an email
      if (!summaryStats.totalVolunteerHours) continue

      const data = {
        firstName,
        email,
        sentHourSummaryIntroEmail,
        fromDate: lastMonday.format('dddd, MMM D'),
        toDate: lastSunday.format('dddd, MMM D'),
        ...summaryStats
      }
      await MailService.sendCustomHourSummaryEmail(data)
      if (!sentHourSummaryIntroEmail)
        await VolunteerModel.updateOne(
          { _id },
          { sentHourSummaryIntroEmail: true }
        )
      totalEmailed++
    } catch (error) {
      errors.push(`volunteer ${_id}: ${error}`)
    }
  }

  log(`Sent ${Jobs.EmailCustomWeeklyHourSummary} to ${totalEmailed} volunteers`)
  if (errors.length) {
    throw new Error(
      `Failed to send ${Jobs.EmailCustomWeeklyHourSummary} to: ${errors}`
    )
  }
}

export default emailCustomWeeklyHourSummary
