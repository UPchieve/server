import { TextPromptClient } from 'langfuse-core'
import { timeLimit } from '../../utils/time-limit'
import { client } from '../../clients/langfuse'
import * as FallbackPrompts from './fallbackPrompts'
import logger from '../../logger'

export enum PromptName {
  GET_SESSION_MESSAGE_MODERATION_DECISION = 'get-session-message-moderation-decision',
  TUTOR_BOT_GENERIC_SUBJECT_PROMPT = 'tutor-bot-generic-subject-prompt',
  TUTOR_BOT_COLLEGE_COUNSELING_PROMPT = 'tutor-bot-college-counseling-prompt',
  SESSION_TRANSCRIPT_MODERATION = 'session-transcript-moderation',
  GET_ADDRESS_DETECTION_MODERATION_DECISION = 'get-address-detection-moderation-decision',
  SESSION_SUMMARY_TEACHER_PROMPT = 'session-summary-teacher-prompt',
  SESSION_SUMMARY_STUDENT_PROMPT = 'session-summary-student-prompt',
  GET_QUESTIONABLE_LINK_MODERATION_DECISION = 'get-questionable-link-moderation-decision',
  IS_IMAGE_EDUCATIONAL = 'is-image-for-educational-use',
  WHITEBOARD_VISION_PROMPT = 'whiteboard-vision-prompt',
  DOCUMENT_EDITOR_TOOL_PROMPT = 'document-editor-tool-prompt',
  WHITEBOARD_TOOL_PROMPT = 'whiteboard-tool-prompt',
}
// Exported for testing.
export const fallbackPrompts: { [promptName in PromptName]: string } = {
  [PromptName.GET_SESSION_MESSAGE_MODERATION_DECISION]:
    FallbackPrompts.FALLBACK_MODERATION_PROMPT,
  [PromptName.TUTOR_BOT_GENERIC_SUBJECT_PROMPT]:
    FallbackPrompts.TUTOR_BOT_GENERIC_SUBJECT_PROMPT_FALLBACK,
  [PromptName.TUTOR_BOT_COLLEGE_COUNSELING_PROMPT]:
    FallbackPrompts.TUTOR_BOT_GENERIC_SUBJECT_PROMPT_FALLBACK,
  [PromptName.SESSION_TRANSCRIPT_MODERATION]:
    FallbackPrompts.FALLBACK_TRANSCRIPT_MODERATION_PROMPT,
  [PromptName.GET_ADDRESS_DETECTION_MODERATION_DECISION]:
    FallbackPrompts.ADDRESS_DETECTION_FALLBACK_MODERATION_PROMPT,
  [PromptName.SESSION_SUMMARY_TEACHER_PROMPT]:
    FallbackPrompts.SESSION_SUMMARY_TEACHER_FALLBACK_PROMPT,
  [PromptName.SESSION_SUMMARY_STUDENT_PROMPT]:
    FallbackPrompts.SESSION_SUMMARY_STUDENT_FALLBACK_PROMPT,
  [PromptName.GET_QUESTIONABLE_LINK_MODERATION_DECISION]:
    FallbackPrompts.QUESTIONABLE_LINK_FALLBACK_MODERATION_PROMPT,
  [PromptName.IS_IMAGE_EDUCATIONAL]: '', // TODO: Add fallback prompt instead of erroring.
  [PromptName.WHITEBOARD_VISION_PROMPT]:
    FallbackPrompts.WHITEBOARD_VISION_FALLBACK_PROMPT,
  [PromptName.DOCUMENT_EDITOR_TOOL_PROMPT]:
    FallbackPrompts.DOCUMENT_EDITOR_TOOL_FALLBACK_PROMPT,
  [PromptName.WHITEBOARD_TOOL_PROMPT]:
    FallbackPrompts.WHITEBOARD_TOOL_FALLBACK_PROMPT,
}

export type PromptResponse =
  | {
      isFallback: true
      prompt: string
      version: 'FALLBACK'
      promptObject?: undefined
    }
  | {
      isFallback: false
      prompt: string
      version: string
      promptObject: TextPromptClient
    }

export async function getPrompt(
  promptName: PromptName,
  cacheTtlSeconds = 120,
  waitInMs = 1000
): Promise<TextPromptClient | undefined> {
  return await timeLimit({
    promise: client.getPrompt(promptName, undefined, {
      cacheTtlSeconds,
    }),
    fallbackReturnValue: undefined,
    timeLimitReachedErrorMessage: `Time limit reached when fetching Langfuse prompt ${promptName}`,
    waitInMs,
  })
}

export async function getPromptWithFallback(
  promptName: PromptName,
  options?: {
    cacheTtlSeconds?: number
    waitInMs?: number
  }
): Promise<PromptResponse> {
  let promptObject
  try {
    promptObject = await getPrompt(
      promptName,
      options?.cacheTtlSeconds,
      options?.waitInMs
    )
  } catch (err) {
    logger.error({ err }, 'Failed to getPrompt from Langfuse.')
  }

  if (!promptObject) {
    return {
      isFallback: true,
      prompt: fallbackPrompts[promptName],
      version: 'FALLBACK',
    }
  }

  return {
    isFallback: false,
    prompt: promptObject.prompt,
    version: `${promptObject.name}-${promptObject.version}`,
    promptObject,
  }
}
