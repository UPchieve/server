import moment from 'moment'
import 'moment-timezone'
import { Types } from 'mongoose'
import { capitalize } from 'lodash'
import exceljs from 'exceljs'
import {
  USER_ACTION,
  HOUR_TO_UTC_MAPPING,
  ONBOARDING_STATUS,
  DATE_RANGE_COMPARISON_FIELDS,
} from '../constants'
import { getActionsWithPipeline } from '../models/UserAction/queries'
import * as SessionRepo from '../models/Session/queries'
import { getHistoryForDatesByVolunteerId } from '../models/Availability/queries'
import logger from '../logger'
import { isCertified } from '../controllers/UserCtrl'
import { Session } from '../models/Session'
import { Certifications } from '../models/Volunteer'
import { getVolunteersWithPipeline } from '../models/Volunteer/queries'
import { HOURS } from '../models/Availability/types'
import { AvailabilityHistory } from '../models/Availability/History'
import { UserAction } from '../models/UserAction'
import {
  VolunteerForHourSummary,
  VolunteerForTelecomReport,
} from '../models/Volunteer/queries'
import { HourSummaryStats } from '../services/VolunteerService'
import {
  studentPartnerManifests,
  volunteerPartnerManifests,
  sponsorOrgManifests,
} from '../partnerManifests'
import { InputError } from '../models/Errors'
import countCerts from './count-certs'
import roundUpToNearestInterval from './round-up-to-nearest-interval'
import { countCertsByType } from './count-certs-by-type'
import { asFactory, asOptional, asString } from './type-utils'
import config from '../config'
import getAssociatedPartnerOrgByKey from './get-associated-partner-by-key'

/**
 * dateQuery is types as any for now since we know it's a mongo agg date query
 * acc is also typed any due to issues with Availability type
 */

interface Stamp {
  day: string
  hour: string
}

function formatStamp(time: moment.Moment): Stamp {
  return { day: time.format('MM-DD-YYYY'), hour: time.format('H') }
}

function addToAcc(acc: any, time: moment.Moment, minutes: number): void {
  const { day, hour } = formatStamp(time)
  if (day in acc) {
    const sub = acc[day]
    if (hour in sub) {
      sub[hour] += minutes
    } else {
      sub[hour] = minutes
    }
  } else {
    acc[day] = { hour: minutes }
  }
}

function readFromAcc(acc: any, time: moment.Moment): number {
  const { day, hour } = formatStamp(time)
  if (day in acc) {
    const sub = acc[day]
    if (hour in sub) {
      return sub[hour]
    }
  }
  return 0
}

// Reduce accumulator to single day totals
// reduced_acc = { day: number }
function reduceAcc(acc: any) {
  const final: any = {}
  for (const day of Object.keys(acc)) {
    let total = 0
    const sub = acc[day]
    for (const hour of Object.keys(sub)) {
      total += sub[hour]
    }
    if (total === 0) continue
    final[day] = Number((total / 60).toFixed(2))
  }
  return final
}

function telecomTutorTime(
  sessions: Session[],
  availabilityForDateRange: AvailabilityHistory[],
  quizPassedActions: UserAction[]
) {
  const acc: any = {} // accumulator { MM-DD-YYYY: {H: time volunteered in minutes } }
  const sessionAcc: any = {}
  const availabilityAcc: any = {}
  const certificationAcc: any = {}
  // TODO: double loop on sessions is inefficient
  // check if tutoring occured on a day
  for (const session of sessions) {
    const startedAt = moment(session.volunteerJoinedAt).tz('America/New_York')
    acc[startedAt.format('MM-DD-YYYY')] = {}
    // Count tutoring time in accumulator separately
    if (session.timeTutored !== 0) {
      addToAcc(
        sessionAcc,
        startedAt,
        // convert ms -> min
        roundUpToNearestInterval(
          (session.timeTutored ? session.timeTutored : 0) / 60000,
          15
        )
      )
    }
  }
  // Add time spent on call per availability hour
  for (const availabilityHistory of availabilityForDateRange) {
    const availability = availabilityHistory.availability
    for (const hourA of Object.keys(availability)) {
      if (availability[hourA as HOURS]) {
        const temp = moment(availabilityHistory.date)
        const { day, hour } = formatStamp(
          temp.hour(HOUR_TO_UTC_MAPPING[hourA as HOURS])
        )
        // If day is not aleady accounted for do not add since no tutoring happened
        if (day in acc) {
          acc[day][hour] = 60
          // Count into availability accumulator separately
          if (day in availabilityAcc) availabilityAcc[day][hour] = 60
          else availabilityAcc[day] = { hour: 60 }
        }
      }
    }
  }
  // Add time spent in tutoring sessions
  for (const session of sessions) {
    if (session.timeTutored === 0) continue
    const startedAt = moment(session.volunteerJoinedAt).tz('America/New_York')
    const endedAt = moment(session.endedAt).tz('America/New_York')
    let counter = moment(startedAt)
    let contribution = 0
    let skipped = 0
    while (counter < endedAt) {
      // Move counter up to the next hour per iteration
      // Add to the accumulator the number of minutes traversed
      // If we would have passed 'endedAt' traverse minutes until endedAt
      let offset = 60 - counter.minutes()
      const nextHour = moment(counter).add(offset, 'minutes')
      if (nextHour > endedAt) {
        offset = endedAt.minutes() - counter.minutes()
      }
      // Do not add contribution if hour block already set to 60 by availability
      if (readFromAcc(acc, counter) < 60) contribution += offset
      // remove tutoring time from availability accumulator
      else skipped += offset
      counter = nextHour
    }
    // Add extra time to account for rounding duration up to nearest 15
    contribution = roundUpToNearestInterval(contribution, 15)
    skipped = roundUpToNearestInterval(skipped, 15)
    addToAcc(acc, startedAt, contribution)
    addToAcc(availabilityAcc, startedAt, -1 * skipped)
  }
  // Add time spent on certifications
  for (const quizPassed of quizPassedActions) {
    const createdAt = moment(quizPassed.createdAt).tz('America/New_York')
    // No need to check for tutoring/availability overlap according to spec
    addToAcc(acc, createdAt, 60)
    // Count quiz time in separate accumulator
    addToAcc(certificationAcc, createdAt, 60)
  }
  return {
    totalTime: reduceAcc(acc),
    sessionTime: reduceAcc(sessionAcc),
    availabilityTime: reduceAcc(availabilityAcc),
    certificationTime: reduceAcc(certificationAcc),
  }
}

