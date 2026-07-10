import { USER_BAN_TYPES } from '../constants'
import type { PastSessionForAdmin } from '../models/User'
import type { ReferenceContactInfo } from '../models/Volunteer'
import type { RoleContext } from '../services/UserRolesService'
import type { Uuid, Json } from './shared'

export type UserRole =
  | 'volunteer'
  | 'student'
  | 'teacher'
  | 'admin'
  | 'ambassador'

/*
 * - Right now, most of the app experience is driven by whether a user is a student, volunteer, or teacher, and
 * these are what we serve to the client to use as the userType/activeRole.
 * - But technically users can have other roles, like admin and ambassador, which don't dictate the overall in-app
 * experience like the other 3 do. Furthermore, admins and ambassadors are also both volunteers.
 * - So you can think of PrimaryUserRole as referring to the "main user types"
 */
export type PrimaryUserRole = Exclude<UserRole, 'admin' | 'ambassador'>
export type SessionUserRole = 'student' | 'volunteer'

export type UserAdminBackground = {
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

export type UserForAdminDetail = {
  id: Uuid
  firstName: string
  lastName?: string
  email: string
  createdAt: Date
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

  references: ReferenceContactInfo[]
  pastSessions?: PastSessionForAdmin[]
  background: UserAdminBackground
}

export type UserForAdminDetailWithRoleContext = UserForAdminDetail & {
  roleContext: RoleContext
  photoUrl?: string
}

export type NewUser = {
  id: string
  firstName: string
  email: string
  userType: 'student' | 'teacher'
  isAdmin: boolean
  proxyEmail?: string | undefined
}
