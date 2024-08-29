import { Ulid } from '../pgUtils'

export type Assignment = {
  id: Ulid
  class_id: Ulid
  description?: string
  title?: string
  number_of_sessions?: Number
  min_duration_in_minutes?: Number
  due_date?: Date
  start_at?: Date
  subject_id?: Number
  created_at: Date
  updatedAt: Date
}

export type CreateAssignmentPayload = Pick<Assignment, 'id' | 'class_id'>