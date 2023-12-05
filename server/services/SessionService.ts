import Case from 'case'
import crypto from 'crypto'
import _ from 'lodash'
import moment from 'moment'
import { Ulid } from '../models/pgUtils'
import { isEnabled } from 'unleash-client'
import * as cache from '../cache'
import config from '../config'
import {
  ACCOUNT_USER_ACTIONS,
  EVENTS,
  FEATURE_FLAGS,
  HOURS_UTC,
  SESSION_ACTIVITY_KEY,
  SESSION_REPORT_REASON,
  SESSION_USER_ACTIONS,
  USER_BAN_REASONS,
  USER_SESSION_METRICS,
  UTC_TO_HOUR_MAPPING,
} from '../constants'
import { SESSION_EVENTS } from '../constants/events'
import logger from '../logger'
import * as AssistmentsDataRepo from '../models/AssistmentsData'
import { DAYS } from '../constants'
import { NotAllowedError } from '../models/Errors'
import { getFeedbackBySessionId } from '../models/Feedback'
import * as NotificationRepo from '../models/Notification'
import { PushToken } from '../models/PushToken'
import { getPushTokensByUserId } from '../models/PushToken'
import {
  Session,
  updateSessionFlagsById,
  updateSessionReviewReasonsById,
} from '../models/Session'
import * as SessionRepo from '../models/Session'
import { User, UserContactInfo } from '../models/User'
import * as UserRepo from '../models/User'
import {
  createAccountAction,
  createSessionAction,
  getSessionRequestedUserAgentFromSessionId,
} from '../models/UserAction'
import * as VolunteerRepo from '../models/Volunteer'
import * as sessionUtils from '../utils/session-utils'
import { asNumber, asString } from '../utils/type-utils'
import { Jobs } from '../worker/jobs'
import * as AnalyticsService from './AnalyticsService'
import { captureEvent } from './AnalyticsService'
import * as AwsService from './AwsService'
import { emitter } from './EventsService'
import * as PushTokenService from './PushTokenService'
import QueueService from './QueueService'
import * as QuillDocService from './QuillDocService'
import SocketService from './SocketService'
import * as TwilioService from './TwilioService'
import { beginRegularNotifications } from './TwilioService'
import * as WhiteboardService from './WhiteboardService'
import { LockError } from 'redlock'
import { getUserAgentInfo } from '../utils/parse-user-agent'
import { getSubjectAndTopic } from '../models/Subjects'
import {
  getAllowDmsToPartnerStudentsFeatureFlag,
  getSessionRecapDmsFeatureFlag,
} from './FeatureFlagService'
import { getStudentPartnerInfoById } from '../models/Student'

export async function reviewSession(data: unknown) {
  const { sessionId, reviewed, toReview } = sessionUtils.asReviewSessionData(
    data
  )
  return SessionRepo.updateSessionReviewedStatusById(
    sessionId,
    reviewed,
    toReview
  )
}

// TODO: Use cursor pagination.
export async function sessionsToReview(
  data: unknown,
  filterBy: { studentFirstName?: string }
) {
  const page = asString(data)
  const pageNum = parseInt(page) || 1
  const PER_PAGE = 15
  const skip = (pageNum - 1) * PER_PAGE

  const sessions = await SessionRepo.getSessionsToReview(
    PER_PAGE,
    skip,
    filterBy
  )
  const isLastPage = sessions.length < PER_PAGE
  return { sessions, isLastPage }
}

export async function getTimeTutoredForDateRange(
  volunteerId: Ulid,
  fromDate: Date,
  toDate: Date
): Promise<number> {
  return await SessionRepo.getTotalTimeTutoredForDateRange(
    volunteerId,
    fromDate,
    toDate
  )
}

export async function handleDmReporting(
  sessionId: Ulid,
  sessionFlags: USER_SESSION_METRICS[]
): Promise<void> {
  await updateSessionFlagsById(sessionId, sessionFlags)
  await updateSessionReviewReasonsById(sessionId, sessionFlags, false)
}

