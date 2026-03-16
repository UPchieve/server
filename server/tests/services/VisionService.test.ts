import { mocked } from 'jest-mock'
import logger from '../../logger'
import * as PromptService from '../../services/PromptService'
import * as AwsBedrockService from '../../services/AwsBedrockService'
import * as VisionService from '../../services/VisionService'
import * as AiObservabilityService from '../../services/AiObservabilityService'
import * as imageUtils from '../../utils/image-utils'

jest.mock('../../logger')
jest.mock('../../services/PromptService')
jest.mock('../../services/AwsBedrockService')
jest.mock('../../services/AiObservabilityService')
jest.mock('../../utils/image-utils')
jest.mock('../../utils/environments')
jest.mock('../../config')
jest.mock('@azure/core-auth')
jest.mock('@azure-rest/ai-vision-image-analysis')

const mockedLogger = mocked(logger)
const mockedAiObservabilityService = mocked(AiObservabilityService)
const mockedPromptService = mocked(PromptService)
const mockedAwsBedrockService = mocked(AwsBedrockService)
const mockedImageUtils = mocked(imageUtils)

beforeEach(() => {
  jest.clearAllMocks()
  jest.resetAllMocks()
  mockedAiObservabilityService.runWithTrace.mockImplementation(async (cb) => {
    return { result: await cb({} as any), traceId: '' }
  })
  mockedImageUtils.resize.mockResolvedValue(Buffer.from('resized'))
})

describe('describeWhiteboardSnapshot', () => {
  test('Should return description from vision model', async () => {
    const descriptionResult = 'An image of a test file'

    mockedPromptService.getPromptWithFallback.mockResolvedValueOnce({
      isFallback: true,
      prompt: 'prompt',
      version: 'FALLBACK',
    })
    mockedImageUtils.resize.mockResolvedValueOnce(Buffer.from('resized'))
    mockedAiObservabilityService.runWithModelObservation.mockImplementationOnce(
      (cb) => {
        return cb()
      }
    )
    mockedAwsBedrockService.invokeModel.mockResolvedValueOnce(descriptionResult)

    const result = await VisionService.describeWhiteboardSnapshot(
      Buffer.from('img'),
      'sessionId'
    )
    expect(result).toBe(descriptionResult)
    expect(mockedPromptService.getPromptWithFallback).toHaveBeenCalled()
    expect(mockedImageUtils.resize).toHaveBeenCalled()
    expect(
      mockedAiObservabilityService.runWithModelObservation
    ).toHaveBeenCalled()
    expect(mockedAwsBedrockService.invokeModel).toHaveBeenCalled()
  })

  test('Should return empty string and log error if a step in the analysis fails', async () => {
    const err = new Error('fail')

    mockedPromptService.getPromptWithFallback.mockRejectedValueOnce(err)

    const result = await VisionService.describeWhiteboardSnapshot(
      Buffer.from('img'),
      'sessionId'
    )
    expect(result).toBe('')
    expect(mockedLogger.error).toHaveBeenCalledWith(
      { err },
      'Error while analyzing whiteboard snapshot for progress report'
    )
  })
})
