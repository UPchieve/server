import { Ulid, Uuid } from '../pgUtils'

export type Assignment = {
  id: Ulid
  classId: Ulid
  description?: string
  dueDate?: Date
  isRequired: boolean
  minDurationInMinutes?: number
  numberOfSessions?: number
  startDate?: Date
  subjectId?: number
  title?: string
  createdAt: Date
  updatedAt: Date
}

export type CreateAssignmentInput = Pick<
  Assignment,
  | 'classId'
  | 'description'
  | 'dueDate'
  | 'isRequired'
  | 'minDurationInMinutes'
  | 'numberOfSessions'
  | 'startDate'
  | 'subjectId'
  | 'title'
>

export type EditAssignmentInput = Omit<
  Assignment,
  'classId' | 'createdAt' | 'updatedAt'
>

export type StudentAssignment = {
  id: Ulid
  assignedAt: Date
  classId: Ulid
  description?: string
  title?: string
  numberOfSessions?: number
  minDurationInMinutes?: number
  isRequired: boolean
  dueDate?: Date
  startDate?: Date
  subjectId?: number
  subjectName?: string
  submittedAt?: Date
}

export type CreateStudentAssignmentInput = {
  userId: Ulid
  assignmentId: Uuid
}
export type CreateStudentAssignmentResult = {
  userId: Ulid
  assignmentId: Uuid
  createdAt: Date
  updatedAt: Date
}
