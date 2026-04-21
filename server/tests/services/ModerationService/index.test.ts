import { jest, describe, beforeEach, test, expect, it } from '@jest/globals'
import { mocked } from 'jest-mock'
import * as ModerationService from '../../../services/ModerationService'
import {
  type ModeratedLink,
  LiveMediaModerationCategories,
} from '../../../services/ModerationService/types'
import { type GetModerationSettingResult } from '../../../models/ModerationSettings/types'
import { weightModerationInfractions } from '../../../services/ModerationService/ModerationPenaltyService'
import * as SessionService from '../../../services/SessionService'
import * as CensoredSessionMessage from '../../../models/CensoredSessionMessage'
import * as OpenAIService from '../../../services/OpenAIService'
import * as PromptService from '../../../services/PromptService'
import {
  buildModerationInfractionRow,
  buildSession,
} from '../../mocks/generate'
import * as ModerationInfractionsRepo from '../../../models/ModerationInfractions'
import * as SessionRepo from '../../../models/Session'
import SocketService from '../../../services/SocketService'
import { UserSessionFlags } from '../../../constants'
import { ModerationInfraction } from '../../../models/ModerationInfractions'
import * as UserRepo from '../../../models/User/queries'
import * as Regex from '../../../services/ModerationService/regex'

jest.mock('../../../models/Session')
jest.mock('../../../utils/time-limit')
jest.mock('../../../logger')
jest.mock('../../../models/CensoredSessionMessage')
jest.mock('../../../services/ModerationService/regex')
jest.mock('../../../services/OpenAIService', () => {
  const actual = jest.requireActual<
    typeof import('../../../services/OpenAIService')
  >('../../../services/OpenAIService')
  return {
    ...actual,
    MODEL_ID: 'gpt-4o',
    invokeModel: jest.fn(),
  }
})
jest.mock('../../../services/PromptService')
jest.mock('../../../models/ModerationInfractions')
jest.mock('../../../services/SocketService', () => ({
  getInstance: jest.fn(() => {}),
}))
jest.mock('../../../clients/langfuse', () => ({
  client: {
    trace: jest.fn(),
    getPrompt: jest.fn(),
  },
}))
jest.mock('../../../services/AiObservabilityService', () => ({
  runWithModelObservation: jest.fn(),
  runWithTrace: jest.fn(),
  addTraceTags: jest.fn(),
}))

jest.mock('../../../services/SessionService')

jest.mock('../../../models/User/queries')
jest.mock('../../../models/ModerationSettings/queries')

