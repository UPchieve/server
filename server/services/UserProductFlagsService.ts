import config from '../config'
import { NotAllowedError } from '../models/Errors'
import { Uuid } from '../models/pgUtils'
import {
  getUserVerificationInfoById,
  updateUserProxyEmail,
  UserContactInfo,
} from '../models/User'
import * as UserService from '../services/UserService'
import { getLegacyUserObject } from '../models/User/legacy-user'
import {
  upsertImpactStudyCampaign,
  ImpactStudyCampaign,
  enrollStudentToFallIncentiveProgram,
  enrollStudentToImpactStudy,
  getUPFByUserId,
} from '../models/UserProductFlags'
import {
  isUserInIncentiveProgram,
  queueIncentiveProgramEnrollmentWelcomeJob,
} from './IncentiveProgramService'
import { createContact } from './MailService'
import { getLatestUserSubmissionsForSurveyId } from './SurveyService'
import {
  createGiftCardRewardLink,
  getUserRewardByImpactStudySurveyCampaignId,
} from './RewardsService'
import {
  asDate,
  asFactory,
  asNumber,
  asOptional,
  asString,
} from '../utils/type-utils'
import { runInTransaction, TransactionClient } from '../db'

export async function incentiveProgramEnrollmentEnroll(
  userId: Uuid,
  proxyEmail?: string
) {
  // @TODO Run in transaction
  const isInIncentiveProgram = await isUserInIncentiveProgram(userId)
  if (isInIncentiveProgram)
    throw new Error(`You're already enrolled in the fall incentive program.`)

  const user = await getLegacyUserObject(userId)
  if (user.isSchoolPartner) {
    if (proxyEmail) await updateUserProxyEmail(userId, proxyEmail)
    else
      throw new Error(
        `No email was provided to enroll into the fall incentive program for user: ${userId}`
      )
  } else {
    const userVerificationInfo = await getUserVerificationInfoById(userId)
    if (!userVerificationInfo?.phoneVerified)
      throw new Error(
        'Your phone number must be verified before joining the program.'
      )
  }
  const enrollmentDate = await enrollStudentToFallIncentiveProgram(userId)
  await queueIncentiveProgramEnrollmentWelcomeJob(userId)
  await createContact([userId])
  return enrollmentDate
}

export async function processImpactStudySubmission(
  userId: Uuid,
  campaign: ImpactStudyCampaign,
  tc?: TransactionClient
) {
  const user = await UserService.getUserContactInfo(userId, tc)
  if (!user) throw new NotAllowedError('No user found')

  const impactStudyEnrollmentAt = await processImpactStudyEnrollment(
    userId,
    campaign,
    tc
  )
  await processImpactStudyReward(user, campaign)
  return impactStudyEnrollmentAt
}

export async function processImpactStudyEnrollment(
  userId: Uuid,
  campaign: ImpactStudyCampaign,
  tc?: TransactionClient
) {
  const userProductFlags = await getUPFByUserId(userId, tc)
  if (
    !userProductFlags ||
    !userProductFlags.impactStudyCampaigns?.[campaign.id]
  )
    throw new Error('User is not part of this Impact Study cohort')

  const userSubmissions = await getLatestUserSubmissionsForSurveyId(
    userId,
    campaign.surveyId,
    tc
  )

  if (!userSubmissions.length)
    throw new Error('Your survey submission was not saved')

  if (!userProductFlags.impactStudyEnrollmentAt)
    return enrollStudentToImpactStudy(userId, tc)
}

export async function processImpactStudyReward(
  user: UserContactInfo,
  campaign: ImpactStudyCampaign
) {
  if (campaign.rewardAmount) {
    const rewards = await getUserRewardByImpactStudySurveyCampaignId(
      user.id,
      campaign.id
    )
    if (rewards.length)
      throw new Error(`You've already received a reward for this survey.`)
    const rewardPayload = {
      userId: user.id,
      surveyId: campaign.surveyId,
      amount: campaign.rewardAmount,
      name: user.firstName,
      email: user.proxyEmail ?? user.email,
      tremendousCampaignId: config.tremendousImpactStudyCampaign,
      impactStudySurveyCampaignId: campaign.id,
    }
    await createGiftCardRewardLink(rewardPayload)
  }
}

export const asImpactStudyCampaignData = asFactory<ImpactStudyCampaign>({
  id: asString,
  surveyId: asNumber,
  submittedAt: asOptional(asDate),
  viewCount: asNumber,
  maxViewCount: asNumber,
  rewardAmount: asOptional(asNumber),
  launchedAt: asOptional(asDate),
  createdAt: asDate,
})

export async function saveImpactStudyCampaign(
  userId: Uuid,
  campaign: ImpactStudyCampaign
) {
  return runInTransaction(async (tc) => {
    await upsertImpactStudyCampaign(userId, campaign, tc)
    if (campaign.submittedAt)
      return processImpactStudySubmission(userId, campaign, tc)
  })
}
