import * as LangfuseService from '../../services/LangfuseService'
import { timeLimit } from '../../utils/time-limit'

jest.mock('langfuse-node')
jest.mock('../../utils/time-limit')
const mockTimeLimit = jest.mocked(timeLimit)

describe('LangfuseService', () => {
  const mockLangfuseClient = {
    getPrompt: jest.fn(),
  } as any

  const mockTextPrompt = {
    prompt: 'test-text-prompt',
  } as any

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('getPrompt', () => {
    const promptName = 'prompt-name'

    it('Should return the prompt from Langfuse if the time limit is not exceeded', async () => {
      mockLangfuseClient.getPrompt.mockResolvedValue(mockTextPrompt)
      mockTimeLimit.mockResolvedValue(mockTextPrompt)

      const result = await LangfuseService.getPrompt(promptName)
      expect(result).toEqual(mockTextPrompt)
      expect(mockTimeLimit).toHaveBeenCalled()
    })

    it('Should return undefined if the time limit is exceeded', async () => {
      mockLangfuseClient.getPrompt.mockResolvedValue(mockTextPrompt)
      mockTimeLimit.mockResolvedValue(undefined)

      const result = await LangfuseService.getPrompt(promptName)
      expect(result).toBeUndefined()
      expect(mockTimeLimit).toHaveBeenCalled()
    })
  })
})
