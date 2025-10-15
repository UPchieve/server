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

    const sendCustomReport = volunteerPartnerOrg
      ? config.customVolunteerPartnerOrgs.includes(volunteerPartnerOrg)
      : false
    const summaryStats = sendCustomReport
      ? await telecomHourSummaryStats(id, start.toDate(), end.toDate())
      : await getHourSummaryStats(id, start.toDate(), end.toDate())

    /*
      The smallest the total volunteer hours can be is .01 hours
      because of the rounding in `getHourSummaryStats`.
      Users with .01 hours coaching gets rounded down to 0 hours/minutes at
      formatting in `sendHourSummaryEmail`, and we don't want to send an email
      with 0 hours of volunteering.
      TODO: clean up formatting rounding logic to round 30+ seconds up a minute.
      */
    if (summaryStats.totalVolunteerHours <= 0.01) return

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
      summaryStats.totalReferralMinutes,
      sendCustomReport
    )
    if (!sentHourSummaryIntroEmail)
      await updateVolunteerHourSummaryIntroById(id)
  } catch (e) {
    throw new Error(
      `Job/${Jobs.EmailWeeklyHourSummary} for userId: ${volunteer.id}, startDate: ${startDate}, endDate: ${endDate} with error: ${e}`
    )
  }
}
