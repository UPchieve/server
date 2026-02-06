import config from '../config'
import logger from '../logger'
import { tutor_bot_conversation_user_type } from '../models/TutorBot/pg.queries'
import {
  getTutorBotConversationMessagesById,
  getTutorBotConversationMessagesBySessionId,
  getTutorBotConversationsByUserId,
  getTutorBotConversationById,
  insertTutorBotConversation,
  insertTutorBotConversationMessage,
  updateTutorBotConversationSessionIdByConversationId,
} from '../models/TutorBot'
import { getDbUlid, Ulid } from '../models/pgUtils'
import * as PromptService from './PromptService'
import { getClient, runInTransaction, TransactionClient } from '../db'
import { client as langfuseClient } from '../clients/langfuse'
import * as SessionRepo from '../models/Session'
import SocketService from './SocketService'
import { BedrockToolChoice, invokeModel } from './AwsBedrockService'
import { getSubjectNameIdMapping } from '../models/Subjects'
import { COLLEGE_SUBJECTS } from '../constants'

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

type TutorBotModelResponse = {
  strategy: string
  intention: string
  response: string
}

interface TutorBotConversationMessage {
  tutorBotConversationId: string
  userId: string
  senderUserType: tutor_bot_conversation_user_type
  message: string
  createdAt: Date
}

interface TutorBotConversationTranscript {
  conversationId: string
  subjectId: number
  messages: TutorBotConversationMessage[]
  sessionId?: string
}

export const getTranscriptForConversation = async (
  conversationId: string,
  tc: TransactionClient = getClient()
): Promise<TutorBotConversationTranscript> => {
  const results = await getTutorBotConversationMessagesById(conversationId, tc)
  return {
    conversationId,
    subjectId: results.subjectId,
    sessionId: results.sessionId,
    messages: results.messages,
  }
}

export const getOrCreateConversationBySessionId = async ({
  sessionId,
}: {
  sessionId: Ulid
}) => {
  return await runInTransaction(async (tc: TransactionClient) => {
    const results = await getTutorBotConversationMessagesBySessionId(
      sessionId,
      tc
    )
    if (results) {
      return results
    } else {
      const session = await SessionRepo.getSessionById(sessionId)
      const subjectId = session.subjectId
      const conversationId = await insertTutorBotConversation(
        {
          subjectId,
          userId: session.studentId, // always create chat under student's user id
          sessionId,
          id: getDbUlid(),
        },
        tc
      )
      return {
        conversationId,
        subjectId,
        sessionId,
        messages: [],
      }
    }
  })
}

export const createTutorBotConversation = async (data: {
  userId: string
  sessionId?: string
  message: string
  senderUserType: 'student' | 'volunteer'
  subjectId: number
}) => {
  const userId = data.userId
  const sessionId = data.sessionId
  const subjectId = data.subjectId

  return await runInTransaction(async (tc: TransactionClient) => {
    const conversationId = await insertTutorBotConversation(
      {
        subjectId,
        userId,
        sessionId,
        id: getDbUlid(),
      },
      tc
    )

    const subjectNameIds = await getSubjectNameIdMapping()
    const [subjectName] =
      Object.entries(subjectNameIds).find(
        ([_key, value]) => value === subjectId
      ) ?? []

    if (!subjectName) {
      throw new Error(`AI tutor: No subject found for id ${subjectId}`)
    }

    const { userMessage, botResponse } = await addMessageToConversation(
      {
        conversationId,
        userId,
        senderUserType: data.senderUserType,
        message: data.message,
        subjectName,
      },
      tc
    )

    return {
      conversationId,
      userId,
      sessionId,
      subjectId,
      messages: [userMessage, botResponse],
    }
  })
}

export const updateTutorBotConversationSessionId = async (
  conversationId: string,
  sessionId: string
) => {
  await updateTutorBotConversationSessionIdByConversationId({
    conversationId,
    sessionId,
  })
}

export const getAllConversationsForUser = async (userId: string) => {
  return await getTutorBotConversationsByUserId(userId)
}

export const addMessageToConversation = async (
  {
    userId,
    conversationId,
    message,
    senderUserType,
    subjectName,
  }: {
    userId: string
    conversationId: string
    message: string
    senderUserType: tutor_bot_conversation_user_type
    subjectName: string
  },
  parentTransaction?: TransactionClient
) => {
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
    const { sessionId } = await getTutorBotConversationById(conversationId, tc)
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
  transcript: TutorBotConversationTranscript
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

const getAwsBedRockResponse = async (
  {
    userId,
    conversationId,
    subjectName,
  }: {
    userId: string
    conversationId: string
    subjectName: string
  },
  tc: TransactionClient = getClient()
): Promise<
  | (TutorBotConversationMessage & {
      traceId: string
      observationId: string | null
      status: string
    })
  | null
> => {
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

  let savedBotMessage: TutorBotConversationMessage | null = null
  let botResponse: TutorBotModelResponse | string | null = null

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
    logger.error(err)
    botResponse = AWS_BEDROCK_TUTOR_ANSWER_FALLBACK
    logger.error('AI tutor: Unprocessbable response from aws bedrock', {
      messagePrompt: promptData,
      traceName: LF_TRACE_NAME,
    })
  } finally {
    const message =
      typeof botResponse === 'string'
        ? botResponse
        : (botResponse?.response ?? AWS_BEDROCK_TUTOR_ANSWER_FALLBACK)
    savedBotMessage = await insertTutorBotConversationMessage(
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
  }

  const message =
    typeof botResponse === 'string'
      ? botResponse
      : (botResponse?.response ?? AWS_BEDROCK_TUTOR_ANSWER_FALLBACK)

  return {
    senderUserType: 'bot',
    message,
    createdAt: savedBotMessage.createdAt,
    tutorBotConversationId: conversationId,
    userId,
    status: (botResponse as TutorBotModelResponse)?.intention
      ? (botResponse as TutorBotModelResponse).intention
      : '1. Get the student to elaborate their answer',
    traceId: gen.traceId,
    observationId: gen.observationId,
  }
}

const AWS_BEDROCK_TUTOR_ANSWER_FALLBACK = `
Hi there! I noticed you seem to be trying to communicate, but the messages aren't clear.
Could you tell me more about what your problem?`
