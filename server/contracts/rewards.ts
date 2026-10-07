import type { ISODateString } from '../types/dates'

export type UserRewardPublic = {
  id: string
  rewardLink: string
  amount: number
  campaignId: string | null
  campaignName: string | null
  createdAt: ISODateString
}

export type UserRewardResponse = {
  rewards: UserRewardPublic[]
  total: number
}
