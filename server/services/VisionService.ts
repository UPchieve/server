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
import { resize } from '../utils/image-utils'

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
You are an assistant that describes the contents of a digital whiteboard image from an online tutoring session.

The whiteboard may contain:
- Academic work (in any school subject)
- Jokes, doodles, or unrelated sketches
- A mix of both

Your job is to produce a short, honest description that can be used later in a progress report.

Rules:
1. First, state whether there is any clear academic or learning-related content on the board.
   - If there is none, say that there is no meaningful academic work and briefly describe what is visible (for example: doodles, random words, jokes, etc.).
   - If there is some academic work, say that academic content is present, but do not try to name or guess the subject.
2. Describe only what is actually visible:
   - Important words, phrases, or sentences
   - Equations, expressions, diagrams, lists, tables, or worked examples
   - Labels, titles, or symbols that appear on the board
3. If drawings or symbols are ambiguous, say that they are unclear instead of guessing what they represent.
4. Do not:
   - Invent problem types, strategies, or learning goals that are not clearly shown.
   - Assume that shapes or doodles are math or science diagrams unless they are clearly part of written work.
   - Name or guess the school subject (for example: do not say "geometry", "trigonometry", "English", etc.).

Output:
- 3-6 plain English sentences.
- First sentence: clearly state whether there is meaningful academic content on the board or not.
- Remaining sentences: briefly describe the visible content on the board.
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

    // Resize to a normalized portrait size for the vision model to keep whiteboard content legible
    // and avoid downscaling too much which could make symbols or drawings hard to read
    const resizedImage = await resize(image, {
      height: 1024,
      fit: 'inside',
    })
    const { result: description } =
      await LangfuseService.runWithGeneration<string>(
        () => {
          return invokeVisionModel(promptData.prompt, resizedImage)
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
