import { SESSION_REPORT_REASON, USER_SESSION_METRICS } from '../constants'
import { Uuid } from '../models/pgUtils'
import {
  getMessagesForFrontend,
  getSessionById,
  MessageForFrontend,
  Session,
  updateSessionFlagsById,
  updateSessionReviewReasonsById,
} from '../models/Session'
import {
  getPostsessionSurveyResponsesForSessionMetrics,
  PostsessionSurveyResponse,
} from '../models/Survey'
import {
  getUSMByUserId,
  updateUserSessionMetricsByUserId,
  UserSessionMetrics,
} from '../models/UserSessionMetrics'
import { Jobs } from '../worker/jobs'
import QueueService from './QueueService'
import moment from 'moment'
import * as SessionMetricsRepo from '../models/SessionMetrics'
import { TransactionClient } from '../db'

export function computeAbsentStudentMetric(
  session: Session,
  messages: MessageForFrontend[]
): number {
  const VOLUNTEER_WAITING_PERIOD_MIN = 10
  if (session.volunteerJoinedAt) {
    const volunteerMaxWait = moment(session.volunteerJoinedAt).add(
      VOLUNTEER_WAITING_PERIOD_MIN,
      'minutes'
    )

    // if volunteer waits for less than 10 minutes, do not flag student bc student did not get a chance to respond within wait period
    if (moment(session.endedAt).isSameOrBefore(volunteerMaxWait)) return 0

    for (const msg of messages) {
      if (
        msg.user === session.studentId &&
        // if student sends message after volunteer joined, then don't flag student
        moment(msg.createdAt).isAfter(session.volunteerJoinedAt)
      )
        return 0
    }
    return 1
  }
  return 0
}

export function computeAbsentVolunteerMetric(
  session: Session,
  messages: MessageForFrontend[]
): number {
  const STUDENT_WAITING_PERIOD_MIN = 5
  if (session.volunteerJoinedAt) {
    const studentMaxWait = moment(session.volunteerJoinedAt).add(
      STUDENT_WAITING_PERIOD_MIN,
      'minutes'
    )

    //if student waits for less than 5 minutes, then not flag volunteer
    if (moment(session.endedAt).isSameOrBefore(studentMaxWait)) return 0

    for (const msg of messages) {
      if (
        // if volunteer sends message, then don't flag volunteer
        msg.user === session.volunteerId
      )
        return 0
    }
    return 1
  }
  return 0
}

export function computeHasBeenUnmatchedMetric(session: Session): number {
  return session.volunteerId ? 0 : 1
}

export function computeLowCoachRatingFromStudent(
  surveyResponses: PostsessionSurveyResponse[]
) {
  const coachRatingFromStudent = surveyResponses?.find(
    (resp) =>
      resp.questionText === 'Overall, how supportive was your coach today?'
  )?.score
  if (coachRatingFromStudent && coachRatingFromStudent <= 2) return 1
  return 0
}

export function computeLowSessionRatingFromStudent(
  surveyResponses: PostsessionSurveyResponse[]
) {
  const sessionRatingFromStudent = surveyResponses?.find((resp) =>
    resp.questionText.endsWith('Did UPchieve help you achieve your goal?')
  )?.score
  if (sessionRatingFromStudent && sessionRatingFromStudent <= 2) return 1
  return 0
}

export function computeLowSessionRatingFromCoach(
  surveyResponses: PostsessionSurveyResponse[]
) {
  const sessionRatingFromCoach = surveyResponses?.find((resp) =>
    resp.questionText.endsWith('Were you able to help them achieve their goal?')
  )?.score
  if (sessionRatingFromCoach && sessionRatingFromCoach <= 2) return 1
  return 0
}

export function computeReported(session: Session) {
  return session.reported ? 1 : 0
}

export function computeFeedbackMetric(
  surveyResponses: PostsessionSurveyResponse[],
  condition: (resp: PostsessionSurveyResponse) => boolean
): number {
  return surveyResponses.some(condition) ? 1 : 0
}

export async function computeMetricsForSession(
  session: Session
): Promise<Partial<SessionMetricsRepo.SessionMetrics>> {
  const messages = await getMessagesForFrontend(session.id)
  return {
    absentStudent: computeAbsentStudentMetric(session, messages),
    absentVolunteer: computeAbsentVolunteerMetric(session, messages),
    hasBeenUnmatched: computeHasBeenUnmatchedMetric(session),
  }
}

