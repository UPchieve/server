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
import { BedrockToolChoice, invokeModel } from './AwsBedrockService'
import { getSubjectNameIdMapping } from '../models/Subjects'
import { TextPromptClient } from 'langfuse-core'
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
): Promise<{
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

  const mostRecentMessages = transcript.messages
    .map(({ senderUserType, message }) => `<|${senderUserType}|>: ${message}`)
    .slice(-NUM_OF_MESSAGES_TO_KEEP_IN_CONTEXT)
    .join('<|end|>\n')

  const cleanedPrompt = interpolate({
    text: prompt,
    replacements: {
      '{{subject}}': subjectName,
      '{{conversation}}': mostRecentMessages,
    },
  })

  return {
    isFallback,
    prompt: cleanedPrompt,
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
      obeservationId: string | null
      status: number
    })
  | null
> => {
  // Save the latest user message to DB and create the transcript of the conversation so far
  const t = LangfuseService.getClient().trace({
    name: LF_TRACE_NAME,
    sessionId: conversationId,
  })
  // NOTE these are ordered by created at ASC
  const transcript = await getTranscriptForConversation(conversationId, tc)
  const promptData = await getPromptData(subjectName, transcript)
  const gen = t.generation({
    name: LF_GENERATION_NAME,
    metadata: { model: config.awsBedrockSonnetArnId },
    input: promptData.prompt,
  })
  let savedBotMessage = null
  let botResponse = null

  try {
    botResponse = await invokeModel({
      modelId: config.awsBedrockSonnetArnId,
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
    savedBotMessage = await insertTutorBotConversationMessage(
      {
        conversationId,
        userId,
        message: botResponse?.response ? botResponse.response : botResponse,
        senderUserType: 'bot',
      },
      tc
    )

    gen.end({
      output: { botResponse: botResponse, responseDbo: savedBotMessage },
    })
  }

  return {
    senderUserType: 'bot',
    message: botResponse?.response ? botResponse.response : botResponse,
    createdAt: savedBotMessage.createdAt,
    tutorBotConversationId: conversationId,
    userId,
    status: botResponse?.intention
      ? botResponse.intention
      : '1. Get the student to elaborate their answer',
    traceId: gen.traceId,
    obeservationId: gen.observationId,
  }
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

const AWS_BEDROCK_TUTOR_ANSWER_FALLBACK = `
Hi there! I noticed you seem to be trying to communicate, but the messages aren't clear. 
Could you tell me more about what your problem?`
