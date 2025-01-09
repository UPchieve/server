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
import { timeLimit } from '../../utils/time-limit'

jest.mock('../../utils/time-limit')
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
  const mockTimeLimit = jest.mocked(timeLimit)

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
      const mockAiDecision = {
        appropriate: false,
        reasons: {
          phone: ['(555)555-5555'],
        },
      }
      const mockAiResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify(mockAiDecision),
            },
          },
        ],
      }
      mockTimeLimit.mockResolvedValue(mockAiDecision)
      ;(openai.chat.completions.create as jest.Mock).mockResolvedValue(
        mockAiResponse
      )

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

  describe('Regex and AI moderation together', () => {
    it("Returns the regex moderation result if it can't get an AI moderation result in time", async () => {
      const message = '8608281234 is my phone number'
      const mockAiDecision = {
        appropriate: true,
        reasons: {
          failures: {},
        },
        message,
      }
      const mockAiResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify(mockAiDecision),
            },
          },
        ],
      }
      ;(openai.chat.completions.create as jest.Mock).mockResolvedValue(
        mockAiResponse
      )
      mockTimeLimit.mockResolvedValue(null)

      const result = await moderateMessage({
        message,
        senderId,
        isVolunteer,
        sessionId,
      })

      expect(result).toEqual({
        failures: {
          phone: ['8608281234 '],
        },
      })
    })
  })

  describe('moderateMessage - old clients', () => {
    it.each([
      ['clean message', true],
      ['shit', false],
    ])(
      'Returns a boolean if no sessionId is provided',
      async (message: string, isClean: boolean) => {
        const result = await moderateMessage({
          message,
          senderId: 'sender-123',
          isVolunteer: false,
        })
        expect(result).toEqual(isClean)
      }
    )
  })

  const piiEntities = {
    $metadata: {
      httpStatusCode: 200,
      requestId: '4ee63e38-ced3-4f87-86b8-1fddf51e73f5',
      attempts: 1,
      totalRetryDelay: 0,
    },
    Entities: [
      {
        BeginOffset: 21,
        EndOffset: 36,
        Score: 0.9999995827674866,
        Type: 'URL',
      },
      {
        BeginOffset: 37,
        EndOffset: 60,
        Score: 0.9998327493667603,
        Type: 'EMAIL',
      },
      {
        BeginOffset: 82,
        EndOffset: 97,
        Score: 0.9999995827674866,
        Type: 'URL',
      },
      {
        BeginOffset: 98,
        EndOffset: 121,
        Score: 0.9998478889465332,
        Type: 'EMAIL',
      },
    ],
  }
  // derived from piiEntities
  const links = ['http://butt.com']

  const labels = {
    $metadata: {
      httpStatusCode: 200,
      requestId: '10f0b9e1-2852-4e3d-9d46-323c50ff8a53',
      attempts: 1,
      totalRetryDelay: 0,
    },
    LabelModelVersion: '3.0',
    Labels: [
      {
        Aliases: [],
        Categories: [
          {
            Name: 'Person Description',
          },
        ],
        Confidence: 98.9871597290039,
        Instances: [
          {
            BoundingBox: {
              Height: 0.20247642695903778,
              Left: 0.03137316554784775,
              Top: 0.07425962388515472,
              Width: 0.21131867170333862,
            },
            Confidence: 98.9871597290039,
          },
        ],
        Name: 'Boy',
        Parents: [
          {
            Name: 'Male',
          },
          {
            Name: 'Person',
          },
        ],
      },
      {
        Aliases: [
          {
            Name: 'Kid',
          },
        ],
        Categories: [
          {
            Name: 'Person Description',
          },
        ],
        Confidence: 98.9871597290039,
        Instances: [
          {
            BoundingBox: {
              Height: 0.20247642695903778,
              Left: 0.03137316554784775,
              Top: 0.07425962388515472,
              Width: 0.21131867170333862,
            },
            Confidence: 98.9871597290039,
          },
        ],
        Name: 'Child',
        Parents: [
          {
            Name: 'Person',
          },
        ],
      },
    ],
  }

  const extractedText = {
    $metadata: {
      httpStatusCode: 200,
      requestId: '585e7786-b6e1-4de0-ab87-a80638481539',
      attempts: 1,
      totalRetryDelay: 0,
    },
    TextDetections: [
      {
        Confidence: 92.53329467773438,
        DetectedText: 'End Session',
        Geometry: {
          BoundingBox: {
            Height: 0.006504821591079235,
            Left: 0.3037109375,
            Top: 0.0027877807151526213,
            Width: 0.021484375,
          },
          Polygon: [
            {
              X: 0.3037109375,
              Y: 0.0027877807151526213,
            },
            {
              X: 0.3251953125,
              Y: 0.0027877807151526213,
            },
            {
              X: 0.3251953125,
              Y: 0.0092926025390625,
            },
            {
              X: 0.3037109375,
              Y: 0.0092926025390625,
            },
          ],
        },
        Id: 0,
        Type: 'LINE',
      },
      {
        Confidence: 57.26637268066406,
        DetectedText: 'butt.com',
        Geometry: {
          BoundingBox: {
            Height: 0.02837136946618557,
            Left: 0.05115199089050293,
            Top: 0.06123078987002373,
            Width: 0.06811285763978958,
          },
          Polygon: [
            {
              X: 0.05115199089050293,
              Y: 0.06781183183193207,
            },
            {
              X: 0.11685438454151154,
              Y: 0.06123078987002373,
            },
            {
              X: 0.11926484853029251,
              Y: 0.0830211192369461,
            },
            {
              X: 0.0535624660551548,
              Y: 0.08960215747356415,
            },
          ],
        },
        Id: 1,
        Type: 'LINE',
      },
      {
        Confidence: 97.49494171142578,
        DetectedText: 'http://butt.com',
        Geometry: {
          BoundingBox: {
            Height: 0.00836334191262722,
            Left: 0.0927734375,
            Top: 0.09106750786304474,
            Width: 0.048828125,
          },
          Polygon: [
            {
              X: 0.0927734375,
              Y: 0.09106750786304474,
            },
            {
              X: 0.1416015625,
              Y: 0.09106750786304474,
            },
            {
              X: 0.1416015625,
              Y: 0.09943084418773651,
            },
            {
              X: 0.0927734375,
              Y: 0.09943084418773651,
            },
          ],
        },
        Id: 2,
        Type: 'LINE',
      },
      {
        Confidence: 74.76219177246094,
        DetectedText: 'sammy.nave@upchieve.org',
        Geometry: {
          BoundingBox: {
            Height: 0.01022186316549778,
            Left: 0.1337890625,
            Top: 0.12452087551355362,
            Width: 0.095703125,
          },
          Polygon: [
            {
              X: 0.1337890625,
              Y: 0.12452087551355362,
            },
            {
              X: 0.2294921875,
              Y: 0.12452087551355362,
            },
            {
              X: 0.2294921875,
              Y: 0.13474273681640625,
            },
            {
              X: 0.1337890625,
              Y: 0.13474273681640625,
            },
          ],
        },
        Id: 3,
        Type: 'LINE',
      },
      {
        Confidence: 92.53329467773438,
        DetectedText: 'End Session',
        Geometry: {
          BoundingBox: {
            Height: 0.006504821591079235,
            Left: 0.3037109375,
            Top: 0.0027877807151526213,
            Width: 0.021484375,
          },
          Polygon: [
            {
              X: 0.3037109375,
              Y: 0.0027877807151526213,
            },
            {
              X: 0.3251953125,
              Y: 0.0027877807151526213,
            },
            {
              X: 0.3251953125,
              Y: 0.0092926025390625,
            },
            {
              X: 0.3037109375,
              Y: 0.0092926025390625,
            },
          ],
        },
        Id: 4,
        ParentId: 0,
        Type: 'WORD',
      },
      {
        Confidence: 57.26637268066406,
        DetectedText: 'butt.com',
        Geometry: {
          BoundingBox: {
            Height: 0.02837136946618557,
            Left: 0.05115199089050293,
            Top: 0.06123078987002373,
            Width: 0.06811285763978958,
          },
          Polygon: [
            {
              X: 0.05115199089050293,
              Y: 0.06781183183193207,
            },
            {
              X: 0.11685438454151154,
              Y: 0.06123078987002373,
            },
            {
              X: 0.11926484853029251,
              Y: 0.0830211192369461,
            },
            {
              X: 0.0535624660551548,
              Y: 0.08960215747356415,
            },
          ],
        },
        Id: 5,
        ParentId: 1,
        Type: 'WORD',
      },
      {
        Confidence: 97.49494171142578,
        DetectedText: 'http://butt.com',
        Geometry: {
          BoundingBox: {
            Height: 0.00836334191262722,
            Left: 0.0927734375,
            Top: 0.09106750786304474,
            Width: 0.048828125,
          },
          Polygon: [
            {
              X: 0.0927734375,
              Y: 0.09106750786304474,
            },
            {
              X: 0.1416015625,
              Y: 0.09106750786304474,
            },
            {
              X: 0.1416015625,
              Y: 0.09943084418773651,
            },
            {
              X: 0.0927734375,
              Y: 0.09943084418773651,
            },
          ],
        },
        Id: 6,
        ParentId: 2,
        Type: 'WORD',
      },
      {
        Confidence: 74.76219177246094,
        DetectedText: 'sammy.nave@upchieve.org',
        Geometry: {
          BoundingBox: {
            Height: 0.01022186316549778,
            Left: 0.1337890625,
            Top: 0.12452087551355362,
            Width: 0.095703125,
          },
          Polygon: [
            {
              X: 0.1337890625,
              Y: 0.12452087551355362,
            },
            {
              X: 0.2294921875,
              Y: 0.12452087551355362,
            },
            {
              X: 0.2294921875,
              Y: 0.13474273681640625,
            },
            {
              X: 0.1337890625,
              Y: 0.13474273681640625,
            },
          ],
        },
        Id: 7,
        ParentId: 3,
        Type: 'WORD',
      },
    ],
    TextModelVersion: '3.0',
  }
  // derived from extractedText
  const concatenatedText =
    'End Session butt.com http://butt.com sammy.nave@upchieve.org End Session butt.com http://butt.com sammy.nave@upchieve.org'

  const moderationLabels = {
    $metadata: {
      httpStatusCode: 200,
      requestId: 'a680b1ed-7f4b-4353-be80-6e3427430bd0',
      attempts: 1,
      totalRetryDelay: 0,
    },
    ContentTypes: [],
    ModerationLabels: [
      {
        Confidence: 99.86129760742188,
        Name: 'Weapons',
        ParentName: 'Violence',
        TaxonomyLevel: 2,
      },
      {
        Confidence: 99.86129760742188,
        Name: 'Violence',
        ParentName: '',
        TaxonomyLevel: 1,
      },
    ],
    ModerationModelVersion: '7.0',
  }

  describe('moderateVideoFrame', () => {})
})
