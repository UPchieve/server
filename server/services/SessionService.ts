import Case from 'case'
import crypto from 'crypto'
import _ from 'lodash'
import moment from 'moment'
import { Types } from 'mongoose'
import { isEnabled } from 'unleash-client'
import * as cache from '../cache'
import config from '../config'
import {
  EVENTS,
  FEATURE_FLAGS,
  HOURS_UTC,
  SESSION_ACTIVITY_KEY,
  SESSION_REPORT_REASON,
  SUBJECT_TYPES,
  USER_BAN_REASON,
  USER_SESSION_METRICS,
  UTC_TO_HOUR_MAPPING,
} from '../constants'
import { SESSION_EVENTS } from '../constants/events'
import * as UserActionCtrl from '../controllers/UserActionCtrl'
import logger from '../logger'
import * as AssistmentsDataRepo from '../models/AssistmentsData/queries'
import { DAYS } from '../models/Availability/types'
import { NotAllowedError } from '../models/Errors'
import { getFeedbackV2BySessionId } from '../models/Feedback/queries'
import * as NotificationRepo from '../models/Notification/queries'
import { PushToken } from '../models/PushToken'
import { getPushTokensByUserId } from '../models/PushToken/queries'
import { Session } from '../models/Session'
import * as SessionRepo from '../models/Session/queries'
import { User } from '../models/User'
import * as UserRepo from '../models/User/queries'
import { getSessionRequestedUserAgentFromSessionId } from '../models/UserAction/queries'
import * as VolunteerRepo from '../models/Volunteer/queries'
import * as sessionUtils from '../utils/session-utils'
import { asObjectId, asString } from '../utils/type-utils'
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
import {
  beginFailsafeNotifications,
  beginRegularNotifications,
} from './TwilioService'
import * as WhiteboardService from './WhiteboardService'
import { LockError } from 'redlock'

export async function reviewSession(data: unknown) {
  const { sessionId, reviewed, toReview } = sessionUtils.asReviewSessionData(
    data
  )
  return SessionRepo.updateSessionReviewedStatusById(sessionId, {
    reviewed,
    toReview,
  })
}

export async function sessionsToReview(data: unknown) {
  const page = asString(data)
  const pageNum = parseInt(page) || 1
  const PER_PAGE = 15
  const skip = (pageNum - 1) * PER_PAGE
  const query = {
    toReview: true,
    reviewed: false,
  }

  const sessions = await SessionRepo.getSessionsToReview({
    query,
    skip,
    limit: PER_PAGE,
  })
  const isLastPage = sessions.length < PER_PAGE
  return { sessions, isLastPage }
}

export async function getTimeTutoredForDateRange(
  volunteerId: Types.ObjectId,
  fromDate: Date,
  toDate: Date
): Promise<number> {
  const [result] = await SessionRepo.getTotalTimeTutoredForDateRange(
    volunteerId,
    fromDate,
    toDate
  )
  if (result && result.timeTutored) return result.timeTutored
  else return 0
}

export async function reportSession(user: User, data: unknown) {
  const {
    sessionId,
    reportReason,
    reportMessage,
  } = sessionUtils.asReportSessionData(data)
  const session = await SessionRepo.getSessionById(sessionId)
  if (
    !session.volunteer ||
    !user._id.equals(session.volunteer as Types.ObjectId)
  )
    throw new sessionUtils.ReportSessionError('Unable to report this session')

  const reportedBy = user
  await SessionRepo.updateSessionReported(sessionId, {
    reportMessage,
    reportReason,
  })

  const isBanReason = reportReason === SESSION_REPORT_REASON.STUDENT_RUDE
  if (isBanReason && reportedBy.isVolunteer) {
    await UserRepo.banUserById(
      session.student as Types.ObjectId,
      USER_BAN_REASON.SESSION_REPORTED
    )
    await new UserActionCtrl.AccountActionCreator(
      session.student as Types.ObjectId,
      '',
      {
        session: session._id,
        banReason: USER_BAN_REASON.SESSION_REPORTED,
      }
    ).accountBanned()
    await AnalyticsService.captureEvent(
      session.student as Types.ObjectId,
      EVENTS.ACCOUNT_BANNED,
      {
        event: EVENTS.ACCOUNT_BANNED,
        sessionId: session._id.toString(),
        banReason: USER_BAN_REASON.SESSION_REPORTED,
      }
    )
  }

  emitter.emit(SESSION_EVENTS.SESSION_REPORTED, session._id)

  // Queue up job to send reporting alert emails
  const emailData = {
    studentId: session.student,
    reportedBy: user.email,
    reportReason,
    reportMessage,
    isBanReason,
    sessionId,
  }

  if (session.endedAt)
    await QueueService.add(Jobs.EmailSessionReported, emailData)
  else
    await cache.saveWithExpiration(
      `${sessionId}-reported`,
      JSON.stringify(emailData)
    )
}

