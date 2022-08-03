import { mocked } from 'ts-jest/utils'

import { GRADES } from '../../constants'
import { buildUser, getIpAddress, getEmail } from '../mocks/generate'
import * as IneligibleStudentRepo from '../../models/IneligibleStudent/queries'
import * as SchoolRepo from '../../models/School/queries'
import * as UserCtrl from '../../controllers/UserCtrl'
import * as ZipCodeRepo from '../../models/ZipCode/queries'
import { getDbUlid } from '../../models/pgUtils'
import * as UserRepo from '../../models/User/queries'
import * as EligibilityService from '../../services/EligibilityService'
import { IneligibleStudent } from '../../models/IneligibleStudent'

jest.mock('../../services/IpAddressService')
jest.mock('../../models/IneligibleStudent/queries')
jest.mock('../../models/School/queries')
jest.mock('../../controllers/UserCtrl')
jest.mock('../../models/User/queries')
jest.mock('../../models/ZipCode/queries')

const mockedUserRepo = mocked(UserRepo, true)
const mockedIneligibleStudentRepo = mocked(IneligibleStudentRepo, true)
const mockedSchoolRepo = mocked(SchoolRepo, true)
const mockedUserCtrl = mocked(UserCtrl, true)
const mockedZipCodeRepo = mocked(ZipCodeRepo, true)

