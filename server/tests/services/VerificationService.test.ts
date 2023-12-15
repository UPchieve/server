/*import { mocked } from 'jest-mock';
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

const mockedTwilioService = mocked(TwilioService)

const mockedUserService = mocked(UserService)
const mockedUserRepo = mocked(UserRepo)

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
      userId: new Types.ObjectId().toString(),
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

    expect(MailService.sendStudentOnboardingWelcomeEmail).toHaveBeenCalledWith(
      student.email,
      student.firstname
    )
    expect(StudentService.queueOnboardingEmails).toHaveBeenCalledWith(
      student._id
    )
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
*/

import * as UserRepo from '../../models/User/queries'
import { mocked } from 'jest-mock'
import * as VerificationService from '../../services/VerificationService'
import { VERIFICATION_METHOD } from '../../constants'
import * as TwilioService from '../../services/TwilioService'
import * as MailService from '../../services/MailService'
import * as FeatureFlagService from '../../services/FeatureFlagService'
import {
  AlreadyInUseError,
  InputError,
  LookupError,
  SmsVerificationDisabledError,
  TwilioError,
} from '../../models/Errors'
import { buildUserContactInfo } from '../mocks/generate'

jest.mock('../../models/User/queries')
jest.mock('../../services/TwilioService')
jest.mock('../../services/MailService')
jest.mock('../../services/StudentService')
jest.mock('../../services/FeatureFlagService')

const mockedTwilioService = mocked(TwilioService)
const mockedUserRepo = mocked(UserRepo)
const mockedMailService = mocked(MailService)
const mockFeatureFlagService = mocked(FeatureFlagService)

