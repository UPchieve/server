import type { ISODateString } from '../types/dates'
import type { Uuid } from '../types/shared'
import type { UserActionAgent } from '../models/UserAction/types'
import type { SessionNotificationPublic } from './notifications'
import type {
  FeedbackPublic,
  PostsessionSurveyResponsePublic,
  SimpleSurveyResponsePublic,
} from './surveys'

export type SessionUserInfoPublic = {
  // TODO: migrate all uses of `_id` to `id`
  _id: Uuid
  id: Uuid
  // TODO: remove `firstname` in favor of `firstName`. The frontend must be refactored first
  firstname: string
  firstName: string
  pastSessions: Uuid[]
}

export type SessionMessagePublic = {
  user: Uuid
  contents: string
  createdAt: ISODateString
}

export type CurrentSessionPublic = {
  _id: Uuid
  id: Uuid
  studentId: Uuid
  volunteerId?: Uuid
  student: SessionUserInfoPublic
  volunteer?: SessionUserInfoPublic
  volunteerJoinedAt?: ISODateString
  messages: SessionMessagePublic[]
  toolType: string
  docEditorVersion?: number
  studentBannedFromLiveMedia?: boolean
  volunteerBannedFromLiveMedia?: boolean
  volunteerLanguages?: string[]
  // TODO: Rename this property, this refers to a topic's name
  type: string
  subTopic: string
  createdAt: ISODateString
  endedAt?: ISODateString
  endedBy?: Uuid
}

export type LatestSessionPublic = {
  id: Uuid
  createdAt: ISODateString
  studentId: Uuid
  volunteerId?: Uuid
  endedByUserId?: Uuid
  timeTutored?: number
  endedAt?: ISODateString
}

export type SessionsToReviewPublic = {
  id: Uuid
  _id: Uuid
  createdAt: ISODateString
  endedAt?: ISODateString
  volunteer?: Uuid
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

export type AdminFilterUserPublic = {
  firstname: string
  isBanned: boolean
  isTestUser: boolean
  totalPastSessions: number
}

export type AdminFilteredSessionsPublic = {
  id: Uuid
  _id: Uuid
  createdAt: ISODateString
  endedAt: ISODateString
  volunteer?: AdminFilterUserPublic
  totalMessages: number
  type: string
  subTopic: string
  student: AdminFilterUserPublic
  studentFirstName: string
  studentRating?: number
  reviewReasons: string[]
}

export type AdminSessionPublic = {
  createdAt: ISODateString
  volunteerjoinedAt?: ISODateString
  endedAt?: ISODateString
  endedBy?: Uuid
  feedbacks?: FeedbackPublic
  surveyResponses: {
    presessionSurvey: SimpleSurveyResponsePublic[]
    studentPostsessionSurvey: PostsessionSurveyResponsePublic[]
    volunteerPostsessionSurvey: PostsessionSurveyResponsePublic[]
  }
  userAgent?: UserActionAgent
  type: string
  subTopic: string
  quillDoc?: string
  _id: Uuid
  id: Uuid
  reviewReasons?: string[]
  reportReason?: string
  reportMessage?: string
  timeTutored: number
  notifications?: SessionNotificationPublic[]
  photos?: string[]
  student: SessionUserInfoPublic
  volunteer?: SessionUserInfoPublic
  messages: SessionMessagePublic[]
  toReview: boolean
  toolType: string
}

export type PublicSessionUserPublic = {
  _id: Uuid
  id: Uuid
  firstName: string
}

export type PublicSessionPublic = {
  _id: Uuid
  id: Uuid
  createdAt: ISODateString
  endedAt: ISODateString
  type: string
  subTopic: string
  subject: string
  student: PublicSessionUserPublic
  volunteer: PublicSessionUserPublic
}

export type SessionForSessionHistoryPublic = {
  id: Uuid
  topic: string
  topicIconLink: string
  subject: string
  createdAt: ISODateString
  timeTutored: number
  isFavorited: boolean
  studentId: Uuid
  studentFirstName: string
  volunteerId: Uuid
  volunteerFirstName: string
}

export type SessionForSessionRecapPublic = {
  id: Uuid
  topic: string
  topicIconLink: string
  subject: string
  subjectKey: string
  createdAt: ISODateString
  endedAt: ISODateString
  timeTutored: number
  isFavorited: boolean
  studentId: Uuid
  studentFirstName: string
  volunteerId: Uuid
  volunteerFirstName: string
  quillDoc?: string
  hasWhiteboardDoc: boolean
  messages?: SessionMessagePublic[]
  feedbackFromStudent?: {
    howMuchDidYourCoachPushYouToDoYourBestWorkToday?: number
    howSupportiveWasYourCoachToday?: number
  }
}

export type SessionSummaryPublic = {
  id: Uuid
  sessionId: Uuid
  summary: string
  userType: string
  traceId?: string
  createdAt: ISODateString
}

export type SessionDetailPublic = {
  id: string
  firstName: string
  lastName: string
  name: string
  messageCount?: string
  volunteerId?: string
  createdAt: ISODateString
  endedAt?: ISODateString
  summary?: SessionSummaryPublic
}

export type CurrentSessionResponse = {
  session: CurrentSessionPublic
  sessionId?: Uuid
  isZwibserveSession?: boolean
  exclusiveVolunteerId?: Uuid | null | undefined
}

export type CheckSessionResponse = {
  sessionId: Uuid
}

// TODO: Normalize this to `CurrentSessionResponse`.
export type CurrentSessionLookupResponse = {
  sessionId: Uuid
  data: CurrentSessionPublic
} | null

export type LatestSessionLookupResponse = {
  sessionId: Uuid
  data: LatestSessionPublic
} | null

export type SessionReviewResponse = {
  sessions: SessionsToReviewPublic[]
  isLastPage: boolean
}

export type SessionPhotoUploadResponse = {
  uploadUrl: string
  imageUrl: string
}

export type ReportMessageResponse = {
  msg: 'Success'
}

export type FilteredSessionsResponse = {
  sessions: AdminFilteredSessionsPublic[]
  isLastPage: boolean
}

export type AdminSessionViewResponse = {
  session: AdminSessionPublic
}

export type PublicSessionResponse = {
  session?: PublicSessionPublic
}

export type SessionNotificationsResponse = {
  notifications: SessionNotificationPublic[]
}

export type SessionHistoryResponse = {
  pastSessions: SessionForSessionHistoryPublic[]
}

export type SessionHistoryTotalResponse = {
  total: number
}

export type SessionRecapEligibilityResponse = {
  isEligible: boolean
}

export type SessionRecapResponse = {
  session: SessionForSessionRecapPublic
  isRecapDmsAvailable: boolean
  summary: string
}

export type SessionDetailResponse = {
  sessionDetails: SessionDetailPublic[]
}

export type StartTranscriptionResponse = {
  transcriptionStarted: boolean
}

export type StartRecordingResponse = {
  recordingId: string
}

export type UnreadDmsResponse = {
  sessionsWithUnreadDMs: Uuid[]
}
