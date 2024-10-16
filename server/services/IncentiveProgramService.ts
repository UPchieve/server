import { Ulid } from '../models/pgUtils'
import { getSessionById } from '../models/Session'
import { getUserContactInfoById, UserContactInfo } from '../models/User'
import { getUPFByUserId, UserProductFlags } from '../models/UserProductFlags'
import { Jobs } from '../worker/jobs'
import {
  FallIncentiveFlagPayload,
  getFallIncentiveProgramPayload,
} from './FeatureFlagService'
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
  const twelveHoursInMs = 1000 * 60 * 60 * 12
  await QueueService.add(
    Jobs.EmailFallIncentiveInvitedToEnrollReminder,
    { userId },
    { removeOnComplete: true, removeOnFail: true, delay: twelveHoursInMs }
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

type UserAndFallIncentiveData = {
  user: UserContactInfo
  productFlags: UserProductFlags
  incentivePayload: FallIncentiveFlagPayload
}

export async function getUserFallIncentiveData(
  userId: string,
  enrollmentFlag: boolean
): Promise<UserAndFallIncentiveData | undefined> {
  const user = await getUserContactInfoById(userId)
  const productFlags = await getUPFByUserId(userId)
  const incentivePayload = await getFallIncentiveProgramPayload(userId)

  if (
    !user ||
    !incentivePayload ||
    !incentivePayload.incentiveStartDate ||
    !productFlags ||
    enrollmentFlag !== !!productFlags?.fallIncentiveEnrollmentAt
  )
    return

  return {
    user,
    productFlags,
    incentivePayload,
  }
}
