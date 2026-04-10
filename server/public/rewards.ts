import type { UserRewardPublic } from '../contracts/rewards'
import type { UserReward } from '../services/RewardsService'

export function toUserRewardPublic(reward: UserReward): UserRewardPublic {
  return {
    id: reward.id,
    rewardLink: reward.rewardLink,
    amount: reward.amount,
    campaignId: reward.campaignId ?? null,
    campaignName: reward.campaignName ?? null,
    createdAt: reward.createdAt.toISOString(),
  }
}
