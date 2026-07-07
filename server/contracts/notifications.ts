import type { ISODateString } from '../types/dates'
import type { Uuid } from '../types/shared'

export type NotificationPublic = {
  id: Uuid
  //   Normalize this property for SessionNotification and Notification
  volunteer: Uuid
  sentAt?: ISODateString
  type: string
  method: string
  wasSuccessful?: boolean
  messageId?: string
  priorityGroup: string
  sessionId?: Uuid
}

export type SessionNotificationPublic = Omit<
  NotificationPublic,
  'volunteer'
> & {
  volunteer: {
    // old firstName for legacy compatibility
    firstname: string
    firstName: string
    volunteerPartnerOrg: string
  }
}
