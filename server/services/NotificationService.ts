import * as NotificationRepo from '../models/Notification'
import { Ulid } from '../models/pgUtils'

export async function createEmailNotification(
  data: NotificationRepo.CreateEmailNotificationProps
) {
  return NotificationRepo.createEmailNotification(data)
}

export async function getEmailNotificationsByEmailTemplateId(
  userId: Ulid,
  emailTemplateId: string,
  start?: Date,
  end?: Date
) {
  return NotificationRepo.getEmailNotificationsByEmailTemplateId(
    userId,
    emailTemplateId,
    start,
    end
  )
}