export async function computeMetricsForFeedbackSaved(
  session: Session
): Promise<Partial<SessionMetricsRepo.SessionMetrics>> {
  const surveyResponses = await getPostsessionSurveyResponsesForSessionMetrics(
    session.id
  )
  return {
    lowCoachRatingFromStudent:
      computeLowCoachRatingFromStudent(surveyResponses),
    lowSessionRatingFromStudent:
      computeLowSessionRatingFromStudent(surveyResponses),
    lowSessionRatingFromCoach:
      computeLowSessionRatingFromCoach(surveyResponses),
    rudeOrInappropriate: computeFeedbackMetric(
      surveyResponses,
      (resp: PostsessionSurveyResponse) =>
        resp.response === 'Student was mean or inappropriate'
    ),
    onlyLookingForAnswers: computeFeedbackMetric(
      surveyResponses,
      (resp: PostsessionSurveyResponse) =>
        resp.response === 'Student was pressuring me to do their work for them'
    ),
    commentFromStudent: computeFeedbackMetric(
      surveyResponses,
      (resp: PostsessionSurveyResponse) =>
        resp.questionText ===
          'This can be about the web app, the Academic Coach who helped you, the services UPchieve offers, etc.' &&
        resp.userRole === 'student' &&
        !!resp.response
    ),
    commentFromVolunteer: computeFeedbackMetric(
      surveyResponses,
      (resp: PostsessionSurveyResponse) =>
        resp.questionText ===
          'This can be about the web app, the student you helped, technical issues, etc.' &&
        resp.userRole === 'volunteer' &&
        !!resp.response
    ),
    hasHadTechnicalIssues: computeFeedbackMetric(
      surveyResponses,
      (resp: PostsessionSurveyResponse) => resp.response === 'Tech issue'
    ),
    personalIdentifyingInfo: computeFeedbackMetric(
      surveyResponses,
      (resp: PostsessionSurveyResponse) =>
        resp.response ===
        'Student shared their email, last name, or other personally identifiable information'
    ),
    gradedAssignment: computeFeedbackMetric(
      surveyResponses,
      (resp: PostsessionSurveyResponse) =>
        resp.response === 'Student was working on a quiz or exam'
    ),
    coachUncomfortable: computeFeedbackMetric(
      surveyResponses,
      (resp: PostsessionSurveyResponse) =>
        resp.response === 'Student made me feel uncomfortable'
    ),
    studentCrisis: computeFeedbackMetric(
      surveyResponses,
      (resp: PostsessionSurveyResponse) =>
        resp.response ===
        'Student is in severe emotional distress and/or unsafe'
    ),
  }
}

export function computeMetricsForReportedSession(
  session: Session
): Partial<SessionMetricsRepo.SessionMetrics> {
  return {
    reported: computeReported(session),
  }
}

export function computeSessionFlagsFromMetrics(
  metrics: Partial<SessionMetricsRepo.SessionMetrics>
): USER_SESSION_METRICS[] {
  const flags = []
  if (metrics.absentStudent) flags.push(USER_SESSION_METRICS.absentStudent)
  if (metrics.absentVolunteer) flags.push(USER_SESSION_METRICS.absentVolunteer)
  return flags
}

export function computeFeedbackFlagsFromMetrics(
  metrics: SessionMetricsRepo.SessionMetrics
) {
  const flags = []
  if (metrics.lowCoachRatingFromStudent)
    flags.push(USER_SESSION_METRICS.lowCoachRatingFromStudent)
  if (metrics.lowSessionRatingFromStudent)
    flags.push(USER_SESSION_METRICS.lowSessionRatingFromStudent)
  if (metrics.lowSessionRatingFromCoach)
    flags.push(USER_SESSION_METRICS.lowSessionRatingFromCoach)
  if (metrics.rudeOrInappropriate)
    flags.push(USER_SESSION_METRICS.rudeOrInappropriate)
  if (metrics.onlyLookingForAnswers)
    flags.push(USER_SESSION_METRICS.onlyLookingForAnswers)
  if (metrics.commentFromStudent)
    flags.push(USER_SESSION_METRICS.commentFromStudent)
  if (metrics.commentFromVolunteer)
    flags.push(USER_SESSION_METRICS.commentFromVolunteer)
  if (metrics.personalIdentifyingInfo)
    flags.push(USER_SESSION_METRICS.personalIdentifyingInfo)
  if (metrics.gradedAssignment)
    flags.push(USER_SESSION_METRICS.gradedAssignment)
  if (metrics.coachUncomfortable)
    flags.push(USER_SESSION_METRICS.coachUncomfortable)
  if (metrics.studentCrisis) flags.push(USER_SESSION_METRICS.studentCrisis)
  return flags
}

