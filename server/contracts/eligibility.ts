import type { SchoolPublic } from '../types/schools'

export type CheckEligibilityPublic = {
  message?: string
  isEligible: boolean
  isCollegeStudent?: boolean
  isExistingUser?: boolean
}

export type IsEligibleResponse = {
  isEligible: boolean
}

export type SchoolSearchResponse = {
  results: SchoolPublic[]
}
