import { mocked } from 'jest-mock'
import moderateSessionMessage, {
  ModerationSessionMessageJobData,
} from '../../scripts/moderate-session-message'
import * as FeatureFlagsService from '../../services/FeatureFlagService'
import * as BotsService from '../../services/BotsService'
import { Job } from 'bull'
import { getDbUlid } from '../../models/pgUtils'

jest.mock('../../services/FeatureFlagService')
jest.mock('../../services/BotsService')
const mockedFeatureFlagService = mocked(FeatureFlagsService)
const mockedBotsService = mocked(BotsService)
describe('Moderate session message', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockedFeatureFlagService.getAiModerationFeatureFlag.mockResolvedValue(true)
  })

  const getJobData = () => {
    return {
      data: {
        senderId: getDbUlid(),
        sessionId: getDbUlid(),
        censoredSessionMessageId: getDbUlid(),
        sentAt: new Date(),
        isVolunteer: false,
        message: 'this is a test message',
      },
    } as Job<ModerationSessionMessageJobData>
  }

  it('Should make a call to OpenAI if the FF is on', async () => {
    await moderateSessionMessage(getJobData())
    // @TODO expect things to have been called, like logger and openai
  })

  it('Should exit early if the FF is off', async () => {
    mockedFeatureFlagService.getAiModerationFeatureFlag.mockResolvedValue(false)
    await moderateSessionMessage(getJobData())
    // @TODO expect logger and openai NOT to have been called
  })
})
