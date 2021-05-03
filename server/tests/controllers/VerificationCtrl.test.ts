import mongoose from 'mongoose'
import {
  getStudent,
  insertStudent,
  insertVolunteer,
  resetDb
} from '../db-utils'
import { getEmail, getPhoneNumber } from '../generate'
import { confirmVerification } from '../../controllers/VerificationCtrl'
import TwilioService from '../../services/twilio'
import { VERIFICATION_METHOD } from '../../constants'
import { getVolunteer } from '../../services/UserService'
jest.mock('../../services/twilio')

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
  jest.clearAllMocks()
})

describe('confirmVerification', () => {
  test('Should return false for a verification code that is not valid', async () => {
    TwilioService.confirmVerification = jest.fn(
      () => Promise.resolve({ valid: false }) as any
    )
    const result = await confirmVerification({
      userId: mongoose.Types.ObjectId(),
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      sendTo: getEmail(),
      verificationCode: '123456'
    })
    expect(result).toBeFalsy()
  })

  test('Should update verified/verifiedEmail when email is verified', async () => {
    TwilioService.confirmVerification = jest.fn(
      () => Promise.resolve({ valid: true }) as any
    )
    const student = await insertStudent()
    const result = await confirmVerification({
      userId: student._id,
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      sendTo: student.email,
      verificationCode: '123456'
    })
    const updatedStudent = await getStudent(
      { _id: student._id },
      { verified: 1, verifiedEmail: 1 }
    )
    expect(result).toBeTruthy()
    expect(updatedStudent.verified).toBeTruthy()
    expect(updatedStudent.verifiedEmail).toBeTruthy()
  })

  test('Should update verified/verifiedPhone when phone is verified', async () => {
    TwilioService.confirmVerification = jest.fn(
      () => Promise.resolve({ valid: true }) as any
    )
    const student = await insertStudent()
    const result = await confirmVerification({
      userId: student._id,
      verificationMethod: VERIFICATION_METHOD.SMS,
      sendTo: getPhoneNumber(),
      verificationCode: '123456'
    })
    const updatedStudent = await getStudent(
      { _id: student._id },
      { verified: 1, verifiedPhone: 1 }
    )
    expect(result).toBeTruthy()
    expect(updatedStudent.verified).toBeTruthy()
    expect(updatedStudent.verifiedPhone).toBeTruthy()
  })

  test('Should update to new email address when given', async () => {
    TwilioService.confirmVerification = jest.fn(
      () => Promise.resolve({ valid: true }) as any
    )
    const volunteer = await insertVolunteer()
    const newEmail = 'volunteer@example.com'
    const result = await confirmVerification({
      userId: volunteer._id,
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      sendTo: newEmail,
      verificationCode: '123456'
    })
    const updatedVolunteer = await getVolunteer(
      { _id: volunteer._id },
      { verified: 1, verifiedPhone: 1, email: 1 }
    )
    expect(result).toBeTruthy()
    expect(updatedVolunteer.verified).toBeTruthy()
    expect(updatedVolunteer.email).toBeTruthy()
    expect(updatedVolunteer.email).toEqual(newEmail)
  })
})
