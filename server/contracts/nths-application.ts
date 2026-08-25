import { NTHSApplicationIneligibilityReason } from '../models/NTHSApplication/types'
import { NTHSCandidateApplicationStatus } from '../models/NTHSGroups/types'
import { ISODateString } from '../types/dates'
import { Uuid } from '../types/shared'

export type NTHSUnlistedSchoolPublic = {
  name: string
  city: string
  state: string
  website?: string
}

export type NTHSCandidateApplicationPublic = {
  id: number
  status: NTHSCandidateApplicationStatus
  schoolId?: Uuid
  unlistedSchool?: NTHSUnlistedSchoolPublic
  formVersion: number
  responses: Record<string, unknown>
  decidedAt?: ISODateString
  createdAt: ISODateString
}

export type NTHSCandidateApplicationResponse = {
  application: NTHSCandidateApplicationPublic
}

export type NTHSLatestCandidateApplicationResponse = {
  application?: NTHSCandidateApplicationPublic
}

export type NTHSApplicationEligibilityResponse = {
  eligible: boolean
  reasons: NTHSApplicationIneligibilityReason[]
  // Advanced by academic year from the stored grade, so the form can preselect
  // it. Absent when the applicant has no grade on file.
  currentGradeName?: string
}
