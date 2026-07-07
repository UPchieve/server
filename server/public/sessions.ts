import type {
  AdminFilteredSessionsPublic,
  AdminFilterUserPublic,
  CurrentSessionPublic,
  LatestSessionPublic,
  SessionMessagePublic,
  SessionUserInfoPublic,
  SessionsToReviewPublic,
  AdminSessionPublic,
  PublicSessionPublic,
  PublicSessionUserPublic,
  SessionForSessionHistoryPublic,
  SessionForSessionRecapPublic,
  SessionDetailPublic,
  SessionSummaryPublic,
} from '../contracts/sessions'
import type {
  LatestSession,
  SessionsToReview,
  AdminFilterUser,
  AdminFilteredSessions,
  SessionByIdWithStudentAndVolunteer,
  PublicSession,
  PublicSessionUser,
  SessionForSessionHistory,
  SessionForSessionRecap,
} from '../models/Session'
import { SessionSummary } from '../models/SessionSummaries'
import type {
  CurrentSession,
  MessageForFrontend,
  CurrentSessionUser,
  SessionDetail,
} from '../types/session'
import { toSessionNotificationPublic } from './notifications'
import {
  toFeedbackPublic,
  toPostsessionSurveyResponsePublic,
  toSimpleSurveyResponsePublic,
} from './surveys'
import { toUserAgentPublic } from './user-agent'

function toSessionUserInfoPublic(
  data: CurrentSessionUser
): SessionUserInfoPublic {
  return {
    _id: data.id,
    id: data.id,
    firstname: data.firstName,
    firstName: data.firstName,
    pastSessions: data.pastSessions,
  }
}

function toSessionMessagePublic(
  message: MessageForFrontend
): SessionMessagePublic {
  return {
    user: message.user,
    contents: message.contents,
    createdAt: message.createdAt.toISOString(),
  }
}

export function toCurrentSessionPublic(
  session: CurrentSession
): CurrentSessionPublic {
  return {
    _id: session.id,
    id: session.id,
    studentId: session.studentId,
    volunteerId: session.volunteerId,
    student: toSessionUserInfoPublic(session.student),
    volunteer: session.volunteer
      ? toSessionUserInfoPublic(session.volunteer)
      : undefined,
    volunteerJoinedAt: session.volunteerJoinedAt?.toISOString(),
    messages: session.messages.map(toSessionMessagePublic),
    toolType: session.toolType,
    docEditorVersion: session.docEditorVersion,
    studentBannedFromLiveMedia: session.studentBannedFromLiveMedia,
    volunteerBannedFromLiveMedia: session.volunteerBannedFromLiveMedia,
    volunteerLanguages: session.volunteerLanguages,
    type: session.type,
    subTopic: session.subTopic,
    createdAt: session.createdAt.toISOString(),
    endedAt: session.endedAt?.toISOString(),
    endedBy: session.endedBy,
  }
}

export function toLatestSessionPublic(
  session: LatestSession
): LatestSessionPublic {
  return {
    id: session.id,
    createdAt: session.createdAt.toISOString(),
    studentId: session.studentId,
    volunteerId: session.volunteerId,
    endedByUserId: session.endedByUserId,
    timeTutored: session.timeTutored,
    endedAt: session.endedAt?.toISOString(),
  }
}

export function toSessionsToReviewPublic(
  session: SessionsToReview
): SessionsToReviewPublic {
  return {
    id: session.id,
    _id: session.id,
    createdAt: session.createdAt.toISOString(),
    endedAt: session.endedAt?.toISOString(),
    volunteer: session.volunteer,
    volunteerFirstName: session.volunteerFirstName,
    totalMessages: session.totalMessages,
    type: session.type,
    subTopic: session.subTopic,
    studentFirstName: session.studentFirstName,
    isReported: session.isReported,
    flags: session.flags,
    reviewReasons: session.reviewReasons,
    toReview: session.toReview,
    studentRating: session.studentRating,
  }
}

function toAdminFilterUserPublic(
  session: AdminFilterUser
): AdminFilterUserPublic {
  return {
    firstname: session.firstname,
    isBanned: session.isBanned,
    isTestUser: session.isTestUser,
    totalPastSessions: session.totalPastSessions,
  }
}

export function toAdminFilterSessionPublic(
  session: AdminFilteredSessions
): AdminFilteredSessionsPublic {
  return {
    id: session.id,
    _id: session._id,
    createdAt: session.createdAt.toISOString(),
    endedAt: session.endedAt.toISOString(),
    volunteer: session.volunteer
      ? toAdminFilterUserPublic(session.volunteer)
      : undefined,
    totalMessages: session.totalMessages,
    type: session.type,
    subTopic: session.subTopic,
    student: toAdminFilterUserPublic(session.student),
    studentFirstName: session.studentFirstName,
    studentRating: session.studentRating,
    reviewReasons: session.reviewReasons,
  }
}

