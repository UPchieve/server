import logger from '../logger'
import config from '../config'
import * as PromptService from './PromptService'
import { PromptName } from './PromptService'
import { resize } from '../utils/image-utils'
import { invokeModel } from './AwsBedrockService'
import { runWithModelObservation, runWithTrace } from './AiObservabilityService'
import { secondsInMs } from '../utils/time-utils'
import { LangfuseGenerationClient, LangfuseTraceClient } from 'langfuse-node'
import { LangfuseGenerationName } from './ModerationService/types'
import { extractText } from 'unpdf'
import { AWSRekognitionClient } from './AwsService'
import { DetectTextCommand } from '@aws-sdk/client-rekognition'

const EXTRACT_TEXT_FROM_IMAGE_GENERATION_NAME =
  LangfuseGenerationName.EXTRACT_TEXT_FROM_IMAGE

export async function extractTextFromImage(
  image: Buffer,
  trace?: LangfuseTraceClient
): Promise<string[]> {
  let generation: LangfuseGenerationClient | undefined = undefined
  if (trace) {
    generation = trace.generation({
      name: EXTRACT_TEXT_FROM_IMAGE_GENERATION_NAME,
    })
  }

  const extractedText = await AWSRekognitionClient.send(
    new DetectTextCommand({
      Image: {
        Bytes: new Uint8Array(image),
      },
    })
  )

  if (generation) {
    generation.end({ output: extractText })
  }

  const detections = extractedText.TextDetections ?? []
  const textSegments = detections
    .filter(({ Type }) => Type === 'LINE')
    .map((detection) => detection.DetectedText ?? '')

  return textSegments
}

export async function describeWhiteboardSnapshot(
  image: Buffer,
  sessionId: string
): Promise<string> {
  try {
    // Resize to a normalized portrait size for the vision model to keep whiteboard content legible
    // and avoid downscaling too much which could make symbols or drawings hard to read
    const resizedImage = await resize(image, {
      height: 1024,
      fit: 'inside',
    })

    const { result } = await runWithTrace<string>(
      async (trace) => {
        const promptData = await PromptService.getPromptWithFallback(
          PromptName.WHITEBOARD_VISION_PROMPT,
          {
            waitInMs: secondsInMs(5),
          }
        )

        const model = config.awsBedrockSonnet4Id
        return await runWithModelObservation(
          () =>
            invokeModel({
              modelId: model,
              prompt: promptData.prompt,
              images: [resizedImage],
            }),
          {
            trace,
            name: 'describeWhiteboardSnapshot',
            model,
            input:
              typeof image === 'string'
                ? '[Whiteboard Image URL]'
                : '[Whiteboard Image Buffer]',
            prompt: promptData.promptObject,
          }
        )
      },
      {
        name: 'whiteboardVision',
        sessionId,
      }
    )
    return result
  } catch (error) {
    logger.error(
      { err: error },
      'Error while analyzing whiteboard snapshot for progress report'
    )
    return ''
  }
}
