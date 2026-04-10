import { Uuid } from '../../types/shared'

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
  userId: Uuid
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
