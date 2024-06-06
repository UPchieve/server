import { Langfuse } from 'langfuse-node'
import config from '../config'
import { timeLimit } from '../utils/time-limit'
import { ChatPromptClient, TextPromptClient } from 'langfuse-core'

export const langfuse: Langfuse = new Langfuse({
  secretKey: config.langfuseSecretKey,
  publicKey: config.langfusePublicKey,
  baseUrl: config.langfuseBaseUrl,
})

export enum LangfusePromptNameEnum {
  GET_SESSION_MESSAGE_MODERATION_DECISION = 'get-session-message-moderation-decision',
}

export async function getPrompt(
  promptName: string,
  cacheTtlSeconds = 120
): Promise<ChatPromptClient | TextPromptClient | undefined> {
  return await timeLimit({
    promise: langfuse.getPrompt(promptName, undefined, {
      cacheTtlSeconds,
    }),
    fallbackReturnValue: undefined,
    timeLimitReachedErrorMessage: `Time limit reached when fetching Langfuse prompt ${promptName}`,
    waitInMs: 1000,
  })
}
