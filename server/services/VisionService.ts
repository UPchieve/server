import createImageAnalysisClient, {
  ImageAnalysisClient,
  isUnexpected,
  ImageAnalysisResultOutput,
  ReadResultOutput,
} from '@azure-rest/ai-vision-image-analysis'
import { AzureKeyCredential } from '@azure/core-auth'
import logger from '../logger'
import config from '../config'
import { isValidConfigToken } from '../utils/environments'
import * as PromptService from './PromptService'
import { PromptName } from './PromptService'
import { resize } from '../utils/image-utils'
import { invokeModel } from './AwsBedrockService'
import { runWithModelObservation, runWithTrace } from './AiObservabilityService'

const client: ImageAnalysisClient = isValidConfigToken(
  config.subwayAIVisionApiKey
)
  ? createImageAnalysisClient(
      config.subwayAIVisionEndpoint,
      new AzureKeyCredential(config.subwayAIVisionApiKey)
    )
  : createMockImageAnalysisClient()

function createMockImageAnalysisClient(): ImageAnalysisClient {
  return {
    path: () => ({
      post: async () => ({
        status: '200',
        body: {
          captionResult: {},
          denseCaptionsResult: {},
          metadata: {},
          modelVersion: '',
          objectResult: {},
          peopleResult: {},
          readResult: {},
          smartCropsResult: {},
          tagsResult: {},
        },
      }),
    }),
  } as unknown as ImageAnalysisClient
}

async function analyzeImageBuffer(
  imageBuffer: Buffer
): Promise<ImageAnalysisResultOutput> {
  const features: string[] = ['Read']
  const result = await client.path('/imageanalysis:analyze').post({
    body: new Uint8Array(imageBuffer),
    queryParameters: { features },
    contentType: 'application/octet-stream',
  })

  if (isUnexpected(result)) throw result.body.error
  return result.body
}

async function getTextFromImageReadResult(
  readResult?: ReadResultOutput
): Promise<string> {
  if (!readResult) return ''
  const blocks = readResult.blocks ?? []
  const lines: string[] = []
  for (const block of blocks) {
    for (const line of block.lines) {
      lines.push(line.text)
    }
  }
  return lines.join('\n')
}

export async function getTextFromImageAnalysis(
  imageBuffer: Buffer
): Promise<string> {
  try {
    const response = await analyzeImageBuffer(imageBuffer)
    return getTextFromImageReadResult(response.readResult)
  } catch (error) {
    logger.error(
      `getTextFromImageAnalysis error while generating Progress Report ${
        (error as Error).message
      })`
    )
    return ''
  }
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
            cacheTtlSeconds: 120,
            waitInMs: 5000,
          }
        )

        const model = config.awsBedrockSonnet4Id
        return await runWithModelObservation(
          () =>
            invokeModel({
              modelId: model,
              prompt: promptData.prompt,
              image: resizedImage,
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