export async function reportSession(user: UserContactInfo, data: unknown) {
  const {
    sessionId,
    reportReason,
    reportMessage,
    source,
  } = sessionUtils.asReportSessionData(data)
  const session = await SessionRepo.getSessionById(sessionId)
  // Only matched sessions can be reported
  if (!session.volunteerId)
    throw new sessionUtils.ReportSessionError('Unable to report this session')

  const reportedBy = user
  await SessionRepo.updateSessionReported(
    sessionId,
    reportReason,
    reportMessage
  )

  // Autoban users if a session is reported from the recap page
  const isBanReason =
    reportReason === SESSION_REPORT_REASON.STUDENT_RUDE || source === 'recap'
  const reportedUser = reportedBy.isVolunteer
    ? session.studentId
    : session.volunteerId
  if (isBanReason) {
    await UserRepo.banUserById(reportedUser, USER_BAN_REASONS.SESSION_REPORTED)
    await createAccountAction({
      userId: reportedUser,
      action: ACCOUNT_USER_ACTIONS.BANNED,
      sessionId: session.id,
      banReason: reportReason,
    })
    AnalyticsService.captureEvent(reportedUser, EVENTS.ACCOUNT_BANNED, {
      event: EVENTS.ACCOUNT_BANNED,
      sessionId: session.id,
      banReason: USER_BAN_REASONS.SESSION_REPORTED,
    })

    if (source === 'recap') {
      const sessionFlags = reportedBy.isVolunteer
        ? [USER_SESSION_METRICS.coachReportedStudentDm]
        : [USER_SESSION_METRICS.studentReportedCoachDm]
      handleDmReporting(sessionId, sessionFlags)
    }
  }

  emitter.emit(SESSION_EVENTS.SESSION_REPORTED, session.id)

  // Queue up job to send reporting alert emails
  const emailData = {
    userId: reportedUser,
    reportedBy: user.email,
    reportReason,
    reportMessage,
    isBanReason,
    sessionId,
  }

  if (session.endedAt)
    await QueueService.add(Jobs.EmailSessionReported, emailData, {
      removeOnComplete: true,
      removeOnFail: true,
    })
  else
    await cache.saveWithExpiration(
      `${sessionId}-reported`,
      JSON.stringify(emailData)
    )
}

async function isSessionAssistments(sessionId: Ulid): Promise<boolean> {
  const ad = await AssistmentsDataRepo.getAssistmentsDataBySession(sessionId)
  if (ad) return !_.isEmpty(ad)
  else return false
}

export async function endSession(
  sessionId: Ulid,
  endedBy: Ulid | null = null,
  isAdmin: boolean = false,
  socketService?: SocketService,
  identifiers?: sessionUtils.RequestIdentifier
) {
  const reqIdentifiers = identifiers
    ? sessionUtils.asRequestIdentifiers(identifiers)
    : undefined

  const session = await SessionRepo.getSessionToEndById(sessionId)
  if (session.endedAt)
    throw new sessionUtils.EndSessionError('Session has already ended')
  if (
    !isAdmin &&
    !sessionUtils.isSessionParticipant(
      session.student.id,
      session.volunteer?.id,
      endedBy ? endedBy : null
    )
  )
    throw new sessionUtils.EndSessionError(
      'Only session participants can end a session'
    )

  await SessionRepo.updateSessionToEnd(
    session.id,
    new Date(),
    // NOTE: endedBy is sometimes null when the session is ended by a worker job
    //        due to the session being unmatched for an extended period of time
    endedBy
  )

  emitter.emit(SESSION_EVENTS.SESSION_ENDED, session.id)

  if (socketService) await socketService.emitSessionChange(sessionId)
  if (endedBy && reqIdentifiers)
    await createSessionAction({
      userId: endedBy,
      sessionId: sessionId,
      ...getUserAgentInfo(reqIdentifiers?.userAgent),
      ipAddress: reqIdentifiers.ip,
      action: SESSION_USER_ACTIONS.ENDED,
    })
}

// registered as listener
export async function processAssistmentsSession(sessionId: Ulid) {
  const session = await SessionRepo.getSessionById(sessionId)
  if (session?.volunteerId && (await isSessionAssistments(sessionId))) {
    logger.info(`Ending an assistments session: ${sessionId}`)
    await QueueService.add(
      Jobs.SendAssistmentsData,
      { sessionId },
      { removeOnComplete: true, removeOnFail: true }
    )
  }
}

