import config from '../config'
import logger from '../logger'
import {
  getTutorBotTranscriptBySessionId,
  getTutorBotConversationById,
  insertTutorBotConversation,
  insertTutorBotConversationMessage,
  getTutorBotTranscriptByConversationId,
} from '../models/TutorBot'
import { Uuid } from '../models/pgUtils'
import * as PromptService from './PromptService'
import { getClient, runInTransaction, TransactionClient } from '../db'
import { client as langfuseClient } from '../clients/langfuse'
import * as SessionRepo from '../models/Session'
import SocketService from './SocketService'
import { BedrockToolChoice, invokeModel } from './AwsBedrockService'
import { COLLEGE_SUBJECTS } from '../constants'
import type {
  TutorBotAddMessageResponsePublic,
  TutorBotGeneratedMessagePublic,
  TutorBotMessagePublic,
  TutorBotTranscriptPublic,
} from '../contracts/tutor-bot'
import {
  AddMessageToConversationPayload,
  TutorBotTranscript,
  TutorBotAiResponse,
  TutorBotGeneratedMessage,
  TutorBotMessage,
} from '../types/tutor-bot'

const NUM_OF_MESSAGES_TO_KEEP_IN_CONTEXT = 15
const LF_TRACE_NAME = 'tutorBotSession'
const LF_GENERATION_NAME = 'tutorBotSessionMessage'
const BED_ROCK_TOOL_NAME = 'print_response'
const BED_ROCK_TOOL = [
  {
    name: BED_ROCK_TOOL_NAME,
    description: 'Prints answer in json format',
    input_schema: {
      type: 'object',
      properties: {
        strategy: {
          type: 'string',
          description: 'The strategy used to assist the student',
        },
        intention: {
          type: 'string',
          description: 'The intention of using the strategy',
        },
        response: {
          type: 'string',
          description: "The response to the student's last message",
        },
      },
      required: ['strategy', 'intention', 'response'],
    },
  },
]

export async function getTranscriptForConversation(
  conversationId: Uuid,
  tc: TransactionClient = getClient()
): Promise<TutorBotTranscript> {
  const transcript = await getTutorBotTranscriptByConversationId(
    conversationId,
    tc
  )
  if (!transcript)
    throw new Error(
      `Unable to find transcript for conversation id: ${conversationId}`
    )
  return transcript
}

export async function getOrCreateConversationBySessionId({
  sessionId,
}: {
  sessionId: Uuid
}) {
  return await runInTransaction(async (tc: TransactionClient) => {
    const transcript = await getTutorBotTranscriptBySessionId(sessionId, tc)
    if (transcript) return transcript

    const session = await SessionRepo.getSessionById(sessionId)
    const subjectId = session.subjectId
    const conversationId = await insertTutorBotConversation(
      {
        subjectId,
        userId: session.studentId, // always create chat under student's user id
        sessionId,
      },
      tc
    )
    return {
      conversationId,
      subjectId,
      sessionId,
      messages: [],
    }
  })
}

export async function addMessageToConversation(
  {
    userId,
    conversationId,
    message,
    senderUserType,
    subjectName,
  }: AddMessageToConversationPayload,
  parentTransaction?: TransactionClient
) {
  const socketService = SocketService.getInstance()
  return await runInTransaction(async (tc: TransactionClient) => {
    const userMessage = await insertTutorBotConversationMessage(
      {
        conversationId,
        userId,
        senderUserType,
        message,
      },
      tc
    )
    const conversation = await getTutorBotConversationById(conversationId, tc)
    if (!conversation) {
      const errorMessage = `Unable to find tutor bot conversation by conversation id: ${conversationId}`
      logger.error({ userId, conversationId }, errorMessage)
      throw new Error(errorMessage)
    }

    const { sessionId } = conversation
    if (sessionId) {
      socketService.emitTutorBotMessage(sessionId, {
        ...userMessage,
        sessionId,
      })
    }

    const botResponse = await getAwsBedRockResponse(
      { userId, conversationId, subjectName },
      tc
    )

    if (sessionId) {
      socketService.emitTutorBotMessage(sessionId, botResponse)
    }

    return {
      userMessage,
      botResponse,
    }
  }, parentTransaction)
}

