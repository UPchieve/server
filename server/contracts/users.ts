import {
  USER_BAN_TYPES,
  USER_BAN_REASONS,
  GRADES,
  REFERENCE_STATUS,
} from '../constants'
import type { Availability } from '../models/Availability'
import type { ISODateString } from '../types/dates'
import type { Uuid } from '../types/shared'
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

export type LegacyUserResponse = {
  user: LegacyUserPublic
}