export async function processSessionReported(sessionId: Ulid) {
  try {
    await QueueService.add(
      Jobs.EmailSessionReported,
      JSON.parse(await cache.get(`${sessionId}-reported`)),
      { removeOnComplete: true, removeOnFail: true }
    )
    await cache.remove(`${sessionId}-reported`)
  } catch (err) {
    // we don't care if the key is not found
    if (!(err instanceof cache.KeyNotFoundError)) throw err
  }
}

export async function processCalculateMetrics(sessionId: Ulid) {
  const session = await SessionRepo.getSessionById(sessionId)
  let timeTutored = 0
  if (
    !(
      session.flags.includes(USER_SESSION_METRICS.absentStudent) ||
      session.flags.includes(USER_SESSION_METRICS.absentVolunteer)
    )
  )
    timeTutored = await sessionUtils.calculateTimeTutored(session)

  await SessionRepo.updateSessionTimeTutored(sessionId, timeTutored)
  emitter.emit(SESSION_EVENTS.SESSION_METRICS_CALCULATED, sessionId)
}

export async function processFirstSessionCongratsEmail(sessionId: Ulid) {
  const session = await SessionRepo.getSessionByIdWithStudentAndVolunteer(
    sessionId
  )
  const fifteenMinutes = 1000 * 60 * 15
  const isLongSession = session.timeTutored
    ? session.timeTutored >= fifteenMinutes
    : false
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
    await QueueService.add(
      Jobs.EmailStudentFirstSessionCongrats,
      {
        sessionId: session._id,
      },
      { delay, removeOnComplete: true, removeOnFail: true }
    )
  if (sendVolunteerFirstSessionCongrats) {
    await QueueService.add(
      Jobs.EmailVolunteerFirstSessionCongrats,
      {
        sessionId: session._id,
      },
      { delay, removeOnComplete: true, removeOnFail: true }
    )
  }
}

export async function storeAndDeleteQuillDoc(
  sessionId: Ulid,
  retries: number = 0
): Promise<void> {
  let quillState: QuillDocService.QuillCacheState | undefined
  try {
    quillState = await QuillDocService.lockAndGetDocCacheState(sessionId)
  } catch (error) {
    if (error instanceof LockError && retries < 10)
      return storeAndDeleteQuillDoc(sessionId, retries + 1)
    else
      logger.error(
        `Failed to update and get document in the cache for session ${sessionId} - ${error}`
      )
    return
  }

  if (quillState) {
    await SessionRepo.updateSessionQuillDoc(
      sessionId,
      JSON.stringify(quillState.doc)
    )
    await QuillDocService.deleteDoc(sessionId)
  }
}

export async function storeAndDeleteWhiteboardDoc(sessionId: Ulid) {
  const whiteboardDoc = await WhiteboardService.getDoc(sessionId)
  const hasWhiteboardDoc = await WhiteboardService.uploadedToStorage(
    sessionId,
    whiteboardDoc
  )
  await SessionRepo.updateSessionHasWhiteboardDoc(sessionId, hasWhiteboardDoc)
  await WhiteboardService.deleteDoc(sessionId)
}

export async function processSessionEditors(sessionId: Ulid) {
  const session = await SessionRepo.getSessionById(sessionId)
  if (sessionUtils.isSubjectUsingDocumentEditor(session.toolType))
    await storeAndDeleteQuillDoc(sessionId)
  else await storeAndDeleteWhiteboardDoc(sessionId)
}

export async function processEmailVolunteer(sessionId: Ulid) {
  const session = await SessionRepo.getSessionToEndById(sessionId)
  if (session.volunteer?.numPastSessions === 10)
    await QueueService.add(
      Jobs.EmailVolunteerTenSessionMilestone,
      {
        volunteerId: session.volunteer.id,
      },
      { removeOnComplete: true, removeOnFail: true }
    )
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
  const lastCheckedCreatedAtTime = new Date(cutoffDate - cronJobScheduleTime)

  return SessionRepo.getLongRunningSessions(
    lastCheckedCreatedAtTime,
    new Date(cutoffDate)
  )
}

