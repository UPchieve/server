import { mocked } from 'jest-mock'
import emailFallIncentiveLeavingMoneyOnTable, {
  EmailFallIncentiveLeavingMoneyOnTableJobData,
} from '../../../worker/jobs/student-emails/emailFallIncentiveLeavingMoneyOnTable'
import { getDbUlid } from '../../../models/pgUtils'
import * as UserRepo from '../../../models/User'
import * as UserActionRepo from '../../../models/UserAction'
import * as UserProductFlagsRepo from '../../../models/UserProductFlags'
import * as FeatureFlagsService from '../../../services/FeatureFlagService'
import * as MailService from '../../../services/MailService'
import * as SessionService from '../../../services/SessionService'
import * as UserActionService from '../../../services/UserActionService'
import { Job } from 'bull'
import { buildUser, buildUserProductFlags } from '../../mocks/generate'
import { log } from '../../../worker/logger'
import { Jobs } from '../../../worker/jobs'
import { ACCOUNT_USER_ACTIONS } from '../../../constants'
import config from '../../../config'

jest.mock('../../../logger')
jest.mock('../../../models/User')
jest.mock('../../../models/UserAction')
jest.mock('../../../models/UserProductFlags')
jest.mock('../../../services/FeatureFlagService')
jest.mock('../../../services/MailService')
jest.mock('../../../services/SessionService')
jest.mock('../../../services/UserActionService')

const mockedUserRepo = mocked(UserRepo)
const mockedSessionService = mocked(SessionService)
const mockedMailService = mocked(MailService)
const mockedFeatureFlagsService = mocked(FeatureFlagsService)
const mockedUserActionService = mocked(UserActionService)
const mockedUserProductFlagsRepo = mocked(UserProductFlagsRepo)

