// test.todo('postgres migration')
/*import request, { Test } from 'supertest'
import { mocked } from 'jest-mock';

import { routeVerify, TwilioError } from '../../router/api/verify'
import { VERIFICATION_METHOD } from '../../constants'
import * as VerificationService from '../../services/VerificationService'
import { buildStudent } from '../generate'
import { mockApp, mockPassportMiddleware, mockRouter } from '../mock-app'
import { authPassport } from '../../utils/auth-utils'
import logger from '../../logger'

jest.mock('../../services/VerificationService')
const mockedVerificationService = mocked(VerificationService, true)

const app = mockApp()

const student = buildStudent()
const mockGetUser = () => student
app.use(mockPassportMiddleware(mockGetUser))

const router = mockRouter()
routeVerify(router)

app.use('/api', authPassport.isAuthenticated, router)

const agent = request.agent(app)

type SendVerificationOptions = {
  sendTo: string
  verificationMethod: VERIFICATION_METHOD
}

type ConfirmVerificationOptions = {
  verificationCode: string
  sendTo: string
  verificationMethod: VERIFICATION_METHOD
}

const sendVerificationCode = (data: SendVerificationOptions): Test =>
  agent
    .post('/api/verify/send')
    .set('Accept', 'application/json')
    .send(data)

const confirmVerificationCode = (data: ConfirmVerificationOptions): Test =>
  agent
    .post('/api/verify/confirm')
    .set('Accept', 'application/json')
    .send(data)

beforeEach(async () => {
  jest.resetAllMocks()
})

const STUDENT_SEND_ROUTE = '/verify/student/send'
describe(STUDENT_SEND_ROUTE, () => {
  test(`${STUDENT_SEND_ROUTE} calls initiateVerification`, async () => {
    mockedVerificationService.initiateVerification.mockResolvedValueOnce()
    const input = {
      sendTo: '1234567890',
      verificationMethod: VERIFICATION_METHOD.SMS,
    }

    const response = await sendVerificationCode(input)
    const { status } = response

    expect(status).toEqual(200)
    expect(VerificationService.initiateVerification).toHaveBeenCalledWith({
      userId: student._id,
      firstName: student.firstname,
      ...input,
    })
  })

  test(`${STUDENT_SEND_ROUTE} too many attempts`, async () => {
    const testError = new Error('test error') as TwilioError
    testError.status = 429
    mockedVerificationService.initiateVerification.mockRejectedValueOnce(
      testError
    )
    const input = {
      sendTo: student.email,
      verificationMethod: VERIFICATION_METHOD.EMAIL,
    }

    const response = await sendVerificationCode(input)
    const {
      status,
      body: { err },
    } = response

    const expected =
      "You've made too many attempts for a verification code. Please wait 10 minutes before requesting a new one."
    expect(err).toEqual(expected)
    expect(status).toEqual(429)
    expect(logger.error).toHaveBeenNthCalledWith(
      1,
      { 'error.name': 'twilio verification', error: testError },
      testError.message
    )
  })

  test(`${STUDENT_SEND_ROUTE} twilio service not found`, async () => {
    const testError = new Error('test error') as TwilioError
    testError.status = 404
    mockedVerificationService.initiateVerification.mockRejectedValueOnce(
      testError
    )
    const input = {
      sendTo: student.email,
      verificationMethod: VERIFICATION_METHOD.EMAIL,
    }

    const response = await sendVerificationCode(input)
    const {
      status,
      body: { err },
    } = response

    const expected =
      'We were unable to send you a verification code. Please contact the UPchieve team at support@upchieve.org for help.'
    expect(err).toEqual(expected)
    expect(status).toEqual(404)
    expect(logger.error).toHaveBeenNthCalledWith(
      1,
      { 'error.name': 'twilio verification', error: testError },
      testError.message
    )
  })
})

const CONFIRM_STUDENT_ROUTE = '/verify/student/confirm'
describe(CONFIRM_STUDENT_ROUTE, () => {
  test(`${CONFIRM_STUDENT_ROUTE} calls confirm verification`, async () => {
    mockedVerificationService.confirmVerification.mockResolvedValueOnce(true)
    const input = {
      sendTo: '1234567890',
      verificationMethod: VERIFICATION_METHOD.SMS,
      verificationCode: '123456',
    }

    const response = await confirmVerificationCode(input)
    const { status } = response

    expect(status).toEqual(200)
    expect(VerificationService.confirmVerification).toHaveBeenCalledWith({
      userId: student._id,
      ...input,
    })
  })

  test(`${CONFIRM_STUDENT_ROUTE} catches internal error`, async () => {
    const testError = new Error('test error')
    mockedVerificationService.confirmVerification.mockRejectedValueOnce(
      testError
    )
    const input = {
      sendTo: student.email,
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      verificationCode: '123456',
    }

    const response = await confirmVerificationCode(input)
    const {
      status,
      body: { err },
    } = response

    expect(err).toEqual(testError.message)
    expect(status).toEqual(500)
    expect(logger.error).toHaveBeenNthCalledWith(
      1,
      { 'error.name': 'twilio verification', error: testError },
      testError.message
    )
  })
})
*/
import request, { Test } from 'supertest'
import { mocked } from 'jest-mock'
import { mockApp, mockPassportMiddleware, mockRouter } from '../mock-app'
import { buildStudent } from '../mocks/generate'
import { routeVerify } from '../../router/api/verify'
import * as VerificationService from '../../services/VerificationService'
import { VERIFICATION_METHOD } from '../../constants'
import { SmsVerificationDisabledError, TwilioError } from '../../models/Errors'
import { NextFunction, Request, Response } from 'express'