export async function getSessionPhotoUploadUrl(sessionId: Ulid) {
  const sessionPhotoS3Key = `${sessionId}${crypto
    .randomBytes(8)
    .toString('hex')}`
  await SessionRepo.updateSessionPhotoKey(sessionId, sessionPhotoS3Key)
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
    page,
  } = sessionUtils.asAdminFilteredSessionsData(data)
  const PER_PAGE = 15
  const pageNum = parseInt(page) || 1
  const skip = (pageNum - 1) * PER_PAGE
  const oneDayInMS = 1000 * 60 * 60 * 24
  const estTimeOffset = 1000 * 60 * 60 * 4

  // Add a day to the sessionActivityTo to make it inclusive for the activity range: [sessionActivityFrom, sessionActivityTo]
  const inclusiveSessionActivityTo = new Date(
    new Date(sessionActivityTo).getTime() + oneDayInMS + estTimeOffset
  )
  const offsetSessionActivityFrom = new Date(
    new Date(sessionActivityFrom).getTime() + estTimeOffset
  )

  const sessions = await SessionRepo.getSessionsForAdminFilter(
    offsetSessionActivityFrom,
    inclusiveSessionActivityTo,
    PER_PAGE,
    skip,
    {
      firstTimeStudent: !!firstTimeStudent,
      firstTimeVolunteer: !!firstTimeVolunteer,
      showTestUsers: !!showTestUsers,
      showBannedUsers: !!showBannedUsers,
      reported: !!isReported,
      messageCount: minMessagesSent ? Number(minMessagesSent) : undefined,
      sessionLength: minSessionLength ? Number(minSessionLength) : undefined,
      volunteerRating: volunteerRating ? Number(volunteerRating) : undefined,
      studentRating: studentRating ? Number(studentRating) : undefined,
    }
  )
  const isLastPage = sessions.length < PER_PAGE
  return { sessions, isLastPage }
}

export async function adminSessionView(data: unknown) {
  const sessionId = asString(data)
  const session = await SessionRepo.getSessionByIdWithStudentAndVolunteer(
    sessionId
  )

  if (
    sessionUtils.isSubjectUsingDocumentEditor(session.toolType) &&
    !session.endedAt
  ) {
    const quillDoc = await QuillDocService.getDoc(sessionId)
    session.quillDoc = JSON.stringify(quillDoc)
  }

  const sessionUserAgent = await getSessionRequestedUserAgentFromSessionId(
    sessionId
  )
  const feedback = await getFeedbackBySessionId(sessionId)
  const bucket: keyof typeof config.awsS3 = 'sessionPhotoBucket'
  const sessionPhotos = await AwsService.getObjects(
    bucket,
    session.photos || []
  )

  return {
    ...session,
    userAgent: sessionUserAgent,
    feedbacks: feedback,
    photos: sessionPhotos,
  }
}

