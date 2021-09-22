import moment from 'moment-timezone'
import { values } from 'lodash'
import { Aggregate, Document, model, Model, Schema, Types } from 'mongoose'
import {
  FEEDBACK_VERSIONS,
  USER_SESSION_METRICS,
  USER_ACTION,
  SUBJECT_TYPES
} from '../constants'
import MessageModel, { Message } from './Message'
import { Notification } from './Notification'
import { User } from './User'
import { Student } from './Student'
import { Volunteer } from './Volunteer'
import { DocUpdateError, DocCreationError, LookupError } from './Errors'

const validTypes = [
  SUBJECT_TYPES.MATH,
  SUBJECT_TYPES.COLLEGE,
  SUBJECT_TYPES.SCIENCE,
  SUBJECT_TYPES.SAT,
  SUBJECT_TYPES.READING_WRITING
]

export interface Session {
  _id: Types.ObjectId
  student: Types.ObjectId | Student
  volunteer: Types.ObjectId | Volunteer
  type: string
  subTopic: string
  messages: Message[]
  hasWhiteboardDoc?: boolean
  whiteboardDoc?: string
  quillDoc: string
  createdAt: Date
  volunteerJoinedAt: Date
  failedJoins: (Types.ObjectId | User)[]
  endedAt: Date
  endedBy: Types.ObjectId | User
  notifications: (Types.ObjectId | Notification)[]
  photos: string[]
  isReported: boolean
  reportReason: string
  reportMessage: string
  flags: string[]
  reviewed: boolean
  toReview: boolean
  reviewReasons: USER_SESSION_METRICS[]
  timeTutored: number
}

export type SessionDocument = Session & Document

const sessionSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User'
    // TODO: validate isVolunteer: false
  },
  volunteer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
    // TODO: validate isVolunteer: true
  },
  type: {
    type: String,
    validate: {
      validator: function(v): boolean {
        const type = v.toLowerCase()
        return validTypes.some(function(validType) {
          return validType.toLowerCase() === type
        })
      },
      message: '{VALUE} is not a valid type'
    }
  },

  subTopic: {
    type: String,
    default: ''
  },

  messages: [MessageModel.schema],

  hasWhiteboardDoc: {
    type: Boolean
  },

  quillDoc: {
    type: String,
    default: '',
    select: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  volunteerJoinedAt: {
    type: Date
  },

  failedJoins: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],

  endedAt: {
    type: Date
  },

  endedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  notifications: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Notification'
    }
  ],

  photos: [String],
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: String,
  reportMessage: String,
  flags: {
    type: [String],
    enum: values(USER_SESSION_METRICS)
  },
  reviewed: { type: Boolean, default: false },
  toReview: { type: Boolean, default: false },
  reviewReasons: {
    type: [String],
    enum: values(USER_SESSION_METRICS)
  },
  timeTutored: { type: Number, default: 0 },
  isStudentBanned: Boolean
})

export interface SessionStaticModel extends Model<SessionDocument> {
  getUnfulfilledSessions(): Promise<SessionDocument[]>
}

const SessionModel = model<SessionDocument, SessionStaticModel>(
  'Session',
  sessionSchema
)

/** SessionRepo functions below */
export async function addNotifications(sessionId, notificationsToAdd) {
  const query = { _id: sessionId }
  const update = {
    $push: { notifications: { $each: notificationsToAdd } }
  }
  try {
    await SessionModel.updateOne(query, update)
  } catch (error) {
    throw new DocUpdateError(error, query, update)
  }
}

interface UnfulfilledSessions {
  _id: Types.ObjectId
  student: Partial<Student>
  subTopic: string
  createdAt: Date
  type: string
  volunteer: Types.ObjectId
}

// @todo: break this query apart to utilize Repo layer
// sessions that have not yet been fulfilled by a volunteer
export async function getUnfulfilledSessions(): Promise<UnfulfilledSessions[]> {
  // @note: this query is sorted in memory and uses the volunteer: 1, endedAt: 1 index
  const query = {
    volunteer: { $exists: false },
    endedAt: { $exists: false },
    createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    isStudentBanned: false
  }

  const sessions = (await SessionModel.find(query)
    .populate({
      path: 'student',
      select: 'firstname isTestUser pastSessions'
    })
    .sort({ createdAt: -1 })
    .select({ student: 1, subTopic: 1, createdAt: 1, type: 1 })
    .lean()
    .exec()) as UnfulfilledSessions[]

  const oneMinuteAgo = moment().subtract(1, 'minutes')

  return sessions.filter(session => {
    const isNewStudent =
      session.student.pastSessions && session.student.pastSessions.length === 0
    const wasSessionCreatedAMinuteAgo = moment(oneMinuteAgo).isBefore(
      session.createdAt
    )
    // Don't show new students' sessions for a minute (they often cancel immediately)
    if (isNewStudent && wasSessionCreatedAMinuteAgo) return false
    return true
  })
}

