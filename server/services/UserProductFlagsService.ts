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
  if (!isInImpactStudy) await enrollStudentToImpactStudy(userId)

  // TODO: Implement sending gift card reward
  if (survey.rewardAmount) {
  }
}
