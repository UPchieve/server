import mongoose from 'mongoose'
import { getStudent, insertStudent, resetDb } from '../db-utils'
import { getEmail, getPhoneNumber } from '../generate'
import { confirmStudentVerification } from '../../controllers/VerificationCtrl'
import TwilioService from '../../services/twilio'
import { VERIFICATION_METHOD } from '../../constants'
jest.mock('../../services/twilio')

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
  jest.clearAllMocks()
})

describe('confirmStudentVerification', () => {
  test('Should return false for a verification code that is not valid', async () => {
    TwilioService.confirmStudentVerification = jest.fn(
      () => Promise.resolve({ valid: false }) as any
    )
    const result = await confirmStudentVerification({
      userId: mongoose.Types.ObjectId(),
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      sendTo: getEmail(),
      verificationCode: '123456'
    })
    expect(result).toBeFalsy()
  })

  test('Should update verified/verifiedEmail when email is verified', async () => {
    TwilioService.confirmStudentVerification = jest.fn(
      () => Promise.resolve({ valid: true }) as any
    )
    const student = await insertStudent()
    const result = await confirmStudentVerification({
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
    TwilioService.confirmStudentVerification = jest.fn(
      () => Promise.resolve({ valid: true }) as any
    )
    const student = await insertStudent()
    const result = await confirmStudentVerification({
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
})
