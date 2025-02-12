import { Uuid } from '../pgUtils'

export type SessionMeeting = {
  id: Uuid
  externalId: string
  provider: string
  sessionId: Uuid
  createdAt: Date
  updatedAt: Date
}
