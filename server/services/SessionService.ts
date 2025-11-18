import * as SessionmeetingsService from '../services/SessionMeetingService'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import * as cache from '../cache'
import { Ulid, Uuid } from '../models/pgUtils'
import config from '../config'
import {
  ACCOUNT_USER_ACTIONS,
  EVENTS,
  HOURS_UTC,
  SESSION_REPORT_REASON,
  SESSION_USER_ACTIONS,
  USER_BAN_REASONS,
  USER_BAN_TYPES,
  USER_ROLES,
  UserSessionFlags,
  USER_SESSION_METRICS,
  UTC_TO_HOUR_MAPPING,
} from '../constants'
import logger from '../logger'
import { DAYS } from '../constants'
import {
  LookupError,
  NotAllowedError,
  SessionJoinError,
} from '../models/Errors'
import * as NotificationRepo from '../models/Notification'
import { PushToken } from '../models/PushToken'
import { getPushTokensByUserId } from '../models/PushToken'
import * as TranscriptMessagesRepo from '../models/SessionAudioTranscriptMessages/queries'
import {
  CurrentSession,
  EndedSession,
  GetSessionByIdResult,
  LatestSession,
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
import * as AzureService from './AzureService'
import * as PushTokenService from './PushTokenService'
import QueueService from './QueueService'
import * as QuillDocService from './QuillDocService'
import SocketService from './SocketService'
import * as TwilioService from './TwilioService'
import { beginRegularNotifications } from './TwilioService'
import * as WhiteboardService from './WhiteboardService'
import { getUserAgentInfo } from '../utils/parse-user-agent'
import { getSubjectAndTopic } from '../models/Subjects'
import {
  getAllowDmsToPartnerStudentsFeatureFlag,
  getSessionRecapDmsFeatureFlag,
  getSessionSummaryFeatureFlag,
} from './FeatureFlagService'
import { getStudentPartnerInfoById } from '../models/Student'
import * as Y from 'yjs'
import { TransactionClient, runInTransaction, getClient } from '../db'
import * as SessionAudioRepo from '../models/SessionAudio'
import { SessionMessageType } from '../router/api/sockets'
import * as TeacherService from './TeacherService'
import { getSessionSummaryByUserType } from './SessionSummariesService'
import { processReportMetrics } from './SessionFlagsService'
import * as SurveyService from './SurveyService'
import { SessionUserRole } from './UserRolesService'
import * as FeatureFlagsService from './FeatureFlagService'
import { createBlobSasUrl } from './AzureService'

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
  toDate: Date,
  tc?: TransactionClient
): Promise<number> {
  return await SessionRepo.getTotalTimeTutoredForDateRange(
    volunteerId,
    fromDate,
    toDate,
    tc
  )
}

export async function handleDmReporting(
  sessionId: Ulid,
  sessionFlags: UserSessionFlags[],
  client: TransactionClient = getClient()
): Promise<void> {
  await runInTransaction(async (tc: TransactionClient) => {
    await markSessionForReview(sessionId, sessionFlags, tc)
  }, client)
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
    if (reportedUser === session.studentId) {
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
    }

    if (source === 'recap') {
      const sessionFlags = isSessionVolunteer
        ? [UserSessionFlags.coachReportedStudentDm]
        : [UserSessionFlags.studentReportedCoachDm]
      handleDmReporting(sessionId, sessionFlags)
    }
  }

  await processReportMetrics(sessionId)

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
    await QueueService.add(Jobs.EmailSessionReported, emailData)
  else
    await cache.saveWithExpiration(
      `${sessionId}-reported`,
      JSON.stringify(emailData)
    )
}

