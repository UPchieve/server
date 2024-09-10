import { mocked } from 'jest-mock'
import * as UserRepo from '../../models/User'
import * as UserProductFlagsRepo from '../../models/UserProductFlags'
import * as IncentiveProgramService from '../../services/IncentiveProgramService'
import { incentiveProgramEnrollmentEnroll } from '../../services/UserProductFlagsService'
import { buildUser, buildUserProductFlags } from '../mocks/generate'
import { getDbUlid } from '../../models/pgUtils'

jest.mock('../../models/User')
jest.mock('../../models/UserProductFlags')
jest.mock('../../services/IncentiveProgramService')

const mockedUserRepo = mocked(UserRepo)
const mockedUserProductFlagsRepo = mocked(UserProductFlagsRepo)
const mockedIncentiveProgramService = mocked(IncentiveProgramService)

describe('incentiveProgramEnrollmentEnroll', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should throw error if user is already enrolled in the incentive program', async () => {
    const userId = getDbUlid()
    mockedIncentiveProgramService.isUserInIncentiveProgram.mockResolvedValueOnce(
      true
    )

    await expect(incentiveProgramEnrollmentEnroll(userId)).rejects.toThrow(
      `You're already enrolled in the fall incentive program.`
    )
    expect(
      mockedIncentiveProgramService.isUserInIncentiveProgram
    ).toHaveBeenCalled()
  })

  test('Should throw error if user phone is not verified', async () => {
    const userId = getDbUlid()
    mockedIncentiveProgramService.isUserInIncentiveProgram.mockResolvedValueOnce(
      false
    )
    mockedUserRepo.getUserVerificationInfoById.mockResolvedValue(
      buildUser({
        phoneVerified: false,
      })
    )

    await expect(incentiveProgramEnrollmentEnroll(userId)).rejects.toThrow(
      'Your phone number must be verified before joining the program.'
    )
    expect(
      mockedIncentiveProgramService.isUserInIncentiveProgram
    ).toHaveBeenCalled()
    expect(mockedUserRepo.getUserVerificationInfoById).toHaveBeenCalledWith(
      userId
    )
  })

  test('Should enroll the user if they are not already enrolled and their phone is verified', async () => {
    const userId = getDbUlid()
    const enrollmentDate = new Date()
    mockedIncentiveProgramService.isUserInIncentiveProgram.mockResolvedValueOnce(
      false
    )
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
    expect(
      mockedIncentiveProgramService.isUserInIncentiveProgram
    ).toHaveBeenCalled()
    expect(mockedUserRepo.getUserVerificationInfoById).toHaveBeenCalledWith(
      userId
    )
    expect(
      mockedUserProductFlagsRepo.enrollStudentToFallIncentiveProgram
    ).toHaveBeenCalledWith(userId)
    expect(
      mockedIncentiveProgramService.queueIncentiveProgramEnrollmentWelcomeJob
    ).toHaveBeenCalled()
  })
})
