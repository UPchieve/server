/**
 * Model that stores push token information
 * to send to users for push notifications
 *
 */
import { Ulid } from '../pgUtils'

export type PushToken = {
  id: Ulid
  // Using old userId prop name for legacy compatibility
  user: Ulid
  token: string
  createdAt: Date
  updatedAt: Date
}
