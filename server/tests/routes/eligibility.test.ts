import { mocked } from 'ts-jest/utils'
import request, { Test } from 'supertest'

import * as IpAddressService from '../../services/IpAddressService'
import { routes as EligibilityRouter } from '../../router/eligibility'
import { NotAllowedError } from '../../models/Errors'
import { mockApp } from '../mock-app'
import { GRADES } from '../../constants'
import { buildStudent, buildSchool } from '../generate'
import * as IneligibleStudentRepo from '../../models/IneligibleStudent/queries'

jest.mock('../../services/IpAddressService')
jest.mock('../../models/IneligibleStudent/queries')

const mockedIpAddressService = mocked(IpAddressService, true)
const mockedIneligibleStudentRepo = mocked(IneligibleStudentRepo, true)

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
    .get(API_ROUTE + route)
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

const ELIGIBILITY_CHECK_PATH = '/check'
describe(ELIGIBILITY_CHECK_PATH, () => {
  test('Should send error message when college students sign up', async () => {
    const student = buildStudent()
    const school = buildSchool()
    const payload = {
      schoolUpchieveId: school._id,
      zipCode: '11201',
      email: student.email,
      currentGrade: GRADES.COLLEGE,
    }
    const mockIneligibleStudent = {
      schoolUpchieveId: school._id,
      zipCode: '11201',
      email: student.email,
      currentGrade: GRADES.COLLEGE,
    }

    // mockedIneligibleStudentRepo.getIneligibleStudentByEmail.mockResolvedValue()
    //mockedIneligibleStudentRepo.createIneligibleStudent.mockResolvedValue(mockIneligibleStudent)
    // const response = await sendPost(ELIGIBILITY_CHECK_PATH, payload)

    // expect(response.body.isEligible).toBe(false)
    // expect(response.body.message).toBe('Student is not a high school student.')
  })
})
