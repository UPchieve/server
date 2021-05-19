import { mocked } from 'ts-jest/utils'
import request, { Test } from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'

import { StudentDocument } from '../../models/Student'
import { VolunteerDocument } from '../../models/Volunteer'

import * as AuthService from '../../services/AuthService'
import * as AuthRouter from '../../router/auth'

jest.mock('../../services/AuthService')
const mockedAuthService = mocked(AuthService, true)

jest.mock('../../utils/auth-utils', () => ({
  ...jest.requireActual('../../utils/auth-utils'),
  authPassport: {
    setupPassport: jest.fn(),
    isAdmin: jest.fn((req, res, next) => {
      return next()
    })
  }
}))

const US_IP_ADDRESS = '161.185.160.93'
const AUTH_ROUTE = '/auth'

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const mockLogin = jest.fn()
function mockPassportMiddleware(req, res, next) {
  req.login = mockLogin
  next()
}
app.use(mockPassportMiddleware)

AuthRouter.routes(app)

const agent = request.agent(app)

async function sendGetQuery(route: string, payload: any): Promise<Test> {
  return agent
    .get(AUTH_ROUTE + route)
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .query(payload)
    .send()
}

async function sendGet(route: string, payload: any): Promise<Test> {
  return agent
    .get(AUTH_ROUTE + route)
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .send(payload)
}

async function sendPost(route: string, payload: any): Promise<Test> {
  return agent
    .post(AUTH_ROUTE + route)
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .send(payload)
}

describe('Test router logic', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  const PARTNER_VOLUNTEER = '/partner/volunteer'
  test(`Route ${PARTNER_VOLUNTEER} valid payload`, async () => {
    const payload = { partnerId: 'test' }
    mockedAuthService.lookupPartnerVolunteer.mockImplementationOnce(
      async () => {
        return payload.partnerId
      }
    )
    const response = await sendGetQuery(PARTNER_VOLUNTEER, payload)

    const {
      body: { volunteerPartner }
    } = response
    expect(AuthService.lookupPartnerVolunteer).toHaveBeenCalledTimes(1)
    expect(volunteerPartner).toEqual(payload.partnerId)
  })

  test(`Route ${PARTNER_VOLUNTEER} invalid payload`, async () => {
    const payload = {}
    const response = await sendGetQuery(PARTNER_VOLUNTEER, payload)

    const {
      body: { err }
    } = response
    expect(AuthService.lookupPartnerVolunteer).toHaveBeenCalledTimes(0)
    expect(err).toEqual('Missing volunteerPartnerId query string')
  })

  const PARTNER_STUDENT = '/partner/student'
  test(`Route ${PARTNER_STUDENT} valid payload`, async () => {
    const payload = { partnerId: 'test' }
    mockedAuthService.lookupPartnerStudent.mockImplementationOnce(async () => {
      return payload.partnerId
    })
    const response = await sendGetQuery(PARTNER_STUDENT, payload)

    const {
      body: { studentPartner }
    } = response
    expect(AuthService.lookupPartnerStudent).toHaveBeenCalledTimes(1)
    expect(studentPartner).toEqual(payload.partnerId)
  })

  test(`Route ${PARTNER_STUDENT} invalid payload`, async () => {
    const payload = {}
    const response = await sendGetQuery(PARTNER_STUDENT, payload)

    const {
      body: { err }
    } = response
    expect(AuthService.lookupPartnerStudent).toHaveBeenCalledTimes(0)
    expect(err).toEqual('Missing studentPartnerId query string')
  })

  const STUDENT_CODE = '/partner/student/code'
  test(`Route ${STUDENT_CODE} valid payload`, async () => {
    const payload = { partnerSignupCode: 'test' }
    mockedAuthService.lookupPartnerStudentCode.mockImplementationOnce(
      async () => {
        return payload.partnerSignupCode
      }
    )
    const response = await sendGetQuery(STUDENT_CODE, payload)

    const {
      body: { studentPartnerKey }
    } = response
    expect(AuthService.lookupPartnerStudentCode).toHaveBeenCalledTimes(1)
    expect(studentPartnerKey).toEqual(payload.partnerSignupCode)
  })

  test(`Route ${STUDENT_CODE} invalid payload`, async () => {
    const payload = {}
    const response = await sendGetQuery(STUDENT_CODE, payload)

    const {
      body: { err }
    } = response
    expect(AuthService.lookupPartnerStudentCode).toHaveBeenCalledTimes(0)
    expect(err).toEqual('Missing partnerSignupCode query string')
  })

  const SEND_RESET = '/reset/send'
  test(`Route ${SEND_RESET} valid payload`, async () => {
    const payload = { email: 'test@email.com' }
    mockedAuthService.sendReset.mockImplementationOnce(async () => {
      /* do nothing */
    })
    const response = await sendPost(SEND_RESET, payload)

    const {
      body: { msg }
    } = response
    expect(AuthService.sendReset).toHaveBeenCalledTimes(1)
    expect(msg).toEqual(
      'If an account with this email address exists then we will send a password reset email'
    )
  })

  test(`Route ${SEND_RESET} invalid payload`, async () => {
    const payload = { bad: 'bad' }
    const response = await sendPost(SEND_RESET, payload)

    const {
      body: { err }
    } = response
    expect(AuthService.sendReset).toHaveBeenCalledTimes(0)
    expect(err).toEqual('Missing email body string')
  })
})

