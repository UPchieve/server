export type StudentPartnerOrgForRegistration = {
  key: string
  sites?: string[]
}

export type StudentPartnerOrg = {
  collegeSignup: boolean
  highSchoolSignup: boolean
  key: string
  schoolSignupRequired: boolean
  signupCode: string
  sites?: string[]
}
