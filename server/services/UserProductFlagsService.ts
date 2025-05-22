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
import { isUserInImpactStudy } from './ImpactStudyService'
import { createContact } from './MailService'
import { getLatestUserSubmissionsForSurveyId } from './SurveyService'
import {
  createGiftCardRewardLink,
  getUserRewardByImpactStudySurveyCampaignId,
} from './RewardsService'
import {
  asBoolean,
  asFactory,
  asNumber,
  asOptional,
  asString,
} from '../utils/type-utils'

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

export async function impactStudyEnrollment(
  userId: Uuid,
  impactStudySurveyCampaignId: string
) {
  const user = await UserService.getUserContactInfo(userId)
  if (!user) throw new NotAllowedError('No user found')

  const userProductFlags = await getUPFByUserId(user.id)
  if (
    !userProductFlags ||
    !userProductFlags.impactStudyCampaigns ||
    !userProductFlags.impactStudyCampaigns[impactStudySurveyCampaignId]
  )
    throw new Error('User is not part of this Impact Study cohort')
  const campaign =
    userProductFlags.impactStudyCampaigns[impactStudySurveyCampaignId]

  const survey = await getSimpleSurveyDefinitionBySurveyId(campaign.surveyId)
  const userSubmissions = await getLatestUserSubmissionsForSurveyId(
    userId,
    survey.surveyId
  )

  if (!userSubmissions.length)
    throw new Error('Your survey submission was not saved')

  const isInImpactStudy = await isUserInImpactStudy(userId)
  let impactStudyEnrollmentAt
  if (!isInImpactStudy)
    impactStudyEnrollmentAt = await enrollStudentToImpactStudy(userId)

  if (campaign.rewardAmount) {
    const rewards = await getUserRewardByImpactStudySurveyCampaignId(
      userId,
      impactStudySurveyCampaignId
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
      impactStudySurveyCampaignId,
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
  submitted: asBoolean,
  viewCount: asNumber,
  maxViewCount: asNumber,
  rewardAmount: asOptional(asNumber),
})

export async function saveImpactStudyCampaign(
  userId: Uuid,
  campaign: ImpactStudyCampaign
) {
  return upsertImpactStudyCampaign(userId, campaign)
}
