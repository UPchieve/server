import { mocked } from 'jest-mock'
import * as SessionRepo from '../../models/Session'
import * as UserService from '../../services/UserService'
import * as UserProductFlagsRepo from '../../models/UserProductFlags'
import QueueService from '../../services/QueueService'
import {
  isUserInIncentiveProgram,
  queueIncentiveProgramEnrollmentWelcomeJob,
  queueIncentiveInvitedToEnrollReminderJob,
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

jest.mock('../../services/UserService')
jest.mock('../../models/Session')
jest.mock('../../models/UserProductFlags')
jest.mock('../../services/QueueService')
jest.mock('../../services/FeatureFlagService')

const mockedUserService = mocked(UserService)
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
      { userId }
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
      { delay: twelveHoursInMs }
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
      { userId: studentId, sessionId }
    )
  })
})

describe('getUserFallIncentiveData', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should return undefined if no user is found', async () => {
    const user = buildUser()
    mockedUserService.getUserContactInfo.mockResolvedValueOnce(undefined)
    const result = await getUserFallIncentiveData(user.id, true)
    expect(result).toBeUndefined()
  })

  test('Should return undefined if no product flags are found', async () => {
    const user = buildUser()
    mockedUserService.getUserContactInfo.mockResolvedValueOnce(user)
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValueOnce(undefined)

    const result = await getUserFallIncentiveData(user.id, true)
    expect(result).toBeUndefined()
  })

  test('Should return undefined if no payload is found for the incentive feature flag', async () => {
    const user = buildUser()
    const productFlags = buildUserProductFlags()
    mockedUserService.getUserContactInfo.mockResolvedValueOnce(user)
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
    mockedUserService.getUserContactInfo.mockResolvedValueOnce(user)
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValueOnce(
      productFlags
    )
    mockedFeatureFlagsService.getFallIncentiveProgramPayload.mockResolvedValueOnce(
      {
        incentiveStartDate: new Date(),
        maxQualifiedSessionsPerWeek: 1,
        maxQualifiedSessionsPerUser: 10,
      }
    )

    const result = await getUserFallIncentiveData(user.id, true)
    expect(result).toBeUndefined()
  })

  test('Should return user, product flags, and incentive program data if everything matches', async () => {
    const user = buildUser()
    const productFlags = buildUserProductFlags({
      fallIncentiveEnrollmentAt: new Date(),
    })
    const incentivePayload = {
      incentiveStartDate: new Date(),
      maxQualifiedSessionsPerWeek: 1,
      maxQualifiedSessionsPerUser: 10,
    }

    mockedUserService.getUserContactInfo.mockResolvedValueOnce(user)
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValueOnce(
      productFlags
    )
    mockedFeatureFlagsService.getFallIncentiveProgramPayload.mockResolvedValueOnce(
      incentivePayload
    )

    const result = await getUserFallIncentiveData(user.id, true)
    expect(result).toEqual({
      user,
      productFlags,
      incentivePayload,
    })
  })
})
