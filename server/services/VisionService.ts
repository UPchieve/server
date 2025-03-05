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
