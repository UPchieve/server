import crypto from 'crypto'
import _ from 'lodash'
import moment from 'moment'
import { Types } from 'mongoose'
import { User } from '@sentry/types'
import Case from 'case'
import { isEnabled } from 'unleash-client'
import * as SessionRepo from '../models/Session'
import {
  USER_BAN_REASON,
  SESSION_REPORT_REASON,
  EVENTS,
  SESSION_FLAGS,
  UTC_TO_HOUR_MAPPING
} from '../constants'
import * as UserActionCtrl from '../controllers/UserActionCtrl'
import * as sessionUtils from '../utils/session-utils'
import config from '../config'
import { asString } from '../utils/type-utils'
import { Jobs } from '../worker/jobs'
import * as AssistmentsDataRepo from '../models/AssistmentsData'
import logger from '../logger'
import * as cache from '../cache'
import { NotAllowedError } from '../models/Errors'
import { SESSION_EVENTS } from '../constants/events'
import {
  StudentCounselingFeedback,
  StudentTutoringFeedback,
  VolunteerFeedback
} from '../models/Feedback'
import * as VolunteerService from './VolunteerService'
import QueueService from './QueueService'
import * as WhiteboardService from './WhiteboardService'
import * as QuillDocService from './QuillDocService'
import * as AnalyticsService from './AnalyticsService'
import * as NotificationService from './NotificationService'
import UserService from './UserService'
import * as FeedbackService from './FeedbackService'

import { getSessionRequestedUserAgentFromSessionId } from './UserActionService'
import * as AwsService from './AwsService'
import { getFeedbackForSession } from './FeedbackService'
import { beginRegularNotifications, beginFailsafeNotifications } from './twilio'
import { captureEvent } from './AnalyticsService'
import * as PushTokenService from './PushTokenService'
import { emitter } from './EventsService'

const {
  getSessionById,
  getSessionsWithPipeline,
  getActiveSessionsWithVolunteers,
  getPublicSession,
  getCurrentSession,
  getUnfulfilledSessions,
  addNotifications,
  updateFlags,
  updateSessionMetrics,
  setQuillDoc,
  setHasWhiteboardDoc
} = SessionRepo

const { getFeedbackFlags, isSessionFulfilled } = sessionUtils

export {
  getSessionById,
  getSessionsWithPipeline,
  getActiveSessionsWithVolunteers,
  getPublicSession,
  getCurrentSession,
  getUnfulfilledSessions,
  addNotifications,
  updateFlags,
  getFeedbackFlags,
  isSessionFulfilled
}

export async function reviewSession(data: unknown) {
  const { sessionId, reviewed, toReview } = sessionUtils.asReviewSessionData(
    data
  )
  return SessionRepo.updateReviewedStatus(sessionId, { reviewed, toReview })
}

export async function sessionsToReview(data: unknown) {
  const page = asString(data)
  const pageNum = parseInt(page) || 1
  const PER_PAGE = 15
  const skip = (pageNum - 1) * PER_PAGE
  const query = {
    toReview: true,
    reviewed: false
  }

  const sessions = await SessionRepo.getSessionsToReview({
    query,
    skip,
    limit: PER_PAGE
  })
  const isLastPage = sessions.length < PER_PAGE
  return { sessions, isLastPage }
}

export async function getTimeTutoredForDateRange(
  volunteerId,
  fromDate,
  toDate
) {
  const [result] = await SessionRepo.getTotalTimeTutoredForDateRange(
    volunteerId,
    fromDate,
    toDate
  )
  if (result) return result.timeTutored
  else return 0
}

