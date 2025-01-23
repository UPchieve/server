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

  test('Should early exit if the user has reached the overall limit for gift cards and has received completed challenge email', async () => {
    const user = buildUser()
    const sessionId = getDbUlid()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentivePayload: {
          incentiveStartDate: new Date(),
          maxQualifiedSessionsPerWeek: 1,
          maxQualifiedSessionsPerUser: 10,
        },
      }
    )
    // Fall incentive participation limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(11)
    // Fall incentive completed challenge email
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(true)

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
        sessionId,
      },
    } as Job<EmailFallIncentiveSessionQualificationJobData>

    await emailFallIncentiveSessionQualification(jobData)
    expect(log).toHaveBeenCalledWith(
      `${Jobs.EmailFallIncentiveSessionQualification} User ${user.id} has reached the maximum number of qualification for gift cards (10)`
    )
    expect(
      MailService.sendFallIncentiveCompletedChallengeEmail
    ).not.toHaveBeenCalled()
    expect(AnalyticsService.captureEvent).not.toHaveBeenCalled()
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
  })

  test('Should early exit and send the user a completed challenge email if they have not received it and reached overall gift card limit', async () => {
    const user = buildUser()
    const sessionId = getDbUlid()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentivePayload: {
          incentiveStartDate: new Date(),
          maxQualifiedSessionsPerWeek: 1,
          maxQualifiedSessionsPerUser: 10,
        },
      }
    )
    // Fall incentive participation limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(11)
    // Fall incentive completed challenge email
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
        sessionId,
      },
    } as Job<EmailFallIncentiveSessionQualificationJobData>

    await emailFallIncentiveSessionQualification(jobData)
    expect(log).toHaveBeenCalledWith(
      `${Jobs.EmailFallIncentiveSessionQualification} User ${user.id} has reached the maximum number of qualification for gift cards (10)`
    )
    expect(
      MailService.sendFallIncentiveCompletedChallengeEmail
    ).toHaveBeenCalledWith(user.email, user.firstName)
    expect(NotificationService.createEmailNotification).toHaveBeenCalledWith({
      userId: user.id,
      emailTemplateId: config.sendgrid.fallIncentiveCompletedChallengeTemplate,
    })
    expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
      user.id,
      EVENTS.STUDENT_FALL_INCENTIVE_PROGRAM_GIFT_CARD_LIMIT_REACHED,
      {},
      {
        fallIncentiveLimitReachedAt: expect.any(String),
      }
    )
    expect(MailService.sendQualifiedForGiftCardEmail).not.toHaveBeenCalled()
    expect(
      MailService.sendStillTimeToHaveQualifyingSessionEmail
    ).not.toHaveBeenCalled()
  })

  test('Should not send the "qualified for gift card" email if user has already reached the max qualifying sessions for the week', async () => {
    const user = buildUser()
    const sessionId = getDbUlid()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentivePayload: {
          incentiveStartDate: new Date(),
          maxQualifiedSessionsPerWeek: 3,
          maxQualifiedSessionsPerUser: 10,
        },
      }
    )
    // Fall incentive participation limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(2)
    // Fall incentive completed challenge email
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    // Weekly gift card limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(3)

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
        sessionId,
      },
    } as Job<EmailFallIncentiveSessionQualificationJobData>

    await emailFallIncentiveSessionQualification(jobData)
    expect(MailService.sendQualifiedForGiftCardEmail).not.toHaveBeenCalled()
    expect(
      MailService.sendStillTimeToHaveQualifyingSessionEmail
    ).not.toHaveBeenCalled()
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
  })

  test('Should send "qualified for gift card" email if user has a qualifying session and has not met the weekly qualifying session max', async () => {
    const user = buildUser()
    const sessionId = getDbUlid()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentivePayload: {
          incentiveStartDate: new Date(),
          maxQualifiedSessionsPerWeek: 2,
          maxQualifiedSessionsPerUser: 10,
        },
      }
    )
    // Fall incentive participation limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(1)
    // Fall incentive completed challenge email
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    // Weekly gift card limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(0)
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedSessionService.isSessionQualifiedForFallIncentive.mockResolvedValueOnce(
      true
    )

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
    expect(
      MailService.sendFallIncentiveCompletedChallengeEmail
    ).not.toHaveBeenCalled()
    expect(
      NotificationService.createEmailNotification
    ).not.toHaveBeenCalledWith({
      userId: user.id,
      emailTemplateId: config.sendgrid.fallIncentiveCompletedChallengeTemplate,
    })
    expect(AnalyticsService.captureEvent).not.toHaveBeenCalledWith(
      user.id,
      EVENTS.STUDENT_FALL_INCENTIVE_PROGRAM_GIFT_CARD_LIMIT_REACHED,
      {},
      {
        fallIncentiveLimitReachedAt: expect.any(String),
      }
    )
  })

  test('Should send "qualified for gift card" email if user has a qualifying session and completed challenge email if user has just reached their 10th session', async () => {
    const user = buildUser()
    const sessionId = getDbUlid()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentivePayload: {
          incentiveStartDate: new Date(),
          maxQualifiedSessionsPerWeek: 2,
          maxQualifiedSessionsPerUser: 10,
        },
      }
    )
    // Fall incentive participation limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(9)
    // Fall incentive completed challenge email
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    // Weekly gift card limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(0)
    mockedSessionService.isSessionQualifiedForFallIncentive.mockResolvedValueOnce(
      true
    )

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
    expect(
      MailService.sendFallIncentiveCompletedChallengeEmail
    ).toHaveBeenCalledWith(user.email, user.firstName)
    expect(NotificationService.createEmailNotification).toHaveBeenCalledWith({
      userId: user.id,
      emailTemplateId: config.sendgrid.fallIncentiveCompletedChallengeTemplate,
    })
    expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
      user.id,
      EVENTS.STUDENT_FALL_INCENTIVE_PROGRAM_GIFT_CARD_LIMIT_REACHED,
      {},
      {
        fallIncentiveLimitReachedAt: expect.any(String),
      }
    )
  })

  test('Should not send to "still have time to have a qualifying session" email if sent before', async () => {
    const user = buildUser()
    const sessionId = getDbUlid()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentivePayload: {
          incentiveStartDate: new Date(),
          maxQualifiedSessionsPerWeek: 1,
          maxQualifiedSessionsPerUser: 10,
        },
      }
    )
    // Fall incentive participation limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(1)
    // Fall incentive completed challenge email
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    // Weekly gift card limit - User has not been sent the "qualified for gift card" email
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(0)
    // Mock sent the user the "still time to qualify for session" email before
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(true)
    mockedSessionService.isSessionQualifiedForFallIncentive.mockResolvedValueOnce(
      false
    )

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
        sessionId,
      },
    } as Job<EmailFallIncentiveSessionQualificationJobData>

    await emailFallIncentiveSessionQualification(jobData)
    expect(MailService.sendQualifiedForGiftCardEmail).not.toHaveBeenCalled()
    expect(
      MailService.sendStillTimeToHaveQualifyingSessionEmail
    ).not.toHaveBeenCalled()
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
  })

  test('Should ignore weekly limit if maxQualifiedSessionsPerWeek is not defined and enforce only overall limit', async () => {
    const user = buildUser()
    const sessionId = getDbUlid()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentivePayload: {
          incentiveStartDate: new Date(),
          maxQualifiedSessionsPerUser: 10,
        },
      }
    )
    // Overall gift card limit not yet reached
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(5)
    // Has not received completed challenge email
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    // Weekly limit can be ignored since there is none set in the incentivePayload
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(0)

    mockedSessionService.isSessionQualifiedForFallIncentive.mockResolvedValueOnce(
      true
    )

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

  test('Should send emails to proxyEmail if available', async () => {
    const user = buildUser({ proxyEmail: 'proxy@test.com' })
    const sessionId = getDbUlid()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentivePayload: {
          incentiveStartDate: new Date(),
          maxQualifiedSessionsPerWeek: 2,
          maxQualifiedSessionsPerUser: 10,
        },
      }
    )
    // Fall incentive participation limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(1)
    // Fall incentive completed challenge email
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    // Weekly gift card limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(0)
    mockedSessionService.isSessionQualifiedForFallIncentive.mockResolvedValueOnce(
      true
    )

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
        sessionId,
      },
    } as Job<EmailFallIncentiveSessionQualificationJobData>

    await emailFallIncentiveSessionQualification(jobData)
    expect(MailService.sendQualifiedForGiftCardEmail).toHaveBeenCalledWith(
      user.proxyEmail,
      user.firstName
    )
  })

  test('Should allow sending the last qualified email when totalQualifiedForGiftCardsSent is one less than max that can be sent to user', async () => {
    const user = buildUser()
    const sessionId = getDbUlid()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentivePayload: {
          incentiveStartDate: new Date(),
          maxQualifiedSessionsPerWeek: 5,
          maxQualifiedSessionsPerUser: 10,
        },
      }
    )
    // Total qualified emails sent is 9 (one less than maxQualifiedSessionsPerUser: 10)
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(9)
    // Fall incentive completed challenge email not sent
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    // Weekly gift card limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(4)
    mockedSessionService.isSessionQualifiedForFallIncentive.mockResolvedValueOnce(
      true
    )

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
    expect(
      MailService.sendFallIncentiveCompletedChallengeEmail
    ).toHaveBeenCalled()
  })

  test('Should send reminder email if user has had a non-qualifying session and hasnt been sent that email before', async () => {
    const user = buildUser()
    const sessionId = getDbUlid()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentivePayload: {
          incentiveStartDate: new Date(),
          maxQualifiedSessionsPerWeek: 1,
          maxQualifiedSessionsPerUser: 10,
        },
      }
    )
    // Fall incentive participation limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(1)
    // Fall incentive completed challenge email
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    // Weekly gift card limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(0)
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedSessionService.isSessionQualifiedForFallIncentive.mockResolvedValueOnce(
      false
    )

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
    const sessionId = getDbUlid()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentivePayload: {
          incentiveStartDate: new Date(),
          maxQualifiedSessionsPerWeek: 1,
          maxQualifiedSessionsPerUser: 10,
        },
      }
    )
    // Fall incentive participation limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(1)
    // Fall incentive completed challenge email
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    // Weekly gift card limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(0)
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedSessionService.isSessionQualifiedForFallIncentive.mockResolvedValueOnce(
      true
    )
    mockedMailService.sendQualifiedForGiftCardEmail.mockRejectedValueOnce(error)

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
        sessionId,
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
    const sessionId = getDbUlid()
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags({
          fallIncentiveEnrollmentAt: new Date(),
        }),
        incentivePayload: {
          incentiveStartDate: new Date(),
          maxQualifiedSessionsPerWeek: 1,
          maxQualifiedSessionsPerUser: 10,
        },
      }
    )
    // Fall incentive participation limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(1)
    // Fall incentive completed challenge email
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    // Weekly gift card limit
    mockedNotificationService.getTotalEmailsSentToUser.mockResolvedValueOnce(0)
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedSessionService.isSessionQualifiedForFallIncentive.mockResolvedValueOnce(
      false
    )
    mockedMailService.sendStillTimeToHaveQualifyingSessionEmail.mockRejectedValueOnce(
      error
    )

    const jobData: Job<EmailFallIncentiveSessionQualificationJobData> = {
      data: {
        userId: user.id,
        sessionId,
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
