import { mocked } from 'ts-jest/utils'
import { Types } from 'mongoose'

import { getEmail, buildStudent, buildVolunteer } from '../generate'
import {
  confirmVerification,
  initiateVerification,
} from '../../services/VerificationService'
import * as TwilioService from '../../services/TwilioService'
import { VERIFICATION_METHOD } from '../../constants'
import * as UserService from '../../services/UserService'
import * as MailService from '../../services/MailService'
import * as StudentService from '../../services/StudentService'
import { InputError, LookupError } from '../../models/Errors'
import * as UserRepo from '../../models/User/queries'

jest.mock('../../services/TwilioService')
jest.mock('../../services/UserService')
jest.mock('../../services/MailService')
jest.mock('../../services/StudentService')
jest.mock('../../models/User/queries')

const mockedTwilioService = mocked(TwilioService, true)

const mockedUserService = mocked(UserService, true)
const mockedUserRepo = mocked(UserRepo, true)

beforeEach(async () => {
  jest.resetAllMocks()
})

describe('initiate verification', () => {
  const student = buildStudent()

  test('Should call sendVerification', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValueOnce(student._id)
    const payload = {
      userId: student._id,
      sendTo: student.email,
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      firstName: student.firstname,
    }
    await initiateVerification(payload)

    expect(TwilioService.sendVerification).toHaveBeenCalledWith(
      student.email,
      VERIFICATION_METHOD.EMAIL,
      student.firstname
    )
  })

  test('Should throw on invalid email', async () => {
    const payload = {
      userId: student._id.toString(),
      sendTo: 'bad email',
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      firstName: student.firstname,
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
      firstName: student.firstname,
    }

    await expect(initiateVerification(payload)).rejects.toEqual(
      new InputError('Must supply a valid phone number')
    )
  })

  test('Should throw on exising user not equal to requesting user', async () => {
    mockedUserRepo.getUserById.mockResolvedValueOnce(student)

    const payload = {
      userId: Types.ObjectId().toString(),
      sendTo: student.email,
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      firstName: student.firstname,
    }

    await expect(initiateVerification(payload)).rejects.toEqual(
      new LookupError(
        'The email address you entered does not match your account email address'
      )
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
      verificationCode: 'bad code',
    }

    await expect(confirmVerification(payload)).rejects.toEqual(
      new InputError('Must enter a valid 6-digit validation code')
    )
  })

  test('Should return false for a verification code that is not valid', async () => {
    mockedTwilioService.confirmVerification.mockResolvedValueOnce(false)

    const result = await confirmVerification({
      userId: student._id.toString(),
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      sendTo: student.email,
      verificationCode: '123456',
    })
    expect(result).toBeFalsy()
  })

  test('Should send all student emails when verified', async () => {
    mockedTwilioService.confirmVerification.mockResolvedValueOnce(true)
    mockedUserRepo.getUserById.mockResolvedValueOnce(student)

    const payload = {
      userId: student._id.toString(),
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      sendTo: student.email,
      verificationCode: '123456',
    }

    await confirmVerification(payload)

    expect(MailService.sendStudentWelcomeEmail).toHaveBeenCalledWith(
      student.email,
      student.firstname
    )
    expect(StudentService.queueWelcomeEmails).toHaveBeenCalledWith(student._id)
  })

  test('Should send all volunteer emails when verified', async () => {
    const volunteer = buildVolunteer({
      volunteerPartnerOrg: 'test',
    })
    mockedTwilioService.confirmVerification.mockResolvedValueOnce(true)
    mockedUserRepo.getUserById.mockResolvedValueOnce(volunteer)

    const payload = {
      userId: volunteer._id.toString(),
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      sendTo: volunteer.email,
      verificationCode: '123456',
    }

    await confirmVerification(payload)

    expect(MailService.sendPartnerVolunteerWelcomeEmail).toHaveBeenCalledWith(
      volunteer.email,
      volunteer.firstname
    )
  })

  test('Should update verified/verifiedEmail when email is verified', async () => {
    mockedTwilioService.confirmVerification.mockResolvedValueOnce(true)
    mockedUserRepo.getUserById.mockResolvedValueOnce(student)

    const result = await confirmVerification({
      userId: student._id,
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      sendTo: student.email,
      verificationCode: '123456',
    })

    expect(result).toBeTruthy()
    expect(UserRepo.updateUserVerifiedInfoById).toHaveBeenCalledWith(
      student._id,
      student.email,
      expect.anything()
    )
  })

  test('Should update verified/verifiedPhone when phone is verified', async () => {
    mockedTwilioService.confirmVerification.mockResolvedValueOnce(true)
    mockedUserRepo.getUserById.mockResolvedValueOnce(student)

    const result = await confirmVerification({
      userId: student._id,
      verificationMethod: VERIFICATION_METHOD.SMS,
      sendTo: student.phone,
      verificationCode: '123456',
    })

    expect(result).toBeTruthy()
    expect(UserRepo.updateUserVerifiedInfoById).toHaveBeenCalledWith(
      student._id,
      student.phone,
      expect.anything()
    )
  })

  test('Should update to new email address when given', async () => {
    mockedTwilioService.confirmVerification.mockResolvedValueOnce(true)
    mockedUserRepo.getUserById.mockResolvedValueOnce(student)
    const newEmail = getEmail()

    const result = await confirmVerification({
      userId: student._id,
      verificationMethod: VERIFICATION_METHOD.EMAIL,
      sendTo: newEmail,
      verificationCode: '123456',
    })

    expect(result).toBeTruthy()
    expect(UserRepo.updateUserVerifiedInfoById).toHaveBeenCalledWith(
      student._id,
      newEmail,
      expect.anything()
    )
  })
})
