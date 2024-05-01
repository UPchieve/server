import * as fs from 'fs'
import createImageAnalysisClient, {
  ImageAnalysisClient,
  isUnexpected,
  ImageAnalysisResultOutput,
  ReadResultOutput,
} from '@azure-rest/ai-vision-image-analysis'
import { AzureKeyCredential } from '@azure/core-auth'
import logger from '../logger'
import config from '../config'

const client: ImageAnalysisClient = createImageAnalysisClient(
  config.subwayAIVisionEndpoint,
  new AzureKeyCredential(config.subwayAIVisionApiKey)
)

async function analyzeImageBuffer(
  filePath: string
): Promise<ImageAnalysisResultOutput> {
  const imageBuffer: Buffer = fs.readFileSync(filePath)
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
  imagePath: string
): Promise<string> {
  try {
    const response = await analyzeImageBuffer(imagePath)
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
