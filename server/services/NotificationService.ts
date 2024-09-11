import * as NotificationRepo from '../models/Notification'
import { Ulid } from '../models/pgUtils'

export async function createEmailNotification(
  data: NotificationRepo.CreateEmailNotificationProps
) {
  return NotificationRepo.createEmailNotification(data)
}

export async function getEmailNotificationsByTemplateId(
  data: NotificationRepo.EmailNotificationsByTemplateIdProps
) {
  return NotificationRepo.getEmailNotificationsByTemplateId(data)
}

export async function hasEmailBeenSent(
  userId: string,
  templateId: string,
  startDate: Date
) {
  const emailActivity = await getEmailNotificationsByEmailTemplateId(
    userId,
    templateId,
    startDate
  )
  return emailActivity.length > 0
}
