import { mocked } from 'jest-mock'
import { getDbUlid } from '../../models/pgUtils'
import * as NotificationRepo from '../../models/Notification'
import {
  createEmailNotification,
  getEmailNotificationsByTemplateId,
  hasUserBeenSentEmail,
} from '../../services/NotificationService'

jest.mock('../../models/Notification')

const mockedNotificationRepo = mocked(NotificationRepo)

describe('createEmailNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create an email notification', async () => {
    const data = {
      userId: getDbUlid(),
      sessionId: getDbUlid(),
      emailTemplateId: 'template-123',
    }
    mockedNotificationRepo.createEmailNotification.mockResolvedValueOnce()

    await createEmailNotification(data)
    expect(mockedNotificationRepo.createEmailNotification).toHaveBeenCalledWith(
      data
    )
  })
})

describe('getEmailNotificationsByTemplateId', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should get email notifications', async () => {
    const userId = getDbUlid()
    const emailTemplateId = 'template-123'
    const mockResults = [
      {
        userId,
        emailTemplateId,
        sentAt: new Date(),
      },
    ]
    mockedNotificationRepo.getEmailNotificationsByTemplateId.mockResolvedValueOnce(
      mockResults
    )

    const results = await getEmailNotificationsByTemplateId({
      userId,
      emailTemplateId,
    })
    expect(results).toEqual(mockResults)
    expect(
      mockedNotificationRepo.getEmailNotificationsByTemplateId
    ).toHaveBeenCalledWith({ userId, emailTemplateId })
  })
})

describe('hasUserBeenSentEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should return true if an email has been sent', async () => {
    const userId = getDbUlid()
    const emailTemplateId = 'template-123'
    const start = new Date()
    mockedNotificationRepo.getEmailNotificationsByTemplateId.mockResolvedValueOnce(
      [{ userId, emailTemplateId, sentAt: start }]
    )
    const data = { userId, emailTemplateId, start }

    const result = await hasUserBeenSentEmail(data)
    expect(result).toBe(true)
    expect(
      mockedNotificationRepo.getEmailNotificationsByTemplateId
    ).toHaveBeenCalledWith(data)
  })

  test('Should return false if no email has been sent', async () => {
    const userId = getDbUlid()
    const emailTemplateId = 'template-123'
    const start = new Date()
    mockedNotificationRepo.getEmailNotificationsByTemplateId.mockResolvedValueOnce(
      []
    )
    const data = { userId, emailTemplateId, start }

    const result = await hasUserBeenSentEmail(data)
    expect(result).toBe(false)
    expect(
      mockedNotificationRepo.getEmailNotificationsByTemplateId
    ).toHaveBeenCalledWith(data)
  })
})