export async function reportSession(data: unknown) {
  const {
    user,
    sessionId,
    reportReason,
    reportMessage
  } = sessionUtils.asReportSessionData(data)
  const session = await SessionRepo.getSessionById(sessionId)
  if (
    !session.volunteer ||
    !user._id.equals(session.volunteer as Types.ObjectId)
  )
    throw new sessionUtils.ReportSessionError('Unable to report this session')

  const reportedBy = user
  await SessionRepo.updateReportSession(sessionId, {
    reportMessage,
    reportReason
  })

  const isBanReason = reportReason === SESSION_REPORT_REASON.STUDENT_RUDE
  if (isBanReason && reportedBy.isVolunteer) {
    await UserService.banUser({
      userId: session.student,
      banReason: USER_BAN_REASON.SESSION_REPORTED
    })
    await new UserActionCtrl.AccountActionCreator(
      session.student as Types.ObjectId,
      '',
      {
        session: session._id,
        banReason: USER_BAN_REASON.SESSION_REPORTED
      }
    ).accountBanned()
    await AnalyticsService.captureEvent(
      session.student as Types.ObjectId,
      EVENTS.ACCOUNT_BANNED,
      {
        event: EVENTS.ACCOUNT_BANNED,
        sessionId: session._id.toString(),
        banReason: USER_BAN_REASON.SESSION_REPORTED
      }
    )
  }

  // Queue up job to send reporting alert emails
  const emailData = {
    studentId: session.student,
    reportedBy: user.email,
    reportReason,
    reportMessage,
    isBanReason,
    sessionId
  }

  if (session.endedAt) QueueService.add(Jobs.EmailSessionReported, emailData)
  else
    await cache.saveWithExpiration(
      `${sessionId}-reported`,
      JSON.stringify(emailData)
    )
}

async function isSessionAssistments(
  sessionId: Types.ObjectId | string
): Promise<boolean> {
  const ad = await AssistmentsDataRepo.getBySession(sessionId)
  return ad && !_.isEmpty(ad)
}

export async function endSession({
  sessionId,
  endedBy = null,
  isAdmin = false
}: {
  sessionId: string
  endedBy: User
  isAdmin?: boolean
}) {
  const session = await SessionRepo.getSessionToEnd(sessionId)
  if (session.endedAt)
    throw new sessionUtils.EndSessionError('Session has already ended')
  if (!isAdmin && !sessionUtils.isSessionParticipant(session, endedBy))
    throw new sessionUtils.EndSessionError(
      'Only session participants can end a session'
    )

  await SessionRepo.updateSessionToEnd(session._id, {
    endedAt: new Date(),
    // @note: endedBy is sometimes null when the session is ended by a job from the queue
    //        due to the session being unmatched for an extended period of time
    endedBy: endedBy && endedBy._id
  })

  emitter.emit(SESSION_EVENTS.SESSION_ENDED, session._id)
}

export async function processAddPastSession(sessionId: string) {
  const session = await getSessionById(sessionId)
  const updates = []
  updates.push(UserService.addPastSession(session.student, session._id))
  if (session.volunteer)
    updates.push(UserService.addPastSession(session.volunteer, session._id))

  const results = await Promise.allSettled(updates)
  results.forEach(result => {
    if (result.status === 'rejected')
      logger.error(
        `Failed to add past session: ${sessionId} - error: ${result.reason}`
      )
  })
  emitter.emit(SESSION_EVENTS.PAST_SESSION_ADDED, sessionId)
}

export async function processAssistmentsSession(sessionId: string) {
  const session = await getSessionById(sessionId)
  if (session?.volunteer && (await isSessionAssistments(sessionId))) {
    logger.info(`Ending an assistments session: ${sessionId}`)
    if (isEnabled('send-assistments-data'))
      QueueService.add(Jobs.SendAssistmentsData, { sessionId })
  }
}

export async function processSessionReported(sessionId: string) {
  try {
    QueueService.add(
      Jobs.EmailSessionReported,
      JSON.parse(await cache.get(`${sessionId}-reported`))
    )
    await cache.remove(`${sessionId}-reported`)
  } catch (err) {
    // we don't care if the key is not found
    if (!(err instanceof cache.KeyNotFoundError)) throw err
  }
}

export async function processCalculateMetrics(sessionId: string) {
  const session = await getSessionById(sessionId)
  let timeTutored = 0
  if (!session.flags.includes(SESSION_FLAGS.ABSENT_USER))
    timeTutored = sessionUtils.calculateTimeTutored(session)

  await updateSessionMetrics(sessionId, { timeTutored })
  emitter.emit(SESSION_EVENTS.SESSION_METRICS_CALCULATED, sessionId)
}

