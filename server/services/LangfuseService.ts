import { Langfuse } from 'langfuse-node'
import config from '../config'
import { timeLimit } from '../utils/time-limit'
import { ChatPromptClient, TextPromptClient } from 'langfuse-core'

export function getClient() {
  if (!client) {
    client = createClient()
  }
  return client
}

const createClient = (): Langfuse => {
  return new Langfuse({
    secretKey: config.langfuseSecretKey,
    publicKey: config.langfusePublicKey,
    baseUrl: config.langfuseBaseUrl,
  })
}

let client = createClient()

export enum LangfusePromptNameEnum {
  GET_SESSION_MESSAGE_MODERATION_DECISION = 'get-session-message-moderation-decision',
  TUTOR_BOT_GENERIC_SUBJECT_PROMPT = 'tutor-bot-generic-subject-prompt',
  TUTOR_BOT_COLLEGE_COUNSELING_PROMPT = 'tutor-bot-college-counseling-prompt',
  SESSION_TRANSCRIPT_MODERATION = 'session-transcript-moderation',
  GET_ADDRESS_DETECTION_MODERATION_DECISION = 'get-address-detection-moderation-decision',
  SESSION_SUMMARY_TEACHER_PROMPT = 'session-summary-teacher-prompt',
  GET_QUESTIONABLE_LINK_MODERATION_DECISION = 'get-questionable-link-moderation-decision',
  IS_IMAGE_EDUCATIONAL = 'is-image-for-educational-use',
  WHITEBOARD_VISION_PROMPT = 'whiteboard-vision-prompt',
}

export enum LangfuseTraceTagEnum {
  FLAGGED_BY_MODERATION = 'flagged-by-moderation',
}

export type LangfusePromptData = {
  isFallback: boolean
  prompt: string
  version: string
  promptObject?: ChatPromptClient | TextPromptClient
}

export async function getPrompt(
  promptName: string,
  cacheTtlSeconds = 120,
  waitInMs = 1000
): Promise<ChatPromptClient | TextPromptClient | undefined> {
  return await timeLimit({
    promise: getClient().getPrompt(promptName, undefined, {
      cacheTtlSeconds,
    }),
    fallbackReturnValue: undefined,
    timeLimitReachedErrorMessage: `Time limit reached when fetching Langfuse prompt ${promptName}`,
    waitInMs,
  })
}

export async function getPromptWithFallback(
  promptName: LangfusePromptNameEnum,
  fallbackPrompt: string,
  options?: {
    cacheTtlSeconds?: number
    waitInMs?: number
  }
): Promise<LangfusePromptData> {
  const promptFromLangfuse = await getPrompt(
    promptName,
    options?.cacheTtlSeconds,
    options?.waitInMs
  )
  const isFallback = promptFromLangfuse === undefined
  const prompt = isFallback
    ? fallbackPrompt
    : (promptFromLangfuse as TextPromptClient).prompt

  return {
    isFallback,
    prompt,
    version: isFallback
      ? 'FALLBACK'
      : `${promptFromLangfuse!.name}-${promptFromLangfuse!.version}`,
    ...(!isFallback && {
      promptObject: promptFromLangfuse,
    }),
  }
}

export type LangfuseGenerationOptions = {
  traceName: string
  generationName: string
  model: string
  input: any
  metadata?: Record<string, any>
}

export async function runWithGeneration<T>(
  cb: () => Promise<T>,
  options: LangfuseGenerationOptions
): Promise<{ result: T; traceId: string }> {
  const { traceName, generationName, model, input, metadata } = options
  const client = getClient()
  const trace = client.trace({
    name: traceName,
    metadata,
  })
  const gen = trace.generation({
    name: generationName,
    model,
    input,
    metadata,
  })

  try {
    const result = await cb()
    gen.end({ output: result })
    return { result, traceId: trace.traceId }
  } catch (error) {
    gen.end({
      output: {
        error: error instanceof Error ? error.message : String(error),
      },
    })
    throw error
  }
}
