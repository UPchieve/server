import { Ulid } from '../models/pgUtils'
import { getSessionById } from '../models/Session'
import { getUserContactInfoById, UserContactInfo } from '../models/User'
import { getUPFByUserId, UserProductFlags } from '../models/UserProductFlags'
import { Jobs } from '../worker/jobs'
import { getFallIncentiveProgramPayload } from './FeatureFlagService'
import QueueService from './QueueService'

export async function isUserInIncentiveProgram(userId: Ulid) {
  const flags = await getUPFByUserId(userId)
  return !!flags?.fallIncentiveEnrollmentAt
}

export async function queueIncentiveProgramEnrollmentWelcomeJob(userId: Ulid) {
  await QueueService.add(
    Jobs.EmailFallIncentiveEnrollmentWelcome,
    { userId },
    { removeOnComplete: true, removeOnFail: true }
  )
}

export async function queueIncentiveInvitedToEnrollReminderJob(userId: Ulid) {
  await QueueService.add(
    Jobs.EmailFallIncentiveInvitedToEnrollReminder,
    { userId },
    { removeOnComplete: true, removeOnFail: true }
  )
}

export async function queueFallIncentiveLeavingMoneyOnTableJob(
  sessionId: Ulid
) {
  const session = await getSessionById(sessionId)
  await QueueService.add(
    Jobs.EmailFallIncentiveLeavingMoneyOnTable,
    { userId: session.studentId, sessionId },
    { removeOnComplete: true, removeOnFail: true }
  )
}

export async function queueFallIncentiveSessionQualificationJob(
  sessionId: Ulid
) {
  const session = await getSessionById(sessionId)
  // Do nothing if the session was not matched
  if (!session.volunteerId) return
  await QueueService.add(
    Jobs.EmailFallIncentiveSessionQualification,
    { userId: session.studentId, sessionId },
    { removeOnComplete: true, removeOnFail: true }
  )
}

type UserAndFallIncentiveStartDate = {
  user: UserContactInfo
  productFlags: UserProductFlags
  incentiveProgramDate: Date
}

export async function getUserFallIncentiveData(
  userId: string,
  enrollmentFlag: boolean
): Promise<UserAndFallIncentiveStartDate | undefined> {
  const user = await getUserContactInfoById(userId)
  const productFlags = await getUPFByUserId(userId)
  const incentiveProgramDate = await getFallIncentiveProgramPayload(userId)

  if (
    !user ||
    !incentiveProgramDate ||
    !productFlags ||
    enrollmentFlag !== !!productFlags?.fallIncentiveEnrollmentAt
  )
    return

  return {
    user,
    productFlags,
    incentiveProgramDate: new Date(incentiveProgramDate),
  }
}