export async function endSession(
  sessionId: Uuid,
  endedBy: Uuid | null = null,
  isAdmin: boolean = false,
  socketService?: SocketService,
  identifiers?: sessionUtils.RequestIdentifier
): Promise<EndedSession> {
  const reqIdentifiers = identifiers
    ? sessionUtils.asRequestIdentifiers(identifiers)
    : undefined

  const session = await SessionRepo.getSessionToEndById(sessionId)
  if (session.endedAt) {
    throw new sessionUtils.EndSessionError(
      `Can't end session: ${sessionId} b/c it ended already`
    )
  }
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

  const endedSession = await runInTransaction(async (tc: TransactionClient) => {
    const endedSession = await SessionRepo.updateSessionToEnd(
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

    if (socketService) {
      await socketService.emitSessionChange(sessionId, tc)
    }

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

    return {
      ...session,
      ...endedSession,
    }
  })

  await SessionmeetingsService.endMeeting(sessionId)

  QueueService.add(Jobs.DetectSessionLanguages, {
    sessionId,
    studentId: session.student.id,
  })

  QueueService.add(Jobs.ProcessSessionEnded, {
    sessionId,
  })

  return endedSession
}

export async function getSessionWithAllDetails(
  sessionId: Ulid,
  tc?: TransactionClient
): Promise<CurrentSession> {
  const session = await SessionRepo.getCurrentSessionBySessionId(sessionId, tc)
  if (!session) {
    throw new Error(`Session data for ${sessionId} not found`)
  }

  return session
}

export async function processSessionReported(sessionId: Ulid) {
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

export async function processSessionTranscript(sessionId: Ulid) {
  try {
    await QueueService.add(
      Jobs.ModerateSessionTranscript,
      { sessionId },
      {
        /* attempt to delay until the whiteboard is uploaded to storage */
        delay: 2 * 60 * 1000,
        attempts: 3,
        backoff: { type: 'exponential', delay: 15000 },
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
      { delay }
    )
  if (sendVolunteerFirstSessionCongrats) {
    await QueueService.add(
      Jobs.EmailVolunteerFirstSessionCongrats,
      {
        sessionId: session.id,
      },
      { delay }
    )
  }
}

export async function addDocEditorVersionTo(session: {
  id: Ulid
  toolType: string
  docEditorVersion?: number
}): Promise<void> {
  if (sessionUtils.isSubjectUsingDocumentEditor(session.toolType)) {
    session.docEditorVersion = await QuillDocService.getDocEditorVersion(
      session.id
    )
  }
}

async function convertV2DocToV1(quillDoc: string[]) {
  const ydoc = new Y.Doc()
  const text = ydoc.getText('quill')
  for (const update of quillDoc) {
    Y.applyUpdate(ydoc, Uint8Array.from(update.split(',').map(Number)))
  }
  // Ensure viewing the document in a recap works by matching existing
  // sessions.quill_doc format.
  return JSON.stringify({ ops: text.toDelta() })
}

export async function storeAndDeleteQuillDoc(sessionId: Ulid): Promise<void> {
  const v2QuillDoc = await QuillDocService.getDocumentUpdates(sessionId)

  const v1QuillDoc = v2QuillDoc.length
    ? await convertV2DocToV1(v2QuillDoc)
    : (await QuillDocService.getQuillDocV1(sessionId))?.doc

  if (v1QuillDoc) {
    await SessionRepo.updateSessionQuillDoc(
      sessionId,
      JSON.stringify(v1QuillDoc)
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
  if (sessionUtils.isSubjectUsingDocumentEditor(session.toolType)) {
    await storeAndDeleteQuillDoc(sessionId)
  } else {
    await storeAndDeleteWhiteboardDoc(sessionId)
  }
}

export async function processEmailVolunteer(sessionId: Ulid) {
  const session = await SessionRepo.getSessionToEndById(sessionId)
  if (session.volunteer?.numPastSessions === 10)
    await QueueService.add(Jobs.EmailVolunteerTenSessionMilestone, {
      volunteerId: session.volunteer.id,
    })
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

export async function storeSessionPhotoKey(sessionId: Uuid) {
  const sessionPhotoKey = uuidv4()
  await SessionRepo.updateSessionPhotoKey(sessionId, sessionPhotoKey)
  return sessionPhotoKey
}

export async function getImageAndUploadUrl(data: unknown) {
  const sessionId = asString(data)
  const session = await SessionRepo.getSessionById(sessionId)
  const sessionPhotoKey = await storeSessionPhotoKey(sessionId)

  if (sessionUtils.isSubjectUsingDocumentEditor(session.toolType)) {
    const { uploadUrl, imageUrl } = await createDocEditorImageUploadUrl(
      sessionId,
      sessionPhotoKey
    )
    return { uploadUrl, imageUrl }
  } else {
    const uploadUrl = await AwsService.getSessionPhotoUploadUrl(sessionPhotoKey)
    const bucketName = config.awsS3.sessionPhotoBucket
    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${sessionPhotoKey}`
    return { uploadUrl, imageUrl }
  }
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

  let sessionPhotos = []
  if (sessionUtils.isSubjectUsingDocumentEditor(session.toolType)) {
    const photos = await AzureService.getSasUrlsInFolder(
      config.appStorageAccountName,
      config.appStorageAccountAccessKey,
      config.sessionsStorageContainer,
      `${sessionId}/images/`,
      { permissions: ['r'], expiresInSeconds: 10 * 60 }
    )
    sessionPhotos = photos.map((photo) => photo.url)
  } else
    sessionPhotos = await AwsService.getObjects(bucket, session.photos || [])

  return {
    ...session,
    userAgent: sessionUserAgent,
    photos: sessionPhotos,
  }
}

export async function startSession(
  user: UserContactInfo,
  data: sessionUtils.StartSessionData & {
    presessionSurvey?: SurveyService.SaveSurveyAndSubmissions
  }
) {
  const {
    subject,
    topic,
    assignmentId,
    presessionSurvey,
    docEditorVersion,
    userAgent,
    ip,
  } = data

  const subjectAndTopic = await getSubjectAndTopic(subject, topic)
  if (!subjectAndTopic) {
    throw new sessionUtils.StartSessionError(
      `Unable to start new session for the topic ${topic} and subject ${subject}.`
    )
  }

  if (user.roleContext.isActiveRole('volunteer')) {
    throw new sessionUtils.StartSessionError(
      'Volunteers cannot create new sessions.'
    )
  }

  const isUserBanned = user.banType === USER_BAN_TYPES.COMPLETE
  if (isUserBanned) {
    throw new sessionUtils.StartSessionError(
      'Banned students cannot request a new session.'
    )
  }

  const currentSession = await SessionRepo.getCurrentSessionByUserId(user.id)
  if (currentSession) {
    throw new sessionUtils.StartSessionError(
      'Student already has an active session.'
    )
  }

  const newSession = await runInTransaction(async (tc: TransactionClient) => {
    const newSession = await SessionRepo.createSession(
      user.id,
      subject,
      user.banType === USER_BAN_TYPES.SHADOW,
      tc
    )

    if (assignmentId) {
      await AssignmentsService.linkSessionToAssignment(
        user.id,
        newSession.id,
        assignmentId,
        tc
      )
    }

    if (presessionSurvey) {
      await SurveyService.saveUserSurvey(
        user.id,
        { ...presessionSurvey, sessionId: newSession.id },
        tc
      )
    }

    await createSessionAction(
      {
        userId: user.id,
        sessionId: newSession.id,
        ...getUserAgentInfo(userAgent),
        ipAddress: ip,
        action: SESSION_USER_ACTIONS.REQUESTED,
      },
      tc
    )

    return newSession
  })

  // TODO: Remove after midtown clean-up.
  if (
    sessionUtils.isSubjectUsingDocumentEditor(subjectAndTopic.toolType) &&
    docEditorVersion === 2
  ) {
    // Save doc editor version before `beginRegularNotifications` to avoid
    // a client calling `currentSession` and looking for this value before it's set.
    await QuillDocService.ensureDocumentUpdateExists(newSession.id)
  }

  const isZwibserveEnabled = await FeatureFlagsService.isZwibserveEnabled(
    user.id
  )
  if (isZwibserveEnabled) {
    await cache.sadd(config.cacheKeys.zwibserveSessions, newSession.id)
  }

  const isNotifyTutorEnabled = await FeatureFlagsService.getNotifyTutorFlag(
    user.id
  )
  if (!isUserBanned && isNotifyTutorEnabled) {
    await beginRegularNotifications(newSession.id, newSession.studentId)
  }

  // Auto end the session after 45 minutes if the session is unmatched.
  const delay = 1000 * 60 * 45
  await QueueService.add(
    Jobs.EndUnmatchedSession,
    { sessionId: newSession.id },
    { delay }
  )

  return {
    ...newSession,
    docEditorVersion,
  }
}

// TODO: Remove after midtown clean-up.
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

export async function getLatestSession(
  userId: Ulid,
  role: SessionUserRole
): Promise<LatestSession | undefined> {
  return await SessionRepo.getLatestSession(userId, role)
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
  data: {
    ipAddress?: string
    userAgent?: string
    joinedFrom?: string
  }
): Promise<Session> {
  const session = await ensureCanJoinSession(user, sessionId)

  const sessionAnalyticsData = {
    userId: user.id,
    sessionId: session.id,
    ...getUserAgentInfo(data.userAgent ? data.userAgent : ''),
    ipAddress: data.ipAddress,
  }

  const isVolunteer = user.roleContext.isActiveRole('volunteer')
  const isInitialVolunteerJoin = isVolunteer && !session.volunteerId
  if (isInitialVolunteerJoin) {
    try {
      await SessionRepo.updateSessionVolunteerById(session.id, user.id)
      session.volunteerId = user.id
      await SocketService.getInstance().emitSessionChange(session.id)
    } catch (err) {
      throw new Error('A volunteer has already joined the session.')
    }

    try {
      await createSessionAction({
        ...sessionAnalyticsData,
        action: SESSION_USER_ACTIONS.JOINED,
      })
      captureEvent(user.id, EVENTS.SESSION_JOINED, {
        sessionId: session.id,
        joinedFrom: data.joinedFrom || '',
      })
      captureEvent(session.studentId, EVENTS.SESSION_MATCHED, {
        sessionId: session.id,
      })
    } catch (error) {
      logger.error(error, `Failed to log session join actions.`, {
        userId: user.id,
        sessionId: session.id,
      })
    }

    try {
      const pushTokens = await getPushTokensByUserId(session.studentId)
      if (pushTokens && pushTokens.length > 0) {
        const tokens = pushTokens.map((token: PushToken) => token.token)
        await PushTokenService.sendVolunteerJoined(
          session.id,
          session.topic,
          session.subject,
          tokens
        )
      }
    } catch (error) {
      logger.error(error, `Failed to send FCM notifications to student.`, {
        studentId: session.studentId,
        userId: user.id,
        sessionId: session.id,
      })
    }
  }

  await addDocEditorVersionTo(session)

  const isStudent = user.roleContext.isActiveRole('student')
  if (!isInitialVolunteerJoin || isStudent) {
    try {
      await createSessionAction({
        ...sessionAnalyticsData,
        action: SESSION_USER_ACTIONS.REJOINED,
      })
      captureEvent(user.id, EVENTS.SESSION_REJOINED, {
        event: EVENTS.SESSION_REJOINED,
        sessionId: session.id,
      })
    } catch (error) {
      logger.error(`Failed to log session rejoined session actions`, {
        userId: user.id,
        sessionId: session.id,
      })
    }
  }

  return session
}

export async function ensureCanJoinSession(
  user: UserContactInfo,
  sessionId: Ulid
): Promise<GetSessionByIdResult> {
  const session = await SessionRepo.getSessionById(sessionId)
  const isStudent = user.roleContext.isActiveRole('student')
  const isVolunteer = user.roleContext.isActiveRole('volunteer')

  if (session.endedAt) {
    await SessionRepo.updateSessionFailedJoinsById(session.id, user.id)

    throw new SessionJoinError(
      `User: ${user.id} with isActiveRoleVolunteer: ${isVolunteer} can't join session: ${sessionId}`
    )
  }

  if (isStudent && session.studentId !== user.id) {
    await SessionRepo.updateSessionFailedJoinsById(session.id, user.id)
    throw new SessionJoinError(
      `A student cannot join another student's session.`
    )
  }

  if (isVolunteer && session.volunteerId && session.volunteerId !== user.id) {
    await SessionRepo.updateSessionFailedJoinsById(session.id, user.id)
    throw new SessionJoinError('A volunteer has already joined the session.')
  }

  if (isVolunteer && session.studentId === user.id) {
    await SessionRepo.updateSessionFailedJoinsById(session.id, user.id)
    throw new SessionJoinError(
      'You may not join your own session as both student and coach.'
    )
  }

  return session
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
      asString(user.id)
    )
  )
    throw new Error('Only session participants are allowed to send messages')

  if (data.type === 'audio-transcription') {
    return await TranscriptMessagesRepo.insertSessionAudioTranscriptMessage({
      userId: user.id,
      sessionId,
      message,
      saidAt: data.saidAt!,
    })
  } else {
    return await SessionRepo.addMessageToSessionById(
      sessionId,
      user.id,
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
  filter: SessionHistoryFilter
) {
  return SessionRepo.getFilteredSessionHistory(userId, filter)
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

export enum DmIneligibilityReason {
  DmFeatureFlag = 'DmFeatureFlag',
  PartnerStudentFeatureFlag = 'PartnerStudentFeatureFlag',
  SessionHasBannedParticipant = 'SessionHasBannedParticipant',
  Other = 'Other',
  VolunteerHasNotInitiatedDmsYet = 'VolunteerHasNotInitiatedDmsYet',
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
  userId: Ulid
): Promise<{ eligible: boolean; ineligibleReason?: DmIneligibilityReason }> {
  const hasBannedParticipant =
    await SessionRepo.sessionHasBannedParticipant(sessionId)
  if (hasBannedParticipant)
    return {
      eligible: false,
      ineligibleReason: DmIneligibilityReason.SessionHasBannedParticipant,
    }
  const session = await SessionRepo.getSessionById(sessionId)
  const volunteerId = session.volunteerId
  const studentId = session.studentId
  if (!volunteerId || !studentId) {
    logger.warn(
      {
        sessionId,
        volunteerId,
        studentId,
      },
      'isRecapDmsAvailable: Bad state - session is missing either student or volunteer'
    )
    return { eligible: false, ineligibleReason: DmIneligibilityReason.Other }
  }
  const isVolunteer = userId === volunteerId
  const isStudent = userId === studentId

  const isAllowDmsToPartnerStudentsActive =
    await getAllowDmsToPartnerStudentsFeatureFlag(volunteerId)
  if (!isAllowDmsToPartnerStudentsActive) {
    const student = await getStudentPartnerInfoById(studentId)
    if (student?.studentPartnerOrg)
      return {
        eligible: false,
        ineligibleReason: DmIneligibilityReason.PartnerStudentFeatureFlag,
      }
  }

  const flag = await getSessionRecapDmsFeatureFlag(volunteerId)
  if (!flag)
    return {
      eligible: false,
      ineligibleReason: DmIneligibilityReason.DmFeatureFlag,
    }
  // Only allow volunteers to initiate DMs
  // Students may send DMs if a DM conversation has already been started
  const sentMessages =
    await SessionRepo.volunteerSentMessageAfterSessionEnded(sessionId)

  // Students may only initiate DMs if the FF is on
  const isStudentsInitiateDmsEnabled =
    await FeatureFlagsService.getStudentsInitiateDmsFeatureFlag(userId)
  if (isStudent) {
    if (sentMessages || isStudentsInitiateDmsEnabled) {
      return { eligible: true }
    }
    return {
      eligible: false,
      ineligibleReason: DmIneligibilityReason.VolunteerHasNotInitiatedDmsYet,
    }
  }

  return { eligible: isVolunteer }
}

export async function getStudentSessionDetails(
  studentId: Ulid,
  teacherId: Ulid
) {
  const sessions = await SessionRepo.getStudentSessionDetails(studentId)

  if (!(await getSessionSummaryFeatureFlag(teacherId))) {
    return sessions
  } else {
    const sessionsWithSummaries = []

    for (const session of sessions) {
      const sessionSummary = await getSessionSummaryByUserType(
        session.id,
        USER_ROLES.TEACHER
      )
      sessionsWithSummaries.push({ ...session, summary: sessionSummary })
    }

    return sessionsWithSummaries
  }
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

function buildSessionImagePath(sessionId: Uuid, fileName: string): string {
  return `${sessionId}/images/${fileName}`
}

export function createDocEditorImageUploadUrl(
  sessionId: Uuid,
  fileName: string
) {
  const filePath = buildSessionImagePath(sessionId, fileName)
  const uploadUrl = createBlobSasUrl(
    config.appStorageAccountName,
    config.appStorageAccountAccessKey,
    config.sessionsStorageContainer,
    filePath,
    { expiresInSeconds: 10 * 60, permissions: ['c', 'w'] }
  )

  const imageUrl = `${config.apiOrigin}/api/sessions/${filePath}`
  return { uploadUrl, imageUrl }
}

export function getDocEditorSessionImageUrl(sessionId: Uuid, fileName: string) {
  const filePath = buildSessionImagePath(sessionId, fileName)
  const blobUrl = createBlobSasUrl(
    config.appStorageAccountName,
    config.appStorageAccountAccessKey,
    config.sessionsStorageContainer,
    filePath,
    // TTL of 2 hours
    { expiresInSeconds: 2 * 60 * 60, permissions: ['r'] }
  )
  return blobUrl
}

export async function markSessionForReview(
  sessionId: string,
  sessionFlags: UserSessionFlags[],
  tc: TransactionClient = getClient()
): Promise<void> {
  await runInTransaction(async (tc: TransactionClient) => {
    await updateSessionFlagsById(sessionId, sessionFlags, tc)
    await updateSessionReviewReasonsById(sessionId, sessionFlags, false, tc)
  }, tc)
}

export async function isSessionFulfilled(sessionId: Uuid): Promise<boolean> {
  return SessionRepo.isSessionFulfilled(sessionId)
}

export async function getVolunteersInSessions(): Promise<Set<Ulid>> {
  const volunteers = await SessionRepo.getVolunteersInSessions()
  return new Set(volunteers)
}

export async function addSessionSmsNotification(
  sessionId: Uuid,
  volunteerId: Uuid,
  priorityGroupName: string = '',
  messageCarrierId?: string
) {
  await SessionRepo.addSessionNotification(sessionId, {
    wasSuccessful: !!messageCarrierId,
    messageId: messageCarrierId,
    volunteer: volunteerId,
    type: 'initial',
    method: 'sms',
    priorityGroup: priorityGroupName,
  })
}

export async function isZwibserveSession(sessionId: Uuid) {
  const members = await cache.smembers(config.cacheKeys.zwibserveSessions)
  return members.includes(sessionId)
}
