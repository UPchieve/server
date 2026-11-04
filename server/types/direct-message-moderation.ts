import type { Uuid } from './shared'

export type DirectMessageModerationSource = 'regex' | 'ai'

export type DirectMessageModerationResult = {
  blocked: boolean
  reasons: string[]
  censoredBy?: DirectMessageModerationSource
  unavailable?: boolean
}

export type DirectMessageModerationContext = {
  conversationId: Uuid
  studentId: Uuid
  volunteerId: Uuid
  senderId: Uuid
  message: string
}
