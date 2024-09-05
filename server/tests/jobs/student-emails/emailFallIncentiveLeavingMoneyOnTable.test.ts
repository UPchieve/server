import { mocked } from 'jest-mock'
import emailFallIncentiveLeavingMoneyOnTable, {
  EmailFallIncentiveLeavingMoneyOnTableJobData,
} from '../../../worker/jobs/student-emails/emailFallIncentiveLeavingMoneyOnTable'
import { getDbUlid } from '../../../models/pgUtils'
import * as MailService from '../../../services/MailService'
import * as SessionService from '../../../services/SessionService'
import * as UserActionService from '../../../services/UserActionService'
import * as FallIncentiveUtils from '../../../utils/fall-incentive-utils'
import { Job } from 'bull'
import { buildUser, buildUserProductFlags } from '../../mocks/generate'
import { log } from '../../../worker/logger'
import { Jobs } from '../../../worker/jobs'
import config from '../../../config'

jest.mock('../../../logger')
jest.mock('../../../services/MailService')
jest.mock('../../../services/SessionService')
jest.mock('../../../services/UserActionService')
jest.mock('../../../utils/fall-incentive-utils')

const mockedSessionService = mocked(SessionService)
const mockedMailService = mocked(MailService)
const mockedUserActionService = mocked(UserActionService)
const mockedFallIncentiveUtils = mocked(FallIncentiveUtils)

describe('emailFallIncentiveLeavingMoneyOnTable', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should do nothing if no fall incentive data ', async () => {
    mockedFallIncentiveUtils.getUserFallIncentiveData.mockResolvedValueOnce(
      undefined
    )
    const jobData: Job<EmailFallIncentiveLeavingMoneyOnTableJobData> = {
      data: {
        userId: getDbUlid(),
      },
    } as Job<EmailFallIncentiveLeavingMoneyOnTableJobData>

    await emailFallIncentiveLeavingMoneyOnTable(jobData)
    expect(
      MailService.sendFallIncentiveLeavingMoneyOnTableEmail
    ).not.toHaveBeenCalled()
    expect(UserActionService.logEmailActivity).not.toHaveBeenCalled()
  })

  test('Should do nothing if user has already received email', async () => {
    const user = buildUser()
    mockedFallIncentiveUtils.getUserFallIncentiveData.mockResolvedValueOnce({
      user,
      productFlags: buildUserProductFlags({
        fallIncentiveEnrollmentAt: new Date(),
      }),
      incentiveProgramDate: new Date(),
    })
    mockedUserActionService.hasEmailBeenSent.mockResolvedValueOnce(true)

    const jobData: Job<EmailFallIncentiveLeavingMoneyOnTableJobData> = {
      data: {
        userId: user.id,
      },
    } as Job<EmailFallIncentiveLeavingMoneyOnTableJobData>

    await emailFallIncentiveLeavingMoneyOnTable(jobData)
    expect(
      MailService.sendFallIncentiveLeavingMoneyOnTableEmail
    ).not.toHaveBeenCalled()
    expect(UserActionService.logEmailActivity).not.toHaveBeenCalled()
  })

  test('Should do nothing if there are no qualifying sessions', async () => {
    const user = buildUser()
    mockedFallIncentiveUtils.getUserFallIncentiveData.mockResolvedValueOnce({
      user,
      productFlags: buildUserProductFlags({
        fallIncentiveEnrollmentAt: new Date(),
      }),
      incentiveProgramDate: new Date(),
    })
    mockedUserActionService.hasEmailBeenSent.mockResolvedValueOnce(false)
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
    expect(UserActionService.logEmailActivity).not.toHaveBeenCalled()
  })

  test('Should send email if user has exactly one qualifying session', async () => {
    const user = buildUser()
    mockedFallIncentiveUtils.getUserFallIncentiveData.mockResolvedValueOnce({
      user,
      productFlags: buildUserProductFlags({
        fallIncentiveEnrollmentAt: new Date(),
      }),
      incentiveProgramDate: new Date(),
    })
    mockedUserActionService.hasEmailBeenSent.mockResolvedValueOnce(false)
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
    expect(UserActionService.logEmailActivity).toHaveBeenCalledWith(
      user.id,
      config.sendgrid.fallIncentiveLeavingMoneyOnTableTemplate
    )
    expect(log).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailFallIncentiveLeavingMoneyOnTable} to student ${user.id}`
    )
  })

  test('Should catch error when sending email', async () => {
    const error = 'Failed to send email'
    const user = buildUser()
    mockedFallIncentiveUtils.getUserFallIncentiveData.mockResolvedValueOnce({
      user,
      productFlags: buildUserProductFlags({
        fallIncentiveEnrollmentAt: new Date(),
      }),
      incentiveProgramDate: new Date(),
    })
    mockedUserActionService.hasEmailBeenSent.mockResolvedValueOnce(false)
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
    expect(UserActionService.logEmailActivity).not.toHaveBeenCalled()
  })
})
