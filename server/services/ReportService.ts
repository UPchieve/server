import moment from 'moment-timezone'
import mongoose, { Types } from 'mongoose'
import _, { capitalize } from 'lodash'
import User from '../models/User'
import {
  studentPartnerManifests,
  volunteerPartnerManifests
} from '../partnerManifests'
import { USER_ACTION, UTC_TO_HOUR_MAPPING } from '../constants'
import roundUpToNearestInterval from '../utils/round-up-to-nearest-interval'
import countCerts from '../utils/count-certs'
import logger from '../logger'
import * as VolunteerService from './VolunteerService'
import * as UserActionService from './UserActionService'
import SessionService from './SessionService'
import * as AvailabilityService from './AvailabilityService'

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

const formatDate = (date): Date | string => {
  if (!date) return '--'
  return moment(date)
    .tz('America/New_York')
    .format('l h:mm a')
}

function calcAverageRating(allFeedback): number {
  let ratingsSum = 0
  let ratingsCount = 0

  for (let i = 0; i < allFeedback.length; i++) {
    const feedback = allFeedback[i]
    const sessionRating = _.get(
      feedback,
      'responseData.rate-session.rating',
      null
    )
    if (sessionRating) {
      ratingsSum += sessionRating
      ratingsCount += 1
    }
  }

  return Number((ratingsSum / (ratingsCount || 1)).toFixed(2))
}

function getOffsetTime(date?): number {
  if (!date) return new Date().getTime()
  const estTimeOffset = 1000 * 60 * 60 * 4

  return new Date(date).getTime() + estTimeOffset
}

export const sessionReport = async ({
  sessionRangeFrom,
  sessionRangeTo,
  highSchoolId,
  studentPartnerOrg,
  studentPartnerSite
}): Promise<SessionReport[]> => {
  const query: {
    approvedHighschool?: Types.ObjectId
    studentPartnerOrg?: string
    partnerSite?: string
  } = {}

  if (highSchoolId) query.approvedHighschool = ObjectId(highSchoolId)
  if (studentPartnerOrg) query.studentPartnerOrg = studentPartnerOrg
  if (studentPartnerSite) query.partnerSite = studentPartnerSite

  const oneMinuteInMs = 1000 * 60
  const roundDecimalPlace = 1
  const oneDayInMS = 1000 * 60 * 60 * 24

  sessionRangeFrom = getOffsetTime(sessionRangeFrom)
  sessionRangeTo = sessionRangeTo
    ? getOffsetTime(sessionRangeTo) + oneDayInMS
    : getOffsetTime() + oneDayInMS

  const sessions = await User.aggregate([
    {
      $match: query
    },
    {
      $project: {
        firstname: 1,
        lastname: 1,
        email: 1,
        pastSessions: 1,
        partnerSite: 1
      }
    },
    {
      $lookup: {
        from: 'sessions',
        localField: 'pastSessions',
        foreignField: '_id',
        as: 'session'
      }
    },
    {
      $unwind: '$session'
    },
    {
      $match: {
        'session.createdAt': {
          $gte: new Date(sessionRangeFrom),
          $lte: new Date(sessionRangeTo)
        }
      }
    },
    {
      $addFields: {
        sessionId: '$session._id'
      }
    },
    {
      $lookup: {
        from: 'feedbacks',
        localField: 'sessionId',
        foreignField: 'sessionId',
        as: 'feedbacks'
      }
    },
    {
      $addFields: {
        studentFeedback: {
          $filter: {
            input: '$feedbacks',
            as: 'feedback',
            cond: { $eq: ['$$feedback.userType', 'student'] }
          }
        }
      }
    },
    {
      $unwind: {
        path: '$studentFeedback',
        preserveNullAndEmptyArrays: true
      }
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
          partnerSite: '$partnerSite'
        },
        volunteer: {
          $cond: {
            if: '$session.volunteer',
            then: 'YES',
            else: 'NO'
          }
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
                        '$session.createdAt'
                      ]
                    },
                    oneMinuteInMs
                  ]
                },
                roundDecimalPlace
              ]
            },
            else: null
          }
        },
        sessionRating: {
          $cond: {
            if: '$studentFeedback.responseData.rate-session.rating',
            then: '$studentFeedback.responseData.rate-session.rating',
            else: null
          }
        }
      }
    },
    {
      $sort: { createdAt: 1 }
    }
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
      Volunteer: session.volunteer,
      'Volunteer join date': formatDate(session.volunteerJoinedAt),
      'Ended at': formatDate(session.endedAt),
      'Wait time': session.waitTime && `${session.waitTime}mins`,
      'Session rating': session.sessionRating
    }
  })

  return formattedSessions
}

