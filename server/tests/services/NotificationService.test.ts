import { mocked } from 'jest-mock'
import { getDbUlid } from '../../models/pgUtils'
import * as NotificationRepo from '../../models/Notification'
import {
  createEmailNotification,
  getEmailNotificationsByEmailTemplateId,
  hasEmailBeenSent,
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

describe('getEmailNotificationsByEmailTemplateId', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should get email notifications', async () => {
    const userId = getDbUlid()
    const emailTemplateId = 'template-123'
    const mockResults = [
      {
        emailTemplateId,
        sentAt: new Date(),
      },
    ]
    mockedNotificationRepo.getEmailNotificationsByEmailTemplateId.mockResolvedValueOnce(
      mockResults
    )

    const results = await getEmailNotificationsByEmailTemplateId(
      userId,
      emailTemplateId
    )
    expect(results).toEqual(mockResults)
    expect(
      mockedNotificationRepo.getEmailNotificationsByEmailTemplateId
    ).toHaveBeenCalledWith(userId, emailTemplateId, undefined, undefined)
  })
})

describe('hasEmailBeenSent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should return true if an email has been sent', async () => {
    const userId = getDbUlid()
    const templateId = 'template-123'
    const startDate = new Date()
    mockedNotificationRepo.getEmailNotificationsByEmailTemplateId.mockResolvedValueOnce(
      [{ emailTemplateId: templateId, sentAt: startDate }]
    )

    const result = await hasEmailBeenSent(userId, templateId, startDate)
    expect(result).toBe(true)
    expect(
      mockedNotificationRepo.getEmailNotificationsByEmailTemplateId
    ).toHaveBeenCalledWith(userId, templateId, startDate, undefined)
  })

  test('Should return false if no email has been sent', async () => {
    const userId = getDbUlid()
    const templateId = 'template-123'
    const startDate = new Date()
    mockedNotificationRepo.getEmailNotificationsByEmailTemplateId.mockResolvedValueOnce(
      []
    )

    const result = await hasEmailBeenSent(userId, templateId, startDate)
    expect(result).toBe(false)
    expect(
      mockedNotificationRepo.getEmailNotificationsByEmailTemplateId
    ).toHaveBeenCalledWith(userId, templateId, startDate, undefined)
  })
})