export function computeReportedFlagsFromMetrics(
  metrics: SessionMetricsRepo.SessionMetrics
) {
  const flags = []
  if (metrics.reported) flags.push(USER_SESSION_METRICS.reported)
  return flags
}

export function computeSessionReviewReasonsFromMetrics(
  metrics: SessionMetricsRepo.SessionMetrics,
  studentUSM: UserSessionMetrics,
  voluteerUSM?: UserSessionMetrics
) {
  const reviewReasons = []
  if (metrics.absentStudent && studentUSM.absentStudent >= 4)
    reviewReasons.push(USER_SESSION_METRICS.absentStudent)
  if (
    metrics.absentVolunteer &&
    voluteerUSM &&
    voluteerUSM.absentVolunteer >= 2
  )
    reviewReasons.push(USER_SESSION_METRICS.absentVolunteer)
  return reviewReasons
}

export function computeFeedbackReviewReasonsFromMetrics(
  metrics: SessionMetricsRepo.SessionMetrics,
  studentUSM: UserSessionMetrics
) {
  const reviewReasons = []
  if (metrics.lowCoachRatingFromStudent)
    reviewReasons.push(USER_SESSION_METRICS.lowCoachRatingFromStudent)
  if (metrics.lowSessionRatingFromStudent)
    reviewReasons.push(USER_SESSION_METRICS.lowSessionRatingFromStudent)
  if (metrics.lowSessionRatingFromCoach)
    reviewReasons.push(USER_SESSION_METRICS.lowSessionRatingFromCoach)
  if (metrics.rudeOrInappropriate && studentUSM.rudeOrInappropriate >= 2)
    reviewReasons.push(USER_SESSION_METRICS.rudeOrInappropriate)
  if (metrics.onlyLookingForAnswers && studentUSM.onlyLookingForAnswers >= 2)
    reviewReasons.push(USER_SESSION_METRICS.onlyLookingForAnswers)
  if (metrics.personalIdentifyingInfo)
    reviewReasons.push(USER_SESSION_METRICS.personalIdentifyingInfo)
  if (metrics.gradedAssignment)
    reviewReasons.push(USER_SESSION_METRICS.gradedAssignment)
  if (metrics.coachUncomfortable)
    reviewReasons.push(USER_SESSION_METRICS.coachUncomfortable)
  if (metrics.studentCrisis)
    reviewReasons.push(USER_SESSION_METRICS.studentCrisis)
  return reviewReasons
}

export function computeReportedReviewReason(
  metrics: SessionMetricsRepo.SessionMetrics
) {
  const reviewReasons = []
  if (metrics.reported) reviewReasons.push(USER_SESSION_METRICS.reported)
  return reviewReasons
}

export async function triggerSessionActions(
  metrics: SessionMetricsRepo.SessionMetrics,
  studentUSM: UserSessionMetrics,
  voluteerUSM?: UserSessionMetrics
) {
  const sessionId = metrics.sessionId
  if (metrics.absentStudent) {
    // Send a warning email to the student about ghosting volunteers the first time the he or she is absent
    if (studentUSM.absentStudent === 1)
      await QueueService.add(
        Jobs.EmailStudentAbsentWarning,
        {
          sessionId,
        },
        {
          removeOnComplete: true,
          removeOnFail: true,
        }
      )

    // Send an apology email to the volunteer the first time he or she encounters an absent student
    if (voluteerUSM?.absentStudent === 1)
      await QueueService.add(
        Jobs.EmailVolunteerAbsentStudentApology,
        {
          sessionId,
        },
        {
          removeOnComplete: true,
          removeOnFail: true,
        }
      )
  }

  if (metrics.absentVolunteer) {
    // Send a warning email to the volunteer about ghosting students the first time he or she is absent
    if (voluteerUSM?.absentVolunteer === 1)
      await QueueService.add(
        Jobs.EmailVolunteerAbsentWarning,
        {
          sessionId,
        },
        {
          removeOnComplete: true,
          removeOnFail: true,
        }
      )
    // Send an apology email to the student the first time he or she encounters an absent volunteer
    if (studentUSM.absentVolunteer === 1)
      await QueueService.add(
        Jobs.EmailStudentAbsentVolunteerApology,
        {
          sessionId,
        },
        {
          removeOnComplete: true,
          removeOnFail: true,
        }
      )
  }

  if (metrics.hasBeenUnmatched) {
    // Send an apology email to the student the first time their session is unmatched
    if (studentUSM.hasBeenUnmatched === 1)
      await QueueService.add(
        Jobs.EmailStudentUnmatchedApology,
        {
          sessionId,
        },
        {
          removeOnComplete: true,
          removeOnFail: true,
        }
      )
  }
}