export async function processFirstSessionCongratsEmail(sessionId: string) {
  const session = await SessionRepo.getSessionByIdWithStudentAndVolunteer(
    sessionId
  )
  const fifteenMinutes = 1000 * 60 * 15
  const isLongSession = session.timeTutored >= fifteenMinutes
  const sendStudentFirstSessionCongrats =
    session.student.pastSessions.length === 1 && isLongSession
  const sendVolunteerFirstSessionCongrats =
    session.volunteer?.pastSessions.length === 1 && isLongSession
  // send at 11 am EST tomorrow
  const hourToSendTomorrowInMS = moment()
    .utc()
    .startOf('day')
    .add(1, 'day')
    .add(15, 'hour')
    .toDate()
    .getTime()
  const nowInMS = new Date().getTime()
  const delay = hourToSendTomorrowInMS - nowInMS
  if (sendStudentFirstSessionCongrats)
    QueueService.add(
      Jobs.EmailStudentFirstSessionCongrats,
      {
        sessionId: session._id
      },
      { delay }
    )
  if (sendVolunteerFirstSessionCongrats) {
    QueueService.add(
      Jobs.EmailVolunteerFirstSessionCongrats,
      {
        sessionId: session._id
      },
      { delay }
    )
  }
}

export async function storeAndDeleteQuillDoc(sessionId: string) {
  const quillDoc = await QuillDocService.getDoc(sessionId)
  await setQuillDoc(sessionId, JSON.stringify(quillDoc))
  await QuillDocService.deleteDoc(sessionId)
}

export async function storeAndDeleteWhiteboardDoc(sessionId: string) {
  const whiteboardDoc = await WhiteboardService.getDoc(sessionId)
  const hasWhiteboardDoc = await WhiteboardService.uploadedToStorage(
    sessionId,
    whiteboardDoc
  )
  await setHasWhiteboardDoc(sessionId, hasWhiteboardDoc)
  await WhiteboardService.deleteDoc(sessionId)
}

export async function processSessionEditors(sessionId: string) {
  const session = await getSessionById(sessionId)
  if (sessionUtils.isSubjectUsingDocumentEditor(session.subTopic))
    await storeAndDeleteQuillDoc(sessionId)
  else await storeAndDeleteWhiteboardDoc(sessionId)
}

export async function processEmailPartnerVolunteer(sessionId: string) {
  const session = await SessionRepo.getSessionToEnd(sessionId)
  if (session.volunteer?.volunteerPartnerOrg) {
    const delay = 1000 * 60 * 5
    if (session.volunteer.pastSessions.length === 5)
      QueueService.add(
        Jobs.EmailPartnerVolunteerReferACoworker,
        {
          volunteerId: session.volunteer._id,
          firstName: session.volunteer.firstname,
          email: session.volunteer.email,
          partnerOrg: session.volunteer.volunteerPartnerOrg
        },
        { delay }
      )

    if (session.volunteer.pastSessions.length === 10)
      QueueService.add(
        Jobs.EmailPartnerVolunteerTenSessionMilestone,
        {
          volunteerId: session.volunteer._id,
          firstName: session.volunteer.firstname,
          email: session.volunteer.email
        },
        { delay }
      )
  }
}

export async function processSetFlags(sessionId: string) {
  const session = await SessionRepo.getSessionToEnd(sessionId)
  const flags = sessionUtils.getReviewFlags(session)
  const toReview = flags.length > 0 && sessionUtils.hasReviewTriggerFlags(flags)
  await updateFlags(sessionId, { flags, toReview })
  emitter.emit(SESSION_EVENTS.FLAGS_SET, sessionId)
}

export async function processVolunteerTimeTutored(sessionId: string) {
  const session = await SessionRepo.getSessionById(sessionId)
  if (session.volunteer)
    await VolunteerService.updateTimeTutored(
      session.volunteer,
      session.timeTutored
    )
}

export async function processFeedbackSaved(
  sessionId: string,
  userType: 'student' | 'volunteer'
) {
  const feedback = await FeedbackService.getFeedback({ sessionId, userType })
  // @todo: properly type
  let feedbackResponses:
    | Partial<StudentTutoringFeedback>
    | Partial<StudentCounselingFeedback>
    | Partial<VolunteerFeedback> = {}

  if ('studentTutoringFeedback' in feedback)
    feedbackResponses = feedback.studentTutoringFeedback
  if ('studentCounselingFeedback' in feedback)
    feedbackResponses = feedback.studentCounselingFeedback
  if ('volunteerFeedback' in feedback)
    feedbackResponses = feedback.volunteerFeedback

  const flags = await getFeedbackFlags(feedbackResponses)
  if (flags.length > 0)
    // Feedback flags currently always trigger a need for review
    await updateFlags(sessionId, { flags, toReview: true })
}

