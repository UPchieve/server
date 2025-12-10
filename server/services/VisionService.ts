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
import * as LangfuseService from './LangfuseService'
import { invokeVisionModel, MODEL_ID } from './OpenAIService'

const client: ImageAnalysisClient = isValidConfigToken(
  config.subwayAIVisionApiKey
)
  ? createImageAnalysisClient(
      config.subwayAIVisionEndpoint,
      new AzureKeyCredential(config.subwayAIVisionApiKey)
    )
  : createMockImageAnalysisClient()

const LF_TRACE_NAME_WHITEBOARD = 'whiteboardVision'
const LF_GENERATION_NAME_WHITEBOARD = 'describeWhiteboardSnapshot'

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
    body: imageBuffer,
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
  const blocks = readResult.blocks
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

const WHITEBOARD_VISION_FALLBACK_PROMPT = `
  You are an assistant that analyzes a digital whiteboard from a high-school tutoring session.

  You will receive an image of the whiteboard. Describe only what is visible.

  Your goal is to identify:
  - The main math or science topic the student and tutor were working on
  - Key equations, diagrams, steps, or problem-solving work visible
  - Any apparent strategy or method being used

  Write a clear description that can later be used as input to a larger progress-report analysis.  
  Do not guess or infer content that you cannot see in the image.
`.trim()

export async function describeWhiteboardSnapshot(
  image: Buffer
): Promise<string> {
  try {
    const promptData = await LangfuseService.getPromptWithFallback(
      LangfuseService.LangfusePromptNameEnum.WHITEBOARD_VISION_PROMPT,
      WHITEBOARD_VISION_FALLBACK_PROMPT,
      {
        cacheTtlSeconds: 120,
        waitInMs: 5000,
      }
    )
    const { result: description } =
      await LangfuseService.runWithGeneration<string>(
        () => {
          return invokeVisionModel(promptData.prompt, image)
        },
        {
          traceName: LF_TRACE_NAME_WHITEBOARD,
          generationName: LF_GENERATION_NAME_WHITEBOARD,
          model: MODEL_ID,
          input:
            typeof image === 'string'
              ? '[Whiteboard Image URL]'
              : '[Whiteboard Image Buffer]',
          metadata: {
            promptVersion: promptData.version,
          },
        }
      )
    return description
  } catch (error) {
    logger.error(
      { err: error },
      'Error while analyzing whiteboard snapshot for progress report'
    )
    return ''
  }
}