export async function getSessionById(
  sessionId: Types.ObjectId | string,
  projection = {}
): Promise<Session> {
  const session = await SessionModel.findOne({ _id: sessionId })
    .select(projection)
    .lean()
    .exec()
  if (!session) throw new LookupError('Session not found')

  return session
}

// @todo: move queries using this pipeline to this repo
export function getSessionsWithPipeline(pipeline) {
  return (SessionModel.aggregate(pipeline) as unknown) as Promise<any[]>
}

export async function updateFlags(
  sessionId: Types.ObjectId | string,
  flags: USER_SESSION_METRICS[]
): Promise<void> {
  const query = { _id: sessionId }
  const update = {
    $addToSet: { flags: { $each: flags } }
  }
  try {
    await SessionModel.updateOne(query, update)
  } catch (error) {
    throw new DocUpdateError(error, query, update)
  }
}

export async function updateReviewReasons(
  sessionId: Types.ObjectId | string,
  reviewReasons: USER_SESSION_METRICS[]
): Promise<void> {
  const query = { _id: sessionId }
  const update = {
    toReview: true,
    $addToSet: { reviewReasons: { $each: reviewReasons } }
  }
  try {
    await SessionModel.updateOne(query, update)
  } catch (error) {
    throw new DocUpdateError(error, query, update)
  }
}

export async function updateFailedJoins(
  sessionId: Types.ObjectId | string,
  userId: Types.ObjectId
): Promise<void> {
  const query = { _id: sessionId }
  const update = { $addToSet: { failedJoins: userId } }
  try {
    await SessionModel.updateOne(query, update)
  } catch (error) {
    throw new DocUpdateError(error, query, update)
  }
}

export async function updateReviewedStatus(
  sessionId: Types.ObjectId | string,
  { reviewed, toReview }: { reviewed: boolean; toReview: boolean }
): Promise<void> {
  const query = { _id: sessionId }
  const update = {
    reviewed,
    toReview
  }
  try {
    await SessionModel.updateOne(query, update)
  } catch (error) {
    throw new DocUpdateError(error, query, update)
  }
}

export async function getSessionToEnd(sessionId: Types.ObjectId | string) {
  // @todo: fix type annotation
  let session
  try {
    session = await SessionModel.findOne({ _id: sessionId })
      .populate({ path: 'student', select: 'pastSessions firstname email' })
      .populate({
        path: 'volunteer',
        select: 'pastSessions firstname email volunteerPartnerOrg'
      })
      .lean()
      .exec()
    if (!session) throw new LookupError('Session not found')
    return {
      _id: session._id,
      createdAt: session.createdAt,
      endedAt: session.endedAt,
      isReported: session.isReported,
      messages: session.messages,
      type: session.type,
      subTopic: session.subTopic,
      student: {
        _id: session.student._id,
        firstname: session.student.firstname,
        email: session.student.email,
        pastSessions: session.student.pastSessions
      },
      volunteer: {
        // @note: uses optional chaining operator
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
        _id: session.volunteer?._id,
        firstname: session.volunteer?.firstname,
        email: session.volunteer?.email,
        pastSessions: session.volunteer?.pastSessions,
        volunteerPartnerOrg: session.volunteer?.volunteerPartnerOrg
      },
      volunteerJoinedAt: session.volunteerJoinedAt
    }
  } catch (error) {
    throw error
  }
}

interface SessionsToReview {
  createdAt: Date
  endedAt: Date
  volunteer?: Types.ObjectId
  totalMessages: number
  type: string
  subTopic: string
  studentFirstName: string
  isReported: boolean
  flags: string[]
}

