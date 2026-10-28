import type {
  PastVolunteerPublic,
  PastVolunteerSessionPublic,
  StudentPartnerOrgInstancePublic,
  StudentUserProfilePublic,
} from './students'
import type {
  PastVolunteerSession,
  StudentPartnerOrgInstance,
  StudentUserProfile,
} from '../models/Student'
import type { PastVolunteerWithStats } from '../services/StudentService'

export function toPastVolunteerSessionPublic(
  session: PastVolunteerSession
): PastVolunteerSessionPublic {
  return {
    sessionId: session.sessionId,
    subjectName: session.subjectName,
    subjectDisplayName: session.subjectDisplayName,
    createdAt: session.createdAt.toISOString(),
    timeTutored: session.timeTutored,
  }
}

export function toPastVolunteerPublic(
  volunteer: PastVolunteerWithStats
): PastVolunteerPublic {
  return {
    volunteerId: volunteer.volunteerId,
    firstName: volunteer.firstName,
    numSessions: volunteer.numSessions,
    lastSession: toPastVolunteerSessionPublic(volunteer.lastSession),
    isFavorite: volunteer.isFavorite,
    publicProfileStats: volunteer.publicProfileStats,
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
