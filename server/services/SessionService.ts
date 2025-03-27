import * as SessionmeetingsService from '../services/SessionMeetingService'
import crypto from 'crypto'
import moment from 'moment'
import * as cache from '../cache'
import { Ulid } from '../models/pgUtils'
import config from '../config'
import {
  ACCOUNT_USER_ACTIONS,
  EVENTS,
  HOURS_UTC,
  SESSION_ACTIVITY_KEY,
  SESSION_REPORT_REASON,
  SESSION_USER_ACTIONS,
  USER_BAN_REASONS,
  USER_BAN_TYPES,
  USER_ROLES,
  UserSessionFlags,
  USER_SESSION_METRICS,
  UTC_TO_HOUR_MAPPING,
} from '../constants'
import { SESSION_EVENTS } from '../constants/events'
import logger from '../logger'
import { DAYS } from '../constants'
import { LookupError, NotAllowedError } from '../models/Errors'
import * as NotificationRepo from '../models/Notification'
import { PushToken } from '../models/PushToken'
import { getPushTokensByUserId } from '../models/PushToken'
import * as TranscriptMessagesRepo from '../models/SessionAudioTranscriptMessages/queries'
import {
  Session,
  SessionsToReview,
  SessionTranscript,
  updateSessionFlagsById,
  updateSessionReviewReasonsById,
} from '../models/Session'
import * as SessionRepo from '../models/Session'
import { UserContactInfo } from '../models/User'
import * as UserRepo from '../models/User'
import {
  createAccountAction,
  createSessionAction,
  getSessionRequestedUserAgentFromSessionId,
} from '../models/UserAction'
import * as VolunteerRepo from '../models/Volunteer'
import * as sessionUtils from '../utils/session-utils'
import { asFactory, asOptional, asString } from '../utils/type-utils'
import { Jobs } from '../worker/jobs'
import * as AnalyticsService from './AnalyticsService'
import { captureEvent } from './AnalyticsService'
import * as AssignmentsService from './AssignmentsService'
import * as AwsService from './AwsService'
import { emitter } from './EventsService'
import * as PushTokenService from './PushTokenService'
import QueueService from './QueueService'
import * as QuillDocService from './QuillDocService'
import SocketService from './SocketService'
import * as TwilioService from './TwilioService'
import { beginRegularNotifications } from './TwilioService'
import * as WhiteboardService from './WhiteboardService'
import * as VoiceMessageService from './VoiceMessageService'
import { getUserAgentInfo } from '../utils/parse-user-agent'
import { getSubjectAndTopic } from '../models/Subjects'
import {
  getAllowDmsToPartnerStudentsFeatureFlag,
  getSessionRecapDmsFeatureFlag,
} from './FeatureFlagService'
import { getStudentPartnerInfoById } from '../models/Student'
import * as Y from 'yjs'
import { TransactionClient, runInTransaction } from '../db'
import { getDbUlid } from '../models/pgUtils'
import * as SessionAudioRepo from '../models/SessionAudio'
import { SessionMessageType } from '../router/api/sockets'
import * as TeacherService from './TeacherService'
import { getSessionRating } from '../models/Survey'
import { KeyNotFoundError } from '../cache'

export async function reviewSession(data: unknown) {
  const { sessionId, reviewed, toReview } =
    sessionUtils.asReviewSessionData(data)
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
): Promise<{
  sessions: SessionsToReview[]
  isLastPage: boolean
}> {
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
  sessionFlags: UserSessionFlags[]
): Promise<void> {
  await updateSessionFlagsById(sessionId, sessionFlags)
  await updateSessionReviewReasonsById(sessionId, sessionFlags, false)
}

