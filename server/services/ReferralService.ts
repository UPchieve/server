import { EVENTS } from '../constants'
import { TransactionClient } from '../db'
import logger from '../logger'
import { Ulid } from '../models/pgUtils'
import * as ReferralRepo from '../models/Referrals'
import * as UserRepo from '../models/User'
import { UserRole } from '../models/User'
import * as AnalyticsService from './AnalyticsService'

// TODO: Use this method once clean-up setting `users.referred_by`.
export async function addReferralForUserByCode(
  userId: Ulid,
  referredByCode: string,
  tc?: TransactionClient
) {
  const referrerId = await getReferrerIdByCode(referredByCode, tc)
  if (!referrerId) return

  await ReferralRepo.addReferral(userId, referrerId, tc)
  AnalyticsService.captureEvent(referrerId, EVENTS.FRIEND_REFERRED)
}

export async function addReferralFor(
  userId: Ulid,
  referrerId: Ulid,
  tc?: TransactionClient
) {
  await ReferralRepo.addReferral(userId, referrerId, tc)
  AnalyticsService.captureEvent(referrerId, EVENTS.FRIEND_REFERRED)
}

export async function getReferrerIdByCode(
  referredByCode?: string,
  tc?: TransactionClient
): Promise<Ulid | undefined> {
  if (referredByCode) {
    try {
      const user = await UserRepo.getUserByReferralCode(referredByCode, tc)
      if (user) return user.id
    } catch (error) {
      logger.error(error as Error)
    }
  }
}

export async function getReferredUsers(
  userId: Ulid,
  filters?: {
    withPhoneOrEmailVerified?: boolean
    withRoles?: UserRole[]
  }
) {
  return ReferralRepo.getReferredUsersWithFilter(userId, filters)
}
