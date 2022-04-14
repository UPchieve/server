import { Ulid, Uuid } from '../pgUtils'

export type AssistmentsData = {
  id: Ulid
  problemId: number
  assignmentId: Uuid
  studentId: Uuid
  sessionId: Ulid
  sent: boolean
  sentAt?: Date
  createdAt: Date
  updatedAt: Date
}
