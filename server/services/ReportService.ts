import path from 'path'
import fs from 'fs'
import moment from 'moment'
import 'moment-timezone'
import mongoose, { Types } from 'mongoose'
import _ from 'lodash'
import exceljs from 'exceljs'
import { v4 as uuidv4 } from 'uuid'
import { CustomError } from 'ts-custom-error'
import User from '../models/User'
import {
  SponsorOrgManifest,
  studentPartnerManifests,
} from '../partnerManifests'
import logger from '../logger'
import {
  FEEDBACK_VERSIONS,
  DATE_RANGE_COMPARISON_FIELDS,
  REPORT_FILE_NAMES,
} from '../constants'
import config from '../config'
import {
  generateTelecomReport,
  getAnalyticsReportRow,
  getSumOperatorForDateRange,
  AnalyticsReportRow,
  AnalyticsReportSummary,
  PartnerVolunteerAnalytics,
  getAnalyticsReportSummary,
  processAnalyticsReportSummarySheet,
  processAnalyticsReportDataSheet,
  validateVolunteerReportQuery,
  validateStudentSessionReportQuery,
  validateStudentUsageReportQuery,
} from '../utils/reportUtils'
import { InputError } from '../models/Errors'
import * as VolunteerService from './VolunteerService'
import { AnyFeedback } from '../models/Feedback/queries'
import {
  getVolunteersForTelecomReport,
  getVolunteersWithPipeline,
} from '../models/Volunteer/queries'
import { asFactory, asString } from '../utils/type-utils'
import { asSponsorOrg } from '../utils/validators'

export class ReportNoDataFoundError extends CustomError {}

const fsPromises = fs.promises

const getReportFilePath = (fileName: string) =>
  `${config.fileWorkRootPath}/${uuidv4()}/${fileName}.xlsx`

const ObjectId = mongoose.Types.ObjectId

interface SessionReport {
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
  'Wait time': string
  'Session rating': string
}

interface UsageReport {
  'First name': string
  'Last name': string
  Email: string
  'Minutes over date range': number
  'Total minutes': number
  'Join date': string | Date
  'Total sessions': number
  'Sessions over date range': number
  'Average session rating': number
}

type approvedHighschoolQuery = Types.ObjectId | { $in: Types.ObjectId[] }
type studentPartnerOrgQuery = string | { $in: string[] }

const formatDate = (date: string): Date | string => {
  if (!date) return '--'
  return moment(date)
    .tz('America/New_York')
    .format('l h:mm a')
}

