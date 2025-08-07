import { ACCOUNT_USER_ACTIONS } from '../../constants'
import { Ulid } from '../pgUtils'

export interface UserActionAgent {
  device: string
  browser?: string
  browserVersion?: string
  operatingSystem?: string
  operatingSystemVersion?: string
}

export type QuizzesPassedForDateRange = {
  createdAt: Date
}

export type AccountActionParams = {
  action: ACCOUNT_USER_ACTIONS
  userId: Ulid
  ipAddress?: string
  referenceEmail?: string
  sessionId?: Ulid
  volunteerId?: Ulid
  banReason?: string
  clientUUID?: string
}