const mockedVerificationService = mocked(VerificationService)
const mockGetUser = () => buildStudent()
const router = mockRouter()
routeVerify(router)
const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))
app.use('/api', router)
const agent = request.agent(app)

jest.mock('../../services/VerificationService')
jest.mock('../../utils/auth-utils', () => ({
  authPassport: {
    checkRecaptcha: () =>
      jest.fn((req, res, next) => {
        return next()
      }),
  },
}))
describe('verify', () => {
  const sendPost = async (payload: any, path = ''): Promise<Test> => {
    return agent
      .post(`/api/verify${path}`)
      .set('Accept', 'application/json')
      .send(payload)
  }

  describe('POST /verify/send', () => {
    describe('SMS verification flag', () => {
      it('Should throw an error if an SMS verification request is made while the flag is off', async () => {
        mockedVerificationService.initiateVerification.mockRejectedValue(
          new SmsVerificationDisabledError()
        )
        const req = {
          userId: '123',
          sendTo: '+18189988876',
          firstName: 'Louise',
          verificationMethod: VERIFICATION_METHOD.SMS,
        }
        const res = await sendPost(req, '/send')

        expect(res).toMatchObject({
          status: 403,
          body: {
            err:
              'SMS verification is currently not available. Please verify by email or contact the UPchieve team at support@upchieve.org for help.',
          },
        })
      })
    })

    describe('Twilio errors', () => {
      it('Should return status 429 when too many requests are made', async () => {
        const expectedErr = new TwilioError('Too many requests', 429)
        mockedVerificationService.initiateVerification.mockRejectedValue(
          expectedErr
        )
        const req = {
          userId: '123',
          sendTo: '+18189988876',
          firstName: 'Louise',
          verificationMethod: VERIFICATION_METHOD.SMS,
        }

        const response = await sendPost(req, '/send')
        expect(response).toMatchObject({
          status: 429,
          body: {
            err:
              "You've made too many attempts for a verification code. Please wait 10 minutes before requesting a new one.",
          },
        })
      })

      it.each([400, 404, 500])(
        'Should return 500 when Twilio throws a %s',
        async twilioStatusCode => {
          const expectedErr = new TwilioError(
            'Some error message',
            twilioStatusCode
          )
          mockedVerificationService.initiateVerification.mockRejectedValue(
            expectedErr
          )
          const req = {
            userId: '123',
            sendTo: '+18189988876',
            firstName: 'Louise',
            verificationMethod: VERIFICATION_METHOD.SMS,
          }

          const response = await sendPost(req, '/send')
          expect(response).toMatchObject({
            status: 500,
            body: {
              err:
                'We were unable to send you a verification code. Please contact the UPchieve team at support@upchieve.org for help.',
            },
          })
        }
      )
    })
  })

  describe('POST /verify/confirm', () => {
    beforeEach(async () => {
      jest.resetAllMocks()
    })

    it.each([false, true, undefined])(
      'Should correctly handle optional field forSignup',
      async forSignup => {
        const req = {
          userId: '123',
          sendTo: 'hellothere@gmail.com',
          verificationMethod: VERIFICATION_METHOD.EMAIL,
          verificationCode: '123456',
          forSignup,
        }
        await sendPost(req, '/confirm')
        expect(
          mockedVerificationService.confirmVerification
        ).toHaveBeenCalledWith(req)
      }
    )

    describe('Twilio errors', () => {
      it('Should return status=400 to the user with the correct error message when receiving a 404 Twilio error', async () => {
        const req = {
          userId: '123',
          sendTo: '+18187779999',
          verificationMethod: VERIFICATION_METHOD.SMS,
          verificationCode: '123456',
          forSignup: false,
        }

        const testErr = new TwilioError(
          'VerificationCheck resource not found',
          404
        )
        mockedVerificationService.confirmVerification.mockRejectedValue(testErr)

        const res = await sendPost(req, '/confirm')
        expect(res).toMatchObject({
          status: 400,
          body: {
            err:
              'The code has expired. Please request a new verification code and try again.',
          },
        })
      })

      it('Should return status=500 to the user with the default message when receiving a non-404 Twilio error status', async () => {
        const req = {
          userId: '123',
          sendTo: '+18187779999',
          verificationMethod: VERIFICATION_METHOD.SMS,
          verificationCode: '123456',
          forSignup: false,
        }

        const testErr = new TwilioError('Some Twilio Error', 400)
        mockedVerificationService.confirmVerification.mockRejectedValue(testErr)

        const res = await sendPost(req, '/confirm')
        expect(res).toMatchObject({
          status: 500,
          body: {
            err:
              'Please double-check your verification code. If the problem persists, please contact the UPchieve team at support@upchieve.org for help.',
          },
        })
      })

      it('Should return status=500 with the default error message when some non-Twilio error is thrown', async () => {
        const req = {
          userId: '123',
          sendTo: '+18187779999',
          verificationMethod: VERIFICATION_METHOD.SMS,
          verificationCode: '123456',
          forSignup: false,
        }

        const testErr = new Error('Some non-Twilio error')
        mockedVerificationService.confirmVerification.mockRejectedValue(testErr)

        const res = await sendPost(req, '/confirm')
        expect(res).toMatchObject({
          status: 500,
          body: {
            err:
              'Please double-check your verification code. If the problem persists, please contact the UPchieve team at support@upchieve.org for help.',
          },
        })
      })
    })

    describe('SMS verification flag', () => {
      it('Should throw an error if an SMS verification request is made while the flag is off', async () => {
        mockedVerificationService.confirmVerification.mockRejectedValue(
          new SmsVerificationDisabledError()
        )
        const req = {
          userId: '123',
          sendTo: '+18187779999',
          verificationMethod: VERIFICATION_METHOD.SMS,
          verificationCode: '123456',
          forSignup: false,
        }
        const res = await sendPost(req, '/confirm')

        expect(res).toMatchObject({
          status: 403,
          body: {
            err:
              'SMS verification is currently not available. Please verify by email or contact the UPchieve team at support@upchieve.org for help.',
          },
        })
      })
    })
  })
})
