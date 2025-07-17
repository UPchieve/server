import { TransactionClient, getClient, getRoClient } from '../../db'
import * as pgQueries from './pg.queries'
import {
  makeRequired,
  makeSomeOptional,
  Ulid,
  getDbUlid,
  makeSomeRequired,
  Uuid,
} from '../pgUtils'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import moment from 'moment'
import {
  GetSessionByIdResult,
  UserSessionStats,
  UserSessionsFilter,
  MessageType,
  Session,
  SessionToEnd,
  EndedSession,
} from './types'
import 'moment-timezone'
import {
  USER_BAN_TYPES,
  USER_ROLES,
  USER_ROLES_TYPE,
  UserSessionFlags,
  USER_SESSION_METRICS,
} from '../../constants'
import { UserActionAgent } from '../UserAction'
import { getFeedbackBySessionId } from '../Feedback/queries'
import { Feedback } from '../Feedback'
import { isPgId } from '../../utils/type-utils'
import {
  getSessionNotificationsWithSessionId,
  SessionNotification,
} from '../Notification'
import {
  getPresessionSurveyResponse,
  getPostsessionSurveyResponse,
  PostsessionSurveyResponse,
  SimpleSurveyResponse,
  getSessionRating,
} from '../Survey'
import config from '../../config'
import type { SessionHistoryFilter } from '../../services/SessionService'
import {
  PrimaryUserRole,
  SessionUserRole,
} from '../../services/UserRolesService'

