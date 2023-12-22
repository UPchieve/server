import path from 'path'
import fs from 'fs'
import moment from 'moment'
import 'moment-timezone'
import _ from 'lodash'
import exceljs from 'exceljs'
import { v4 as uuidv4 } from 'uuid'
import { CustomError } from 'ts-custom-error'
import logger from '../logger'
import { REPORT_FILE_NAMES } from '../constants'
import config from '../config'
import {
  generateTelecomReport,
  getAnalyticsReportRow,
  AnalyticsReportRow,
  AnalyticsReportSummary,
  getAnalyticsReportSummary,
  processAnalyticsReportSummarySheet,
  processAnalyticsReportDataSheet,
  validateVolunteerReportQuery,
  validateStudentSessionReportQuery,
  validateStudentUsageReportQuery,
} from '../utils/reportUtils'
import { InputError } from '../models/Errors'
import * as VolunteerService from './VolunteerService'
import { asFactory, asString } from '../utils/type-utils'
import * as StudentRepo from '../models/Student/queries'
import * as VolunteerRepo from '../models/Volunteer/queries'
import * as VolunteerPartnerOrgRepo from '../models/VolunteerPartnerOrg/queries'

export class ReportNoDataFoundError extends CustomError {}

const fsPromises = fs.promises

const getReportFilePath = (fileName: string) =>
  `${config.fileWorkRootPath}/${uuidv4()}/${fileName}.xlsx`

type SessionReport = {
  Topic: string
  Subtopic: string
  'Created at': string | Date
  Messages: string
  'First name': string
  'Last name': string
  Email: string
  Volunteer: string
  'Volunteer join date': string | Date
  'Ended at': string | Date
  'Wait time'?: string
  'Session rating'?: string
}

type UsageReport = {
  'First name': string
  'Last name': string
  Email: string
  'Minutes over date range': number
  'Total minutes': number
  'Join date': string | Date
  'Total sessions': number
  'Sessions over date range': number
  'High school name': string
  'Partner site': string
  'HS/College': string
  'Sponsor Org': string | undefined
  'Partner Org': string
}

const formatDate = (date: string | Date): Date | string => {
  if (!date) return '--'
  return moment(date)
    .tz('America/New_York')
    .format('l h:mm a')
}

function dateStringToDateEST(dateString: string): Date {
  const currentUSEasternTime = moment.tz('America/New_York')
  const minutesOffset = currentUSEasternTime.utcOffset()
  // Add the EST/EDT offset to the UTC time
  const hoursOffset = Math.abs(minutesOffset / 60)
  const isStrictMode = true
  const dateEST = moment(dateString, 'MM-DD-YYYY', isStrictMode)
    .utc()
    .startOf('day')
    .add(hoursOffset, 'hour')
    .toDate()
  return dateEST
}

export const sessionReport = async (
  data: unknown
): Promise<SessionReport[]> => {
  const {
    sessionRangeFrom,
    sessionRangeTo,
    highSchoolId,
    studentPartnerOrg,
    studentPartnerSite,
    sponsorOrg,
  } = validateStudentSessionReportQuery(data)

  if (!highSchoolId && !studentPartnerOrg && !studentPartnerSite && !sponsorOrg)
    return []

  const report = await StudentRepo.getSessionReport({
    highSchoolId,
    studentPartnerOrg,
    studentPartnerSite,
    sponsorOrg,
    start: dateStringToDateEST(sessionRangeFrom),
    end: dateStringToDateEST(sessionRangeTo),
  })

  if (report && report.length) {
    const formattedSessions = report.map(row => {
      return {
        Topic: row.topic,
        Subtopic: row.subject,
        'Created at': formatDate(row.createdAt),
        Messages: String(row.totalMessages),
        'First name': row.firstName,
        'Last name': row.lastName,
        Email: row.email,
        'Partner site': row.partnerSite ? row.partnerSite : '-',
        'Sponsor org': row.sponsorOrg ? row.sponsorOrg : '-',
        Volunteer: row.volunteerJoined,
        'Volunteer join date': row.volunteerJoinedAt
          ? formatDate(row.volunteerJoinedAt)
          : '',
        'Ended at': formatDate(row.endedAt),
        'Wait time': row.waitTimeMins ? `${row.waitTimeMins}mins` : '',
        'Session rating': row.sessionRating ? String(row.sessionRating) : '',
      }
    })

    return formattedSessions
  }
  return []
}