export async function reportSession(user: UserContactInfo, data: unknown) {
  const { sessionId, reportReason, reportMessage, source } =
    sessionUtils.asReportSessionData(data)
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
  const isSessionVolunteer = reportedBy.id === session.volunteerId
  const reportedUser = isSessionVolunteer
    ? session.studentId
    : session.volunteerId
  if (isBanReason) {
    await UserRepo.banUserById(
      reportedUser,
      USER_BAN_TYPES.COMPLETE,
      USER_BAN_REASONS.SESSION_REPORTED
    )
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
      const sessionFlags = isSessionVolunteer
        ? [UserSessionFlags.coachReportedStudentDm]
        : [UserSessionFlags.studentReportedCoachDm]
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

  // @TODO - Update email sent to volunteers reported in-session by students
  const shouldSendEmail = user.isVolunteer || source === 'recap'
  if (shouldSendEmail) {
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
}

export async function endSession(
  sessionId: Ulid,
  endedBy: Ulid | null = null,
  isAdmin: boolean = false,
  socketService?: SocketService,
  identifiers?: sessionUtils.RequestIdentifier
) {
  await runInTransaction(async (tc: TransactionClient) => {
    const reqIdentifiers = identifiers
      ? sessionUtils.asRequestIdentifiers(identifiers)
      : undefined

    const session = await SessionRepo.getSessionToEndById(sessionId, tc)
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
      endedBy,
      tc
    )

    await AssignmentsService.updateStudentAssignmentAfterSession(
      session.student.id,
      sessionId,
      tc
    )

    if (socketService) await socketService.emitSessionChange(sessionId, tc)
    if (endedBy && reqIdentifiers)
      await createSessionAction(
        {
          userId: endedBy,
          sessionId: sessionId,
          ...getUserAgentInfo(reqIdentifiers?.userAgent),
          ipAddress: reqIdentifiers.ip,
          action: SESSION_USER_ACTIONS.ENDED,
        },
        tc
      )
  })

  await SessionmeetingsService.endMeeting(sessionId)

  emitter.emit(SESSION_EVENTS.SESSION_ENDED, sessionId)
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

export async function processSessionTranscript(sessionId: Ulid) {
  try {
    await QueueService.add(
      Jobs.ModerateSessionTranscript,
      { sessionId },
      {
        removeOnComplete: true,
        removeOnFail: true,
      }
    )
  } catch (err) {
    throw new Error(
      `Failed to enqueue ModerateSessionTranscript job for session ${sessionId}, err=${err}`
    )
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
  const session =
    await SessionRepo.getSessionByIdWithStudentAndVolunteer(sessionId)
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
        sessionId: session.id,
      },
      { delay, removeOnComplete: true, removeOnFail: true }
    )
  if (sendVolunteerFirstSessionCongrats) {
    await QueueService.add(
      Jobs.EmailVolunteerFirstSessionCongrats,
      {
        sessionId: session.id,
      },
      { delay, removeOnComplete: true, removeOnFail: true }
    )
  }
}

async function getDocEditorVersion(sessionId: Ulid): Promise<number> {
  return await Number(await cache.get(`${sessionId}-doc-editor-version`))
}

async function setDocEditorVersion(
  sessionId: Ulid,
  value: string
): Promise<void> {
  return await cache.saveWithExpiration(
    `${sessionId}-doc-editor-version`,
    value
  )
}

export async function addDocEditorVersionTo(
  session: SessionRepo.CurrentSession
): Promise<void> {
  if (sessionUtils.isSubjectUsingDocumentEditor(session.toolType)) {
    session.docEditorVersion = await getDocEditorVersion(session.id)
  }
}

async function storeQuillDocV2(sessionId: Ulid) {
  const quillStateV2 = await QuillDocService.getDocumentUpdates(sessionId)
  const ydoc = new Y.Doc()
  const text = ydoc.getText('quill')
  for (const update of quillStateV2) {
    Y.applyUpdate(ydoc, Uint8Array.from(update.split(',').map(Number)))
  }
  await SessionRepo.updateSessionQuillDoc(
    sessionId,
    // Ensure viewing the document in a recap works by matching existing sessions.quill_doc format
    JSON.stringify({ ops: text.toDelta() })
  )
}

export async function storeAndDeleteQuillDoc(sessionId: Ulid): Promise<void> {
  const quillStateV2 = await QuillDocService.getDocumentUpdates(sessionId)
  const quillState = await QuillDocService.getQuillDocV1(sessionId)
  if (quillStateV2.length) {
    await storeQuillDocV2(sessionId)
  } else if (quillState?.doc) {
    await SessionRepo.updateSessionQuillDoc(
      sessionId,
      JSON.stringify(quillState.doc)
    )
  }

  await QuillDocService.deleteDoc(sessionId)
}

export async function storeAndDeleteWhiteboardDoc(sessionId: Ulid) {
  const whiteboardDoc = await WhiteboardService.getDocIfExist(sessionId)
  if (!whiteboardDoc)
    return logger.info(
      `No whiteboard doc for session ${sessionId} found when attempting to store it`
    )
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
  const session =
    await SessionRepo.getSessionByIdWithStudentAndVolunteer(sessionId)

  if (
    sessionUtils.isSubjectUsingDocumentEditor(session.toolType) &&
    !session.endedAt
  ) {
    const quillDoc = await QuillDocService.getDoc(sessionId)
    session.quillDoc = JSON.stringify(quillDoc)
  }

  const sessionUserAgent =
    await getSessionRequestedUserAgentFromSessionId(sessionId)
  const bucket: keyof typeof config.awsS3 = 'sessionPhotoBucket'
  const sessionPhotos = await AwsService.getObjects(
    bucket,
    session.photos || []
  )

  return {
    ...session,
    userAgent: sessionUserAgent,
    photos: sessionPhotos,
  }
}

export async function startSession(
  user: UserContactInfo,
  data: sessionUtils.StartSessionData
) {
  return await runInTransaction(async (tc: TransactionClient) => {
    const { subject, topic, assignmentId, docEditorVersion, userAgent, ip } =
      data

    const subjectAndTopic = await getSubjectAndTopic(subject, topic, tc)
    if (!subjectAndTopic)
      throw new sessionUtils.StartSessionError(
        `Unable to start new session for the topic ${topic} and subject ${subject}`
      )

    const userId = user.id
    if (user.roleContext.isActiveRole('volunteer'))
      throw new sessionUtils.StartSessionError(
        'Volunteers cannot create new sessions'
      )

    const userBanned = user.banType === USER_BAN_TYPES.COMPLETE

    if (userBanned)
      throw new sessionUtils.StartSessionError(
        'Banned students cannot request a new session'
      )

    const currentSession = await SessionRepo.getCurrentSessionByUserId(
      userId,
      tc
    )
    if (currentSession)
      throw new sessionUtils.StartSessionError(
        'Student already has an active session'
      )

    const newSessionId = await SessionRepo.createSession(
      userId,
      subject,
      user.banType === USER_BAN_TYPES.SHADOW,
      tc
    )

    if (assignmentId) {
      await AssignmentsService.linkSessionToAssignment(
        userId,
        newSessionId,
        assignmentId,
        tc
      )
    }

    if (sessionUtils.isSubjectUsingDocumentEditor(subjectAndTopic.toolType)) {
      // Save doc editor version before `beginRegularNotifications` to avoid a client calling `currentSession`
      // and looking for this value before it's set
      await setDocEditorVersion(newSessionId, `${docEditorVersion ?? 1}`)
    }

    if (!userBanned) {
      await beginRegularNotifications(newSessionId, tc)
    }

    // Auto end the session after 45 minutes if the session is unmatched
    const delay = 1000 * 60 * 45
    await QueueService.add(
      Jobs.EndUnmatchedSession,
      { sessionId: newSessionId },
      { delay, removeOnComplete: true, removeOnFail: true }
    )

    await createSessionAction(
      {
        userId: user.id,
        sessionId: newSessionId,
        ...getUserAgentInfo(userAgent),
        ipAddress: ip,
        action: SESSION_USER_ACTIONS.REQUESTED,
      },
      tc
    )

    // TODO: We can just return the session here, instead of the
    // client then having to fetch it.
    return newSessionId
  })
}

export async function checkSession(data: unknown) {
  const sessionId = asString(data)
  const session = await SessionRepo.getSessionById(sessionId)
  return session.id
}

export async function currentSession(userId: Ulid) {
  const session = await SessionRepo.getCurrentSessionByUserId(userId)
  if (session) {
    await addDocEditorVersionTo(session)
  }
  return session
}

export async function getRecapSessionForDms(userId: Ulid) {
  return await SessionRepo.getRecapSessionForDmsBySessionId(userId)
}

export async function studentLatestSession(data: unknown) {
  const userId = asString(data)
  return await SessionRepo.getLatestSessionByStudentId(userId)
}

export async function sessionTimedOut(user: UserContactInfo, data: unknown) {
  const { sessionId, timeout, ip, userAgent } =
    sessionUtils.asSessionTimedOutData(data)
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
  sessionId: Ulid,
  data: unknown
): Promise<void> {
  const { socket, joinedFrom } = sessionUtils.asJoinSessionData(data)
  const userAgent = socket.request?.headers['user-agent']
  const ipAddress = socket.handshake?.address
  const session = await SessionRepo.getSessionById(sessionId)
  if (session.endedAt) {
    await SessionRepo.updateSessionFailedJoinsById(session.id, user.id)
    throw new Error('Session has ended')
  }

  const isStudent = user.roleContext.isActiveRole('student')
  const isVolunteer = user.roleContext.isActiveRole('volunteer')
  if (isStudent && session.studentId !== user.id) {
    await SessionRepo.updateSessionFailedJoinsById(session.id, user.id)
    throw new Error(`A student cannot join another student's session`)
  }

  if (isVolunteer && session.volunteerId && session.volunteerId !== user.id) {
    await SessionRepo.updateSessionFailedJoinsById(session.id, user.id)
    throw new Error('A volunteer has already joined the session')
  }

  if (isVolunteer && session.studentId === user.id) {
    await SessionRepo.updateSessionFailedJoinsById(session.id, user.id)
    throw new Error(
      'You may not join your own session as both student and coach'
    )
  }

  const isInitialVolunteerJoin = isVolunteer && !session.volunteerId
  if (isInitialVolunteerJoin) {
    try {
      await SessionRepo.updateSessionVolunteerById(session.id, user.id)
    } catch (err) {
      throw new Error('A volunteer has already joined the session')
    }

    try {
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
    } catch (error) {
      logger.error(
        `Failed to log user joined session action for user ${user.id} in session ${session.id} : ${error}`
      )
    }

    try {
      const pushTokens = await getPushTokensByUserId(session.studentId)
      if (pushTokens && pushTokens.length > 0) {
        const tokens = pushTokens.map((token: PushToken) => token.token)
        await PushTokenService.sendVolunteerJoined(session as Session, tokens)
      }
    } catch (error) {
      logger.error(
        `Failed to send FCM notifications to student ${session.studentId} for session ${session.id}: ${error}`
      )
    }
  }

  // After 30 seconds of the this.createdAt, we can assume the user is
  // rejoining the session instead of joining for the first time
  const thirtySecondsElapsed = 1000 * 30
  if (
    !isInitialVolunteerJoin &&
    session.createdAt.getTime() + thirtySecondsElapsed < Date.now()
  ) {
    try {
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
    } catch (error) {
      logger.error(
        `Failed to log user rejoined session action for user ${user.id} in session ${session.id} : ${error}`
      )
    }
  }
}

export async function saveVoiceMessage({
  senderId,
  sessionId,
  message,
  transcript,
}: {
  senderId: Ulid
  sessionId: Ulid
  message: Express.Multer.File
  transcript: string
}) {
  const voiceMessageId = getDbUlid()
  const wasUploaded = await VoiceMessageService.uploadedToStorage(
    voiceMessageId,
    message
  )

  if (wasUploaded) {
    return await SessionRepo.addVoiceMessageToSessionById(
      sessionId,
      senderId,
      voiceMessageId,
      transcript
    )
  } else {
    throw new Error('Unable to upload voice message')
  }
}

// TODO: we don't know the shape of the user coming from a socket. user is provided from the client at the moment
export async function saveMessage(
  user: any,
  createdAt: Date,
  data: {
    sessionId: Ulid
    message: string
    type?: SessionMessageType
    saidAt?: Date // @TODO Improve typing to handle different types of messages
  }
): Promise<string> {
  const { sessionId, message } = sessionUtils.asSaveMessageData(data)
  const session = await SessionRepo.getSessionById(sessionId)
  if (
    !sessionUtils.isSessionParticipant(
      session.studentId,
      session.volunteerId,
      asString(user._id)
    )
  )
    throw new Error('Only session participants are allowed to send messages')

  if (data.type === 'voice') {
    return message
  } else if (data.type === 'audio-transcription') {
    return await TranscriptMessagesRepo.insertSessionAudioTranscriptMessage({
      userId: user.id,
      sessionId,
      message,
      saidAt: data.saidAt!,
    })
  } else {
    return await SessionRepo.addMessageToSessionById(
      sessionId,
      user._id,
      message
    )
  }
}

export async function generateWaitTimeHeatMap(startDate: Date, endDate: Date) {
  const heatMap = sessionUtils.createEmptyHeatMap()
  const map = await SessionRepo.getSessionsWithAvgWaitTimePerDayAndHour(
    startDate,
    endDate
  )

  for (const entry of map) {
    const day = moment().weekday(entry.day).format('dddd')
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
  if (user.roleContext.isActiveRole('student'))
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
  const [activeVolunteers, notifiedForSession, notifiedLastFifteenMins] =
    await Promise.all([
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

export const asSessionHistoryFilter = asFactory<SessionHistoryFilter>({
  studentFirstName: asOptional(asString),
  volunteerFirstName: asOptional(asString),
  studentId: asOptional(asString),
  subjectName: asOptional(asString),
  volunteerId: asOptional(asString),
})
export type SessionHistoryFilter = {
  studentFirstName?: string
  volunteerFirstName?: string
  studentId?: Ulid
  subjectName?: string
  volunteerId?: Ulid
}
export async function getSessionHistory(
  userId: Ulid,
  pageNum: number,
  pageLimit: number = 5,
  filter: SessionHistoryFilter
) {
  const fetchLimit = pageLimit + 1
  const offset = (pageNum - 1) * pageLimit

  const [pastSessions, totalCount] = await Promise.all([
    SessionRepo.getFilteredSessionHistory(userId, fetchLimit, offset, filter),
    SessionRepo.getFilteredSessionHistoryTotalCount(userId, filter),
  ])

  return {
    pastSessions: pastSessions.slice(0, pageLimit),
    totalCount,
    page: pageNum,
    isLastPage: pastSessions.length < fetchLimit,
  }
}

export async function getTotalSessionHistory(
  userId: Ulid,
  filter: SessionHistoryFilter = {}
) {
  return SessionRepo.getFilteredSessionHistoryTotalCount(userId, filter)
}

export async function getSessionRecap(
  sessionId: Ulid,
  userId: Ulid,
  isTeacher: boolean
): Promise<SessionRepo.SessionForSessionRecap> {
  const session = await SessionRepo.getSessionRecap(sessionId)

  if (!isTeacher) {
    if (
      !sessionUtils.isSessionParticipant(
        session.studentId,
        session.volunteerId,
        userId
      )
    ) {
      throw new NotAllowedError(
        'Only session participants are allowed to view this session'
      )
    }
  } else {
    const studentsInClasses =
      await TeacherService.getAllStudentsForTeacher(userId)

    if (!studentsInClasses.includes(session.studentId)) {
      throw new NotAllowedError(
        'Teacher can only view sessions for students in their classes'
      )
    }
  }

  return session
}

export async function isEligibleForSessionRecap(
  sessionId: Ulid,
  studentId: Ulid,
  volunteerId: Ulid
): Promise<boolean> {
  const isAllowDmsToPartnerStudentsActive =
    await getAllowDmsToPartnerStudentsFeatureFlag(volunteerId)
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
  const hasBannedParticipant =
    await SessionRepo.sessionHasBannedParticipant(sessionId)
  if (hasBannedParticipant) return false

  const isAllowDmsToPartnerStudentsActive =
    await getAllowDmsToPartnerStudentsFeatureFlag(volunteerId)
  if (!isAllowDmsToPartnerStudentsActive) {
    const student = await getStudentPartnerInfoById(studentId)
    if (student?.studentPartnerOrg) return false
  }

  const flag = await getSessionRecapDmsFeatureFlag(volunteerId)
  if (!flag) return false
  const sentMessages =
    await SessionRepo.volunteerSentMessageAfterSessionEnded(sessionId)
  return sentMessages || isVolunteer
}

export async function getStudentSessionDetails(studentId: Ulid) {
  const sessions = await SessionRepo.getStudentSessionDetails(studentId)

  const sessionsWithRatings = []

  for (const session of sessions) {
    const [studentRating, volunteerRating] = await Promise.all([
      getSessionRating(session.id, USER_ROLES.STUDENT),
      getSessionRating(session.id, USER_ROLES.VOLUNTEER),
    ])

    sessionsWithRatings.push({ ...session, studentRating, volunteerRating })
  }

  return sessionsWithRatings
}

function isQualifiedFallIncentiveSession(
  session: SessionRepo.FallIncentiveSession
) {
  const tenMinutes = 1000 * 60 * 10
  return (
    !session.flags.includes(USER_SESSION_METRICS.absentStudent) &&
    !session.flags.includes(USER_SESSION_METRICS.absentVolunteer) &&
    session.timeTutored > tenMinutes &&
    session.totalMessages >= 15 &&
    !session.reported
  )
}

export async function isSessionQualifiedForFallIncentive(
  sessionId: Ulid
): Promise<boolean> {
  const session = await SessionRepo.getSessionById(sessionId)
  const messages = await SessionRepo.getMessagesForFrontend(sessionId)
  return isQualifiedFallIncentiveSession({
    ...session,
    totalMessages: messages.length,
  })
}

export async function getOrCreateSessionAudio(
  sessionId: string,
  {
    resourceUri,
    volunteerJoinedAt,
    studentJoinedAt,
  }: {
    resourceUri?: string
    volunteerJoinedAt?: Date
    studentJoinedAt?: Date
  }
): Promise<SessionAudioRepo.SessionAudio> {
  const maybeSessionAudio =
    await SessionAudioRepo.getSessionAudioBySessionId(sessionId)
  if (maybeSessionAudio) return maybeSessionAudio
  return await SessionAudioRepo.createSessionAudio({
    sessionId,
    resourceUri,
    volunteerJoinedAt,
    studentJoinedAt,
  })
}
export async function updateSessionAudio(
  sessionId: string,
  updates: SessionAudioRepo.UpdateSessionAudioPayload
): Promise<SessionAudioRepo.SessionAudio> {
  const updated = await SessionAudioRepo.updateSessionAudio({
    sessionId,
    ...updates,
  })
  if (!updated)
    throw new LookupError('Audio does not exist for the given session')
  return updated
}

export async function getSessionTranscript(
  sessionId: string
): Promise<SessionTranscript> {
  const messages = await SessionRepo.getSessionTranscriptItems(sessionId)
  return {
    sessionId,
    messages,
  }
}
