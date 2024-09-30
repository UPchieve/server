import axios from 'axios'
import config from '../config'
import logger from '../logger'
import { tutor_bot_conversation_user_type } from '../models/TutorBot/pg.queries'
import {
  getTutorBotConversationMessagesById,
  getTutorBotConversationMessagesBySessionId,
  getTutorBotConversationsByUserId,
  insertTutorBotConversation,
  insertTutorBotConversationMessage,
} from '../models/TutorBot'
import { getDbUlid, Ulid } from '../models/pgUtils'
import * as LangfuseService from './LangfuseService'
import { getClient, runInTransaction, TransactionClient } from '../db'
import * as SessionRepo from '../models/Session'
import { getSubjectNameIdMapping } from '../models/Subjects/queries'

const LF_TRACE_NAME = 'tutorBotSession'
const LF_GENERATION_NAME = 'tutorBotSessionMessage'

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

export const getOrCreateConversationBySessionId = async (
  {
    sessionId,
    userId,
  }: {
    sessionId: Ulid
    userId: Ulid
  },
  tc: TransactionClient = getClient()
) => {
  const results = await getTutorBotConversationMessagesBySessionId(
    sessionId,
    tc
  )
  if (results) {
    return results
  } else {
    const session = await SessionRepo.getSessionById(sessionId)
    const subjects = await getSubjectNameIdMapping()
    const subjectId = subjects[session.subject]
    const conversationId = await insertTutorBotConversation(
      {
        subjectId,
        userId,
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
}

export const createTutorBotConversation = async (data: {
  userId: string
  sessionId: string | null
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

    const { userMessage, botResponse } = await addMessageToConversation(
      {
        conversationId,
        userId,
        senderUserType: data.senderUserType,
        message: data.message,
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

export const getAllConversationsForUser = async (userId: string) => {
  return await getTutorBotConversationsByUserId(userId)
}

const getBotResponseMessage = (
  conversation: string
): { assistant: string; system: string } => {
  const messages = conversation.split('<|end|>')
  const lastMessage = messages[messages.length - 1]
  const { system, assistant } = extractSystem(lastMessage)
  return {
    assistant: removeTurnMarkers(assistant),
    system,
  }
}

export type BotResponse = {
  message: string
  status: string
  traceId: string
  observationId: string | null
}

export const addMessageToConversation = async (
  {
    userId,
    conversationId,
    message,
    senderUserType,
  }: {
    userId: string
    conversationId: string
    message: string
    senderUserType: tutor_bot_conversation_user_type
  },
  parentTransaction?: TransactionClient
) => {
  return await runInTransaction(async (tx: TransactionClient) => {
    const tc = parentTransaction ?? tx
    const userMessage = await insertTutorBotConversationMessage(
      {
        conversationId,
        userId,
        senderUserType,
        message,
      },
      tc
    )

    const botResponse = await getBotResponse({ userId, conversationId }, tc)

    return {
      userMessage,
      botResponse,
    }
  })
}

const getBotResponse = async (
  {
    userId,
    conversationId,
  }: {
    userId: string
    conversationId: string
  },
  tc: TransactionClient = getClient()
): Promise<TutorBotConversationMessage & {
  traceId: string
  obeservationId: string | null
  status: string
}> => {
  // Save the latest user message to DB and create the transcript of the conversation so far
  const t = LangfuseService.getClient().trace({
    name: LF_TRACE_NAME,
    sessionId: conversationId,
  })
  const transcript = await getTranscriptForConversation(conversationId, tc)
  const prompt = createPromptFromTranscript(transcript)
  const gen = t.generation({
    name: LF_GENERATION_NAME,
    model: 'phi3-upchieve-tutormodel',
  })
  const completion = await createChatCompletion(prompt, conversationId)
  const { assistant: botMessage, system } = getBotResponseMessage(completion)
  // Save bot response to conversation messages and append to the existing transcript
  const savedBotMessage = await insertTutorBotConversationMessage(
    {
      conversationId,
      userId,
      message: botMessage,
      senderUserType: 'bot',
    },
    tc
  )
  gen.end({
    output: botMessage,
    input: { prompt, ...savedBotMessage },
  })

  return {
    senderUserType: 'bot',
    message: botMessage,
    createdAt: savedBotMessage.createdAt,
    tutorBotConversationId: conversationId,
    userId,
    status: system.substring(
      system.indexOf('[[') + 2,
      system.lastIndexOf(']]')
    ),
    traceId: gen.traceId,
    obeservationId: gen.observationId,
  }
}

/**
 * Returns text generated by the Tutor Bot for the given prompt
 */
const createChatCompletion = async (
  prompt: string,
  conversationId: string
): Promise<string> => {
  try {
    const res = await axios.post(
      config.tutorBotBaseUrl,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.tutorBotApiKey}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    )
    return res.data[0].generated_text
  } catch (err) {
    logger.error(
      {
        conversationId,
        error: err,
      },
      'Failed to get Tutor Bot response'
    )
    throw new Error('Could not get Tutor Bot response')
  }
}

const byteSize = (str: string) => new Blob([str]).size

const createPromptFromTranscript = (
  transcript: TutorBotConversationTranscript
): string => {
  let prompt = ''
  transcript.messages.forEach(m => {
    const senderTag = m.senderUserType === 'bot' ? '<|assistant|>' : '<|user|>'

    prompt += `${senderTag}\n${m.message}<|end|>${
      senderTag === '<|user|>' ? '<|system|>' : ''
    }\n`
  })

  // start removing the earlier messages
  if (byteSize(prompt) > 1024) {
    while (byteSize(prompt) > 1024) {
      prompt = prompt
        .split('<|end|>\n')
        .slice(1)
        .join('<|end|>\n')
    }
  }
  return prompt
}

const systemRegex = /^(<\|system\|>)\n.*(\[\[([A-Z]+)\]\])/gm

const extractSystem = (text: string): { assistant: string; system: string } => {
  const [system] = text.match(systemRegex) ?? ['']
  return {
    system,
    assistant: system ? text.replace(`${system} `, '') : text,
  }
}
/**
 * Removes chat turn markers from the string.
 * See https://huggingface.co/microsoft/Phi-3-medium-4k-instruct#chat-format
 */
const removeTurnMarkers = (text: string): string => {
  return text.replace(/<\|user\|>|<\|assistant\|>|<\|end\|>/g, '').trim()
}
