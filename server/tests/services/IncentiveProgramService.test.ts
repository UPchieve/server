import { mocked } from 'jest-mock'
import * as SessionRepo from '../../models/Session'
import * as UserRepo from '../../models/User'
import * as UserProductFlagsRepo from '../../models/UserProductFlags'
import QueueService from '../../services/QueueService'
import {
  isUserInIncentiveProgram,
  queueIncentiveProgramEnrollmentWelcomeJob,
  queueIncentiveInvitedToEnrollReminderJob,
  queueFallIncentiveLeavingMoneyOnTableJob,
  queueFallIncentiveSessionQualificationJob,
  getUserFallIncentiveData,
} from '../../services/IncentiveProgramService'
import { Jobs } from '../../worker/jobs'
import {
  buildSession,
  buildUser,
  buildUserProductFlags,
} from '../mocks/generate'
import { getDbUlid } from '../../models/pgUtils'
import * as FeatureFlagsService from '../../services/FeatureFlagService'

jest.mock('../../models/User')
jest.mock('../../models/Session')
jest.mock('../../models/UserProductFlags')
jest.mock('../../services/QueueService')
jest.mock('../../services/FeatureFlagService')

const mockedUserRepo = mocked(UserRepo)
const mockedUserProductFlagsRepo = mocked(UserProductFlagsRepo)
const mockedFeatureFlagsService = mocked(FeatureFlagsService)
const mockedSessionRepo = mocked(SessionRepo)
const mockedQueueService = mocked(QueueService)

describe('isUserInIncentiveProgram', () => {
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

    const result = await isUserInIncentiveProgram(userId)
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

    const result = await isUserInIncentiveProgram(userId)
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
    const twelveHoursInMs = 1000 * 60 * 60 * 12

    await queueIncentiveInvitedToEnrollReminderJob(userId)
    expect(mockedQueueService.add).toHaveBeenCalledWith(
      Jobs.EmailFallIncentiveInvitedToEnrollReminder,
      { userId },
      { removeOnComplete: true, removeOnFail: true, delay: twelveHoursInMs }
    )
  })
})

describe('queueFallIncentiveMoneyCanBeMadeReminderJob', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should queue the EmailFallIncentiveLeavingMoneyOnTable job with studentId', async () => {
    const sessionId = getDbUlid()
    const studentId = getDbUlid()
    mockedSessionRepo.getSessionById.mockResolvedValue(
      buildSession({ studentId })
    )

    await queueFallIncentiveLeavingMoneyOnTableJob(sessionId)
    expect(mockedSessionRepo.getSessionById).toHaveBeenCalledWith(sessionId)
    expect(mockedQueueService.add).toHaveBeenCalledWith(
      Jobs.EmailFallIncentiveLeavingMoneyOnTable,
      { userId: studentId, sessionId },
      { removeOnComplete: true, removeOnFail: true }
    )
  })
})

describe('queueFallIncentiveSessionQualificationJob', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should not queue the EmailFallIncentiveSessionQualification job if not a matched session', async () => {
    const sessionId = getDbUlid()
    const studentId = getDbUlid()
    mockedSessionRepo.getSessionById.mockResolvedValue(
      buildSession({ studentId })
    )

    await queueFallIncentiveSessionQualificationJob(sessionId)
    expect(mockedSessionRepo.getSessionById).toHaveBeenCalledWith(sessionId)
    expect(mockedQueueService.add).not.toHaveBeenCalled()
  })

  test('Should queue the EmailFallIncentiveSessionQualification job with studentId', async () => {
    const sessionId = getDbUlid()
    const studentId = getDbUlid()
    mockedSessionRepo.getSessionById.mockResolvedValue(
      buildSession({ studentId, volunteerId: getDbUlid() })
    )

    await queueFallIncentiveSessionQualificationJob(sessionId)
    expect(mockedSessionRepo.getSessionById).toHaveBeenCalledWith(sessionId)
    expect(mockedQueueService.add).toHaveBeenCalledWith(
      Jobs.EmailFallIncentiveSessionQualification,
      { userId: studentId, sessionId },
      { removeOnComplete: true, removeOnFail: true }
    )
  })
})

describe('getUserFallIncentiveData', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should return undefined if no user is found', async () => {
    const user = buildUser()
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(undefined)
    const result = await getUserFallIncentiveData(user.id, true)
    expect(result).toBeUndefined()
  })

  test('Should return undefined if no product flags are found', async () => {
    const user = buildUser()
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(user)
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValueOnce(undefined)

    const result = await getUserFallIncentiveData(user.id, true)
    expect(result).toBeUndefined()
  })

  test('Should return undefined if no payload is found for the incentive feature flag', async () => {
    const user = buildUser()
    const productFlags = buildUserProductFlags()
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(user)
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValueOnce(
      productFlags
    )
    mockedFeatureFlagsService.getFallIncentiveProgramPayload.mockResolvedValueOnce(
      null
    )

    const result = await getUserFallIncentiveData(user.id, true)
    expect(result).toBeUndefined()
  })

  test(`Should return undefined if enrollment flag does not match user's enrollment status`, async () => {
    const user = buildUser()
    const productFlags = buildUserProductFlags({
      fallIncentiveEnrollmentAt: undefined,
    })
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(user)
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValueOnce(
      productFlags
    )
    mockedFeatureFlagsService.getFallIncentiveProgramPayload.mockResolvedValueOnce(
      new Date().toISOString()
    )

    const result = await getUserFallIncentiveData(user.id, true)
    expect(result).toBeUndefined()
  })

  test('Should return user, product flags, and incentive program data if everything matches', async () => {
    const user = buildUser()
    const productFlags = buildUserProductFlags({
      fallIncentiveEnrollmentAt: new Date(),
    })
    const incentiveProgramDate = new Date().toISOString()

    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(user)
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValueOnce(
      productFlags
    )
    mockedFeatureFlagsService.getFallIncentiveProgramPayload.mockResolvedValueOnce(
      incentiveProgramDate
    )

    const result = await getUserFallIncentiveData(user.id, true)
    expect(result).toEqual({
      user,
      productFlags,
      incentiveProgramDate: new Date(incentiveProgramDate),
    })
  })
})
