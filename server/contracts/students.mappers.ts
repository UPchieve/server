import type {
  PastVolunteerPublic,
  StudentPartnerOrgInstancePublic,
} from './students'
import type {
  PastVolunteer,
  StudentPartnerOrgInstance,
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
