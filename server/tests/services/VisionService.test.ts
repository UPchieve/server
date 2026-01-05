import { mocked } from 'jest-mock'
import logger from '../../logger'
import * as LangfuseService from '../../services/LangfuseService'
import * as AwsBedrockService from '../../services/AwsBedrockService'
import * as VisionService from '../../services/VisionService'
import * as imageUtils from '../../utils/image-utils'

jest.mock('../../logger')
jest.mock('../../services/LangfuseService')
jest.mock('../../services/AwsBedrockService')
jest.mock('../../utils/image-utils')
jest.mock('../../utils/environments')
jest.mock('../../config')
jest.mock('@azure/core-auth')
jest.mock('@azure-rest/ai-vision-image-analysis')

const mockedLogger = mocked(logger)
const mockedLangfuseService = mocked(LangfuseService)
const mockedAwsBedrockService = mocked(AwsBedrockService)
const mockedImageUtils = mocked(imageUtils)

beforeEach(() => {
  jest.clearAllMocks()
  jest.resetAllMocks()
})

describe('describeWhiteboardSnapshot', () => {
  test('Should return description from vision model', async () => {
    const descriptionResult = 'An image of a test file'

    mockedLangfuseService.getPromptWithFallback.mockResolvedValueOnce({
      isFallback: true,
      prompt: 'prompt',
      version: 'FALLBACK',
    })
    mockedImageUtils.resize.mockResolvedValueOnce(Buffer.from('resized'))
    mockedLangfuseService.runWithGeneration.mockImplementationOnce(
      async (cb) => {
        const result = await cb()
        return { result, traceId: '123' }
      }
    )
    mockedAwsBedrockService.invokeModel.mockResolvedValueOnce(descriptionResult)

    const result = await VisionService.describeWhiteboardSnapshot(
      Buffer.from('img')
    )
    expect(result).toBe(descriptionResult)
    expect(mockedLangfuseService.getPromptWithFallback).toHaveBeenCalled()
    expect(mockedImageUtils.resize).toHaveBeenCalled()
    expect(mockedLangfuseService.runWithGeneration).toHaveBeenCalled()
    expect(mockedAwsBedrockService.invokeModel).toHaveBeenCalled()
  })

  test('Should return empty string and log error if a step in the analysis fails', async () => {
    const err = new Error('fail')

    mockedLangfuseService.getPromptWithFallback.mockRejectedValueOnce(err)

    const result = await VisionService.describeWhiteboardSnapshot(
      Buffer.from('img')
    )
    expect(result).toBe('')
    expect(mockedLogger.error).toHaveBeenCalledWith(
      { err },
      'Error while analyzing whiteboard snapshot for progress report'
    )
  })
})
