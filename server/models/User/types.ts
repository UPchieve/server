import { Pgid, Ulid } from '../pgUtils'

export type User = {
  id: Ulid
  verified: boolean
  emailVerified: boolean
  phoneVerified: boolean
  email: string
  phone?: string
  password: string
  passwordResetToken?: string
  firstName: string
  lastName: string
  banned: boolean
  banReasonId?: Pgid
  testUser: boolean
  deactivated: boolean
  lastActivityAt?: Date
  referralCode: string
  referredBy?: Ulid
  timeTutored?: number
  signupSourceId?: Pgid
  createdAt: Date
  updatedAt: Date
}
