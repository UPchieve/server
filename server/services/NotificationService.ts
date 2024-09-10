import * as NotificationRepo from '../models/Notification'
import { Ulid } from '../models/pgUtils'

export async function createEmailNotification(
  userId: Ulid,
  emailTemplateId: string
) {
  return NotificationRepo.createEmailNotification(userId, emailTemplateId)
}

export async function getEmailActivityByEmailTemplateId(
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
