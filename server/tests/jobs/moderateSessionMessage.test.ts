import { mocked } from 'jest-mock'
import moderateSessionMessage, {
  ModerationSessionMessageJobData,
} from '../../scripts/moderate-session-message'
import * as FeatureFlagsService from '../../services/FeatureFlagService'
import logger from '../../logger'
import { Job } from 'bull'
import { getDbUlid, Ulid } from '../../models/pgUtils'
import { openai } from '../../services/BotsService'

jest.mock('../../services/FeatureFlagService')
jest.mock('../../logger')
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

const mockedFeatureFlagService = mocked(FeatureFlagsService)
describe('Moderate session message', () => {
  let jobData: Job<ModerationSessionMessageJobData>

  beforeEach(() => {
    jest.resetAllMocks()
    mockedFeatureFlagService.getAiModerationFeatureFlag.mockResolvedValue(true)
    jobData = {
      data: {
        censoredSessionMessage: {
          sessionId: getDbUlid(),
          senderId: getDbUlid(),
          message: 'test message',
          sentAt: new Date(),
          id: getDbUlid(),
        },
        isVolunteer: true,
      },
    } as Job<ModerationSessionMessageJobData>
  })

  it('Should make a call to OpenAI if the FF is on and log the result', async () => {
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
    await moderateSessionMessage(jobData)
    expect(openai.chat.completions.create).toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith(
      {
        censoredSessionMessage: {
          sessionId: jobData.data.censoredSessionMessage.sessionId,
          senderId: jobData.data.censoredSessionMessage.senderId,
          id: jobData.data.censoredSessionMessage.id,
          sentAt: jobData.data.censoredSessionMessage.sentAt,
          message: jobData.data.censoredSessionMessage.message,
        },
        decision: {
          isClean: true,
          reasons: [],
          moderatorVersion: 'openai_v1',
        },
      },
      'AI moderation result'
    )
  })

  it('Should exit early if the FF is off', async () => {
    mockedFeatureFlagService.getAiModerationFeatureFlag.mockResolvedValue(false)
    await moderateSessionMessage(jobData)
    expect(openai.chat.completions.create).not.toHaveBeenCalled()
    expect(logger.info).not.toHaveBeenCalled()
    expect(logger.error).not.toHaveBeenCalled()
  })
})