/**
 * The worker runs this function every 2 hours at minute 0
 *
 * Get open sessions that were started longer ago than staleThreshold (ms)
 * but no later than the staleThreshold - cron job schedule time
 *
 * Defaults to 12 hours old
 */
export async function getStaleSessions(staleThreshold = 43200000) {
  const cutoffDate = Date.now() - staleThreshold
  const cronJobScheduleTime = 1000 * 60 * 60 * 2 // 2 hours
  const lastCheckedCreatedAtTime = cutoffDate - cronJobScheduleTime

  return SessionRepo.getLongRunningSessions(
    lastCheckedCreatedAtTime,
    cutoffDate
  )
}

export async function getSessionPhotoUploadUrl(sessionId) {
  const sessionPhotoS3Key = `${sessionId}${crypto
    .randomBytes(8)
    .toString('hex')}`
  await SessionRepo.addSessionPhotoKey(sessionId, sessionPhotoS3Key)
  return sessionPhotoS3Key
}

export async function getImageAndUploadUrl(data: unknown) {
  const sessionId = asString(data)
  const sessionPhotoS3Key = await getSessionPhotoUploadUrl(sessionId)
  const uploadUrl = await AwsService.getSessionPhotoUploadUrl(sessionPhotoS3Key)
  const bucketName = config.awsS3.sessionPhotoBucket
  const imageUrl = `https://${bucketName}.s3.amazonaws.com/${sessionPhotoS3Key}`
  return { uploadUrl, imageUrl }
}

export async function adminFilteredSessions(data: unknown) {
  const {
    showBannedUsers,
    showTestUsers,
    minSessionLength,
    sessionActivityFrom,
    sessionActivityTo,
    minMessagesSent,
    studentRating,
    volunteerRating,
    firstTimeStudent,
    firstTimeVolunteer,
    isReported,
    page
  } = sessionUtils.asAdminFilteredSessionsData(data)
  const PER_PAGE = 15
  const pageNum = parseInt(page) || 1
  const skip = (pageNum - 1) * PER_PAGE
  const oneDayInMS = 1000 * 60 * 60 * 24
  const estTimeOffset = 1000 * 60 * 60 * 4

  // Add a day to the sessionActivityTo to make it inclusive for the activity range: [sessionActivityFrom, sessionActivityTo]
  const inclusiveSessionActivityTo =
    new Date(sessionActivityTo).getTime() + oneDayInMS + estTimeOffset
  const offsetSessionActivityFrom =
    new Date(sessionActivityFrom).getTime() + estTimeOffset

  const sessionQueryFilter: {
    sessionLength: { $gte: number }
    isReported?: boolean
  } = {
    // Filter by the length of a session
    sessionLength: { $gte: parseInt(minSessionLength) * 60000 }
  }
  if (isReported) sessionQueryFilter.isReported = true

  const ratingQueryFilter: {
    studentRating?: number
    volunteerRating?: number
  } = {}
  if (Number(studentRating))
    ratingQueryFilter.studentRating = Number(studentRating)
  if (Number(volunteerRating))
    ratingQueryFilter.volunteerRating = Number(volunteerRating)

  const userQueryFilter: {
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
  } = {
    'student.isTestUser': showTestUsers ? { $in: [true, false] } : false
  }
  if (firstTimeStudent && firstTimeVolunteer) {
    userQueryFilter.$or = [
      { 'student.totalPastSessions': 1 },
      { 'volunteer.totalPastSessions': 1 }
    ]
  } else if (firstTimeStudent) {
    userQueryFilter['student.totalPastSessions'] = 1
  } else if (firstTimeVolunteer) {
    userQueryFilter['volunteer.totalPastSessions'] = 1
  }

  const sessions = await SessionRepo.getAdminFilteredSessions({
    startDate: offsetSessionActivityFrom,
    endDate: inclusiveSessionActivityTo,
    minMessagesSent,
    userQueryFilter,
    sessionQueryFilter,
    ratingQueryFilter,
    showBannedUsers,
    skip,
    limit: PER_PAGE
  })
  const isLastPage = sessions.length < PER_PAGE
  return { sessions, isLastPage }
}

