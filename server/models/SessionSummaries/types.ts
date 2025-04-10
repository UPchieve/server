import { Ulid, Uuid } from '../pgUtils'

export type SessionSummary = {
  id: Ulid
  sessionId: Ulid
  summary?: string
  userType: number
  createdAt: Date
}