// TODO: Refactor queue payloads to only take sessionId (or a reportId?)
export async function triggerFeedbackActions(
  metrics: SessionMetricsRepo.SessionMetrics,
  studentUSM: UserSessionMetrics
) {
  const sessionId = metrics.sessionId
  const session = await getSessionById(sessionId)
  if (metrics.onlyLookingForAnswers && studentUSM.onlyLookingForAnswers === 1)
    await QueueService.add(
      Jobs.EmailStudentOnlyLookingForAnswers,
      {
        sessionId,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      }
    )

  if (!session.reported) {
    QueueService.add(
      Jobs.EmailSessionReported,
      {
        userId: session.studentId,
        reportedBy: session.volunteerId,
        reportReason: SESSION_REPORT_REASON.STUDENT_SAFETY,
        isBanReason: false,
        sessionId: session.id,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      }
    )
  }
}

type UpdatableMetricKey =
  | 'absentStudent'
  | 'absentVolunteer'
  | 'lowSessionRatingFromCoach'
  | 'lowSessionRatingFromStudent'
  | 'lowCoachRatingFromStudent'
  | 'reported'
  | 'onlyLookingForAnswers'
  | 'rudeOrInappropriate'
  | 'commentFromStudent'
  | 'commentFromVolunteer'
  | 'hasBeenUnmatched'
  | 'hasHadTechnicalIssues'
  | 'personalIdentifyingInfo'
  | 'gradedAssignment'
  | 'coachUncomfortable'
  | 'studentCrisis'

const metricKeys: UpdatableMetricKey[] = [
  'absentStudent',
  'absentVolunteer',
  'lowSessionRatingFromCoach',
  'lowSessionRatingFromStudent',
  'lowCoachRatingFromStudent',
  'reported',
  'onlyLookingForAnswers',
  'rudeOrInappropriate',
  'commentFromStudent',
  'commentFromVolunteer',
  'hasBeenUnmatched',
  'hasHadTechnicalIssues',
  'personalIdentifyingInfo',
  'gradedAssignment',
  'coachUncomfortable',
  'studentCrisis',
]

// TODO: Remove once we're using the user session metrics view
function updateUSMValues(
  usm: UserSessionMetrics,
  metrics: Partial<SessionMetricsRepo.SessionMetrics>
): UserSessionMetrics {
  return metricKeys.reduce(
    (updated, key) => {
      const sessionValue = metrics[key] ?? 0
      const currentValue = updated[key] ?? 0
      return { ...updated, [key]: currentValue + sessionValue }
    },
    { ...usm }
  )
}

// TODO: Will only need to get the session once we move over to the view
export async function getSessionAndUSMs(sessionId: Uuid) {
  const session = await getSessionById(sessionId)
  const studentUSM = await getUSMByUserId(session.studentId)
  if (!studentUSM)
    throw new Error(`Could not find USM for student ${session.studentId}`)
  let volunteerUSM: UserSessionMetrics | undefined
  if (session.volunteerId) {
    volunteerUSM = await getUSMByUserId(session.volunteerId)
    if (!volunteerUSM)
      throw new Error(`Could not find USM for volunteer ${session.volunteerId}`)
  }
  return { session, studentUSM, volunteerUSM }
}

async function updateUserMetrics(
  session: Session,
  metrics: SessionMetricsRepo.SessionMetrics,
  studentUSM: UserSessionMetrics,
  volunteerUSM?: UserSessionMetrics
) {
  const updatedStudentUSM = await updateUserSessionMetricsByUserId(
    session.studentId,
    updateUSMValues(studentUSM, metrics)
  )
  let updatedVolunteerUSM
  if (session.volunteerId && volunteerUSM) {
    updatedVolunteerUSM = await updateUserSessionMetricsByUserId(
      session.volunteerId,
      updateUSMValues(volunteerUSM, metrics)
    )
  }
  return { updatedStudentUSM, updatedVolunteerUSM }
}

