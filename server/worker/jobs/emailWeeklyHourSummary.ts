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
      /* 
      The smallest this number can be is .01 hours =36 seconds (as per the rounding
      in VolunteerService.ts:68-70) So users with 36-54 seconds of time will have
      .01 hours coaching which gets rounded down to 0 hours/minutes at formatting
      in MailService/index.js:87-99. So we need to check .01 hours in addition
      to 0 prevent an email from getting sent that displays 0 hours of volutneering
      TODO: clean up formatting rounding logic to round 30+ seconds up a minute
      */
      if (!summaryStats || summaryStats.totalVolunteerHours <= 0.01) continue

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
