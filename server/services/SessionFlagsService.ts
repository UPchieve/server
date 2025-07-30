import moment from 'moment'
import QueueService from './QueueService'
import { SESSION_REPORT_REASON, UserSessionFlags } from '../constants'
import { Uuid } from '../models/pgUtils'
import {
  getMessagesForFrontend,
  getSessionById,
  MessageForFrontend,
  GetSessionByIdResult,
  updateSessionFlagsById,
  updateSessionReviewReasonsById,
} from '../models/Session'
import {
  getPostsessionSurveyResponsesForSessionMetrics,
  PostsessionSurveyResponse,
} from '../models/Survey'
import {
  getUserSessionMetricsByUserId,
  UserSessionMetrics,
} from '../models/UserSessionMetrics'
import { Jobs } from '../worker/jobs'
import logger from '../logger'

export const VOLUNTEER_WAITING_PERIOD_MIN = 10
export const STUDENT_WAITING_PERIOD_MIN = 5

export function computeAbsentStudent(
  session: GetSessionByIdResult,
  messages: MessageForFrontend[]
): boolean {
  if (session.volunteerJoinedAt) {
    const volunteerMaxWait = moment(session.volunteerJoinedAt).add(
      VOLUNTEER_WAITING_PERIOD_MIN,
      'minutes'
    )

    // if volunteer waits for less than 10 minutes, do not flag student bc student did not get a chance to respond within wait period
    if (moment(session.endedAt).isSameOrBefore(volunteerMaxWait)) return false

    for (const msg of messages) {
      if (
        msg.user === session.studentId &&
        // if student sends message after volunteer joined, then don't flag student
        moment(msg.createdAt).isAfter(session.volunteerJoinedAt)
      )
        return false
    }
    return true
  }
  return false
}

export function computeAbsentVolunteer(
  session: GetSessionByIdResult,
  messages: MessageForFrontend[]
): boolean {
  if (session.volunteerJoinedAt) {
    const studentMaxWait = moment(session.volunteerJoinedAt).add(
      STUDENT_WAITING_PERIOD_MIN,
      'minutes'
    )

    // If student waits for less than 5 minutes, then don't flag volunteer
    if (moment(session.endedAt).isSameOrBefore(studentMaxWait)) return false

    for (const msg of messages) {
      if (
        // If volunteer sends message, then don't flag volunteer
        msg.user === session.volunteerId
      )
        return false
    }
    return true
  }
  return false
}

export function computeHasBeenUnmatched(
  session: GetSessionByIdResult
): boolean {
  return !session.volunteerId
}

export function computeLowCoachRatingFromStudent(
  surveyResponses: PostsessionSurveyResponse[]
): boolean {
  const coachRatingFromStudent = surveyResponses?.find(
    (resp) =>
      resp.questionText === 'Overall, how supportive was your coach today?'
  )?.score
  return !!(coachRatingFromStudent && coachRatingFromStudent <= 2)
}

export function computeLowSessionRatingFromStudent(
  surveyResponses: PostsessionSurveyResponse[]
): boolean {
  const sessionRatingFromStudent = surveyResponses?.find((resp) =>
    resp.questionText?.endsWith('Did UPchieve help you achieve your goal?')
  )?.score
  return !!(sessionRatingFromStudent && sessionRatingFromStudent <= 2)
}

export function computeLowSessionRatingFromCoach(
  surveyResponses: PostsessionSurveyResponse[]
): boolean {
  const sessionRatingFromCoach = surveyResponses?.find((resp) =>
    resp.questionText?.endsWith(
      'Were you able to help them achieve their goal?'
    )
  )?.score
  return !!(sessionRatingFromCoach && sessionRatingFromCoach <= 2)
}

export function hasFeedbackMatch(
  surveyResponses: PostsessionSurveyResponse[],
  condition: (resp: PostsessionSurveyResponse) => boolean
): boolean {
  return surveyResponses.some(condition)
}

export async function computeSessionFlags(
  session: GetSessionByIdResult
): Promise<UserSessionFlags[]> {
  const messages = await getMessagesForFrontend(session.id)
  const flags = []
  if (computeAbsentStudent(session, messages))
    flags.push(UserSessionFlags.absentStudent)
  if (computeAbsentVolunteer(session, messages))
    flags.push(UserSessionFlags.absentVolunteer)
  if (computeHasBeenUnmatched(session))
    flags.push(UserSessionFlags.hasBeenUnmatched)
  return flags
}

