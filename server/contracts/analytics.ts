import { GRADES } from '../constants'
import type { ISODateString } from '../types/dates'
import type { Uuid } from '../types/shared'
import type { UserRole } from '../types/users'

type AnalyticPersonPropertiesFields = {
  ucId: Uuid
  userType: UserRole
  createdAt: ISODateString
  totalSessions: number
  banType?: string
  isTestUser: boolean
  hasStudentRole: boolean
  hasVolunteerRole: boolean
  hasTeacherRole: boolean
  isNthsMember: boolean
  isNthsAdmin: boolean
  isNthsPresident: boolean
  onboarded?: boolean
  approved?: boolean
  partner?: string | null
  schoolPartner?: string | null
  partnerSchoolId?: Uuid | null
  partnerSchoolName?: string | null
  gradeLevel?: GRADES | null
  fallIncentiveEnrollmentAt?: ISODateString | null
  usesClever?: boolean
  usesGoogle?: boolean
  hasSubjectCertification?: boolean
  signupSource?: string
  occupation?: string[]
}

// Certifications add fields like `algebraOne: true`.
// This allows those extra fields without changing the types of the named properties.
export type AnalyticPersonPropertiesPublic = AnalyticPersonPropertiesFields &
  Record<
    string,
    AnalyticPersonPropertiesFields[keyof AnalyticPersonPropertiesFields]
  >
