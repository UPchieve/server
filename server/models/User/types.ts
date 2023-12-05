import { Pgid, Ulid } from '../pgUtils'

export type User = {
  id: Ulid
  banned: boolean
  banReasonId?: Pgid
  deactivated: boolean
  firstName: string
  email: string
  emailVerified: boolean
  lastActivityAt?: Date
  lastName: string
  password: string
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
}

export type CreateUserResult = Required<
  Pick<User, 'id' | 'firstName' | 'email'>
> &
  Pick<User, 'proxyEmail'>