function calcAverageRating(allFeedback: AnyFeedback[]): number {
  let ratingsSum = 0
  let ratingsCount = 0

  for (let i = 0; i < allFeedback.length; i++) {
    const feedback = allFeedback[i]
    let sessionRatingKey = ''

    if (feedback.versionNumber === FEEDBACK_VERSIONS.ONE)
      sessionRatingKey = 'responseData.rate-session.rating'
    else if (feedback.versionNumber === FEEDBACK_VERSIONS.TWO)
      sessionRatingKey = 'studentCounselingFeedback.rate-session.rating'
    const sessionRating = _.get(feedback, sessionRatingKey, null)
    if (sessionRating) {
      ratingsSum += sessionRating
      ratingsCount += 1
    }
  }

  return Number((ratingsSum / (ratingsCount || 1)).toFixed(2))
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
  const query: {
    approvedHighschool?: approvedHighschoolQuery
    studentPartnerOrg?: studentPartnerOrgQuery
    partnerSite?: string
    $or?: any[]
  } = {}

  if (highSchoolId) query.approvedHighschool = new ObjectId(highSchoolId)
  if (studentPartnerOrg) query.studentPartnerOrg = studentPartnerOrg
  if (studentPartnerSite) query.partnerSite = studentPartnerSite
  let sponsor: SponsorOrgManifest
  if (sponsorOrg) {
    sponsor = asSponsorOrg(sponsorOrg)
    if (sponsor.schools && sponsor.partnerOrgs)
      query.$or = [
        { approvedHighschool: { $in: sponsor.schools } },
        { studentPartnerOrg: { $in: sponsor.partnerOrgs } },
      ]
    else if (sponsor.schools)
      query.approvedHighschool = { $in: sponsor.schools }
    else if (sponsor.partnerOrgs)
      query.studentPartnerOrg = { $in: sponsor.partnerOrgs }
  }

  const oneMinuteInMs = 1000 * 60
  const roundDecimalPlace = 1

  const sessionRangeStart: Date = dateStringToDateEST(sessionRangeFrom)
  const sessionRangeEnd: Date = dateStringToDateEST(sessionRangeTo)

  // TODO: repo pattern
  const sessions = await User.aggregate([
    {
      $match: query,
    },
    {
      $project: {
        firstname: 1,
        lastname: 1,
        email: 1,
        pastSessions: 1,
        partnerSite: 1,
      },
    },
    {
      $lookup: {
        from: 'sessions',
        localField: 'pastSessions',
        foreignField: '_id',
        as: 'session',
      },
    },
    {
      $unwind: '$session',
    },
    {
      $match: {
        'session.createdAt': {
          $gte: sessionRangeStart,
          $lte: sessionRangeEnd,
        },
      },
    },
    {
      $addFields: {
        sessionId: '$session._id',
      },
    },
    {
      $lookup: {
        from: 'feedbacks',
        localField: 'sessionId',
        foreignField: 'sessionId',
        as: 'feedbacks',
      },
    },
    {
      $addFields: {
        studentFeedback: {
          $filter: {
            input: '$feedbacks',
            as: 'feedback',
            cond: { $eq: ['$$feedback.userType', 'student'] },
          },
        },
      },
    },
    {
      $unwind: {
        path: '$studentFeedback',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        filteredStuff: 1,
        createdAt: '$session.createdAt',
        topic: '$session.type',
        subtopic: '$session.subTopic',
        messages: { $size: '$session.messages' },
        student: {
          firstName: '$firstname',
          lastName: '$lastname',
          email: '$email',
          partnerSite: '$partnerSite',
        },
        volunteer: {
          $cond: {
            if: '$session.volunteer',
            then: 'YES',
            else: 'NO',
          },
        },
        volunteerJoinedAt: '$session.volunteerJoinedAt',
        endedAt: '$session.endedAt',
        waitTime: {
          $cond: {
            if: '$session.volunteerJoinedAt',
            then: {
              $round: [
                {
                  $divide: [
                    {
                      $subtract: [
                        '$session.volunteerJoinedAt',
                        '$session.createdAt',
                      ],
                    },
                    oneMinuteInMs,
                  ],
                },
                roundDecimalPlace,
              ],
            },
            else: null,
          },
        },
        sessionRating: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [
                    {
                      $eq: [
                        '$studentFeedback.versionNumber',
                        FEEDBACK_VERSIONS.ONE,
                      ],
                    },
                    '$studentFeedback.responseData.rate-session.rating',
                  ],
                },
                then: '$studentFeedback.responseData.rate-session.rating',
              },
              {
                case: {
                  $and: [
                    {
                      $eq: [
                        '$studentFeedback.versionNumber',
                        FEEDBACK_VERSIONS.TWO,
                      ],
                    },
                    '$studentFeedback.studentCounselingFeedback.rate-session.rating',
                  ],
                },
                then:
                  '$studentFeedback.studentCounselingFeedback.rate-session.rating',
              },
            ],
            default: null,
          },
        },
      },
    },
    {
      $sort: { createdAt: 1 },
    },
  ]).read('secondaryPreferred')

  const formattedSessions = sessions.map(session => {
    return {
      Topic: session.topic,
      Subtopic: session.subtopic,
      'Created at': formatDate(session.createdAt),
      Messages: session.messages,
      'First name': session.student.firstName,
      'Last name': session.student.lastName,
      Email: session.student.email,
      'Partner site': session.student.partnerSite
        ? session.student.partnerSite
        : '-',
      'Sponsor org': sponsor ? sponsor.name : '-',
      Volunteer: session.volunteer,
      'Volunteer join date': formatDate(session.volunteerJoinedAt),
      'Ended at': formatDate(session.endedAt),
      'Wait time': session.waitTime && `${session.waitTime}mins`,
      'Session rating': session.sessionRating,
    }
  })

  return formattedSessions
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
  const query: {
    createdAt?: {}
    approvedHighschool?: approvedHighschoolQuery
    studentPartnerOrg?: studentPartnerOrgQuery
    partnerSite?: string
    $or?: any[]
  } = {
    createdAt: {
      $gte: dateStringToDateEST(joinedAfter),
      $lte: dateStringToDateEST(joinedBefore),
    },
  }
  if (highSchoolId) query.approvedHighschool = new ObjectId(highSchoolId)
  if (studentPartnerOrg) query.studentPartnerOrg = studentPartnerOrg
  if (studentPartnerSite) query.partnerSite = studentPartnerSite
  let sponsor: SponsorOrgManifest
  if (sponsorOrg) {
    sponsor = asSponsorOrg(sponsorOrg)
    if (sponsor.schools && sponsor.partnerOrgs)
      query.$or = [
        { approvedHighschool: { $in: sponsor.schools } },
        { studentPartnerOrg: { $in: sponsor.partnerOrgs } },
      ]
    else if (sponsor.schools)
      query.approvedHighschool = { $in: sponsor.schools }
    else if (sponsor.partnerOrgs)
      query.studentPartnerOrg = { $in: sponsor.partnerOrgs }
  }

  const sessionRangeStart: Date = dateStringToDateEST(sessionRangeFrom)
  const sessionRangeEnd: Date = dateStringToDateEST(sessionRangeTo)

  // TODO: repo pattern
  const students = await User.aggregate([
    {
      $match: query,
    },
    {
      $project: {
        email: 1,
        pastSessions: 1,
        firstName: '$firstname',
        lastName: '$lastname',
        createdAt: 1,
        totalSessions: { $size: '$pastSessions' },
        studentPartnerOrg: 1,
        partnerSite: 1,
        approvedHighschool: 1,
      },
    },
    {
      $lookup: {
        from: 'sessions',
        localField: 'pastSessions',
        foreignField: '_id',
        as: 'session',
      },
    },
    {
      $unwind: {
        path: '$session',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'feedbacks',
        let: { studentId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$userType', 'student'] },
                  { $eq: ['$studentId', '$$studentId'] },
                ],
              },
            },
          },
        ],
        as: 'feedback',
      },
    },
    {
      $addFields: {
        lastMessage: { $arrayElemAt: ['$session.messages', -1] },
        sessionLength: {
          $cond: [
            { $ifNull: ['$session.volunteerJoinedAt', false] },
            { $subtract: ['$session.endedAt', '$session.volunteerJoinedAt'] },
            0,
          ],
        },
      },
    },
    {
      $addFields: {
        isWithinDateRange: {
          $cond: [
            {
              $and: [
                {
                  $gte: ['$session.createdAt', sessionRangeStart],
                },
                {
                  $lte: ['$session.createdAt', sessionRangeEnd],
                },
              ],
            },
            true,
            false,
          ],
        },
        sessionLength: {
          $switch: {
            branches: [
              {
                case: {
                  $lt: ['$sessionLength', 0],
                },
                then: 0,
              },
              {
                case: {
                  $gte: ['$sessionLength', 60 * (1000 * 60)],
                },
                then: {
                  $cond: [
                    {
                      $ifNull: ['$lastMessage', false],
                    },
                    {
                      $subtract: [
                        '$lastMessage.createdAt',
                        '$session.volunteerJoinedAt',
                      ],
                    },
                    0,
                  ],
                },
              },
            ],
            default: '$sessionLength',
          },
        },
      },
    },
    {
      $group: {
        _id: '$_id',
        firstName: { $first: '$firstName' },
        lastName: { $first: '$lastName' },
        createdAt: { $first: '$createdAt' },
        email: { $first: '$email' },
        feedback: { $first: '$feedback' },
        sessionLength: { $sum: '$sessionLength' },
        totalSessions: { $first: '$totalSessions' },
        range: {
          $sum: {
            $cond: [
              { $ifNull: ['$isWithinDateRange', false] },
              '$sessionLength',
              0,
            ],
          },
        },
        sessionsOverRange: {
          $sum: {
            $cond: [{ $ifNull: ['$isWithinDateRange', false] }, 1, 0],
          },
        },
        partnerSite: { $first: '$partnerSite' },
        studentPartnerOrg: { $first: '$studentPartnerOrg' },
        approvedHighschool: { $max: '$approvedHighschool' },
      },
    },
    {
      $lookup: {
        from: 'schools',
        localField: 'approvedHighschool',
        foreignField: '_id',
        as: 'highschool',
      },
    },
    {
      $unwind: {
        path: '$highschool',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        email: 1,
        joinDate: '$createdAt',
        totalSessions: 1,
        totalMinutes: {
          $round: [{ $divide: ['$sessionLength', 60000] }, 2],
        },
        sessionsOverDateRange: '$sessionsOverRange',
        minsOverDateRange: {
          $round: [{ $divide: ['$range', 60000] }, 2],
        },
        feedback: 1,
        partnerSite: 1,
        approvedHighschool: {
          $ifNull: ['$highschool.nameStored', '$highschool.SCH_NAME'],
        },
        studentPartnerOrg: 1,
        _id: 0,
      },
    },
    {
      $sort: {
        joinDate: 1,
      },
    },
  ]).read('secondaryPreferred')

  const partnerSites =
    studentPartnerOrg &&
    studentPartnerManifests[studentPartnerOrg] &&
    studentPartnerManifests[studentPartnerOrg].sites

  const studentUsage = students.map(student => {
    const feedback = Array.from(student.feedback)

    const dataFormat: any = {
      'First name': student.firstName,
      'Last name': student.lastName,
      Email: student.email,
      'Join date': formatDate(student.joinDate),
      'Total sessions': student.totalSessions,
      'Total minutes': student.totalMinutes,
      'Average session rating': calcAverageRating(feedback as AnyFeedback[]),
      'Sessions over date range': student.sessionsOverDateRange,
      'Minutes over date range': student.minsOverDateRange,
      'High school name': student.approvedHighschool,
    }

    if (partnerSites)
      dataFormat['Partner site'] = student.partnerSite
        ? student.partnerSite
        : '-'

    if (studentPartnerOrg) {
      if (student.approvedHighschool) dataFormat['HS/College'] = 'High school'
      else dataFormat['HS/College'] = 'College'
    }

    if (sponsor) {
      dataFormat['Sponsor Org'] = sponsor.name || '-'
      if (student.studentPartnerOrg)
        dataFormat['Partner org'] =
          studentPartnerManifests[student.studentPartnerOrg].name
    }

    return dataFormat
  })

  return studentUsage
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
  if (!config.customVolunteerPartnerOrgs.some(org => org === partnerOrg))
    return []
  try {
    const dateQuery = { $gt: new Date(startDate), $lte: new Date(endDate) }
    const volunteers = await getVolunteersForTelecomReport(partnerOrg)

    return await generateTelecomReport(volunteers, dateQuery)
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
  startDate: string,
  endDate: string
): Promise<FullReport> {
  const start: Date = moment(startDate, 'MM-DD-YYYY').toDate()
  const end: Date = moment(endDate, 'MM-DD-YYYY').toDate()

  // Date range check
  if (start >= end) throw new Error('Invalid date range')

  // get volunteers for analytics
  const volunteers = ((await getVolunteersWithPipeline([
    {
      $match: {
        volunteerPartnerOrg: partnerOrg,
      },
    },
    // Get the volunteer's user action "ONBOARDED"
    {
      $lookup: {
        from: 'useractions',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$action', 'ONBOARDED'] },
                  { $eq: ['$user', '$$userId'] },
                ],
              },
            },
          },
        ],
        as: 'actionOnboarded',
      },
    },
    {
      $unwind: {
        path: '$actionOnboarded',
        preserveNullAndEmptyArrays: true,
      },
    },

    /**
     *
     * Get analytics for a user's sessions
     * - How many unique students were helped
     * - Total amount of sessions they have had
     * - Amount of sessions that they have had within the date range
     *
     */
    {
      $lookup: {
        from: 'sessions',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$volunteer', '$$userId'],
              },
            },
          },
          {
            $facet: {
              uniqueStudentsHelped: [
                {
                  $group: {
                    _id: '$student',
                    frequency: { $sum: 1 },
                    frequencyWitinDateRange: getSumOperatorForDateRange(
                      start,
                      end
                    ),
                  },
                },
                {
                  $group: {
                    _id: null,
                    total: { $sum: 1 },
                    totalWithinDateRange: {
                      $sum: {
                        $cond: [
                          { $gte: ['$frequencyWitinDateRange', 1] },
                          1,
                          0,
                        ],
                      },
                    },
                  },
                },
              ],
              sessionStats: [
                {
                  $group: {
                    _id: null,
                    total: { $sum: 1 },
                    totalWithinDateRange: getSumOperatorForDateRange(
                      start,
                      end
                    ),
                  },
                },
              ],
            },
          },
        ],
        as: 'sessionAnalytics',
      },
    },
    {
      $unwind: {
        path: '$sessionAnalytics',
        preserveNullAndEmptyArrays: true,
      },
    },
    // Get the total amount of text messages that were sent to a volunteer
    // and the total amount sent within startDate - endDate
    {
      $lookup: {
        from: 'notifications',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$volunteer', '$$userId'],
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              totalWithinDateRange: getSumOperatorForDateRange(
                start,
                end,
                DATE_RANGE_COMPARISON_FIELDS.SENT_AT
              ),
            },
          },
        ],
        as: 'textNotifications',
      },
    },
    {
      $project: {
        _id: 1,
        firstName: '$firstname',
        lastName: '$lastname',
        email: 1,
        state: 1,
        isOnboarded: 1,
        createdAt: 1,
        dateOnboarded: '$actionOnboarded.createdAt',
        certifications: 1,
        availabilityLastModifiedAt: 1,
        sessionAnalytics: 1,
        textNotifications: { $arrayElemAt: ['$textNotifications', 0] },
        isDeactivated: 1,
        activityLastAt: 1,
      },
    },
  ])) as unknown) as PartnerVolunteerAnalytics[]

  const report: AnalyticsReportRow[] = []
  for (const volunteer of volunteers) {
    // Get all hour summary data for the volunteer
    const hourSummaryTotal = await VolunteerService.getHourSummaryStats(
      volunteer._id,
      new Date(volunteer.createdAt),
      moment()
        .utc()
        .toDate()
    )
    const hourSummaryDateRange = await VolunteerService.getHourSummaryStats(
      volunteer._id,
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

  let summary: AnalyticsReportSummary = {} as AnalyticsReportSummary
  if (report.length > 0)
    summary = await getAnalyticsReportSummary(partnerOrg, report, start, end)
  return { summary, report }
}

export async function writeAnalyticsReport(
  data: FullReport,
  startDate: string,
  endDate: string
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
  processAnalyticsReportSummarySheet(
    data.summary,
    summarySheet,
    formattedStartDate,
    formattedEndDate
  )
  processAnalyticsReportDataSheet(
    data.report,
    dataSheet,
    formattedStartDate,
    formattedEndDate
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
    const analyticsReport = await generatePartnerAnalyticsReport(
      partnerOrg,
      startDate,
      endDate
    )
    if (analyticsReport.report.length === 0)
      throw new ReportNoDataFoundError(
        'No analytics report data for the requested partner'
      )
    return await writeAnalyticsReport(analyticsReport, startDate, endDate)
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
