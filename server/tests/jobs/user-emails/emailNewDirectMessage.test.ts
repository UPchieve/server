import { mocked } from 'jest-mock'
import type { Job } from 'bull'
import emailNewDirectMessage, {
  DM_EMAIL_THROTTLE_SECONDS,
  EmailNewDirectMessageJobData,
  getDmEmailThrottleKey,
} from '../../../worker/jobs/user-emails/emailNewDirectMessage'
import * as cache from '../../../cache'
import * as DirectMessageRepo from '../../../models/DirectMessage'
import * as UserRepo from '../../../models/User'
import * as MailService from '../../../services/MailService'
import * as PresenceService from '../../../services/PresenceService'
import { USER_BAN_TYPES } from '../../../constants'
import { buildUserContactInfo } from '../../mocks/generate'

jest.mock('../../../cache')
jest.mock('../../../models/DirectMessage')
jest.mock('../../../models/User')
jest.mock('../../../services/MailService')
jest.mock('../../../services/PresenceService')

const mockedCache = mocked(cache)
const mockedDirectMessageRepo = mocked(DirectMessageRepo)
const mockedUserRepo = mocked(UserRepo)
const mockedMailService = mocked(MailService)
const mockedPresenceService = mocked(PresenceService)

function buildRecipient(overrides = {}) {
  return {
    ...buildUserContactInfo(),
    createdAt: new Date(),
    isTestUser: false,
    isDeactivated: false,
    isVolunteer: false,
    ...overrides,
  }
}

function buildJob(data: EmailNewDirectMessageJobData) {
  return { data } as Job<EmailNewDirectMessageJobData>
}

beforeEach(() => {
  jest.resetAllMocks()
  mockedPresenceService.isUserOnline.mockResolvedValue(false)
})

describe('emailNewDirectMessage', () => {
  test.each(['student', 'volunteer'] as const)(
    'sends the %s email with the unread count when not throttled',
    async (recipientRole) => {
      const recipient = buildRecipient({
        isVolunteer: recipientRole === 'volunteer',
      })
      mockedUserRepo.getReportedUser.mockResolvedValue(recipient)
      mockedDirectMessageRepo.getUnreadDirectMessageCount.mockResolvedValue(3)
      mockedCache.setIfNotExists.mockResolvedValue(true)

      await emailNewDirectMessage(
        buildJob({ recipientId: recipient.id, recipientRole })
      )

      expect(mockedCache.setIfNotExists).toHaveBeenCalledWith(
        getDmEmailThrottleKey(recipient.id),
        expect.any(String),
        DM_EMAIL_THROTTLE_SECONDS
      )
      expect(
        mockedMailService.sendNewDirectMessageNotification
      ).toHaveBeenCalledWith(
        recipient.email,
        recipient.firstName,
        recipientRole,
        3
      )
    }
  )

  test('does not email a coach who is online, and does not use the throttle', async () => {
    const recipient = buildRecipient({ isVolunteer: true })
    mockedUserRepo.getReportedUser.mockResolvedValue(recipient)
    mockedPresenceService.isUserOnline.mockResolvedValue(true)

    await emailNewDirectMessage(
      buildJob({ recipientId: recipient.id, recipientRole: 'volunteer' })
    )

    expect(mockedPresenceService.isUserOnline).toHaveBeenCalledWith(
      recipient.id,
      'volunteer'
    )
    expect(mockedCache.setIfNotExists).not.toHaveBeenCalled()
    expect(
      mockedMailService.sendNewDirectMessageNotification
    ).not.toHaveBeenCalled()
  })

  test('does not check online status for students', async () => {
    const recipient = buildRecipient()
    mockedUserRepo.getReportedUser.mockResolvedValue(recipient)
    mockedDirectMessageRepo.getUnreadDirectMessageCount.mockResolvedValue(1)
    mockedCache.setIfNotExists.mockResolvedValue(true)

    await emailNewDirectMessage(
      buildJob({ recipientId: recipient.id, recipientRole: 'student' })
    )

    expect(mockedPresenceService.isUserOnline).not.toHaveBeenCalled()
    expect(
      mockedMailService.sendNewDirectMessageNotification
    ).toHaveBeenCalled()
  })

  test('does not send when an email was already sent within the hour', async () => {
    const recipient = buildRecipient()
    mockedUserRepo.getReportedUser.mockResolvedValue(recipient)
    mockedDirectMessageRepo.getUnreadDirectMessageCount.mockResolvedValue(2)
    mockedCache.setIfNotExists.mockResolvedValue(false)

    await emailNewDirectMessage(
      buildJob({ recipientId: recipient.id, recipientRole: 'student' })
    )

    expect(
      mockedMailService.sendNewDirectMessageNotification
    ).not.toHaveBeenCalled()
  })

  test('does not send or use the throttle when there are no unread messages', async () => {
    const recipient = buildRecipient()
    mockedUserRepo.getReportedUser.mockResolvedValue(recipient)
    mockedDirectMessageRepo.getUnreadDirectMessageCount.mockResolvedValue(0)

    await emailNewDirectMessage(
      buildJob({ recipientId: recipient.id, recipientRole: 'student' })
    )

    expect(mockedCache.setIfNotExists).not.toHaveBeenCalled()
    expect(
      mockedMailService.sendNewDirectMessageNotification
    ).not.toHaveBeenCalled()
  })

  test('does not send when the recipient is not found (e.g. deactivated)', async () => {
    mockedUserRepo.getReportedUser.mockResolvedValue(undefined)

    await emailNewDirectMessage(
      buildJob({ recipientId: 'missing-user', recipientRole: 'volunteer' })
    )

    expect(mockedCache.setIfNotExists).not.toHaveBeenCalled()
    expect(
      mockedMailService.sendNewDirectMessageNotification
    ).not.toHaveBeenCalled()
  })

  test('does not send when the recipient is completely banned', async () => {
    const recipient = buildRecipient({ banType: USER_BAN_TYPES.COMPLETE })
    mockedUserRepo.getReportedUser.mockResolvedValue(recipient)

    await emailNewDirectMessage(
      buildJob({ recipientId: recipient.id, recipientRole: 'student' })
    )

    expect(mockedCache.setIfNotExists).not.toHaveBeenCalled()
    expect(
      mockedMailService.sendNewDirectMessageNotification
    ).not.toHaveBeenCalled()
  })

  test('releases the throttle and rethrows when the email fails to send', async () => {
    const recipient = buildRecipient()
    mockedUserRepo.getReportedUser.mockResolvedValue(recipient)
    mockedDirectMessageRepo.getUnreadDirectMessageCount.mockResolvedValue(1)
    mockedCache.setIfNotExists.mockResolvedValue(true)
    mockedMailService.sendNewDirectMessageNotification.mockRejectedValue(
      new Error('SendGrid down')
    )

    await expect(
      emailNewDirectMessage(
        buildJob({ recipientId: recipient.id, recipientRole: 'student' })
      )
    ).rejects.toThrow('SendGrid down')

    expect(mockedCache.remove).toHaveBeenCalledWith(
      getDmEmailThrottleKey(recipient.id)
    )
  })
})
