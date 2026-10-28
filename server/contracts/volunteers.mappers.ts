import type {
  PastStudentPublic,
  VolunteerToReviewPublic,
} from '../contracts/volunteers'
import type {
  VolunteerPastStudent,
  VolunteerToReview,
} from '../models/Volunteer'

export function toVolunteerToReviewPublic(
  volunteer: VolunteerToReview
): VolunteerToReviewPublic {
  return {
    id: volunteer.id,
    _id: volunteer.id,
    firstName: volunteer.firstName,
    lastName: volunteer.lastName,
    firstname: volunteer.firstName,
    lastname: volunteer.lastName,
    email: volunteer.email,
    createdAt: volunteer.createdAt.toISOString(),
    readyForReviewAt: volunteer.readyForReviewAt.toISOString(),
  }
}

export function toPastStudentPublic(
  student: VolunteerPastStudent
): PastStudentPublic {
  return {
    studentId: student.studentId,
    firstName: student.firstName,
    sessionId: student.sessionId,
    subjectName: student.subjectName,
    subjectDisplayName: student.subjectDisplayName,
    createdAt: student.createdAt.toISOString(),
    timeTutored: student.timeTutored,
  }
}