export function toAdminSessionPublic(
  session: SessionByIdWithStudentAndVolunteer
): AdminSessionPublic {
  return {
    createdAt: session.createdAt.toISOString(),
    volunteerjoinedAt: session.volunteerjoinedAt?.toISOString(),
    endedAt: session.endedAt?.toISOString(),
    endedBy: session.endedBy,
    feedbacks: session.feedbacks
      ? toFeedbackPublic(session.feedbacks)
      : undefined,
    surveyResponses: {
      presessionSurvey: session.surveyResponses.presessionSurvey.map(
        toSimpleSurveyResponsePublic
      ),
      studentPostsessionSurvey:
        session.surveyResponses.studentPostsessionSurvey.map(
          toPostsessionSurveyResponsePublic
        ),
      volunteerPostsessionSurvey:
        session.surveyResponses.volunteerPostsessionSurvey.map(
          toPostsessionSurveyResponsePublic
        ),
    },
    userAgent: session.userAgent
      ? toUserAgentPublic(session.userAgent)
      : undefined,
    type: session.type,
    subTopic: session.subTopic,
    quillDoc: session.quillDoc,
    _id: session._id,
    id: session.id,
    reviewReasons: session.reviewReasons,
    reportReason: session.reportReason,
    reportMessage: session.reportMessage,
    timeTutored: session.timeTutored,
    notifications: session.notifications?.map(toSessionNotificationPublic),
    photos: session.photos,
    student: toSessionUserInfoPublic(session.student),
    volunteer: session.volunteer
      ? toSessionUserInfoPublic(session.volunteer)
      : undefined,
    messages: session.messages.map(toSessionMessagePublic),
    toReview: session.toReview,
    toolType: session.toolType,
  }
}

function toPublicSessionUserPublic(
  user: PublicSessionUser
): PublicSessionUserPublic {
  return {
    _id: user._id,
    id: user._id,
    firstName: user.firstName,
  }
}

export function toPublicSessionPublic(
  session: PublicSession
): PublicSessionPublic {
  return {
    _id: session._id,
    id: session._id,
    createdAt: session.createdAt.toISOString(),
    endedAt: session.endedAt.toISOString(),
    type: session.type,
    subTopic: session.subTopic,
    subject: session.subTopic,
    student: toPublicSessionUserPublic(session.student),
    volunteer: toPublicSessionUserPublic(session.volunteer),
  }
}

export function toSessionForSessionHistoryPublic(
  session: SessionForSessionHistory
): SessionForSessionHistoryPublic {
  return {
    id: session.id,
    topic: session.topic,
    topicIconLink: session.topicIconLink,
    subject: session.subject,
    createdAt: session.createdAt.toISOString(),
    timeTutored: session.timeTutored,
    isFavorited: session.isFavorited,
    studentId: session.studentId,
    studentFirstName: session.studentFirstName,
    volunteerId: session.volunteerId,
    volunteerFirstName: session.volunteerFirstName,
  }
}

export function toSessionForRecapSessionPublic(
  session: SessionForSessionRecap
): SessionForSessionRecapPublic {
  return {
    id: session.id,
    topic: session.topic,
    topicIconLink: session.topicIconLink,
    subject: session.subject,
    subjectKey: session.subjectKey,
    createdAt: session.createdAt.toISOString(),
    endedAt: session.endedAt.toISOString(),
    timeTutored: session.timeTutored,
    isFavorited: session.isFavorited,
    studentId: session.studentId,
    studentFirstName: session.studentFirstName,
    volunteerId: session.volunteerId,
    volunteerFirstName: session.volunteerFirstName,
    quillDoc: session.quillDoc ?? undefined,
    hasWhiteboardDoc: session.hasWhiteboardDoc,
    messages: session.messages
      ? session.messages.map(toSessionMessagePublic)
      : [],
    feedbackFromStudent: session.feedbackFromStudent
      ? {
          howMuchDidYourCoachPushYouToDoYourBestWorkToday:
            session.feedbackFromStudent
              .howMuchDidYourCoachPushYouToDoYourBestWorkToday ?? undefined,
          howSupportiveWasYourCoachToday:
            session.feedbackFromStudent.howSupportiveWasYourCoachToday ??
            undefined,
        }
      : undefined,
  }
}

export function toSessionSummaryPublic(
  summary: SessionSummary
): SessionSummaryPublic {
  return {
    id: summary.id,
    sessionId: summary.sessionId,
    summary: summary.summary,
    userType: summary.userType,
    traceId: summary?.traceId,
    createdAt: summary.createdAt.toISOString(),
  }
}

export function toSessionDetailPublic(
  session: SessionDetail & { summary?: SessionSummary }
): SessionDetailPublic {
  return {
    id: session.id,
    firstName: session.firstName,
    lastName: session.lastName,
    name: session.name,
    messageCount: session?.messageCount,
    volunteerId: session?.volunteerId,
    createdAt: session.createdAt.toISOString(),
    endedAt: session.endedAt?.toISOString(),
    summary: session.summary
      ? toSessionSummaryPublic(session.summary)
      : undefined,
  }
}
