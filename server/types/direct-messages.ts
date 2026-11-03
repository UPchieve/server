import type { Uuid } from './shared'

export type DirectMessageConversation = {
  id: Uuid
  studentId: Uuid
  volunteerId: Uuid
  studentLastSeen?: Date
  volunteerLastSeen?: Date
  createdAt: Date
}
