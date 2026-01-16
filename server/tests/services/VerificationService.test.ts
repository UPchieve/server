import * as UserRepo from '../../models/User/queries'
import { mocked } from 'jest-mock'
import * as VerificationService from '../../services/VerificationService'
import { VERIFICATION_METHOD } from '../../constants'
import * as TwilioService from '../../services/TwilioService'
import * as MailService from '../../services/MailService'
import * as UserService from '../../services/UserService'
import logger from '../../logger'
import {
  AlreadyInUseError,
  InputError,
  LookupError,
  TwilioError,
} from '../../models/Errors'
import { buildUserContactInfo } from '../mocks/generate'
import { RoleContext } from '../../services/UserRolesService'

jest.mock('../../models/User/queries')
jest.mock('../../services/TwilioService')
jest.mock('../../services/MailService')
jest.mock('../../services/StudentService')
jest.mock('../../services/FeatureFlagService')
jest.mock('../../services/UserService')
jest.mock('../../logger')

const mockedTwilioService = mocked(TwilioService)
const mockedUserRepo = mocked(UserRepo)
const mockedUserService = mocked(UserService)
const mockedMailService = mocked(MailService)
const mockLogger = mocked(logger)

describe('VerificationService', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
    const userId = '123'
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(userId)
    mockedUserRepo.getUserIdByPhone.mockResolvedValue(userId)
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
      async (data) => {
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
      async (phoneNumber) => {
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
        expect(mockLogger.warn).toHaveBeenCalledWith(
          expect.objectContaining({
            sendTo: req.sendTo,
            userId: req.userId,
            verificationMethod: req.verificationMethod,
          }),
          'Invalid phone number provided for verification.'
        )
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
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: req.userId,
          verificationMethod: req.verificationMethod,
          sendTo: req.sendTo,
        }),
        'Cannot complete verification - phone or email is already in use'
      )
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
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: req.userId,
          verificationMethod: req.verificationMethod,
          sendTo: req.sendTo,
        }),
        'Email addresses in verify did not match.'
      )
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
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: req.userId,
          verificationMethod: req.verificationMethod,
          sendTo: req.sendTo,
          message: expectedErr.message,
          status: expectedErr.status,
        }),
        'Failed to send Twilio verification code.'
      )
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
        mockedUserService.getUserContactInfo.mockResolvedValue({
          ...buildUserContactInfo(),
          roleContext: new RoleContext(['student'], 'student', 'student'),
        })
        mockedUserRepo.getUserRolesById.mockResolvedValue(['student'])
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
