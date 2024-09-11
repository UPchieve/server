import * as NotificationRepo from '../models/Notification'
import { Ulid } from '../models/pgUtils'

export async function createEmailNotification(
  data: NotificationRepo.CreateEmailNotificationProps
) {
  return NotificationRepo.createEmailNotification(data)
}

export async function getUserEmailNotificationsByTemplateId(
  userId: Ulid,
  emailTemplateId: string,
  start?: Date,
  end?: Date
) {
  return NotificationRepo.getUserEmailNotificationsByTemplateId(
    userId,
    emailTemplateId,
    start,
    end
  )
}

export async function getAllEmailNotificationsByTemplateId(
  emailTemplateId: string,
  start?: Date,
  end?: Date
) {
  return NotificationRepo.getAllEmailNotificationsByTemplateId(
    emailTemplateId,
    start,
    end
  )
}
