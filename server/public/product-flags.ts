import {
  ImpactStudyCampaignPublic,
  ImpactStudyCampaignsMapPublic,
  UserProductFlagsPublic,
} from '../contracts/product-flags'
import {
  ImpactStudyCampaign,
  ImpactStudyCampaignsMap,
  UserProductFlags,
} from '../models/UserProductFlags'

function toImpactStudyCampaignPublic(
  campaign: ImpactStudyCampaign
): ImpactStudyCampaignPublic {
  return {
    id: campaign.id,
    surveyId: campaign.surveyId,
    viewCount: campaign.viewCount,
    maxViewCount: campaign.maxViewCount,
    rewardAmount: campaign.rewardAmount,
    submittedAt: campaign.submittedAt?.toISOString(),
    launchedAt: campaign.launchedAt?.toISOString(),
    createdAt: campaign.createdAt?.toISOString(),
  }
}

function toImpactStudyCampaignsMapPublic(
  campaigns?: ImpactStudyCampaignsMap
): ImpactStudyCampaignsMapPublic | undefined {
  if (!campaigns) return undefined
  return Object.fromEntries(
    Object.entries(campaigns).map(([key, campaign]) => [
      key,
      toImpactStudyCampaignPublic(campaign),
    ])
  )
}

export function toUserProductFlagsPublic(
  flags: UserProductFlags
): UserProductFlagsPublic {
  return {
    userId: flags.userId,
    gatesQualified: flags.gatesQualified,
    fallIncentiveEnrollmentAt: flags.fallIncentiveEnrollmentAt?.toISOString(),
    impactStudyEnrollmentAt: flags.impactStudyEnrollmentAt?.toISOString(),
    impactStudyCampaigns: toImpactStudyCampaignsMapPublic(
      flags.impactStudyCampaigns
    ),
  }
}
