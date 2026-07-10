import {
  USER_BAN_TYPES,
  USER_BAN_REASONS,
  GRADES,
  REFERENCE_STATUS,
} from '../constants'
import type { Availability } from '../models/Availability'
import type { ISODateString } from '../types/dates'
import type { Json, Uuid } from '../types/shared'
import type { TrainingCoursesPublic } from '../contracts/training'
import type { PrimaryUserRole, UserRole } from '../types/users'
import type { StudentAssignmentPublic } from './assignments'

export type RoleContextPublic = {
  activeRole: PrimaryUserRole
  legacyRole: PrimaryUserRole
  roles: UserRole[]
}

export type UserSessionStatsPublic = {
  [subjectName: string]: {
    totalRequested: number
    totalHelped: number
    topicName: string
  }
}

export type QuizInfoPublic = {
  passed: boolean
  tries: number
  lastAttemptedAt?: ISODateString
}

export type CertificationsPublic = {
  [subject: string]: QuizInfoPublic
}

export type ReferencePublic = {
  id: Uuid
  firstName: string
  lastName: string
  createdAt: ISODateString
  email: string
  status?: REFERENCE_STATUS
  sentAt?: ISODateString
  affiliation?: string
  relationshipLength?: string
  patient?: number
  positiveRoleModel?: number
  agreeableAndApproachable?: number
  communicatesEffectively?: number
  trustworthyWithChildren?: number
  rejectionReason?: string
  additionalInfo?: string
}

export type PostsessionSurveyRatingsMetricPublic = {
  selfReportedStudentRating: {
    total: number
    average: number
  }
  selfReportedVolunteerRating: {
    total: number
    average: number
  }
  partnerReportedStudentRating: {
    total: number
    average: number
  }
  partnerReportedVolunteerRating: {
    total: number
    average: number
  }
  // Legacy values
  selfReportedRating: {
    total: number
    average: number
  }
  partnerReportedRating: {
    total: number
    average: number
  }
}

export type SponsorshipPublic = {
  id: Uuid
  name: string
  key: string
}

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
  sessionStats: UserSessionStatsPublic
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
  certifications?: CertificationsPublic
  availabilityLastModifiedAt?: ISODateString
  trainingCourses?: TrainingCoursesPublic
  occupation?: string[]
  country?: string
  timezone?: string
  totalVolunteerHours?: number
  hoursTutored?: number
  hoursTutoredThisWeek?: number
  elapsedAvailability?: number
  references?: ReferencePublic[]
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
  studentAssignments?: StudentAssignmentPublic[]
  ratings?: PostsessionSurveyRatingsMetricPublic
  favoriteVolunteers?: Uuid[]
  // teacher
  lastSuccessfulCleverSync?: ISODateString

  // sponsor
  sponsorships?: SponsorshipPublic[]
}

export type ReferenceContactInfoPublic = {
  id: Uuid
  status: string
  email: string
  firstName: string
  lastName: string
  affiliation?: string
  additionalInfo?: string
  agreeableAndApproachable?: number
  communicatesEffectively?: number
  patient?: number
  positiveRoleModel?: number
  rejectionReason?: string
  relationshipLength?: string
  trustworthyWithChildren?: number
}

export type UserAdminBackgroundPublic = {
  occupation?: string[]
  experience?: Json
  languages?: string[]
  linkedInUrl?: string
  country?: string
  state?: string
  city?: string
  college?: string
  company?: string
}

export type PastSessionForAdminPublic = {
  id: Uuid
  _id: Uuid
  type: string
  subTopic: string
  totalMessages: number
  volunteer?: Uuid
  student: Uuid
  volunteerJoinedAt?: ISODateString
  createdAt: ISODateString
  endedAt?: ISODateString
}

export type UserForAdminDetailPublic = {
  id: Uuid
  firstName: string
  lastName?: string
  email: string
  createdAt: ISODateString
  isDeactivated: boolean
  isDeleted: boolean
  isTestUser: boolean
  verified: boolean
  banType?: USER_BAN_TYPES
  numPastSessions: number

  // Volunteer-specific fields
  isApproved?: boolean
  isOnboarded?: boolean
  volunteerPartnerOrg?: string
  photoIdS3Key?: string
  photoIdStatus?: string

  // Student-specific fields
  currentGrade?: string
  zipCode?: string
  studentPartnerOrg?: string
  partnerSite?: string

  // Student/teacher fields
  schoolId?: Uuid
  schoolName?: string

  references: ReferenceContactInfoPublic[]
  pastSessions?: PastSessionForAdminPublic[]
  background: UserAdminBackgroundPublic
}

export type UserForAdminDetailWithRoleContextPublic =
  UserForAdminDetailPublic & {
    roleContext: RoleContextPublic
    photoUrl?: string
    userType: UserRole
    roles: UserRole[]
  }

export type UserForAdminPublic = {
  id: Uuid
  firstName: string
  lastName?: string
  email: string
  userType: UserRole
  createdAt: ISODateString
}

export type NewUserPublic = {
  id: string
  firstName: string
  email: string
  userType: 'student' | 'teacher'
  isAdmin: boolean
  proxyEmail?: string | undefined
}

export type VolunteerContactInfoPublic = {
  id: Uuid
  email: string
  phone?: string
  firstName: string
  lastName: string
  volunteerPartnerOrg?: string
  approved?: boolean
}

export type NewVolunteerPublic = VolunteerContactInfoPublic & {
  deactivated: boolean
  testUser: boolean
  createdAt: ISODateString
  isAdmin: boolean
  smsConsent: boolean
  userType: UserRole
  banType?: USER_BAN_TYPES
  signupSourceId?: number
  otherSignupSource?: string
}

export type UserByReferralCodePublic = {
  id: Uuid
  firstName: string
  userType?: PrimaryUserRole
}

export type LegacyUserResponse = {
  user: LegacyUserPublic
}

export type VolunteeApprovalResponse = {
  success: boolean
  message: string
  uploadUrl?: string
}

export type RemovedFromNTHSResponse = {
  wasRemovedFromNTHS: boolean
}

export type ReferredFriendsTotalResponse = {
  referredFriendsArr: number[]
}

export type UserIdByEmailResponse = {
  userId: Uuid | undefined
}

export type UserAdminResponse = {
  userId: Uuid | undefined
}

export type UsersForAdminResponse = {
  users: UserForAdminPublic[]
  isLastPage: boolean
}

export type SwitchActiveRoleResponse = {
  user: LegacyUserPublic
  activeRole: PrimaryUserRole
}

export type UserByReferralCodeResponse = {
  user: UserByReferralCodePublic | undefined
}
