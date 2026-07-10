import type { Uuid } from '../types/shared'

export type VolunteerPartnerOrgPublic = {
  key: string
  name: string
  receiveWeeklyHourSummaryEmail: boolean
  domains?: string[]
  deactivated?: boolean
}

export type StudentPartnerOrgPublic = {
  id?: Uuid
  key: string
  name: string
  collegeSignup: boolean
  highSchoolSignup: boolean
  schoolSignupRequired: boolean
  signupCode: string
  isSchool: boolean
  sites?: string[]
  deactivated?: boolean
  schoolId?: string
}

export type SponsorOrgPublic = {
  key: string
  name?: string
  schoolIds?: string[]
  studentPartnerOrgKeys?: string[]
}
