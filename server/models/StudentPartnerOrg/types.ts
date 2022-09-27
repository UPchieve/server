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
}