export const usageReport = async (data: unknown): Promise<UsageReport[]> => {
  const {
    joinedBefore,
    joinedAfter,
    sessionRangeFrom,
    sessionRangeTo,
    highSchoolId,
    studentPartnerOrg,
    studentPartnerSite,
    sponsorOrg,
  } = validateStudentUsageReportQuery(data)

  if (!highSchoolId && !studentPartnerOrg && !studentPartnerSite && !sponsorOrg)
    return []

  const report = await StudentRepo.getUsageReport({
    highSchoolId,
    studentPartnerOrg,
    studentPartnerSite,
    sponsorOrg,
    joinedStart: dateStringToDateEST(joinedAfter),
    joinedEnd: dateStringToDateEST(joinedBefore),
    sessionStart: dateStringToDateEST(sessionRangeFrom),
    sessionEnd: dateStringToDateEST(sessionRangeTo),
  })

  if (report && report.length) {
    const studentUsage = Promise.all(
      report.map(async student => {
        const dataFormat: UsageReport = {
          'First name': student.firstName,
          'Last name': student.lastName,
          Email: student.email,
          'Join date': formatDate(student.joinDate),
          'Total sessions': student.totalSessions,
          'Total minutes': student.totalSessionLengthMins,
          'Sessions over date range': student.rangeTotalSessions,
          'Minutes over date range': student.rangeSessionLengthMins,
          'High school name': student.school ? student.school : '',
          'Partner site': student.partnerSite ? student.partnerSite : '-',
          'HS/College': student.school ? 'High school' : 'College',
          'Sponsor Org': student.sponsorOrg ? student.sponsorOrg : undefined,
          'Partner Org': student.studentPartnerOrg
            ? student.studentPartnerOrg
            : '',
        }

        return dataFormat
      })
    )

    return studentUsage
  }
  return []
}

interface TelecomReportPayload {
  partnerOrg: string
  startDate: string
  endDate: string
}

const asTelecomReportPayload = asFactory<TelecomReportPayload>({
  partnerOrg: asString,
  startDate: asString,
  endDate: asString,
})

export async function getTelecomReport(data: unknown) {
  // Only generate the telecom report for a specific partner
  const { partnerOrg, startDate, endDate } = asTelecomReportPayload(data)
  if (
    !partnerOrg ||
    !config.customVolunteerPartnerOrgs.some(org => org === partnerOrg)
  )
    return []
  try {
    const volunteers = await VolunteerRepo.getVolunteersForTelecomReport(
      partnerOrg
    )

    return await generateTelecomReport(
      volunteers,
      new Date(startDate),
      new Date(endDate)
    )
  } catch (error) {
    logger.error(error as Error)
    throw new Error((error as Error).message)
  }
}

type FullReport = {
  summary: AnalyticsReportSummary
  report: AnalyticsReportRow[]
}
export async function generatePartnerAnalyticsReport(
  partnerOrg: string,
  partnerOrgId: string,
  startDate: string,
  endDate: string
): Promise<FullReport> {
  const logData = {
    volunteerPartnerOrgId: partnerOrgId,
  }
  const start: Date = moment(startDate, 'MM-DD-YYYY').toDate()
  const end: Date = moment(endDate, 'MM-DD-YYYY').toDate()

  // Date range check
  if (start >= end) throw new Error('Invalid date range')

  const volunteers = await VolunteerRepo.getVolunteersForAnalyticsReport(
    partnerOrg,
    start,
    end
  )
  if (!volunteers)
    throw new Error(`no volunteer partner org found with id=${partnerOrgId}`)
  logger.info(logData, `Found ${volunteers.length} volunteers for partner org`)

  const report: AnalyticsReportRow[] = []
  for (const volunteer of volunteers) {
    // Get all hour summary data for the volunteer
    const hourSummaryTotal = await VolunteerService.getHourSummaryStats(
      volunteer.userId,
      new Date(volunteer.createdAt),
      moment()
        .utc()
        .toDate()
    )
    const hourSummaryDateRange = await VolunteerService.getHourSummaryStats(
      volunteer.userId,
      start,
      end
    )
    const volunteerWithAnalytics = {
      ...volunteer,
      hourSummaryTotal,
      hourSummaryDateRange,
    }
    const row = getAnalyticsReportRow(volunteerWithAnalytics)
    report.push(row)
  }
  logger.info(logData, 'Generated all volunteer rows for analytics report')

  let summary: AnalyticsReportSummary = {} as AnalyticsReportSummary
  if (report.length > 0) {
    summary = await getAnalyticsReportSummary(partnerOrg, report, start, end)
    logger.info(logData, 'Finished generating partner analytics report summary')
  }

  return { summary, report }
}

