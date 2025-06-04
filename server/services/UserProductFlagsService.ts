import config from '../config'
import { NotAllowedError } from '../models/Errors'
import { Uuid } from '../models/pgUtils'
import { getSimpleSurveyDefinitionBySurveyId } from '../models/Survey'
import {
  getUserVerificationInfoById,
  updateUserProxyEmail,
} from '../models/User'
import * as UserService from '../services/UserService'
import { getLegacyUserObject } from '../models/User/legacy-user'
import {
  upsertImpactStudyCampaign,
  ImpactStudyCampaign,
  enrollStudentToFallIncentiveProgram,
  enrollStudentToImpactStudy,
  updateTellThemCollegePrepModalSeenAt,
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

export async function processImpactStudyEnrollmentAndReward(
  userId: Uuid,
  campaign: ImpactStudyCampaign,
  tc?: TransactionClient
) {
  const user = await UserService.getUserContactInfo(userId, tc)
  if (!user) throw new NotAllowedError('No user found')

  const userProductFlags = await getUPFByUserId(user.id, tc)
  if (
    !userProductFlags ||
    !userProductFlags.impactStudyCampaigns ||
    !userProductFlags.impactStudyCampaigns[campaign.id]
  )
    throw new Error('User is not part of this Impact Study cohort')

  const survey = await getSimpleSurveyDefinitionBySurveyId(
    campaign.surveyId,
    tc
  )
  const userSubmissions = await getLatestUserSubmissionsForSurveyId(
    userId,
    survey.surveyId,
    tc
  )

  if (!userSubmissions.length)
    throw new Error('Your survey submission was not saved')

  const isInImpactStudy = !!userProductFlags.impactStudyEnrollmentAt
  let impactStudyEnrollmentAt
  if (!isInImpactStudy)
    impactStudyEnrollmentAt = await enrollStudentToImpactStudy(userId, tc)

  if (campaign.rewardAmount) {
    const rewards = await getUserRewardByImpactStudySurveyCampaignId(
      userId,
      campaign.id
    )
    if (rewards.length)
      throw new Error(`You've already received a reward for this survey.`)
    const rewardPayload = {
      userId,
      surveyId: survey.surveyId,
      amount: campaign.rewardAmount,
      name: user.firstName,
      email: user.proxyEmail ?? user.email,
      tremendousCampaignId: config.tremendousImpactStudyCampaign,
      impactStudySurveyCampaignId: campaign.id,
    }
    await createGiftCardRewardLink(rewardPayload)
  }

  return impactStudyEnrollmentAt
}

export async function sawTellThemCollegePrepModal(userId: Uuid) {
  return await updateTellThemCollegePrepModalSeenAt(userId)
}

export const asImpactStudyCampaignData = asFactory<ImpactStudyCampaign>({
  id: asString,
  surveyId: asNumber,
  submittedAt: asOptional(asDate),
  viewCount: asNumber,
  maxViewCount: asNumber,
  rewardAmount: asOptional(asNumber),
  createdAt: asDate,
})

export async function saveImpactStudyCampaign(
  userId: Uuid,
  campaign: ImpactStudyCampaign
) {
  return runInTransaction(async (tc) => {
    await upsertImpactStudyCampaign(userId, campaign, tc)
    if (campaign.submittedAt)
      return processImpactStudyEnrollmentAndReward(userId, campaign, tc)
  })
}
