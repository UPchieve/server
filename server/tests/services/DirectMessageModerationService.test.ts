import { mocked } from 'jest-mock'
import { LangfuseTraceClient } from 'langfuse-core'
import { getUuid } from '../../models/pgUtils'
import * as DirectMessageModerationService from '../../services/DirectMessageModerationService'
import * as ModerationService from '../../services/ModerationService'
import * as Regex from '../../services/ModerationService/regex'
import * as DirectMessageModerationRepo from '../../models/DirectMessageModeration/queries'
import { client as langfuseClient } from '../../clients/langfuse'
import type { DirectMessageModerationContext } from '../../types/direct-message-moderation'
import {
  buildDirectMessage,
  buildDirectMessageModerationContext,
  buildRegexModerationResult,
} from '../mocks/generate'

jest.mock('../../services/ModerationService')
jest.mock('../../services/ModerationService/regex')
jest.mock('../../models/DirectMessageModeration/queries')
jest.mock('../../clients/langfuse', () => ({ client: { trace: jest.fn() } }))

const mockedModerationService = mocked(ModerationService)
const mockedRegex = mocked(Regex)
const mockedDirectMessageModerationRepo = mocked(DirectMessageModerationRepo)
const mockedLangfuseClient = mocked(langfuseClient)

let context: DirectMessageModerationContext

beforeEach(() => {
  jest.resetAllMocks()
  context = buildDirectMessageModerationContext()
  mockedLangfuseClient.trace.mockReturnValue(
    new LangfuseTraceClient(langfuseClient, getUuid())
  )
  mockedRegex.regexModerate.mockResolvedValue(buildRegexModerationResult())
  mockedDirectMessageModerationRepo.getRecentMessages.mockResolvedValue([])
  mockedModerationService.moderateTranscript.mockResolvedValue([])
})

afterEach(() => {
  jest.useRealTimers()
})

describe('moderateMessage', () => {
  describe('when regex matches', () => {
    beforeEach(() => {
      mockedRegex.regexModerate.mockResolvedValue(
        buildRegexModerationResult({
          isClean: false,
          failures: { failures: { EMAIL: ['email'] } },
        })
      )
    })

    test('allows the message when AI overrides the regex result', async () => {
      mockedModerationService.getAiModerationResult.mockResolvedValue({
        results: { appropriate: true, reasons: {}, message: context.message },
      })
      const result = await DirectMessageModerationService.moderateMessage({
        ...context,
        senderId: context.volunteerId,
      })
      expect(result).toEqual({
        blocked: false,
        censoredBy: 'regex',
        reasons: ['EMAIL'],
      })
      expect(
        mockedModerationService.getAiModerationResult
      ).toHaveBeenCalledWith(
        { message: context.message },
        true,
        expect.anything()
      )
      expect(
        mockedDirectMessageModerationRepo.getRecentMessages
      ).not.toHaveBeenCalled()
    })

    test('keeps the regex rejection when AI is unavailable', async () => {
      mockedModerationService.getAiModerationResult.mockResolvedValue(null)
      const result =
        await DirectMessageModerationService.moderateMessage(context)
      expect(result).toEqual({
        blocked: true,
        censoredBy: 'regex',
        reasons: ['EMAIL'],
      })
    })

    test('uses the AI reasons when AI confirms the rejection', async () => {
      mockedModerationService.getAiModerationResult.mockResolvedValue({
        results: {
          appropriate: false,
          reasons: { PII: [] },
          message: context.message,
        },
      })
      const result =
        await DirectMessageModerationService.moderateMessage(context)
      expect(result).toEqual({
        blocked: true,
        censoredBy: 'regex',
        reasons: ['PII'],
      })
    })
  })

  describe('when regex passes', () => {
    test('checks recent messages in order and includes the proposed message', async () => {
      const previousMessage = buildDirectMessage({
        conversationId: context.conversationId,
        senderId: context.volunteerId,
      })
      mockedDirectMessageModerationRepo.getRecentMessages.mockResolvedValue([
        previousMessage,
      ])
      const result =
        await DirectMessageModerationService.moderateMessage(context)
      expect(result).toEqual({ blocked: false, reasons: [] })
      expect(
        mockedDirectMessageModerationRepo.getRecentMessages
      ).toHaveBeenCalledWith(context.conversationId, 50)
      expect(mockedModerationService.moderateTranscript).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            expect.objectContaining({
              messageId: previousMessage.id,
              role: 'volunteer',
            }),
            expect.objectContaining({
              messageId: 'pending',
              role: 'student',
              message: context.message,
            }),
          ],
        }),
        expect.anything()
      )
      expect(
        mockedModerationService.getAiModerationResult
      ).not.toHaveBeenCalled()
    })

    test('blocks contextual violations and removes duplicate reasons', async () => {
      mockedModerationService.moderateTranscript.mockResolvedValue([
        {
          reason: 'PLATFORM_CIRCUMVENTION',
          message: 'context',
          confidence: 90,
        },
        { reason: 'PLATFORM_CIRCUMVENTION', message: 'other', confidence: 90 },
      ])
      const result =
        await DirectMessageModerationService.moderateMessage(context)
      expect(result).toEqual({
        blocked: true,
        censoredBy: 'ai',
        reasons: ['PLATFORM_CIRCUMVENTION'],
      })
    })

    test('prevents delivery when contextual moderation fails', async () => {
      mockedModerationService.moderateTranscript.mockRejectedValue(
        new Error('AI error')
      )
      const result =
        await DirectMessageModerationService.moderateMessage(context)
      expect(result).toMatchObject({
        blocked: true,
        unavailable: true,
        reasons: ['MODERATION_UNAVAILABLE'],
      })
    })

    test('prevents delivery when contextual moderation times out', async () => {
      jest.useFakeTimers()
      mockedModerationService.moderateTranscript.mockReturnValue(
        new Promise(() => {})
      )
      const moderation = DirectMessageModerationService.moderateMessage(context)
      await jest.advanceTimersByTimeAsync(10001)
      await expect(moderation).resolves.toMatchObject({
        blocked: true,
        unavailable: true,
      })
    })
  })
})
