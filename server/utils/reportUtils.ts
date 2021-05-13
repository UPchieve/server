import moment from 'moment-timezone'
import { Types } from 'mongoose'
import { capitalize } from 'lodash'
import {
  USER_ACTION,
  HOUR_TO_UTC_MAPPING,
  ONBOARDING_STATUS
} from '../constants'
import * as UserActionService from '../services/UserActionService'
import SessionService from '../services/SessionService'
import * as AvailabilityService from '../services/AvailabilityService'
import logger from '../logger'
import { isCertified } from '../controllers/UserCtrl'
import { Certifications } from '../models/Volunteer'
import {
  getVolunteersWithPipeline,
  HourSummaryStats
} from '../services/VolunteerService'
import countCerts from './count-certs'
import roundUpToNearestInterval from './round-up-to-nearest-interval'
import { countCertsByType } from './count-certs-by-type'

interface Stamp {
  day: string
  hour: string
}

function formatStamp(time: moment): Stamp {
  return { day: time.format('MM-DD-YYYY'), hour: time.format('H') }
}

function addToAcc(acc, time: moment, minutes: number): void {
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

function readFromAcc(acc, time: moment): number {
  const { day, hour } = formatStamp(time)
  if (day in acc) {
    const sub = acc[day]
    if (hour in sub) {
      return sub[hour]
    }
  }
  return 0
}

function telecomTutorTime(
  sessions,
  availabilityForDateRange,
  quizPassedActions
) {
  const acc = {} // accumulator { MM-DD-YYYY: {H: time volunteered in minutes } }

  // TODO: double loop on sessions is ugly and inefficient
  // check if tutoring occured on a day
  for (const session of sessions) {
    const startedAt = moment(session.volunteerJoinedAt).tz('America/New_York')
    acc[startedAt.format('MM-DD-YYYY')] = {}
  }
  // Add time spent on call per availability hour
  for (const availabilityHistory of availabilityForDateRange) {
    const availability = availabilityHistory.availability
    for (const hourA of Object.keys(availability)) {
      if (availability[hourA]) {
        const temp = moment(availabilityHistory.date)
        const { day, hour } = formatStamp(temp.hour(HOUR_TO_UTC_MAPPING[hourA]))
        // If day is not aleady accounted for do not add since no tutoring happened
        if (day in acc) {
          acc[day][hour] = 60
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
      counter = nextHour
    }
    // Add extra time to account for rounding duration up to nearest 15
    contribution = roundUpToNearestInterval(contribution, 15)
    addToAcc(acc, startedAt, contribution)
  }
  // Add time spent on certifications
  for (const quizPassed of quizPassedActions) {
    const createdAt = moment(quizPassed.createdAt).tz('America/New_York')
    // No need to check for tutoring/availability overlap according to spec
    addToAcc(acc, createdAt, 60)
  }
  // Reduce accumulator to single day totals
  const final = {}
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

const eventId = 4003

interface TelecomRow {
  mame: string
  email: string
  eventId: number
  date: string
  hours: number
}

async function telecomProcessVolunteer(
  volunteer,
  dateQuery
): Promise<TelecomRow[]> {
  const totalCerts = countCerts(volunteer.certifications)
  if (totalCerts === 0) return []

  // @todo: figure out how the type annotation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quizPassedActions: any = await UserActionService.getActionsWithPipeline(
    [
      {
        $match: {
          user: Types.ObjectId(volunteer._id),
          action: USER_ACTION.QUIZ.PASSED,
          createdAt: dateQuery
        }
      },
      {
        $sort: {
          createdAt: 1
        }
      }
    ]
  )
  const sessions = await SessionService.getSessionsWithPipeline([
    {
      $sort: {
        createdAt: 1
      }
    },
    {
      $match: {
        volunteer: Types.ObjectId(volunteer._id),
        createdAt: dateQuery
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'student',
        foreignField: '_id',
        as: 'student'
      }
    },
    {
      $unwind: '$student'
    },
    {
      $match: {
        'student.isFakeUser': false,
        'student.isTestUser': false
      }
    },
    {
      $project: {
        _id: 1,
        createdAt: 1,
        endedAt: 1,
        subTopic: 1,
        timeTutored: 1,
        volunteerJoinedAt: 1
      }
    }
  ])
  // @todo: figure out how to properly type and cast
  const availabilityForDateRange: any = await AvailabilityService.getAvailabilityHistoryWithPipeline(
    [
      {
        $match: {
          volunteerId: volunteer._id,
          date: dateQuery
        }
      },
      {
        $sort: {
          date: 1
        }
      }
    ]
  )
  // Accumulate hours into rows
  const rows = []

  const volunteerFirstName = capitalize(volunteer.firstname)
  const volunterLastName = capitalize(volunteer.lastname)
  const name = volunteerFirstName + ' ' + volunterLastName
  const email = volunteer.email
  const accumulatedHours = telecomTutorTime(
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
      hours
    })
  }
  return rows
}

export const generateTelecomReport = async (volunteers, dateQuery) => {
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

export function getSumOperatorForDateRanges(startDate: Date, endDate: Date) {
  return {
    $sum: {
      $cond: [
        {
          $and: [
            {
              $gte: ['$createdAt', startDate]
            },
            {
              $lte: ['$createdAt', endDate]
            }
          ]
        },
        1,
        0
      ]
    }
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
  certifications
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

function isDateWithin(date, startDate, endDate) {
  const formatDate = new Date(date).getTime()
  return formatDate >= startDate.getTime() && formatDate < endDate.getTime()
}

export interface GroupStats {
  _id: null
  total: number
  totalWithinDateRange: number
}

interface SessionStats extends GroupStats {
  firstSessionDate: Date
}

export interface PartnerVolunteerAnalytics {
  _id: Types.ObjectId | string
  firstName: string
  lastName: string
  email: string
  state: string
  isOnboarded: boolean
  createdAt: Date
  dateOnboarded: Date
  firstSessionDate: Date
  certifications: Certifications
  availabilityLastModifiedAt: Date
  sessionAnalytics: {
    uniqueStudentsHelped: [GroupStats]
    sessionStats: [SessionStats]
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
  dateAccountCreated: string
  dateOnboarded: string
  dateFirstSession: string
  certificationsReceived: number
  mathCertsReceived: number
  scienceCertsReceived: number
  collegeCertsReceived: number
  totalTextsReceived: number
  totalSessionsCompleted: number
  totalUniqueStudentsHelped: number
  totalTutoringHours: number
  totalTrainingHours: number
  totalElapsedAvailabilityHours: number
  totalVolunteerHours: number
  dateRangeTextsReceived: number
  dateRangeSessionsCompleted: number
  dateRangeUniqueStudentsHelped: number
  dateRangeTutoringHours: number
  dateRangeTrainingHours: number
  dateRangeElapsedAvailabilityHours: number
  dateRangeVolunteerHours: number
}

export function getAnalyticsReportRow(
  volunteer: PartnerVolunteerAnalytics
): AnalyticsReportRow {
  const { sessionAnalytics } = volunteer
  const { uniqueStudentsHelped, sessionStats } = sessionAnalytics
  const [uniqueStudentsHelpedStats] = uniqueStudentsHelped
  const [sessionGroupStats] = sessionStats
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
    certifications: volunteer.certifications
  })
  row.dateAccountCreated = moment(volunteer.createdAt).format(
    'MM/DD/YYYY HH:mm'
  )
  row.dateOnboarded = volunteer.dateOnboarded
    ? moment(volunteer.dateOnboarded).format('MM/DD/YYYY HH:mm')
    : ''
  row.dateFirstSession = sessionGroupStats
    ? moment(sessionGroupStats.firstSessionDate).format('MM/DD/YYYY HH:mm')
    : ''

  // Total certifications received
  const certificationAmounts = countCertsByType(volunteer.certifications)
  row.certificationsReceived = certificationAmounts.total
  row.mathCertsReceived = certificationAmounts.math
  row.scienceCertsReceived = certificationAmounts.science
  row.collegeCertsReceived = certificationAmounts.college

  // Volunteer impact - cumulative
  row.totalTextsReceived = volunteer.textNotifications
    ? volunteer.textNotifications.total
    : 0
  row.totalSessionsCompleted = sessionGroupStats ? sessionGroupStats.total : 0
  row.totalUniqueStudentsHelped = uniqueStudentsHelpedStats
    ? uniqueStudentsHelpedStats.total
    : 0
  row.totalTutoringHours = volunteer.hourSummaryTotal.totalCoachingHours
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
  row.dateRangeUniqueStudentsHelped = uniqueStudentsHelpedStats
    ? uniqueStudentsHelpedStats.totalWithinDateRange
    : 0
  row.dateRangeTutoringHours = volunteer.hourSummaryDateRange.totalCoachingHours
  row.dateRangeTrainingHours = volunteer.hourSummaryDateRange.totalQuizzesPassed

  row.dateRangeElapsedAvailabilityHours = Number(
    (volunteer.hourSummaryDateRange.totalElapsedAvailability * 0.1).toFixed(1)
  )
  row.dateRangeVolunteerHours =
    volunteer.hourSummaryDateRange.totalVolunteerHours

  return row
}

interface AnalyticsReportSummary {
  dateRangeSignUps: number
  dateRangeVolunteersOnboarded: number
  dateRangeTextsReceived: number
  dateRangeSessionsCompleted: number
  dateRangeVolunteerHours: number
  dateRangeUniqueStudentsHelped: number
  totalSignUps: number
  totalVolunteersOnboarded: number
  totalTextsReceived: number
  totalSessionsCompleted: number
  totalVolunteerHours: number
  totalUniqueStudentsHelped: number
}

export function getAccumulatedSummaryAnalytics(
  report: AnalyticsReportRow[],
  startDate,
  endDate
): AnalyticsReportSummary {
  const summary = {
    dateRangeSignUps: 0,
    dateRangeVolunteersOnboarded: 0,
    dateRangeTextsReceived: 0,
    dateRangeSessionsCompleted: 0,
    dateRangeVolunteerHours: 0,
    dateRangeUniqueStudentsHelped: 0,
    totalSignUps: 0,
    totalVolunteersOnboarded: 0,
    totalTextsReceived: 0,
    totalSessionsCompleted: 0,
    totalVolunteerHours: 0,
    totalUniqueStudentsHelped: 0
  }

  for (const row of report) {
    summary.totalSignUps++
    if (isDateWithin(row.dateAccountCreated, startDate, endDate))
      summary.dateRangeSignUps++
    if (row.onboardingStatus === ONBOARDING_STATUS.ONBOARDED) {
      summary.totalVolunteersOnboarded++
      if (isDateWithin(row.dateOnboarded, startDate, endDate))
        summary.dateRangeVolunteersOnboarded++
    }
    summary.totalTextsReceived += row.totalTextsReceived
    summary.dateRangeTextsReceived += row.dateRangeTextsReceived
    summary.totalSessionsCompleted += row.totalSessionsCompleted
    summary.dateRangeSessionsCompleted += row.dateRangeSessionsCompleted
    summary.totalVolunteerHours += row.totalVolunteerHours
    summary.dateRangeVolunteerHours += row.dateRangeVolunteerHours
  }

  return summary
}

export function getUniqueStudentStats(partnerOrg, startDate, endDatae) {
  return (getVolunteersWithPipeline([
    {
      $match: {
        volunteerPartnerOrg: partnerOrg
      }
    },
    {
      $lookup: {
        from: 'sessions',
        foreignField: '_id',
        localField: 'pastSessions',
        as: 'pastSession'
      }
    },
    {
      $unwind: '$pastSession'
    },
    {
      $group: {
        _id: '$pastSession.student',
        frequency: { $sum: 1 },
        frequencyWitinDateRange: getSumOperatorForDateRanges(
          startDate,
          endDatae
        )
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        totalWithinDateRange: {
          $sum: {
            $cond: [{ $gte: ['$frequencyWitinDateRange', 1] }, 1, 0]
          }
        }
      }
    }
  ]) as unknown) as GroupStats[]
}

export async function getAnalyticsReportSummary(
  rows: AnalyticsReportRow[],
  partnerOrg: string,
  startDate: Date,
  endDate: Date
) {
  const [uniqueStudentStats] = await getUniqueStudentStats(
    partnerOrg,
    startDate,
    endDate
  )

  const summary = getAccumulatedSummaryAnalytics(rows, startDate, endDate)
  summary.dateRangeUniqueStudentsHelped = uniqueStudentStats
    ? uniqueStudentStats.totalWithinDateRange
    : 0
  summary.totalUniqueStudentsHelped = uniqueStudentStats
    ? uniqueStudentStats.total
    : 0

  return [summary]
}
