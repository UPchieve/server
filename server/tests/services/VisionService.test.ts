import { mocked } from 'jest-mock'
import logger from '../../logger'
import * as PromptService from '../../services/PromptService'
import * as ClaudeService from '../../services/ClaudeService'
import * as VisionService from '../../services/VisionService'
import * as AiObservabilityService from '../../services/AiObservabilityService'
import * as imageUtils from '../../utils/image-utils'

jest.mock('../../logger')
jest.mock('../../services/PromptService')
jest.mock('../../services/ClaudeService')
jest.mock('../../services/AiObservabilityService')
jest.mock('../../utils/image-utils')
jest.mock('../../utils/environments')
jest.mock('../../config')
jest.mock('@azure/core-auth')

const mockedLogger = mocked(logger)
const mockedAiObservabilityService = mocked(AiObservabilityService)
const mockedPromptService = mocked(PromptService)
const mockedClaudeService = mocked(ClaudeService)
const mockedImageUtils = mocked(imageUtils)

beforeEach(() => {
  jest.clearAllMocks()
  jest.resetAllMocks()
  mockedAiObservabilityService.runWithTrace.mockImplementation(async (cb) => {
    return { result: await cb({} as any), traceId: '' }
  })
  mockedImageUtils.resize.mockResolvedValue({
    data: Buffer.from('resized'),
    mediaType: 'image/jpeg',
  })
})

describe('describeWhiteboardSnapshot', () => {
  test('Should return description from vision model', async () => {
    const descriptionResult = 'An image of a test file'

    mockedPromptService.getPromptWithFallback.mockResolvedValueOnce({
      isFallback: true,
      prompt: 'prompt',
      version: 'FALLBACK',
    })
    mockedAiObservabilityService.runWithModelObservation.mockImplementationOnce(
      (cb) => {
        return cb()
      }
    )
    mockedClaudeService.invokeModel.mockResolvedValueOnce(descriptionResult)

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
    expect(mockedClaudeService.invokeModel).toHaveBeenCalled()
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