export async function startSession(user: UserContactInfo, data: unknown) {
  const {
    ip,
    sessionSubTopic,
    sessionType,
    problemId,
    assignmentId,
    studentId,
    userAgent,
  } = sessionUtils.asStartSessionData(data)
  const subject = Case.camel(sessionSubTopic)
  const topic = Case.camel(sessionType)

  const isValid = await getSubjectAndTopic(subject, topic)
  if (!isValid)
    throw new sessionUtils.StartSessionError(
      `Unable to start new session for the topic ${topic} and subject ${subject}`
    )

  const userId = user.id
  if (user.isVolunteer)
    throw new sessionUtils.StartSessionError(
      'Volunteers cannot create new sessions'
    )

  if (user.banned)
    throw new sessionUtils.StartSessionError(
      'Banned students cannot request a new session'
    )

  const currentSession = await SessionRepo.getCurrentSessionByUserId(userId)
  if (currentSession)
    throw new sessionUtils.StartSessionError(
      'Student already has an active session'
    )

  const newSessionId = await SessionRepo.createSession(
    userId,
    // NOTE: sessionType and subtopic are kebab-case
    subject,
    user.banned
  )

  const numProblemId = Number(problemId)
  if (numProblemId && assignmentId && studentId)
    try {
      await AssistmentsDataRepo.createAssistmentsDataBySessionId(
        numProblemId,
        assignmentId,
        studentId,
        newSessionId
      )
    } catch (error) {
      logger.error(
        `Unable to create ASSISTments data for session: ${newSessionId}, ASSISTments studentId: ${studentId}, assignmentId: ${assignmentId}, problemId: ${problemId}, error: ${
          (error as Error).message
        }`
      )
    }

  if (!user.banned) {
    await beginRegularNotifications(newSessionId)
  }

  // Auto end the session after 45 minutes if the session is unmatched
  const delay = 1000 * 60 * 45
  await QueueService.add(
    Jobs.EndUnmatchedSession,
    { sessionId: newSessionId },
    { delay, removeOnComplete: true, removeOnFail: true }
  )

  // Begin chat bot messages immedeately
  if (isEnabled(FEATURE_FLAGS.CHATBOT))
    await QueueService.add(
      Jobs.Chatbot,
      { sessionId: newSessionId },
      { removeOnComplete: true, removeOnFail: true }
    )

  await createSessionAction({
    userId: user.id,
    sessionId: newSessionId,
    ...getUserAgentInfo(userAgent),
    ipAddress: ip,
    action: SESSION_USER_ACTIONS.REQUESTED,
  })

  return newSessionId
}

export async function checkSession(data: unknown) {
  const sessionId = asString(data)
  const session = await SessionRepo.getSessionById(sessionId)
  return session.id
}

export async function currentSession(userId: Ulid) {
  return await SessionRepo.getCurrentSessionByUserId(userId)
}

export async function getRecapSessionForDms(userId: Ulid) {
  return await SessionRepo.getRecapSessionForDmsBySessionId(userId)
}

export async function studentLatestSession(data: unknown) {
  const userId = asString(data)
  return await SessionRepo.getLatestSessionByStudentId(userId)
}

export async function sessionTimedOut(user: UserContactInfo, data: unknown) {
  const {
    sessionId,
    timeout,
    ip,
    userAgent,
  } = sessionUtils.asSessionTimedOutData(data)
  await createSessionAction({
    userId: user.id,
    sessionId: sessionId,
    ...getUserAgentInfo(userAgent),
    ipAddress: ip,
    action:
      timeout === 15
        ? SESSION_USER_ACTIONS.TIMED_OUT_15_MINS
        : SESSION_USER_ACTIONS.TIMED_OUT_45_MINS,
  })
}

export async function publicSession(data: unknown) {
  const sessionId = asString(data)
  return SessionRepo.getPublicSessionById(sessionId)
}

export async function getSessionNotifications(data: unknown) {
  const sessionId = asString(data)
  return NotificationRepo.getSessionNotificationsWithSessionId(sessionId)
}

export async function joinSession(
  user: UserContactInfo,
  session: Session,
  data: unknown
): Promise<void> {
  const { socket, joinedFrom } = sessionUtils.asJoinSessionData(data)
  const userAgent = socket.request?.headers['user-agent']
  const ipAddress = socket.handshake?.address

  if (session.endedAt) {
    await SessionRepo.updateSessionFailedJoinsById(session.id, user.id)
    throw new Error('Session has ended')
  }

  if (!user.isVolunteer && session.studentId && session.studentId !== user.id) {
    await SessionRepo.updateSessionFailedJoinsById(session.id, user.id)
    throw new Error(`A student cannot join another student's session`)
  }

  if (
    user.isVolunteer &&
    session.volunteerId &&
    session.volunteerId !== user.id
  ) {
    SessionRepo.updateSessionFailedJoinsById(session.id, user.id)
    throw new Error('A volunteer has already joined the session')
  }

  const isInitialVolunteerJoin = user.isVolunteer && !session.volunteerId
  if (isInitialVolunteerJoin) {
    await SessionRepo.updateSessionVolunteerById(session.id, user.id)
    await createSessionAction({
      userId: user.id,
      sessionId: session.id,
      ...getUserAgentInfo(userAgent ? userAgent : ''),
      ipAddress,
      action: SESSION_USER_ACTIONS.JOINED,
    })

    captureEvent(user.id, EVENTS.SESSION_JOINED, {
      event: EVENTS.SESSION_JOINED,
      sessionId: session.id,
      joinedFrom: joinedFrom || '',
    })

    captureEvent(session.studentId, EVENTS.SESSION_MATCHED, {
      event: EVENTS.SESSION_MATCHED,
      sessionId: session.id,
    })

    const pushTokens = await getPushTokensByUserId(session.studentId)
    if (pushTokens && pushTokens.length > 0) {
      const tokens = pushTokens.map((token: PushToken) => token.token)
      await PushTokenService.sendVolunteerJoined(session as Session, tokens)
    }
  }

  // After 30 seconds of the this.createdAt, we can assume the user is
  // rejoining the session instead of joining for the first time
  const thirtySecondsElapsed = 1000 * 30
  if (
    !isInitialVolunteerJoin &&
    session.createdAt.getTime() + thirtySecondsElapsed < Date.now()
  ) {
    await createSessionAction({
      userId: user.id,
      sessionId: session.id,
      ...getUserAgentInfo(userAgent ? userAgent : ''),
      ipAddress,
      action: SESSION_USER_ACTIONS.REJOINED,
    })
    captureEvent(user.id, EVENTS.SESSION_REJOINED, {
      event: EVENTS.SESSION_REJOINED,
      sessionId: session.id,
    })
  }
}

