import { Ulid } from '../pgUtils'

export type Assignment = {
  id: Ulid
  classId: Ulid
  description?: string
  title?: string
  numberOfSessions?: number
  minDurationInMinutes?: number
  dueDate?: Date
  startAt?: Date
  subjectId?: number
  createdAt: Date
  updatedAt: Date
}

export type CreateAssignmentPayload = Pick<
  Assignment,
  | 'id'
  | 'classId'
  | 'description'
  | 'title'
  | 'numberOfSessions'
  | 'minDurationInMinutes'
  | 'dueDate'
  | 'startAt'
  | 'subjectId'
>
