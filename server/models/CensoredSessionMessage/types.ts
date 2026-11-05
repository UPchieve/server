import { Ulid } from '../pgUtils'
import type { ModerationSystem } from '../../types/moderation'

export type CensoredSessionMessage = {
  id: Ulid
  senderId: Ulid
  message: string
  sessionId: Ulid
  censoredBy: ModerationSystem
  sentAt: Date
  shown: boolean
}