export async function getSessionsToReview({
  query,
  skip,
  limit
}): Promise<SessionsToReview[]> {
  try {
    return (await SessionModel.aggregate([
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $match: query
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
        $lookup: {
          from: 'users',
          localField: 'volunteer',
          foreignField: '_id',
          as: 'volunteer'
        }
      },
      {
        $unwind: {
          path: '$volunteer',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          hasTestUser: {
            $cond: [
              {
                $or: [
                  {
                    $eq: ['$student.isTestUser', true]
                  },
                  {
                    $eq: ['$volunteer.isTestUser', true]
                  }
                ]
              },
              true,
              false
            ]
          }
        }
      },
      {
        $match: {
          hasTestUser: false
        }
      },
      {
        $project: {
          createdAt: 1,
          endedAt: 1,
          volunteer: { $ifNull: ['$volunteer._id', null] },
          totalMessages: { $size: '$messages' },
          type: 1,
          subTopic: 1,
          studentFirstName: '$student.firstname',
          isReported: 1,
          flags: 1,
          reviewReasons: 1
        }
      }
    ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)) as SessionsToReview[]
  } catch (error) {
    throw error
  }
}

interface TotalTimeTutoredForDateRange {
  timeTutored: number
}

export async function getTotalTimeTutoredForDateRange(
  volunteerId,
  startDate,
  endDate
): Promise<TotalTimeTutoredForDateRange[]> {
  try {
    return await SessionModel.aggregate([
      {
        $sort: { createdAt: -1 }
      },
      {
        $match: {
          volunteer: Types.ObjectId(volunteerId),
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $project: {
          timeTutored: 1
        }
      },
      {
        $group: {
          _id: null,
          timeTutored: {
            $sum: '$timeTutored'
          }
        }
      }
    ])
  } catch (error) {
    throw error
  }
}

export async function getActiveSessionsWithVolunteers() {
  try {
    return await SessionModel.find({
      endedAt: { $exists: false },
      volunteer: { $exists: true }
    })
      .select('volunteer')
      .lean()
      .exec()
  } catch (error) {
    throw error
  }
}

export async function updateReportSession(
  sessionId: Types.ObjectId | string,
  report: { reportReason: string; reportMessage: string }
) {
  const query = { _id: sessionId }
  const update = {
    isReported: true,
    reportReason: report.reportReason,
    reportMessage: report.reportMessage
  }
  try {
    await SessionModel.updateOne(query, update)
  } catch (error) {
    throw new DocUpdateError(error, query, update)
  }
}

export async function updateSessionMetrics(
  sessionId: Types.ObjectId | string,
  metrics: { timeTutored: number }
) {
  const query = { _id: sessionId }
  const update = {
    timeTutored: metrics.timeTutored
  }
  try {
    await SessionModel.updateOne(query, update)
  } catch (error) {
    throw new DocUpdateError(error, query, update)
  }
}

export async function setQuillDoc(
  sessionId: Types.ObjectId | string,
  quillDoc: string
) {
  const query = { _id: sessionId }
  const update = {
    quillDoc
  }
  try {
    await SessionModel.updateOne(query, update)
  } catch (error) {
    throw new DocUpdateError(error, query, update)
  }
}

export async function setHasWhiteboardDoc(
  sessionId: Types.ObjectId | string,
  hasWhiteboardDoc: boolean
) {
  const query = { _id: sessionId }
  const update = {
    hasWhiteboardDoc
  }
  try {
    await SessionModel.updateOne(query, update)
  } catch (error) {
    throw new DocUpdateError(error, query, update)
  }
}

export async function updateSessionToEnd(
  sessionId: Types.ObjectId | string,
  data: {
    endedAt: Date
    endedBy: Types.ObjectId
  }
) {
  const query = { _id: sessionId }
  const update = {
    endedAt: data.endedAt,
    endedBy: data.endedBy
  }

  try {
    await SessionModel.updateOne(query, update)
  } catch (error) {
    throw new DocUpdateError(error, query, update)
  }
}

export async function getLongRunningSessions(startDate, endDate) {
  try {
    return await SessionModel.find({
      endedAt: { $exists: false },
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
      .lean()
      .exec()
  } catch (error) {
    throw error
  }
}

export async function addSessionPhotoKey(
  sessionId: Types.ObjectId | string,
  photoKey: string
) {
  const query = { _id: sessionId }
  const update = { $push: { photos: photoKey } }
  try {
    await SessionModel.updateOne(query, update)
  } catch (error) {
    throw new DocUpdateError(error, query, update)
  }
}

interface PublicSession {
  _id: Types.ObjectId
  student: { _id: Types.ObjectId; firstName: string }
  volunteer: {
    _id: Types.ObjectId
    firstName: string
  }
  type: string
  subTopic: string
  createdAt: Date
  endedAt: Date
}

export async function getPublicSession(sessionId) {
  try {
    return (await SessionModel.aggregate([
      { $match: { _id: Types.ObjectId(sessionId) } },
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
        $lookup: {
          from: 'users',
          localField: 'volunteer',
          foreignField: '_id',
          as: 'volunteer'
        }
      },
      {
        $unwind: '$volunteer'
      },
      {
        $project: {
          student: { _id: '$student._id', firstName: '$student.firstname' },
          volunteer: {
            _id: '$volunteer._id',
            firstName: '$volunteer.firstname'
          },
          type: 1,
          subTopic: 1,
          createdAt: 1,
          endedAt: 1
        }
      }
    ])) as PublicSession[]
  } catch (error) {
    throw error
  }
}

export interface AdminFilteredSessions {
  createdAt: Date
  endedAt: Date
  volunteer: Partial<Volunteer>
  totalMessages: number
  type: string
  subTopic: string
  student: Partial<Student>
  studentFirstName: string
  studentRating: number
}

export async function getAdminFilteredSessions({
  startDate,
  endDate,
  minMessagesSent,
  sessionQueryFilter,
  ratingQueryFilter,
  userQueryFilter,
  showBannedUsers,
  skip,
  limit
}): Promise<AdminFilteredSessions[]> {
  try {
    return (await SessionModel.aggregate([
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $match: {
          // Filter by a specific date range the sessions took place
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          // Filter a session by the amount of messages sent
          $expr: {
            $gte: [{ $size: '$messages' }, parseInt(minMessagesSent)]
          }
        }
      },
      {
        $project: {
          createdAt: 1,
          endedAt: 1,
          volunteer: { $ifNull: ['$volunteer', null] },
          totalMessages: { $size: '$messages' },
          type: 1,
          subTopic: 1,
          student: 1,
          isReported: 1
        }
      },
      {
        $addFields: {
          // Add the length of a session on the session documents
          sessionLength: {
            $cond: {
              if: { $ifNull: ['$endedAt', undefined] },
              then: { $subtract: ['$endedAt', '$createdAt'] },
              // $$NOW is a mongodb system variable which returns the current time
              else: { $subtract: ['$$NOW', '$createdAt'] }
            }
          },
          volunteer: {
            $cond: {
              if: { $ifNull: ['$volunteer', undefined] },
              then: '$volunteer',
              else: null
            }
          }
        }
      },
      {
        $match: sessionQueryFilter
      },
      {
        $lookup: {
          from: 'feedbacks',
          localField: '_id',
          foreignField: 'sessionId',
          as: 'feedbacks'
        }
      },
      // add student and volunteer feedback if present
      {
        $addFields: {
          studentFeedback: {
            $filter: {
              input: '$feedbacks',
              as: 'feedback',
              cond: { $eq: ['$$feedback.userType', 'student'] }
            }
          },
          volunteerFeedback: {
            $filter: {
              input: '$feedbacks',
              as: 'feedback',
              cond: { $eq: ['$$feedback.userType', 'volunteer'] }
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
        $unwind: {
          path: '$volunteerFeedback',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          studentRating: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      {
                        $eq: [
                          '$studentFeedback.versionNumber',
                          FEEDBACK_VERSIONS.ONE
                        ]
                      },
                      '$studentFeedback.responseData.rate-session.rating'
                    ]
                  },
                  then: '$studentFeedback.responseData.rate-session.rating'
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [
                          '$studentFeedback.versionNumber',
                          FEEDBACK_VERSIONS.TWO
                        ]
                      },
                      '$studentFeedback.studentCounselingFeedback.rate-session.rating'
                    ]
                  },
                  then:
                    '$studentFeedback.studentCounselingFeedback.rate-session.rating'
                }
              ],
              default: null
            }
          },
          volunteerRating: {
            $cond: {
              if: {
                $and: [
                  {
                    $eq: [
                      '$volunteerFeedback.versionNumber',
                      FEEDBACK_VERSIONS.ONE
                    ]
                  },
                  '$volunteerFeedback.responseData.rate-session.rating'
                ]
              },
              then: '$volunteerFeedback.responseData.rate-session.rating',
              else: null
            }
          }
        }
      },
      {
        $match: ratingQueryFilter
      },
      {
        $lookup: {
          from: 'users',
          let: {
            studentId: '$student'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$studentId']
                }
              }
            },
            {
              $project: {
                firstname: 1,
                isBanned: 1,
                isTestUser: 1,
                totalPastSessions: { $size: '$pastSessions' }
              }
            }
          ],
          as: 'student'
        }
      },
      {
        $unwind: '$student'
      },
      {
        $lookup: {
          from: 'users',
          let: {
            volunteerId: '$volunteer'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$volunteerId']
                }
              }
            },
            {
              $project: {
                firstname: 1,
                totalPastSessions: { $size: '$pastSessions' }
              }
            }
          ],
          as: 'volunteer'
        }
      },
      {
        $unwind: {
          path: '$volunteer',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: userQueryFilter
      },
      {
        $lookup: {
          from: 'useractions',
          let: { userId: '$student._id' },
          pipeline: [
            // Get user actions with 'BANNED' per session
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$userId'] },
                    { $eq: ['$action', USER_ACTION.ACCOUNT.BANNED] }
                  ]
                }
              }
            }
          ],
          as: 'bannedUserAction'
        }
      },
      {
        $addFields: {
          // Retrieve the most recent 'BANNED' user action
          lastBannedAt: { $max: '$bannedUserAction.createdAt' }
        }
      },
      {
        // Show sessions that were created before a user has been banned
        // If showBannedUsers is true, show all sessions up to chosen date
        $addFields: {
          showSession: {
            $cond: {
              if: {
                $or: [
                  { $eq: ['$lastBannedAt', undefined] },
                  { $eq: ['$student.isBanned', false] }
                ]
              },
              then: true,
              else: {
                $cond: [
                  {
                    $lte: [
                      '$createdAtEstTime',
                      showBannedUsers ? new Date(endDate) : '$lastBannedAt'
                    ]
                  },
                  true,
                  false
                ]
              }
            }
          }
        }
      },
      {
        $match: {
          showSession: true
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $project: {
          createdAt: 1,
          endedAt: 1,
          volunteer: 1,
          totalMessages: 1,
          type: 1,
          subTopic: 1,
          student: 1,
          studentFirstName: '$student.firstname',
          studentRating: 1
        }
      }
    ])) as AdminFilteredSessions[]
  } catch (error) {
    throw error
  }
}