describe('Test simple routes hit AuthService', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('Route /register/checkcred', async () => {
    const payload = {}
    mockedAuthService.checkCredential.mockImplementationOnce(async () => true)
    const response = await sendPost('/register/checkcred', payload)

    const {
      body: { checked }
    } = response
    expect(AuthService.checkCredential).toHaveBeenCalledTimes(1)
    expect(checked).toBeTruthy()
  })

  test('Route /register/student', async () => {
    const payload = {}
    const result = { _id: '123' } as StudentDocument
    mockedAuthService.registerStudent.mockImplementationOnce(async () => result)
    const response = await sendPost('/register/student', payload)

    const {
      body: { user }
    } = response
    expect(AuthService.registerStudent).toHaveBeenCalledTimes(1)
    expect(mockLogin).toHaveBeenCalledTimes(1)
    expect(user).toEqual(result)
  })

  test('Route /register/volunteer/open', async () => {
    const payload = { _id: '123' } as VolunteerDocument
    mockedAuthService.registerVolunteer.mockImplementationOnce(
      async () => payload
    )
    const response = await sendPost('/register/volunteer/open', {})

    const {
      body: { user }
    } = response
    expect(AuthService.registerVolunteer).toHaveBeenCalledTimes(1)
    expect(mockLogin).toHaveBeenCalledTimes(1)
    expect(user).toEqual(payload)
  })

  test('Route /register/volunteer/partner', async () => {
    const payload = { _id: '123' } as VolunteerDocument
    mockedAuthService.registerPartnerVolunteer.mockImplementationOnce(
      async () => payload
    )
    const response = await sendPost('/register/volunteer/partner', {})

    const {
      body: { user }
    } = response
    expect(AuthService.registerPartnerVolunteer).toHaveBeenCalledTimes(1)
    expect(mockLogin).toHaveBeenCalledTimes(1)
    expect(user).toEqual(payload)
  })

  test('Route /partner/student-partners', async () => {
    const payload = []
    mockedAuthService.lookupStudentPartners.mockImplementationOnce(
      async () => payload
    )
    const response = await sendGet('/partner/student-partners', {})

    const {
      body: { partnerOrgs }
    } = response
    expect(AuthService.lookupStudentPartners).toHaveBeenCalledTimes(1)
    expect(partnerOrgs).toEqual(payload)
  })

  test('Route /partner/volunteer-partners', async () => {
    const payload = []
    mockedAuthService.lookupVolunteerPartners.mockImplementationOnce(
      async () => payload
    )
    const response = await sendGet('/partner/volunteer-partners', {})

    const {
      body: { partnerOrgs }
    } = response
    expect(AuthService.lookupVolunteerPartners).toHaveBeenCalledTimes(1)
    expect(partnerOrgs).toEqual(payload)
  })

  test('Route /reset/confirm', async () => {
    mockedAuthService.confirmReset.mockImplementationOnce(async () => {
      /* do nothing */
    })
    const response = await sendPost('/reset/confirm', {})

    expect(response.status).toEqual(200)
  })
})
