import { Ulid } from '../pgUtils'

export type SessionAudio = {
  id: Ulid
  sessionId: Ulid
  createdAt: Date
  updatedAt: Date
  resourceUri?: string
  studentJoinedAt?: Date
  volunteerJoinedAt?: Date
}
