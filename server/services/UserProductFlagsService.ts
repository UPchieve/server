import { Ulid } from '../models/pgUtils'
import { getSessionById } from '../models/Session'
import { getUserVerificationInfoById } from '../models/User'
import {
  enrollStudentToFallIncentiveProgram,
  getUPFByUserId,
} from '../models/UserProductFlags'
import QueueService from '../services/QueueService'
import { Jobs } from '../worker/jobs'

export async function checkIfInIncentiveProgram(userId: Ulid) {
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

export async function queueFallIncentiveMoneyCanBeMadeReminderJob(
  sessionId: Ulid
) {
  const session = await getSessionById(sessionId)
  await QueueService.add(
    Jobs.EmailFallIncentiveMoneyOnTable,
    { userId: session.studentId },
    { removeOnComplete: true, removeOnFail: true }
  )
}

export async function queueFallIncentiveSessionQualificationJob(
  sessionId: Ulid
) {
  const session = await getSessionById(sessionId)
  await QueueService.add(
    Jobs.EmailFallIncentiveSessionQualification,
    { userId: session.studentId },
    { removeOnComplete: true, removeOnFail: true }
  )
}

export async function incentiveProgramEnrollmentEnroll(userId: Ulid) {
  const isInIncentiveProgram = await checkIfInIncentiveProgram(userId)
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
