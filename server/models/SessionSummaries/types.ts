import { Uuid } from '../pgUtils'

export type SessionSummary = {
  id: Uuid
  sessionId: Uuid
  summary: string
  userType: string
  traceId?: string
  createdAt: Date
}