export type SessionWithPopulatedUsers = Omit<
  Session,
  'student' | 'volunteer'
> & {
  student: Partial<Student>
  volunteer: Partial<Volunteer>
}

export async function getSessionByIdWithStudentAndVolunteer(
  sessionId: Types.ObjectId | string
) {
  try {
    const session = (await SessionModel.findOne({ _id: sessionId })
      .populate('student volunteer')
      .select('+quillDoc')
      .lean()
      .exec()) as SessionWithPopulatedUsers

    if (!session) throw new LookupError('No session found')

    return {
      _id: session._id,
      student: {
        _id: session.student._id,
        isVolunteer: session.student.isVolunteer,
        firstname: session.student.firstname,
        pastSessions: session.student.pastSessions,
        createdAt: session.student.createdAt
      },
      volunteer:
        session.volunteer && session.volunteer.firstname
          ? {
              _id: session.volunteer?._id,
              isVolunteer: session.volunteer?.isVolunteer,
              firstname: session.volunteer?.firstname,
              pastSessions: session.volunteer?.pastSessions,
              createdAt: session.volunteer?.createdAt
            }
          : null,
      subTopic: session.subTopic,
      type: session.type,
      messages: session.messages,
      hasWhiteboardDoc: session.hasWhiteboardDoc,
      whiteboardDoc: session.whiteboardDoc,
      quillDoc: session.quillDoc,
      createdAt: session.createdAt,
      volunteerJoinedAt: session.volunteerJoinedAt,
      failedJoins: session.failedJoins,
      endedAt: session.endedAt,
      endedBy: session.endedBy,
      notifications: session.notifications,
      photos: session.photos,
      isReported: session.isReported,
      reportReason: session.reportReason,
      reportMessage: session.reportMessage,
      flags: session.flags,
      reviewed: session.reviewed,
      toReview: session.toReview,
      reviewReasons: session.reviewReasons,
      timeTutored: session.timeTutored
    }
  } catch (error) {
    throw error
  }
}

