import moment from 'moment'
import 'moment-timezone'
import { getHourSummaryStats } from '../../services/VolunteerService'
import * as MailService from '../../services/MailService'
import config from '../../config'
import { telecomHourSummaryStats } from '../../utils/reportUtils'
import {
  VolunteerForWeeklyHourSummary,
  updateVolunteerHourSummaryIntroById,
} from '../../models/Volunteer/queries'
import { getWeeklySummaryAllHoursFlag } from '../../services/FeatureFlagService'
import { Job } from 'bull'
import { ISOString } from '../../constants'
import { Jobs } from '.'
interface EmailWeeklyHourSummaryJobData {
  startDate: ISOString
  endDate: ISOString
  volunteer: VolunteerForWeeklyHourSummary
}

export default async (
  job: Job<EmailWeeklyHourSummaryJobData>
): Promise<void> => {
  const { volunteer, startDate, endDate } = job.data
  try {
    const {
      id,
      firstName,
      email,
      sentHourSummaryIntroEmail,
      volunteerPartnerOrg,
    } = volunteer
    const start = moment(startDate).utc()
    const end = moment(endDate).utc()
    const customCheck = config.customVolunteerPartnerOrgs.some(
      org => org === volunteerPartnerOrg
    )
    let summaryStats
    if (volunteer.sentHourSummaryIntroEmail === undefined) return
    if (customCheck)
      summaryStats = await telecomHourSummaryStats(
        volunteer,
        start.toDate(),
        end.toDate()
      )
    else
      summaryStats = await getHourSummaryStats(id, start.toDate(), end.toDate())

    const isWeeklySummaryAllHoursActive = await getWeeklySummaryAllHoursFlag(id)
    const allowZeroHours = isWeeklySummaryAllHoursActive && !volunteerPartnerOrg

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
      return

    await MailService.sendHourSummaryEmail(
      firstName,
      email,
      sentHourSummaryIntroEmail,
      start.format('dddd, MMM D'),
      end.format('dddd, MMM D'),
      summaryStats.totalCoachingHours,
      summaryStats.totalElapsedAvailability,
      summaryStats.totalQuizzesPassed,
      summaryStats.totalVolunteerHours,
      customCheck
    )
    if (!sentHourSummaryIntroEmail)
      await updateVolunteerHourSummaryIntroById(id)
  } catch (e) {
    throw new Error(
      `Job/${Jobs.EmailWeeklyHourSummary} for userId: ${volunteer.id}, startDate: ${startDate}, endDate: ${endDate} with error: ${e}`
    )
  }
}