export async function adminSessionView(data: unknown) {
  const sessionId = asString(data)
  const session = await SessionRepo.getSessionByIdWithStudentAndVolunteer(
    sessionId
  )

  if (
    sessionUtils.isSubjectUsingDocumentEditor(session.subTopic) &&
    !session.endedAt
  ) {
    const quillDoc = await QuillDocService.getDoc(sessionId)
    session.quillDoc = JSON.stringify(quillDoc)
  }

  const sessionUserAgent = await getSessionRequestedUserAgentFromSessionId(
    sessionId
  )
  const feedback = await getFeedbackForSession(sessionId)
  const sessionPhotos = await AwsService.getObjects({
    bucket: 'sessionPhotoBucket',
    s3Keys: session.photos
  })

  return {
    ...session,
    userAgent: sessionUserAgent,
    feedbacks: feedback,
    photos: sessionPhotos
  }
}

export async function startSession(data: unknown) {
  const {
    ip,
    user,
    sessionSubTopic,
    sessionType,
    problemId,
    assignmentId,
    studentId,
    userAgent
  } = sessionUtils.asStartSessionData(data)

  const userId = user._id
  if (user.isVolunteer)
    throw new sessionUtils.StartSessionError(
      'Volunteers cannot create new sessions'
    )

  if (isEnabled('student-banned-state')) {
    if (user.isBanned)
      throw new sessionUtils.StartSessionError(
        'Banned students cannot request a new session'
      )
  }

  const currentSession = await SessionRepo.getCurrentSession(userId)
  if (currentSession)
    throw new sessionUtils.StartSessionError(
      'Student already has an active session'
    )

  const newSession = await SessionRepo.createSession({
    studentId: userId,
    // @note: sessionType and subtopic are kebab-case
    type: Case.camel(sessionType),
    subTopic: Case.camel(sessionSubTopic),
    isStudentBanned: user.isBanned
  })

  const numProblemId = Number(problemId)
  if (numProblemId && assignmentId && studentId)
    try {
      await AssistmentsDataRepo.createBySession(
        numProblemId,
        assignmentId,
        studentId,
        newSession._id
      )
    } catch (error) {
      logger.error(
        `Unable to create ASSISTments data for session: ${newSession._id}, ASSISTments studentId: ${studentId}, assignmentId: ${assignmentId}, problemId: ${problemId}, error: ${error.message}`
      )
    }

  if (!user.isBanned) {
    await beginRegularNotifications(newSession)
    await beginFailsafeNotifications(newSession)
  }

  // Auto end the session after 45 minutes if the session is unmatched
  const delay = 1000 * 60 * 45
  QueueService.add(
    Jobs.EndUnmatchedSession,
    { sessionId: newSession._id },
    { delay }
  )

  await new UserActionCtrl.SessionActionCreator(
    user._id,
    newSession._id,
    userAgent,
    ip
  ).requestedSession()

  return newSession._id
}

export async function finishSession(data: unknown, SocketService) {
  const { sessionId, user, userAgent, ip } = sessionUtils.asFinishSessionData(
    data
  )

  await endSession({
    sessionId,
    endedBy: user
  })
  // @todo: figure out a better way to instantiate SocketService
  await SocketService.emitSessionChange(sessionId)
  await new UserActionCtrl.SessionActionCreator(
    user._id,
    sessionId,
    userAgent,
    ip
  ).endedSession()
}

export async function checkSession(data: unknown) {
  const sessionId = asString(data)
  const session = await SessionRepo.getSessionById(sessionId)
  return session._id.toString()
}

export async function currentSession(data: unknown) {
  const user = sessionUtils.asUser(data)
  return SessionRepo.getCurrentSession(user._id)
}

export async function studentLatestSession(data: unknown) {
  const userId = asString(data)
  return SessionRepo.getStudentLatestSession(userId)
}

export async function sessionTimedOut(data: unknown) {
  const {
    sessionId,
    timeout,
    user,
    ip,
    userAgent
  } = sessionUtils.asSessionTimedOutData(data)
  return new UserActionCtrl.SessionActionCreator(
    user._id,
    sessionId,
    userAgent,
    ip
  ).timedOutSession(timeout)
}

export async function publicSession(data: unknown) {
  const sessionId = asString(data)
  return SessionRepo.getPublicSession(sessionId)
}

export async function getSessionNotifications(data: unknown) {
  const sessionId = asString(data)
  return NotificationService.getSessionNotifications(sessionId)
}

