import type {
  TutorBotMessagePublic,
  TutorBotTranscriptPublic,
  TutorBotGeneratedMessagePublic,
  TutorBotAddMessageResponsePublic,
  TutorBotNewConversationPublic,
} from '../contracts/tutor-bot'
import type {
  TutorBotMessage,
  TutorBotTranscript,
  TutorBotGeneratedMessage,
  TutorBotNewConversation,
} from '../types/tutor-bot'

export function toTutorBotMessagePublic(
  data: TutorBotMessage
): TutorBotMessagePublic {
  return {
    tutorBotConversationId: data.tutorBotConversationId,
    userId: data.userId,
    senderUserType: data.senderUserType,
    message: data.message,
    createdAt: data.createdAt.toISOString(),
  }
}

export function toTutorBotTranscriptPublic(
  data: TutorBotTranscript
): TutorBotTranscriptPublic {
  return {
    conversationId: data.conversationId,
    subjectId: data.subjectId,
    sessionId: data.sessionId,
    messages: data.messages.map(toTutorBotMessagePublic),
  }
}

export function toTutorBotGeneratedMessagePublic(
  data: TutorBotGeneratedMessage
): TutorBotGeneratedMessagePublic {
  return {
    ...toTutorBotMessagePublic(data),
    traceId: data.traceId,
    observationId: data.observationId,
    status: data.status,
  }
}

export function toTutorBotAddMessageResponsePublic(data: {
  userMessage: TutorBotMessage
  botResponse: TutorBotGeneratedMessage
}): TutorBotAddMessageResponsePublic {
  return {
    userMessage: toTutorBotMessagePublic(data.userMessage),
    botResponse: toTutorBotGeneratedMessagePublic(data.botResponse),
  }
}

export function toNewConversationPublic(
  conversation: TutorBotNewConversation
): TutorBotNewConversationPublic {
  const [userMessage, botResponse] = conversation.messages
  return {
    conversationId: conversation.conversationId,
    userId: conversation.userId,
    sessionId: conversation.sessionId,
    subjectId: conversation.subjectId,
    messages: [
      toTutorBotMessagePublic(userMessage),
      toTutorBotGeneratedMessagePublic(botResponse),
    ],
  }
}