async function getPromptData(
  subjectName: string,
  transcript: TutorBotTranscript
): Promise<PromptService.PromptResponse> {
  const promptName = Object.values<string>(COLLEGE_SUBJECTS).includes(
    subjectName
  )
    ? PromptService.PromptName.TUTOR_BOT_COLLEGE_COUNSELING_PROMPT
    : PromptService.PromptName.TUTOR_BOT_GENERIC_SUBJECT_PROMPT
  const promptData = await PromptService.getPromptWithFallback(promptName)
  const mostRecentMessages = transcript.messages
    .map(({ senderUserType, message }) => `<|${senderUserType}|>: ${message}`)
    .slice(-NUM_OF_MESSAGES_TO_KEEP_IN_CONTEXT)
    .join('<|end|>\n')

  const cleanedPrompt = interpolate({
    text: promptData.prompt,
    replacements: {
      '{{subject}}': subjectName,
      '{{conversation}}': mostRecentMessages,
    },
  })

  return {
    ...promptData,
    prompt: cleanedPrompt,
  }
}

function interpolate({
  text,
  replacements,
}: {
  text: string
  replacements: Record<string, string>
}) {
  return Object.entries(replacements).reduce((acc, [target, value]) => {
    const reg = new RegExp(target, 'g')
    return acc.replace(reg, value)
  }, text)
}

async function getAwsBedRockResponse(
  {
    userId,
    conversationId,
    subjectName,
  }: {
    userId: Uuid
    conversationId: Uuid
    subjectName: string
  },
  tc: TransactionClient = getClient()
): Promise<TutorBotGeneratedMessage> {
  // Save the latest user message to DB and create the transcript of the conversation so far
  const t = langfuseClient.trace({
    name: LF_TRACE_NAME,
    sessionId: conversationId,
  })
  // NOTE these are ordered by created at ASC
  const transcript = await getTranscriptForConversation(conversationId, tc)
  const promptData = await getPromptData(subjectName, transcript)
  const gen = t.generation({
    name: LF_GENERATION_NAME,
    metadata: { model: config.awsBedrockSonnet4Id },
    input: promptData.prompt,
  })

  let botResponse: TutorBotAiResponse | string

  try {
    botResponse = await invokeModel({
      modelId: config.awsBedrockSonnet4Id,
      text: '',
      prompt: promptData.prompt,
      tools_option: {
        tool_choice: { type: BedrockToolChoice.TOOL, name: BED_ROCK_TOOL_NAME },
        tools: BED_ROCK_TOOL,
      },
    })
  } catch (err) {
    // We could add a retry if we see this happening a fair amount
    botResponse = AWS_BEDROCK_TUTOR_ANSWER_FALLBACK
    logger.error(
      {
        messagePrompt: promptData,
        traceName: LF_TRACE_NAME,
        err,
      },
      'AI tutor: Unprocessable response from aws bedrock'
    )
  }

  const message =
    typeof botResponse === 'string'
      ? botResponse
      : (botResponse?.response ?? AWS_BEDROCK_TUTOR_ANSWER_FALLBACK)
  const savedBotMessage = await insertTutorBotConversationMessage(
    {
      conversationId,
      userId,
      message,
      senderUserType: 'bot',
    },
    tc
  )

  gen.end({
    output: { botResponse: botResponse, responseDbo: savedBotMessage },
  })

  return {
    senderUserType: 'bot',
    message,
    createdAt: savedBotMessage.createdAt,
    tutorBotConversationId: conversationId,
    userId,
    status: (botResponse as TutorBotAiResponse)?.intention
      ? (botResponse as TutorBotAiResponse).intention
      : '1. Get the student to elaborate their answer',
    traceId: gen.traceId,
    observationId: gen.observationId,
  }
}

const AWS_BEDROCK_TUTOR_ANSWER_FALLBACK = `
Hi there! I noticed you seem to be trying to communicate, but the messages aren't clear.
Could you tell me more about what your problem?`

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
