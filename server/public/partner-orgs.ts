import type {
  SponsorOrgPublic,
  StudentPartnerOrgPublic,
  VolunteerPartnerOrgPublic,
} from '../contracts/partner-orgs'
import type { SponsorOrg } from '../models/SponsorOrg'
import type { StudentPartnerOrg } from '../models/StudentPartnerOrg'
import type { VolunteerPartnerOrg } from '../models/VolunteerPartnerOrg'

export function toVolunteerPartnerOrgPublic(
  org: VolunteerPartnerOrg
): VolunteerPartnerOrgPublic {
  return {
    key: org.key,
    name: org.name,
    receiveWeeklyHourSummaryEmail: org.receiveWeeklyHourSummaryEmail,
    domains: org.domains,
    deactivated: org.deactivated,
  }
}

export function toStudentPartnerOrgPublic(
  org: StudentPartnerOrg
): StudentPartnerOrgPublic {
  return {
    id: org.id,
    key: org.key,
    name: org.name,
    collegeSignup: org.collegeSignup,
    highSchoolSignup: org.highSchoolSignup,
    schoolSignupRequired: org.schoolSignupRequired,
    signupCode: org.signupCode,
    isSchool: org.isSchool,
    sites: org.sites,
    deactivated: org.deactivated,
    schoolId: org.schoolId,
  }
}

export function toSponsorOrgPublic(org: SponsorOrg): SponsorOrgPublic {
  return {
    key: org.key,
    name: org.name,
    schoolIds: org.schoolIds,
    studentPartnerOrgKeys: org.studentPartnerOrgKeys,
  }
}
