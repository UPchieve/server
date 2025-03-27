import { Ulid, Uuid } from '../pgUtils'
import { USER_ROLES_TYPE } from '../../constants'

export type Session = {
  id: Ulid
  studentId: Ulid
  volunteerId?: Ulid
  topic: string
  subjectId: number
  subject: string
  hasWhiteboardDoc: boolean
  quillDoc?: string
  photos?: string[]
  volunteerJoinedAt?: Date
  endedAt?: Date
  endedByRole?: string
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
  subject: string
  topic?: string
  sessionId?: Ulid
}

export type FallIncentiveSession = {
  id: Ulid
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

export type MessageType = 'chat' | 'voice_message' | 'transcription'
export type SessionTranscriptItem = {
  messageId: string
  userId: string
  createdAt: Date
  message: string
  messageType: MessageType
  role: USER_ROLES_TYPE
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
