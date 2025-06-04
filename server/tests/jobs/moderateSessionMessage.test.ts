import { mocked } from 'jest-mock'
import moderateSessionMessage, {
  ModerationSessionMessageJobData,
} from '../../scripts/moderate-session-message'
import * as FeatureFlagsService from '../../services/FeatureFlagService'
import { Job } from 'bull'
import { getDbUlid } from '../../models/pgUtils'
import { invokeModel } from '../../services/OpenAIService'

jest.mock('../../services/FeatureFlagService')
jest.mock('../../logger')
jest.mock('../../services/OpenAIService', () => {
  return {
    invokeModel: jest.fn(),
  }
})

const mockedFeatureFlagService = mocked(FeatureFlagsService)
describe('Moderate session message', () => {
  let jobData: Job<ModerationSessionMessageJobData>

  beforeEach(() => {
    jest.resetAllMocks()
    mockedFeatureFlagService.getAiModerationFeatureFlag.mockResolvedValue(
      FeatureFlagsService.AI_MODERATION_STATE.notTargeted
    )
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

  it('Should make a call to OpenAI', async () => {
    ;(invokeModel as jest.Mock).mockResolvedValue({
      results: {
        appropriate: true,
        reasons: [],
      },
      modelId: '',
    })
    await moderateSessionMessage(jobData)
    expect(invokeModel).toHaveBeenCalled()
  })
})
