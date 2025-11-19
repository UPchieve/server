import moment from 'moment'
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

export async function hasUserBeenSentEmail(
  data: NotificationRepo.GetEmailNotificationsProps
): Promise<boolean> {
  const emailActivity = await getEmailNotificationsByTemplateId(data)
  return emailActivity.length > 0
}

export async function getTotalEmailsSentToUser(
  data: NotificationRepo.GetEmailNotificationsProps
): Promise<number> {
  const emailActivity = await getEmailNotificationsByTemplateId(data)
  return emailActivity.length
}

export async function getVolunteersTextedSinceXMinutesAgo(
  minutes: number
): Promise<Set<Ulid>> {
  const xMinutesAgoDate = moment().subtract(minutes, 'minutes').toDate()
  const volunteers = await NotificationRepo.getVolunteersNotifiedSince(
    xMinutesAgoDate,
    'sms'
  )
  return new Set(volunteers)
}