describe('VerificationService', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
    const userId = '123'
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(userId)
    mockedUserRepo.getUserIdByPhone.mockResolvedValue(userId)
    mockFeatureFlagService.getSmsVerificationFeatureFlag.mockResolvedValue(true)
  })

  describe('sendVerification', () => {
    it.each([
      {
        sendTo: '+18608885555',
        verificationMethod: VERIFICATION_METHOD.SMS,
      },
      {
        sendTo: 'louisebelcher@bobsburgers.com',
        verificationMethod: VERIFICATION_METHOD.EMAIL,
      },
    ])(
      'Should call Twilio to initiate verification when given valid data',
      async data => {
        const req = {
          userId: '123',
          firstName: 'Louise',
          ...data,
        }

        await VerificationService.initiateVerification(req)
        expect(mockedTwilioService.sendVerification).toHaveBeenCalledWith(
          data.sendTo,
          data.verificationMethod,
          req.firstName,
          req.userId
        )
      }
    )

    it.each([
      '8608885555', // no country code
      '1860888555', // no +
      '123', // not enough digits
      'abc', // not numbers
      '123123123123123', // too long
    ])(
      'Should throw an InputError when given an invalid phone number',
      async phoneNumber => {
        const expectedErrorMsg = 'Must supply a valid phone number'
        const req = {
          userId: '123',
          firstName: 'Louise',
          verificationMethod: VERIFICATION_METHOD.SMS,
          sendTo: phoneNumber,
        }

        await expect(async () =>
          VerificationService.initiateVerification(req)
        ).rejects.toThrow(new InputError(expectedErrorMsg))
      }
    )

    it('Should throw an AlreadyInUseError if the user ID from in DB does not match the one in the request', async () => {
      const req = {
        userId: '456',
        firstName: 'Louise',
        verificationMethod: VERIFICATION_METHOD.EMAIL,
        sendTo: 'louisebelcher@bobsburgers.com',
      }
      await expect(async () =>
        VerificationService.initiateVerification(req)
      ).rejects.toThrow(AlreadyInUseError)
    })

    it('Should throw a LookupError if the sendTo email does not match the email in DB', async () => {
      mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
      const req = {
        userId: '123',
        firstName: 'Louise',
        verificationMethod: VERIFICATION_METHOD.EMAIL,
        sendTo: 'tinabelcher@bobsburgers.com',
      }
      await expect(async () =>
        VerificationService.initiateVerification(req)
      ).rejects.toThrow(LookupError)
    })

    it('Should throw a TwilioError if one is thrown by the TwilioService', async () => {
      const expectedErr = new TwilioError('Too many requests', 429)
      mockedTwilioService.sendVerification.mockRejectedValue(expectedErr)
      const req = {
        userId: '123',
        firstName: 'Louise',
        verificationMethod: VERIFICATION_METHOD.SMS,
        sendTo: '+18187764450',
      }
      await expect(() =>
        VerificationService.initiateVerification(req)
      ).rejects.toThrow(expectedErr)
    })

    describe('SMS Verification flag', () => {
      let req: any
      beforeEach(() => {
        req = {
          userId: '123',
          firstName: 'Gene',
          verificationMethod: VERIFICATION_METHOD.SMS,
          sendTo: '+18187764450',
        }
        mockFeatureFlagService.getSmsVerificationFeatureFlag.mockResolvedValue(
          false
        )
      })

      it('Should throw an error when the verification method is SMS but SMS verification is disabled', async () => {
        await expect(() =>
          VerificationService.initiateVerification(req)
        ).rejects.toThrow(SmsVerificationDisabledError)
      })

      it('Should succeed an email verification request when the SMS verification flag is off', async () => {
        req.verificationMethod = VERIFICATION_METHOD.EMAIL
        req.sendTo = 'bobsburgers@burger.com'
        await expect(
          VerificationService.initiateVerification(req)
        ).resolves.not.toThrowError()
      })
    })
  })

  describe('confirmVerification', () => {
    beforeEach(async () => {
      mockedTwilioService.confirmVerification.mockResolvedValue(true)
    })

    it("Should update the user's phone number if it has changed, and user is doing SMS verification", async () => {
      const req = {
        userId: '123',
        sendTo: '+18603334444',
        verificationMethod: VERIFICATION_METHOD.SMS,
        verificationCode: '123456',
      }
      const oldNumber = '+14137779999'
      mockedUserRepo.updateUserVerifiedInfoById.mockResolvedValue({
        contact: oldNumber,
      })

      await VerificationService.confirmVerification(req)
      expect(mockedUserRepo.updateUserVerifiedInfoById).toHaveBeenCalledWith(
        req.userId,
        req.sendTo,
        true
      )
    })

    describe('Sending emails at the end of verification', () => {
      beforeEach(async () => {
        mockedUserRepo.getUserContactInfoById.mockResolvedValue(
          buildUserContactInfo({
            isVolunteer: false,
          })
        )
      })

      it('Should send emails if forSignup = true', async () => {
        const req = {
          userId: '123',
          sendTo: 'tinabelcher@bobsburgers.com',
          verificationMethod: VERIFICATION_METHOD.EMAIL,
          verificationCode: '123456',
          forSignup: true,
        }
        await VerificationService.confirmVerification(req)
        expect(
          mockedMailService.sendStudentOnboardingWelcomeEmail
        ).toHaveBeenCalled()
      })

      it('Should send emails by default is forSignup is not present in the request', async () => {
        const req = {
          userId: '123',
          sendTo: 'tinabelcher@bobsburgers.com',
          verificationMethod: VERIFICATION_METHOD.EMAIL,
          verificationCode: '123456',
        }
        await VerificationService.confirmVerification(req)
        expect(
          mockedMailService.sendStudentOnboardingWelcomeEmail
        ).toHaveBeenCalled()
      })

      it('Should NOT send emails when forSignup = false', async () => {
        const req = {
          userId: '123',
          sendTo: 'tinabelcher@bobsburgers.com',
          verificationMethod: VERIFICATION_METHOD.EMAIL,
          verificationCode: '123456',
          forSignup: false,
        }
        await VerificationService.confirmVerification(req)
        expect(
          mockedMailService.sendStudentOnboardingWelcomeEmail
        ).not.toHaveBeenCalled()
      })
    })

    describe('SMS Verification flag', () => {
      let req: any
      beforeEach(() => {
        req = {
          userId: '123',
          sendTo: '+18603334444',
          verificationMethod: VERIFICATION_METHOD.SMS,
          verificationCode: '123456',
        }
        mockFeatureFlagService.getSmsVerificationFeatureFlag.mockResolvedValue(
          false
        )
      })

      it('Should throw an error when the verification method is SMS but SMS verification is disabled', async () => {
        await expect(() =>
          VerificationService.confirmVerification(req)
        ).rejects.toThrow(SmsVerificationDisabledError)
      })

      it('Should succeed an email verification request when the SMS verification flag is off', async () => {
        req.verificationMethod = VERIFICATION_METHOD.EMAIL
        req.sendTo = 'genesmusicshoppe@gene.org'
        await expect(
          VerificationService.confirmVerification(req)
        ).resolves.not.toThrow()
      })
    })
  })
})
