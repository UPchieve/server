import {
  AssignmentDocumentPublic,
  AssignmentPublic,
  StudentAssignmentPublic,
  StudentAssignmentSubmissionPublic,
} from '../contracts/assignments'
import {
  Assignment,
  StudentAssignment,
  StudentAssignmentCompletionRow,
} from '../models/Assignments'
import { BlobDocument } from '../services/AzureService'

export function toAssignmentPublic(assignment: Assignment): AssignmentPublic {
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

export function toStudentAssignmentPublic(
  assignment: StudentAssignment
): StudentAssignmentPublic {
  return {
    id: assignment.id,
    assignedAt: assignment.assignedAt.toISOString(),
    classId: assignment.classId,
    className: assignment.className,
    description: assignment.description,
    title: assignment.title,
    numberOfSessions: assignment.numberOfSessions,
    minDurationInMinutes: assignment.minDurationInMinutes,
    isRequired: assignment.isRequired,
    dueDate: assignment.dueDate?.toISOString(),
    startDate: assignment.startDate?.toISOString(),
    subjectId: assignment.subjectId,
    subjectName: assignment.subjectName,
    submittedAt: assignment.submittedAt?.toISOString(),
  }
}
