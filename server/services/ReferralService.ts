import { EVENTS } from '../constants'
import { TransactionClient } from '../db'
import logger from '../logger'
import { Ulid } from '../models/pgUtils'
import * as ReferralRepo from '../models/Referrals'
import * as UserRepo from '../models/User'
import { UserRole } from '../models/User'
import * as AnalyticsService from './AnalyticsService'
import { Jobs } from '../worker/jobs'
import QueueService from './QueueService'
import config from '../config'
import * as UserService from './UserService'
import * as NotificationService from './NotificationService'

export async function addReferralForUserByCode(
  userId: Ulid,
  referredByCode: string,
  tc?: TransactionClient
) {
  const referrerId = await getReferrerIdByCode(referredByCode, tc)
  if (!referrerId) {
    logger.warn(
      { referredByCode },
      'Invalid referral code provided during registration'
    )
    return
  }

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

export async function getReferredUsersCount(
  userId: Ulid,
  filters?: {
    withPhoneOrEmailVerified?: boolean
    withRoles?: UserRole[]
  }
) {
  return (await getReferredUsers(userId, filters)).length
}

export async function queueReferredByEmailsForVolunteer({
  referredBy,
  firstName,
  sendAmbassadorEmail,
  referredByCode,
}: {
  firstName: string
  referredBy?: string
  sendAmbassadorEmail: boolean
  referredByCode?: string
}) {
  if (!referredBy) return

  await QueueService.add(
    Jobs.SendReferralSignUpCelebrationEmail,
    { delay: 0 },
    {
      userId: referredBy,
      referredFirstName: firstName,
    }
  )

  if (sendAmbassadorEmail) {
    const referredUsersCount = await getReferredUsersCount(referredBy)

    const hasUserBeenSentCongratsEmail =
      await NotificationService.hasUserBeenSentEmail({
        userId: referredBy,
        emailTemplateId: config.sendgrid.ambassadorCongratsTemplate,
      })

    if (
      referredByCode &&
      referredUsersCount >= 5 &&
      !hasUserBeenSentCongratsEmail
    ) {
      await QueueService.add(
        Jobs.SendAmbassadorCongratsEmail,
        { delay: 0 },
        {
          userId: referredBy,
          firstName: firstName,
          referralLink: UserService.getReferralSignUpLink(referredByCode),
        }
      )
    }
  }
}
