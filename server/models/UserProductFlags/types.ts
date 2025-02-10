import { Ulid } from '../pgUtils'

export type UserProductFlags = {
  userId: Ulid
  sentReadyToCoachEmail: boolean
  sentHourSummaryIntroEmail: boolean
  sentInactiveThirtyDayEmail: boolean
  sentInactiveSixtyDayEmail: boolean
  sentInactiveNinetyDayEmail: boolean
  gatesQualified: boolean
  fallIncentiveEnrollmentAt?: Date
  impactStudyEnrollmentAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type PublicUserProductFlags = Pick<
  UserProductFlags,
  | 'userId'
  | 'gatesQualified'
  | 'fallIncentiveEnrollmentAt'
  | 'impactStudyEnrollmentAt'
>
