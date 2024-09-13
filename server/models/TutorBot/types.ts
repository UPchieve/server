import { Ulid } from '../pgUtils'
import { tutor_bot_conversation_user_type } from './pg.queries'

export type InsertTutorBotConversationMessagePayload = {
  conversationId: Ulid
  userId: Ulid
  senderUserType: tutor_bot_conversation_user_type
  message: string
}
