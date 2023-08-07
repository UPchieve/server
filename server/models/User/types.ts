import { Pgid, Ulid } from '../pgUtils'

export type User = {
  id: Ulid
  banned: boolean
  banReasonId: Pgid | undefined
  createdAt: Date
  deactivated: boolean
  email: string
  emailVerified: boolean
  firstName: string
  lastActivityAt: Date | undefined
  lastName: string
  otherSignupSource: string | undefined
  phone: string | undefined
  proxyEmail: string | undefined
  password: string | undefined
  passwordResetToken: string | undefined
  phoneVerified: boolean
  referralCode: string
  referredBy: Ulid | undefined
  signupSourceId: Pgid | undefined
  testUser: boolean
  timeTutored: number | undefined
  updatedAt: Date
  verified: boolean
}

export type PassportUser = Required<
  Pick<User, 'id' | 'email' | 'firstName' | 'password' | 'proxyEmail'>
>

export type UserEmailInfo = Required<
  Pick<User, 'id' | 'firstName' | 'email' | 'proxyEmail'>
>
