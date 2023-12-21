import { getClient } from '../../db'
import * as pgQueries from './pg.queries'
import {
  makeRequired,
  makeSomeOptional,
  Ulid,
  getDbUlid,
  makeSomeRequired,
} from '../pgUtils'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import moment from 'moment'
import { Session, UserSessionStats, UserSessionsFilter } from './types'
import 'moment-timezone'
import { USER_ROLES, USER_SESSION_METRICS } from '../../constants'
import { UserActionAgent } from '../UserAction'
import { getFeedbackBySessionId } from '../Feedback/queries'
import { PoolClient } from 'pg'
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
  StudentPresessionSurveyResponse,
  getSessionRating,
} from '../Survey'
import config from '../../config'

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
  }
  subTopic: string
  createdAt: Date
  type: string
  volunteer?: Ulid
  subjectDisplayName: string
}

// sessions that have not yet been fulfilled by a volunteer
export async function getUnfulfilledSessions(): Promise<UnfulfilledSessions[]> {
  try {
    const result = await pgQueries.getUnfilledSessions.run(
      {
        start: moment()
          .subtract(1, 'day')
          .toDate(),
      },
      getClient()
    )

    const sessions = result.map(v => makeSomeOptional(v, ['volunteer']))
    const oneMinuteAgo = moment().subtract(1, 'minutes')

    const fileteredSessions = sessions.filter(session => {
      const isNewStudent = session.isFirstTimeStudent
      const wasSessionCreatedAMinuteAgo = moment(oneMinuteAgo).isBefore(
        session.createdAt
      )
      // Don't show new students' sessions for a minute (they often cancel immediately)
      if (isNewStudent && wasSessionCreatedAMinuteAgo) return false
      return true
    })
    return fileteredSessions.map(v => ({
      ...v,
      _id: v.id,
      student: {
        firstname: v.studentFirstName,
        isTestUser: v.studentTestUser,
      },
    }))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSessionById(sessionId: Ulid): Promise<Session> {
  try {
    const result = await pgQueries.getSessionById.run(
      { sessionId },
      getClient()
    )
    if (!result.length) throw new RepoReadError('Session not found')
    return makeSomeOptional(result[0], [
      'volunteerId',
      'quillDoc',
      'volunteerJoinedAt',
      'endedAt',
      'endedByRole',
      'studentBanned',
    ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateSessionFlagsById(
  sessionId: Ulid,
  flags: USER_SESSION_METRICS[]
): Promise<void> {
  const client = await getClient().connect()
  try {
    await client.query('BEGIN')
    const errors: string[] = []
    for (const flag of flags) {
      const result = await pgQueries.insertSessionFlagById.run(
        { sessionId, flag },
        client
      )
      if (!result.length && makeRequired(result[0]).ok)
        errors.push(`Update query for flag ${flag} did not return ok`)
    }
    if (errors.length) throw new RepoReadError(errors.join('\n'))
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw new RepoUpdateError(err)
  } finally {
    client.release()
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

export type SessionToEnd = Pick<
  Session,
  | 'id'
  | 'createdAt'
  | 'endedAt'
  | 'reported'
  | 'topic'
  | 'subject'
  | 'volunteerJoinedAt'
> & {
  student: SessionToEndUserInfo
} & { volunteer?: SessionToEndUserInfo }

export async function getSessionToEndById(
  sessionId: Ulid
): Promise<SessionToEnd> {
  try {
    const result = await pgQueries.getSessionToEndById.run(
      { sessionId },
      getClient()
    )
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
  totalMessages: number
  type: string
  subTopic: string
  studentFirstName: string
  isReported: boolean
  flags: string[]
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
      result.map(async v => {
        const temp = makeSomeOptional(v, [
          'volunteer',
          'reviewReasons',
          'studentCounselingFeedback',
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
  end: Date
): Promise<number> {
  try {
    const result = await pgQueries.getTotalTimeTutoredForDateRange.run(
      { volunteerId, start, end },
      getClient()
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
    return result.map(v => makeRequired(v).volunteerId)
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
  endedBy: Ulid | null
): Promise<void> {
  try {
    const result = await pgQueries.updateSessionToEnd.run(
      { sessionId, endedAt, endedBy },
      getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('Update query did not return ok')
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
    return result.map(v => makeRequired(v).id)
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
export type UserForAdmin = {
  isVolunteer: boolean
  createdAt: Date
  pastSessions: Ulid[]
  firstname: string
  _id: Ulid
}
export type SessionByIdWithStudentAndVolunteer = {
  createdAt: Date
  volunteerjoinedAt?: Date
  endedAt?: Date
  endedBy?: Ulid
  feedbacks?: Feedback // need this to display legacy feedback from before context sharing
  surveyResponses: {
    presessionSurvey: StudentPresessionSurveyResponse[]
    studentPostsessionSurvey: PostsessionSurveyResponse[]
    volunteerPostsessionSurvey: PostsessionSurveyResponse[]
  }
  userAgent?: Partial<UserActionAgent>
  type: string
  subTopic: string
  quillDoc?: string
  _id: Ulid
  reviewReasons?: string[]
  reportReason?: string
  reportMessage?: string
  timeTutored: number
  notifications?: SessionNotification[]
  photos?: string[]
  student: UserForAdmin
  volunteer?: UserForAdmin
  messages: MessageForFrontend[]
  toReview: boolean
  toolType: string
}

export async function getMessagesForFrontend(
  sessionId: Ulid,
  client?: PoolClient
): Promise<MessageForFrontend[]> {
  try {
    const usableClient = client ? client : getClient()
    const result = await pgQueries.getSessionMessagesForFrontend.run(
      { sessionId },
      usableClient
    )
    return result.map(v => makeRequired(v))
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
      'volunteerJoinedAt',
      'photos',
      'endedAt',
      'endedBy',
      'quillDoc',
      'reportMessage',
      'reportReason',
      'reviewReasons',
    ])
    const userAgentResult = await pgQueries.getSessionUserAgent.run(
      { sessionId },
      client
    )
    const userAgent = userAgentResult.length
      ? makeSomeRequired(userAgentResult[0], [])
      : undefined
    const userResult = await pgQueries.getUserForSessionAdminView.run(
      { sessionId },
      client
    )
    const users = userResult.map(v => makeRequired(v))
    const volunteer = users.find(v => !!v.isVolunteer)
    const student = users.find(v => !v.isVolunteer)
    if (!student)
      throw new RepoReadError(`Did not find student for session ${sessionId}`)
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
      student: { ...student, _id: student.id },
      volunteer: volunteer ? { ...volunteer, _id: volunteer.id } : undefined,
      messages,
      feedbacks,
      surveyResponses: {
        presessionSurvey,
        studentPostsessionSurvey,
        volunteerPostsessionSurvey,
      },
      _id: session.id,
      userAgent,
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
  studentBanned: boolean
): Promise<Ulid> {
  try {
    const result = await pgQueries.createSession.run(
      { id: getDbUlid(), studentId, subject, studentBanned },
      getClient()
    )
    return makeRequired(result[0]).id
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export type CurrentSessionUser = {
  _id: Ulid
  // TODO: remove `firstname` in favor of `firstName`. The frontend must be refactored first
  firstname: string
  firstName: string
  isVolunteer: boolean
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
  toolType: string
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
  client: PoolClient
): Promise<CurrentSession> {
  try {
    const messages = await getMessagesForFrontend(session.id, client)
    const userResult = await pgQueries.getCurrentSessionUser.run(
      { sessionId: session.id },
      client
    )
    const users = userResult.map(v => makeRequired(v))
    const student = users.find(v => !v.isVolunteer)
    if (!student) throw new Error('Session student not found')
    const volunteer = users.find(v => v.isVolunteer)
    return {
      ...session,
      student: { _id: session.studentId, ...student },
      volunteer:
        !!volunteer && session.volunteerId
          ? { _id: session.volunteerId, ...volunteer }
          : undefined,
      _id: session.id,
      messages,
    }
  } catch (error) {
    throw new RepoReadError(error)
  }
}

export async function getCurrentSessionByUserId(
  userId: Ulid
): Promise<CurrentSession | undefined> {
  const client = await getClient().connect()
  try {
    const result = await pgQueries.getCurrentSessionByUserId.run(
      { userId },
      client
    )
    if (!result.length) return
    else {
      const session = makeSomeOptional(result[0], [
        'volunteerId',
        'endedAt',
        'volunteerJoinedAt',
      ])
      return handleSessionParsingForUser(session, client)
    }
  } catch (error) {
    throw new RepoReadError(error)
  } finally {
    client.release()
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

export async function getSessionHistoryIdsByUserId(
  userId: Ulid
): Promise<{ id: Ulid }[]> {
  const client = await getClient().connect()
  try {
    const result = await pgQueries.getSessionHistoryIdsByUserId.run(
      { userId, minSessionLength: config.minSessionLength },
      client
    )
    if (!result.length) return []
    else return result.map(v => makeRequired(v))
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

export async function getCurrentSessionBySessionId(
  sessionId: Ulid
): Promise<CurrentSession | undefined> {
  const client = await getClient().connect()
  try {
    const result = await pgQueries.getCurrentSessionBySessionId.run(
      { sessionId },
      client
    )
    const session = makeSomeOptional(result[0], [
      'volunteerJoinedAt',
      'volunteerId',
      'endedAt',
    ])
    const messages = await getMessagesForFrontend(session.id, client)
    const userResult = await pgQueries.getCurrentSessionUser.run(
      { sessionId: session.id },
      client
    )
    const users = userResult.map(v => makeRequired(v))
    const student = users.find(v => !v.isVolunteer)
    if (!student) throw new Error('Session student not found')
    const volunteer = users.find(v => v.isVolunteer)
    return {
      ...session,
      student: { _id: session.studentId, ...student },
      volunteer:
        !!volunteer && session.volunteerId
          ? { _id: session.volunteerId, ...volunteer }
          : undefined,
      _id: session.id,
      messages,
    }
  } catch (error) {
    throw new RepoReadError(error)
  } finally {
    client.release()
  }
}

export type StudentLatestSession = {
  id: string
  createdAt: Date
  subject: string
  timeTutored: number
}
export async function getLatestSessionByStudentId(
  studentId: Ulid
): Promise<StudentLatestSession | undefined> {
  try {
    const result = await pgQueries.getLatestSessionByStudentId.run(
      { studentId },
      getClient()
    )
    if (!result.length) return
    return makeRequired(result[0])
  } catch (error) {
    throw error
  }
}

export async function updateSessionVolunteerById(
  sessionId: Ulid,
  volunteerId: Ulid
): Promise<void> {
  try {
    const result = await pgQueries.updateSessionVolunteerById.run(
      { sessionId, volunteerId },
      getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export type SessionForChatbot = {
  id: Ulid
  messages: MessageForFrontend[]
  topic: string
  subject: string
  volunteerJoinedAt?: Date
  createdAt: Date
  endedAt?: Date
  student: Ulid
  studentFirstName: string
  toolType: string
}
export async function getSessionForChatbot(
  sessionId: Ulid
): Promise<SessionForChatbot | undefined> {
  const client = await getClient().connect()
  try {
    const result = await pgQueries.getSessionForChatbot.run(
      { sessionId },
      client
    )
    const session = makeSomeOptional(result[0], [
      'endedAt',
      'volunteerJoinedAt',
    ])
    const messages = await getMessagesForFrontend(sessionId, client)
    return {
      ...session,
      messages,
    }
  } catch (err) {
    throw new RepoReadError(err)
  } finally {
    client.release()
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
    return result.map(v => makeRequired(v))
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
      result.map(async row => {
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
    return result.map(v => {
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
    const sessions = sessionResult.map(v =>
      makeSomeOptional(v, [
        'volunteerEmail',
        'volunteerFirstName',
        'volunteerIsBanned',
        'volunteerTestUser',
        'volunteerTotalPastSessions',
        'reviewReasons',
      ])
    )
    const sessionsInfo = sessions.map(async session => {
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
        !!session.volunteerIsBanned &&
        !!session.volunteerTestUser &&
        !!session.volunteerTotalPastSessions
      ) {
        volunteer = {
          firstname: session.volunteerFirstName,
          isBanned: session.volunteerIsBanned,
          isTestUser: session.volunteerTestUser,
          totalPastSessions: session.volunteerTotalPastSessions,
        }
        session.volunteerEmail = session.volunteerEmail.toLowerCase()
      }

      const student = {
        firstname: session.studentFirstName,
        isBanned: session.studentIsBanned,
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
  reviewReasons: USER_SESSION_METRICS[],
  // Use this property to override the reviewed status of a session
  reviewed?: boolean
): Promise<void> {
  const client = await getClient().connect()
  try {
    await client.query('BEGIN')
    for (const flag of reviewReasons) {
      const result = await pgQueries.insertSessionReviewReason.run(
        { sessionId, flag },
        client
      )
      if (!result.length && makeRequired(result[0]).ok)
        throw new Error('Insert did not return ok')
    }
    const result = await pgQueries.updateSessionToReview.run(
      { sessionId, reviewed },
      client
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new Error('Updating to_review did not return ok')
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw new RepoCreateError(err)
  } finally {
    client.release()
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
    if (result.length) return result.map(row => makeRequired(row))
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

export async function getSessionHistory(
  userId: Ulid,
  limit: number,
  offset: number
): Promise<SessionForSessionHistory[]> {
  try {
    const result = await pgQueries.getSessionHistory.run(
      {
        userId,
        minSessionLength: config.minSessionLength,
        limit,
        offset,
      },
      getClient()
    )

    if (result.length) return result.map(v => makeRequired(v))
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTotalSessionHistory(userId: Ulid): Promise<number> {
  try {
    const result = await pgQueries.getTotalSessionHistory.run(
      { userId, minSessionLength: config.minSessionLength },
      getClient()
    )

    if (result.length) return makeRequired(result[0]).total
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
  const client = await getClient().connect()
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
    return result.map(v => makeSomeOptional(v, ['volunteerId', 'quillDoc']))
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
    for (const subject of result.map(v => makeRequired(v))) {
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
