import { ISODateString } from '../types/dates'
import { Uuid } from '../types/shared'

export type ImpactStudyCampaignPublic = {
  id: string
  surveyId: number
  viewCount: number
  maxViewCount: number
  rewardAmount?: number
  submittedAt?: ISODateString
  launchedAt?: ISODateString
  createdAt: ISODateString
}

export type ImpactStudyCampaignsMapPublic = Record<
  string,
  ImpactStudyCampaignPublic
>

export type UserProductFlagsPublic = {
  userId: Uuid
  gatesQualified: boolean
  fallIncentiveEnrollmentAt?: ISODateString
  impactStudyEnrollmentAt?: ISODateString
  impactStudyCampaigns?: ImpactStudyCampaignsMapPublic
}

export type UserProductFlagsResponse = {
  flags?: UserProductFlagsPublic
}

// TODO: Make a unified enrollment response type
export type FallIncentiveEnrollmentResponse = {
  fallIncentiveEnrollmentAt: ISODateString
}

export type ImpactStudyEnrollmentResponse = {
  impactStudyEnrollmentAt?: ISODateString
}