export async function computeFeedbackFlags(
  session: GetSessionByIdResult
): Promise<UserSessionFlags[]> {
  const surveyResponses = await getPostsessionSurveyResponsesForSessionMetrics(
    session.id
  )
  const flags = []
  if (computeLowCoachRatingFromStudent(surveyResponses))
    flags.push(UserSessionFlags.lowCoachRatingFromStudent)
  if (computeLowSessionRatingFromStudent(surveyResponses))
    flags.push(UserSessionFlags.lowSessionRatingFromStudent)
  if (computeLowSessionRatingFromCoach(surveyResponses))
    flags.push(UserSessionFlags.lowSessionRatingFromCoach)
  if (
    hasFeedbackMatch(
      surveyResponses,
      (resp: PostsessionSurveyResponse) =>
        resp.response === 'Student was mean or inappropriate'
    )
  )
    flags.push(UserSessionFlags.rudeOrInappropriate)

  if (
    hasFeedbackMatch(
      surveyResponses,
      (resp: PostsessionSurveyResponse) =>
        resp.response === 'Student was pressuring me to do their work for them'
    )
  )
    flags.push(UserSessionFlags.onlyLookingForAnswers)

  if (
    hasFeedbackMatch(
      surveyResponses,
      (resp: PostsessionSurveyResponse) =>
        resp.questionText ===
          'This can be about the web app, the Academic Coach who helped you, the services UPchieve offers, etc.' &&
        resp.userRole === 'student' &&
        !!resp.response?.trim()
    )
  )
    flags.push(UserSessionFlags.commentFromStudent)

  if (
    hasFeedbackMatch(
      surveyResponses,
      (resp: PostsessionSurveyResponse) =>
        resp.questionText ===
          'This can be about the web app, the student you helped, technical issues, etc.' &&
        resp.userRole === 'volunteer' &&
        !!resp.response?.trim()
    )
  )
    flags.push(UserSessionFlags.commentFromVolunteer)

  if (
    hasFeedbackMatch(
      surveyResponses,
      (resp: PostsessionSurveyResponse) => resp.response === 'Tech issue'
    )
  )
    flags.push(UserSessionFlags.hasHadTechnicalIssues)

  if (
    hasFeedbackMatch(
      surveyResponses,
      (resp: PostsessionSurveyResponse) =>
        resp.response ===
        'Student shared their email, last name, or other personally identifiable information'
    )
  )
    flags.push(UserSessionFlags.personalIdentifyingInfo)

  if (
    hasFeedbackMatch(
      surveyResponses,
      (resp: PostsessionSurveyResponse) =>
        resp.response === 'Student was working on a quiz or exam'
    )
  )
    flags.push(UserSessionFlags.gradedAssignment)

  if (
    hasFeedbackMatch(
      surveyResponses,
      (resp: PostsessionSurveyResponse) =>
        resp.response === 'Student made me feel uncomfortable'
    )
  )
    flags.push(UserSessionFlags.coachUncomfortable)

  if (
    hasFeedbackMatch(
      surveyResponses,
      (resp: PostsessionSurveyResponse) =>
        resp.response ===
        'Student is in severe emotional distress and/or unsafe'
    )
  )
    flags.push(UserSessionFlags.studentCrisis)
  return flags
}

export function computeReportedFlags(
  session: GetSessionByIdResult
): UserSessionFlags[] {
  const flags = []
  if (session?.reported) flags.push(UserSessionFlags.reported)
  return flags
}

export function computeSessionReviewReasonsFromFlags(
  flags: UserSessionFlags[],
  studentUSM: UserSessionMetrics,
  voluteerUSM?: UserSessionMetrics
) {
  const reviewReasons = []
  if (
    flags.includes(UserSessionFlags.absentStudent) &&
    studentUSM.absentStudent >= 4
  )
    reviewReasons.push(UserSessionFlags.absentStudent)
  if (
    flags.includes(UserSessionFlags.absentVolunteer) &&
    voluteerUSM &&
    voluteerUSM.absentVolunteer >= 2
  )
    reviewReasons.push(UserSessionFlags.absentVolunteer)
  return reviewReasons
}

export function computeFeedbackReviewReasonsFromFlags(
  flags: UserSessionFlags[],
  studentUSM: UserSessionMetrics
) {
  const reviewReasons = []
  if (flags.includes(UserSessionFlags.lowCoachRatingFromStudent))
    reviewReasons.push(UserSessionFlags.lowCoachRatingFromStudent)
  if (flags.includes(UserSessionFlags.lowSessionRatingFromStudent))
    reviewReasons.push(UserSessionFlags.lowSessionRatingFromStudent)
  if (flags.includes(UserSessionFlags.lowSessionRatingFromCoach))
    reviewReasons.push(UserSessionFlags.lowSessionRatingFromCoach)
  if (
    flags.includes(UserSessionFlags.rudeOrInappropriate) &&
    studentUSM.rudeOrInappropriate >= 2
  )
    reviewReasons.push(UserSessionFlags.rudeOrInappropriate)
  if (
    flags.includes(UserSessionFlags.onlyLookingForAnswers) &&
    studentUSM.onlyLookingForAnswers >= 2
  )
    reviewReasons.push(UserSessionFlags.onlyLookingForAnswers)
  if (flags.includes(UserSessionFlags.personalIdentifyingInfo))
    reviewReasons.push(UserSessionFlags.personalIdentifyingInfo)
  if (flags.includes(UserSessionFlags.gradedAssignment))
    reviewReasons.push(UserSessionFlags.gradedAssignment)
  if (flags.includes(UserSessionFlags.coachUncomfortable))
    reviewReasons.push(UserSessionFlags.coachUncomfortable)
  if (flags.includes(UserSessionFlags.studentCrisis))
    reviewReasons.push(UserSessionFlags.studentCrisis)
  return reviewReasons
}

