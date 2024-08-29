import { Ulid } from '../pgUtils'

export type Assignment = {
  id: Ulid
  classId: Ulid
  description?: string
  title?: string
  numberOfSessions?: Number
  minDurationInMinutes?: Number
  dueDate?: Date
  startAt?: Date
  subjectId?: Number
  createdAt: Date
  updatedAt: Date
}

export type CreateAssignmentPayload = Pick<Assignment, 'id' | 'classId'>