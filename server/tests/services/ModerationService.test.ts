import {
  getIndividualSessionMessageModerationResponse,
  FALLBACK_MODERATION_PROMPT,
  moderateMessage,
  filterDisallowedDomains,
  type ModeratedLink,
  getInfractionScore,
  handleModerationInfraction,
  getScoreForCategory,
  LiveMediaModerationCategories,
  getSessionFlagByModerationReason,
} from '../../services/ModerationService'
import { mocked } from 'jest-mock'
import * as FeatureFlagsService from '../../services/FeatureFlagService'
import * as SessionService from '../../services/SessionService'
import * as CensoredSessionMessage from '../../models/CensoredSessionMessage'
import { openai } from '../../services/BotsService'
import * as LangfuseService from '../../services/LangfuseService'
import { timeLimit } from '../../utils/time-limit'
import { buildModerationInfractionRow, buildSession } from '../mocks/generate'
import * as ModerationInfractionsRepo from '../../models/ModerationInfractions'
import * as SessionRepo from '../../models/Session'
import SocketService from '../../services/SocketService'
import { UserSessionFlags } from '../../constants'

jest.mock('../../models/Session')
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
jest.mock('../../models/ModerationInfractions')

jest.mock('../../services/SocketService', () => {
  return {
    getInstance: jest.fn(() => {
      emitModerationInfractionEvent: jest.fn()
    }),
  }
})
jest.mock('../../services/SessionService')

