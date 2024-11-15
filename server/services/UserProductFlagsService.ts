import { Ulid } from '../models/pgUtils'
import {
  getUserVerificationInfoById,
  updateUserProxyEmail,
} from '../models/User'
import { getLegacyUserObject } from '../models/User/legacy-user'
import { enrollStudentToFallIncentiveProgram } from '../models/UserProductFlags'
import {
  isUserInIncentiveProgram,
  queueIncentiveProgramEnrollmentWelcomeJob,
} from './IncentiveProgramService'
import { createContact } from './MailService'

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
        'No email was provided to enroll into the fall incentive program.'
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
