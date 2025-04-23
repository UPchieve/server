/**
 * Model that stores information about notifications,
 * such as SMS messages, sent by the app when students
 * request help and new sessions are created.
 */
import { ExtractValues } from '../../utils/type-utils'
import { Ulid } from '../pgUtils'

export type Notification = {
  id: Ulid
  // old name for volunteerId for legacy compatibility
  volunteer: Ulid
  sentAt?: Date
  type: string
  method: string
  wasSuccessful?: boolean
  messageId?: string // twilio/messaging service id
  priorityGroup: string // volunteer priority group (i.e. notified last 24 hours, etc)
  sessionId?: Ulid //  email notifications may not have a sesssion id associated with  it
}

export const NotificationType = <const>{
  REGULAR: 'REGULAR',
  FAILSAFE: 'FAILSAFE',
}
export type NotificationType = ExtractValues<typeof NotificationType>

export const NotificationMethod = <const>{
  SMS: 'SMS',
  VOICE: 'VOICE',
  EMAIL: 'EMAIL',
}
export type NotificationMethod = ExtractValues<typeof NotificationMethod>

export type EmailNotification = {
  userId: Ulid
  sessionId?: Ulid
  emailTemplateId: string
  sentAt: Date
}

export type CreateEmailNotificationProps = {
  userId: Ulid
  sessionId?: Ulid
  emailTemplateId: string
}

export type GetEmailNotificationsProps = {
  emailTemplateId: string
  userId?: Ulid
  sessionId?: Ulid
  start?: Date
  end?: Date
}