const eventId = 4003 // telecom custom event id

interface TelecomRow {
  name: string
  email: string
  eventId: number
  date: string
  hours: number
}

async function getVolunteerData<V extends VolunteerForHourSummary>(
  volunteer: V,
  dateQuery: any
) {
  const quizPassedActions: UserAction[] = await getActionsWithPipeline([
    {
      $match: {
        user: volunteer._id,
        action: USER_ACTION.QUIZ.PASSED,
        createdAt: dateQuery,
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ])
  const sessions: Session[] = await SessionRepo.getSessionsWithPipeline([
    {
      $sort: {
        createdAt: 1,
      },
    },
    {
      $match: {
        volunteer: volunteer._id,
        createdAt: dateQuery,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'student',
        foreignField: '_id',
        as: 'student',
      },
    },
    {
      $unwind: '$student',
    },
    {
      $match: {
        'student.isFakeUser': false,
        'student.isTestUser': false,
      },
    },
    {
      $project: {
        _id: 1,
        createdAt: 1,
        endedAt: 1,
        subTopic: 1,
        timeTutored: 1,
        volunteerJoinedAt: 1,
      },
    },
  ])
  const availabilityForDateRange = await getHistoryForDatesByVolunteerId(
    volunteer._id,
    dateQuery.$gt,
    dateQuery.$lte
  )
  return {
    sessions,
    availabilityForDateRange,
    quizPassedActions,
  }
}

async function telecomProcessVolunteer<V extends VolunteerForTelecomReport>(
  volunteer: V,
  dateQuery: any
): Promise<TelecomRow[]> {
  const totalCerts = countCerts(volunteer.certifications)
  if (totalCerts === 0) return []
  const {
    sessions,
    availabilityForDateRange,
    quizPassedActions,
  } = await getVolunteerData(volunteer, dateQuery)
  // Accumulate hours into rows
  const rows = []

  const volunteerFirstName = capitalize(volunteer.firstname)
  const volunterLastName = capitalize(volunteer.lastname)
  const name = volunteerFirstName + ' ' + volunterLastName
  const email = volunteer.email
  const { totalTime: accumulatedHours } = telecomTutorTime(
    sessions,
    availabilityForDateRange,
    quizPassedActions
  )
  for (const date of Object.keys(accumulatedHours)) {
    const hours = accumulatedHours[date]
    rows.push({
      name,
      email,
      eventId,
      date,
      hours,
    })
  }
  return rows
}

export async function generateTelecomReport<
  V extends VolunteerForTelecomReport
>(volunteers: V[], dateQuery: any): Promise<TelecomRow[]> {
  const volunteerPartnerReport = []
  const errors = []
  for (const volunteer of volunteers) {
    try {
      const volunteerRows = await telecomProcessVolunteer(volunteer, dateQuery)
      volunteerPartnerReport.push(...volunteerRows)
    } catch (error) {
      errors.push(`volunteer ${volunteer._id}: ${error}`)
    }
  }
  if (errors.length) {
    throw Error(
      `Failed to generate custom partner report with\n ${errors.join('\n')}`
    )
  }
  logger.info('Telecom report generated')
  return volunteerPartnerReport
}

function sumHours(acc: any): number {
  let total = 0
  for (const day of Object.keys(acc)) {
    total += acc[day]
  }
  return total
}

export function emptyHours(): HourSummaryStats {
  return {
    totalVolunteerHours: 0,
    totalCoachingHours: 0,
    totalElapsedAvailability: 0,
    totalQuizzesPassed: 0,
  }
}

// To be used by email/update job(s) for generating telecom volunteer hours
export async function telecomHourSummaryStats<
  V extends VolunteerForHourSummary
>(volunteer: V, dateQuery: any): Promise<HourSummaryStats> {
  try {
    const totalCerts = countCerts(volunteer.certifications)
    if (totalCerts === 0) return emptyHours()

    const {
      sessions,
      availabilityForDateRange,
      quizPassedActions,
    } = await getVolunteerData(volunteer, dateQuery)
    const {
      totalTime,
      sessionTime,
      availabilityTime,
      certificationTime,
    } = telecomTutorTime(sessions, availabilityForDateRange, quizPassedActions)
    const row = {
      totalVolunteerHours: sumHours(totalTime),
      totalCoachingHours: sumHours(sessionTime),
      totalElapsedAvailability: sumHours(availabilityTime),
      totalQuizzesPassed: sumHours(certificationTime),
    } as HourSummaryStats
    return row
  } catch (error) {
    throw new Error(`Failed to generate hour summary stats: ${error}`)
  }
}

export function getSumOperatorForDateRange(
  startDate: Date,
  endDate: Date,
  fieldToCompareDateRange: DATE_RANGE_COMPARISON_FIELDS = DATE_RANGE_COMPARISON_FIELDS.CREATED_AT
) {
  return {
    $sum: {
      $cond: [
        {
          $and: [
            {
              $gte: [fieldToCompareDateRange, startDate],
            },
            {
              $lte: [fieldToCompareDateRange, endDate],
            },
          ],
        },
        1,
        0,
      ],
    },
  }
}

export function getSumOperatorForTimeTutoredDateRange(
  startDate: Date,
  endDate: Date,
  fieldToCompareDateRange: DATE_RANGE_COMPARISON_FIELDS = DATE_RANGE_COMPARISON_FIELDS.CREATED_AT
) {
  return {
    $sum: {
      $cond: [
        {
          $and: [
            {
              $gte: [fieldToCompareDateRange, startDate],
            },
            {
              $lte: [fieldToCompareDateRange, endDate],
            },
          ],
        },
        '$timeTutored',
        0,
      ],
    },
  }
}

interface GetOnboardingStatusOptions {
  isOnboarded: boolean
  isDeactivated: boolean
  lastActivityAt: Date
  availabilityLastModifiedAt: Date
  certifications: Certifications
}

function getOnboardingStatus({
  isOnboarded,
  isDeactivated,
  lastActivityAt,
  availabilityLastModifiedAt,
  certifications,
}: GetOnboardingStatusOptions): ONBOARDING_STATUS {
  if (isOnboarded) return ONBOARDING_STATUS.ONBOARDED
  if (isDeactivated) return ONBOARDING_STATUS.DEACTIVATED
  const ninetyDaysAgo = new Date().getTime() - 1000 * 60 * 60 * 24 * 90
  if (lastActivityAt && lastActivityAt.getTime() <= ninetyDaysAgo)
    return ONBOARDING_STATUS.INACTIVE
  if (availabilityLastModifiedAt || isCertified(certifications))
    return ONBOARDING_STATUS.IN_PROGRESS
  return ONBOARDING_STATUS.NOT_STARTED
}

function isDateWithin(date: string, startDate: Date, endDate: Date) {
  const formatDate = new Date(date).getTime()
  return formatDate >= startDate.getTime() && formatDate < endDate.getTime()
}

export interface GroupStats {
  _id: null
  total: number
  totalWithinDateRange: number
}

export interface PartnerVolunteerAnalytics {
  _id: Types.ObjectId
  firstName: string
  lastName: string
  email: string
  state: string
  isOnboarded: boolean
  createdAt: Date
  dateOnboarded: Date
  certifications: Certifications
  availabilityLastModifiedAt: Date
  sessionAnalytics: {
    uniqueStudentsHelped: [GroupStats]
    sessionStats: [GroupStats]
    uniquePartnerStudentsHelped: [GroupStats]
    sessionPartnerStats: [GroupStats]
    timeTutoredPartnerStats: [GroupStats]
  }
  textNotifications: GroupStats
  isDeactivated: boolean
  lastActivityAt: Date
  hourSummaryTotal: HourSummaryStats
  hourSummaryDateRange: HourSummaryStats
}

export interface AnalyticsReportRow {
  firstName: string
  lastName: string
  email: string
  state: string
  onboardingStatus: ONBOARDING_STATUS
  dateAccountCreated: string // Date.format('MM/DD/YYYY')
  certificationsReceived: number // int
  totalTextsReceived: number // int
  totalSessionsCompleted: number
  totalPartnerSessionsCompleted?: number
  totalUniqueStudentsHelped: number
  totalUniquePartnerStudentsHelped?: number
  totalTutoringHours: number // Number(number.toFixed(2))
  totalPartnerStudentsTutoringHours?: number
  totalTrainingHours: number
  totalElapsedAvailabilityHours: number
  totalVolunteerHours: number
  dateRangeTextsReceived: number
  dateRangeSessionsCompleted: number
  dateRangePartnerSessionsCompleted?: number
  dateRangeUniqueStudentsHelped: number
  dateRangeUniquePartnerStudentsHelped?: number
  dateRangeTutoringHours: number
  dateRangePartnerStudentsTutoringHours?: number
  dateRangeTrainingHours: number
  dateRangeElapsedAvailabilityHours: number
  dateRangeVolunteerHours: number
  dateOnboarded?: string // hack only used for summary
}

export function getAnalyticsReportRow(
  volunteer: PartnerVolunteerAnalytics
): AnalyticsReportRow {
  const { sessionAnalytics } = volunteer
  const {
    uniqueStudentsHelped,
    sessionStats,
    uniquePartnerStudentsHelped,
    sessionPartnerStats,
    timeTutoredPartnerStats,
  } = sessionAnalytics
  const [uniqueStudentsHelpedStats] = uniqueStudentsHelped
  const [uniquePartnerStudentsHelpedStats] = uniquePartnerStudentsHelped
  const [sessionGroupStats] = sessionStats
  const [sessionPartnerGroupStats] = sessionPartnerStats
  const [timeTutoredPartnerGroupStats] = timeTutoredPartnerStats
  const row = {} as AnalyticsReportRow

  // Volunteer profile
  row.firstName = volunteer.firstName
  row.lastName = volunteer.lastName
  row.email = volunteer.email
  row.state = volunteer.state

  // Volunteer status
  row.onboardingStatus = getOnboardingStatus({
    isOnboarded: volunteer.isOnboarded,
    availabilityLastModifiedAt: volunteer.availabilityLastModifiedAt,
    isDeactivated: volunteer.isDeactivated,
    lastActivityAt: volunteer.lastActivityAt,
    certifications: volunteer.certifications,
  })
  row.dateAccountCreated = moment(volunteer.createdAt).format(
    'MM/DD/YYYY HH:mm'
  )

  // Total certifications received
  const certificationAmounts = countCertsByType(volunteer.certifications)
  row.certificationsReceived = certificationAmounts.total

  // Volunteer impact - cumulative
  row.totalTextsReceived = volunteer.textNotifications
    ? volunteer.textNotifications.total
    : 0
  row.totalSessionsCompleted = sessionGroupStats ? sessionGroupStats.total : 0
  row.totalPartnerSessionsCompleted = sessionPartnerGroupStats
    ? sessionPartnerGroupStats.total
    : 0
  row.totalUniqueStudentsHelped = uniqueStudentsHelpedStats
    ? uniqueStudentsHelpedStats.total
    : 0
  row.totalUniquePartnerStudentsHelped = uniquePartnerStudentsHelpedStats
    ? uniquePartnerStudentsHelpedStats.total
    : 0
  row.totalTutoringHours = volunteer.hourSummaryTotal.totalCoachingHours
  row.totalPartnerStudentsTutoringHours = timeTutoredPartnerGroupStats
    ? Number(Number(timeTutoredPartnerGroupStats.total / 3600000).toFixed(2))
    : 0
  row.totalTrainingHours = volunteer.hourSummaryTotal.totalQuizzesPassed
  row.totalElapsedAvailabilityHours = Number(
    (volunteer.hourSummaryTotal.totalElapsedAvailability * 0.1).toFixed(1)
  )
  row.totalVolunteerHours = volunteer.hourSummaryTotal.totalVolunteerHours || 0

  // Volunteer impact within date range
  row.dateRangeTextsReceived = volunteer.textNotifications
    ? volunteer.textNotifications.totalWithinDateRange
    : 0
  row.dateRangeSessionsCompleted = sessionGroupStats
    ? sessionGroupStats.totalWithinDateRange
    : 0
  row.dateRangePartnerSessionsCompleted = sessionPartnerGroupStats
    ? sessionPartnerGroupStats.totalWithinDateRange
    : 0
  row.dateRangeUniqueStudentsHelped = uniqueStudentsHelpedStats
    ? uniqueStudentsHelpedStats.totalWithinDateRange
    : 0
  row.dateRangeUniquePartnerStudentsHelped = uniquePartnerStudentsHelpedStats
    ? uniquePartnerStudentsHelpedStats.totalWithinDateRange
    : 0
  row.dateRangeTutoringHours = volunteer.hourSummaryDateRange.totalCoachingHours
  row.dateRangePartnerStudentsTutoringHours = timeTutoredPartnerGroupStats
    ? Number(
        Number(
          timeTutoredPartnerGroupStats.totalWithinDateRange / 3600000
        ).toFixed(2)
      )
    : 0
  row.dateRangeTrainingHours = volunteer.hourSummaryDateRange.totalQuizzesPassed

  row.dateRangeElapsedAvailabilityHours = Number(
    (volunteer.hourSummaryDateRange.totalElapsedAvailability * 0.1).toFixed(1)
  )
  row.dateRangeVolunteerHours =
    volunteer.hourSummaryDateRange.totalVolunteerHours

  row.dateOnboarded = volunteer.dateOnboarded
    ? moment(volunteer.dateOnboarded).format('MM/DD/YYYY HH:mm')
    : ''

  return row
}

export async function getUniqueStudentStats(
  partnerOrg: string,
  startDate: Date,
  endDate: Date
) {
  return ((await getVolunteersWithPipeline([
    {
      $match: {
        volunteerPartnerOrg: partnerOrg,
      },
    },
    {
      $lookup: {
        from: 'sessions',
        foreignField: '_id',
        localField: 'pastSessions',
        as: 'pastSession',
      },
    },
    {
      $unwind: '$pastSession',
    },
    {
      $group: {
        _id: '$pastSession.student',
        frequency: { $sum: 1 },
        frequencyWithinDateRange: getSumOperatorForDateRange(
          startDate,
          endDate,
          DATE_RANGE_COMPARISON_FIELDS.PAST_SESSION_CREATED_AT
        ),
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        totalWithinDateRange: {
          $sum: {
            $cond: [{ $gte: ['$frequencyWithinDateRange', 1] }, 1, 0],
          },
        },
      },
    },
  ])) as unknown) as GroupStats[]
}

export async function getUniquePartnerStudentStats(
  partnerOrg: string,
  startDate: Date,
  endDate: Date
) {
  return ((await getVolunteersWithPipeline([
    {
      $match: {
        volunteerPartnerOrg: partnerOrg,
      },
    },
    {
      $lookup: {
        from: 'sessions',
        foreignField: '_id',
        localField: 'pastSessions',
        as: 'pastSession',
      },
    },
    {
      $unwind: '$pastSession',
    },
    {
      $lookup: {
        from: 'users',
        localField: 'pastSession.student',
        foreignField: '_id',
        as: 'student',
      },
    },
    {
      $unwind: '$student',
    },
    getPartnerStudentsFilter(partnerOrg),
    {
      $group: {
        _id: '$student._id',
        frequency: { $sum: 1 },
        frequencyWithinDateRange: getSumOperatorForDateRange(
          startDate,
          endDate,
          DATE_RANGE_COMPARISON_FIELDS.PAST_SESSION_CREATED_AT
        ),
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        totalWithinDateRange: {
          $sum: {
            $cond: [{ $gte: ['$frequencyWithinDateRange', 1] }, 1, 0],
          },
        },
      },
    },
  ])) as unknown) as GroupStats[]
}

export interface AnalyticsReportSummaryData {
  total: number
  totalWithinDateRange: number
}

export interface AnalyticsReportSummary {
  signUps: AnalyticsReportSummaryData
  volunteersOnboarded: AnalyticsReportSummaryData
  onboardingRate: AnalyticsReportSummaryData
  opportunities: AnalyticsReportSummaryData
  sessionsCompleted: AnalyticsReportSummaryData
  pickupRate: AnalyticsReportSummaryData
  volunteerHours: AnalyticsReportSummaryData
  uniqueStudentsHelped: AnalyticsReportSummaryData
  uniquePartnerStudentsHelped: AnalyticsReportSummaryData
}

function dividend(numerator: number, denominator: number): number {
  let quotient = numerator / denominator
  if (isNaN(quotient)) quotient = 0
  return quotient
}

export async function getAnalyticsReportSummary(
  partnerOrg: string,
  report: AnalyticsReportRow[],
  startDate: Date,
  endDate: Date
): Promise<AnalyticsReportSummary> {
  const defaultData = {
    total: 0,
    totalWithinDateRange: 0,
  }
  const summary = {
    signUps: { ...defaultData },
    volunteersOnboarded: { ...defaultData },
    onboardingRate: { ...defaultData },
    opportunities: { ...defaultData },
    sessionsCompleted: { ...defaultData },
    pickupRate: { ...defaultData },
    volunteerHours: { ...defaultData },
    uniqueStudentsHelped: { ...defaultData },
    uniquePartnerStudentsHelped: { ...defaultData },
  } as AnalyticsReportSummary

  for (const row of report) {
    summary.signUps.total++
    if (isDateWithin(row.dateAccountCreated, startDate, endDate))
      summary.signUps.totalWithinDateRange++
    if (
      row.onboardingStatus === ONBOARDING_STATUS.ONBOARDED &&
      row.dateOnboarded
    ) {
      summary.volunteersOnboarded.total++
      if (isDateWithin(row.dateOnboarded, startDate, endDate))
        summary.volunteersOnboarded.totalWithinDateRange++
    }

    summary.sessionsCompleted.total += row.totalSessionsCompleted
    summary.sessionsCompleted.totalWithinDateRange +=
      row.dateRangeSessionsCompleted
    summary.volunteerHours.total += row.totalVolunteerHours
    summary.volunteerHours.totalWithinDateRange += row.dateRangeVolunteerHours

    summary.opportunities.total += row.totalTextsReceived
    summary.opportunities.totalWithinDateRange += row.dateRangeTextsReceived

    // delete hack for date onboarded
    delete row.dateOnboarded
  }

  summary.onboardingRate.total = Number(
    (
      100 * dividend(summary.volunteersOnboarded.total, summary.signUps.total)
    ).toFixed(2)
  )
  summary.onboardingRate.totalWithinDateRange = Number(
    (
      100 *
      dividend(
        summary.volunteersOnboarded.totalWithinDateRange,
        summary.signUps.totalWithinDateRange
      )
    ).toFixed(2)
  )

  summary.pickupRate.total = Number(
    (
      100 *
      dividend(summary.sessionsCompleted.total, summary.opportunities.total)
    ).toFixed(2)
  )
  summary.pickupRate.totalWithinDateRange = Number(
    (
      100 *
      dividend(
        summary.sessionsCompleted.totalWithinDateRange,
        summary.opportunities.totalWithinDateRange
      )
    ).toFixed(2)
  )

  const [uniqueStudentStats] = await getUniqueStudentStats(
    partnerOrg,
    startDate,
    endDate
  )

  const [uniquePartnerStudentStats] = await getUniquePartnerStudentStats(
    partnerOrg,
    startDate,
    endDate
  )

  summary.uniqueStudentsHelped.total = uniqueStudentStats
    ? uniqueStudentStats.total
    : 0
  summary.uniqueStudentsHelped.totalWithinDateRange = uniqueStudentStats
    ? uniqueStudentStats.totalWithinDateRange
    : 0

  summary.uniquePartnerStudentsHelped.total = uniquePartnerStudentStats
    ? uniquePartnerStudentStats.total
    : 0
  summary.uniquePartnerStudentsHelped.totalWithinDateRange = uniquePartnerStudentStats
    ? uniquePartnerStudentStats.totalWithinDateRange
    : 0
  return summary
}

const analyticsReportDataHeaderMapping = {
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email',
  state: 'State of residence',
  onboardingStatus: 'Onboarding status',
  dateAccountCreated: 'Date of account creation',
  certificationsReceived: 'Certifications received',
  totalTextsReceived: 'Total texts received',
  totalSessionsCompleted: 'Total sessions completed',
  totalPartnerSessionsCompleted: 'Total sessions with partner students',
  totalUniqueStudentsHelped: 'Total unique students helped',
  totalUniquePartnerStudentsHelped: 'Total unique partner students helped',
  totalTutoringHours: 'Total tutoring hours',
  totalPartnerStudentsTutoringHours:
    'Total tutoring hours with partner students',
  totalTrainingHours: 'Total training hours',
  totalElapsedAvailabilityHours: 'Total elapsed availability hours',
  totalVolunteerHours: 'Total hours',
  dateRangeTextsReceived: 'Texts received within date range',
  dateRangeSessionsCompleted: 'Sessions completed within date range',
  dateRangePartnerSessionsCompleted:
    'Sessions completed with partner students within date range',
  dateRangeUniqueStudentsHelped: 'Unique students helped within date range',
  dateRangeUniquePartnerStudentsHelped:
    'Unique partner students helped within date range',
  dateRangeTutoringHours: 'Tutoring hours within date range',
  dateRangePartnerStudentsTutoringHours:
    'Tutoring hours with partner students within date range',
  dateRangeTrainingHours: 'Training hours within date range',
  dateRangeElapsedAvailabilityHours:
    'Elapsed availability hours within date range',
  dateRangeVolunteerHours: 'Total hours within date range',
}

const analyticsReportSummaryHeaderMapping = {
  signUps: 'Volunteers signed up',
  volunteersOnboarded: 'Volunteers onboarded',
  onboardingRate: 'Onboarding rate',
  opportunities: 'Tutoring opportunities provided',
  sessionsCompleted: 'Sessions completed',
  pickupRate: 'Pick-up rate',
  volunteerHours: 'Volunteer hours completed',
  uniqueStudentsHelped: 'Unique students helped',
  uniquePartnerStudentsHelped: 'Unique partner students helped',
}

export function applyAnalyticsReportDataStyles(worksheet: exceljs.Worksheet) {
  /**
   * @note: When applying styles to a cell, column, or row, previous styles applied may be overridden,
   *        so there may need to be styling that is defined again to preserve the styles.
   *
   * @note: Using `.style` on a `getColumn()` or `getRow()` does not apply the set styles,
   *        we must access using the direct property like `.border` or `.fill`.
   *
   */
  const rowWithFormattedColumnHeaders = worksheet.getRow(2)
  rowWithFormattedColumnHeaders.height = 80
  rowWithFormattedColumnHeaders.alignment = {
    wrapText: true,
  }
  rowWithFormattedColumnHeaders.border = {
    bottom: { style: 'thin' },
  }

  const overridenCellStyle: Partial<exceljs.Style> = {
    border: {
      bottom: { style: 'thin' },
    },
    alignment: { wrapText: true },
  }

  // Update styling on cells that were overriden due to specific column styles being applied
  worksheet.getCell('G2').style = overridenCellStyle
  worksheet.getCell('J2').style = overridenCellStyle
  worksheet.getCell('N2').style = overridenCellStyle
  worksheet.getCell('Q2').style = overridenCellStyle
  worksheet.getCell('U2').style = overridenCellStyle
}

export function applyAnalyticsReportSummaryStyles(
  worksheet: exceljs.Worksheet
) {
  worksheet.getColumn('A').alignment = {
    wrapText: true,
  }
  const rightAlignText = {
    alignment: {
      horizontal: 'right',
    },
  } as Partial<exceljs.Style>
  worksheet.getCell('B4').style = rightAlignText
  worksheet.getCell('C4').style = rightAlignText
  worksheet.getCell('B7').style = rightAlignText
  worksheet.getCell('C7').style = rightAlignText
}

export function processAnalyticsReportDataSheet(
  data: AnalyticsReportRow[],
  worksheet: exceljs.Worksheet,
  startDate: string,
  endDate: string,
  partnerOrg: string
) {
  const columnsWithHeaderKeys = []
  const formattedColumnHeaders = []
  const isCustomAnalyticsReport = config.customAnalyticsReportPartnerOrgs.includes(
    partnerOrg
  )
  for (const [key, value] of Object.entries(analyticsReportDataHeaderMapping)) {
    if (
      !isCustomAnalyticsReport &&
      (value ===
        analyticsReportDataHeaderMapping.totalUniquePartnerStudentsHelped ||
        value ===
          analyticsReportDataHeaderMapping.dateRangeUniquePartnerStudentsHelped ||
        value ===
          analyticsReportDataHeaderMapping.totalPartnerSessionsCompleted ||
        value ===
          analyticsReportDataHeaderMapping.dateRangePartnerSessionsCompleted ||
        value ===
          analyticsReportDataHeaderMapping.totalPartnerStudentsTutoringHours ||
        value ===
          analyticsReportDataHeaderMapping.dateRangePartnerStudentsTutoringHours)
    )
      continue

    const col = {
      key,
      width: 15,
    } as exceljs.Column

    columnsWithHeaderKeys.push(col)
    formattedColumnHeaders.push(value)
  }
  worksheet.columns = columnsWithHeaderKeys
  // Add the headers to the second row
  worksheet.getRow(2).values = formattedColumnHeaders

  for (let i = 0; i < data.length; i += 1) {
    worksheet.addRow(data[i], 'i')
  }

  const sectionalHeaders = {
    volunteerInformation: 'Volunteer Information',
    totalImpact: 'Cumulative Impact',
    totalVolunteerHours: 'Cumulative Volunteer Hours',
    dateRangeImpact: `Impact from ${startDate} - ${endDate}`,
    dateRangeHours: `Hours between ${startDate} - ${endDate}`,
  }

  if (isCustomAnalyticsReport) {
    const partnerName = volunteerPartnerManifests[partnerOrg].name
    // Create sectional headers in the first row for att/verizon reports
    worksheet.getCell('A1').value = sectionalHeaders.volunteerInformation
    worksheet.getCell('H1').value = sectionalHeaders.totalImpact
    worksheet.getCell('M1').value = sectionalHeaders.totalVolunteerHours
    worksheet.getCell('R1').value = sectionalHeaders.dateRangeImpact
    worksheet.getCell('W1').value = sectionalHeaders.dateRangeHours
    worksheet.getCell(
      'J2'
    ).value = `Total sessions with ${partnerName} students`
    worksheet.getCell(
      'L2'
    ).value = `Total unique ${partnerName} students helped`
    worksheet.getCell(
      'N2'
    ).value = `Total tutoring hours with ${partnerName} students`
    worksheet.getCell(
      'T2'
    ).value = `Sessions completed with ${partnerName} students within date range`
    worksheet.getCell(
      'V2'
    ).value = `Unique ${partnerName} students impacted within date range`
    worksheet.getCell(
      'X2'
    ).value = `Tutoring hours with ${partnerName} students within date range`
    worksheet.mergeCells('A1:G1')
    worksheet.mergeCells('H1:L1')
    worksheet.mergeCells('M1:Q1')
    worksheet.mergeCells('R1:V1')
    worksheet.mergeCells('W1:AA1')
  } else {
    // Create sectional headers in the first row for other partner eports
    worksheet.getCell('A1').value = sectionalHeaders.volunteerInformation
    worksheet.getCell('H1').value = sectionalHeaders.totalImpact
    worksheet.getCell('K1').value = sectionalHeaders.totalVolunteerHours
    worksheet.getCell('O1').value = sectionalHeaders.dateRangeImpact
    worksheet.getCell('R1').value = sectionalHeaders.dateRangeHours
    worksheet.mergeCells('A1:G1')
    worksheet.mergeCells('H1:J1')
    worksheet.mergeCells('K1:N1')
    worksheet.mergeCells('O1:Q1')
    worksheet.mergeCells('R1:U1')
  }

  applyAnalyticsReportDataStyles(worksheet)
}

export function processAnalyticsReportSummarySheet(
  summary: AnalyticsReportSummary,
  worksheet: exceljs.Worksheet,
  startDate: string,
  endDate: string,
  partnerOrg: string
) {
  const summaryColumnMapping = {
    description: '',
    total: 'Cumulative',
    totalWithinDateRange: `${startDate} - ${endDate}`,
  }

  const summaryCols = []
  for (const [columnKey, columnHeader] of Object.entries(
    summaryColumnMapping
  )) {
    const col = {
      header: columnHeader,
      key: columnKey,
      width: 25,
    } as exceljs.Column
    summaryCols.push(col)
  }
  worksheet.columns = summaryCols

  for (const [key, data] of Object.entries(summary) as [
    keyof typeof analyticsReportSummaryHeaderMapping,
    AnalyticsReportSummaryData
  ][]) {
    let description =
      analyticsReportSummaryHeaderMapping[
        key as keyof typeof analyticsReportSummaryHeaderMapping
      ]
    let total: number | string
    let totalWithinDateRange: number | string
    if (key === 'onboardingRate' || key === 'pickupRate') {
      total = `${data.total}%`
      totalWithinDateRange = `${data.totalWithinDateRange}%`
    } else {
      total = data.total
      totalWithinDateRange = data.totalWithinDateRange
    }

    // do not add unique partner students helped row to non-att/verizon reports
    if (
      !config.customAnalyticsReportPartnerOrgs.includes(partnerOrg) &&
      key === 'uniquePartnerStudentsHelped'
    )
      continue
    else if (key === 'uniquePartnerStudentsHelped') {
      const partnerName = volunteerPartnerManifests[partnerOrg].name
      description = `Unique ${partnerName} students helped`
    }
    worksheet.addRow({ description, total, totalWithinDateRange }, 'i')
  }
  worksheet.properties.defaultRowHeight = 30
  applyAnalyticsReportSummaryStyles(worksheet)
}

export interface VolunteerReportQuery {
  partnerOrg: string
  startDate: string
  endDate: string
}

export const asValidateVolunteerReportQuery = asFactory<VolunteerReportQuery>({
  partnerOrg: asString,
  startDate: asString,
  endDate: asString,
})

export function validateVolunteerReportQuery(data: unknown) {
  const { partnerOrg, startDate, endDate } = asValidateVolunteerReportQuery(
    data
  )
  // Volunteer partner org check
  const volunteerPartnerManifest = volunteerPartnerManifests[partnerOrg]
  if (!volunteerPartnerManifest)
    throw new InputError('Invalid volunteer partner organization')
  if (!moment(startDate, 'MM-DD-YYYY', true).isValid())
    throw new InputError('Start date does not follow a MM-DD-YYYY format')
  if (!moment(endDate, 'MM-DD-YYYY', true).isValid())
    throw new InputError('End date does not follow a MM-DD-YYYY format')

  return { partnerOrg, startDate, endDate }
}

export interface SessionDateRanges {
  sessionRangeFrom: string
  sessionRangeTo: string
}

export interface JoinedDateRanges {
  joinedBefore: string
  joinedAfter: string
}

export interface StudentReportQuery extends SessionDateRanges {
  highSchoolId?: string
  studentPartnerOrg?: string
  studentPartnerSite?: string
  sponsorOrg?: string
}

export interface StudentUsageReportQuery
  extends StudentReportQuery,
    JoinedDateRanges {}

const studentReportValidators = {
  sessionRangeFrom: asString,
  sessionRangeTo: asString,
  highSchoolId: asOptional(asString),
  studentPartnerOrg: asOptional(asString),
  studentPartnerSite: asOptional(asString),
  sponsorOrg: asOptional(asString),
}

export const asValidateStudentSessionReportQuery = asFactory<
  StudentReportQuery
>({
  ...studentReportValidators,
})

export const asValidateStudentUsageReportQuery = asFactory<
  StudentUsageReportQuery
>({
  joinedBefore: asString,
  joinedAfter: asString,
  ...studentReportValidators,
})

function isValidReportDateFormat(dateString: string) {
  const isStrictMode = true
  return moment(dateString, 'MM-DD-YYYY', isStrictMode).isValid()
}

export function validateSessionDateRanges({
  sessionRangeFrom,
  sessionRangeTo,
}: SessionDateRanges) {
  if (!isValidReportDateFormat(sessionRangeFrom))
    throw new InputError(
      '"Session from" date does not follow a MM-DD-YYYY format'
    )
  if (!isValidReportDateFormat(sessionRangeTo))
    throw new InputError(
      '"Session to" date does not follow a MM-DD-YYYY format'
    )
}

export function validateJoinedDateRanges({
  joinedAfter,
  joinedBefore,
}: JoinedDateRanges) {
  if (!isValidReportDateFormat(joinedAfter))
    throw new InputError(
      '"Joined after" date does not follow a MM-DD-YYYY format'
    )
  if (!isValidReportDateFormat(joinedBefore))
    throw new InputError(
      '"Joined before" date does not follow a MM-DD-YYYY format'
    )
}

export function validateStudentReportQuery(data: StudentReportQuery) {
  if (data.studentPartnerOrg) {
    const studentPartner = studentPartnerManifests[data.studentPartnerOrg]
    if (!studentPartner)
      throw new InputError('Invalid student partner organization')
    else if (
      (data.studentPartnerSite && !studentPartner.hasOwnProperty('sites')) ||
      (data.studentPartnerSite &&
        studentPartner.sites &&
        !studentPartner.sites.includes(data.studentPartnerSite))
    )
      throw new InputError(
        `Invalid student partner site for ${data.studentPartnerOrg}`
      )
  }
  if (data.highSchoolId && !Types.ObjectId.isValid(data.highSchoolId))
    throw new InputError('Invalid high school id')
  validateSessionDateRanges(data)
}

export function validateStudentSessionReportQuery(data: unknown) {
  const validatedData = asValidateStudentSessionReportQuery(data)
  validateStudentReportQuery(validatedData)
  return validatedData
}

export function validateStudentUsageReportQuery(data: unknown) {
  const validatedData = asValidateStudentUsageReportQuery(data)
  validateStudentReportQuery(validatedData)
  validateJoinedDateRanges(validatedData)
  return validatedData
}

interface AssociatedPartnersAndSchools {
  associatedStudentPartnerOrgs: string[]
  associatedPartnerSchools: Types.ObjectId[]
}

export function getAssociatedPartnersAndSchools(
  partnerOrg: string
): AssociatedPartnersAndSchools {
  const associatedStudentPartnerOrgs: string[] = []
  const associatedPartnerSchools: Types.ObjectId[] = []
  const associatedPartner = getAssociatedPartnerOrgByKey(
    'volunteerPartnerOrg',
    partnerOrg
  )

  if (associatedPartner?.studentPartnerOrg)
    associatedStudentPartnerOrgs.push(associatedPartner.studentPartnerOrg)
  else if (associatedPartner?.studentSponsorOrg) {
    const sponsorOrg = sponsorOrgManifests[associatedPartner.studentSponsorOrg]
    if (sponsorOrg.schools) associatedPartnerSchools.push(...sponsorOrg.schools)
    if (sponsorOrg.partnerOrgs)
      associatedStudentPartnerOrgs.push(...sponsorOrg.partnerOrgs)
  }
  return { associatedStudentPartnerOrgs, associatedPartnerSchools }
}

export function getPartnerStudentsFilter(partnerOrg: string) {
  const {
    associatedStudentPartnerOrgs,
    associatedPartnerSchools,
  } = getAssociatedPartnersAndSchools(partnerOrg)

  return {
    $match: {
      $expr: {
        $or: [
          {
            $in: ['$student.studentPartnerOrg', associatedStudentPartnerOrgs],
          },
          {
            $in: ['$student.approvedHighschool', associatedPartnerSchools],
          },
        ],
      },
    },
  }
}
