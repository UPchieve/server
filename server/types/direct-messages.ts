import type { Ulid, Uuid } from './shared'
import type { ModerationSystem } from './moderation'

export type DirectMessageConversation = {
  id: Uuid
  studentId: Uuid
  volunteerId: Uuid
  studentLastSeen?: Date
  volunteerLastSeen?: Date
  createdAt: Date
}

export type DirectMessage = {
  id: Ulid
  conversationId: Ulid
  senderId: Ulid
  contents: string
  createdAt: Date
}

export type DirectMessageModerationResult = {
  blocked: boolean
  reasons: string[]
  censoredBy?: ModerationSystem
  unavailable?: boolean
}

export type DirectMessageModerationContext = {
  conversationId: Uuid
  studentId: Uuid
  volunteerId: Uuid
  senderId: Uuid
  message: string
}

export type DirectMessageReport = {
  id: Uuid
  conversationId: Uuid
  reportingUserId: Uuid
  reportedUserId: Uuid
  reportReason: string
  reportMessage?: string
  studentId: Uuid
  volunteerId: Uuid
}
