export type StudentPartnerOrgForRegistration = {
  key: string
  schoolSignupRequired: boolean
  sites?: string[]
}

export type StudentPartnerOrg = {
  collegeSignup: boolean
  highSchoolSignup: boolean
  key: string
  name: string
  schoolSignupRequired: boolean
  signupCode: string
  sites?: string[]
  isSchool: boolean
  deactivated?: boolean
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
