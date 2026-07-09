import { USER_BAN_TYPES, USER_BAN_REASONS, GRADES } from '../constants'
import type { StudentAssignment } from '../models/Assignments'
import type { Availability } from '../models/Availability'
import type { UserSessionStats } from '../models/Session'
import type {
  Certifications,
  Reference,
  Sponsorship,
} from '../models/Volunteer'
import type { PostsessionSurveyRatingsMetric } from '../services/SurveyService'
import type { ISODateString } from '../types/dates'
import type { Uuid } from '../types/shared'
import type { TrainingCourses } from '../types/training'
import type { PrimaryUserRole, UserRole } from '../types/users'

export type RoleContextPublic = {
  activeRole: PrimaryUserRole
  legacyRole: PrimaryUserRole
  roles: UserRole[]
}

// TODO: Start mapping to public versions where possible?
export type LegacyUserPublic = {
  id: Uuid
  //   TODO: Remove once there are no references to this property
  _id: Uuid
  firstName: string
  firstname: string
  lastName: string
  createdAt: ISODateString
  email: string
  proxyEmail?: string
  verified: boolean
  phone?: string
  college?: string
  userType: UserRole
  // `isBanned` is kept for backwards-compatible with mobile
  isBanned: boolean
  banType?: USER_BAN_TYPES
  banReason?: USER_BAN_REASONS
  roleContext: RoleContextPublic
  isTestUser: boolean
  isFakeUser: boolean
  isDeactivated: boolean
  pastSessions: Uuid[]
  lastActivityAt?: ISODateString
  referralCode: string
  numReferredVolunteers?: number
  referredBy?: Uuid
  sessionStats: UserSessionStats
  preferredLanguage: string
  signupSource?: string
  // volunteer
  isOnboarded?: boolean
  isApproved?: boolean
  volunteerPartnerOrg?: string
  subjects?: string[]
  activeSubjects?: string[]
  mutedSubjectAlerts?: string[]
  totalActiveCertifications?: number
  availability?: Availability
  certifications?: Certifications
  availabilityLastModifiedAt?: ISODateString
  trainingCourses?: TrainingCourses
  occupation?: string[]
  country?: string
  timezone?: string
  totalVolunteerHours?: number
  hoursTutored?: number
  hoursTutoredThisWeek?: number
  elapsedAvailability?: number
  references?: Reference[]
  photoIdStatus?: string
  uniqueStudentsHelpedCount?: number
  hasCompletedVolunteerTraining?: boolean
  // student
  gradeLevel?: GRADES
  schoolName?: string
  latestRequestedSubjects?: string[]
  numberOfStudentClasses?: number
  issuers?: string[]
  studentPartnerOrg?: string
  isSchoolPartner?: boolean
  usesClever?: boolean
  usesGoogle?: boolean
  usesClassLink?: boolean
  studentAssignments?: StudentAssignment[]
  ratings?: PostsessionSurveyRatingsMetric
  favoriteVolunteers?: Uuid[]
  // teacher
  lastSuccessfulCleverSync?: ISODateString

  // sponsor
  sponsorships?: Sponsorship[]
}

export type LegacyUserResponse = {
  user: LegacyUserPublic
}
