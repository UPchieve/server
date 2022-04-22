import { mocked } from 'ts-jest/utils'
import request, { Test } from 'supertest'

import * as IpAddressService from '../../services/IpAddressService'
import { routes as EligibilityRouter } from '../../router/eligibility'
import { NotAllowedError } from '../../models/Errors'
import { mockApp } from '../mock-app'
import { GRADES } from '../../constants'
import { buildUser, getIpAddress } from '../pg-generate'
import * as IneligibleStudentRepo from '../../models/IneligibleStudent/queries'
import * as SchoolRepo from '../../models/School/queries'
import * as UserCtrl from '../../controllers/UserCtrl'
import * as UserRepo from '../../models/User/queries'
import * as ZipCodeRepo from '../../models/ZipCode/queries'
import { getDbUlid } from '../../models/pgUtils'

jest.mock('../../services/IpAddressService')
jest.mock('../../models/IneligibleStudent/queries')
jest.mock('../../models/School/queries')
jest.mock('../../controllers/UserCtrl')
jest.mock('../../models/User/queries')
jest.mock('../../models/ZipCode/queries')

const mockedIpAddressService = mocked(IpAddressService, true)
const mockedIneligibleStudentRepo = mocked(IneligibleStudentRepo, true)
const mockedSchoolRepo = mocked(SchoolRepo, true)
const mockedUserCtrl = mocked(UserCtrl, true)
const mockedUserRepo = mocked(UserRepo, true)
const mockedZipCodeRepo = mocked(ZipCodeRepo, true)

const US_IP_ADDRESS = '161.185.160.93'
const API_ROUTE = '/api-public/eligibility'

const app = mockApp()

EligibilityRouter(app)

const agent = request.agent(app)

async function sendGet(route: string, payload: any): Promise<Test> {
  return agent
    .get(API_ROUTE + route)
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .send(payload)
}

async function sendPost(route: string, payload: any): Promise<Test> {
  return agent
    .post(API_ROUTE + route)
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .send(payload)
}

const IP_CHECK_PATH = '/ip-check'
describe(IP_CHECK_PATH, () => {
  test('Should send status code 200 with valid request', async () => {
    mockedIpAddressService.checkIpAddress.mockImplementationOnce(
      async () => undefined
    )
    const response = await sendGet(IP_CHECK_PATH, {})
    expect(response.status).toBe(200)
  })

  test('Should send status code 403 when the IP address not a U.S. IP address', async () => {
    mockedIpAddressService.checkIpAddress.mockImplementationOnce(async () => {
      throw new NotAllowedError()
    })
    const response = await sendGet(IP_CHECK_PATH, {})
    expect(response.status).toBe(403)
  })
})

function buildEligibilitySchool() {
  return {
    id: getDbUlid(),
    isApproved: true,
    upchieveId: getDbUlid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    nameStored: 'UPchieve highschool',
    stateStored: 'NY',
    isPartner: false,
  }
}
const ELIGIBILITY_CHECK_PATH = '/check'
describe(ELIGIBILITY_CHECK_PATH, () => {
  test('Should send error message when college students sign up', async () => {
    const student = buildUser()
    const referredBy = getDbUlid()
    const school = buildEligibilitySchool()
    const mockZipCode = {
      _id: getDbUlid(),
      zipCode: '11201',
      isEligible: true,
      medianIncome: 20000,
    }
    const payload = {
      schoolUpchieveId: school.upchieveId ? school.upchieveId : getDbUlid(),
      zipCode: '11201',
      email: student.email,
      currentGrade: GRADES.COLLEGE,
    }

    mockedZipCodeRepo.getZipCodeByZipCode.mockResolvedValueOnce(mockZipCode)
    mockedSchoolRepo.findSchoolByUpchieveId.mockResolvedValueOnce(school)
    mockedUserCtrl.checkReferral.mockResolvedValueOnce(referredBy)
    mockedIneligibleStudentRepo.insertIneligibleStudent.mockResolvedValue()

    const response = await sendPost(ELIGIBILITY_CHECK_PATH, payload)

    expect(response.body.isEligible).toBe(false)
    expect(response.body.isCollegeStudent).toBe(true)
  })
})
