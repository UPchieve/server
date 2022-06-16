import moment from 'moment'
import 'moment-timezone'
import { capitalize } from 'lodash'
import exceljs from 'exceljs'
import {
  HOUR_TO_UTC_MAPPING,
  ONBOARDING_STATUS,
  DAYS,
  HOURS,
} from '../constants'
import * as UserActionRepo from '../models/UserAction/queries'
import * as SessionRepo from '../models/Session/queries'
import logger from '../logger'
import { VolunteersForAnalyticsReport } from '../models/Volunteer'
import {
  VolunteerForTotalHours,
  VolunteerForTelecomReport,
} from '../models/Volunteer/queries'
import * as VolunteerRepo from '../models/Volunteer/queries'
import { HourSummaryStats } from '../services/VolunteerService'
import { InputError } from '../models/Errors'
import countCerts from './count-certs'
import roundUpToNearestInterval from './round-up-to-nearest-interval'
import { asFactory, asOptional, asString } from './type-utils'
import config from '../config'
import { QuizzesPassedForDateRange } from '../models/UserAction/types'
import { AvailabilityHistory } from '../models/Availability/types'
import { getElapsedAvailabilityForTelecomReport } from '../services/AvailabilityService'

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
  sessions: SessionRepo.SessionsForVolunteerHourSummary[],
  availabilityForDateRange: AvailabilityHistory[],
  quizPassedActions: QuizzesPassedForDateRange[]
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
    const day = DAYS[moment(availabilityHistory.recordedAt).day()]
    if (availability[day]) {
      for (const hourA of Object.keys(availability[day]) as HOURS[]) {
        if (availability[day][hourA]) {
          const temp = moment(availabilityHistory.recordedAt)
          const { day, hour } = formatStamp(
            temp.hour(HOUR_TO_UTC_MAPPING[hourA])
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

async function getVolunteerData<V extends VolunteerForTotalHours>(
  volunteer: V,
  start: Date,
  end: Date
) {
  const quizPassedActions = await UserActionRepo.getQuizzesPassedForDateRangeForTelecomReportByVolunteerId(
    volunteer.id,
    start,
    end
  )
  const sessions = await SessionRepo.getSessionsForVolunteerHourSummary(
    volunteer.id,
    start,
    end
  )
  const availabilityForDateRange = await getElapsedAvailabilityForTelecomReport(
    volunteer.id,
    start,
    end
  )
  return {
    sessions,
    availabilityForDateRange,
    quizPassedActions,
  }
}

async function telecomProcessVolunteer<V extends VolunteerForTelecomReport>(
  volunteer: V,
  start: Date,
  end: Date
): Promise<TelecomRow[]> {
  const totalCerts = countCerts(volunteer.quizzes)
  if (totalCerts === 0) return []
  const {
    sessions,
    availabilityForDateRange,
    quizPassedActions,
  } = await getVolunteerData(volunteer, start, end)
  // Accumulate hours into rows
  const rows = []

  const volunteerFirstName = capitalize(volunteer.firstName)
  const volunterLastName = capitalize(volunteer.lastName)
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
>(volunteers: V[], start: Date, end: Date): Promise<TelecomRow[]> {
  const volunteerPartnerReport = []
  const errors = []
  for (const volunteer of volunteers) {
    try {
      const volunteerRows = await telecomProcessVolunteer(volunteer, start, end)
      volunteerPartnerReport.push(...volunteerRows)
    } catch (error) {
      errors.push(`volunteer ${volunteer.id}: ${error}`)
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
export async function telecomHourSummaryStats<V extends VolunteerForTotalHours>(
  volunteer: V,
  start: Date,
  end: Date
): Promise<HourSummaryStats> {
  try {
    const totalCerts = countCerts(volunteer.quizzes)
    if (totalCerts === 0) return emptyHours()

    const {
      sessions,
      availabilityForDateRange,
      quizPassedActions,
    } = await getVolunteerData(volunteer, start, end)
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

interface GetOnboardingStatusOptions {
  isOnboarded: boolean
  availabilityLastModifiedAt?: Date
  totalQuizzesPassed: number
}

function getOnboardingStatus({
  isOnboarded,
  availabilityLastModifiedAt,
  totalQuizzesPassed,
}: GetOnboardingStatusOptions): ONBOARDING_STATUS {
  if (isOnboarded) return ONBOARDING_STATUS.ONBOARDED
  if (availabilityLastModifiedAt || totalQuizzesPassed > 0)
    return ONBOARDING_STATUS.IN_PROGRESS
  return ONBOARDING_STATUS.NOT_STARTED
}

type GetDateOnboardedOptions = Pick<
  PartnerVolunteerAnalytics,
  'createdAt' | 'isOnboarded' | 'dateOnboarded'
>

function getDateOnboarded({
  createdAt,
  isOnboarded,
  dateOnboarded,
}: GetDateOnboardedOptions): string {
  // Earliest record of having an ONBOARDED user action row
  const defaultLegacyVolunteerOnboardedDate = '2020-07-28 12:44:47.648+00'
  const isLegacyVolunteerOnboarded =
    new Date(createdAt) <= new Date(defaultLegacyVolunteerOnboardedDate) &&
    isOnboarded

  if (dateOnboarded) return moment(dateOnboarded).format('MM/DD/YYYY HH:mm')
  else if (isLegacyVolunteerOnboarded)
    return moment(defaultLegacyVolunteerOnboardedDate).format(
      'MM/DD/YYYY HH:mm'
    )
  else return ''
}

function isDateWithin(date: string, startDate: Date, endDate: Date) {
  const formatDate = new Date(date).getTime()
  return formatDate >= startDate.getTime() && formatDate < endDate.getTime()
}

export interface GroupStats {
  total: number
  totalWithinDateRange: number
}

export type PartnerVolunteerAnalytics = {
  hourSummaryTotal: HourSummaryStats
  hourSummaryDateRange: HourSummaryStats
} & VolunteersForAnalyticsReport

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
  partnerOrg: string
}

export function getAnalyticsReportRow(
  volunteer: PartnerVolunteerAnalytics
): AnalyticsReportRow {
  const row = {} as AnalyticsReportRow

  // Volunteer profile
  row.firstName = volunteer.firstName
  row.lastName = volunteer.lastName
  row.email = volunteer.email
  row.state = volunteer.state ? volunteer.state : ''

  // Volunteer status
  row.onboardingStatus = getOnboardingStatus({
    isOnboarded: volunteer.isOnboarded,
    availabilityLastModifiedAt: volunteer.availabilityLastModifiedAt,
    totalQuizzesPassed: volunteer.totalQuizzesPassed,
  })
  row.dateAccountCreated = moment(volunteer.createdAt).format(
    'MM/DD/YYYY HH:mm'
  )

  // Total certifications received
  row.certificationsReceived = volunteer.totalQuizzesPassed

  // Volunteer impact - cumulative
  row.totalTextsReceived = volunteer.totalNotifications
  row.totalSessionsCompleted = volunteer.totalSessions
  row.totalPartnerSessionsCompleted = volunteer.totalPartnerSessions
  row.totalUniqueStudentsHelped = volunteer.totalUniqueStudentsHelped
  row.totalUniquePartnerStudentsHelped =
    volunteer.totalUniquePartnerStudentsHelped
  row.totalTutoringHours = volunteer.hourSummaryTotal.totalCoachingHours
  row.totalPartnerStudentsTutoringHours = Number(
    (volunteer.totalPartnerTimeTutored / 3600000).toFixed(2)
  )
  row.totalTrainingHours = volunteer.hourSummaryTotal.totalQuizzesPassed
  row.totalElapsedAvailabilityHours = Number(
    (volunteer.hourSummaryTotal.totalElapsedAvailability * 0.1).toFixed(1)
  )
  row.totalVolunteerHours = volunteer.hourSummaryTotal.totalVolunteerHours || 0

  // Volunteer impact within date range
  row.dateRangeTextsReceived = volunteer.totalNotificationsWithinRange
  row.dateRangeSessionsCompleted = volunteer.totalSessionsWithinRange
  row.dateRangePartnerSessionsCompleted =
    volunteer.totalPartnerSessionsWithinRange
  row.dateRangeUniqueStudentsHelped =
    volunteer.totalUniqueStudentsHelpedWithinRange
  row.dateRangeUniquePartnerStudentsHelped =
    volunteer.totalUniquePartnerStudentsHelpedWithinRange
  row.dateRangeTutoringHours = volunteer.hourSummaryDateRange.totalCoachingHours
  row.dateRangePartnerStudentsTutoringHours = Number(
    (volunteer.totalPartnerTimeTutoredWithinRange / 3600000).toFixed(2)
  )
  row.dateRangeTrainingHours = volunteer.hourSummaryDateRange.totalQuizzesPassed
  row.dateRangeElapsedAvailabilityHours = Number(
    (volunteer.hourSummaryDateRange.totalElapsedAvailability * 0.1).toFixed(1)
  )
  row.dateRangeVolunteerHours =
    volunteer.hourSummaryDateRange.totalVolunteerHours

  row.dateOnboarded = getDateOnboarded({
    createdAt: volunteer.createdAt,
    isOnboarded: volunteer.isOnboarded,
    dateOnboarded: volunteer.dateOnboarded,
  })

  return row
}

export type AnalyticsReportSummaryData = {
  total: number
  totalWithinDateRange: number
}

export type AnalyticsReportSummary = {
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

  const uniqueStudentSummary = await VolunteerRepo.getUniqueStudentsHelpedForAnalyticsReportSummary(
    partnerOrg,
    startDate,
    endDate
  )

  summary.uniqueStudentsHelped.total = uniqueStudentSummary
    ? uniqueStudentSummary.totalUniqueStudentsHelped
    : 0
  summary.uniqueStudentsHelped.totalWithinDateRange = uniqueStudentSummary
    ? uniqueStudentSummary.totalUniqueStudentsHelpedWithinRange
    : 0

  summary.uniquePartnerStudentsHelped.total = uniqueStudentSummary
    ? uniqueStudentSummary.totalUniquePartnerStudentsHelped
    : 0
  summary.uniquePartnerStudentsHelped.totalWithinDateRange = uniqueStudentSummary
    ? uniqueStudentSummary.totalUniquePartnerStudentsHelpedWithinRange
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
  partnerOrg: string,
  partnerName: string
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
  partnerOrg: string,
  partnerName: string
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
    else if (key === 'uniquePartnerStudentsHelped')
      description = `Unique ${partnerName} students helped`

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
  validateSessionDateRanges(data)
}

export function validateStudentSessionReportQuery(data: unknown) {
  const validatedData = asValidateStudentSessionReportQuery(data)
  return validatedData
}

export function validateStudentUsageReportQuery(data: unknown) {
  const validatedData = asValidateStudentUsageReportQuery(data)
  validateJoinedDateRanges(validatedData)
  return validatedData
}
