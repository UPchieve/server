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
}

export enum LangfuseTraceTagEnum {
  FLAGGED_BY_MODERATION = 'flagged-by-moderation',
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
