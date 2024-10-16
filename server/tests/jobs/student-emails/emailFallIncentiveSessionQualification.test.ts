import { mocked } from 'jest-mock'
import emailFallIncentiveSessionQualification, {
  EmailFallIncentiveSessionQualificationJobData,
} from '../../../worker/jobs/student-emails/emailFallIncentiveSessionQualification'
import { getDbUlid } from '../../../models/pgUtils'
import * as AnalyticsService from '../../../services/AnalyticsService'
import * as MailService from '../../../services/MailService'
import * as SessionService from '../../../services/SessionService'
import * as NotificationService from '../../../services/NotificationService'
import * as IncentiveProgramService from '../../../services/IncentiveProgramService'
import { Job } from 'bull'
import { buildUser, buildUserProductFlags } from '../../mocks/generate'
import { log } from '../../../worker/logger'
import { Jobs } from '../../../worker/jobs'
import config from '../../../config'
import { EVENTS } from '../../../constants'

jest.mock('../../../logger')
jest.mock('../../../services/AnalyticsService')
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
      },
    } as Job<EmailFallIncentiveSessionQualificationJobData>

    await emailFallIncentiveSessionQualification(jobData)
    expect(MailService.sendQualifiedForGiftCardEmail).not.toHaveBeenCalled()
    expect(
      MailService.sendStillTimeToHaveQualifyingSessionEmail
    ).not.toHaveBeenCalled()
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
  })

  test('Should early exit if the user has reached the limit for gift cards', async () => {
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
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(11)
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(true)

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
      },
    } as Job<EmailFallIncentiveSessionQualificationJobData>

    await emailFallIncentiveSessionQualification(jobData)
    expect(log).toHaveBeenCalledWith(
      `${Jobs.EmailFallIncentiveSessionQualification} User ${user.id} has reached the maximum number of qualification for gift cards (10)`
    )
    expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
      user.id,
      EVENTS.STUDENT_FALL_INCENTIVE_PROGRAM_GIFT_CARD_LIMIT_REACHED,
      {},
      {
        fallIncentiveLimitReachedAt: expect.any(String),
      }
    )
    expect(NotificationService.hasUserBeenSentEmail).not.toHaveBeenCalled()
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
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(1)
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedSessionService.getFallIncentiveSessionOverview.mockResolvedValueOnce({
      qualifiedSessions: [sessionId],
      unqualifiedSessions: [getDbUlid(), getDbUlid()],
    })

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
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

  test('Should not send to still have time to have a qualifying session if sent before', async () => {
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
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(1)
    // User has not been sent the qualified for gift card email
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    // Mock for the user to have had the "still time to qualify for session" email
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(true)
    mockedSessionService.getFallIncentiveSessionOverview.mockResolvedValueOnce({
      qualifiedSessions: [],
      unqualifiedSessions: [getDbUlid(), getDbUlid()],
    })

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
      },
    } as Job<EmailFallIncentiveSessionQualificationJobData>

    await emailFallIncentiveSessionQualification(jobData)
    expect(MailService.sendQualifiedForGiftCardEmail).not.toHaveBeenCalled()
    expect(
      MailService.sendStillTimeToHaveQualifyingSessionEmail
    ).not.toHaveBeenCalled()
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
  })

  test('Should send reminder email if user has had a non-qualifying session and hasnt been sent that email before', async () => {
    const user = buildUser()
    const unqualifiedSessionId = getDbUlid()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentiveProgramDate: new Date(),
      }
    )
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(1)
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedSessionService.getFallIncentiveSessionOverview.mockResolvedValueOnce({
      qualifiedSessions: [],
      unqualifiedSessions: [unqualifiedSessionId, getDbUlid()],
    })

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
      },
    } as Job<EmailFallIncentiveSessionQualificationJobData>

    await emailFallIncentiveSessionQualification(jobData)
    expect(
      MailService.sendStillTimeToHaveQualifyingSessionEmail
    ).toHaveBeenCalledWith(user.email, user.firstName)
    expect(NotificationService.createEmailNotification).toHaveBeenCalledWith({
      userId: user.id,
      sessionId: unqualifiedSessionId,
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
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(1)
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedSessionService.getFallIncentiveSessionOverview.mockResolvedValueOnce({
      qualifiedSessions: [getDbUlid()],
      unqualifiedSessions: [getDbUlid(), getDbUlid()],
    })
    mockedMailService.sendQualifiedForGiftCardEmail.mockRejectedValueOnce(error)

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
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
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(1)
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedSessionService.getFallIncentiveSessionOverview.mockResolvedValueOnce({
      qualifiedSessions: [],
      unqualifiedSessions: [getDbUlid()],
    })
    mockedMailService.sendStillTimeToHaveQualifyingSessionEmail.mockRejectedValueOnce(
      error
    )

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
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
