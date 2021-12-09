import moment from 'moment'
import 'moment-timezone'
import { Types } from 'mongoose'
import {
  FEEDBACK_VERSIONS,
  SUBJECT_TYPES,
  USER_ACTION,
  USER_SESSION_METRICS,
} from '../../constants'
import {
  DocCreationError,
  DocUpdateError,
  LookupError,
  RepoReadError,
} from '../Errors'
import { Message } from '../Message'
import { Notification } from '../Notification'
import { Student } from '../Student'
import { getStudentContactInfoById } from '../Student/queries'
import { Volunteer } from '../Volunteer'
import SessionModel, { Session } from './index'

export async function addSessionNotifications(
  sessionId: Types.ObjectId,
  notificationsToAdd: Notification[]
): Promise<void> {
  const query = { _id: sessionId }
  const update = {
    $push: { notifications: { $each: notificationsToAdd } },
  }
  try {
    await SessionModel.updateOne(query, update)
  } catch (error) {
    throw new DocUpdateError(error as Error, query, update)
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

// sessions that have not yet been fulfilled by a volunteer
export async function getUnfulfilledSessions(): Promise<UnfulfilledSessions[]> {
  // @note: this query is sorted in memory and uses the volunteer: 1, endedAt: 1 index
  try {
    const query = {
      volunteer: { $exists: false },
      endedAt: { $exists: false },
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      isStudentBanned: false,
    }

    const sessions = (await SessionModel.find(query)
      .populate({
        path: 'student',
        select: 'firstname isTestUser pastSessions',
      })
      .sort({ createdAt: -1 })
      .select({ student: 1, subTopic: 1, createdAt: 1, type: 1 })
      .lean()
      .exec()) as UnfulfilledSessions[]

    const oneMinuteAgo = moment().subtract(1, 'minutes')

    return sessions.filter(session => {
      const isNewStudent =
        session.student.pastSessions &&
        session.student.pastSessions.length === 0
      const wasSessionCreatedAMinuteAgo = moment(oneMinuteAgo).isBefore(
        session.createdAt
      )
      // Don't show new students' sessions for a minute (they often cancel immediately)
      if (isNewStudent && wasSessionCreatedAMinuteAgo) return false
      return true
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSessionById(
  sessionId: Types.ObjectId
): Promise<Session> {
  const session = await SessionModel.findOne({ _id: sessionId })
    .lean()
    .exec()
  if (!session) throw new LookupError('Session not found')

  return session
}

// TODO: This should not be used - move queries using this pipeline to this repo as custom getters
export function getSessionsWithPipeline(pipeline: any[]) {
  return (SessionModel.aggregate(pipeline) as unknown) as Promise<any[]>
}

export async function updateSessionFlagsById(
  sessionId: Types.ObjectId,
  flags: USER_SESSION_METRICS[]
): Promise<void> {
  const query = { _id: sessionId }
  const update = {
    $addToSet: { flags: { $each: flags } },
  }
  try {
    const result = await SessionModel.updateOne(query, update).exec()
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (error) {
    throw new DocUpdateError(error as Error, query, update)
  }
}

export async function updateSessionReviewReasonsById(
  sessionId: Types.ObjectId,
  reviewReasons: USER_SESSION_METRICS[]
): Promise<void> {
  const query = { _id: sessionId }
  const update = {
    toReview: true,
    $addToSet: { reviewReasons: { $each: reviewReasons } },
  }
  try {
    const result = await SessionModel.updateOne(query, update)
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (error) {
    throw new DocUpdateError(error as Error, query, update)
  }
}

export async function updateSessionFailedJoinsById(
  sessionId: Types.ObjectId,
  userId: Types.ObjectId
): Promise<void> {
  const query = { _id: sessionId }
  const update = { $addToSet: { failedJoins: userId } }
  try {
    const result = await SessionModel.updateOne(query, update)
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (error) {
    throw new DocUpdateError(error as Error, query, update)
  }
}

export async function updateSessionReviewedStatusById(
  sessionId: Types.ObjectId,
  { reviewed, toReview }: { reviewed: boolean; toReview: boolean }
): Promise<void> {
  const query = { _id: sessionId }
  const update = {
    reviewed,
    toReview,
  }
  try {
    const result = await SessionModel.updateOne(query, update)
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (error) {
    throw new DocUpdateError(error as Error, query, update)
  }
}

export type SessionToEndUserInfo =
  | '_id'
  | 'firstname'
  | 'email'
  | 'pastSessions'

export type SessionToEnd = Pick<
  Session,
  | '_id'
  | 'createdAt'
  | 'endedAt'
  | 'isReported'
  | 'messages'
  | 'type'
  | 'subTopic'
  | 'volunteerJoinedAt'
> & {
  student: Pick<Student, SessionToEndUserInfo>
} & { volunteer: Pick<Volunteer, SessionToEndUserInfo | 'volunteerPartnerOrg'> }

export async function getSessionToEndById(
  sessionId: Types.ObjectId
): Promise<SessionToEnd> {
  try {
    const session = (await SessionModel.findOne(
      { _id: sessionId },
      {
        _id: 1,
        createdAt: 1,
        endedAt: 1,
        isReported: 1,
        messages: 1,
        type: 1,
        subTopic: 1,
        student: 1,
        volunteer: 1,
        volunteerJoinedAt: 1,
      }
    )
      .populate({ path: 'student', select: 'pastSessions firstname email' })
      .populate({
        path: 'volunteer',
        select: 'pastSessions firstname email volunteerPartnerOrg',
      })
      .lean()
      .exec()) as SessionToEnd
    if (!session) throw new LookupError('Session not found')
    return session
  } catch (error) {
    if (error instanceof LookupError) throw error
    throw new RepoReadError(error)
  }
}

export interface SessionsToReview {
  createdAt: Date
  endedAt: Date
  volunteer?: Types.ObjectId
  totalMessages: number
  type: string
  subTopic: string
  studentFirstName: string
  isReported: boolean
  flags: string[]
  reviewReasons: USER_SESSION_METRICS[]
}

// TODO: duck type validation - options payload
export async function getSessionsToReview({
  query,
  skip,
  limit,
}: {
  query: {
    toReview: boolean
    reviewed: boolean
  }
  skip: number
  limit: number
}): Promise<SessionsToReview[]> {
  try {
    return (await SessionModel.aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $match: query,
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
        $lookup: {
          from: 'users',
          localField: 'volunteer',
          foreignField: '_id',
          as: 'volunteer',
        },
      },
      {
        $unwind: {
          path: '$volunteer',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          hasTestUser: {
            $cond: [
              {
                $or: [
                  {
                    $eq: ['$student.isTestUser', true],
                  },
                  {
                    $eq: ['$volunteer.isTestUser', true],
                  },
                ],
              },
              true,
              false,
            ],
          },
        },
      },
      {
        $match: {
          hasTestUser: false,
        },
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
          reviewReasons: 1,
        },
      },
    ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)) as SessionsToReview[]
  } catch (error) {
    throw new RepoReadError(error)
  }
}

type TotalTimeTutoredForDateRange = Pick<Session, 'timeTutored'>

export async function getTotalTimeTutoredForDateRange(
  volunteerId: Types.ObjectId,
  startDate: Date,
  endDate: Date
): Promise<TotalTimeTutoredForDateRange[]> {
  try {
    return await SessionModel.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $match: {
          volunteer:
            typeof volunteerId === 'string'
              ? Types.ObjectId(volunteerId)
              : volunteerId,
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $project: {
          timeTutored: 1,
        },
      },
      {
        $group: {
          _id: null,
          timeTutored: {
            $sum: '$timeTutored',
          },
        },
      },
    ])
  } catch (error) {
    throw new RepoReadError(error)
  }
}

export async function getActiveSessionsWithVolunteers(): Promise<Session[]> {
  try {
    return await SessionModel.find({
      endedAt: { $exists: false },
      volunteer: { $exists: true },
    })
      .select('volunteer')
      .lean()
      .exec()
  } catch (error) {
    throw new RepoReadError(error)
  }
}

export async function updateSessionReported(
  sessionId: Types.ObjectId,
  // TODO: duck type validation - repo payload
  report: { reportReason: string; reportMessage: string }
): Promise<void> {
  const query = { _id: sessionId }
  const update = {
    isReported: true,
    reportReason: report.reportReason,
    reportMessage: report.reportMessage,
  }
  try {
    const result = await SessionModel.updateOne(query, update)
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (error) {
    throw new DocUpdateError(error as Error, query, update)
  }
}

export async function updateSessionTimeTutored(
  sessionId: Types.ObjectId,
  timeTutored: number
): Promise<void> {
  const query = { _id: sessionId }
  const update = {
    timeTutored,
  }
  try {
    const result = await SessionModel.updateOne(query, update)
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (error) {
    throw new DocUpdateError(error as Error, query, update)
  }
}

export async function updateSessionQuillDoc(
  sessionId: Types.ObjectId,
  quillDoc: string
): Promise<void> {
  const query = { _id: sessionId }
  const update = {
    quillDoc,
  }
  try {
    const result = await SessionModel.updateOne(query, update)
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (error) {
    throw new DocUpdateError(error as Error, query, update)
  }
}

export async function updateSessionHasWhiteboardDoc(
  sessionId: Types.ObjectId,
  hasWhiteboardDoc: boolean
): Promise<void> {
  const query = { _id: sessionId }
  const update = {
    hasWhiteboardDoc,
  }
  try {
    const result = await SessionModel.updateOne(query, update)
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (error) {
    throw new DocUpdateError(error as Error, query, update)
  }
}

export async function updateSessionToEnd(
  sessionId: Types.ObjectId,
  // TODO: duck type validation
  data: {
    endedAt: Date
    endedBy: Types.ObjectId | null
  }
): Promise<void> {
  const query = { _id: sessionId }
  const update = {
    endedAt: data.endedAt,
    endedBy: data.endedBy,
  }

  try {
    const result = await SessionModel.updateOne(query, update)
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (error) {
    throw new DocUpdateError(error as Error, query, update)
  }
}

export async function getLongRunningSessions(
  startDate: Date,
  endDate: Date
): Promise<Session[]> {
  try {
    return await SessionModel.find({
      endedAt: { $exists: false },
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .lean()
      .exec()
  } catch (error) {
    throw new RepoReadError(error)
  }
}

export async function updateSessionPhotoKey(
  sessionId: Types.ObjectId,
  photoKey: string
): Promise<void> {
  const query = { _id: sessionId }
  const update = { $push: { photos: photoKey } }
  try {
    const result = await SessionModel.updateOne(query, update)
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (error) {
    throw new DocUpdateError(error as Error, query, update)
  }
}

export type PublicSessionUserInfo = '_id' | 'firstname'

export type PublicSession = Pick<
  Session,
  '_id' | 'createdAt' | 'endedAt' | 'type' | 'subTopic'
> & {
  student: Pick<Student, PublicSessionUserInfo>
} & { volunteer: Pick<Volunteer, PublicSessionUserInfo> }

export async function getPublicSessionById(
  sessionId: Types.ObjectId
): Promise<PublicSession | undefined> {
  try {
    const [session] = await SessionModel.aggregate([
      {
        $match: {
          _id: sessionId,
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
        $lookup: {
          from: 'users',
          localField: 'volunteer',
          foreignField: '_id',
          as: 'volunteer',
        },
      },
      {
        $unwind: '$volunteer',
      },
      {
        $project: {
          student: { _id: '$student._id', firstName: '$student.firstname' },
          volunteer: {
            _id: '$volunteer._id',
            firstName: '$volunteer.firstname',
          },
          type: 1,
          subTopic: 1,
          createdAt: 1,
          endedAt: 1,
        },
      },
    ])
    if (session) return session
  } catch (error) {
    throw new RepoReadError(error)
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

// TODO: duck type validation
export async function getAdminFilteredSessions({
  startDate,
  endDate,
  minMessagesSent,
  sessionQueryFilter,
  ratingQueryFilter,
  userQueryFilter,
  showBannedUsers,
  skip,
  limit,
}: {
  startDate: number
  endDate: number
  minMessagesSent: string
  sessionQueryFilter: {
    sessionLength: { $gte: number }
    isReported?: boolean
  }
  ratingQueryFilter: {
    studentRating?: number
    volunteerRating?: number
  }
  userQueryFilter: {
    'student.isTestUser':
      | boolean
      | {
          $in: boolean[]
        }
    $or?: [
      { 'student.totalPastSessions': number },
      { 'volunteer.totalPastSessions': number }
    ]
    'student.totalPastSessions'?: number
    'volunteer.totalPastSessions'?: number
  }
  showBannedUsers: string
  skip: number
  limit: number
}): Promise<AdminFilteredSessions[]> {
  try {
    return (await SessionModel.aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $match: {
          // Filter by a specific date range the sessions took place
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
          // Filter a session by the amount of messages sent
          $expr: {
            $gte: [{ $size: '$messages' }, parseInt(minMessagesSent)],
          },
        },
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
          isReported: 1,
        },
      },
      {
        $addFields: {
          // Add the length of a session on the session documents
          sessionLength: {
            $cond: {
              if: { $ifNull: ['$endedAt', undefined] },
              then: { $subtract: ['$endedAt', '$createdAt'] },
              // $$NOW is a mongodb system variable which returns the current time
              else: { $subtract: ['$$NOW', '$createdAt'] },
            },
          },
          volunteer: {
            $cond: {
              if: { $ifNull: ['$volunteer', undefined] },
              then: '$volunteer',
              else: null,
            },
          },
        },
      },
      {
        $match: sessionQueryFilter,
      },
      {
        $lookup: {
          from: 'feedbacks',
          localField: '_id',
          foreignField: 'sessionId',
          as: 'feedbacks',
        },
      },
      // add student and volunteer feedback if present
      {
        $addFields: {
          studentFeedback: {
            $filter: {
              input: '$feedbacks',
              as: 'feedback',
              cond: { $eq: ['$$feedback.userType', 'student'] },
            },
          },
          volunteerFeedback: {
            $filter: {
              input: '$feedbacks',
              as: 'feedback',
              cond: { $eq: ['$$feedback.userType', 'volunteer'] },
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
        $unwind: {
          path: '$volunteerFeedback',
          preserveNullAndEmptyArrays: true,
        },
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
          volunteerRating: {
            $cond: {
              if: {
                $and: [
                  {
                    $eq: [
                      '$volunteerFeedback.versionNumber',
                      FEEDBACK_VERSIONS.ONE,
                    ],
                  },
                  '$volunteerFeedback.responseData.rate-session.rating',
                ],
              },
              then: '$volunteerFeedback.responseData.rate-session.rating',
              else: null,
            },
          },
        },
      },
      {
        $match: ratingQueryFilter,
      },
      {
        $lookup: {
          from: 'users',
          let: {
            studentId: '$student',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$studentId'],
                },
              },
            },
            {
              $project: {
                firstname: 1,
                isBanned: 1,
                isTestUser: 1,
                totalPastSessions: { $size: '$pastSessions' },
              },
            },
          ],
          as: 'student',
        },
      },
      {
        $unwind: '$student',
      },
      {
        $lookup: {
          from: 'users',
          let: {
            volunteerId: '$volunteer',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$volunteerId'],
                },
              },
            },
            {
              $project: {
                firstname: 1,
                totalPastSessions: { $size: '$pastSessions' },
              },
            },
          ],
          as: 'volunteer',
        },
      },
      {
        $unwind: {
          path: '$volunteer',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: userQueryFilter,
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
                    { $eq: ['$action', USER_ACTION.ACCOUNT.BANNED] },
                  ],
                },
              },
            },
          ],
          as: 'bannedUserAction',
        },
      },
      {
        $addFields: {
          // Retrieve the most recent 'BANNED' user action
          lastBannedAt: { $max: '$bannedUserAction.createdAt' },
        },
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
                  { $eq: ['$student.isBanned', false] },
                ],
              },
              then: true,
              else: {
                $cond: [
                  {
                    $lte: [
                      '$createdAtEstTime',
                      showBannedUsers ? new Date(endDate) : '$lastBannedAt',
                    ],
                  },
                  true,
                  false,
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          showSession: true,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
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
          studentRating: 1,
        },
      },
    ])) as AdminFilteredSessions[]
  } catch (error) {
    throw new RepoReadError(error)
  }
}

export type SessionWithPopulatedUsers = Omit<
  Session,
  'student' | 'volunteer'
> & {
  student: Partial<Student>
  volunteer: Partial<Volunteer>
}

export type SessionByIdWithStudentAndVolunteerUserInfo =
  | '_id'
  | 'firstname'
  | 'createdAt'
  | 'pastSessions'
  | 'isVolunteer'

export type SessionByIdWithStudentAndVolunteer = Session & {
  student: Pick<Student, SessionByIdWithStudentAndVolunteerUserInfo>
} & { volunteer: Pick<Volunteer, SessionByIdWithStudentAndVolunteerUserInfo> }

export async function getSessionByIdWithStudentAndVolunteer(
  sessionId: Types.ObjectId
): Promise<SessionByIdWithStudentAndVolunteer> {
  try {
    const session = (await SessionModel.findOne({ _id: sessionId })
      .populate('student volunteer')
      .populate({
        path: 'student',
        select: 'firstname createdAt pastSessions isVolunteer',
      })
      .populate({
        path: 'volunteer',
        select: 'firstname createdAt pastSessions isVolunteer',
      })
      .select('+quillDoc')
      .lean()
      .exec()) as SessionByIdWithStudentAndVolunteer

    if (!session) throw new LookupError('No session found')
    return session
  } catch (error) {
    if (error instanceof LookupError) throw error
    throw error
  }
}

// TODO: duck type validation
export async function createSession({
  studentId,
  type,
  subTopic,
  isStudentBanned,
}: {
  studentId: Types.ObjectId
  type: SUBJECT_TYPES
  subTopic: string
  isStudentBanned: boolean
}): Promise<Session> {
  // TODO: use model.create
  const session = new SessionModel({
    student: studentId,
    type: type,
    subTopic: subTopic,
    isStudentBanned,
  })
  try {
    const newSession = await session.save()
    return newSession.toObject() as Session
  } catch (error) {
    throw new DocCreationError((error as Error).message)
  }
}

export type CurrentSessionUserInfo = '_id' | 'firstname' | 'isVolunteer'

export type CurrentSession = Session & {
  student: Pick<Student, CurrentSessionUserInfo>
} & { volunteer: Pick<Volunteer, CurrentSessionUserInfo> }

export async function getCurrentSessionById(
  userId: Types.ObjectId
): Promise<CurrentSession | undefined> {
  try {
    const session = (await SessionModel.findOne(
      {
        $or: [{ student: userId }, { volunteer: userId }],
        endedAt: { $exists: false },
      },
      {
        _id: 1,
        student: 1,
        volunteer: 1,
        subTopic: 1,
        type: 1,
        messages: 1,
        createdAt: 1,
        endedAt: 1,
        volunteerJoinedAt: 1,
      }
    )
      .sort({ createdAt: -1 })
      .populate({ path: 'volunteer', select: 'firstname isVolunteer' })
      .populate({ path: 'student', select: 'firstname isVolunteer' })
      .lean()
      .exec()) as CurrentSession

    if (session) return session
  } catch (error) {
    throw new RepoReadError(error)
  }
}

export interface StudentLatestSession {
  _id: string
  createdAt: string
}

export async function getLatestSessionByStudentId(
  studentId: Types.ObjectId
): Promise<StudentLatestSession> {
  try {
    const session = await SessionModel.findOne(
      { student: studentId },
      { _id: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .lean()
      .exec()

    if (!session) throw new LookupError('No session found')

    return {
      _id: session._id,
      createdAt: session.createdAt.toISOString(),
    } as StudentLatestSession
  } catch (error) {
    throw error
  }
}

export async function updateSessionVolunteerById(
  sessionId: Types.ObjectId,
  volunteerId: Types.ObjectId
): Promise<void> {
  const query = { _id: sessionId }
  const update = {
    volunteerJoinedAt: new Date(),
    volunteer: volunteerId,
  }
  try {
    const result = await SessionModel.updateOne(query, update)
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (error) {
    throw new DocUpdateError(error as Error, query, update)
  }
}

export type SessionForChatbot = Pick<
  Session,
  | '_id'
  | 'messages'
  | 'type'
  | 'subTopic'
  | 'volunteerJoinedAt'
  | 'createdAt'
  | 'endedAt'
  | 'student'
> & { firstname: string }
export async function getSessionMessagesById(
  sessionId: Types.ObjectId
): Promise<SessionForChatbot | undefined> {
  try {
    const result = await SessionModel.findOne(
      { _id: sessionId },
      {
        _id: 1,
        messages: 1,
        type: 1,
        subTopic: 1,
        volunteerJoinedAt: 1,
        createdAt: 1,
        endedAt: 1,
        student: 1,
      }
    )
      .lean()
      .exec()
    if (result) {
      const student = await getStudentContactInfoById(
        result.student as Types.ObjectId
      )
      if (student)
        return {
          ...result,
          firstname: student.firstname,
        } as SessionForChatbot
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function addMessageToSessionById(
  sessionId: Types.ObjectId,
  message: Omit<Message, '_id'>
): Promise<void> {
  const query = { _id: sessionId }
  const update = { $push: { messages: message } }
  try {
    const result = await SessionModel.updateOne(query, update)
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (error) {
    throw new DocUpdateError(error as Error, query, update)
  }
}

export interface SessionsWithAvgWaitTimePerDayAndHour {
  _id: string
  averageWaitTime: number
  day: number
  hour: number
}

export async function getSessionsWithAvgWaitTimePerDayAndHour(
  startDate: Date,
  endDate: Date
): Promise<SessionsWithAvgWaitTimePerDayAndHour[]> {
  try {
    return (await SessionModel.aggregate([
      {
        $match: {
          createdAt: {
            $gt: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $project: {
          createdAt: 1,
          sessionLength: { $subtract: ['$endedAt', '$createdAt'] },
          dayCreatedAt: {
            $isoDayOfWeek: '$createdAt',
          },
          hourCreatedAt: {
            $hour: '$createdAt',
          },
          waitTime: {
            $cond: {
              if: '$volunteer',
              then: { $subtract: ['$volunteerJoinedAt', '$createdAt'] },
              else: { $subtract: ['$endedAt', '$createdAt'] },
            },
          },
        },
      },
      {
        $match: {
          // exclude sessions less than one minute in length
          sessionLength: {
            $gt: 1000 * 60,
          },
        },
      },
      {
        $addFields: {
          dayHourCompoundKey: {
            $concat: [
              {
                $toString: '$dayCreatedAt',
              },
              '-',
              {
                $toString: '$hourCreatedAt',
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: '$dayHourCompoundKey',
          averageWaitTime: {
            $avg: '$waitTime',
          },
          day: {
            $first: '$dayCreatedAt',
          },
          hour: {
            $first: '$hourCreatedAt',
          },
        },
      },
    ])) as SessionsWithAvgWaitTimePerDayAndHour[]
  } catch (err) {
    throw new RepoReadError(err)
  }
}
