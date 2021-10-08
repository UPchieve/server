import { mocked } from 'ts-jest/utils'
import { Types } from 'mongoose'

import { getEmail, buildStudent, buildVolunteer } from '../generate'
import {
  confirmVerification,
  initiateVerification
} from '../../services/VerificationService'
import TwilioService from '../../services/twilio'
import { VERIFICATION_METHOD } from '../../constants'
import UserService from '../../services/UserService'
import MailService from '../../services/MailService'
import * as StudentService from '../../services/StudentService'
import { InputError, LookupError } from '../../models/Errors'

jest.mock('../../services/twilio')
jest.mock('../../services/UserService')
jest.mock('../../services/MailService')
jest.mock('../../services/StudentService')

const mockedTwilioService = mocked(TwilioService, true)
function mockTwilioConfirmation(value: boolean) {
  // @ts-expect-error twilio verification object has lots of metadata we dont care to mock
  mockedTwilioService.confirmVerification.mockResolvedValueOnce({
    valid: value
  })
}

const mockedUserService = mocked(UserService, true)

beforeEach(async () => {
  jest.clearAllMocks()
})

describe('initiate verification', () => {
  const student = buildStudent()

  test('Should call sendVerification', async () => {
    mockedUserService.getUser.mockResolvedValueOnce(student)
    const payload = {
      userId: student._id.toString(),
      sendTo: student.email,
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      firstName: student.firstname
    }
    await initiateVerification(payload)

    const { userId, ...expected } = payload
    expect(TwilioService.sendVerification).toHaveBeenCalledWith(expected)
  })

  test('Should throw on invalid email', async () => {
    const payload = {
      userId: student._id.toString(),
      sendTo: 'bad email',
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      firstName: student.firstname
    }

    await expect(initiateVerification(payload)).rejects.toEqual(
      new InputError('Must supply a valid email address')
    )
  })

  test('Should throw on invalid phone', async () => {
    const payload = {
      userId: student._id.toString(),
      sendTo: 'bad phone',
      verificationMethod: VERIFICATION_METHOD.SMS,
      firstName: student.firstname
    }

    await expect(initiateVerification(payload)).rejects.toEqual(
      new InputError('Must supply a valid phone number')
    )
  })

  test('Should throw on exising user not equal to requesting user', async () => {
    mockedUserService.getUser.mockResolvedValueOnce(student)

    const payload = {
      userId: Types.ObjectId().toString(),
      sendTo: student.email,
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      firstName: student.firstname
    }

    await expect(initiateVerification(payload)).rejects.toEqual(
      new LookupError('The email address you entered is already in use')
    )
  })
})

describe('confirmVerification', () => {
  const student = buildStudent()

  test('Should throw for invalid format verification code', async () => {
    const payload = {
      userId: student._id.toString(),
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      sendTo: student.email,
      verificationCode: 'bad code'
    }

    await expect(confirmVerification(payload)).rejects.toEqual(
      new InputError('Must enter a valid 6-digit validation code')
    )
  })

  test('Should return false for a verification code that is not valid', async () => {
    mockTwilioConfirmation(false)

    const result = await confirmVerification({
      userId: student._id.toString(),
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      sendTo: student.email,
      verificationCode: '123456'
    })
    expect(result).toBeFalsy()
  })

  test('Should send all student emails when verified', async () => {
    mockTwilioConfirmation(true)
    mockedUserService.getUser.mockResolvedValueOnce(student)

    const payload = {
      userId: student._id.toString(),
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      sendTo: student.email,
      verificationCode: '123456'
    }

    await confirmVerification(payload)

    expect(MailService.sendStudentWelcomeEmail).toHaveBeenCalledWith({
      email: student.email,
      firstName: student.firstname
    })
    expect(StudentService.queueWelcomeEmails).toHaveBeenCalledWith(student._id)
  })

  test('Should send all volunteer emails when verified', async () => {
    const volunteer = buildVolunteer({
      volunteerPartnerOrg: 'test'
    })
    mockTwilioConfirmation(true)
    mockedUserService.getUser.mockResolvedValueOnce(volunteer)

    const payload = {
      userId: volunteer._id.toString(),
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      sendTo: volunteer.email,
      verificationCode: '123456'
    }

    await confirmVerification(payload)

    expect(MailService.sendPartnerVolunteerWelcomeEmail).toHaveBeenCalledWith({
      email: volunteer.email,
      volunteerName: volunteer.firstname
    })
  })

  test('Should update verified/verifiedEmail when email is verified', async () => {
    mockTwilioConfirmation(true)
    mockedUserService.getUser.mockResolvedValueOnce(student)

    const result = await confirmVerification({
      userId: student._id.toString(),
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      sendTo: student.email,
      verificationCode: '123456'
    })
    const expected = {
      verified: true,
      verifiedEmail: true,
      email: student.email
    }

    expect(result).toBeTruthy()
    expect(UserService.updateUser).toHaveBeenCalledWith(
      { _id: student._id.toString() },
      expected
    )
  })

  test('Should update verified/verifiedPhone when phone is verified', async () => {
    mockTwilioConfirmation(true)
    mockedUserService.getUser.mockResolvedValueOnce(student)

    const result = await confirmVerification({
      userId: student._id.toString(),
      verificationMethod: VERIFICATION_METHOD.SMS,
      sendTo: student.phone,
      verificationCode: '123456'
    })
    const expected = {
      verified: true,
      verifiedPhone: true,
      phone: student.phone
    }
    expect(result).toBeTruthy()
    expect(UserService.updateUser).toHaveBeenCalledWith(
      { _id: student._id.toString() },
      expected
    )
  })

  test('Should update to new email address when given', async () => {
    mockTwilioConfirmation(true)
    mockedUserService.getUser.mockResolvedValueOnce(student)
    const newEmail = getEmail()

    const result = await confirmVerification({
      userId: student._id.toString(),
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      sendTo: newEmail,
      verificationCode: '123456'
    })
    const expected = {
      verified: true,
      verifiedEmail: true,
      email: newEmail
    }

    expect(result).toBeTruthy()
    expect(UserService.updateUser).toHaveBeenCalledWith(
      { _id: student._id.toString() },
      expected
    )
  })
})
