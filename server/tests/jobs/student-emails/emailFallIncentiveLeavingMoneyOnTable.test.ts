import { Job } from 'bull'
import { mocked } from 'jest-mock'
import config from '../../../config'
import { getDbUlid } from '../../../models/pgUtils'
import { buildUser, buildUserProductFlags } from '../../mocks/generate'
import * as IncentiveProgramService from '../../../services/IncentiveProgramService'
import * as MailService from '../../../services/MailService'
import * as NotificationService from '../../../services/NotificationService'
import * as SessionService from '../../../services/SessionService'
import { log } from '../../../worker/logger'
import { Jobs } from '../../../worker/jobs'
import emailFallIncentiveLeavingMoneyOnTable, {
  EmailFallIncentiveLeavingMoneyOnTableJobData,
} from '../../../worker/jobs/student-emails/emailFallIncentiveLeavingMoneyOnTable'

jest.mock('../../../logger')
jest.mock('../../../services/MailService')
jest.mock('../../../services/SessionService')
jest.mock('../../../services/NotificationService')
jest.mock('../../../services/IncentiveProgramService')

const mockedIncentiveProgramService = mocked(IncentiveProgramService)
const mockedMailService = mocked(MailService)
const mockedNotificationService = mocked(NotificationService)
const mockedSessionService = mocked(SessionService)

describe('emailFallIncentiveLeavingMoneyOnTable', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should do nothing if no fall incentive data ', async () => {
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
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
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
  })

  test('Should do nothing if user has already received email', async () => {
    const user = buildUser()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentiveProgramDate: new Date(),
      }
    )
    mockedNotificationService.hasEmailBeenSent.mockResolvedValueOnce(true)

    const jobData: Job<EmailFallIncentiveLeavingMoneyOnTableJobData> = {
      data: {
        userId: user.id,
      },
    } as Job<EmailFallIncentiveLeavingMoneyOnTableJobData>

    await emailFallIncentiveLeavingMoneyOnTable(jobData)
    expect(
      MailService.sendFallIncentiveLeavingMoneyOnTableEmail
    ).not.toHaveBeenCalled()
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
  })

  test('Should do nothing if there are no qualifying sessions', async () => {
    const user = buildUser()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentiveProgramDate: new Date(),
      }
    )
    mockedNotificationService.hasEmailBeenSent.mockResolvedValueOnce(false)
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
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
  })

  test('Should send email if user has exactly one qualifying session', async () => {
    const user = buildUser()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentiveProgramDate: new Date(),
      }
    )
    mockedNotificationService.hasEmailBeenSent.mockResolvedValueOnce(false)
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
    expect(NotificationService.createEmailNotification).toHaveBeenCalledWith(
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
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentiveProgramDate: new Date(),
      }
    )
    mockedNotificationService.hasEmailBeenSent.mockResolvedValueOnce(false)
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
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
  })
})