export const usageReport = async ({
  joinedBefore,
  joinedAfter,
  sessionRangeFrom,
  sessionRangeTo,
  highSchoolId,
  studentPartnerOrg,
  studentPartnerSite
}): Promise<UsageReport[]> => {
  const query: {
    createdAt?: {}
    approvedHighschool?: Types.ObjectId
    studentPartnerOrg?: string
    partnerSite?: string
  } = {}
  const oneDayInMS = 1000 * 60 * 60 * 24

  if (joinedAfter) {
    joinedAfter = getOffsetTime(joinedAfter)
    query.createdAt = { $gte: new Date(joinedAfter) }
  }
  if (joinedBefore) {
    joinedBefore = getOffsetTime(joinedBefore) + oneDayInMS
    query.createdAt = {
      $gte: new Date(joinedAfter),
      $lte: new Date(joinedBefore)
    }
  }

  if (highSchoolId) query.approvedHighschool = ObjectId(highSchoolId)
  if (studentPartnerOrg) query.studentPartnerOrg = studentPartnerOrg
  if (studentPartnerSite) query.partnerSite = studentPartnerSite

  // select a range from date and to date or a range from date and today (inclusive)
  sessionRangeFrom = getOffsetTime(sessionRangeFrom)
  sessionRangeTo = sessionRangeTo
    ? getOffsetTime(sessionRangeTo) + oneDayInMS
    : getOffsetTime() + oneDayInMS

  const students = await User.aggregate([
    {
      $match: query
    },
    {
      $project: {
        email: 1,
        pastSessions: 1,
        firstName: '$firstname',
        lastName: '$lastname',
        createdAt: 1,
        totalSessions: { $size: '$pastSessions' },
        partnerSite: 1,
        approvedHighschool: 1
      }
    },
    {
      $lookup: {
        from: 'sessions',
        localField: 'pastSessions',
        foreignField: '_id',
        as: 'session'
      }
    },
    {
      $unwind: {
        path: '$session',
        preserveNullAndEmptyArrays: true
      }
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
                  { $eq: ['$studentId', '$$studentId'] }
                ]
              }
            }
          }
        ],
        as: 'feedback'
      }
    },
    {
      $addFields: {
        lastMessage: { $arrayElemAt: ['$session.messages', -1] },
        sessionLength: {
          $cond: [
            { $ifNull: ['$session.volunteerJoinedAt', false] },
            { $subtract: ['$session.endedAt', '$session.volunteerJoinedAt'] },
            0
          ]
        }
      }
    },
    {
      $addFields: {
        isWithinDateRange: {
          $cond: [
            {
              $and: [
                {
                  $gte: ['$session.createdAt', new Date(sessionRangeFrom)]
                },
                {
                  $lte: ['$session.createdAt', new Date(sessionRangeTo)]
                }
              ]
            },
            true,
            false
          ]
        },
        sessionLength: {
          $switch: {
            branches: [
              {
                case: {
                  $lt: ['$sessionLength', 0]
                },
                then: 0
              },
              {
                case: {
                  $gte: ['$sessionLength', 60 * (1000 * 60)]
                },
                then: {
                  $cond: [
                    {
                      $ifNull: ['$lastMessage', false]
                    },
                    {
                      $subtract: [
                        '$lastMessage.createdAt',
                        '$session.volunteerJoinedAt'
                      ]
                    },
                    0
                  ]
                }
              }
            ],
            default: '$sessionLength'
          }
        }
      }
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
              0
            ]
          }
        },
        sessionsOverRange: {
          $sum: {
            $cond: [{ $ifNull: ['$isWithinDateRange', false] }, 1, 0]
          }
        },
        partnerSite: { $first: '$partnerSite' },
        approvedHighschool: { $max: '$approvedHighschool' }
      }
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        email: 1,
        joinDate: '$createdAt',
        totalSessions: 1,
        totalMinutes: {
          $round: [{ $divide: ['$sessionLength', 60000] }, 2]
        },
        sessionsOverDateRange: '$sessionsOverRange',
        minsOverDateRange: {
          $round: [{ $divide: ['$range', 60000] }, 2]
        },
        feedback: 1,
        partnerSite: 1,
        approvedHighschool: 1,
        _id: 0
      }
    },
    {
      $sort: {
        joinDate: 1
      }
    }
  ]).read('secondaryPreferred')

  const partnerSites =
    studentPartnerManifests[studentPartnerOrg] &&
    studentPartnerManifests[studentPartnerOrg].sites

  const studentUsage = students.map(student => {
    const feedback = Array.from(student.feedback)

    const dataFormat = {
      'First name': student.firstName,
      'Last name': student.lastName,
      Email: student.email,
      'Join date': formatDate(student.joinDate),
      'Total sessions': student.totalSessions,
      'Total minutes': student.totalMinutes,
      'Average session rating': calcAverageRating(feedback),
      'Sessions over date range': student.sessionsOverDateRange,
      'Minutes over date range': student.minsOverDateRange
    }

    if (partnerSites)
      dataFormat['Partner site'] = student.partnerSite
        ? student.partnerSite
        : '-'

    if (studentPartnerOrg) {
      if (student.approvedHighschool) dataFormat['HS/College'] = 'High school'
      else dataFormat['HS/College'] = 'College'
    }

    return dataFormat
  })

  return studentUsage
}