describe('emailFallIncentiveLeavingMoneyOnTable', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should do nothing if no user', async () => {
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(undefined)
    const jobData: Job<EmailFallIncentiveLeavingMoneyOnTableJobData> = {
      data: {
        userId: getDbUlid(),
      },
    } as Job<EmailFallIncentiveLeavingMoneyOnTableJobData>

    await emailFallIncentiveLeavingMoneyOnTable(jobData)
    expect(
      MailService.sendFallIncentiveLeavingMoneyOnTableEmail
    ).not.toHaveBeenCalled()
  })

  test('Should do nothing if user, but not in incentive program date', async () => {
    const user = buildUser()
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(user)
    mockedFeatureFlagsService.getFallIncentiveProgramPayload.mockResolvedValueOnce(
      null
    )
    const jobData: Job<EmailFallIncentiveLeavingMoneyOnTableJobData> = {
      data: {
        userId: user.id,
      },
    } as Job<EmailFallIncentiveLeavingMoneyOnTableJobData>

    await emailFallIncentiveLeavingMoneyOnTable(jobData)
    expect(
      MailService.sendFallIncentiveLeavingMoneyOnTableEmail
    ).not.toHaveBeenCalled()
  })

  test('Should do nothing if user is already enrolled', async () => {
    const user = buildUser()
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(user)
    mockedFeatureFlagsService.getFallIncentiveProgramPayload.mockResolvedValueOnce(
      new Date().toISOString()
    )
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValueOnce(
      buildUserProductFlags({ fallIncentiveEnrollmentAt: new Date() })
    )
    const jobData: Job<EmailFallIncentiveLeavingMoneyOnTableJobData> = {
      data: {
        userId: user.id,
      },
    } as Job<EmailFallIncentiveLeavingMoneyOnTableJobData>

    await emailFallIncentiveLeavingMoneyOnTable(jobData)
    expect(
      MailService.sendFallIncentiveLeavingMoneyOnTableEmail
    ).not.toHaveBeenCalled()
  })

  test('Should do nothing if user has already received email', async () => {
    const user = buildUser()
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(user)
    mockedFeatureFlagsService.getFallIncentiveProgramPayload.mockResolvedValueOnce(
      new Date().toISOString()
    )
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValueOnce(
      buildUserProductFlags({ fallIncentiveEnrollmentAt: new Date() })
    )
    mockedUserActionService.getEmailActivityByEmailTemplateId.mockResolvedValueOnce(
      [
        {
          action: ACCOUNT_USER_ACTIONS.EMAILED,
          emailTemplateId: '123',
          createdAt: new Date(),
        },
      ]
    )
    const jobData: Job<EmailFallIncentiveLeavingMoneyOnTableJobData> = {
      data: {
        userId: user.id,
      },
    } as Job<EmailFallIncentiveLeavingMoneyOnTableJobData>

    await emailFallIncentiveLeavingMoneyOnTable(jobData)
    expect(
      MailService.sendFallIncentiveLeavingMoneyOnTableEmail
    ).not.toHaveBeenCalled()
  })

  test('Should do nothing if there are no qualifying sessions', async () => {
    const user = buildUser()
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(user)
    mockedFeatureFlagsService.getFallIncentiveProgramPayload.mockResolvedValueOnce(
      new Date().toISOString()
    )
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValueOnce(
      buildUserProductFlags()
    )
    mockedUserActionService.getEmailActivityByEmailTemplateId.mockResolvedValueOnce(
      []
    )
    mockedSessionService.getFallIncentiveSessionStats.mockResolvedValueOnce({
      total: 0,
      totalQualified: 0,
      totalUnqualified: 3,
    })

    const jobData: Job<EmailFallIncentiveLeavingMoneyOnTableJobData> = {
      data: {
        userId: user.id,
      },
    } as Job<EmailFallIncentiveLeavingMoneyOnTableJobData>

    await emailFallIncentiveLeavingMoneyOnTable(jobData)

    expect(
      MailService.sendFallIncentiveLeavingMoneyOnTableEmail
    ).not.toHaveBeenCalled()
  })

  test('Should send email if user has exactly one qualifying session', async () => {
    const user = buildUser()
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(user)
    mockedFeatureFlagsService.getFallIncentiveProgramPayload.mockResolvedValueOnce(
      '2024-09-03 00:00:00.000000+00'
    )
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValueOnce(
      buildUserProductFlags()
    )
    mockedUserActionService.getEmailActivityByEmailTemplateId.mockResolvedValueOnce(
      []
    )
    mockedSessionService.getFallIncentiveSessionStats.mockResolvedValueOnce({
      total: 0,
      totalQualified: 1,
      totalUnqualified: 5,
    })

    const jobData: Job<EmailFallIncentiveLeavingMoneyOnTableJobData> = {
      data: {
        userId: user.id,
      },
    } as Job<EmailFallIncentiveLeavingMoneyOnTableJobData>

    await emailFallIncentiveLeavingMoneyOnTable(jobData)

    expect(
      MailService.sendFallIncentiveLeavingMoneyOnTableEmail
    ).toHaveBeenCalledWith(user.email, user.firstName)
    expect(UserActionRepo.createAccountAction).toHaveBeenCalledWith({
      action: ACCOUNT_USER_ACTIONS.EMAILED,
      userId: user.id,
      emailTemplateId: config.sendgrid.fallIncentiveLeavingMoneyOnTableTemplate,
    })
    expect(log).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailFallIncentiveLeavingMoneyOnTable} to student ${user.id}`
    )
  })

  test('Should catch error when sending email', async () => {
    const user = buildUser()
    const error = 'Failed to send email'
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(user)
    mockedFeatureFlagsService.getFallIncentiveProgramPayload.mockResolvedValueOnce(
      '2024-09-03 00:00:00.000000+00'
    )
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValueOnce(
      buildUserProductFlags()
    )
    mockedUserActionService.getEmailActivityByEmailTemplateId.mockResolvedValueOnce(
      []
    )
    mockedSessionService.getFallIncentiveSessionStats.mockResolvedValueOnce({
      total: 0,
      totalQualified: 1,
      totalUnqualified: 0,
    })
    mockedMailService.sendFallIncentiveLeavingMoneyOnTableEmail.mockRejectedValueOnce(
      new Error(error)
    )

    const jobData: Job<EmailFallIncentiveLeavingMoneyOnTableJobData> = {
      data: {
        userId: user.id,
      },
    } as Job<EmailFallIncentiveLeavingMoneyOnTableJobData>

    await expect(
      emailFallIncentiveLeavingMoneyOnTable(jobData)
    ).rejects.toThrow(
      `Failed to send ${Jobs.EmailFallIncentiveLeavingMoneyOnTable} to student ${user.id}: Error: ${error}`
    )
    expect(
      MailService.sendFallIncentiveLeavingMoneyOnTableEmail
    ).toHaveBeenCalled()
  })
})
