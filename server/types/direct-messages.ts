import type { Ulid, Uuid } from './shared'

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
