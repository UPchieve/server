import type { ISODateString } from '../types/dates'
import type { SchoolPublic } from '../types/schools'
import type { Uuid } from '../types/shared'

export type CheckEligibilityPublic = {
  message?: string
  isEligible: boolean
  isCollegeStudent?: boolean
  isExistingUser?: boolean
}

export type IneligibleStudentsWithSchoolInfoPublic = {
  email: string
  zipCode?: string
  medianIncome?: number
  schoolId?: Uuid
  schoolName?: string
  schoolState?: string
  schoolCity?: string
  schoolZipCode?: string
  isApproved?: boolean
  ipAddress?: string
  createdAt: ISODateString
}

export type ZipCodePublic = {
  zipCode: string
  medianIncome: number
  cbsaIncome?: number
  stateIncome?: number
  isEligible: boolean
}

export type StudentSignupSourcesPublic = {
  id: number
  name: string
}

export type IsEligibleResponse = {
  isEligible: boolean
}

export type SchoolSearchResponse = {
  results: SchoolPublic[]
}

export type IneligibleStudentsResponse = {
  ineligibleStudents: IneligibleStudentsWithSchoolInfoPublic[]
  isLastPage: boolean
}

export type ZipCodeResponse = {
  zipCode: ZipCodePublic
}

export type CheckZipCodeResponse = {
  isValidZipCode: boolean
}

export type StudentSignupSourceResponse = {
  signupSources: StudentSignupSourcesPublic[] | undefined
}