export async function writeAnalyticsReport(
  data: FullReport,
  startDate: string,
  endDate: string,
  partnerOrg: string
) {
  const reportFilePath = getReportFilePath(REPORT_FILE_NAMES.ANALYTICS_REPORT)
  await fsPromises.mkdir(path.parse(reportFilePath).dir, { recursive: true })
  const workbook = new exceljs.stream.xlsx.WorkbookWriter({
    filename: reportFilePath,
    useStyles: true, // include this option to apply styling to streams
  })
  const sheetOptions = {
    pageSetup: {
      orientation: 'landscape',
      showGridLines: true,
      showRowColHeaders: true,
    },
  } as Partial<exceljs.AddWorksheetOptions>
  const summarySheet = workbook.addWorksheet('Summary', sheetOptions)
  const dataSheet = workbook.addWorksheet('Data', sheetOptions)
  const formattedStartDate = moment(startDate, 'MM-DD-YYYY').format('MM/DD/YY')
  const formattedEndDate = moment(endDate, 'MM-DD-YYYY').format('MM/DD/YY')
  const partner = await VolunteerPartnerOrgRepo.getFullVolunteerPartnerOrgByKey(
    partnerOrg
  )
  const partnerName = partner.name
  processAnalyticsReportSummarySheet(
    data.summary,
    summarySheet,
    formattedStartDate,
    formattedEndDate,
    partnerOrg,
    partnerName
  )
  processAnalyticsReportDataSheet(
    data.report,
    dataSheet,
    formattedStartDate,
    formattedEndDate,
    partnerOrg,
    partnerName
  )
  summarySheet.commit()
  dataSheet.commit()
  await workbook.commit()
  return reportFilePath
}

export async function getAnalyticsReport(data: unknown) {
  try {
    const { partnerOrg, startDate, endDate } = validateVolunteerReportQuery(
      data
    )

    const partnerOrgId = await VolunteerPartnerOrgRepo.getVolunteerPartnerOrgIdByKey(
      partnerOrg
    )
    if (!partnerOrg) throw new ReportNoDataFoundError('No partner org provided')
    if (!partnerOrgId)
      throw new ReportNoDataFoundError('No partner org found with given key')

    const logData = {
      volunteerPartnerOrgId: partnerOrgId,
    }
    logger.info(logData, 'Beginning partner analytics report generation')

    const analyticsReport = await generatePartnerAnalyticsReport(
      partnerOrg,
      partnerOrgId,
      startDate,
      endDate
    )
    if (analyticsReport.report.length === 0)
      throw new ReportNoDataFoundError(
        `No analytics report data for partner with id=${partnerOrgId}`
      )
    logger.info(
      logData,
      `Generated partner analytics report with length=${analyticsReport.report.length}`
    )
    const reportFilePath = await writeAnalyticsReport(
      analyticsReport,
      startDate,
      endDate,
      partnerOrg
    )
    logger.info(logData, 'Finished writing partner analytics report')
    return reportFilePath
  } catch (error) {
    logger.error(error as Error)
    if (error instanceof ReportNoDataFoundError || error instanceof InputError)
      throw error
    throw new Error((error as Error).message)
  }
}

export async function deleteReport(reportFilePath: string) {
  try {
    await fsPromises.rm(path.parse(reportFilePath).dir, { recursive: true })
  } catch (error) {
    logger.error(error as Error)
    throw new Error((error as Error).message)
  }
}
