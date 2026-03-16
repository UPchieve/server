import * as PromptService from '../../services/PromptService'
import { timeLimit } from '../../utils/time-limit'

jest.mock('langfuse-node')
jest.mock('../../utils/time-limit')
const mockTimeLimit = jest.mocked(timeLimit)

describe('PromptService', () => {
  const mockLangfuseClient = {
    getPrompt: jest.fn(),
  } as any

  const mockTextPrompt = {
    prompt: 'test-text-prompt',
  } as any

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('getPromptWithFallback', () => {
    const promptName = PromptService.PromptName.TUTOR_BOT_GENERIC_SUBJECT_PROMPT

    it('Should return the Langfuse prompt when available', async () => {
      const mockPromptObject = {
        prompt: 'test-prompt-content',
        name: 'test-prompt',
        version: 1,
      } as any
      mockTimeLimit.mockResolvedValue(mockPromptObject)

      const result = await PromptService.getPromptWithFallback(promptName)

      expect(result.isFallback).toBe(false)
      expect(result.prompt).toBe('test-prompt-content')
      expect(result.version).toBe('test-prompt-1')
      expect(result.promptObject).toEqual(mockPromptObject)
    })

    it('Should return fallback prompt when Langfuse returns undefined', async () => {
      mockTimeLimit.mockResolvedValue(undefined)

      const result = await PromptService.getPromptWithFallback(promptName)

      expect(result.isFallback).toBe(true)
      expect(result.version).toBe('FALLBACK')
      expect(result.prompt).toBe(PromptService.fallbackPrompts[promptName])
      expect(result.promptObject).toBeUndefined()
    })

    it('Should return fallback prompt when getPrompt throws an error', async () => {
      mockTimeLimit.mockRejectedValue(new Error('Langfuse error'))

      const result = await PromptService.getPromptWithFallback(promptName)

      expect(result.isFallback).toBe(true)
      expect(result.version).toBe('FALLBACK')
      expect(result.prompt).toBe(PromptService.fallbackPrompts[promptName])
      expect(result.promptObject).toBeUndefined()
    })
  })
})
