import { USER_BAN_TYPES } from '../../constants'
import { Pgid, Ulid } from '../pgUtils'
import { RoleContext } from '../../services/UserRolesService'

export type UserRole =
  | 'volunteer'
  | 'student'
  | 'teacher'
  | 'admin'
  | 'ambassador'

export type User = {
  id: Ulid
  banType?: USER_BAN_TYPES
  banReasonId?: Pgid
  deactivated: boolean
  firstName: string
  email: string
  emailVerified: boolean
  lastActivityAt?: Date
  lastName: string
  password?: string
  passwordResetToken?: string
  phone?: string
  smsConsent: boolean
  phoneVerified: boolean
  proxyEmail?: string
  referralCode: string
  referredBy?: Ulid
  signupSourceId?: Pgid
  testUser: boolean
  verified: boolean
  preferredLanguage: string
  createdAt: Date
  updatedAt: Date
  // Volunteer-only
  timeTutored?: number
  mutedSubjectAlerts?: string[]
}

export type CreateUserPayload = {
  email: string
  emailVerified?: boolean
  firstName: string
  lastName: string
  otherSignupSource?: string
  password?: string
  passwordResetToken?: string
  phone?: string
  phoneVerified?: boolean
  proxyEmail?: string
  referredBy?: Ulid
  signupSourceId?: number
  verified?: boolean
  smsConsent?: boolean
}

export type CreateUserResult = Required<
  Pick<User, 'id' | 'firstName' | 'email'>
> &
  Pick<User, 'proxyEmail'>

export type UpsertUserResult = CreateUserResult & {
  isCreated: boolean
}

export type UserContactInfo = Pick<
  User,
  | 'id'
  | 'banType'
  | 'deactivated'
  | 'email'
  | 'firstName'
  | 'lastActivityAt'
  | 'phone'
  | 'phoneVerified'
  | 'smsConsent'
  | 'proxyEmail'
> & {
  approved?: boolean
  /** @deprecated */
  isAdmin: boolean
  referralCode: string
  /** @deprecated Use {@link roleContext} */
  roles: UserRole[]
  roleContext: RoleContext
  studentPartnerOrg?: string
  volunteerPartnerOrg?: string
}

export type UserForCreateSendGridContact = Omit<
  UserContactInfo,
  'isAdmin' | 'deactivated' | 'roles' | 'roleContext' | 'referralCode'
> & {
  createdAt: Date
  lastName: string
  studentGradeLevel?: string
  studentPartnerOrgDisplay?: string
  testUser: boolean
  volunteerPartnerOrgDisplay?: string
}

export type UserForAdmin = {
  id: Ulid
  firstName: string
  lastName?: string
  email: string
  userType: UserRole
  createdAt: Date
}

export type ReportedUser = Pick<
  User,
  'id' | 'firstName' | 'lastName' | 'email' | 'createdAt'
> & {
  isDeactivated: boolean
  isTestUser: boolean
  isVolunteer: boolean
  studentPartnerOrg?: string
  volunteerPartnerOrg?: string
}

export type EditUserProfilePayload = {
  deactivated?: boolean
  smsConsent?: boolean
  mutedSubjectAlerts?: string[]
  phone?: string
  preferredLanguage?: string
  schoolId?: string
  signupSourceId?: number
  otherSignupSource?: string
}
