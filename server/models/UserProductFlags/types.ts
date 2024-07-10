import { Ulid } from '../pgUtils'

export type UserProductFlags = {
  userId: Ulid
  sentReadyToCoachEmail: boolean
  sentHourSummaryIntroEmail: boolean
  sentInactiveThirtyDayEmail: boolean
  sentInactiveSixtyDayEmail: boolean
  sentInactiveNinetyDayEmail: boolean
  gatesQualified: boolean
  fallIncentiveProgram: boolean
  createdAt: Date
  updatedAt: Date
}
