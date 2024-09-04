import { Ulid } from '../pgUtils'

export type Assignment = {
  id: Ulid
  classId: Ulid
  description?: string
  title?: string
  numberOfSessions?: number
  minDurationInMinutes?: number
  isRequired: boolean
  dueDate?: Date
  startDate?: Date
  subjectId?: number
  createdAt: Date
  updatedAt: Date
}

export type CreateAssignmentPayload = Pick<
  Assignment,
  | 'classId'
  | 'description'
  | 'title'
  | 'numberOfSessions'
  | 'minDurationInMinutes'
  | 'isRequired'
  | 'dueDate'
  | 'startDate'
  | 'subjectId'
>