export type NotificationData = {
  // old name for volunteerId for legacy compatibility
  volunteer: Ulid
  type: string
  method: string
  wasSuccessful: boolean
  messageId?: string
  priorityGroup: string
}
export async function addSessionNotification(
  sessionId: Ulid,
  notification: NotificationData
): Promise<void> {
  try {
    const result = await pgQueries.addNotification.run(
      {
        ...notification,
        sessionId,
        id: getDbUlid(),
      },
      getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoCreateError('Insert notification did not return ok')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export type UnfulfilledSessions = {
  _id: Ulid
  student: {
    firstname: string
    isTestUser: boolean
    isShadowBanned: boolean
  }
  subTopic: string
  createdAt: Date
  type: string
  volunteer?: Ulid
  subjectDisplayName: string
}

// sessions that have not yet been fulfilled by a volunteer
export async function getUnfulfilledSessions(
  tc: TransactionClient = getClient()
): Promise<UnfulfilledSessions[]> {
  try {
    const result = await pgQueries.getUnfilledSessions.run(
      {
        start: moment().subtract(1, 'day').toDate(),
      },
      tc
    )

    return result.map((session) => {
      const s = makeSomeOptional(session, ['volunteer', 'studentBanType'])
      return {
        ...s,
        _id: s.id,
        student: {
          firstname: s.studentFirstName,
          isTestUser: s.studentTestUser,
          isShadowBanned: s.studentBanType === USER_BAN_TYPES.SHADOW,
        },
      }
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSessionById(
  sessionId: Ulid,
  tc: TransactionClient = getClient()
): Promise<GetSessionByIdResult> {
  try {
    const result = await pgQueries.getSessionById.run({ sessionId }, tc)
    if (!result.length) throw new RepoReadError('Session not found')
    return makeSomeOptional(result[0], [
      'volunteerId',
      'quillDoc',
      'volunteerJoinedAt',
      'endedAt',
      'endedByRole',
      'shadowbanned',
    ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateSessionFlagsById(
  sessionId: Ulid,
  flags: (USER_SESSION_METRICS | UserSessionFlags)[],
  client: TransactionClient = getClient()
): Promise<void> {
  if (!flags.length) return
  try {
    const result = await pgQueries.insertSessionFlagsById.run(
      { sessionId, flags },
      client
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new Error(
        `Did not insert any session flags for session ${sessionId}`
      )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateSessionReviewedStatusById(
  sessionId: Ulid,
  reviewed: boolean,
  toReview: boolean
): Promise<void> {
  try {
    const result = await pgQueries.updateSessionReviewedStatusById.run(
      {
        sessionId,
        reviewed,
        toReview,
      },
      getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export type SessionToEndUserInfo = {
  id: Ulid
  firstName: string
  email: string
  numPastSessions: number
  volunteerPartnerOrg?: string
}

export async function getSessionToEndById(
  sessionId: Ulid,
  tc: TransactionClient = getClient()
): Promise<SessionToEnd> {
  try {
    const result = await pgQueries.getSessionToEndById.run({ sessionId }, tc)
    if (!result.length) throw new RepoReadError('Session not found')
    const rawSession = makeSomeOptional(result[0], [
      'volunteerJoinedAt',
      'endedAt',
      'volunteerEmail',
      'volunteerId',
      'volunteerFirstName',
      'volunteerNumPastSessions',
      'volunteerPartnerOrg',
    ])

    let volunteerValue: SessionToEndUserInfo | undefined = undefined
    if (
      rawSession.volunteerId &&
      rawSession.volunteerFirstName &&
      rawSession.volunteerEmail &&
      !!rawSession.volunteerNumPastSessions
    ) {
      volunteerValue = {
        id: rawSession.volunteerId,
        firstName: rawSession.volunteerFirstName,
        email: rawSession.volunteerEmail?.toLowerCase(),
        numPastSessions: rawSession.volunteerNumPastSessions,
        volunteerPartnerOrg: rawSession.volunteerPartnerOrg,
      }
    }

    return {
      ...rawSession,
      student: {
        id: rawSession.studentId,
        firstName: rawSession.studentFirstName,
        email: rawSession.studentEmail?.toLowerCase(),
        numPastSessions: rawSession.studentNumPastSessions,
      },
      volunteer: volunteerValue,
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type SessionsToReview = {
  id: Ulid
  _id: Ulid
  createdAt: Date
  endedAt: Date
  volunteer?: Ulid
  volunteerFirstName?: string
  totalMessages: number
  type: string
  subTopic: string
  studentFirstName: string
  isReported: boolean
  flags?: string[]
  reviewReasons?: string[]
  toReview: boolean
  studentRating?: number
}

export async function getSessionsToReview(
  limit: number,
  offset: number,
  filterBy: {
    studentFirstName?: string
  } = {}
): Promise<SessionsToReview[]> {
  try {
    const result = await pgQueries.getSessionsToReview.run(
      { limit, offset, withStudentFirstName: filterBy.studentFirstName },
      getClient()
    )
    return Promise.all(
      result.map(async (v) => {
        const temp = makeSomeOptional(v, [
          'volunteer',
          'volunteerFirstName',
          'reviewReasons',
          'studentCounselingFeedback',
          'flags',
        ])
        const studentRating = await getSessionRating(
          temp.id,
          USER_ROLES.STUDENT
        )
        return {
          ...temp,
          studentRating,
          _id: temp.id,
        }
      })
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTotalTimeTutoredForDateRange(
  volunteerId: Ulid,
  start: Date,
  end: Date,
  tc?: TransactionClient
): Promise<number> {
  try {
    const result = await pgQueries.getTotalTimeTutoredForDateRange.run(
      { volunteerId, start, end },
      tc || getClient()
    )
    if (!(result.length && result[0].total)) return 0
    // manually parse out incoming bigint to number
    return Number(makeRequired(result[0]).total)
  } catch (error) {
    throw new RepoReadError(error)
  }
}

export async function getActiveSessionsWithVolunteers(): Promise<Ulid[]> {
  try {
    const result = await pgQueries.getActiveSessionVolunteers.run(
      undefined,
      getClient()
    )
    return result.map((v) => makeRequired(v).volunteerId)
  } catch (error) {
    throw new RepoReadError(error)
  }
}

export async function updateSessionReported(
  sessionId: Ulid,
  reportReason: string,
  reportMessage: string
): Promise<void> {
  try {
    const result = await pgQueries.updateSessionReported.run(
      { id: getDbUlid(), sessionId, reportReason, reportMessage },
      getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateSessionTimeTutored(
  sessionId: Ulid,
  timeTutored: number
): Promise<void> {
  try {
    const result = await pgQueries.updateSessionTimeTutored.run(
      { sessionId, timeTutored },
      getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateSessionQuillDoc(
  sessionId: Ulid,
  quillDoc: string
): Promise<void> {
  try {
    const result = await pgQueries.updateSessionQuillDoc.run(
      { sessionId, quillDoc },
      getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateSessionHasWhiteboardDoc(
  sessionId: Ulid,
  hasWhiteboardDoc: boolean
): Promise<void> {
  try {
    const result = await pgQueries.updateSessionHasWhiteboardDoc.run(
      { sessionId, hasWhiteboardDoc },
      getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateSessionToEnd(
  sessionId: Ulid,
  endedAt: Date,
  endedBy: Ulid | null,
  tc: TransactionClient = getClient()
): Promise<EndedSession> {
  try {
    const result = await pgQueries.updateSessionToEnd.run(
      { sessionId, endedAt, endedBy },
      tc
    )
    if (!result.length)
      throw new Error(
        'Failure in updateSessionToEnd: Did not get back updated session'
      )
    return makeSomeRequired(result[0], [
      'id',
      'createdAt',
      'endedAt',
      'endedByUserRole',
    ])
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getLongRunningSessions(
  start: Date,
  end: Date
): Promise<Ulid[]> {
  try {
    const result = await pgQueries.getLongRunningSessions.run(
      { start, end },
      getClient()
    )
    return result.map((v) => makeRequired(v).id)
  } catch (error) {
    throw new RepoReadError(error)
  }
}

export type PublicSessionUser = {
  _id: Ulid
  firstName: string
}
export type PublicSession = {
  _id: Ulid
  createdAt: Date
  endedAt: Date
  type: string
  subTopic: string
  student: PublicSessionUser
  volunteer: PublicSessionUser
}

export async function getPublicSessionById(
  sessionId: Ulid
): Promise<PublicSession | undefined> {
  try {
    const result = await pgQueries.getPublicSessionById.run(
      { sessionId },
      getClient()
    )
    if (!result.length) return
    const rawRow = makeRequired(result[0])
    return {
      ...rawRow,
      _id: rawRow.id,
      student: {
        _id: rawRow.studentId,
        firstName: rawRow.studentFirstName,
      },
      volunteer: {
        _id: rawRow.volunteerId,
        firstName: rawRow.volunteerFirstName,
      },
    }
  } catch (error) {
    throw new RepoReadError(error)
  }
}

export type MessageForFrontend = {
  user: Ulid
  contents: string
  createdAt: Date
}
export type SessionByIdWithStudentAndVolunteer = {
  createdAt: Date
  volunteerjoinedAt?: Date
  endedAt?: Date
  endedBy?: Ulid
  feedbacks?: Feedback // need this to display legacy feedback from before context sharing
  surveyResponses: {
    presessionSurvey: SimpleSurveyResponse[]
    studentPostsessionSurvey: PostsessionSurveyResponse[]
    volunteerPostsessionSurvey: PostsessionSurveyResponse[]
  }
  userAgent?: Partial<UserActionAgent>
  type: string
  subTopic: string
  quillDoc?: string
  _id: Uuid
  id: Uuid
  reviewReasons?: string[]
  reportReason?: string
  reportMessage?: string
  timeTutored: number
  notifications?: SessionNotification[]
  photos?: string[]
  student: CurrentSessionUser
  volunteer?: CurrentSessionUser
  messages: MessageForFrontend[]
  toReview: boolean
  toolType: string
}

export async function getMessagesForFrontend(
  sessionId: Ulid,
  tc: TransactionClient = getClient()
): Promise<MessageForFrontend[]> {
  try {
    const result = (
      await pgQueries.getSessionMessagesForFrontend.run({ sessionId }, tc)
    ).map((v) => makeRequired(v))
    const voiceResult = (
      await pgQueries.getSessionVoiceMessagesForFrontend.run({ sessionId }, tc)
    ).map((v) => makeSomeOptional(v, ['transcript']))
    const transcriptResult = (
      await pgQueries.getSessionAudioTranscriptMessagesForFrontend.run(
        { sessionId },
        tc
      )
    ).map((v) => makeRequired(v))

    // insert voice messages
    const merged = result
      .concat(voiceResult.map((r) => ({ ...r, type: 'voice', contents: r.id })))
      .concat(
        transcriptResult.map((t) => ({
          ...t,
          type: 'audio-transcription',
          contents: t.message,
        }))
      )
      .sort((a, b) => {
        return Number(a.createdAt) - Number(b.createdAt)
      })

    return merged
  } catch (error) {
    throw new RepoReadError(error)
  }
}

export async function getSessionByIdWithStudentAndVolunteer(
  sessionId: Ulid
): Promise<SessionByIdWithStudentAndVolunteer> {
  const client = await getClient().connect()
  try {
    const sessionResult = await pgQueries.getSessionForAdminView.run(
      { sessionId },
      client
    )
    if (!sessionResult.length) throw new Error('Session not found')
    const session = makeSomeOptional(sessionResult[0], [
      'volunteerId',
      'volunteerJoinedAt',
      'photos',
      'endedAt',
      'endedBy',
      'quillDoc',
      'reportMessage',
      'reportReason',
      'reviewReasons',
    ])
    const { student, volunteer } = await getSessionUsers(
      session.id,
      session.studentId,
      session.volunteerId,
      client
    )
    const messages = await getMessagesForFrontend(sessionId, client)
    const feedbacks = await getFeedbackBySessionId(sessionId) // need this to display legacy feedback from before context sharing
    const presessionSurvey = await getPresessionSurveyResponse(sessionId)
    const studentPostsessionSurvey = await getPostsessionSurveyResponse(
      sessionId,
      USER_ROLES.STUDENT
    )
    const volunteerPostsessionSurvey = await getPostsessionSurveyResponse(
      sessionId,
      USER_ROLES.VOLUNTEER
    )
    const notifications = await getSessionNotificationsWithSessionId(sessionId)

    return {
      ...session,
      student,
      volunteer,
      messages,
      feedbacks,
      surveyResponses: {
        presessionSurvey,
        studentPostsessionSurvey,
        volunteerPostsessionSurvey,
      },
      _id: session.id,
      notifications,
    }
  } catch (err) {
    throw new RepoReadError(err)
  } finally {
    client.release()
  }
}

export async function createSession(
  studentId: Ulid,
  subject: string,
  isShadowBanned: boolean,
  tc: TransactionClient
): Promise<Session> {
  try {
    const result = await pgQueries.createSession.run(
      { id: getDbUlid(), studentId, subject, shadowbanned: isShadowBanned },
      tc
    )
    if (!result.length) {
      throw new RepoCreateError('Failed to create new session.')
    }
    const session = makeSomeRequired(result[0], [
      'id',
      'studentId',
      'subjectId',
      'hasWhiteboardDoc',
      'reviewed',
      'toReview',
      'timeTutored',
      'createdAt',
      'updatedAt',
    ])
    return {
      ...session,
      timeTutored: Number(session.timeTutored),
    }
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export type CurrentSessionUser = {
  createdAt: Date
  _id: Ulid
  id: Ulid
  // TODO: remove `firstname` in favor of `firstName`. The frontend must be refactored first
  firstname: string
  firstName: string
  pastSessions: Ulid[]
}
export type CurrentSession = {
  _id: Ulid
  id: Ulid
  subTopic: string
  type: string
  student: CurrentSessionUser
  volunteer?: CurrentSessionUser
  volunteerJoinedAt?: Date
  messages: MessageForFrontend[]
  endedAt?: Date
  endedBy?: Ulid
  toolType: string
  docEditorVersion?: number
  studentBannedFromLiveMedia?: boolean
  volunteerBannedFromLiveMedia?: boolean
  volunteerLanguages?: string[]
}

export type SessionInfoForUser = {
  createdAt: Date
  endedAt?: Date
  id: string
  studentId: string
  subTopic: string
  toolType: string
  type: string
  volunteerId?: string
  volunteerJoinedAt?: Date
}

export async function handleSessionParsingForUser(
  session: SessionInfoForUser,
  tc: TransactionClient
): Promise<CurrentSession> {
  try {
    const messages = await getMessagesForFrontend(session.id, tc)
    const { student, volunteer } = await getSessionUsers(
      session.id,
      session.studentId,
      session.volunteerId,
      tc
    )
    return {
      ...session,
      student,
      volunteer,
      _id: session.id,
      messages,
    }
  } catch (error) {
    throw new RepoReadError(error)
  }
}

export async function getCurrentSessionByUserId(
  userId: Ulid,
  tc: TransactionClient = getClient()
): Promise<CurrentSession | undefined> {
  try {
    const result = await pgQueries.getCurrentSessionByUserId.run({ userId }, tc)
    if (!result.length) return
    else {
      const session = makeSomeOptional(result[0], [
        'volunteerId',
        'endedAt',
        'volunteerJoinedAt',
        'volunteerBannedFromLiveMedia',
        'studentBannedFromLiveMedia',
        'volunteerLanguages',
      ])
      return handleSessionParsingForUser(session, tc)
    }
  } catch (error) {
    throw new RepoReadError(error)
  }
}

export async function getRecapSessionForDmsBySessionId(
  sessionId: Ulid
): Promise<CurrentSession | undefined> {
  const client = await getClient().connect()
  try {
    const result = await pgQueries.getRecapSessionForDmsBySessionId.run(
      { sessionId },
      client
    )
    if (!result.length) return
    else {
      const session = makeRequired(result[0])
      return handleSessionParsingForUser(session, client)
    }
  } catch (error) {
    throw new RepoReadError(error)
  } finally {
    client.release()
  }
}

export type MessageInfoByMessageId = {
  contents: string
  createdAt: Date
  senderId: string
  sentAfterSession: boolean
  sessionEndedAt: Date
  sessionId: string
  studentEmail: string
  studentFirstName: string
  studentUserId: string
  volunteerEmail: string
  volunteerFirstName: string
  volunteerUserId: string
}

export async function getMessageInfoByMessageId(
  messageId: Ulid
): Promise<MessageInfoByMessageId | undefined> {
  const client = await getClient().connect()
  try {
    const result = await pgQueries.getMessageInfoByMessageId.run(
      { messageId },
      client
    )
    if (result.length) return makeRequired(result[0])
  } catch (error) {
    throw new RepoReadError(error)
  } finally {
    client.release()
  }
}

// TODO: Rename method name. What does `current` have to do
// with it?
export async function getCurrentSessionBySessionId(
  sessionId: Ulid,
  tc: TransactionClient = getClient()
): Promise<CurrentSession | undefined> {
  try {
    const result = await pgQueries.getCurrentSessionBySessionId.run(
      { sessionId },
      tc
    )
    const session = makeSomeOptional(result[0], [
      'volunteerJoinedAt',
      'volunteerId',
      'endedAt',
      'endedBy',
      'volunteerBannedFromLiveMedia',
      'studentBannedFromLiveMedia',
      'volunteerLanguages',
    ])
    // TODO: Move to service.
    const messages = await getMessagesForFrontend(session.id, tc)
    const { student, volunteer } = await getSessionUsers(
      session.id,
      session.studentId,
      session.volunteerId,
      tc
    )
    return {
      ...session,
      student,
      volunteer,
      _id: session.id,
      messages,
    }
  } catch (error) {
    throw new RepoReadError(error)
  }
}

export type LatestSession = {
  id: string
  createdAt: Date
  studentId: string
  volunteerId?: string
  endedByUserId?: string
  timeTutored?: number
  endedAt?: Date
}
export async function getLatestSession(
  userId: Ulid,
  role: SessionUserRole
): Promise<LatestSession | undefined> {
  try {
    const result = await pgQueries.getLatestSession.run(
      { userId, role },
      getClient()
    )
    if (!result.length) return
    return makeSomeRequired(result[0], ['id', 'createdAt', 'studentId'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateSessionVolunteerById(
  sessionId: Ulid,
  volunteerId: Ulid,
  tc?: TransactionClient
): Promise<void> {
  try {
    await pgQueries.updateSessionVolunteerById.run(
      { sessionId, volunteerId },
      tc ?? getClient()
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function addMessageToSessionById(
  sessionId: Ulid,
  senderId: Ulid,
  contents: string
): Promise<string> {
  try {
    const result = await pgQueries.insertNewMessage.run(
      { id: getDbUlid(), sessionId, senderId, contents },
      getClient()
    )
    if (!result.length) throw new RepoCreateError('Insert did not return ok')
    return makeRequired(result[0]).id
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function addVoiceMessageToSessionById(
  sessionId: Ulid,
  senderId: Ulid,
  voiceMessageId: Ulid,
  transcript: string
): Promise<string> {
  try {
    const result = await pgQueries.insertNewVoiceMessage.run(
      { id: voiceMessageId, sessionId, senderId, transcript },
      getClient()
    )
    if (!result.length) throw new RepoCreateError('Insert did not return ok')
    return makeRequired(result[0]).id
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export type SessionsWithAvgWaitTimePerDayAndHour = {
  averageWaitTime: number
  day: number
  hour: number
}
export async function getSessionsWithAvgWaitTimePerDayAndHour(
  start: Date,
  end: Date
): Promise<SessionsWithAvgWaitTimePerDayAndHour[]> {
  try {
    const result = await pgQueries.getSessionsWithAvgWaitTimePerDayAndHour.run(
      { start, end },
      getClient()
    )
    return result.map((v) => makeRequired(v))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type SessionVolunteerRating = {
  id: Ulid
  sessionRating?: number
}
export async function getSessionsVolunteerRating(
  volunteerId: Ulid
): Promise<SessionVolunteerRating[]> {
  try {
    const result = await pgQueries.getSessionsForReferCoworker.run(
      { volunteerId },
      getClient()
    )
    return Promise.all(
      result.map(async (row) => {
        const session = makeSomeOptional(row, ['volunteerFeedback'])
        const sessionVolunteerRating: SessionVolunteerRating = {
          id: session.id,
        }
        if (session.volunteerFeedback) {
          const rating = await getSessionRating(
            session.id,
            USER_ROLES.VOLUNTEER
          )
          sessionVolunteerRating.sessionRating = rating
        }

        return sessionVolunteerRating
      })
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type VolunteerForGentleWarning = {
  id: Ulid
  firstName: string
  email: string
  totalNotifications: number
}
export async function getVolunteersForGentleWarning(
  sessionId: Ulid
): Promise<VolunteerForGentleWarning[]> {
  try {
    const result = await pgQueries.getVolunteersForGentleWarning.run(
      {
        sessionId: isPgId(sessionId) ? sessionId : undefined,
        mongoSessionId: isPgId(sessionId) ? undefined : sessionId,
      },
      getClient()
    )
    return result.map((v) => {
      const ret = makeRequired(v)
      ret.email = ret.email.toLowerCase()
      return ret
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type UserForFirstSession = {
  id: Ulid
  firstName: string
  email: string
}
export async function getStudentForEmailFirstSession(
  sessionId: Ulid
): Promise<UserForFirstSession | undefined> {
  try {
    const result = await pgQueries.getStudentForEmailFirstSession.run(
      {
        sessionId: isPgId(sessionId) ? sessionId : undefined,
        mongoSessionId: isPgId(sessionId) ? undefined : sessionId,
      },
      getClient()
    )
    if (!result.length) return
    const ret = makeRequired(result[0])
    ret.email = ret.email.toLowerCase()
    return ret
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteerForEmailFirstSession(
  sessionId: Ulid
): Promise<UserForFirstSession | undefined> {
  try {
    const result = await pgQueries.getVolunteerForEmailFirstSession.run(
      {
        sessionId: isPgId(sessionId) ? sessionId : undefined,
        mongoSessionId: isPgId(sessionId) ? undefined : sessionId,
      },
      getClient()
    )
    if (!result.length) return
    const ret = makeRequired(result[0])
    ret.email = ret.email.toLowerCase()
    return ret
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type AdminFilterUser = {
  firstname: string
  isBanned: boolean
  isTestUser: boolean
  totalPastSessions: number
}
export type AdminFilteredSessions = {
  id: Ulid
  _id: Ulid
  createdAt: Date
  endedAt: Date
  volunteer?: AdminFilterUser
  totalMessages: number
  type: string
  subTopic: string
  student: AdminFilterUser
  studentFirstName: string
  studentRating?: number
  reviewReasons: string[]
}
export type AdminFilterOptions = {
  messageCount: number | undefined
  sessionLength: number | undefined
  reported: boolean | undefined
  showBannedUsers: boolean | undefined
  volunteerRating: number | undefined
  studentRating: number | undefined
  showTestUsers: boolean | undefined
  firstTimeStudent: boolean | undefined
  firstTimeVolunteer: boolean | undefined
}

export async function getSessionsForAdminFilter(
  start: Date,
  end: Date,
  limit: number,
  offset: number,
  options: AdminFilterOptions
): Promise<AdminFilteredSessions[]> {
  try {
    const sessionResult = await pgQueries.getSessionsForAdminFilter.run(
      { start, end, limit, offset, ...options },
      getClient()
    )
    const sessions = sessionResult.map((v) =>
      makeSomeOptional(v, [
        'volunteerEmail',
        'volunteerFirstName',
        'volunteerBanType',
        'volunteerTestUser',
        'volunteerTotalPastSessions',
        'reviewReasons',
        'studentBanType',
        'volunteerBanType',
      ])
    )
    const sessionsInfo = sessions.map(async (session) => {
      const studentRating = await getSessionRating(
        session.id,
        USER_ROLES.STUDENT
      )
      const volunteerRating = await getSessionRating(
        session.id,
        USER_ROLES.VOLUNTEER
      )
      let volunteer = undefined
      if (
        session.volunteerFirstName &&
        session.volunteerEmail &&
        !!session.volunteerBanType &&
        !!session.volunteerTestUser &&
        !!session.volunteerTotalPastSessions
      ) {
        volunteer = {
          firstname: session.volunteerFirstName,
          isBanned: session.volunteerBanType === USER_BAN_TYPES.COMPLETE,
          isTestUser: session.volunteerTestUser,
          totalPastSessions: session.volunteerTotalPastSessions,
        }
        session.volunteerEmail = session.volunteerEmail.toLowerCase()
      }

      const student = {
        firstname: session.studentFirstName,
        isBanned: session.studentBanType === USER_BAN_TYPES.COMPLETE,
        isShadowBanned: session.studentBanType === USER_BAN_TYPES.SHADOW,
        isTestUser: session.studentTestUser,
        totalPastSessions: session.studentTotalPastSessions,
      }

      return {
        ...session,
        studentRating,
        volunteerRating,
        student,
        volunteer,
        reviewReasons: session.reviewReasons || [],
        _id: session.id,
      }
    })
    return Promise.all(sessionsInfo)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateSessionReviewReasonsById(
  sessionId: Ulid,
  reviewReasons: UserSessionFlags[],
  // Use this property to override the reviewed status of a session
  reviewed?: boolean,
  client?: TransactionClient
): Promise<void> {
  try {
    const dbClient = client ?? getClient()
    if (reviewReasons.length) {
      const insertReviewReasonsResult =
        await pgQueries.insertSessionReviewReasons.run(
          { sessionId, reviewReasons },
          dbClient
        )
      if (!insertReviewReasonsResult.length)
        throw new Error(
          'Query to insert session review reasons did not return any results'
        )
    }

    const updateSessionResult = await pgQueries.updateSessionToReview.run(
      { sessionId, reviewed },
      dbClient
    )
    if (!updateSessionResult.length && makeRequired(updateSessionResult[0]).ok)
      throw new Error('Updating to_review did not return ok')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function updateSessionFailedJoinsById(
  sessionId: Ulid,
  userId: Ulid
): Promise<void> {
  try {
    const result = await pgQueries.insertSessionFailedJoin.run(
      { sessionId, userId },
      getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateSessionPhotoKey(
  sessionId: Ulid,
  photoKey: string
): Promise<void> {
  try {
    const result = await pgQueries.insertSessionPhotoKey.run(
      { sessionId, photoKey },
      getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export type SessionsForVolunteerHourSummary = {
  sessionId: Ulid
  createdAt: Date
  endedAt: Date
  timeTutored: number
  subject: string
  topic: string
  volunteerJoinedAt: Date
}

export async function getSessionsForVolunteerHourSummary(
  volunteerId: Ulid,
  start: Date,
  end: Date
): Promise<SessionsForVolunteerHourSummary[]> {
  try {
    const result = await pgQueries.getSessionsForVolunteerHourSummary.run(
      { volunteerId, start, end },
      getClient()
    )
    if (result.length) return result.map((row) => makeRequired(row))
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type SessionForSessionHistory = {
  id: Ulid
  topic: string
  topicIconLink: string
  subject: string
  createdAt: Date
  timeTutored: number
  isFavorited: boolean
  studentId: Ulid
  studentFirstName: string
  volunteerId: Ulid
  volunteerFirstName: string
}
export async function getFilteredSessionHistory(
  userId: Ulid,
  limit: number,
  offset: number,
  filter: SessionHistoryFilter = {}
): Promise<SessionForSessionHistory[]> {
  try {
    const params = {
      userId,
      minSessionLength: config.minSessionLength,
      limit,
      offset,
      studentFirstName: filter.studentFirstName || null,
      volunteerFirstName: filter.volunteerFirstName || null,
      subjectName: filter.subjectName || null,
      studentId: filter.studentId || null,
      volunteerId: filter.volunteerId || null,
    }
    const result = await pgQueries.getFilteredSessionHistory.run(
      params,
      getRoClient()
    )
    if (result.length) return result.map((v) => makeRequired(v))
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getFilteredSessionHistoryTotalCount(
  userId: Ulid,
  filter: SessionHistoryFilter = {}
): Promise<number> {
  try {
    const params = {
      userId,
      minSessionLength: config.minSessionLength,
      studentFirstName: filter.studentFirstName || null,
      volunteerFirstName: filter.volunteerFirstName || null,
      subjectName: filter.subjectName || null,
      studentId: filter.studentId || null,
      volunteerId: filter.volunteerId || null,
    }
    const result = await pgQueries.getFilteredSessionHistoryTotalCount.run(
      params,
      getRoClient()
    )
    if (result.length) {
      return result[0].count ?? 0
    }
    return 0
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type SessionForSessionRecap = {
  id: Ulid
  topic: string
  topicIconLink: string
  subject: string
  subjectKey: string
  createdAt: Date
  endedAt: Date
  timeTutored: number
  isFavorited: boolean
  studentId: Ulid
  studentFirstName: string
  volunteerId: Ulid
  volunteerFirstName: string
  quillDoc?: string
  hasWhiteboardDoc: boolean
  messages?: MessageForFrontend[]
}

export async function getSessionRecap(
  sessionId: Ulid
): Promise<SessionForSessionRecap> {
  const client = await getRoClient().connect()
  try {
    const sessionResult = await pgQueries.getSessionRecap.run(
      { sessionId },
      client
    )
    if (!sessionResult.length) throw new RepoReadError('Session not found')

    const session = makeSomeOptional(sessionResult[0], ['quillDoc'])
    const messages = await getMessagesForFrontend(sessionId, client)

    return { ...session, messages }
  } catch (err) {
    throw new RepoReadError(err)
  } finally {
    client.release()
  }
}

export async function isEligibleForSessionRecap(
  sessionId: Ulid
): Promise<boolean> {
  const client = await getClient().connect()
  try {
    const result = await pgQueries.isEligibleForSessionRecap.run(
      { sessionId, minSessionLength: config.minSessionLength },
      client
    )
    if (!result.length) return false
    else return makeRequired(result[0]).isEligible
  } catch (err) {
    throw new RepoReadError(err)
  } finally {
    client.release()
  }
}

export async function volunteerSentMessageAfterSessionEnded(
  sessionId: Ulid
): Promise<boolean> {
  const client = await getClient().connect()
  try {
    const result = await pgQueries.volunteerSentMessageAfterSessionEnded.run(
      { sessionId },
      client
    )
    return !!result.length
  } catch (err) {
    throw new RepoReadError(err)
  } finally {
    client.release()
  }
}

export async function sessionHasBannedParticipant(
  sessionId: Ulid
): Promise<boolean> {
  const client = await getClient().connect()
  try {
    const result = await pgQueries.sessionHasBannedParticipant.run(
      { sessionId },
      client
    )
    return !!result.length
  } catch (err) {
    throw new RepoReadError(err)
  } finally {
    client.release()
  }
}

export type UserSessions = {
  id: Ulid
  createdAt: Date
  subjectName: string
  topicName: string
  quillDoc?: string
  studentId: string
  volunteerId?: string
}

export type UserSessionsWithMessages = UserSessions & {
  messages: MessageForFrontend[]
}

export async function getUserSessionsByUserId(
  userId: Ulid,
  filter: UserSessionsFilter = {
    start: undefined,
    end: undefined,
    subject: '',
    topic: undefined,
    sessionId: undefined,
  }
): Promise<UserSessions[]> {
  try {
    const result = await pgQueries.getUserSessionsByUserId.run(
      {
        userId,
        start: filter.start,
        end: filter.end,
        subject: filter.subject,
        topic: filter.topic,
        sessionId: filter.sessionId,
      },
      getClient()
    )
    return result.map((v) => makeSomeOptional(v, ['volunteerId', 'quillDoc']))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUserSessionStats(
  userId: Ulid
): Promise<UserSessionStats> {
  try {
    const result = await pgQueries.getUserSessionStats.run(
      {
        userId,
        minSessionLength: config.minSessionLength,
      },
      getClient()
    )
    const userSessionStats: UserSessionStats = {}
    for (const subject of result.map((v) => makeRequired(v))) {
      const { subjectName, topicName, totalRequested, totalHelped } = subject
      userSessionStats[subjectName] = {
        totalRequested,
        totalHelped,
        topicName,
      }
    }
    return userSessionStats
  } catch (err) {
    throw new RepoReadError(err)
  }
}

async function getSessionUsers(
  sessionId: Ulid,
  sessionStudentId: Ulid,
  sessionVolunteerId: Ulid = '',
  tc: TransactionClient = getClient()
): Promise<{ student: CurrentSessionUser; volunteer?: CurrentSessionUser }> {
  const userResult = await pgQueries.getSessionUsers.run({ sessionId }, tc)
  const users = userResult.map((v) => makeSomeOptional(v, ['gradeLevel']))
  let student, volunteer
  for (const u of users) {
    if (u.id === sessionStudentId) student = u
    if (sessionVolunteerId && u.id === sessionVolunteerId) volunteer = u
  }
  if (!student)
    throw new RepoReadError(`Did not find student for session ${sessionId}`)

  return {
    student: { _id: student.id, ...student },
    volunteer: volunteer ? { _id: volunteer.id, ...volunteer } : undefined,
  }
}

export async function getStudentSessionDetails(studentId: Ulid) {
  try {
    const sessionDetails = await pgQueries.getStudentSessionDetails.run(
      { studentId },
      getClient()
    )
    return sessionDetails.map((s) => makeSomeOptional(s, ['volunteerId']))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function insertTutorBotSessionMessage(
  sessionId: Ulid,
  message: string,
  userType: 'student' | 'bot'
) {
  try {
    const result = await pgQueries.insertTutorBotSessionMessage.run(
      {
        id: getDbUlid(),
        sessionId,
        message,
        userType,
      },
      getClient()
    )
    if (!result) {
      throw new Error('Failed to insert tutor bot session message')
    }
    return result[0]
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getSessionTranscriptItems(sessionId: Ulid) {
  try {
    const result = await pgQueries.getSessionTranscript.run(
      {
        sessionId,
      },
      getClient()
    )
    return result.map((row) => {
      const camelCased = makeRequired(row)
      return {
        ...camelCased,
        messageType: camelCased.messageType as MessageType,
        role: camelCased.role as USER_ROLES_TYPE,
      }
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUniqueStudentsHelpedCount(
  userId: Ulid,
  minSessionLength: number,
  tc?: TransactionClient
) {
  try {
    const result = await pgQueries.getUniqueStudentsHelpedCount.run(
      {
        userId,
        minSessionLength,
      },
      tc || getClient()
    )
    return makeRequired(result[0]).total
  } catch (err) {
    throw new RepoReadError(err)
  }
}
