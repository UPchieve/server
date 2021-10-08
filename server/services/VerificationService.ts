import { VERIFICATION_METHOD } from '../constants'
import {
  asFactory,
  asString,
  asEnum,
  asStringObjectId
} from '../utils/type-utils'
import isValidEmail from '../utils/is-valid-email'
import isValidInternationalPhoneNumber from '../utils/is-valid-international-phone-number'
import { InputError, LookupError } from '../models/Errors'
import * as StudentService from './StudentService'
import MailService from './MailService'
import TwilioService from './twilio'
import UserService from './UserService'

export interface InitiateVerificationData {
  userId: string
  sendTo: string
  verificationMethod: VERIFICATION_METHOD
  firstName: string
}

const asInitiateVerificationData = asFactory<InitiateVerificationData>({
  userId: asStringObjectId, // parsed from request as string
  sendTo: asString,
  verificationMethod: asEnum(VERIFICATION_METHOD),
  firstName: asString
})

export interface ConfirmVerificationData {
  userId: string
  sendTo: string
  verificationMethod: VERIFICATION_METHOD
  verificationCode: string
}

const asConfirmVerificationData = asFactory<ConfirmVerificationData>({
  userId: asStringObjectId, // parsed from request as string
  sendTo: asString,
  verificationMethod: asEnum(VERIFICATION_METHOD),
  verificationCode: asString
})

export async function initiateVerification(data: unknown): Promise<void> {
  const {
    userId,
    sendTo,
    verificationMethod,
    firstName
  } = asInitiateVerificationData(data)

  const isPhoneVerification = verificationMethod === VERIFICATION_METHOD.SMS
  let lookupField: string
  let existingUserErrorMessage: string
  if (isPhoneVerification) {
    lookupField = 'phone'
    existingUserErrorMessage = 'The phone number you entered is already in use'
    if (!isValidInternationalPhoneNumber(sendTo))
      throw new InputError('Must supply a valid phone number')
  } else {
    lookupField = 'email'
    existingUserErrorMessage = 'The email address you entered is already in use'
    if (!isValidEmail(sendTo))
      throw new InputError('Must supply a valid email address')
  }

  const existingUser = await UserService.getUser({ [lookupField]: sendTo })
  if (existingUser && userId !== existingUser._id.toString())
    throw new LookupError(existingUserErrorMessage)

  await TwilioService.sendVerification({
    sendTo,
    verificationMethod,
    firstName
  })
}

async function sendEmails(userId: string): Promise<void> {
  const user = await UserService.getUser({ _id: userId })
  if (user.isVolunteer) {
    if (user.volunteerPartnerOrg) {
      await MailService.sendPartnerVolunteerWelcomeEmail({
        email: user.email,
        volunteerName: user.firstname
      })
    } else {
      await MailService.sendOpenVolunteerWelcomeEmail({
        email: user.email,
        volunteerName: user.firstname
      })
    }
  } else {
    await MailService.sendStudentWelcomeEmail({
      email: user.email,
      firstName: user.firstname
    })
    await StudentService.queueWelcomeEmails(user._id)
  }
}

export async function confirmVerification(data: unknown): Promise<boolean> {
  const {
    userId,
    sendTo,
    verificationMethod,
    verificationCode
  } = asConfirmVerificationData(data)

  const VERIFICATION_CODE_LENGTH = 6
  if (
    verificationCode.length !== VERIFICATION_CODE_LENGTH ||
    isNaN(Number(verificationCode))
  )
    throw new InputError('Must enter a valid 6-digit validation code')

  const isPhoneVerification = verificationMethod === VERIFICATION_METHOD.SMS
  try {
    const verificationResult = await TwilioService.confirmVerification(
      sendTo,
      verificationCode
    )
    const isVerified = verificationResult.valid
    if (isVerified) {
      const update: {
        verified: boolean
        phone?: string
        verifiedPhone?: boolean
        email?: string
        verifiedEmail?: boolean
      } = { verified: true }
      if (isPhoneVerification) {
        update.verifiedPhone = true
        update.phone = sendTo
      } else {
        update.verifiedEmail = true
        update.email = sendTo
      }

      await UserService.updateUser({ _id: userId }, update)
      await sendEmails(userId)
    }
    return isVerified
  } catch (error) {
    throw error
  }
}
