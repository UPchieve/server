import {
  AssignmentDocumentPublic,
  AssignmentPublic,
  StudentAssignmentSubmissionPublic,
} from '../contracts/assignments'
import {
  Assignment,
  StudentAssignmentCompletionRow,
} from '../models/Assignments'
import { BlobDocument } from '../services/AzureService'

export function toAssigmentPublic(assignment: Assignment): AssignmentPublic {
  return {
    id: assignment.id,
    classId: assignment.classId,
    description: assignment.description,
    dueDate: assignment.dueDate?.toISOString(),
    isRequired: assignment.isRequired,
    minDurationInMinutes: assignment.minDurationInMinutes,
    numberOfSessions: assignment.numberOfSessions,
    startDate: assignment.startDate?.toISOString(),
    subjectId: assignment.subjectId,
    title: assignment.title,
    isGettingStartedAssignment: assignment.isGettingStartedAssignment,
    createdAt: assignment.createdAt.toISOString(),
  }
}

export function toStudentAssignmentSubmissionPublic(
  assignment: StudentAssignmentCompletionRow
): StudentAssignmentSubmissionPublic {
  return {
    firstName: assignment.first_name,
    lastName: assignment.last_name,
    submittedAt: assignment.submitted_at?.toISOString(),
    // Support camelcasing for current frontend
    first_name: assignment.first_name,
    last_name: assignment.last_name,
    submitted_at: assignment.submitted_at?.toISOString(),
  }
}

export function toAssignmentDocumentPublic(
  document: BlobDocument
): AssignmentDocumentPublic {
  return {
    name: document.name,
    url: document.url,
  }
}
