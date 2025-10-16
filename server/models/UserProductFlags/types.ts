import { Ulid } from '../pgUtils'

export type ImpactStudyCampaign = {
  id: string
  surveyId: number
  viewCount: number
  maxViewCount: number
  rewardAmount?: number
  submittedAt?: Date
  launchedAt?: Date
  createdAt: Date
}

export type ImpactStudyCampaignsMap = Record<string, ImpactStudyCampaign>

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
  impactStudyCampaigns?: ImpactStudyCampaignsMap
  createdAt: Date
  updatedAt: Date
}

export type PublicUserProductFlags = Pick<
  UserProductFlags,
  | 'userId'
  | 'gatesQualified'
  | 'fallIncentiveEnrollmentAt'
  | 'impactStudyEnrollmentAt'
  | 'impactStudyCampaigns'
>
