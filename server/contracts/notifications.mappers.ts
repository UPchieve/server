import type { Notification, SessionNotification } from '../models/Notification'
import type {
  NotificationPublic,
  SessionNotificationPublic,
} from '../contracts/notifications'

export function toNotificationPublic(
  notification: Notification
): NotificationPublic {
  return {
    id: notification.id,
    volunteer: notification.volunteer,
    sentAt: notification.sentAt?.toISOString(),
    type: notification.type,
    method: notification.method,
    wasSuccessful: notification.wasSuccessful,
    messageId: notification.messageId,
    priorityGroup: notification.priorityGroup,
    sessionId: notification.sessionId,
  }
}

function toSessionNotificationVolunteerPublic(data: {
  firstname: string
  volunteerPartnerOrg: string
}) {
  return {
    firstname: data.firstname,
    firstName: data.firstname,
    volunteerPartnerOrg: data.volunteerPartnerOrg,
  }
}

export function toSessionNotificationPublic(
  notification: SessionNotification
): SessionNotificationPublic {
  return {
    id: notification.id,
    volunteer: toSessionNotificationVolunteerPublic(notification.volunteer),
    sentAt: notification.sentAt?.toISOString(),
    type: notification.type,
    method: notification.method,
    wasSuccessful: notification.wasSuccessful,
    messageId: notification.messageId,
    priorityGroup: notification.priorityGroup,
    sessionId: notification.sessionId,
  }
}