export async function joinSession(data: unknown): Promise<void> {
  const { socket, session, user, joinedFrom } = sessionUtils.asJoinSessionData(
    data
  )
  const userAgent = socket.request.headers['user-agent']
  const ipAddress = socket.handshake.address
  const sessionIdString = session._id.toString()

  if (session.endedAt) {
    await SessionRepo.updateFailedJoins(sessionIdString, user._id)
    throw new Error('Session has ended')
  }

  if (
    !user.isVolunteer &&
    session.student &&
    session.student.toString() !== user._id.toString()
  ) {
    await SessionRepo.updateFailedJoins(sessionIdString, user._id)
    // eslint-disable-next-line quotes
    throw new Error(`A student cannot join another student's session`)
  }

  if (
    user.isVolunteer &&
    session.volunteer &&
    session.volunteer.toString() !== user._id.toString()
  ) {
    SessionRepo.updateFailedJoins(sessionIdString, user._id)
    throw new Error('A volunteer has already joined the session')
  }

  const isInitialVolunteerJoin = user.isVolunteer && !session.volunteer
  if (isInitialVolunteerJoin) {
    await SessionRepo.addVolunteerToSession(session._id, user._id)
    await new UserActionCtrl.SessionActionCreator(
      user._id,
      session._id.toString(),
      userAgent,
      ipAddress
    ).joinedSession()

    captureEvent(user._id, EVENTS.SESSION_JOINED, {
      event: EVENTS.SESSION_JOINED,
      sessionId: session._id.toString(),
      joinedFrom: joinedFrom || ''
    })

    captureEvent(session.student.toString(), EVENTS.SESSION_MATCHED, {
      event: EVENTS.SESSION_MATCHED,
      sessionId: session._id.toString()
    })

    const pushTokens = await PushTokenService.getAllPushTokensByUserId(
      session.student
    )
    if (pushTokens && pushTokens.length > 0) {
      const tokens = pushTokens.map(token => token.token)
      await PushTokenService.sendVolunteerJoined(session, tokens)
    }
  }

  // After 30 seconds of the this.createdAt, we can assume the user is
  // rejoining the session instead of joining for the first time
  const thirtySecondsElapsed = 1000 * 30
  if (
    !isInitialVolunteerJoin &&
    session.createdAt.getTime() + thirtySecondsElapsed < Date.now()
  ) {
    await new UserActionCtrl.SessionActionCreator(
      user._id,
      session._id.toString(),
      userAgent,
      ipAddress
    ).rejoinedSession()
    captureEvent(user._id, EVENTS.SESSION_REJOINED, {
      event: EVENTS.SESSION_REJOINED,
      sessionId: session._id.toString()
    })
  }
}

export async function saveMessage(data: unknown): Promise<void> {
  const { sessionId, user, message } = sessionUtils.asSaveMessageData(data)
  const session = await SessionRepo.getSessionById(sessionId)
  if (!sessionUtils.isSessionParticipant(session, user))
    throw new Error('Only session participants are allowed to send messages')

  await SessionRepo.addMessage(sessionId, message)
}

export async function generateWaitTimeHeatMap(startDate: Date, endDate: Date) {
  const heatMap = sessionUtils.createEmptyHeatMap()
  const sessions = await SessionRepo.getSessionsWithAvgWaitTimePerDayAndHour(
    startDate,
    endDate
  )

  for (const session of sessions) {
    const day = moment()
      .weekday(session.day)
      .format('dddd')
    const hour = UTC_TO_HOUR_MAPPING[session.hour]
    heatMap[day][hour] = session.averageWaitTime
  }

  return heatMap
}

export async function generateAndStoreWaitTimeHeatMap(
  startDate: Date,
  endDate: Date
) {
  const heatMap = await generateWaitTimeHeatMap(startDate, endDate)
  await cache.save(
    config.cacheKeys.waitTimeHeatMapAllSubjects,
    JSON.stringify(heatMap)
  )
}

export async function getWaitTimeHeatMap(
  data: unknown
): Promise<sessionUtils.HeatMap> {
  const user = sessionUtils.asUser(data)
  if (!user.isVolunteer)
    throw new NotAllowedError('Only volunteers may view the heat map')
  const heatMap = await cache.get(config.cacheKeys.waitTimeHeatMapAllSubjects)
  return JSON.parse(heatMap)
}