// TODO: we don't know the shape of the user coming from a socket. user is provided from the client at the moment
export async function saveMessage(
  user: any,
  createdAt: Date,
  data: unknown,
  chatbot: Ulid | undefined
): Promise<string> {
  const { sessionId, message } = sessionUtils.asSaveMessageData(data)
  const session = await SessionRepo.getSessionById(sessionId)
  if (
    !sessionUtils.isSessionParticipant(
      session.studentId,
      session.volunteerId,
      asString(user._id),
      chatbot || null
    )
  )
    throw new Error('Only session participants are allowed to send messages')

  return await SessionRepo.addMessageToSessionById(sessionId, user._id, message)
}

export async function generateWaitTimeHeatMap(startDate: Date, endDate: Date) {
  const heatMap = sessionUtils.createEmptyHeatMap()
  const map = await SessionRepo.getSessionsWithAvgWaitTimePerDayAndHour(
    startDate,
    endDate
  )

  for (const entry of map) {
    const day = moment()
      .weekday(entry.day)
      .format('dddd')
    const hour = UTC_TO_HOUR_MAPPING[entry.hour as HOURS_UTC]
    heatMap[day as DAYS][hour] = entry.averageWaitTime
  }

  return heatMap
}

export async function generateAndStoreWaitTimeHeatMap(
  startDate: Date,
  endDate: Date
): Promise<sessionUtils.HeatMap> {
  const heatMap = await generateWaitTimeHeatMap(startDate, endDate)
  await cache.save(
    config.cacheKeys.waitTimeHeatMapAllSubjects,
    JSON.stringify(heatMap)
  )
  return heatMap
}

export async function getWaitTimeHeatMap(
  user: UserContactInfo
): Promise<sessionUtils.HeatMap> {
  if (!user.isVolunteer)
    throw new NotAllowedError('Only volunteers may view the heat map')
  try {
    const heatMap = await cache.get(config.cacheKeys.waitTimeHeatMapAllSubjects)
    return JSON.parse(heatMap)
  } catch (err) {
    if (err instanceof cache.KeyNotFoundError) {
      const lastMonday = moment()
        .utc()
        .startOf('isoWeek')
        .subtract(1, 'week')
        .toDate()
      const lastSunday = moment()
        .utc()
        .endOf('isoWeek')
        .subtract(1, 'week')
        .toDate()
      const heatMap = await generateAndStoreWaitTimeHeatMap(
        lastMonday,
        lastSunday
      )
      return heatMap
    }
    throw err
  }
}

