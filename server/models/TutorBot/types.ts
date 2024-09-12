import { tutor_bot_conversation_user_type } from './pg.queries'
import { Uuid } from '../pgUtils'

export type InsertTutorBotConversationPayload = {
  userId: string
  subjectId: number
  sessionId: string | null
  id: Uuid
}

export type InsertTutorBotConversationMessagePayload = {
  conversationId: string
  userId: string
  senderUserType: tutor_bot_conversation_user_type
  message: string
}
