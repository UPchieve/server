import { mocked } from 'jest-mock'
import logger from '../../logger'
import * as LangfuseService from '../../services/LangfuseService'
import * as AwsBedrockService from '../../services/AwsBedrockService'
import * as VisionService from '../../services/VisionService'
import * as AiObservabilityClient from '../../clients/ai-observability'
import * as imageUtils from '../../utils/image-utils'

jest.mock('../../logger')
jest.mock('../../services/LangfuseService')
jest.mock('../../services/AwsBedrockService')
jest.mock('../../clients/ai-observability')
jest.mock('../../utils/image-utils')
jest.mock('../../utils/environments')
jest.mock('../../config')
jest.mock('@azure/core-auth')
jest.mock('@azure-rest/ai-vision-image-analysis')

const mockedLogger = mocked(logger)
const mockedLangfuseService = mocked(LangfuseService)
const mockedAiObservabilityClient = mocked(AiObservabilityClient)
const mockedAwsBedrockService = mocked(AwsBedrockService)
const mockedImageUtils = mocked(imageUtils)

beforeEach(() => {
  jest.clearAllMocks()
  jest.resetAllMocks()
  mockedAiObservabilityClient.runWithTrace.mockImplementation(async (cb) => {
    return { result: await cb({} as any), traceId: '' }
  })
  mockedImageUtils.resize.mockResolvedValue(Buffer.from('resized'))
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
    mockedAiObservabilityClient.runWithModelObservation.mockImplementationOnce(
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
    expect(mockedLangfuseService.getPromptWithFallback).toHaveBeenCalled()
    expect(mockedImageUtils.resize).toHaveBeenCalled()
    expect(
      mockedAiObservabilityClient.runWithModelObservation
    ).toHaveBeenCalled()
    expect(mockedAwsBedrockService.invokeModel).toHaveBeenCalled()
  })

  test('Should return empty string and log error if a step in the analysis fails', async () => {
    const err = new Error('fail')

    mockedLangfuseService.getPromptWithFallback.mockRejectedValueOnce(err)

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