async function isSessionAssistments(
  sessionId: Types.ObjectId
): Promise<boolean> {
  const ad = await AssistmentsDataRepo.getAssistmentsDataBySession(sessionId)
  if (ad) return !_.isEmpty(ad)
  else return false
}

export async function addPastSession(sessionId: Types.ObjectId) {
  const session = await SessionRepo.getSessionById(sessionId)
  const updates = []
  updates.push(
    UserRepo.addUserPastSessionById(
      session.student as Types.ObjectId,
      session._id
    )
  )
  if (session.volunteer)
    updates.push(
      UserRepo.addUserPastSessionById(
        session.volunteer as Types.ObjectId,
        session._id
      )
    )

  const results = await Promise.allSettled(updates)
  const errors: string[] = []
  results.forEach(result => {
    if (result.status === 'rejected')
      errors.push(
        `Failed to add past session: ${sessionId} - error: ${result.reason}`
      )
  })
  if (errors.length)
    throw new Error(`errors saving past session:\n${errors.join('\n')}`)
}

export async function endSession(
  sessionId: Types.ObjectId,
  endedBy: Types.ObjectId | null = null,
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
    !sessionUtils.isSessionParticipant(session, endedBy ? endedBy : null)
  )
    throw new sessionUtils.EndSessionError(
      'Only session participants can end a session'
    )

  await SessionRepo.updateSessionToEnd(session._id, {
    endedAt: new Date(),
    // NOTE: endedBy is sometimes null when the session is ended by a worker job
    //        due to the session being unmatched for an extended period of time
    endedBy,
  })
  await addPastSession(session._id)

  emitter.emit(SESSION_EVENTS.SESSION_ENDED, session._id)

  if (socketService) await socketService.emitSessionChange(sessionId)
  if (endedBy && reqIdentifiers)
    await new UserActionCtrl.SessionActionCreator(
      endedBy,
      sessionId.toString(),
      reqIdentifiers.userAgent,
      reqIdentifiers.ip
    ).endedSession()
}

// registered as listener
export async function processAssistmentsSession(sessionId: Types.ObjectId) {
  const session = await SessionRepo.getSessionById(sessionId)
  if (session?.volunteer && (await isSessionAssistments(sessionId))) {
    logger.info(`Ending an assistments session: ${sessionId}`)
    await QueueService.add(Jobs.SendAssistmentsData, { sessionId })
  }
}

export async function processSessionReported(sessionId: Types.ObjectId) {
  try {
    await QueueService.add(
      Jobs.EmailSessionReported,
      JSON.parse(await cache.get(`${sessionId}-reported`))
    )
    await cache.remove(`${sessionId}-reported`)
  } catch (err) {
    // we don't care if the key is not found
    if (!(err instanceof cache.KeyNotFoundError)) throw err
  }
}

export async function processCalculateMetrics(sessionId: Types.ObjectId) {
  const session = await SessionRepo.getSessionById(sessionId)
  let timeTutored = 0
  if (
    !(
      session.flags.includes(USER_SESSION_METRICS.absentStudent) ||
      session.flags.includes(USER_SESSION_METRICS.absentVolunteer)
    )
  )
    timeTutored = sessionUtils.calculateTimeTutored(session)

  await SessionRepo.updateSessionTimeTutored(sessionId, timeTutored)
  emitter.emit(SESSION_EVENTS.SESSION_METRICS_CALCULATED, sessionId)
}

