import { Ulid } from '../models/pgUtils'
import { getUserVerificationInfoById } from '../models/User'
import { enrollStudentToFallIncentiveProgram } from '../models/UserProductFlags'
import {
  isUserInIncentiveProgram,
  queueIncentiveProgramEnrollmentWelcomeJob,
} from './IncentiveProgramService'

export async function incentiveProgramEnrollmentEnroll(userId: Ulid) {
  const isInIncentiveProgram = await isUserInIncentiveProgram(userId)
  if (isInIncentiveProgram)
    throw new Error(`You're already enrolled in the fall incentive program.`)
  const userVerificationInfo = await getUserVerificationInfoById(userId)
  if (!userVerificationInfo?.phoneVerified)
    throw new Error(
      'Your phone number must be verified before joining the program.'
    )

  const enrollmentDate = await enrollStudentToFallIncentiveProgram(userId)
  await queueIncentiveProgramEnrollmentWelcomeJob(userId)
  return enrollmentDate
}
