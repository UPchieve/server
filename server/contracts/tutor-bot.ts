import type { Uuid } from '../types/shared'
import { TutorBotHumanSenderType, TutorBotSenderType } from '../types/tutor-bot'

export type MessagePayload = {
  userId: string
  conversationId: string
  message: string
  senderUserType: TutorBotHumanSenderType
  subjectName: string
}

export type ConversationPayload = {
  userId: string
  message: string
  senderUserType: TutorBotHumanSenderType
  subjectId: number
  sessionId?: string
}

export type TutorBotMessagePublic = {
  tutorBotConversationId: Uuid
  userId: Uuid
  senderUserType: TutorBotSenderType
  message: string
  createdAt: string
}

export type TutorBotTranscriptPublic = {
  conversationId: Uuid
  subjectId: number
  sessionId?: Uuid
  messages: TutorBotMessagePublic[]
}

export type TutorBotGeneratedMessagePublic = TutorBotMessagePublic & {
  traceId: string
  observationId: string | null
  status: string
}

export type TutorBotAddMessageResponsePublic = {
  userMessage: TutorBotMessagePublic
  botResponse: TutorBotGeneratedMessagePublic
}

export type TutorBotNewConversationPublic = {
  conversationId: Uuid
  userId: Uuid
  sessionId?: Uuid
  subjectId: number
  messages: [TutorBotMessagePublic, TutorBotGeneratedMessagePublic]
}
