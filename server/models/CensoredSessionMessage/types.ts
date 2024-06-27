import { Ulid } from '../pgUtils'
import { CENSORED_BY } from './queries'

export type CensoredSessionMessage = {
  id: Ulid
  senderId: Ulid
  message: string
  sessionId: Ulid
  censoredBy: keyof typeof CENSORED_BY
  sentAt: Date
}