export async function volunteersAvailableForSession(
  sessionId: Ulid,
  subject: string
): Promise<boolean> {
  const [
    activeVolunteers,
    notifiedForSession,
    notifiedLastFifteenMins,
  ] = await Promise.all([
    TwilioService.getActiveSessionVolunteers(),
    VolunteerRepo.getVolunteersNotifiedBySessionId(sessionId),
    VolunteerRepo.getVolunteersNotifiedSinceDate(
      TwilioService.relativeDate(15 * 60 * 1000)
    ),
  ])
  const excludedVolunteers = [
    ...activeVolunteers,
    ...notifiedForSession,
    ...notifiedLastFifteenMins,
  ]
  const volunteers = await VolunteerRepo.getVolunteersOnDeck(
    subject,
    excludedVolunteers
  )

  return volunteers.length > 0
}

export async function handleMessageActivity(sessionId: Ulid): Promise<void> {
  try {
    const state = await cache.get(`${SESSION_ACTIVITY_KEY}-${sessionId}`)
    if (Boolean(state)) {
      await QueueService.add(
        Jobs.Chatbot,
        { sessionId },
        { removeOnComplete: true, removeOnFail: true }
      )
      await cache.remove(`${SESSION_ACTIVITY_KEY}-${sessionId}`)
    }
  } catch (err) {
    // if key missing do nothing - means chatbot is not active yet
    if (err instanceof cache.KeyNotFoundError) return
    // TODO: cancel chatbot jobs here
    logger.error(`Could not process message acitvity state, cancelling chatbot`)
  }
}

// TODO: implement these with cursor pagination
export async function getSessionHistory(userId: Ulid, page: string) {
  const pageNum = parseInt(page)
  const PER_PAGE = 5
  const skip = (pageNum - 1) * PER_PAGE
  const pastSessions = await SessionRepo.getSessionHistory(
    userId,
    PER_PAGE,
    skip
  )
  const isLastPage = pastSessions.length < PER_PAGE

  return { pastSessions, page: pageNum, isLastPage }
}

export async function getTotalSessionHistory(userId: Ulid) {
  return SessionRepo.getTotalSessionHistory(userId)
}

export async function getSessionRecap(
  sessionId: Ulid,
  userId: Ulid
): Promise<SessionRepo.SessionForSessionRecap> {
  const session = await SessionRepo.getSessionRecap(sessionId)
  if (
    !sessionUtils.isSessionParticipant(
      session.studentId,
      session.volunteerId,
      userId
    )
  )
    throw new NotAllowedError(
      'Only session participants are allowed to view this session'
    )
  return session
}

export async function isEligibleForSessionRecap(
  sessionId: Ulid,
  studentId: Ulid
): Promise<boolean> {
  const isAllowDmsToPartnerStudentsActive = await getAllowDmsToPartnerStudentsFeatureFlag(
    studentId
  )
  if (!isAllowDmsToPartnerStudentsActive) {
    const student = await getStudentPartnerInfoById(studentId)
    if (student?.studentPartnerOrg) return false
  }
  return await SessionRepo.isEligibleForSessionRecap(sessionId)
}

/**
 *
 * - Banned users should not be able to send DMs in the recap page
 * - Coaches cannot send DMs to partner students unless the flag allow-dms-to-partner-students is on
 * - Coaches can send DMs once session ended and they have the session-recap-dms flag as `true`.
 * - Students are not able to initiate the conversation. A coach must send the first message.
 *   We determine this by looking to see if a coach had sent a message after the
 *   session ended.
 *
 */
export async function isRecapDmsAvailable(
  sessionId: Ulid,
  studentId: Ulid,
  volunteerId: Ulid,
  isVolunteer: boolean
): Promise<boolean> {
  const hasBannedParticipant = await SessionRepo.sessionHasBannedParticipant(
    sessionId
  )
  if (hasBannedParticipant) return false

  const isAllowDmsToPartnerStudentsActive = await getAllowDmsToPartnerStudentsFeatureFlag(
    studentId
  )
  if (!isAllowDmsToPartnerStudentsActive) {
    const student = await getStudentPartnerInfoById(studentId)
    if (student?.studentPartnerOrg) return false
  }

  const flag = await getSessionRecapDmsFeatureFlag(volunteerId)
  if (!flag) return false
  const sentMessages = await SessionRepo.volunteerSentMessageAfterSessionEnded(
    sessionId
  )
  return sentMessages || isVolunteer
}
