import { Ulid } from '../pgUtils'

export type SessionAudioCreatedByRole = 'student' | 'volunteer'
export type SessionAudio = {
  id: Ulid
  sessionId: Ulid
  createdBy: SessionAudioCreatedByRole
  createdAt: Date
  updatedAt: Date
  resourceUri?: string
  studentJoinedAt?: Date
  volunteerJoinedAt?: Date
}
