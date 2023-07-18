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
  sessionId: Ulid
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
