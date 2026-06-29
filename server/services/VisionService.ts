import logger from '../logger'
import config from '../config'
import * as PromptService from './PromptService'
import { PromptName } from './PromptService'
import { resize } from '../utils/image-utils'
import { invokeModel } from './AwsBedrockService'
import {
  runWithModelObservation,
  runWithTrace,
  Trace,
} from './AiObservabilityService'
import { secondsInMs } from '../utils/time-utils'
import { AWSRekognitionClient } from './AwsService'
import { DetectTextCommand } from '@aws-sdk/client-rekognition'

export async function extractTextFromImage(
  image: Buffer,
  trace?: Trace
): Promise<string[]> {
  const extractedText = await runWithModelObservation(
    () =>
      AWSRekognitionClient.send(
        new DetectTextCommand({
          Image: {
            Bytes: new Uint8Array(image),
          },
        })
      ),
    {
      trace,
      name: 'extractTextFromImage',
      model: 'rekognition',
    }
  )

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
