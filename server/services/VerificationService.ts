import { Ulid } from '../models/pgUtils'
import { VERIFICATION_METHOD } from '../constants'
import {
  asBoolean,
  asEnum,
  asFactory,
  asOptional,
  asString,
} from '../utils/type-utils'
import isValidEmail from '../utils/is-valid-email'
import {
  AlreadyInUseError,
  InputError,
  LookupError,
  SmsVerificationDisabledError,
  TwilioError,
} from '../models/Errors'
import * as StudentService from './StudentService'
import * as MailService from './MailService'
import * as TwilioService from './TwilioService'
import {
  getUserContactInfoById,
  getUserIdByEmail,
  getUserIdByPhone,
  updateUserVerifiedInfoById,
} from '../models/User/queries'
import isValidInternationalPhoneNumber from '../utils/is-valid-international-phone-number'
import { getSmsVerificationFeatureFlag } from './FeatureFlagService'

export interface InitiateVerificationData {
  userId: Ulid
  sendTo: string
  verificationMethod: VERIFICATION_METHOD
  firstName: string
}

const asInitiateVerificationData = asFactory<InitiateVerificationData>({
  userId: asString,
  sendTo: asString,
  verificationMethod: asEnum(VERIFICATION_METHOD),
  firstName: asString,
})

export interface ConfirmVerificationData {
  userId: Ulid
  sendTo: string
  verificationMethod: VERIFICATION_METHOD
  verificationCode: string
  forSignup?: boolean
}

const asConfirmVerificationData = asFactory<ConfirmVerificationData>({
  userId: asString,
  sendTo: asString,
  verificationMethod: asEnum(VERIFICATION_METHOD),
  verificationCode: asString,
  forSignup: asOptional(asBoolean),
})

export async function initiateVerification(data: unknown): Promise<void> {
  const {
    userId,
    sendTo,
    verificationMethod,
    firstName,
  } = asInitiateVerificationData(data)

  if (
    verificationMethod === VERIFICATION_METHOD.SMS &&
    !(await getSmsVerificationFeatureFlag(userId))
  ) {
    throw new SmsVerificationDisabledError()
  }

  const isPhoneVerification = verificationMethod === VERIFICATION_METHOD.SMS
  let existingUserErrorMessage: string
  let existingUserId: Ulid | undefined

  if (isPhoneVerification) {
    if (!isValidInternationalPhoneNumber(sendTo))
      throw new InputError('Must supply a valid phone number')

    existingUserErrorMessage = 'The phone number you entered is already in use'
    existingUserId = await getUserIdByPhone(sendTo)
  } else {
    // email verification
    if (!isValidEmail(sendTo))
      throw new InputError('Must supply a valid email address')

    existingUserErrorMessage = 'The email address you entered is already in use'
    existingUserId = await getUserIdByEmail(sendTo)

    if (!existingUserId) {
      throw new LookupError(
        'The email address you entered does not match your account email address'
      )
    }
  }

  // Make sure the user from DB matches the one in the request
  if (existingUserId && !(userId === existingUserId))
    throw new AlreadyInUseError(existingUserErrorMessage)

  try {
    await TwilioService.sendVerification(
      sendTo,
      verificationMethod,
      firstName,
      userId
    )
  } catch (err) {
    const error = err as {
      message: string
      status: number
    }
    throw new TwilioError(
      error.message ?? 'Could not send verification',
      error.status
    )
  }
}

async function sendEmails(userId: Ulid): Promise<void> {
  // replaced by getUserContactInfo
  const user = await getUserContactInfoById(userId)
  if (user) {
    if (user.isVolunteer) {
      if (user.volunteerPartnerOrg) {
        await MailService.sendPartnerVolunteerWelcomeEmail(
          user.email,
          user.firstName
        )
      } else {
        await MailService.sendOpenVolunteerWelcomeEmail(
          user.email,
          user.firstName
        )
      }
    } else {
      await MailService.sendStudentOnboardingWelcomeEmail(
        user.email,
        user.firstName
      )
      await StudentService.queueOnboardingEmails(user.id)
    }
  }
}

export async function confirmVerification(data: unknown): Promise<boolean> {
  const {
    userId,
    sendTo,
    verificationMethod,
    verificationCode,
    forSignup,
  } = asConfirmVerificationData(data)

  if (
    verificationMethod === VERIFICATION_METHOD.SMS &&
    !(await getSmsVerificationFeatureFlag(userId))
  ) {
    throw new SmsVerificationDisabledError()
  }

  // Validate code
  const VERIFICATION_CODE_LENGTH = 6
  if (
    verificationCode.length !== VERIFICATION_CODE_LENGTH ||
    isNaN(Number(verificationCode))
  )
    throw new InputError('Must enter a valid 6-digit validation code')

  const shouldSendOnboardingEmails = forSignup ?? true
  const isPhoneVerification = verificationMethod === VERIFICATION_METHOD.SMS

  let isVerified: boolean = false
  try {
    isVerified = await TwilioService.confirmVerification(
      sendTo,
      verificationCode
    )
  } catch (err) {
    const error = err as {
      message: string
      status: number
    }
    throw new TwilioError(
      error.message ?? 'Could not confirm verification code',
      error.status ?? 500
    )
  }

  if (isVerified) {
    await updateUserVerifiedInfoById(userId, sendTo, isPhoneVerification)
    if (shouldSendOnboardingEmails) {
      await sendEmails(userId)
    }
  }

  return isVerified
}