export async function processFirstSessionCongratsEmail(
  sessionId: Types.ObjectId
) {
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
      { delay }
    )
  if (sendVolunteerFirstSessionCongrats) {
    await QueueService.add(
      Jobs.EmailVolunteerFirstSessionCongrats,
      {
        sessionId: session._id,
      },
      { delay }
    )
  }
}

export async function storeAndDeleteQuillDoc(
  sessionId: Types.ObjectId,
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

export async function storeAndDeleteWhiteboardDoc(sessionId: Types.ObjectId) {
  const whiteboardDoc = await WhiteboardService.getDoc(sessionId)
  const hasWhiteboardDoc = await WhiteboardService.uploadedToStorage(
    sessionId,
    whiteboardDoc
  )
  await SessionRepo.updateSessionHasWhiteboardDoc(sessionId, hasWhiteboardDoc)
  await WhiteboardService.deleteDoc(sessionId)
}

export async function processSessionEditors(sessionId: Types.ObjectId) {
  const session = await SessionRepo.getSessionById(sessionId)
  if (sessionUtils.isSubjectUsingDocumentEditor(session.subTopic))
    await storeAndDeleteQuillDoc(sessionId)
  else await storeAndDeleteWhiteboardDoc(sessionId)
}

export async function processEmailPartnerVolunteer(sessionId: Types.ObjectId) {
  const session = await SessionRepo.getSessionToEndById(sessionId)
  if (session.volunteer?.volunteerPartnerOrg) {
    const delay = 1000 * 60 * 5
    if (session.volunteer.pastSessions.length === 5)
      await QueueService.add(
        Jobs.EmailPartnerVolunteerReferACoworker,
        {
          volunteerId: session.volunteer._id,
          firstName: session.volunteer.firstname,
          email: session.volunteer.email,
          partnerOrg: session.volunteer.volunteerPartnerOrg,
        },
        { delay }
      )

    if (session.volunteer.pastSessions.length === 10)
      await QueueService.add(
        Jobs.EmailPartnerVolunteerTenSessionMilestone,
        {
          volunteerId: session.volunteer._id,
          firstName: session.volunteer.firstname,
          email: session.volunteer.email,
        },
        { delay }
      )
  }
}

export async function processVolunteerTimeTutored(sessionId: Types.ObjectId) {
  const session = await SessionRepo.getSessionById(sessionId)
  if (session.volunteer)
    await VolunteerRepo.updateTimeTutored(
      session.volunteer as Types.ObjectId,
      session.timeTutored || 0
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

export async function getSessionPhotoUploadUrl(sessionId: Types.ObjectId) {
  const sessionPhotoS3Key = `${sessionId}${crypto
    .randomBytes(8)
    .toString('hex')}`
  await SessionRepo.updateSessionPhotoKey(sessionId, sessionPhotoS3Key)
  return sessionPhotoS3Key
}

export async function getImageAndUploadUrl(data: unknown) {
  const sessionId = asObjectId(data)
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
  const inclusiveSessionActivityTo =
    new Date(sessionActivityTo).getTime() + oneDayInMS + estTimeOffset
  const offsetSessionActivityFrom =
    new Date(sessionActivityFrom).getTime() + estTimeOffset

  const sessionQueryFilter: {
    sessionLength: { $gte: number }
    isReported?: boolean
  } = {
    // Filter by the length of a session
    sessionLength: { $gte: parseInt(minSessionLength) * 60000 },
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
    'student.isTestUser': showTestUsers ? { $in: [true, false] } : false,
  }
  if (firstTimeStudent && firstTimeVolunteer) {
    userQueryFilter.$or = [
      { 'student.totalPastSessions': 1 },
      { 'volunteer.totalPastSessions': 1 },
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
    limit: PER_PAGE,
  })
  const isLastPage = sessions.length < PER_PAGE
  return { sessions, isLastPage }
}

export async function adminSessionView(data: unknown) {
  const sessionId = asObjectId(data)
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
  const feedback = await getFeedbackV2BySessionId(session._id)
  const bucket: keyof typeof config.awsS3 = 'sessionPhotoBucket'
  const sessionPhotos = await AwsService.getObjects(bucket, session.photos)

  return {
    ...session,
    userAgent: sessionUserAgent,
    feedbacks: feedback,
    photos: sessionPhotos,
  }
}

export async function startSession(user: User, data: unknown) {
  const {
    ip,
    sessionSubTopic,
    sessionType,
    problemId,
    assignmentId,
    studentId,
    userAgent,
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

  const currentSession = await SessionRepo.getCurrentSessionById(userId)
  if (currentSession)
    throw new sessionUtils.StartSessionError(
      'Student already has an active session'
    )

  const newSession = await SessionRepo.createSession({
    studentId: userId,
    // NOTE: sessionType and subtopic are kebab-case
    type: Case.camel(sessionType) as SUBJECT_TYPES,
    subTopic: Case.camel(sessionSubTopic),
    isStudentBanned: user.isBanned,
  })

  const numProblemId = Number(problemId)
  if (numProblemId && assignmentId && studentId)
    try {
      await AssistmentsDataRepo.createAssistmentsDataBySession(
        numProblemId,
        assignmentId,
        studentId,
        newSession._id
      )
    } catch (error) {
      logger.error(
        `Unable to create ASSISTments data for session: ${
          newSession._id
        }, ASSISTments studentId: ${studentId}, assignmentId: ${assignmentId}, problemId: ${problemId}, error: ${
          (error as Error).message
        }`
      )
    }

  if (!user.isBanned) {
    await beginRegularNotifications(newSession)
    await beginFailsafeNotifications(newSession)
  }

  // Auto end the session after 45 minutes if the session is unmatched
  const delay = 1000 * 60 * 45
  await QueueService.add(
    Jobs.EndUnmatchedSession,
    { sessionId: newSession._id },
    { delay }
  )

  // Begin chat bot messages immedeately
  if (isEnabled(FEATURE_FLAGS.CHATBOT))
    await QueueService.add(Jobs.Chatbot, { sessionId: newSession._id })

  await new UserActionCtrl.SessionActionCreator(
    user._id,
    newSession._id.toString(),
    userAgent,
    ip
  ).requestedSession()

  return newSession._id
}

export async function checkSession(data: unknown) {
  const sessionId = asObjectId(data)
  const session = await SessionRepo.getSessionById(sessionId)
  return session._id.toString()
}

export async function currentSession(userId: Types.ObjectId) {
  return await SessionRepo.getCurrentSessionById(userId)
}

export async function studentLatestSession(data: unknown) {
  const userId = asObjectId(data)
  return await SessionRepo.getLatestSessionByStudentId(userId)
}

export async function sessionTimedOut(user: User, data: unknown) {
  const {
    sessionId,
    timeout,
    ip,
    userAgent,
  } = sessionUtils.asSessionTimedOutData(data)
  await new UserActionCtrl.SessionActionCreator(
    user._id,
    sessionId.toString(),
    userAgent,
    ip
  ).timedOutSession(timeout)
}

export async function publicSession(data: unknown) {
  const sessionId = asObjectId(data)
  return SessionRepo.getPublicSessionById(sessionId)
}

export async function getSessionNotifications(data: unknown) {
  const sessionId = asObjectId(data)
  return NotificationRepo.getSessionNotificationsWithSessionId(sessionId)
}

export async function joinSession(user: User, data: unknown): Promise<void> {
  const { socket, session, joinedFrom } = sessionUtils.asJoinSessionData(data)
  const userAgent = socket.request.headers['user-agent']
  // TODO: it is unclear how to extract IP from socketio connection
  /**
   * We used to use socket.handshake.address but new versions of socketio have allegedly
   * moved the IP to request.connetion.remoteAddress
   * The typing on that object is any so we have no idea if this is correct.
   * Godspeed
   */
  const ipAddress =
    socket.handshake?.address || socket.request?.connection.remoteAddress

  if (session.endedAt) {
    await SessionRepo.updateSessionFailedJoinsById(session._id, user._id)
    throw new Error('Session has ended')
  }

  if (
    !user.isVolunteer &&
    session.student &&
    session.student.toString() !== user._id.toString()
  ) {
    await SessionRepo.updateSessionFailedJoinsById(session._id, user._id)
    throw new Error(`A student cannot join another student's session`)
  }

  if (
    user.isVolunteer &&
    session.volunteer &&
    session.volunteer.toString() !== user._id.toString()
  ) {
    SessionRepo.updateSessionFailedJoinsById(session._id, user._id)
    throw new Error('A volunteer has already joined the session')
  }

  const isInitialVolunteerJoin = user.isVolunteer && !session.volunteer
  if (isInitialVolunteerJoin) {
    await SessionRepo.updateSessionVolunteerById(session._id, user._id)
    await new UserActionCtrl.SessionActionCreator(
      user._id,
      session._id.toString(),
      userAgent,
      ipAddress
    ).joinedSession()

    captureEvent(user._id, EVENTS.SESSION_JOINED, {
      event: EVENTS.SESSION_JOINED,
      sessionId: session._id.toString(),
      joinedFrom: joinedFrom || '',
    })

    captureEvent(session.student, EVENTS.SESSION_MATCHED, {
      event: EVENTS.SESSION_MATCHED,
      sessionId: session._id.toString(),
    })

    const pushTokens = await getPushTokensByUserId(
      session.student as Types.ObjectId
    )
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
    await new UserActionCtrl.SessionActionCreator(
      user._id,
      session._id.toString(),
      userAgent,
      ipAddress
    ).rejoinedSession()
    captureEvent(user._id, EVENTS.SESSION_REJOINED, {
      event: EVENTS.SESSION_REJOINED,
      sessionId: session._id.toString(),
    })
  }
}

// TODO: we don't know the shape of the user coming from a socket. user is provided from the client at the moment
export async function saveMessage(
  user: any,
  createdAt: Date,
  data: unknown,
  chatbot?: Types.ObjectId
): Promise<void> {
  const { sessionId, message } = sessionUtils.asSaveMessageData(data)
  const session = await SessionRepo.getSessionById(sessionId)
  if (
    !sessionUtils.isSessionParticipant(session, asObjectId(user._id), chatbot)
  )
    throw new Error('Only session participants are allowed to send messages')

  const newMessage = {
    user: user._id,
    contents: message,
    createdAt,
  }
  await SessionRepo.addMessageToSessionById(sessionId, newMessage)
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
    const hour = UTC_TO_HOUR_MAPPING[session.hour as HOURS_UTC]
    heatMap[day as DAYS][hour] = session.averageWaitTime
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
  user: User
): Promise<sessionUtils.HeatMap> {
  if (!user.isVolunteer)
    throw new NotAllowedError('Only volunteers may view the heat map')
  const heatMap = await cache.get(config.cacheKeys.waitTimeHeatMapAllSubjects)
  return JSON.parse(heatMap)
}

export async function volunteersAvailableForSession(
  sessionId: Types.ObjectId,
  subject: string
): Promise<boolean> {
  const availabilityPath = TwilioService.getCurrentAvailabilityPath()
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
    excludedVolunteers,
    availabilityPath
  )

  return volunteers.length > 0
}

export async function handleMessageActivity(
  sessionId: Types.ObjectId
): Promise<void> {
  try {
    const state = await cache.get(`${SESSION_ACTIVITY_KEY}-${sessionId}`)
    if (Boolean(state)) {
      await QueueService.add(Jobs.Chatbot, { sessionId })
      await cache.remove(`${SESSION_ACTIVITY_KEY}-${sessionId}`)
    }
  } catch (err) {
    // if key missing do nothing - means chatbot is not active yet
    if (err instanceof cache.KeyNotFoundError) return
    // TODO: cancel chatbot jobs here
    logger.error(`Could not process message acitvity state, cancelling chatbot`)
  }
}
