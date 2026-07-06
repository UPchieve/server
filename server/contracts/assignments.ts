import type { ISODateString } from '../types/dates'
import type { Uuid } from '../types/shared'

export type AssignmentPublic = {
  id: Uuid
  classId: Uuid
  description?: string
  dueDate?: ISODateString
  isRequired: boolean
  minDurationInMinutes?: number
  numberOfSessions?: number
  startDate?: ISODateString
  subjectId?: number
  title?: string
  isGettingStartedAssignment?: boolean
  createdAt: ISODateString
}

// TODO: There's a mismatch between the data and the PgTyped type since the
// query returns the columns/properties in underscores and not camelCased.
// We'll need to refactor the frontend first to use the camelCased properties
export type StudentAssignmentSubmissionPublic = {
  firstName: string
  lastName: string
  submittedAt?: ISODateString
  first_name: string
  last_name: string
  submitted_at?: ISODateString
}

export type AssignmentDocumentPublic = {
  name: string
  url: string
}

export type AssignmentResponse = {
  assignment?: AssignmentPublic
}

export type StudentAssignmentCompletionResponse = {
  studentAssignments: StudentAssignmentSubmissionPublic[]
}

export type AssignmentDocumentsResponse = {
  assignmentDocuments: AssignmentDocumentPublic[]
}

export type AssignmentUploadResponse = {
  // TODO: move to a shared types with other moderation types?
  moderationFailures: Record<string, string[]>
} | void
