import request, { Response } from 'supertest'
import { mocked } from 'jest-mock'
import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { routeVerify } from '../../../router/api/verify'
import * as VerificationService from '../../../services/VerificationService'
import { AlreadyInUseError, TwilioError } from '../../../models/Errors'
import { buildUser, getPhoneNumber } from '../../mocks/generate'

const addCustomAttribute = jest.fn()

function checkRecaptcha(
  _req: ExpressRequest<string, unknown>,
  _res: ExpressResponse,
  next: () => void
): void {
  next()
}

jest.mock('../../../services/VerificationService')
jest.mock('../../../utils/auth-utils', () => ({
  authPassport: {
    checkRecaptcha,
  },
}))
jest.mock('newrelic', () => ({
  __esModule: true,
  default: {
    addCustomAttribute: (...args: unknown[]) => addCustomAttribute(...args),
  },
}))
jest.mock('../../../logger')

const mockedVerificationService = mocked(VerificationService)

let mockUser = buildUser()

function mockGetUser() {
  return mockUser
}

const router = mockRouter()
routeVerify(router)

const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))
app.use('/api', router)

const agent = request.agent(app)

function sendPost(
  path: string,
  payload?: Record<string, unknown>
): Promise<Response> {
  return agent.post(path).set('Accept', 'application/json').send(payload)
}

const phoneNumber = getPhoneNumber()
const verificationCode = '123456'
const smsVerificationMethod = 'sms'

describe('routeVerify', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildUser()
  })

  describe('POST /api/verify/send', () => {
    test('initiates verification', async () => {
      mockedVerificationService.initiateVerification.mockResolvedValueOnce()

      const response = await sendPost('/api/verify/send', {
        sendTo: phoneNumber,
        verificationMethod: smsVerificationMethod,
      })
      expect(response.status).toBe(200)
      expect(
        mockedVerificationService.initiateVerification
      ).toHaveBeenCalledWith({
        userId: mockUser.id,
        firstName: mockUser.firstName,
        sendTo: phoneNumber,
        verificationMethod: smsVerificationMethod,
      })
    })

    test('returns 429 for twilio rate limiting', async () => {
      mockedVerificationService.initiateVerification.mockRejectedValueOnce(
        new TwilioError('Too many requests', 429)
      )

      const response = await sendPost('/api/verify/send', {
        sendTo: phoneNumber,
        verificationMethod: smsVerificationMethod,
      })
      expect(response.status).toBe(429)
      expect(response.body).toEqual({
        err: "You've made too many attempts for a verification code. Please wait 10 minutes before requesting a new one.",
      })
    })

    test('returns 400 for already in use error', async () => {
      const errorMessage = 'This phone number is already in use.'
      mockedVerificationService.initiateVerification.mockRejectedValueOnce(
        new AlreadyInUseError(errorMessage)
      )

      const response = await sendPost('/api/verify/send', {
        sendTo: phoneNumber,
        verificationMethod: smsVerificationMethod,
      })
      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        err: errorMessage,
      })
    })

    test('returns 500 for generic error', async () => {
      mockedVerificationService.initiateVerification.mockRejectedValueOnce(
        new Error('Error')
      )

      const response = await sendPost('/api/verify/send', {
        sendTo: phoneNumber,
        verificationMethod: smsVerificationMethod,
      })
      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        err: 'We were unable to send you a verification code. Please contact the UPchieve team at support@upchieve.org for help.',
      })
    })
  })

  describe('POST /api/verify/v2/send', () => {
    test('initiates verification through v2 route', async () => {
      mockedVerificationService.initiateVerification.mockResolvedValueOnce()

      const response = await sendPost('/api/verify/v2/send', {
        sendTo: phoneNumber,
        verificationMethod: smsVerificationMethod,
        recaptchaToken: 'token',
      })
      expect(response.status).toBe(200)
      expect(
        mockedVerificationService.initiateVerification
      ).toHaveBeenCalledWith({
        userId: mockUser.id,
        firstName: mockUser.firstName,
        sendTo: phoneNumber,
        verificationMethod: smsVerificationMethod,
        recaptchaToken: 'token',
      })
    })

    test('returns 429 for twilio rate limiting', async () => {
      mockedVerificationService.initiateVerification.mockRejectedValueOnce(
        new TwilioError('Too many requests', 429)
      )

      const response = await sendPost('/api/verify/v2/send', {
        sendTo: phoneNumber,
        verificationMethod: smsVerificationMethod,
      })
      expect(response.status).toBe(429)
      expect(response.body).toEqual({
        err: "You've made too many attempts for a verification code. Please wait 10 minutes before requesting a new one.",
      })
    })

    test('returns 400 for already in use error', async () => {
      const errorMessage = 'This phone number is already in use.'
      mockedVerificationService.initiateVerification.mockRejectedValueOnce(
        new AlreadyInUseError(errorMessage)
      )

      const response = await sendPost('/api/verify/v2/send', {
        sendTo: phoneNumber,
        verificationMethod: smsVerificationMethod,
      })
      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        err: errorMessage,
      })
    })

    test('returns 500 for generic error', async () => {
      mockedVerificationService.initiateVerification.mockRejectedValueOnce(
        new Error('Error')
      )

      const response = await sendPost('/api/verify/v2/send', {
        sendTo: phoneNumber,
        verificationMethod: smsVerificationMethod,
      })
      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        err: 'We were unable to send you a verification code. Please contact the UPchieve team at support@upchieve.org for help.',
      })
    })
  })

  describe('POST /api/verify/confirm', () => {
    test('confirms verification and returns success true', async () => {
      const success = true
      mockedVerificationService.confirmVerification.mockResolvedValueOnce(
        success
      )

      const response = await sendPost('/api/verify/confirm', {
        verificationCode,
        verificationMethod: smsVerificationMethod,
      })
      expect(response.status).toBe(200)
      expect(addCustomAttribute).toHaveBeenCalledWith(
        'role',
        mockUser.roles.toString()
      )
      expect(
        mockedVerificationService.confirmVerification
      ).toHaveBeenCalledWith({
        userId: mockUser.id,
        verificationCode,
        verificationMethod: smsVerificationMethod,
      })
      expect(response.body).toEqual({ success })
    })

    test('returns 400 when twilio says code expired', async () => {
      mockedVerificationService.confirmVerification.mockRejectedValueOnce(
        new TwilioError('code expired', 404)
      )

      const response = await sendPost('/api/verify/confirm', {
        verificationCode,
        verificationMethod: smsVerificationMethod,
      })
      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        err: 'The code has expired. Please request a new verification code and try again.',
      })
    })

    test('returns 500 for generic confirm errors', async () => {
      mockedVerificationService.confirmVerification.mockRejectedValueOnce(
        new Error('Error')
      )

      const response = await sendPost('/api/verify/confirm', {
        verificationCode,
        verificationMethod: smsVerificationMethod,
      })
      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        err: 'Please double-check your verification code. If the problem persists, please contact the UPchieve team at support@upchieve.org for help.',
      })
    })
  })
})