export async function processMetrics(
  sessionId: Uuid,
  callbacks: {
    computeSessionMetrics: (
      session: Session
    ) =>
      | Promise<Partial<SessionMetricsRepo.SessionMetrics>>
      | Partial<SessionMetricsRepo.SessionMetrics>
    computeSessionFlags: (
      metrics: SessionMetricsRepo.SessionMetrics
    ) => USER_SESSION_METRICS[]
    computeReviewReasons: (
      metrics: SessionMetricsRepo.SessionMetrics,
      studentUSM: UserSessionMetrics,
      volunteerUSM?: UserSessionMetrics
    ) => any[]
    triggerActions?: (
      metrics: SessionMetricsRepo.SessionMetrics,
      studentUSM: UserSessionMetrics,
      volunteerUSM?: UserSessionMetrics
    ) => Promise<void>
  }
) {
  const { session, studentUSM, volunteerUSM } =
    await getSessionAndUSMs(sessionId)
  const {
    computeSessionMetrics,
    computeSessionFlags,
    computeReviewReasons,
    triggerActions,
  } = callbacks
  const sessionMetrics = await computeSessionMetrics(session)
  const updatedMetrics = await SessionMetricsRepo.updateSessionMetrics(
    sessionId,
    sessionMetrics
  )

  // TODO: Query for participant's user session metrics view instead of updating
  const { updatedStudentUSM, updatedVolunteerUSM } = await updateUserMetrics(
    session,
    updatedMetrics,
    studentUSM,
    volunteerUSM
  )

  const flags = computeSessionFlags(updatedMetrics)
  await updateSessionFlagsById(session.id, flags)

  const reviewReasons = computeReviewReasons(
    updatedMetrics,
    updatedStudentUSM,
    updatedVolunteerUSM
  )
  await updateSessionReviewReasonsById(session.id, reviewReasons)

  if (triggerActions)
    await triggerActions(updatedMetrics, updatedStudentUSM, updatedVolunteerUSM)
}

export async function processSessionMetrics(sessionId: Uuid) {
  await processMetrics(sessionId, {
    computeSessionMetrics: computeMetricsForSession,
    computeSessionFlags: computeSessionFlagsFromMetrics,
    computeReviewReasons: computeSessionReviewReasonsFromMetrics,
    triggerActions: triggerSessionActions,
  })
}

export async function processFeedbackMetrics(sessionId: Uuid) {
  await processMetrics(sessionId, {
    computeSessionMetrics: computeMetricsForFeedbackSaved,
    computeSessionFlags: computeFeedbackFlagsFromMetrics,
    computeReviewReasons: computeFeedbackReviewReasonsFromMetrics,
    triggerActions: triggerFeedbackActions,
  })
}

export async function processReportMetrics(sessionId: Uuid) {
  await processMetrics(sessionId, {
    computeSessionMetrics: computeMetricsForReportedSession,
    computeSessionFlags: computeReportedFlagsFromMetrics,
    computeReviewReasons: computeReportedReviewReason,
  })
}

export async function createSessionMetrics(
  sessionId: Uuid,
  tc?: TransactionClient
) {
  return SessionMetricsRepo.createSessionMetrics(sessionId, tc)
}

/**
 *
 * Temporary functions for migration:
 * These functions are used as part of the migration from the old metricProcessorFactory
 * to a new processing format defined in service.ts. They ensure that data in session_metrics
 * gets populated correctly while preserving the current behavior for updating USM,
 * session flags, and review reasons.
 *
 */
export async function updateSessionMetricsSessionEnd(sessionId: Uuid) {
  const session = await getSessionById(sessionId)
  const sessionMetrics = await computeMetricsForSession(session)
  await SessionMetricsRepo.updateSessionMetrics(sessionId, sessionMetrics)
}
export async function updateSessionMetricsFeedbackSaved(sessionId: Uuid) {
  const session = await getSessionById(sessionId)
  const sessionMetrics = await computeMetricsForFeedbackSaved(session)
  await SessionMetricsRepo.updateSessionMetrics(sessionId, sessionMetrics)
}
export async function updateSessionMetricsSessionReported(sessionId: Uuid) {
  const session = await getSessionById(sessionId)
  const sessionMetrics = computeMetricsForReportedSession(session)
  await SessionMetricsRepo.updateSessionMetrics(sessionId, sessionMetrics)
}
