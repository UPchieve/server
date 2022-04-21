import moment from 'moment'
import 'moment-timezone'
import newrelic from 'newrelic'
import config from '../config'
import { Ulid } from '../models/pgUtils'
import { getQuizzesPassedForDateRange } from '../models/Volunteer'
import {
  getVolunteersForWeeklyHourSummary,
  updateVolunteerHourSummaryIntroById,
} from '../models/Volunteer/queries'
import { getTotalElapsedAvailabilityForDateRange } from '../services/AvailabilityService'
import * as MailService from '../services/MailService'
import { getTimeTutoredForDateRange } from '../services/SessionService'
import { getHourSummaryStats } from '../services/VolunteerService'
import { Jobs } from '../worker/jobs'
import { log } from '../worker/logger'

export interface HourSummaryStats {
  totalCoachingHours: number
  totalQuizzesPassed: number
  totalElapsedAvailability: number
  totalVolunteerHours: number
}

// using the old implementation of getHourSummaryStats that called `getQuizzesPassedForDateRange`
// when we sent out the first initial set of emails
export async function getIncorrectHourSummaryStats(
  volunteerId: Ulid,
  fromDate: Date,
  toDate: Date
): Promise<HourSummaryStats> {
  const [
    quizzesPassed,
    elapsedAvailability,
    timeTutoredMS,
  ] = await Promise.all([
    getQuizzesPassedForDateRange(volunteerId, fromDate, toDate),
    getTotalElapsedAvailabilityForDateRange(volunteerId, fromDate, toDate),
    getTimeTutoredForDateRange(volunteerId, fromDate, toDate),
  ])

  const timeTutoredInHours = Number(timeTutoredMS / 3600000).toFixed(2)
  const totalCoachingHours = Number(timeTutoredInHours)
  // Total volunteer hours calculation: [sum of coaching, elapsed avail/10, and quizzes]
  const totalVolunteerHours = Number(
    (
      totalCoachingHours +
      quizzesPassed +
      Number(elapsedAvailability) * 0.1
    ).toFixed(2)
  )
  return {
    totalCoachingHours,
    totalQuizzesPassed: quizzesPassed,
    totalElapsedAvailability: elapsedAvailability,
    totalVolunteerHours: totalVolunteerHours,
  }
}

export default async function sendWeeklyHourSummaryApology(): Promise<void> {
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
      let incorrectSummaryStats
      if (volunteer.sentHourSummaryIntroEmail === undefined) continue
      // custom volunteer partner orgs were not affected by this bug and do not need to
      // receive the apology email
      if (customCheck) continue

      incorrectSummaryStats = await getIncorrectHourSummaryStats(
        id,
        lastMonday.toDate(),
        lastSunday.toDate()
      )
      summaryStats = await getHourSummaryStats(
        id,
        lastMonday.toDate(),
        lastSunday.toDate()
      )
      // skip sending the email if the incorrect stats were 0 because these users did
      // not receive a weekly summary email from us
      if (
        !incorrectSummaryStats ||
        !summaryStats ||
        incorrectSummaryStats.totalVolunteerHours <= 0.01
      )
        continue

      // send apology email to those who had no tutoring hours in the past week, but received incorrect stats
      if (
        incorrectSummaryStats.totalVolunteerHours !==
          summaryStats.totalVolunteerHours &&
        summaryStats.totalVolunteerHours <= 0.01
      )
        await MailService.sendWeeklyHourApologyEmail(
          firstName,
          email,
          lastMonday.format('dddd, MMM D'),
          lastSunday.format('dddd, MMM D')
        )
      else
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
