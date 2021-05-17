import moment from 'moment-timezone'
import { log } from '../logger'
import {
  getVolunteers,
  getHourSummaryStats
} from '../../services/VolunteerService'
import MailService from '../../services/MailService'
import VolunteerModel from '../../models/Volunteer'
import { volunteerPartnerManifests } from '../../partnerManifests'
import { Jobs } from '.'
import config from '../../config'
import { generateTelecomAnalytics } from '../../utils/reportUtils'

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

  const unsubscribedPartners = [config.customPartnerVolunteerReport]
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
      volunteerPartnerOrg: 1
    }
  )

  const customVolunteers = await getVolunteers(
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
  const dateQuery = { $gt: lastMonday.toDate(), $lte: lastSunday.toDate() }
  let stats
  try {
    stats = await generateTelecomAnalytics(volunteers, dateQuery)
  } catch (error) {
    stats = {}  // do not throw error on access
    log('Could not generate custom partner org analytics. Will not send custom emails.')
  }

  let totalEmailed = 0
  const errors = []
  for (const volunteer of [...volunteers, ...customVolunteers]) {
    const {
      _id,
      firstname: firstName,
      email,
      sentHourSummaryIntroEmail,
      volunteerPartnerOrg
    } = volunteer
    try {
      const customCheck = volunteerPartnerOrg === config.customPartnerVolunteerReport
      let summaryStats
      if (customCheck)
        summaryStats = stats[_id.toString()]
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
      errors.push(`volunteer ${_id}: ${error}`)
    }
  }

  log(`Sent ${Jobs.EmailWeeklyHourSummary} to ${totalEmailed} volunteers`)
  if (errors.length) {
    throw new Error(
      `Failed to send ${Jobs.EmailWeeklyHourSummary} to: ${errors}`
    )
  }
}