const subjectMappings = {
  prealgebra: 1718,
  algebraOne: 1719,
  algebra: 1719,
  algebraTwo: 1719,
  geometry: 406,
  trigonometry: 406,
  precalculus: 406,
  calculusAB: 2862,
  essays: 1720,
  planning: 1720,
  applications: 1720,
  biology: 2211,
  chemistry: 2211,
  integratedMathOne: 406,
  integratedMathTwo: 406,
  integratedMathThree: 406,
  integratedMathFour: 406,
  statistics: 2865,
  environmentalScience: 2863,
  physicsOne: 2864,
  physicsTwo: 2864,
  calculusBC: 2862,
  upchieve101: 406,
  calculus: 2862,
  physics: 2864
}

export const generateVolunteerPartnerReport = async ({
  partnerOrg,
  fromDate,
  toDate
}) => {
  try {
    const subjectMappingsCapped = {}
    for (const key in subjectMappings) {
      subjectMappingsCapped[key.toUpperCase()] = subjectMappings[key]
    }
    const dateQuery = { $gt: new Date(fromDate), $lte: new Date(toDate) }
    const volunteers = await VolunteerService.getVolunteers(
      {
        isTestUser: false,
        isFakeUser: false,
        volunteerPartnerOrg: partnerOrg,
        isOnboarded: true,
        isApproved: true
      },
      {
        _id: 1,
        createdAt: 1,
        firstname: 1,
        lastname: 1,
        email: 1,
        certifications: 1,
        volunteerPartnerOrg: 1,
        elapsedAvailability: 1
      }
    )
    const volunteerPartnerReport = []

    for (const volunteer of volunteers) {
      const totalCerts = countCerts(volunteer.certifications)
      if (totalCerts === 0) continue

      const volunteerFirstName = capitalize(volunteer.firstname)
      const volunterLastName = capitalize(volunteer.lastname)
      const partnerOrgName =
        volunteerPartnerManifests[volunteer.volunteerPartnerOrg].name

      // Add a row for each quiz a volunteer has passed during the given time period
      // @todo: figure out how the type annotation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const quizPassedActions: any = await UserActionService.getActionsWithPipeline(
        [
          {
            $match: {
              user: ObjectId(volunteer._id),
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

      // @note: Keep track of total active volunteer hours for a given hour. This helps ensure that
      //        the elapsed availability hours do not overlap with the other active volunteer hours
      //        that are credited to the volunteer
      // [month-day-year-hour]: number
      const accumulatedVolunteerHoursForHour = {}

      for (const quizPassed of quizPassedActions) {
        // @note: Availability is stored in EST time. In order to match to one's
        //        availability hours, createdAt must be in EST time as well.
        const createdAtFormatted = moment(quizPassed.createdAt)
          .tz('America/New_York')
          .format('MM-DD-YYYY')
        const createdAtHour = moment(quizPassed.createdAt)
          .tz('America/New_York')
          .format('H')
        const createdAtHourFormatted = UTC_TO_HOUR_MAPPING[createdAtHour]
        const hourKey = `${createdAtFormatted}-${createdAtHourFormatted}`
        const row = {}
        row['Event ID'] = subjectMappingsCapped[quizPassed.quizSubcategory]
        // use the following Monday of the createdAt as the Date Volunteered
        row['Date Volunteered'] = moment(quizPassed.createdAt).format(
          'MM/DD/YYYY'
        )
        row['Hours Credited'] = 1.0
        row['Start Time'] = null
        row['End Time'] = null
        row['Full Employee Name'] = `${volunteerFirstName} ${volunterLastName}`
        row[`External ${partnerOrgName} Email`] = volunteer.email
        row['Classification'] = 'Training Event'
        volunteerPartnerReport.push(row)
        accumulatedVolunteerHoursForHour[hourKey] = 1
      }

      // Add a row for each session a volunteer has had during the given time period
      const sessions = await SessionService.getSessionsWithPipeline([
        {
          $sort: {
            createdAt: 1
          }
        },
        {
          $match: {
            volunteer: ObjectId(volunteer._id),
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
            subTopic: 1,
            timeTutored: 1
          }
        }
      ])

      for (const session of sessions) {
        const timeTutoredInMins = session.timeTutored / (1000 * 60)
        // @todo: make a param to change the interval based on query
        const roundedTimeTutoredInMins = roundUpToNearestInterval(
          timeTutoredInMins,
          15
        )
        const timeTutoredInHours = Number(
          (roundedTimeTutoredInMins / 60).toFixed(2)
        )
        // @note: Availability is stored in EST time. In order to match to one's
        //        availability hours, createdAt must be in EST time as well.
        const createdAtFormatted = moment(session.createdAt)
          .tz('America/New_York')
          .format('MM-DD-YYYY')
        const createdAtHour = moment(session.createdAt)
          .tz('America/New_York')
          .format('H')
        const createdAtHourFormatted = UTC_TO_HOUR_MAPPING[createdAtHour]
        const hourKey = `${createdAtFormatted}-${createdAtHourFormatted}`

        const row = {}
        row['Event ID'] = subjectMappings[session.subTopic]
        row['Date Volunteered'] = moment(session.createdAt).format('MM/DD/YYYY')
        row['Hours Credited'] = Number(
          (roundedTimeTutoredInMins / 60).toFixed(2)
        )
        row['Start Time'] = null
        row['End Time'] = null
        row['Full Employee Name'] = `${volunteerFirstName} ${volunterLastName}`
        row[`External ${partnerOrgName} Email`] = volunteer.email
        row['Classification'] = 'Tutoring Event'
        volunteerPartnerReport.push(row)
        if (accumulatedVolunteerHoursForHour[hourKey])
          accumulatedVolunteerHoursForHour[hourKey] += timeTutoredInHours
        else accumulatedVolunteerHoursForHour[hourKey] = timeTutoredInHours
      }

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

      for (const availability of availabilityForDateRange) {
        let elapsedAvailabilityForDay = AvailabilityService.getElapsedAvailability(
          availability.availability
        )

        if (elapsedAvailabilityForDay === 0) continue

        const createdAtFormatted = moment(availability.date)
          .tz('America/New_York')
          .format('MM-DD-YYYY')

        const availabilityHours = Object.entries(availability.availability)
        for (const [hour, isAvailable] of availabilityHours) {
          const hourKey = `${createdAtFormatted}-${hour}`
          if (isAvailable && accumulatedVolunteerHoursForHour[hourKey])
            elapsedAvailabilityForDay -=
              accumulatedVolunteerHoursForHour[hourKey]
        }

        const row = {}
        row['Event ID'] = 406
        row['Date Volunteered'] = moment(availability.date).format('MM/DD/YYYY')
        // @todo: add a function param to change the ratio of elapsed availability
        row['Hours Credited'] = elapsedAvailabilityForDay
        row['Start Time'] = null
        row['End Time'] = null
        row['Full Employee Name'] = `${volunteerFirstName} ${volunterLastName}`
        row[`External ${partnerOrgName} Email`] = volunteer.email
        row['Classification'] = 'Weekly Elapsed Availability'
        volunteerPartnerReport.push(row)
      }
    }
    return volunteerPartnerReport
  } catch (error) {
    logger.error(error)
    throw new Error(error.message)
  }
}
