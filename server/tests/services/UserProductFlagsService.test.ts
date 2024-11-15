import { mocked } from 'jest-mock'
import * as UserRepo from '../../models/User'
import * as LegacyUserRepo from '../../models/User/legacy-user'
import * as UserProductFlagsRepo from '../../models/UserProductFlags'
import * as IncentiveProgramService from '../../services/IncentiveProgramService'
import * as MailService from '../../services/MailService'
import { incentiveProgramEnrollmentEnroll } from '../../services/UserProductFlagsService'
import {
  buildLegacyStudent,
  buildUser,
  buildUserProductFlags,
} from '../mocks/generate'
import { getDbUlid } from '../../models/pgUtils'

jest.mock('../../models/User')
jest.mock('../../models/User/legacy-user')
jest.mock('../../models/UserProductFlags')
jest.mock('../../services/IncentiveProgramService')
jest.mock('../../services/MailService')

const mockedUserRepo = mocked(UserRepo)
const mockedLegacyUserRepo = mocked(LegacyUserRepo)
const mockedUserProductFlagsRepo = mocked(UserProductFlagsRepo)
const mockedIncentiveProgramService = mocked(IncentiveProgramService)
const mockedMailService = mocked(MailService)

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

  test('Should throw error if user is not a school partner and phone is not verified', async () => {
    const userId = getDbUlid()
    mockedIncentiveProgramService.isUserInIncentiveProgram.mockResolvedValueOnce(
      false
    )
    mockedUserRepo.getUserVerificationInfoById.mockResolvedValue(
      buildUser({
        phoneVerified: false,
      })
    )
    mockedLegacyUserRepo.getLegacyUserObject.mockResolvedValueOnce(
      buildLegacyStudent({ isSchoolPartner: false })
    )

    await expect(incentiveProgramEnrollmentEnroll(userId)).rejects.toThrow(
      'Your phone number must be verified before joining the program.'
    )
    expect(
      mockedIncentiveProgramService.isUserInIncentiveProgram
    ).toHaveBeenCalled()
    expect(mockedLegacyUserRepo.getLegacyUserObject).toHaveBeenCalledWith(
      userId
    )
    expect(mockedUserRepo.getUserVerificationInfoById).toHaveBeenCalledWith(
      userId
    )
  })

  test('Should throw error if user is a school partner and does not have proxy email', async () => {
    const userId = getDbUlid()
    mockedIncentiveProgramService.isUserInIncentiveProgram.mockResolvedValueOnce(
      false
    )
    mockedLegacyUserRepo.getLegacyUserObject.mockResolvedValueOnce(
      buildLegacyStudent({ isSchoolPartner: true })
    )

    await expect(incentiveProgramEnrollmentEnroll(userId)).rejects.toThrow(
      'No email was provided to enroll into the fall incentive program.'
    )
    expect(
      mockedIncentiveProgramService.isUserInIncentiveProgram
    ).toHaveBeenCalled()
    expect(mockedLegacyUserRepo.getLegacyUserObject).toHaveBeenCalledWith(
      userId
    )
    expect(mockedUserRepo.getUserVerificationInfoById).toHaveBeenCalledTimes(0)
  })

  test('Should enroll the non school partner if they are not already enrolled and their phone is verified', async () => {
    const userId = getDbUlid()
    const enrollmentDate = new Date()
    mockedIncentiveProgramService.isUserInIncentiveProgram.mockResolvedValueOnce(
      false
    )
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValue(
      buildUserProductFlags()
    )
    mockedLegacyUserRepo.getLegacyUserObject.mockResolvedValueOnce(
      buildLegacyStudent({ isSchoolPartner: false })
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
    expect(mockedMailService.createContact).toHaveBeenCalled()
  })

  test('Should enroll the school partner if they are not already enrolled and proxy email is provided', async () => {
    const userId = getDbUlid()
    const enrollmentDate = new Date()
    mockedIncentiveProgramService.isUserInIncentiveProgram.mockResolvedValueOnce(
      false
    )
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValue(
      buildUserProductFlags()
    )
    mockedLegacyUserRepo.getLegacyUserObject.mockResolvedValueOnce(
      buildLegacyStudent({ isSchoolPartner: true })
    )
    mockedUserRepo.updateUserProxyEmail.mockResolvedValueOnce()
    mockedUserProductFlagsRepo.enrollStudentToFallIncentiveProgram.mockResolvedValue(
      enrollmentDate
    )

    const result = await incentiveProgramEnrollmentEnroll(
      userId,
      'test@test.com'
    )
    expect(result).toBe(enrollmentDate)
    expect(
      mockedIncentiveProgramService.isUserInIncentiveProgram
    ).toHaveBeenCalled()
    expect(mockedUserRepo.updateUserProxyEmail).toHaveBeenCalled()
    expect(
      mockedUserProductFlagsRepo.enrollStudentToFallIncentiveProgram
    ).toHaveBeenCalledWith(userId)
    expect(
      mockedIncentiveProgramService.queueIncentiveProgramEnrollmentWelcomeJob
    ).toHaveBeenCalled()
    expect(mockedMailService.createContact).toHaveBeenCalled()
  })
})
