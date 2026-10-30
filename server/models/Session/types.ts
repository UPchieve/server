import { Uuid } from '../../types/shared'
import { USER_ROLES_TYPE } from '../../constants'
import { SessionEditorActivity } from '../SessionEditorActivity/types'
import { MessageForFrontend } from '../../types/session'

export type Session = {
  id: Uuid
  studentId: Uuid
  volunteerId?: Uuid
  subjectId: number
  hasWhiteboardDoc: boolean
  quillDoc?: string
  volunteerJoinedAt?: Date
  endedAt?: Date
  reviewed: boolean
  toReview: boolean
  studentBanned?: boolean
  timeTutored: number
  shadowbanned?: boolean
  requestedVolunteerId?: Uuid
  openedToAllAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type VolunteerLastSessionEndedAt = {
  volunteerId: Uuid
  endedAt: Date
}

export type VolunteerSessionCount = {
  volunteerId: Uuid
  sessionCount: number
}

export type GetSessionByIdResult = {
  id: Uuid
  studentId: Uuid
  volunteerId?: Uuid
  topic: string
  subjectId: number
  subject: string
  hasWhiteboardDoc: boolean
  quillDoc?: string
  volunteerJoinedAt?: Date
  endedAt?: Date
  endedByUserId?: Uuid
  reviewed: boolean
  toReview: boolean
  shadowbanned?: boolean
  timeTutored: number
  createdAt: Date
  updatedAt: Date
  reported: boolean
  flags: string[]
  subjectDisplayName: string
  toolType: string
  requestedVolunteerId?: Uuid
  openedToAllAt?: Date
}

export type UserSessionStat = {
  totalRequested: number
  totalHelped: number
  topicName: string
}

export type UserSessionStats = {
  [subjectName: string]: UserSessionStat
}

export type UserSessionsFilter = {
  start?: Date
  end?: Date
  subject?: string
  topic?: string
  sessionId?: Uuid
}

export type FallIncentiveSession = {
  id: Uuid
  timeTutored: number
  flags: string[]
  reported: boolean
  totalMessages: number
  createdAt: Date
}

export type SessionMessage = {
  id: string
  senderId: string
  contents: string
  sessionId: string
  createdAt: Date
  updatedAt: Date
}

export type VoiceMessage = {
  id: string
  senderId: string
  sessionId: string
  createdAt: Date
  updatedAt: Date
  transcript: string
}

export type MessageType =
  | 'session_chat'
  | 'voice_message'
  | 'transcription'
  | 'direct_message'
export type SessionTranscriptItem = {
  messageId: string
  userId: string
  createdAt: Date
  message: string
  messageType: MessageType
  role: USER_ROLES_TYPE
}
export type ExtractedTextItem = {
  messageType: 'whiteboard_text'
  message: string
  role: 'unknown'
}

export type SessionTranscript = {
  sessionId: string
  messages: SessionTranscriptItem[]
}

export type SessionMetrics = {
  sessionId: Uuid
  absentStudent: boolean
  absentVolunteer: boolean
  lowSessionRatingFromCoach: boolean
  lowSessionRatingFromStudent: boolean
  lowCoachRatingFromStudent: boolean
  reported: boolean
  onlyLookingForAnswers: boolean
  rudeOrInappropriate: boolean
  commentFromStudent: boolean
  commentFromVolunteer: boolean
  hasBeenUnmatched: boolean
  hasHadTechnicalIssues: boolean
  personalIdentifyingInfo: boolean
  gradedAssignment: boolean
  coachUncomfortable: boolean
  studentCrisis: boolean
  createdAt: Date
}

export type SessionActivity =
  | MessageForFrontend
  | (SessionEditorActivity & {
      user: SessionEditorActivity['userId']
    })
