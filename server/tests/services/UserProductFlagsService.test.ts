import * as SessionRepo from '../../models/Session'
import * as UserRepo from '../../models/User'
import * as UserProductFlagsRepo from '../../models/UserProductFlags'
import QueueService from '../../services/QueueService'
import {
  checkIfInIncentiveProgram,
  queueIncentiveProgramEnrollmentWelcomeJob,
  queueIncentiveInvitedToEnrollReminderJob,
  queueFallIncentiveMoneyCanBeMadeReminderJob,
  queueFallIncentiveSessionQualificationJob,
  incentiveProgramEnrollmentEnroll,
} from '../../services/UserProductFlagsService'
import { Jobs } from '../../worker/jobs'
import {
  buildSession,
  buildUser,
  buildUserProductFlags,
} from '../mocks/generate'
import { getDbUlid } from '../../models/pgUtils'

jest.mock('../../models/User')
jest.mock('../../models/Session')
jest.mock('../../models/UserProductFlags')
jest.mock('../../services/QueueService')

const mockedUserRepo = jest.mocked(UserRepo)
const mockedUserProductFlagsRepo = jest.mocked(UserProductFlagsRepo)
const mockedSessionRepo = jest.mocked(SessionRepo)
const mockedQueueService = jest.mocked(QueueService)

describe('checkIfInIncentiveProgram', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should return true if user is already enrolled in the incentive program', async () => {
    const userId = getDbUlid()
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValue(
      buildUserProductFlags({
        fallIncentiveEnrollmentAt: new Date(),
      })
    )

    const result = await checkIfInIncentiveProgram(userId)
    expect(result).toEqual(true)
    expect(mockedUserProductFlagsRepo.getUPFByUserId).toHaveBeenCalledWith(
      userId
    )
  })

  test('Should return false if user is not enrolled in the incentive program', async () => {
    const userId = getDbUlid()
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValue(
      buildUserProductFlags({
        fallIncentiveEnrollmentAt: undefined,
      })
    )

    const result = await checkIfInIncentiveProgram(userId)
    expect(result).toEqual(false)
    expect(mockedUserProductFlagsRepo.getUPFByUserId).toHaveBeenCalledWith(
      userId
    )
  })
})

describe('queueIncentiveProgramEnrollmentWelcomeJob', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should queue the EmailFallIncentiveEnrollmentWelcome job', async () => {
    const userId = getDbUlid()

    await queueIncentiveProgramEnrollmentWelcomeJob(userId)
    expect(mockedQueueService.add).toHaveBeenCalledWith(
      Jobs.EmailFallIncentiveEnrollmentWelcome,
      { userId },
      { removeOnComplete: true, removeOnFail: true }
    )
  })
})

describe('queueIncentiveInvitedToEnrollReminderJob', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should queue the EmailFallIncentiveInvitedToEnrollmentReminder job', async () => {
    const userId = getDbUlid()

    await queueIncentiveInvitedToEnrollReminderJob(userId)
    expect(mockedQueueService.add).toHaveBeenCalledWith(
      Jobs.EmailFallIncentiveInvitedToEnrollReminder,
      { userId },
      { removeOnComplete: true, removeOnFail: true }
    )
  })
})

describe('queueFallIncentiveMoneyCanBeMadeReminderJob', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should queue the EmailFallIncentiveMoneyOnTable job with studentId', async () => {
    const sessionId = getDbUlid()
    const studentId = getDbUlid()
    mockedSessionRepo.getSessionById.mockResolvedValue(
      buildSession({ studentId })
    )

    await queueFallIncentiveMoneyCanBeMadeReminderJob(sessionId)
    expect(mockedSessionRepo.getSessionById).toHaveBeenCalledWith(sessionId)
    expect(mockedQueueService.add).toHaveBeenCalledWith(
      Jobs.EmailFallIncentiveMoneyOnTable,
      { userId: studentId },
      { removeOnComplete: true, removeOnFail: true }
    )
  })
})

describe('queueFallIncentiveSessionQualificationJob', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should queue the EmailFallIncentiveSessionQualification job with studentId', async () => {
    const sessionId = getDbUlid()
    const studentId = getDbUlid()
    mockedSessionRepo.getSessionById.mockResolvedValue(
      buildSession({ studentId })
    )

    await queueFallIncentiveSessionQualificationJob(sessionId)
    expect(mockedSessionRepo.getSessionById).toHaveBeenCalledWith(sessionId)
    expect(mockedQueueService.add).toHaveBeenCalledWith(
      Jobs.EmailFallIncentiveSessionQualification,
      { userId: studentId },
      { removeOnComplete: true, removeOnFail: true }
    )
  })
})

describe('incentiveProgramEnrollmentEnroll', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should throw error if user is already enrolled in the incentive program', async () => {
    const userId = getDbUlid()
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValue(
      buildUserProductFlags({
        fallIncentiveEnrollmentAt: new Date(),
      })
    )

    await expect(incentiveProgramEnrollmentEnroll(userId)).rejects.toThrow(
      `You're already enrolled in the fall incentive program.`
    )
    expect(mockedUserProductFlagsRepo.getUPFByUserId).toHaveBeenCalledWith(
      userId
    )
  })

  test('Should throw error if user phone is not verified', async () => {
    const userId = getDbUlid()
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValue(
      buildUserProductFlags()
    )
    mockedUserRepo.getUserVerificationInfoById.mockResolvedValue(
      buildUser({
        phoneVerified: false,
      })
    )

    await expect(incentiveProgramEnrollmentEnroll(userId)).rejects.toThrow(
      'Your phone number must be verified before joining the program.'
    )
    expect(mockedUserProductFlagsRepo.getUPFByUserId).toHaveBeenCalledWith(
      userId
    )
    expect(mockedUserRepo.getUserVerificationInfoById).toHaveBeenCalledWith(
      userId
    )
  })

  test('Should enroll the user if they are not already enrolled and their phone is verified', async () => {
    const userId = getDbUlid()
    const enrollmentDate = new Date()
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValue(
      buildUserProductFlags()
    )
    mockedUserRepo.getUserVerificationInfoById.mockResolvedValue(
      buildUser({
        phoneVerified: true,
      })
    )
    mockedUserProductFlagsRepo.enrollStudentToFallIncentiveProgram.mockResolvedValue(
      enrollmentDate
    )

    const result = await incentiveProgramEnrollmentEnroll(userId)
    expect(result).toBe(enrollmentDate)
    expect(mockedUserProductFlagsRepo.getUPFByUserId).toHaveBeenCalledWith(
      userId
    )
    expect(mockedUserRepo.getUserVerificationInfoById).toHaveBeenCalledWith(
      userId
    )
    expect(
      mockedUserProductFlagsRepo.enrollStudentToFallIncentiveProgram
    ).toHaveBeenCalledWith(userId)
    expect(mockedQueueService.add).toHaveBeenCalledWith(
      Jobs.EmailFallIncentiveEnrollmentWelcome,
      { userId },
      { removeOnComplete: true, removeOnFail: true }
    )
  })
})
