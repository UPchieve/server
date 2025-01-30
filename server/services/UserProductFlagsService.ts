import config from '../config'
import { NotAllowedError } from '../models/Errors'
import { Ulid } from '../models/pgUtils'
import { getSimpleSurveyDefinitionBySurveyId } from '../models/Survey'
import {
  getUserContactInfoById,
  getUserVerificationInfoById,
  updateUserProxyEmail,
} from '../models/User'
import { getLegacyUserObject } from '../models/User/legacy-user'
import {
  enrollStudentToFallIncentiveProgram,
  enrollStudentToImpactStudy,
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
  getUserRewardBySurveyId,
} from './RewardsService'

export async function incentiveProgramEnrollmentEnroll(
  userId: Ulid,
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

export async function impactStudyEnrollment(userId: Ulid, surveyId: number) {
  const user = await getUserContactInfoById(userId)
  if (!user) throw new NotAllowedError('No user found')

  const survey = await getSimpleSurveyDefinitionBySurveyId(surveyId)
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

  if (survey.rewardAmount) {
    const rewards = await getUserRewardBySurveyId(userId, survey.surveyId)
    if (rewards.length)
      throw new Error(
        `You've already received a reward for this survey. Please update your answers from your Profile page`
      )

    const rewardPayload = {
      userId,
      surveyId: survey.surveyId,
      amount: survey.rewardAmount,
      name: user.firstName,
      email: user.proxyEmail ?? user.email,
      campaignId: config.tremendousImpactStudyCampaign,
    }
    await createGiftCardRewardLink(rewardPayload)
  }

  return impactStudyEnrollmentAt
}
