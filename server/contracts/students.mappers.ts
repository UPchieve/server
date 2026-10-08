import type {
  PastVolunteerPublic,
  StudentPartnerOrgInstancePublic,
  StudentUserProfilePublic,
} from './students'
import type {
  PastVolunteer,
  StudentPartnerOrgInstance,
  StudentUserProfile,
} from '../models/Student'

export function toPastVolunteerPublic(
  volunteer: PastVolunteer
): PastVolunteerPublic {
  return {
    volunteerId: volunteer.volunteerId,
    firstName: volunteer.firstName,
    numSessions: volunteer.numSessions,
    isFavorite: volunteer.isFavorite,
  }
}

export function toStudentPartnerOrgInstancePublic(
  org: StudentPartnerOrgInstance
): StudentPartnerOrgInstancePublic {
  return {
    id: org.id,
    name: org.name,
    schoolId: org.schoolId,
    siteName: org.siteName,
  }
}

export function toStudentProfilePublic(
  student: StudentUserProfile
): StudentUserProfilePublic {
  return {
    id: student.id,
    userId: student.id,
    email: student.email,
    firstName: student.firstName,
    lastName: student.lastName,
    gradeLevel: student.gradeLevel,
    schoolId: student.schoolId,
    createdAt: student.createdAt.toISOString(),
  }
}
