import { Types } from 'mongoose'
import { VERIFICATION_METHOD } from '../constants'
import { asFactory, asString, asEnum, asObjectId } from '../utils/type-utils'
import isValidEmail from '../utils/is-valid-email'
import isValidInternationalPhoneNumber from '../utils/is-valid-international-phone-number'
import { InputError, LookupError } from '../models/Errors'
import * as StudentService from './StudentService'
import * as MailService from './MailService'
import * as TwilioService from './TwilioService'
import {
  updateUserVerifiedInfoById,
  getUserById,
  getUserIdByPhone,
  getUserIdByEmail,
} from '../models/User/queries'
import { Volunteer } from '../models/Volunteer'

export interface InitiateVerificationData {
  userId: Types.ObjectId
  sendTo: string
  verificationMethod: VERIFICATION_METHOD
  firstName: string
}

const asInitiateVerificationData = asFactory<InitiateVerificationData>({
  userId: asObjectId,
  sendTo: asString,
  verificationMethod: asEnum(VERIFICATION_METHOD),
  firstName: asString,
})

export interface ConfirmVerificationData {
  userId: Types.ObjectId
  sendTo: string
  verificationMethod: VERIFICATION_METHOD
  verificationCode: string
}

const asConfirmVerificationData = asFactory<ConfirmVerificationData>({
  userId: asObjectId,
  sendTo: asString,
  verificationMethod: asEnum(VERIFICATION_METHOD),
  verificationCode: asString,
})

export async function initiateVerification(data: unknown): Promise<void> {
  const {
    userId,
    sendTo,
    verificationMethod,
    firstName,
  } = asInitiateVerificationData(data)

  const isPhoneVerification = verificationMethod === VERIFICATION_METHOD.SMS
  let existingUserErrorMessage: string
  let existingUserId: Types.ObjectId | undefined
  if (isPhoneVerification) {
    existingUserErrorMessage = 'The phone number you entered is already in use'
    if (!isValidInternationalPhoneNumber(sendTo))
      throw new InputError('Must supply a valid phone number')
    existingUserId = await getUserIdByPhone(sendTo)
  } else {
    existingUserErrorMessage = 'The email address you entered is already in use'
    if (!isValidEmail(sendTo))
      throw new InputError('Must supply a valid email address')
    existingUserId = await getUserIdByEmail(sendTo)
  }
  if (existingUserId && !userId.equals(existingUserId))
    throw new LookupError(existingUserErrorMessage)
  if (verificationMethod === VERIFICATION_METHOD.EMAIL && !existingUserId)
    throw new LookupError(
      'The email address you entered does not match your account email address'
    )

  await TwilioService.sendVerification(sendTo, verificationMethod, firstName)
}

async function sendEmails(userId: Types.ObjectId): Promise<void> {
  const user = await getUserById(userId)
  if (user) {
    if (user.isVolunteer) {
      if ((user as Volunteer).volunteerPartnerOrg) {
        await MailService.sendPartnerVolunteerWelcomeEmail(
          user.email,
          user.firstname
        )
      } else {
        await MailService.sendOpenVolunteerWelcomeEmail(
          user.email,
          user.firstname
        )
      }
    } else {
      await MailService.sendStudentOnboardingWelcomeEmail(
        user.email,
        user.firstname
      )
      await StudentService.queueOnboardingEmails(user._id)
    }
  }
}

export async function confirmVerification(data: unknown): Promise<boolean> {
  const {
    userId,
    sendTo,
    verificationMethod,
    verificationCode,
  } = asConfirmVerificationData(data)

  const VERIFICATION_CODE_LENGTH = 6
  if (
    verificationCode.length !== VERIFICATION_CODE_LENGTH ||
    isNaN(Number(verificationCode))
  )
    throw new InputError('Must enter a valid 6-digit validation code')

  const isPhoneVerification = verificationMethod === VERIFICATION_METHOD.SMS
  try {
    const isVerified = await TwilioService.confirmVerification(
      sendTo,
      verificationCode
    )
    if (isVerified) {
      await updateUserVerifiedInfoById(userId, sendTo, isPhoneVerification)
      await sendEmails(userId)
    }

    return isVerified
  } catch (error) {
    throw error
  }
}