function buildIneligibleStudent(): IneligibleStudent {
  return {
    id: getDbUlid(),
    email: getEmail(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

const ELIGIBILITY_CHECK_PATH = '/check'
describe(ELIGIBILITY_CHECK_PATH, () => {
  beforeEach(() => {
    jest.resetAllMocks()
    // always mock db inserts
    mockedIneligibleStudentRepo.insertIneligibleStudent.mockResolvedValueOnce()
  })

  const ip = getIpAddress()
  const student = buildUser()
  const referredBy = getDbUlid()
  const school = {
    id: getDbUlid(),
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    nameStored: 'UPchieve highschool',
    stateStored: 'NY',
    isPartner: false,
  }
  const unapprovedSchool = {
    id: getDbUlid(),
    isApproved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    nameStored: 'Bad highschool',
    stateStored: 'NY',
    isPartner: false,
  }
  const approvedZipCode = {
    _id: getDbUlid(),
    zipCode: '11201',
    isEligible: true,
    medianIncome: 20000,
  }
  const unapprovedZipCode = {
    _id: getDbUlid(),
    zipCode: '00000',
    isEligible: false,
    medianIncome: 500000,
  }

  test('Should send true when a fresh high school student signs up', async () => {
    const payload = {
      schoolUpchieveId: school.id,
      zipCode: '11201',
      email: student.email,
      currentGrade: GRADES.TENTH,
      referredBy,
    }

    mockedUserRepo.getUserIdByEmail.mockResolvedValueOnce(undefined) // email doesnt belong to user
    mockedIneligibleStudentRepo.getIneligibleStudentByEmail.mockResolvedValue(
      undefined
    ) // email doesnt belong to ineligible student
    mockedSchoolRepo.findSchoolByUpchieveId.mockResolvedValueOnce(school)
    mockedZipCodeRepo.getZipCodeByZipCode.mockResolvedValueOnce(approvedZipCode)
    mockedUserCtrl.checkReferral.mockResolvedValueOnce(referredBy)

    const response = await EligibilityService.checkEligibility(ip, payload)

    expect(response.isEligible).toBe(true)
  })

  test('Should throw when reused user email signs up', async () => {
    const payload = {
      schoolUpchieveId: school.id,
      zipCode: '11201',
      email: student.email,
      currentGrade: GRADES.TENTH,
      referredBy,
    }

    mockedUserRepo.getUserIdByEmail.mockResolvedValueOnce(student.id) // email belongs to user

    try {
      await EligibilityService.checkEligibility(ip, payload)
      expect(true).toBe(false)
    } catch (err) {
      expect(err).toBeInstanceOf(EligibilityService.ExistingUserError)
    }
  })

  test('Should send false when reused ineligible email signs up', async () => {
    const payload = {
      schoolUpchieveId: school.id,
      zipCode: '11201',
      email: student.email,
      currentGrade: GRADES.TENTH,
      referredBy,
    }

    mockedUserRepo.getUserIdByEmail.mockResolvedValueOnce(undefined) // email doesnt belong to user
    mockedIneligibleStudentRepo.getIneligibleStudentByEmail.mockResolvedValue(
      buildIneligibleStudent()
    ) // email belongs to ineligible student
    mockedSchoolRepo.findSchoolByUpchieveId.mockResolvedValueOnce(school)
    mockedZipCodeRepo.getZipCodeByZipCode.mockResolvedValueOnce(approvedZipCode)
    mockedUserCtrl.checkReferral.mockResolvedValueOnce(referredBy)

    const response = await EligibilityService.checkEligibility(ip, payload)

    expect(response.isEligible).toBe(false)
  })

  test('Should send true when a fresh student with approved zip but unapproved HS signs up', async () => {
    const payload = {
      schoolUpchieveId: unapprovedSchool.id,
      zipCode: '11201',
      email: student.email,
      currentGrade: GRADES.TENTH,
      referredBy,
    }

    mockedUserRepo.getUserIdByEmail.mockResolvedValueOnce(undefined) // email doesnt belong to user
    mockedIneligibleStudentRepo.getIneligibleStudentByEmail.mockResolvedValue(
      undefined
    ) // email doesnt belong to ineligible student
    mockedSchoolRepo.findSchoolByUpchieveId.mockResolvedValueOnce(
      unapprovedSchool
    )
    mockedZipCodeRepo.getZipCodeByZipCode.mockResolvedValueOnce(approvedZipCode)
    mockedUserCtrl.checkReferral.mockResolvedValueOnce(referredBy)

    const response = await EligibilityService.checkEligibility(ip, payload)

    expect(response.isEligible).toBe(true)
  })

  test('Should send true when a fresh student with unapproved zip but approved HS signs up', async () => {
    const payload = {
      schoolUpchieveId: school.id,
      zipCode: '00000',
      email: student.email,
      currentGrade: GRADES.TENTH,
      referredBy,
    }

    mockedUserRepo.getUserIdByEmail.mockResolvedValueOnce(undefined) // email doesnt belong to user
    mockedIneligibleStudentRepo.getIneligibleStudentByEmail.mockResolvedValue(
      undefined
    ) // email doesnt belong to ineligible student
    mockedSchoolRepo.findSchoolByUpchieveId.mockResolvedValueOnce(school)
    mockedZipCodeRepo.getZipCodeByZipCode.mockResolvedValueOnce(
      unapprovedZipCode
    )
    mockedUserCtrl.checkReferral.mockResolvedValueOnce(referredBy)

    const response = await EligibilityService.checkEligibility(ip, payload)

    expect(response.isEligible).toBe(true)
  })

  test('Should send false when fresh email with unapproved zip and school signs up', async () => {
    const payload = {
      schoolUpchieveId: unapprovedSchool.id,
      zipCode: '00000',
      email: student.email,
      currentGrade: GRADES.TENTH,
      referredBy,
    }

    mockedUserRepo.getUserIdByEmail.mockResolvedValueOnce(undefined) // email doesnt belong to user
    mockedIneligibleStudentRepo.getIneligibleStudentByEmail.mockResolvedValue(
      undefined
    ) // email doesnt belong to ineligible student
    mockedSchoolRepo.findSchoolByUpchieveId.mockResolvedValueOnce(
      unapprovedSchool
    )
    mockedZipCodeRepo.getZipCodeByZipCode.mockResolvedValueOnce(
      unapprovedZipCode
    )
    mockedUserCtrl.checkReferral.mockResolvedValueOnce(referredBy)

    const response = await EligibilityService.checkEligibility(ip, payload)

    expect(response.isEligible).toBe(false)
  })

  test('Should send false when fresh college student signs up', async () => {
    const payload = {
      schoolUpchieveId: school.id,
      zipCode: '11201',
      email: student.email,
      currentGrade: GRADES.COLLEGE,
      referredBy,
    }

    mockedUserRepo.getUserIdByEmail.mockResolvedValueOnce(undefined) // email doesnt belong to user
    mockedIneligibleStudentRepo.getIneligibleStudentByEmail.mockResolvedValue(
      undefined
    ) // email doesnt belong to ineligible student
    mockedSchoolRepo.findSchoolByUpchieveId.mockResolvedValueOnce(school)
    mockedZipCodeRepo.getZipCodeByZipCode.mockResolvedValueOnce(approvedZipCode)
    mockedUserCtrl.checkReferral.mockResolvedValueOnce(referredBy)

    const response = await EligibilityService.checkEligibility(ip, payload)

    expect(response.isEligible).toBe(false)
    expect(response.isCollegeStudent).toBe(true)
  })
})
