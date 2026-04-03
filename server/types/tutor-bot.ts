import type { Uuid } from './shared'

export type TutorBotSenderType = 'student' | 'volunteer' | 'bot'
export type TutorBotHumanSenderType = Exclude<TutorBotSenderType, 'bot'>

export type TutorBotMessage = {
  tutorBotConversationId: Uuid
  userId: Uuid
  senderUserType: TutorBotSenderType
  message: string
  createdAt: Date
}

export type TutorBotTranscript = {
  conversationId: Uuid
  subjectId: number
  messages: TutorBotMessage[]
  sessionId?: Uuid
}

export type TutorBotConversation = {
  id: Uuid
  userId: Uuid
  sessionId?: Uuid
  subjectId: number
  createdAt: Date
}

export type TutorBotAiResponse = {
  strategy: string
  intention: string
  response: string
}

export type AddMessageToConversationPayload = {
  userId: Uuid
  conversationId: Uuid
  message: string
  senderUserType: TutorBotSenderType
  subjectName: string
  snapshotBuffer?: Buffer
}

export type TutorBotGeneratedMessage = TutorBotMessage & {
  traceId: string
  observationId: string | null
  status: string
}

export type InsertTutorBotConversationPayload = {
  userId: Uuid
  subjectId: number
  sessionId?: Uuid
}

export type InsertTutorBotConversationMessagePayload = {
  conversationId: Uuid
  userId: Uuid
  senderUserType: TutorBotSenderType
  message: string
}