export async function createSession({
  studentId,
  type,
  subTopic,
  isStudentBanned
}) {
  const session = new SessionModel({
    student: studentId,
    type: type,
    subTopic: subTopic,
    isStudentBanned
  })
  try {
    const newSession = await session.save()
    return {
      _id: newSession._id,
      type: newSession.type,
      subTopic: newSession.subTopic,
      student: newSession.student
    }
  } catch (error) {
    throw new DocCreationError(error.message)
  }
}

export async function getCurrentSession(userId) {
  try {
    const session = (await SessionModel.findOne({
      $or: [{ student: userId }, { volunteer: userId }],
      endedAt: { $exists: false }
    })
      .sort({ createdAt: -1 })
      .populate({ path: 'volunteer', select: 'firstname isVolunteer' })
      .populate({ path: 'student', select: 'firstname isVolunteer' })
      .lean()
      .exec()) as SessionWithPopulatedUsers

    if (!session) return null

    return {
      _id: session._id,
      student: {
        _id: session.student._id.toString(),
        firstname: session.student.firstname,
        isVolunteer: session.student.isVolunteer
      },
      volunteer:
        session.volunteer && session.volunteer.firstname
          ? {
              _id: session.volunteer?._id.toString(),
              firstname: session.volunteer?.firstname,
              isVolunteer: session.volunteer?.isVolunteer
            }
          : null,
      subTopic: session.subTopic,
      type: session.type,
      messages: session.messages,
      createdAt: session.createdAt,
      endedAt: session.endedAt && session.endedAt,
      volunteerJoinedAt: session.volunteerJoinedAt
    }
  } catch (error) {
    throw error
  }
}

