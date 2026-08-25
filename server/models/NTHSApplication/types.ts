import { NTHSCandidateApplicationStatus } from '../NTHSGroups/types'
import { USER_BAN_TYPES } from '../../constants/user'
import { Ulid, Uuid } from '../pgUtils'

export enum NTHSApplicationIneligibilityReason {
  notAVolunteer = 'notAVolunteer',
  notAHighSchoolStudent = 'notAHighSchoolStudent',
  notOnboarded = 'notOnboarded',
  notApproved = 'notApproved',
  banned = 'banned',
  noCompletedSessions = 'noCompletedSessions',
  alreadyInChapter = 'alreadyInChapter',
  alreadyApplied = 'alreadyApplied',
}

export type NTHSApplicationEligibilityFacts = {
  banType?: USER_BAN_TYPES
  onboarded: boolean
  approved: boolean
  isHighSchoolStudent: boolean
  hasCompletedSession: boolean
  isActiveChapterMember: boolean
  hasPreviousApplication: boolean
  currentGradeName?: string
}

export type NTHSApplicationResponses = Record<string, unknown>

// What an applicant tells us about a school missing from the dropdown. These are
// the inputs to the admin school search, so staff can narrow NCES down to the
// real row and fill in schoolId.
export type NTHSUnlistedSchool = {
  name: string
  city: string
  state: string
  website?: string
}

export type NTHSCandidateApplication = {
  id: number
  userId: Ulid
  status: NTHSCandidateApplicationStatus
  schoolId?: Uuid
  unlistedSchool?: NTHSUnlistedSchool
  formVersion: number
  responses: NTHSApplicationResponses
  deniedNotes?: string
  decidedAt?: Date
  // Null while an approval is still being held back from the applicant.
  activatedAt?: Date
  createdAt: Date
}

export type NTHSCandidate = {
  userId: string
  email: string
  firstName: string
}
