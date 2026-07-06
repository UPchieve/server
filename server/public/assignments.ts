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
    firstName: assignment.firstName,
    lastName: assignment.lastName,
    submittedAt: assignment.submittedAt?.toISOString(),
    // Frontend currently uses the snake casing
    // TODO: refactor frontend to use camel casing
    first_name: assignment.firstName,
    last_name: assignment.lastName,
    submitted_at: assignment.submittedAt?.toISOString(),
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