// @todo: refactor. the client only needs the session's createdAt.
//        this is used to show the wait time banner on the dashboard
//        after a student requests a session.
export async function getStudentLatestSession(studentId) {
  try {
    const session = await SessionModel.findOne({ student: studentId })
      .sort({ createdAt: -1 })
      .lean()
      .exec()

    if (!session) throw new LookupError('No session found')

    return {
      _id: session._id.toString(),
      createdAt: session.createdAt.toISOString()
    }
  } catch (error) {
    throw error
  }
}

export async function addVolunteerToSession(sessionId, volunteerId) {
  const query = { _id: sessionId }
  const update = {
    volunteerJoinedAt: new Date(),
    volunteer: volunteerId
  }
  try {
    await SessionModel.updateOne(query, update)
  } catch (error) {
    throw new DocUpdateError(error, query, update)
  }
}

export async function addMessage(sessionId, message) {
  const query = { _id: sessionId }
  const update = { $push: { messages: message } }
  try {
    await SessionModel.updateOne(query, update)
  } catch (error) {
    throw new DocUpdateError(error, query, update)
  }
}

export interface SessionsWithAvgWaitTimePerDayAndHour {
  _id: string
  averageWaitTime: number
  day: number
  hour: number
}

export function getSessionsWithAvgWaitTimePerDayAndHour(
  startDate: Date,
  endDate: Date
) {
  return SessionModel.aggregate([
    {
      $match: {
        createdAt: {
          $gt: startDate,
          $lt: endDate
        }
      }
    },
    {
      $project: {
        createdAt: 1,
        sessionLength: { $subtract: ['$endedAt', '$createdAt'] },
        dayCreatedAt: {
          $isoDayOfWeek: '$createdAt'
        },
        hourCreatedAt: {
          $hour: '$createdAt'
        },
        waitTime: {
          $cond: {
            if: '$volunteer',
            then: { $subtract: ['$volunteerJoinedAt', '$createdAt'] },
            else: { $subtract: ['$endedAt', '$createdAt'] }
          }
        }
      }
    },
    {
      $match: {
        // exclude sessions less than one minute in length
        sessionLength: {
          $gt: 1000 * 60
        }
      }
    },
    {
      $addFields: {
        dayHourCompoundKey: {
          $concat: [
            {
              $toString: '$dayCreatedAt'
            },
            '-',
            {
              $toString: '$hourCreatedAt'
            }
          ]
        }
      }
    },
    {
      $group: {
        _id: '$dayHourCompoundKey',
        averageWaitTime: {
          $avg: '$waitTime'
        },
        day: {
          $first: '$dayCreatedAt'
        },
        hour: {
          $first: '$hourCreatedAt'
        }
      }
    }
  ]) as Aggregate<SessionsWithAvgWaitTimePerDayAndHour[]>
}

export default SessionModel