export function computeReportedReviewReason(flags: UserSessionFlags[]) {
  const reviewReasons = []
  if (flags.includes(UserSessionFlags.reported))
    reviewReasons.push(UserSessionFlags.reported)
  return reviewReasons
}

export async function triggerSessionActions(
  sessionId: Uuid,
  flags: UserSessionFlags[],
  studentUSM: UserSessionMetrics,
  voluteerUSM?: UserSessionMetrics
) {
  if (flags.includes(UserSessionFlags.absentStudent)) {
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

  if (flags.includes(UserSessionFlags.absentVolunteer)) {
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

  if (flags.includes(UserSessionFlags.hasBeenUnmatched)) {
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

// TODO: Refactor queue payloads to only take sessionId
export async function triggerFeedbackActions(
  sessionId: Uuid,
  flags: UserSessionFlags[],
  studentUSM: UserSessionMetrics
) {
  const session = await getSessionById(sessionId)
  if (
    flags.includes(UserSessionFlags.onlyLookingForAnswers) &&
    studentUSM.onlyLookingForAnswers === 1
  )
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

  // If session was not reported, follow report workflow for emotional distress
  if (flags.includes(UserSessionFlags.studentCrisis) && !session.reported) {
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

export async function processMetrics(
  sessionId: Uuid,
  callbacks: {
    computeSessionFlags: (
      session: GetSessionByIdResult
    ) => Promise<UserSessionFlags[]> | UserSessionFlags[]
    computeReviewReasons: (
      flags: UserSessionFlags[],
      studentUSM: UserSessionMetrics,
      volunteerUSM?: UserSessionMetrics
    ) => UserSessionFlags[]
    triggerActions?: (
      sessionId: Uuid,
      flags: UserSessionFlags[],
      studentUSM: UserSessionMetrics,
      volunteerUSM?: UserSessionMetrics
    ) => Promise<void>
  },
  excludeFromReviewSessionFlags: Set<UserSessionFlags> = new Set<UserSessionFlags>()
) {
  const session = await getSessionById(sessionId)
  const flags = await callbacks.computeSessionFlags(session)
  await updateSessionFlagsById(session.id, flags)

  const studentUserSessionMetrics = await getUserSessionMetricsByUserId(
    session.studentId,
    'student'
  )
  // There will not be a user session metrics record if the student has not
  // had any sessions that have been flagged. This may be okay behavior for now, but
  // we may consider having a default record instead of undefined
  if (!studentUserSessionMetrics) {
    logger.info(
      `No user session metrics found for student ${session.studentId}`
    )
    return
  }

  const volunteerUserSessionMetrics = session.volunteerId
    ? await getUserSessionMetricsByUserId(session.volunteerId, 'volunteer')
    : undefined

  const reviewReasons = callbacks.computeReviewReasons(
    flags,
    studentUserSessionMetrics,
    volunteerUserSessionMetrics
  )

  const dontReview = reviewReasons.every((reviewReason) =>
    excludeFromReviewSessionFlags.has(reviewReason)
  )

  if (!dontReview && reviewReasons.length)
    await updateSessionReviewReasonsById(session.id, reviewReasons, false)

  if (callbacks.triggerActions)
    await callbacks.triggerActions(
      session.id,
      flags,
      studentUserSessionMetrics,
      volunteerUserSessionMetrics
    )
}

export async function processSessionMetrics(sessionId: Uuid) {
  await processMetrics(
    sessionId,
    {
      computeSessionFlags: computeSessionFlags,
      computeReviewReasons: computeSessionReviewReasonsFromFlags,
      triggerActions: triggerSessionActions,
    },
    new Set<UserSessionFlags>([
      UserSessionFlags.absentStudent,
      UserSessionFlags.absentVolunteer,
    ])
  )
}

export async function processFeedbackMetrics(sessionId: Uuid) {
  await processMetrics(
    sessionId,
    {
      computeSessionFlags: computeFeedbackFlags,
      computeReviewReasons: computeFeedbackReviewReasonsFromFlags,
      triggerActions: triggerFeedbackActions,
    },
    new Set<UserSessionFlags>([
      UserSessionFlags.lowCoachRatingFromStudent,
      UserSessionFlags.lowSessionRatingFromCoach,
      UserSessionFlags.lowSessionRatingFromStudent,
    ])
  )
}

export async function processReportMetrics(sessionId: Uuid) {
  await processMetrics(sessionId, {
    computeSessionFlags: computeReportedFlags,
    computeReviewReasons: computeReportedReviewReason,
  })
}