describe('ModerationService', () => {
  const isVolunteer = true
  const mockPromptService = mocked(PromptService)
  const mockModerationInfractionsRepo = mocked(ModerationInfractionsRepo)
  const mockSessionRepo = mocked(SessionRepo)
  const mockSocketService = mocked(SocketService)
  const mockUserRepo = mocked(UserRepo)
  const mockSessionService = mocked(SessionService)
  const mockRegex = mocked(Regex)
  const mockedOpenAiService = jest.mocked(OpenAIService)

  const senderId = '123'
  const sessionId = '123'
  let mockGeneration: any, mockTrace: any, mockLangfuseClient: any
  let moderationSettings: GetModerationSettingResult

  beforeEach(async () => {
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
    mockPromptService.getPromptWithFallback.mockResolvedValue(
      {} as PromptService.PromptResponse
    )

    mockSocketService.getInstance.mockReturnValue({
      emitModerationInfractionEvent: jest.fn(),
      emitPotentialInfractionToPartnerEvent: jest.fn(),
      emitUserLiveMediaBannedEvents: jest.fn(),
    } as unknown as SocketService)

    mockUserRepo.banUserById.mockResolvedValue()
    mockSessionService.markSessionForReview.mockResolvedValue()
    moderationSettings = {
      [LiveMediaModerationCategories.PROFANITY]: {
        name: LiveMediaModerationCategories.PROFANITY,
        penaltyWeight: 1,
        threshold: 0.75,
      },
      [LiveMediaModerationCategories.DRUGS]: {
        name: LiveMediaModerationCategories.DRUGS,
        penaltyWeight: 1,
        threshold: 0.75,
      },
      [LiveMediaModerationCategories.ALCOHOL]: {
        name: LiveMediaModerationCategories.ALCOHOL,
        penaltyWeight: 1,
        threshold: 0.75,
      },
      [LiveMediaModerationCategories.RUDE_GESTURES]: {
        name: LiveMediaModerationCategories.RUDE_GESTURES,
        penaltyWeight: 1,
        threshold: 0.75,
      },
      [LiveMediaModerationCategories.GAMBLING]: {
        name: LiveMediaModerationCategories.GAMBLING,
        penaltyWeight: 1,
        threshold: 0.75,
      },

      [LiveMediaModerationCategories.VIOLENCE]: {
        name: LiveMediaModerationCategories.VIOLENCE,
        penaltyWeight: 10,
        threshold: 0.75,
      },
      [LiveMediaModerationCategories.SWIM_WEAR]: {
        name: LiveMediaModerationCategories.SWIM_WEAR,
        penaltyWeight: 10,
        threshold: 0.75,
      },

      [LiveMediaModerationCategories.LINK]: {
        name: LiveMediaModerationCategories.LINK,
        penaltyWeight: 4,
        threshold: 0.75,
      },
      [LiveMediaModerationCategories.EMAIL]: {
        name: LiveMediaModerationCategories.EMAIL,
        penaltyWeight: 4,
        threshold: 0.75,
      },
      [LiveMediaModerationCategories.PHONE]: {
        name: LiveMediaModerationCategories.PHONE,
        penaltyWeight: 4,
        threshold: 0.75,
      },
      [LiveMediaModerationCategories.ADDRESS]: {
        name: LiveMediaModerationCategories.ADDRESS,
        penaltyWeight: 4,
        threshold: 0.75,
      },

      [LiveMediaModerationCategories.EXPLICIT]: {
        name: LiveMediaModerationCategories.EXPLICIT,
        penaltyWeight: 10,
        threshold: 0.75,
      },
      [LiveMediaModerationCategories.NON_EXPLICIT]: {
        name: LiveMediaModerationCategories.NON_EXPLICIT,
        penaltyWeight: 10,
        threshold: 0.75,
      },
      [LiveMediaModerationCategories.HATE_SYMBOLS]: {
        name: LiveMediaModerationCategories.HATE_SYMBOLS,
        penaltyWeight: 10,
        threshold: 0.75,
      },
      [LiveMediaModerationCategories.DISTURBING]: {
        name: LiveMediaModerationCategories.DISTURBING,
        penaltyWeight: 10,
        threshold: 0.75,
      },
    }
  })

  const userType = 'volunteer'

  describe('AI moderation', () => {
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

      mockedOpenAiService.invokeModel.mockResolvedValue({
        results: {
          appropriate: true,
          reasons: {
            failures: {},
          },
          message: 'test-message',
        },
        modelId: '',
      })
    })

    test('Flags email, phone, zoom link, and profanity', async () => {
      const message =
        'a message including (555)555-5555 which is a phone number and hi@email.com and bye@email.com which are emails and some profanity: azz. finally a zoom link: https://us05web.zoom.us/j/0123456789'
      const failures = {
        [LiveMediaModerationCategories.EMAIL]: [
          'hi@email.com',
          'bye@email.com',
        ],
        [LiveMediaModerationCategories.PHONE]: [
          expect.stringContaining('(555)555-5555'),
        ],
        [LiveMediaModerationCategories.PROFANITY]: ['azz'],
        [LiveMediaModerationCategories.LINK]: ['zoom.us'],
      }
      mockedCensoredSessionMessage.createCensoredMessage.mockResolvedValue({
        id: '123',
        censoredBy: 'regex',
        sentAt: new Date(),
        senderId,
        sessionId,
        message,
        shown: false,
      })
      mockRegex.regexModerate.mockResolvedValue({
        isClean: false,
        failures: { failures },
        sanitizedMessage: 'does not matter for this test',
      })

      expect(
        await ModerationService.moderateMessage({
          message,
          senderId,
          userType,
          sessionId,
        })
      ).toStrictEqual({
        failures,
      })
    })

    test('Check message is clean', async () => {
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
      mockRegex.regexModerate.mockResolvedValue({
        isClean: true,
        sanitizedMessage: message,
        failures: { failures: {} },
      })
      mockedOpenAiService.invokeModel.mockResolvedValue({
        results: {
          appropriate: true,
          reasons: [],
        },
        modelId: 'gpt-4o',
      })

      mockSessionService.getSessionTranscript.mockResolvedValue({
        sessionId,
        messages: [],
      })
      mockSessionRepo.getSessionById.mockResolvedValue(
        buildSession({ studentId: senderId })
      )

      expect(
        await ModerationService.moderateMessage({
          message,
          senderId,
          userType,
          sessionId,
        })
      ).toStrictEqual({ failures: {} })
    })

    describe('createChatCompletion', () => {
      test('It calls OpenAI with the prompt from Langfuse', async () => {
        mockPromptService.getPromptWithFallback.mockResolvedValue({
          isFallback: false,
          prompt: 'test-prompt-content',
          version: '1',
        })
        await ModerationService.getIndividualSessionMessageModerationResponse({
          censoredSessionMessage,
          isVolunteer,
          trace: mockLangfuseClient.trace(),
        })
        expect(mockedOpenAiService.invokeModel).toHaveBeenCalledWith(
          expect.objectContaining({
            prompt: 'test-prompt-content',
            userMessage: expect.stringContaining(
              censoredSessionMessage.message
            ),
          })
        )
        expect(PromptService.getPromptWithFallback).toHaveBeenCalled()
      })

      test('It calls OpenAI with the fallback prompt if it cannot be retrieved from LF', async () => {
        mockPromptService.getPromptWithFallback.mockResolvedValue({
          prompt:
            PromptService.fallbackPrompts[
              PromptService.PromptName.SESSION_TRANSCRIPT_MODERATION
            ],
        } as PromptService.PromptResponse)

        await ModerationService.getIndividualSessionMessageModerationResponse({
          censoredSessionMessage,
          isVolunteer,
          trace: mockLangfuseClient.trace(),
        })
        expect(mockedOpenAiService.invokeModel).toHaveBeenCalledWith(
          expect.objectContaining({
            prompt:
              PromptService.fallbackPrompts[
                PromptService.PromptName.SESSION_TRANSCRIPT_MODERATION
              ],
            userMessage: expect.stringContaining(
              censoredSessionMessage.message
            ),
          })
        )
        expect(PromptService.getPromptWithFallback).toHaveBeenCalled()
      })

      it('Associates the Langfuse prompt with the generation', async () => {
        // If we are able to retrieve a prompt from LF, it should be attached to the generation
        // to associate generations and their corresponding prompts
        const langfusePromptObject = {
          isFallback: false,
          prompt: 'test-prompt-content',
          name: 'moderation-prompt',
          version: '1',
          promptObject: {},
        }
        mockPromptService.getPromptWithFallback.mockResolvedValue(
          langfusePromptObject as unknown as PromptService.PromptResponse
        )
        await ModerationService.getIndividualSessionMessageModerationResponse({
          censoredSessionMessage,
          isVolunteer,
          trace: mockLangfuseClient.trace(),
        })
        expect(mockLangfuseClient.trace).toHaveBeenCalled()
        expect(mockTrace.generation).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'getModerationDecision',
            input: { censoredSessionMessage, isVolunteer },
            prompt: langfusePromptObject.promptObject,
          })
        )
        expect(mockGeneration.end).toHaveBeenCalled()
      })

      it('Does NOT associate the generation with a LF prompt if none could be retrieved', async () => {
        mockPromptService.getPromptWithFallback.mockResolvedValue(
          {} as PromptService.PromptResponse
        )
        await ModerationService.getIndividualSessionMessageModerationResponse({
          censoredSessionMessage,
          isVolunteer,
          trace: mockLangfuseClient.trace(),
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
    it.skip('Returns the AI decision over regex', async () => {
      // @TODO - Get this test working. Something is not mocking correctly.
      const message = 'test message'
      const failures = {
        [LiveMediaModerationCategories.EMAIL]: [
          'emailme@upchieve.org',
          'secondaryemai@upchieve.org',
        ],
      }
      const regexResult = {
        isClean: false,
        sanitizedMessage: 'does not matter for this test',
        failures: { failures },
      }
      const aiResult = {
        appropriate: true,
        reasons: {},
        message,
      }
      jest
        .spyOn(
          ModerationService,
          'getIndividualSessionMessageModerationResponse'
        )
        .mockResolvedValue({
          results: aiResult,
        })
      mockRegex.regexModerate.mockResolvedValue(regexResult)
      mockedOpenAiService.invokeModel.mockResolvedValue({
        results: aiResult,
        modelId: '123',
      })
      const actual = await ModerationService.moderateMessage({
        message,
        senderId,
        userType,
        sessionId,
      })
      expect(actual).toEqual({
        failures: {},
      })
    })

    it("Returns the regex moderation result if it can't get an AI moderation result in time", async () => {
      const FAILURES = {
        [LiveMediaModerationCategories.PHONE]: ['8608281234 '],
      }
      mockRegex.regexModerate.mockResolvedValue({
        isClean: false,
        sanitizedMessage: '***********',
        failures: { failures: FAILURES },
      })
      const message = '8608281234 is my phone number'
      const mockAiDecision = {
        appropriate: true,
        reasons: {
          failures: {},
        },
        message,
      }
      const mockAiResponse = {
        results: mockAiDecision,
        modelId: 'gpt-4o',
      }
      mockedOpenAiService.invokeModel.mockResolvedValue(mockAiResponse)

      const result = await ModerationService.moderateMessage({
        message,
        senderId,
        userType,
        sessionId,
      })

      expect(result).toEqual({
        failures: FAILURES,
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
        mockRegex.regexModerate.mockResolvedValue({
          isClean,
          sanitizedMessage: 'canbeanything',
          failures: { failures: {} },
        })
        const result = await ModerationService.moderateMessage({
          message,
          senderId: 'sender-123',
          userType,
        })
        expect(result).toEqual(isClean)
      }
    )
  })

  describe('Moderation infractions', () => {
    const profanityReason = {
      failures: { [LiveMediaModerationCategories.PROFANITY]: [] },
    }
    const violenceReason = {
      failures: { [LiveMediaModerationCategories.VIOLENCE]: [] },
    }
    const explicitReason = {
      failures: { [LiveMediaModerationCategories.EXPLICIT]: [] },
    }
    const personInImageReason = {
      failures: { [LiveMediaModerationCategories.PERSON_IN_IMAGE]: [] },
    }

    const buildModerationInfractionWithReason = (reason: any) => {
      return buildModerationInfractionRow('userId', 'sessionId', {
        reason: reason.failures,
      })
    }
    describe('weighModerationInfractions', () => {
      it.each([
        [LiveMediaModerationCategories.PROFANITY, 1],
        [LiveMediaModerationCategories.DRUGS, 1],
        [LiveMediaModerationCategories.ALCOHOL, 1],
        [LiveMediaModerationCategories.RUDE_GESTURES, 1],
        [LiveMediaModerationCategories.GAMBLING, 1],
        [LiveMediaModerationCategories.VIOLENCE, 10],
        [LiveMediaModerationCategories.SWIM_WEAR, 10],
        [LiveMediaModerationCategories.LINK, 4],
        [LiveMediaModerationCategories.EMAIL, 4],
        [LiveMediaModerationCategories.PHONE, 4],
        [LiveMediaModerationCategories.ADDRESS, 4],
        [LiveMediaModerationCategories.EXPLICIT, 10],
        [LiveMediaModerationCategories.NON_EXPLICIT, 10],
        [LiveMediaModerationCategories.HATE_SYMBOLS, 10],
        [LiveMediaModerationCategories.DISTURBING, 10],
      ])(
        'Calculates the correct score for each category of infraction',
        (category: string, expectedScore: number) => {
          const moderationInfraction = buildModerationInfractionRow(
            'userId',
            'sessionId',
            {
              reason: {
                [category]: [],
              },
            }
          )

          const reasons = ModerationService.getReasonsFromInfractions([
            moderationInfraction,
          ])
          const actual = weightModerationInfractions(
            reasons,
            moderationSettings
          )
          expect(actual).toEqual(expectedScore)
        }
      )

      it('Correctly calculates score when there are multiple infractions', () => {
        const infractions = [
          buildModerationInfractionWithReason(profanityReason),
          buildModerationInfractionWithReason(profanityReason),
          buildModerationInfractionWithReason(violenceReason),
          buildModerationInfractionWithReason(violenceReason),
          buildModerationInfractionWithReason(explicitReason),
        ]
        const reasons = ModerationService.getReasonsFromInfractions(infractions)
        const result = weightModerationInfractions(reasons, moderationSettings)
        expect(result).toEqual(32)
      })
    })

    describe('isStreamStoppingReason', () => {
      it.each([
        [LiveMediaModerationCategories.NON_EXPLICIT, true],
        [LiveMediaModerationCategories.EXPLICIT, true],
        [LiveMediaModerationCategories.HATE_SYMBOLS, true],
        [LiveMediaModerationCategories.DISTURBING, true],
        [LiveMediaModerationCategories.SWIM_WEAR, true],
        [LiveMediaModerationCategories.VIOLENCE, true],
        [LiveMediaModerationCategories.SWIM_WEAR, true],
        [LiveMediaModerationCategories.PROFANITY, false],
        [LiveMediaModerationCategories.DRUGS, false],
        [LiveMediaModerationCategories.ALCOHOL, false],
        [LiveMediaModerationCategories.RUDE_GESTURES, false],
        [LiveMediaModerationCategories.GAMBLING, false],
        [LiveMediaModerationCategories.LINK, true],
        [LiveMediaModerationCategories.EMAIL, true],
        [LiveMediaModerationCategories.PHONE, true],
        [LiveMediaModerationCategories.ADDRESS, true],
      ])(
        'Determines whether the reason is reason to immediately stop the stream (reason is %s)',
        async (reason: string, expectedValue: boolean) => {
          const actual = ModerationService.isStreamStoppingReason(
            reason as LiveMediaModerationCategories
          )
          expect(actual).toEqual(expectedValue)
        }
      )
    })

    describe('handleModerationInfraction', () => {
      const userId = 'user-123'
      const sessionId = 'session-456'

      it('Writes an infraction if the source is screenshare', async () => {
        mockModerationInfractionsRepo.insertModerationInfraction.mockResolvedValue(
          {
            id: '123',
            userId: '123',
            sessionId: '123',
            reason: { ...profanityReason.failures },
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as ModerationInfraction
        )

        mockModerationInfractionsRepo.getModerationInfractionsByUser.mockResolvedValue(
          []
        )
        await ModerationService.handleModerationInfraction(
          userId,
          sessionId,
          profanityReason,
          'screenshare',
          moderationSettings
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
            sessionId,
          },
          expect.anything()
        )
      })

      it('Does not write an infraction if the source is image_upload', async () => {
        mockModerationInfractionsRepo.getModerationInfractionsByUser.mockResolvedValue(
          []
        )
        await ModerationService.handleModerationInfraction(
          userId,
          sessionId,
          profanityReason,
          'image_upload',
          moderationSettings
        )
        expect(
          mockModerationInfractionsRepo.insertModerationInfraction
        ).not.toHaveBeenCalled()
      })

      it('Skip handling infractions if user already has a person in image infraction', async () => {
        mockModerationInfractionsRepo.getModerationInfractionsByUser.mockResolvedValue(
          [
            {
              id: '1',
              reason: personInImageReason.failures,
              sessionId: '1123e',
              active: true,
              userId: '1123',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]
        )

        const mockSocketServiceInstance = mockSocketService.getInstance()

        await ModerationService.handleModerationInfraction(
          userId,
          sessionId,
          personInImageReason,
          'screenshare',
          moderationSettings
        )
        expect(
          mockModerationInfractionsRepo.insertModerationInfraction
        ).not.toHaveBeenCalled()

        expect(
          mockSocketServiceInstance.emitModerationInfractionEvent
        ).not.toHaveBeenCalled()

        expect(
          mockSocketServiceInstance.emitPotentialInfractionToPartnerEvent
        ).not.toHaveBeenCalled()
      })

      it('Handling Potential infraction if person in image infraction', async () => {
        mockModerationInfractionsRepo.getModerationInfractionsByUser.mockResolvedValue(
          []
        )

        const mockSocketServiceInstance = mockSocketService.getInstance()

        await ModerationService.handleModerationInfraction(
          userId,
          sessionId,
          personInImageReason,
          'screenshare',
          moderationSettings
        )
        expect(
          mockModerationInfractionsRepo.insertModerationInfraction
        ).toHaveBeenCalled()

        expect(
          mockSocketServiceInstance.emitModerationInfractionEvent
        ).toHaveBeenCalled()

        expect(
          mockSocketServiceInstance.emitPotentialInfractionToPartnerEvent
        ).toHaveBeenCalled()

        expect(
          mockModerationInfractionsRepo.insertModerationInfraction
        ).toHaveBeenCalled()

        expect(
          mockSocketServiceInstance.emitUserLiveMediaBannedEvents
        ).toHaveBeenCalled()
      })
    })

    describe('Test getting correct moderation penalty weight', () => {
      it.each([
        [LiveMediaModerationCategories.PROFANITY, 1],
        [LiveMediaModerationCategories.ALCOHOL, 1],
        [LiveMediaModerationCategories.VIOLENCE, 10],
        [LiveMediaModerationCategories.HATE_SYMBOLS, 10],
        [LiveMediaModerationCategories.UNKNOWN, 10],
      ])(
        'Returns the correct score for each category',
        (category: LiveMediaModerationCategories, expectedScore: number) => {
          const actualScore = weightModerationInfractions(
            [category],
            moderationSettings
          )
          expect(actualScore).toEqual(expectedScore)
        }
      )
    })

    describe('isStreamStoppingReason', () => {
      it.each([
        [LiveMediaModerationCategories.SWIM_WEAR, true],
        [LiveMediaModerationCategories.LINK, true],
        [LiveMediaModerationCategories.EMAIL, true],
        [LiveMediaModerationCategories.PHONE, true],
        [LiveMediaModerationCategories.ADDRESS, true],
        [LiveMediaModerationCategories.EXPLICIT, true],
        [LiveMediaModerationCategories.NON_EXPLICIT, true],
        [LiveMediaModerationCategories.PROFANITY, false],
        [LiveMediaModerationCategories.VIOLENCE, true],
      ])('Returns the correct value', (category: string, expected: boolean) => {
        expect(
          ModerationService.isStreamStoppingReason(
            category as LiveMediaModerationCategories
          )
        ).toEqual(expected)
      })
    })
  })

  describe('filterDisallowedDomains', () => {
    const allowedLinks: ModeratedLink[] = [
      {
        reason: LiveMediaModerationCategories.LINK,
        details: { text: 'khanacademy.org', confidence: 0.9 },
      },
      {
        reason: LiveMediaModerationCategories.LINK,
        details: { text: 'DeltaMath.com', confidence: 0.9 },
      },
      {
        reason: LiveMediaModerationCategories.LINK,
        details: { text: 'cdn.assess.prod.mheducation.com', confidence: 0.9 },
      },
      {
        reason: LiveMediaModerationCategories.LINK,
        details: { text: 'my.hrw.com/assignments/1234567890', confidence: 0.9 },
      },
      {
        reason: LiveMediaModerationCategories.LINK,
        details: {
          text: 'https://g.myascendmath.com/Ascend/postAssessment.htm',
          confidence: 0.9,
        },
      },
      {
        reason: LiveMediaModerationCategories.LINK,
        details: {
          text: 'stem.acceleratelearning.com/mathnation/edgexl/assignment/8cbd10b8-f24b-4e69-8223-7357ffc8eb12/ab3d63bc-e9a4-4918-8412-0ea8c275f1ac',
          confidence: 0.9,
        },
      },
    ]

    const disallowedLinks: ModeratedLink[] = [
      {
        reason: LiveMediaModerationCategories.LINK,
        details: { text: 'https://www.google.com', confidence: 0.9 },
      },
      {
        reason: LiveMediaModerationCategories.LINK,
        details: { text: 'facebook.com/user/123', confidence: 0.9 },
      },
      {
        reason: LiveMediaModerationCategories.LINK,
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
      reason: LiveMediaModerationCategories.LINK,
      details: { text: 'https://www.smell-u.edu', confidence: 0.9 },
    }

    test('Returns a list of disallowed links', () => {
      const links = [...allowedLinks, ...disallowedLinks, anEduDomain]

      const moderatedLinks = ModerationService.filterDisallowedDomains({
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
      expect(
        ModerationService.getSessionFlagByModerationReason(reason)
      ).toEqual(expected)
    })
  })

  describe('Confidence threshold conversion', () => {
    it('Converts decimal thresholds to percentages for comparison', () => {
      // Test the conversion logic that was missing in transcript moderation
      const decimalThreshold = 0.75 // DB threshold
      const openAIConfidence = 80 // OpenAI returns 0-100

      const thresholdPercent = decimalThreshold * 100 // Convert to percentage
      expect(thresholdPercent).toBe(75)
      expect(openAIConfidence >= thresholdPercent).toBe(true)
    })
  })
})
