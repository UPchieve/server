import axios from 'axios'
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
import * as LangfuseService from './LangfuseService'
import { getClient, runInTransaction, TransactionClient } from '../db'
import * as SessionRepo from '../models/Session'
import SocketService from './SocketService'
import { openai } from './BotsService'
import * as FeatureFlagService from './FeatureFlagService'
import { getSubjectNameIdMapping } from '../models/Subjects'
import { TextPromptClient } from 'langfuse-core'
import { COLLEGE_SUBJECTS } from '../constants'

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

const CHAT_GPT_ERROR_MESSAGE = JSON.stringify({
  response: "I'm sorry, I encountered an error. Please try asking again.",
})

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

export enum TUTOR_BOT_MODELS {
  PHI_3 = 'phi3-upchieve-tutormodel',
  CHAT_GPT_4O = 'gpt-4o',
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
  const model = await FeatureFlagService.getTutorBotSubjectModelsPayload(
    userId,
    subjectName
  )
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

    const botResponse =
      model === TUTOR_BOT_MODELS.PHI_3
        ? await getBotResponse({ userId, conversationId, subjectName }, tc)
        : await getOpenAiBotResponse(
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

async function getPromptDataFor(subjectName: string): Promise<{
  isFallback: boolean
  prompt: string
  version: string
  promptObject?: TextPromptClient
}> {
  const promptName = Object.values<string>(COLLEGE_SUBJECTS).includes(
    subjectName
  )
    ? LangfuseService.LangfusePromptNameEnum.TUTOR_BOT_COLLEGE_COUNSELING_PROMPT
    : LangfuseService.LangfusePromptNameEnum.TUTOR_BOT_GENERIC_SUBJECT_PROMPT
  const promptFromLangfuse = await LangfuseService.getPrompt(promptName)
  const isFallback = promptFromLangfuse === undefined

  const prompt = isFallback
    ? TUTOR_BOT_GENERIC_SUBJECT_PROMPT_FALLBACK
    : (promptFromLangfuse! as TextPromptClient).prompt

  return {
    isFallback,
    prompt,
    version: isFallback
      ? 'FALLBACK'
      : `${promptFromLangfuse!.name}-${promptFromLangfuse!.version}`,
    ...(!isFallback && {
      promptObject: promptFromLangfuse as TextPromptClient,
    }),
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

const NUM_OF_MESSAGES_TO_KEEP_IN_CONTEXT = 15
const getOpenAiBotResponse = async (
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
  TutorBotConversationMessage & {
    traceId: string
    obeservationId: string | null
    status: string
  }
> => {
  // Save the latest user message to DB and create the transcript of the conversation so far
  const t = LangfuseService.getClient().trace({
    name: LF_TRACE_NAME,
    sessionId: conversationId,
  })
  // NOTE these are ordered by created at ASC
  const transcript = await getTranscriptForConversation(conversationId, tc)
  const mostRecentMessages = transcript.messages
    .map(({ senderUserType, message }) => `<|${senderUserType}|>: ${message}`)
    .slice(-NUM_OF_MESSAGES_TO_KEEP_IN_CONTEXT)
    .join('<|end|>\n')
  const gen = t.generation({
    name: LF_GENERATION_NAME,
    model: TUTOR_BOT_MODELS.CHAT_GPT_4O,
  })
  const promptData = await getPromptDataFor(subjectName)
  const messagePrompt = interpolate({
    text: promptData.prompt,
    replacements: {
      '{{subject}}': subjectName,
      '{{conversation}}': mostRecentMessages,
    },
  })

  const completion = await openai.chat.completions.create({
    model: TUTOR_BOT_MODELS.CHAT_GPT_4O,
    messages: [{ role: 'system', content: messagePrompt }],
    response_format: { type: 'json_object' },
    max_tokens: 400,
  })
  const response =
    completion?.choices?.[0]?.message?.content ?? CHAT_GPT_ERROR_MESSAGE

  if (response === CHAT_GPT_ERROR_MESSAGE) {
    // We could add a retry if we see this happening a fair amount
    logger.error('AI tutor: Unprocessbable response from chatGPT', {
      messagePrompt,
      completion,
      traceName: LF_TRACE_NAME,
    })
  }

  // Save bot response to conversation messages and append to the existing transcript
  const content = JSON.parse(response)
  const savedBotMessage = await insertTutorBotConversationMessage(
    {
      conversationId,
      userId,
      message: content.response,
      senderUserType: 'bot',
    },
    tc
  )
  gen.end({
    output: content.response,
    input: { prompt: messagePrompt, ...savedBotMessage, subjectName },
  })

  return {
    senderUserType: 'bot',
    message: content.response,
    createdAt: savedBotMessage.createdAt,
    tutorBotConversationId: conversationId,
    userId,
    status: content.reason,
    traceId: gen.traceId,
    obeservationId: gen.observationId,
  }
}

const getBotResponse = async (
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
  TutorBotConversationMessage & {
    traceId: string
    obeservationId: string | null
    status: string
  }
> => {
  // Save the latest user message to DB and create the transcript of the conversation so far
  const t = LangfuseService.getClient().trace({
    name: LF_TRACE_NAME,
    sessionId: conversationId,
  })
  const transcript = await getTranscriptForConversation(conversationId, tc)
  const prompt = createPromptFromTranscript(transcript)
  const gen = t.generation({
    name: LF_GENERATION_NAME,
    model: TUTOR_BOT_MODELS.PHI_3,
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
    input: { prompt, ...savedBotMessage, subjectName },
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
  transcript.messages.forEach((m) => {
    const senderTag = m.senderUserType === 'bot' ? '<|assistant|>' : '<|user|>'

    prompt += `${senderTag}\n${m.message}<|end|>${
      senderTag === '<|user|>' ? '<|system|>' : ''
    }\n`
  })

  // start removing the earlier messages
  if (byteSize(prompt) > 1024) {
    while (byteSize(prompt) > 1024) {
      prompt = prompt.split('<|end|>\n').slice(1).join('<|end|>\n')
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

/* NOTE
 *
 * The prompt MUST contain the word 'json' in some form
 * and MUST return a json object with the bot's message in the key 'response'
 *
 * e.g. `Format your answer as a JSON object: {"response": "write out your response to the student's last message"}`
 */
const TUTOR_BOT_GENERIC_SUBJECT_PROMPT_FALLBACK = `
You are an experienced {{subject}} teacher. Your task is to participate in a tutoring session with a student and possibly a volunteer tutor. A conversation snippet
will be provided for you, each message will start with an identifier (<|student|>, <|volunteer|>, or <|bot|> (you are the bot)) and end with '<|end|>'.
You should then determine what strategy you want to use to assist the student in learning the subject and completing the problem or answering their questions.
State your intention in using that strategy. We have a list of common strategies and intentions that teachers use, which you can pick from.
We also give you the option to write in your own own strategy or intention if none of the options apply.

Strategies:
0. Explain a concept
1. Ask a question
2. Provide a hint
3. Provide a strategy
4. Provide a worked example
5. Provide a minor correction
6. Provide a similar problem
7. Simplify the question
8. Affirm the correct answer
9. Encourage the student
10. Other (please specify in your reasoning)

Intentions:
0. Motivate the student
1. Get the student to elaborate their answer
2. Correct the student's mistake
3. Hint at the student's mistake
4. Clarify a student's misunderstanding
5. Help the student understand the lesson topic or solution strategy
6. Diagnose the student's mistake
7. Support the student in their thinking or problem-solving
8. Explain the student's mistake (eg. what is wrong in their answer or why is it incorrect)
9. Signal to the student that they have solved or not solved the problem
10. Other (please specify in your reasoning)

Here is the conversation snippet:
Lesson topic: {{subject}}
Conversation:
{{conversation}}<|end|>

How would you help the student understand and solve the problem and why? Pick the option number from the list of strategies and intentions and provide the reason behind your choices.
Then, using your choices, respond to the student as an experienced math teacher and helpful tutor. Do not give them a direct answer but use your strategy and intentions to craft a concise, useful, and caring response
to help the student with the next step in solving the given problem or better understanding the subject.
Format your answer as a JSON object: {"strategy": #, "intention": #, "reason": "write out your reason for picking that strategy and intention", "response": "write out your response to the student's last message"}
`
