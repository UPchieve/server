import { mocked } from 'jest-mock'
import emailFallIncentiveRewards from '../../../worker/jobs/student-emails/emailFallIncentiveRewards'
import { Jobs } from '../../../worker/jobs'
import * as MailService from '../../../services/MailService'
import * as TremendousService from '../../../services/TremendousService'
import * as NotificationService from '../../../services/NotificationService'
import * as IncentiveProgramService from '../../../services/IncentiveProgramService'
import { buildUser, buildUserProductFlags } from '../../mocks/generate'
import config from '../../../config'
import { log } from '../../../worker/logger'
import { getDbUlid } from '../../../models/pgUtils'

jest.mock('../../../logger')
jest.mock('../../../services/MailService')
jest.mock('../../../services/TremendousService')
jest.mock('../../../services/NotificationService')
jest.mock('../../../services/IncentiveProgramService')

const mockedMailService = mocked(MailService)
const mockedTremendousService = mocked(TremendousService)
const mockedNotificationService = mocked(NotificationService)
const mockedIncentiveProgramService = mocked(IncentiveProgramService)

describe('emailFallIncentiveRewards', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should do nothing if no notifications are found', async () => {
    mockedNotificationService.getEmailNotificationsByTemplateId.mockResolvedValueOnce(
      []
    )

    await emailFallIncentiveRewards()
    expect(TremendousService.createGiftCardRewardLink).not.toHaveBeenCalled()
    expect(MailService.sendFallIncentiveGiftCardEmail).not.toHaveBeenCalled()
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(
      `${Jobs.EmailFallIncentiveRewards} total sent gift cards 0`
    )
  })

  test('Should skip processing if no fall incentive data found', async () => {
    const notification = {
      userId: getDbUlid(),
      sessionId: getDbUlid(),
      sentAt: new Date(),
      emailTemplateId: config.sendgrid.qualifiedForGiftCardTemplate,
    }
    mockedNotificationService.getEmailNotificationsByTemplateId.mockResolvedValueOnce(
      [notification]
    )
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      undefined
    )

    await emailFallIncentiveRewards()
    expect(TremendousService.createGiftCardRewardLink).not.toHaveBeenCalled()
    expect(MailService.sendFallIncentiveGiftCardEmail).not.toHaveBeenCalled()
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(
      `${Jobs.EmailFallIncentiveRewards} no fall incentive data found for student ${notification.userId}`
    )
    expect(log).toHaveBeenCalledWith(
      `${Jobs.EmailFallIncentiveRewards} total sent gift cards 0`
    )
  })

  test('Should skip if user has already received a gift card', async () => {
    const user = buildUser()
    const notification = {
      userId: getDbUlid(),
      sessionId: getDbUlid(),
      sentAt: new Date(),
      emailTemplateId: config.sendgrid.qualifiedForGiftCardTemplate,
    }
    mockedNotificationService.getEmailNotificationsByTemplateId.mockResolvedValueOnce(
      [notification]
    )
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags(),
        incentiveProgramDate: new Date(),
      }
    )
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(true)

    await emailFallIncentiveRewards()
    expect(NotificationService.hasUserBeenSentEmail).toHaveBeenCalledWith({
      userId: user.id,
      emailTemplateId: config.sendgrid.fallIncentiveGiftCardTemplate,
      start: expect.any(Date),
    })
    expect(TremendousService.createGiftCardRewardLink).not.toHaveBeenCalled()
    expect(MailService.sendFallIncentiveGiftCardEmail).not.toHaveBeenCalled()
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(
        `${Jobs.EmailFallIncentiveRewards} student ${user.id} has already received gift card for`
      )
    )
    expect(log).toHaveBeenCalledWith(
      `${Jobs.EmailFallIncentiveRewards} total sent gift cards 0`
    )
  })

  test('Should log an error if gift card reward link creation fails', async () => {
    const user = buildUser()
    const notification = {
      userId: user.id,
      sessionId: getDbUlid(),
      sentAt: new Date(),
      emailTemplateId: config.sendgrid.qualifiedForGiftCardTemplate,
    }
    mockedNotificationService.getEmailNotificationsByTemplateId.mockResolvedValueOnce(
      [notification]
    )
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags(),
        incentiveProgramDate: new Date(),
      }
    )
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedTremendousService.createGiftCardRewardLink.mockResolvedValueOnce(
      undefined
    )

    await emailFallIncentiveRewards()
    expect(NotificationService.hasUserBeenSentEmail).toHaveBeenCalledWith({
      userId: user.id,
      emailTemplateId: config.sendgrid.fallIncentiveGiftCardTemplate,
      start: expect.any(Date),
    })
    expect(TremendousService.createGiftCardRewardLink).toHaveBeenCalledWith({
      name: user.firstName,
      email: user.email,
      externalId: notification.sessionId,
      method: 'LINK',
      amount: 10,
    })
    expect(MailService.sendFallIncentiveGiftCardEmail).not.toHaveBeenCalled()
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(
      `${Jobs.EmailFallIncentiveRewards} failed to create a gift card reward link for student ${user.id} for session ${notification.sessionId}`
    )
    expect(log).toHaveBeenCalledWith(
      `${Jobs.EmailFallIncentiveRewards} total sent gift cards 0`
    )
  })

  test('Should send gift card and create notification when successful', async () => {
    const user = buildUser()
    const notification = {
      userId: user.id,
      sessionId: getDbUlid(),
      sentAt: new Date(),
      emailTemplateId: 'template-123',
    }
    const rewardLink = 'https://reward-link.com'

    mockedNotificationService.getEmailNotificationsByTemplateId.mockResolvedValueOnce(
      [notification]
    )
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags(),
        incentiveProgramDate: new Date(),
      }
    )
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedTremendousService.createGiftCardRewardLink.mockResolvedValueOnce(
      rewardLink
    )

    await emailFallIncentiveRewards()
    expect(NotificationService.hasUserBeenSentEmail).toHaveBeenCalledWith({
      userId: user.id,
      emailTemplateId: config.sendgrid.fallIncentiveGiftCardTemplate,
      start: expect.any(Date),
    })
    expect(TremendousService.createGiftCardRewardLink).toHaveBeenCalledWith({
      name: user.firstName,
      email: user.email,
      externalId: notification.sessionId,
      method: 'LINK',
      amount: 10,
    })
    expect(MailService.sendFallIncentiveGiftCardEmail).toHaveBeenCalledWith(
      user.email,
      user.firstName,
      rewardLink
    )
    expect(NotificationService.createEmailNotification).toHaveBeenCalledWith({
      userId: user.id,
      sessionId: notification.sessionId,
      emailTemplateId: config.sendgrid.fallIncentiveGiftCardTemplate,
    })
    expect(log).toHaveBeenCalledWith(
      `${Jobs.EmailFallIncentiveRewards} sent student ${user.id} gift card`
    )
    expect(log).toHaveBeenCalledWith(
      `${Jobs.EmailFallIncentiveRewards} total sent gift cards 1`
    )
  })

  test('Should catch and log errors when sending gift cards', async () => {
    const user = buildUser()
    const notification = {
      userId: user.id,
      sessionId: getDbUlid(),
      sentAt: new Date(),
      emailTemplateId: 'template-123',
    }
    const rewardLink = 'https://reward-link.com'
    const error = 'Failed to send gift card'
    mockedNotificationService.getEmailNotificationsByTemplateId.mockResolvedValueOnce(
      [notification]
    )
    mockedIncentiveProgramService.getUserFallIncentiveData.mockResolvedValueOnce(
      {
        user,
        productFlags: buildUserProductFlags(),
        incentiveProgramDate: new Date(),
      }
    )
    mockedNotificationService.hasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedTremendousService.createGiftCardRewardLink.mockResolvedValueOnce(
      rewardLink
    )
    mockedMailService.sendFallIncentiveGiftCardEmail.mockRejectedValueOnce(
      error
    )

    await expect(emailFallIncentiveRewards()).rejects.toThrow(
      `Failed to send EmailFallIncentiveRewards to: Failed to send ${Jobs.EmailFallIncentiveRewards} to student ${user.id}: ${error}`
    )
    expect(NotificationService.hasUserBeenSentEmail).toHaveBeenCalledWith({
      userId: user.id,
      emailTemplateId: config.sendgrid.fallIncentiveGiftCardTemplate,
      start: expect.any(Date),
    })
    expect(TremendousService.createGiftCardRewardLink).toHaveBeenCalledWith({
      name: user.firstName,
      email: user.email,
      externalId: notification.sessionId,
      method: 'LINK',
      amount: 10,
    })
    expect(MailService.sendFallIncentiveGiftCardEmail).toHaveBeenCalledWith(
      user.email,
      user.firstName,
      rewardLink
    )
    expect(NotificationService.createEmailNotification).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(
      `${Jobs.EmailFallIncentiveRewards} error processing user ${user.id}: ${error}`
    )
    expect(log).toHaveBeenCalledWith(
      `${Jobs.EmailFallIncentiveRewards} total sent gift cards 0`
    )
  })
})
