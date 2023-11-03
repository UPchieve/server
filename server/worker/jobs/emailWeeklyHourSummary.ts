import moment from 'moment'
import 'moment-timezone'
import { log } from '../logger'
import { getHourSummaryStats } from '../../services/VolunteerService'
import * as MailService from '../../services/MailService'
import config from '../../config'
import { telecomHourSummaryStats } from '../../utils/reportUtils'
import { Jobs } from '.'
import {
  getVolunteersForWeeklyHourSummary,
  updateVolunteerHourSummaryIntroById,
} from '../../models/Volunteer/queries'
import newrelic from 'newrelic'
import { getWeeklySummaryAllHoursFlag } from '../../services/FeatureFlagService'

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

  const volunteers = await getVolunteersForWeeklyHourSummary()

  let totalEmailed = 0
  const errors: string[] = []
  for (const volunteer of volunteers) {
    const {
      id,
      firstName,
      email,
      sentHourSummaryIntroEmail,
      volunteerPartnerOrg,
    } = volunteer
    try {
      const customCheck = config.customVolunteerPartnerOrgs.some(
        org => org === volunteerPartnerOrg
      )
      let summaryStats
      if (volunteer.sentHourSummaryIntroEmail === undefined) continue
      if (customCheck)
        summaryStats = await telecomHourSummaryStats(
          volunteer,
          lastMonday.toDate(),
          lastSunday.toDate()
        )
      else
        summaryStats = await getHourSummaryStats(
          id,
          lastMonday.toDate(),
          lastSunday.toDate()
        )

      const isWeeklySummaryAllHoursActive = await getWeeklySummaryAllHoursFlag(
        id
      )
      const allowZeroHours =
        isWeeklySummaryAllHoursActive && !volunteerPartnerOrg

      /*
      The smallest this number can be is .01 hours =36 seconds (as per the rounding
      in VolunteerService.ts:68-70) So users with 36-54 seconds of time will have
      .01 hours coaching which gets rounded down to 0 hours/minutes at formatting
      in MailService/index.js:87-99. So we need to check .01 hours in addition
      to 0 prevent an email from getting sent that displays 0 hours of volutneering
      TODO: clean up formatting rounding logic to round 30+ seconds up a minute
      */
      if (
        !summaryStats ||
        (!allowZeroHours && summaryStats.totalVolunteerHours <= 0.01)
      )
        continue

      await MailService.sendHourSummaryEmail(
        firstName,
        email,
        sentHourSummaryIntroEmail,
        lastMonday.format('dddd, MMM D'),
        lastSunday.format('dddd, MMM D'),
        summaryStats.totalCoachingHours,
        summaryStats.totalElapsedAvailability,
        summaryStats.totalQuizzesPassed,
        summaryStats.totalVolunteerHours,
        customCheck
      )
      if (!sentHourSummaryIntroEmail)
        await updateVolunteerHourSummaryIntroById(volunteer.id)
      totalEmailed++
    } catch (error) {
      errors.push(`${id}: ${error}\n`)
    }
  }

  newrelic.recordMetric(`Job/${Jobs.EmailWeeklyHourSummary}`, totalEmailed)
  log(
    `Successfully ${Jobs.EmailWeeklyHourSummary} for ${totalEmailed} volunteers`
  )
  if (errors.length) {
    throw new Error(
      `Failed to ${Jobs.EmailWeeklyHourSummary} for volunteers:\n${errors}`
    )
  }
}
