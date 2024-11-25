import {
  createChatCompletion,
  FALLBACK_MODERATION_PROMPT,
  moderateMessage,
} from '../../services/ModerationService'
import { mocked } from 'jest-mock'
import * as FeatureFlagsService from '../../services/FeatureFlagService'
import * as CensoredSessionMessage from '../../models/CensoredSessionMessage'
import { openai } from '../../services/BotsService'
import * as LangfuseService from '../../services/LangfuseService'
import logger from '../../logger'

jest.mock('../../logger')
jest.mock('../../models/CensoredSessionMessage')
jest.mock('../../services/BotsService', () => {
  return {
    openai: {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    },
  }
})
jest.mock('../../services/LangfuseService')

describe('ModerationService', () => {
  const isVolunteer = true
  const mockLangfuseService = mocked(LangfuseService)
  const senderId = '123'
  const sessionId = '123'
  const badMessage = 'Call me at (555)555-5555'
  let mockGeneration: any, mockTrace: any, mockLangfuseClient: any

  beforeEach(() => {
    jest.resetAllMocks()
    mockGeneration = {
      end: jest.fn(),
      update: jest.fn(),
    }
    mockTrace = {
      generation: jest.fn().mockReturnValue(mockGeneration),
    }
    mockLangfuseClient = {
      trace: jest.fn().mockReturnValue(mockTrace),
    }
    mockLangfuseService.getPrompt.mockResolvedValue(undefined)
    mockLangfuseService.getClient.mockReturnValue(mockLangfuseClient as any)
  })

  describe('Regex moderation', () => {
    test('Check incorrect email succeeds', async () => {
      const email = 'j.@serve1.proseware.com'
      expect(
        await moderateMessage({ message: email, senderId, isVolunteer })
      ).toBeTruthy()
    })

    test('Check incorrect phone number succeeds', async () => {
      const phoneNumber =
        'a message including 0.001193067% which is not a phone number'
      expect(
        await moderateMessage({
          message: phoneNumber,
          senderId,
          isVolunteer,
        })
      ).toBeTruthy()
    })

    test('Check correct email fails', async () => {
      const email = 'student1@upchieve.com'
      expect(
        await moderateMessage({ message: email, senderId, isVolunteer })
      ).toBeFalsy()
    })

    test('Check vulgar word fails', async () => {
      const word = '5hit'
      expect(
        await moderateMessage({ message: word, senderId, isVolunteer })
      ).toBeFalsy()
    })

    test('Check non-vulgar word succeeds', async () => {
      const word = 'hello'
      expect(
        await moderateMessage({ message: word, senderId, isVolunteer })
      ).toBeTruthy()
    })

    test('Check correct phone number fails', async () => {
      expect(
        await moderateMessage({
          message: badMessage,
          senderId,
          isVolunteer,
        })
      ).toBeFalsy()
    })
  })

  describe('AI moderation', () => {
    const mockedFeatureFlagService = mocked(FeatureFlagsService)
    const mockedCensoredSessionMessage = mocked(CensoredSessionMessage)
    let censoredSessionMessage: any

    beforeEach(() => {
      censoredSessionMessage = {
        id: '123',
        censoredBy: 'regex',
        sentAt: new Date(),
        senderId,
        sessionId,
        message: 'test-message',
      }
      mockedCensoredSessionMessage.createCensoredMessage.mockResolvedValue(
        censoredSessionMessage
      )
      ;(openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                appropriate: true,
                reasons: {
                  failures: {},
                },
                message: 'test-message',
              }),
            },
          },
        ],
      })
    })

    test('Check correct phone number fails when ai feature flag is off', async () => {
      mockedFeatureFlagService.getAiModerationFeatureFlag.mockResolvedValue(
        FeatureFlagsService.AI_MODERATION_STATE.disabled
      )
      const message =
        'a message including (555)555-5555 which is a phone number and hi@email.com and bye@email.com which are emails and some profanity: azz. finally a zoom link: https://us05web.zoom.us/j/0123456789'

      mockedCensoredSessionMessage.createCensoredMessage.mockResolvedValue({
        id: '123',
        censoredBy: 'regex',
        sentAt: new Date(),
        senderId,
        sessionId,
        message,
        shown: false,
      })

      expect(
        await moderateMessage({
          message,
          senderId,
          isVolunteer,
          sessionId,
        })
      ).toStrictEqual({
        failures: {
          email: ['hi@email.com', 'bye@email.com'],
          phone: [expect.stringContaining('(555)555-5555')],
          profanity: ['azz'],
          safety: ['zoom.us'],
        },
      })
    })

    test('Check correct phone number fails when ai feature flag is on and user is in target group', async () => {
      mockedFeatureFlagService.getAiModerationFeatureFlag.mockResolvedValue(
        FeatureFlagsService.AI_MODERATION_STATE.targeted
      )
      mockedCensoredSessionMessage.createCensoredMessage.mockResolvedValue({
        id: '123',
        censoredBy: 'regex',
        sentAt: new Date(),
        senderId,
        sessionId,
        message: badMessage,
        shown: false,
      })
      ;(openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                appropriate: false,
                reasons: {
                  phone: ['(555)555-5555'],
                },
              }),
            },
          },
        ],
      })

      expect(
        await moderateMessage({
          message: badMessage,
          senderId,
          isVolunteer,
          sessionId,
        })
      ).toStrictEqual({
        failures: { phone: [expect.stringContaining('(555)555-5555')] },
      })
    })

    test('Check message is clean when ai feature flag is on and user is in target group', async () => {
      mockedFeatureFlagService.getAiModerationFeatureFlag.mockResolvedValue(
        FeatureFlagsService.AI_MODERATION_STATE.targeted
      )
      const message = 'a message including nothing suspicious'

      mockedCensoredSessionMessage.createCensoredMessage.mockResolvedValue({
        id: '123',
        censoredBy: 'regex',
        sentAt: new Date(),
        senderId,
        sessionId,
        message,
        shown: false,
      })
      ;(openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                appropriate: true,
                reasons: [],
              }),
            },
          },
        ],
      })

      expect(
        await moderateMessage({
          message,
          senderId,
          isVolunteer,
          sessionId,
        })
      ).toStrictEqual({ failures: {} })
    })

    describe('createChatCompletion', () => {
      test('It calls OpenAI with the prompt from Langfuse', async () => {
        mockedFeatureFlagService.getAiModerationFeatureFlag.mockResolvedValue(
          FeatureFlagsService.AI_MODERATION_STATE.targeted
        )
        mockLangfuseService.getPrompt.mockResolvedValue({
          prompt: 'test-prompt-content',
          name: 'moderation-prompt',
          version: 1,
        } as any)
        await createChatCompletion({
          censoredSessionMessage,
          isVolunteer,
        })
        expect(openai.chat.completions.create).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: expect.arrayContaining([
              {
                role: 'system',
                content: 'test-prompt-content',
              },
            ]),
          })
        )
        expect(LangfuseService.getPrompt).toHaveBeenCalled()
        expect(LangfuseService.getClient).toHaveBeenCalled()
        expect(logger.info).toHaveBeenCalledWith(
          expect.objectContaining({
            decision: expect.objectContaining({
              promptUsed: 'moderation-prompt-1',
            }),
          }),
          'AI moderation result'
        )
      })

      test('It calls OpenAI with the fallback prompt if it cannot be retrieved from LF', async () => {
        mockedFeatureFlagService.getAiModerationFeatureFlag.mockResolvedValue(
          FeatureFlagsService.AI_MODERATION_STATE.targeted
        )
        mockLangfuseService.getPrompt.mockResolvedValue(undefined)

        await createChatCompletion({ censoredSessionMessage, isVolunteer })
        expect(openai.chat.completions.create).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: expect.arrayContaining([
              {
                role: 'system',
                content: FALLBACK_MODERATION_PROMPT,
              },
            ]),
          })
        )
        expect(LangfuseService.getPrompt).toHaveBeenCalled()
        expect(LangfuseService.getClient).toHaveBeenCalled()
        expect(logger.info).toHaveBeenCalledWith(
          expect.objectContaining({
            decision: expect.objectContaining({
              promptUsed: 'FALLBACK',
            }),
          }),
          'AI moderation result'
        )
      })

      it('Associates the Langfuse prompt with the generation', async () => {
        // If we are able to retrieve a prompt from LF, it should be attached to the generation
        // to associate generations and their corresponding prompts
        mockedFeatureFlagService.getAiModerationFeatureFlag.mockResolvedValue(
          FeatureFlagsService.AI_MODERATION_STATE.targeted
        )
        const langfusePromptObject = {
          prompt: 'test-prompt-content',
          name: 'moderation-prompt',
          version: 1,
        }
        mockLangfuseService.getPrompt.mockResolvedValue(
          langfusePromptObject as any
        )
        await createChatCompletion({
          censoredSessionMessage,
          isVolunteer,
        })
        expect(mockLangfuseClient.trace).toHaveBeenCalled()
        expect(mockTrace.generation).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'getModerationDecision',
            input: { censoredSessionMessage, isVolunteer },
            prompt: langfusePromptObject,
          })
        )
        expect(mockGeneration.end).toHaveBeenCalled()
      })

      it('Does NOT associate the generation with a LF prompt if none could be retrieved', async () => {
        mockedFeatureFlagService.getAiModerationFeatureFlag.mockResolvedValue(
          FeatureFlagsService.AI_MODERATION_STATE.targeted
        )
        mockLangfuseService.getPrompt.mockResolvedValue(undefined)
        await createChatCompletion({
          censoredSessionMessage,
          isVolunteer,
        })
        expect(mockLangfuseClient.trace).toHaveBeenCalled()
        expect(mockTrace.generation).toHaveBeenCalledWith({
          name: 'getModerationDecision',
          model: 'gpt-4o',
          input: { censoredSessionMessage, isVolunteer },
          // No prompt included in the LF generation
        })
        expect(mockGeneration.end).toHaveBeenCalled()
      })
    })
  })
})
