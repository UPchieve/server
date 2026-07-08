import type {
  FavoriteVolunteerPublic,
  StudentPartnerOrgInstancePublic,
} from '../contracts/students'
import type {
  FavoriteVolunteer,
  StudentPartnerOrgInstance,
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
