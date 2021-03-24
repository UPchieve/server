import moment from 'moment-timezone'
import logger, {
  logEmailJobSent,
  logEmailJobError,
  LogEmailJob
} from '../../logger'
import {
  getVolunteers,
  getHourSummaryStats
} from '../../services/VolunteerService'
import MailService from '../../services/MailService'
import VolunteerModel from '../../models/Volunteer'
import { volunteerPartnerManifests } from '../../partnerManifests'
import { Jobs } from '.'

// Runs weekly at 6am EST on Monday
export default async (): Promise<void> => {
  const unsubscribedPartners = []
  for (const partnerOrg in volunteerPartnerManifests) {
    if (!volunteerPartnerManifests[partnerOrg].receiveWeeklyHourSummaryEmail)
      unsubscribedPartners.push(partnerOrg)
  }

  const volunteers = await getVolunteers(
    {
      isBanned: false,
      isDeactivated: false,
      isFakeUser: false,
      isTestUser: false,
      volunteerPartnerOrg: { $nin: unsubscribedPartners }
    },
    {
      firstname: 1,
      email: 1,
      sentHourSummaryIntroEmail: 1
    }
  )

  //  Monday-Sunday
  const lastMonday = moment()
    .utc()
    .subtract(1, 'weeks')
    .startOf('isoWeek')
  const lastSunday = moment()
    .utc()
    .subtract(1, 'weeks')
    .endOf('isoWeek')
  let totalEmailed = 0
  for (const volunteer of volunteers) {
    const {
      _id,
      firstname: firstName,
      email,
      sentHourSummaryIntroEmail
    } = volunteer
    const logData: LogEmailJob = {
      job: Jobs.EmailWeeklyHourSummary,
      userId: volunteer._id
    }
    try {
      const summaryStats = await getHourSummaryStats(
        _id,
        lastMonday,
        lastSunday
      )
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
      await MailService.sendHourSummaryEmail(data)
      if (!sentHourSummaryIntroEmail)
        await VolunteerModel.updateOne(
          { _id },
          { sentHourSummaryIntroEmail: true }
        )
      totalEmailed++
      logEmailJobSent(logData)
    } catch (error) {
      logData.error = error
      logEmailJobError(logData)
    }
  }

  return logger.info(
    `Sent ${Jobs.EmailWeeklyHourSummary} to ${totalEmailed} volunteers`
  )
}
