import type {
  FavoriteVolunteerPublic,
  StudentPartnerOrgInstancePublic,
  StudentUserProfilePublic,
} from '../contracts/students'
import type {
  FavoriteVolunteer,
  StudentPartnerOrgInstance,
  StudentUserProfile,
} from '../models/Student'

export function toFavoriteVolunteerPublic(
  volunteer: FavoriteVolunteer
): FavoriteVolunteerPublic {
  return {
    volunteerId: volunteer.volunteerId,
    firstName: volunteer.firstName,
    numSessions: volunteer.numSessions,
  }
}

export function toStudentPartnerOrgInstancePublic(
  org: StudentPartnerOrgInstance
): StudentPartnerOrgInstancePublic {
  return {
    id: org.id,
    name: org.name,
    schoolId: org?.schoolId,
    siteName: org?.siteName,
  }
}

export function toStudentProfilePublic(
  student: StudentUserProfile
): StudentUserProfilePublic {
  return {
    id: student.id,
    email: student.email,
    firstName: student.firstName,
    gradeLevel: student.gradeLevel,
    schoolId: student.schoolId,
    lastName: student.lastName,
    createdAt: student.createdAt.toISOString(),
  }
}
