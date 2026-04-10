import { Uuid } from '../../types/shared'

export type StudentPartnerOrgForRegistration = {
  key: string
  schoolSignupRequired: boolean
  sites?: string[]
}

// TODO: Normalize the StudentPartnerOrg shape
export type StudentPartnerOrg = {
  id?: Uuid
  collegeSignup: boolean
  highSchoolSignup: boolean
  key: string
  name: string
  schoolSignupRequired: boolean
  signupCode: string
  sites?: string[]
  isSchool: boolean
  deactivated?: boolean
  schoolId?: string
}

export type CreateUserStudentPartnerOrgInstancePayload = {
  userId: string
  studentPartnerOrgId: string
  studentPartnerOrgSiteId?: string
}

export type GetStudentPartnerOrgResult = {
  partnerId: string
  partnerKey: string
  partnerName: string
  siteId?: string
  siteName?: string
  schoolId?: string
}

export type StudentPartnerOrgUpchieveInstance = {
  studentPartnerOrgId: string
  deactivatedOn: Date | null
}
