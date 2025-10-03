import { Ulid } from '../models/pgUtils'
import { getSessionById } from '../models/Session'
import { UserContactInfo } from '../models/User'
import * as UserService from '../services/UserService'
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
  await QueueService.add(Jobs.EmailFallIncentiveEnrollmentWelcome, { userId })
}

export async function queueIncentiveInvitedToEnrollReminderJob(userId: Ulid) {
  const twelveHoursInMs = 1000 * 60 * 60 * 12
  await QueueService.add(
    Jobs.EmailFallIncentiveInvitedToEnrollReminder,
    { userId },
    { delay: twelveHoursInMs }
  )
}

export async function queueFallIncentiveSessionQualificationJob(
  sessionId: Ulid
) {
  const session = await getSessionById(sessionId)
  // Do nothing if the session was not matched
  if (!session.volunteerId) return
  await QueueService.add(Jobs.EmailFallIncentiveSessionQualification, {
    userId: session.studentId,
    sessionId,
  })
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
  const user = await UserService.getUserContactInfo(userId)
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
