import type { ISODateString } from '../types/dates'
import type { Uuid } from '../types/shared'

export type GetOrCreateConversationResponse = {
  conversationId: Uuid
}

export type DirectMessagePublic = {
  id: Uuid
  conversationId: Uuid
  senderId: Uuid
  contents: string
  createdAt: ISODateString
}

export type DirectMessagesResponse = {
  messages: DirectMessagePublic[]
}

export type UnreadDirectMessagesResponse = {
  senderIds: Uuid[]
}

export type SendDirectMessagePayload = {
  conversationId: Uuid
  contents: string
  clientMessageId?: string
}

export type NewDirectMessageEvent = DirectMessagePublic & {
  clientMessageId?: string
}

export type DirectMessageErrorEvent = {
  conversationId?: Uuid
  clientMessageId?: string
  code?: 'MODERATION_BLOCKED' | 'MODERATION_UNAVAILABLE'
  message?: string
  reasons?: string[]
}