describe('ModerationService', () => {
  const isVolunteer = true
  const mockLangfuseService = mocked(LangfuseService)
  const mockModerationInfractionsRepo = mocked(ModerationInfractionsRepo)
  const mockSessionRepo = mocked(SessionRepo)
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

  const userType = 'volunteer'

  describe('Regex moderation', () => {
    test('Check incorrect email succeeds', async () => {
      const email = 'j.@serve1.proseware.com'
      expect(
        await moderateMessage({ message: email, senderId, userType })
      ).toBeTruthy()
    })

    test('Check incorrect phone number succeeds', async () => {
      const phoneNumber =
        'a message including 0.001193067% which is not a phone number'
      expect(
        await moderateMessage({
          message: phoneNumber,
          senderId,
          userType,
        })
      ).toBeTruthy()
    })

    test('Check correct email fails', async () => {
      const email = 'student1@upchieve.com'
      expect(
        await moderateMessage({ message: email, senderId, userType })
      ).toBeFalsy()
    })

    test('Check vulgar word fails', async () => {
      const word = '5hit'
      expect(
        await moderateMessage({ message: word, senderId, userType })
      ).toBeFalsy()
    })

    test('Check non-vulgar word succeeds', async () => {
      const word = 'hello'
      expect(
        await moderateMessage({ message: word, senderId, userType })
      ).toBeTruthy()
    })

    test('Check correct phone number fails', async () => {
      expect(
        await moderateMessage({
          message: badMessage,
          senderId,
          userType,
        })
      ).toBeFalsy()
    })
  })

  describe('AI moderation', () => {
    const mockedFeatureFlagService = mocked(FeatureFlagsService)
    const mockSessionService = mocked(SessionService)
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
          userType,
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
          userType,
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

      mockSessionService.getSessionTranscript.mockResolvedValue({
        sessionId,
        messages: [],
      })
      mockSessionRepo.getSessionById.mockResolvedValue(
        await buildSession({ studentId: senderId })
      )

      expect(
        await moderateMessage({
          message,
          senderId,
          userType,
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
        await getIndividualSessionMessageModerationResponse({
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
      })

      test('It calls OpenAI with the fallback prompt if it cannot be retrieved from LF', async () => {
        mockedFeatureFlagService.getAiModerationFeatureFlag.mockResolvedValue(
          FeatureFlagsService.AI_MODERATION_STATE.targeted
        )
        mockLangfuseService.getPrompt.mockResolvedValue(undefined)

        await getIndividualSessionMessageModerationResponse({
          censoredSessionMessage,
          isVolunteer,
        })
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
        await getIndividualSessionMessageModerationResponse({
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
        await getIndividualSessionMessageModerationResponse({
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
        userType,
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
          userType,
        })
        expect(result).toEqual(isClean)
      }
    )
  })

  describe('Moderation infractions', () => {
    const profanityReason = { failures: { profanity: [] } }
    const violenceReason = { failures: { violence: [] } }

    const buildModerationInfractionWithReason = (reason: any) => {
      return buildModerationInfractionRow('userId', 'sessionId', {
        reason: reason.failures,
      })
    }
    describe('getInfractionScore', () => {
      it.each([
        ['profanity', 1],
        ['high toxicity', 1],
        ['minor detected in image', 1],
        ['drugs & tobacco', 1],
        ['alcohol', 1],
        ['rude gestures', 1],
        ['gambling', 1],
        ['violence', 10],
        ['swimwear or underwear', 10],
        ['link', 10],
        ['email', 10],
        ['phone', 10],
        ['address', 10],
        ['explicit', 10],
        ['non-explicit nudity of intimate parts and kissing', 10],
        ['hate symbols', 10],
        ['visually disturbing', 10],
      ])(
        'Calculates the correct score for each category of infraction',
        (category, expectedScore) => {
          const moderationInfraction = buildModerationInfractionRow(
            'userId',
            'sessionId',
            {
              reason: {
                [category]: [],
              },
            }
          )
          expect(getInfractionScore([moderationInfraction])).toEqual(
            expectedScore
          )
        }
      )

      it('Correctly calculates score when there are multiple infractions', () => {
        const infractions = [
          buildModerationInfractionWithReason(profanityReason),
          buildModerationInfractionWithReason(profanityReason),
          buildModerationInfractionWithReason(violenceReason),
          buildModerationInfractionWithReason(violenceReason),
        ]
        expect(getInfractionScore(infractions)).toEqual(22)
      })
    })

    describe('handleModerationInfraction', () => {
      const userId = 'user-123'
      const sessionId = 'session-456'

      it('Writes an infraction if the source is screenshare', async () => {
        const mockSocketServiceInstance =
          SocketService.getInstance as jest.Mock<SocketService>
        mockSocketServiceInstance.mockImplementation(() => {
          return {
            getInstance: jest.fn(),
            emitModerationInfractionEvent: jest.fn(),
          } as unknown as SocketService
        })
        mockModerationInfractionsRepo.getModerationInfractionsByUser.mockResolvedValue(
          []
        )
        await handleModerationInfraction(
          userId,
          sessionId,
          profanityReason,
          'screenshare'
        )
        expect(
          mockModerationInfractionsRepo.insertModerationInfraction
        ).toHaveBeenCalledTimes(1)
        expect(
          mockModerationInfractionsRepo.insertModerationInfraction
        ).toHaveBeenCalledWith(
          {
            userId,
            sessionId,
            reason: profanityReason.failures,
          },
          expect.anything()
        )
        expect(
          mockModerationInfractionsRepo.getModerationInfractionsByUser
        ).toHaveBeenCalledWith(
          userId,
          {
            active: true,
          },
          expect.anything()
        )
      })

      it('Does not write an infraction if the source is image_upload', async () => {
        mockModerationInfractionsRepo.getModerationInfractionsByUser.mockResolvedValue(
          []
        )
        await handleModerationInfraction(
          userId,
          sessionId,
          profanityReason,
          'image_upload'
        )
        expect(
          mockModerationInfractionsRepo.insertModerationInfraction
        ).not.toHaveBeenCalled()
      })
    })

    describe('getScoreForCategory', () => {
      it.each([
        ['profanity', 1],
        ['PROfanity', 1],
        ['PROFANITY', 1],
        ['alcohol', 1],
        ['violence', 10],
        ['hate symbols', 10],
        ['some unknown thing that isnt in there', 10],
      ])(
        'Returns the correct score for each category',
        (
          category: string | LiveMediaModerationCategories,
          expectedScore: number
        ) => {
          const actualScore = getScoreForCategory(category)
          expect(actualScore).toEqual(expectedScore)
        }
      )
    })
  })

  describe('filterDisallowedDomains', () => {
    const allowedLinks: ModeratedLink[] = [
      { reason: 'Link', details: { text: 'khanacademy.org', confidence: 0.9 } },
      { reason: 'Link', details: { text: 'DeltaMath.com', confidence: 0.9 } },
      {
        reason: 'Link',
        details: { text: 'cdn.assess.prod.mheducation.com', confidence: 0.9 },
      },
      {
        reason: 'Link',
        details: { text: 'my.hrw.com/assignments/1234567890', confidence: 0.9 },
      },
      {
        reason: 'Link',
        details: {
          text: 'https://g.myascendmath.com/Ascend/postAssessment.htm',
          confidence: 0.9,
        },
      },
      {
        reason: 'Link',
        details: {
          text: 'stem.acceleratelearning.com/mathnation/edgexl/assignment/8cbd10b8-f24b-4e69-8223-7357ffc8eb12/ab3d63bc-e9a4-4918-8412-0ea8c275f1ac',
          confidence: 0.9,
        },
      },
    ]

    const disallowedLinks: ModeratedLink[] = [
      {
        reason: 'Link',
        details: { text: 'https://www.google.com', confidence: 0.9 },
      },
      {
        reason: 'Link',
        details: { text: 'facebook.com/user/123', confidence: 0.9 },
      },
      {
        reason: 'Link',
        details: { text: 'www.instagram.com', confidence: 0.9 },
      },
    ]

    const allowedDomains = [
      'khanacademy.org',
      'deltamath.com',
      'mheducation.com',
      'hrw.com',
      'myascendmath.com',
      'acceleratelearning.com',
    ]

    // all edu domains are allowed
    const anEduDomain: ModeratedLink = {
      reason: 'Link',
      details: { text: 'https://www.smell-u.edu', confidence: 0.9 },
    }

    test('Returns a list of disallowed links', () => {
      const links = [...allowedLinks, ...disallowedLinks, anEduDomain]

      const moderatedLinks = filterDisallowedDomains({
        allowedDomains,
        links,
      })

      expect(moderatedLinks).toStrictEqual(disallowedLinks)
      expect(moderatedLinks.length).toStrictEqual(disallowedLinks.length)
    })
  })

  describe('getSessionFlagByModerationReason', () => {
    it.each([
      [UserSessionFlags.pii, 'PII'],
      [UserSessionFlags.inappropriateConversation, 'INAPPROPRIATE_CONTENT'],
      [UserSessionFlags.platformCircumvention, 'PLATFORM_CIRCUMVENTION'],
      [UserSessionFlags.hateSpeech, 'HATE_SPEECH'],
      [UserSessionFlags.safetyConcern, 'SAFETY'],
      [UserSessionFlags.generalModerationIssue, 'anything else'],
      [UserSessionFlags.generalModerationIssue, ''],
    ])('Returns flag %s for reason %s', (expected, reason) => {
      expect(getSessionFlagByModerationReason(reason)).toEqual(expected)
    })
  })
})
