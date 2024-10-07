import { tutor_bot_conversation_user_type } from './pg.queries'
import { Ulid, Uuid } from '../pgUtils'

export type InsertTutorBotConversationPayload = {
  userId: Ulid
  subjectId: number
  sessionId: Ulid | undefined
  id: Uuid
}

export type InsertTutorBotConversationMessagePayload = {
  conversationId: Ulid
  userId: Ulid
  senderUserType: tutor_bot_conversation_user_type
  message: string
}
