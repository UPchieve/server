import * as NotificationRepo from '../models/Notification'
import { Ulid } from '../models/pgUtils'

export async function createEmailNotification(
  data: NotificationRepo.CreateEmailNotificationProps
) {
  return NotificationRepo.createEmailNotification(data)
}

export async function getEmailNotificationsByTemplateId(
  data: NotificationRepo.GetEmailNotificationsProps
) {
  return NotificationRepo.getEmailNotificationsByTemplateId(data)
}
