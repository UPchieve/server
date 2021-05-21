import moment from 'moment-timezone'
import { log } from '../logger'
import {
  getVolunteers,
  getHourSummaryStats
} from '../../services/VolunteerService'
import MailService from '../../services/MailService'
import VolunteerModel from '../../models/Volunteer'
import { volunteerPartnerManifests } from '../../partnerManifests'
import config from '../../config'
import { telecomHourSummaryStats } from '../../utils/reportUtils'
import { Jobs } from '.'

// Runs weekly at 6am EST on Monday
export default async (): Promise<void> => {
  //  Monday-Sunday
  const lastMonday = moment()
    .utc()
    .subtract(1, 'weeks')
    .startOf('isoWeek')
  const lastSunday = moment()
    .utc()
    .subtract(1, 'weeks')
    .endOf('isoWeek')

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
      sentHourSummaryIntroEmail: 1,
      volunteerPartnerOrg: 1,
      certifications: 1
    }
  )

  const dateQuery = { $gt: lastMonday.toDate(), $lte: lastSunday.toDate() }

  let totalEmailed = 0
  const errors = []
  for (const volunteer of volunteers) {
    const {
      _id,
      firstname: firstName,
      email,
      sentHourSummaryIntroEmail,
      volunteerPartnerOrg
    } = volunteer
    try {
      const customCheck =
        volunteerPartnerOrg === config.customVolunteerPartnerOrg
      let summaryStats
      if (customCheck)
        summaryStats = await telecomHourSummaryStats(volunteer, dateQuery)
      else
        summaryStats = await getHourSummaryStats(
          _id,
          lastMonday.toDate(),
          lastSunday.toDate()
        )
      // A volunteer must have non-zero totalVolunteerHours for the prior week (Monday-Sunday) to receive an email
      if (!summaryStats || !summaryStats.totalVolunteerHours) continue

      const data = {
        firstName,
        email,
        sentHourSummaryIntroEmail,
        fromDate: lastMonday.format('dddd, MMM D'),
        toDate: lastSunday.format('dddd, MMM D'),
        customOrg: customCheck,
        ...summaryStats
      }
      await MailService.sendHourSummaryEmail(data)
      if (!sentHourSummaryIntroEmail)
        await VolunteerModel.updateOne(
          { _id },
          { sentHourSummaryIntroEmail: true }
        )
      totalEmailed++
    } catch (error) {
      errors.push(`${_id}: ${error}\n`)
    }
  }

  log(
    `Successfully ${Jobs.EmailWeeklyHourSummary} for ${totalEmailed} volunteers`
  )
  if (errors.length) {
    throw new Error(
      `Failed to ${Jobs.EmailWeeklyHourSummary} for volunteers:\n${errors}`
    )
  }
}
