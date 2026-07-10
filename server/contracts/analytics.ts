import { GRADES } from '../constants'
import type { ISODateString } from '../types/dates'
import type { Uuid } from '../types/shared'
import type { UserRole } from '../types/users'

export type AnalyticPersonPropertiesPublic = {
  ucId: Uuid
  userType: UserRole
  createdAt: ISODateString
  totalSessions: number
  banType?: string
  isTestUser: boolean
  hasStudentRole: boolean
  hasVolunteerRole: boolean
  hasTeacherRole: boolean
  onboarded?: boolean
  approved?: boolean
  partner?: string | null
  schoolPartner?: string | null
  gradeLevel?: GRADES | null
  fallIncentiveEnrollmentAt?: ISODateString | null
  usesClever?: boolean
  usesGoogle?: boolean
  hasSubjectCertification?: boolean
  signupSource?: string
  occupation?: string[]
  // Extra properties are certification stats keyed by subject
  // (e.g. { algebra: true }). Uses `unknown` instead of
  // `boolean` because this type also contains non-boolean properties.
  // TODO: See if PostHog supports nesting these under `certificationStats`.
} & Record<string, unknown>
