import { mocked } from 'jest-mock'
import emailFallIncentiveSessionQualification, {
  EmailFallIncentiveSessionQualificationJobData,
} from '../../../worker/jobs/student-emails/emailFallIncentiveSessionQualification'
import { getDbUlid } from '../../../models/pgUtils'
import * as MailService from '../../../services/MailService'
import * as SessionService from '../../../services/SessionService'
import * as NotificationService from '../../../services/NotificationService'
import * as IncentiveProgramService from '../../../services/IncentiveProgramService'
import { Job } from 'bull'
import { buildUser, buildUserProductFlags } from '../../mocks/generate'
import { log } from '../../../worker/logger'
import { Jobs } from '../../../worker/jobs'
import config from '../../../config'

jest.mock('../../../logger')
jest.mock('../../../services/MailService')
jest.mock('../../../services/SessionService')
jest.mock('../../../services/NotificationService')
jest.mock('../../../services/IncentiveProgramService')

const mockedSessionService = mocked(SessionService)
const mockedMailService = mocked(MailService)
const mockedNotificationService = mocked(NotificationService)
const mockedIncentiveProgramService = mocked(IncentiveProgramService)

describe('emailFallIncentiveSessionQualification', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should do nothing if no fall incentive data is available', async () => {
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      undefined
    )
    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: getDbUlid(),
        sessionId: getDbUlid(),
      },
    } as Job<EmailFallIncentiveSessionQualificationJobData>

    await emailFallIncentiveSessionQualification(jobData)
    expect(MailService.sendQualifiedForGiftCardEmail).not.toHaveBeenCalled()
    expect(
      MailService.sendStillTimeToHaveQualifyingSessionEmail
    ).not.toHaveBeenCalled()
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
  })

  test('Should do nothing if user has already received qualified for gift card email', async () => {
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
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(true)

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
        sessionId: getDbUlid(),
      },
    } as Job<EmailFallIncentiveSessionQualificationJobData>

    await emailFallIncentiveSessionQualification(jobData)
    expect(MailService.sendQualifiedForGiftCardEmail).not.toHaveBeenCalled()
    expect(
      MailService.sendStillTimeToHaveQualifyingSessionEmail
    ).not.toHaveBeenCalled()
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
  })

  test('Should send qualified for gift card email if user has exactly one qualifying session', async () => {
    const user = buildUser()
    const sessionId = getDbUlid()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentiveProgramDate: new Date(),
      }
    )
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedSessionService.getFallIncentiveSessionStats.mockResolvedValueOnce({
      total: 0,
      totalQualified: 1,
      totalUnqualified: 5,
    })

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
        sessionId,
      },
    } as Job<EmailFallIncentiveSessionQualificationJobData>

    await emailFallIncentiveSessionQualification(jobData)
    expect(MailService.sendQualifiedForGiftCardEmail).toHaveBeenCalledWith(
      user.email,
      user.firstName
    )
    expect(NotificationService.createEmailNotification).toHaveBeenCalledWith({
      userId: user.id,
      sessionId,
      emailTemplateId: config.sendgrid.qualifiedForGiftCardTemplate,
    })
    expect(log).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailFallIncentiveSessionQualification} to student ${user.id} gift card qualified email`
    )
  })

  test('Should not send reminder email if been sent that email before', async () => {
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
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(true)
    mockedSessionService.getFallIncentiveSessionStats.mockResolvedValueOnce({
      total: 0,
      totalQualified: 0,
      totalUnqualified: 1,
    })

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
        sessionId: getDbUlid(),
      },
    } as Job<EmailFallIncentiveSessionQualificationJobData>

    await emailFallIncentiveSessionQualification(jobData)
    expect(MailService.sendQualifiedForGiftCardEmail).not.toHaveBeenCalled()
    expect(
      MailService.sendStillTimeToHaveQualifyingSessionEmail
    ).not.toHaveBeenCalled()
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
  })

  test('Should send reminder email if user has exactly one non-qualifying session and hasnt been sent that email before', async () => {
    const user = buildUser()
    const sessionId = getDbUlid()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentiveProgramDate: new Date(),
      }
    )
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedSessionService.getFallIncentiveSessionStats.mockResolvedValueOnce({
      total: 0,
      totalQualified: 0,
      totalUnqualified: 1,
    })

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
        sessionId,
      },
    } as Job<EmailFallIncentiveSessionQualificationJobData>

    await emailFallIncentiveSessionQualification(jobData)
    expect(
      MailService.sendStillTimeToHaveQualifyingSessionEmail
    ).toHaveBeenCalledWith(user.email, user.firstName)
    expect(NotificationService.createEmailNotification).toHaveBeenCalledWith({
      userId: user.id,
      sessionId,
      emailTemplateId: config.sendgrid.stillTimeForQualifyingSessionTemplate,
    })
    expect(log).toHaveBeenCalledWith(
      `${Jobs.EmailFallIncentiveSessionQualification} sent student ${user.id} session did not qualify email`
    )
  })

  test('Should catch error when sending qualified email', async () => {
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
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedSessionService.getFallIncentiveSessionStats.mockResolvedValueOnce({
      total: 0,
      totalQualified: 1,
      totalUnqualified: 0,
    })
    mockedMailService.sendQualifiedForGiftCardEmail.mockRejectedValueOnce(error)

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
        sessionId: getDbUlid(),
      },
    } as Job<EmailFallIncentiveSessionQualificationJobData>

    await expect(
      emailFallIncentiveSessionQualification(jobData)
    ).rejects.toThrow(
      `Failed to send ${Jobs.EmailFallIncentiveSessionQualification} to student ${user.id}: ${error}`
    )
    expect(MailService.sendQualifiedForGiftCardEmail).toHaveBeenCalled()
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
  })

  test('Should catch error when sending reminder email', async () => {
    const error = 'Failed to send reminder email'
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
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedSessionService.getFallIncentiveSessionStats.mockResolvedValueOnce({
      total: 0,
      totalQualified: 0,
      totalUnqualified: 1,
    })
    mockedMailService.sendStillTimeToHaveQualifyingSessionEmail.mockRejectedValueOnce(
      error
    )

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
        sessionId: getDbUlid(),
      },
    } as Job<EmailFallIncentiveSessionQualificationJobData>

    await expect(
      emailFallIncentiveSessionQualification(jobData)
    ).rejects.toThrow(
      `Failed to send ${Jobs.EmailFallIncentiveSessionQualification} to student ${user.id}: ${error}`
    )
    expect(
      MailService.sendStillTimeToHaveQualifyingSessionEmail
    ).toHaveBeenCalled()
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
  })
})
