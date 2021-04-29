import mongoose from 'mongoose'
import request, { Test } from 'supertest'
import app from '../../app'
import { VERIFICATION_METHOD } from '../../constants'
import * as VerificationCtrl from '../../controllers/VerificationCtrl'
import { insertStudent, resetDb } from '../db-utils'
import { authLogin, getPhoneNumber } from '../generate'
import MailService from '../../services/MailService'
import * as StudentService from '../../services/StudentService'
jest.mock('../../controllers/VerificationCtrl')
jest.mock('../../services/twilio')
jest.mock('../../services/MailService')
jest.mock('../../services/QueueService')
jest.mock('../../services/StudentService')

type SendVerificationOptions = {
  sendTo: string
  verificationMethod: VERIFICATION_METHOD
}

type ConfirmVerificationOptions = {
  verificationCode: string
  sendTo: string
  verificationMethod: VERIFICATION_METHOD
}

const agent = request.agent(app)

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

// db connection
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
})

describe('/verify/student/send', () => {
  beforeEach(async () => {
    await jest.clearAllMocks()
  })

  test('Should see error that asks for a valid phone number', async () => {
    const student = await insertStudent({ verified: false })
    const input = {
      sendTo: '1234567891',
      verificationMethod: VERIFICATION_METHOD.SMS
    }

    await authLogin(agent, student)
    const response = await sendVerificationCode(input).expect(422)
    const {
      body: { err }
    } = response

    const expected = 'Must enter a valid phone number'
    expect(err).toEqual(expected)
  })

  test('Should see error that asks for a valid email address', async () => {
    const student = await insertStudent({ verified: false })
    const input = {
      sendTo: 'student1@',
      verificationMethod: VERIFICATION_METHOD.EMAIL
    }

    await authLogin(agent, student)
    const response = await sendVerificationCode(input).expect(422)
    const {
      body: { err }
    } = response

    const expected = 'Must enter a valid email address'
    expect(err).toEqual(expected)
  })

  test('Should see error when too many attempts for a verification code are made', async () => {
    const initiateVerification = jest.spyOn(
      VerificationCtrl,
      'initiateVerification'
    )
    initiateVerification.mockImplementation(() => {
      // eslint-disable-next-line no-throw-literal
      throw {
        status: 429,
        message: 'Too many attempts',
        name: 'VerificationError'
      }
    })
    const student = await insertStudent()
    const input = {
      sendTo: student.email,
      verificationMethod: VERIFICATION_METHOD.EMAIL
    }

    await authLogin(agent, student)
    const response = await sendVerificationCode(input).expect(429)
    const {
      body: { err }
    } = response

    const expected =
      // eslint-disable-next-line quotes
      "You've made too many attempts for a verification code. Please wait 10 minutes before requesting a new one."
    expect(err).toEqual(expected)
  })

  test('Should see error when Twilio Verify Service is not found', async () => {
    const initiateVerification = jest.spyOn(
      VerificationCtrl,
      'initiateVerification'
    )
    initiateVerification.mockImplementation(() => {
      // eslint-disable-next-line no-throw-literal
      throw {
        status: 404,
        message: 'Service was not found',
        name: 'VerificationError'
      }
    })
    const student = await insertStudent()
    const input = {
      sendTo: student.email,
      verificationMethod: VERIFICATION_METHOD.EMAIL
    }

    await authLogin(agent, student)
    const response = await sendVerificationCode(input).expect(404)
    const {
      body: { err }
    } = response

    const expected =
      'We were unable to send you a verification code. Please contact the UPchieve team at support@upchieve.org for help.'
    expect(err).toEqual(expected)
  })

  test('Should email the verification code', async () => {
    const initiateVerification = jest.spyOn(
      VerificationCtrl,
      'initiateVerification'
    )
    initiateVerification.mockImplementation(
      () =>
        Promise.resolve({
          sid: 'VAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"',
          status: 'pending'
        }) as any
    )
    const student = await insertStudent()
    const input = {
      sendTo: student.email,
      verificationMethod: VERIFICATION_METHOD.EMAIL
    }

    await authLogin(agent, student)
    await sendVerificationCode(input).expect(200)
  })

  test('Should text the verification code', async () => {
    const initiateVerification = jest.spyOn(
      VerificationCtrl,
      'initiateVerification'
    )
    initiateVerification.mockImplementation(
      () =>
        Promise.resolve({
          sid: 'VAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"',
          status: 'pending'
        }) as any
    )
    const student = await insertStudent()
    const input = {
      sendTo: getPhoneNumber(),
      verificationMethod: VERIFICATION_METHOD.SMS
    }

    await authLogin(agent, student)
    await sendVerificationCode(input).expect(200)
  })

  test('Should text the verification code when the user changes their email', async () => {
    const initiateVerification = jest.spyOn(
      VerificationCtrl,
      'initiateVerification'
    )
    initiateVerification.mockImplementation(
      () =>
        Promise.resolve({
          sid: 'VAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"',
          status: 'pending'
        }) as any
    )
    const student = await insertStudent()
    const input = {
      sendTo: 'newemail@example.com',
      verificationMethod: VERIFICATION_METHOD.EMAIL
    }

    await authLogin(agent, student)
    await sendVerificationCode(input).expect(200)
  })
})

describe('/verify/student/confirm', () => {
  beforeEach(async () => {
    await jest.clearAllMocks()
  })

  test('Should see error when given a verification code that is not a length of 6', async () => {
    const student = await insertStudent({ verified: false })
    const input = {
      verificationCode: '1234567891',
      sendTo: student.email,
      verificationMethod: VERIFICATION_METHOD.EMAIL
    }

    await authLogin(agent, student)
    const response = await confirmVerificationCode(input).expect(422)
    const {
      body: { err }
    } = response

    const expected = 'Must enter a valid 6-digit validation code'
    expect(err).toEqual(expected)
  })

  test('Should see error when a verification code that does not coerce to a number', async () => {
    const student = await insertStudent({ verified: false })
    const input = {
      verificationCode: '1a2b3c',
      sendTo: student.email,
      verificationMethod: VERIFICATION_METHOD.EMAIL
    }

    await authLogin(agent, student)
    const response = await confirmVerificationCode(input).expect(422)
    const {
      body: { err }
    } = response

    const expected = 'Must enter a valid 6-digit validation code'
    expect(err).toEqual(expected)
  })

  test('Should send verified value from confirmVerification', async () => {
    const confirmVerification = jest.spyOn(
      VerificationCtrl,
      'confirmVerification'
    )
    confirmVerification.mockImplementation(() => Promise.resolve(false))
    const student = await insertStudent({ verified: false })
    const input = {
      verificationCode: '123456',
      sendTo: student.email,
      verificationMethod: VERIFICATION_METHOD.EMAIL
    }

    await authLogin(agent, student)
    const response = await confirmVerificationCode(input).expect(200)
    const {
      body: { success }
    } = response

    expect(success).toBeFalsy()
    expect(MailService.sendStudentWelcomeEmail).toHaveBeenCalledTimes(1)
    expect(StudentService.queueWelcomeEmails).toHaveBeenCalledTimes(1)
  })

  test('Should catch internal error', async () => {
    const confirmVerification = jest.spyOn(
      VerificationCtrl,
      'confirmVerification'
    )
    confirmVerification.mockImplementation(() => {
      throw new Error('Internal server error')
    })
    const student = await insertStudent({ verified: false })
    const input = {
      verificationCode: '123456',
      sendTo: student.email,
      verificationMethod: VERIFICATION_METHOD.EMAIL
    }

    await authLogin(agent, student)
    await confirmVerificationCode(input).expect(500)
  })
})
