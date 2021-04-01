import UserService from '../services/UserService'
import TwilioService from '../services/twilio'
import { VERIFICATION_METHOD } from '../constants'

export interface InitiateVerificationOptions {
  sendTo: string
  verificationMethod: VERIFICATION_METHOD
  firstName: string
}

export interface ConfirmVerificationOptions {
  userId: string
  sendTo: string
  verificationMethod: VERIFICATION_METHOD
  verificationCode: string
}

export const initiateVerification = ({
  firstName,
  sendTo,
  verificationMethod
}: InitiateVerificationOptions) =>
  TwilioService.sendStudentVerification({
    sendTo,
    verificationMethod,
    firstName
  })

export const confirmVerification = async ({
  userId,
  verificationCode,
  sendTo,
  verificationMethod
}: ConfirmVerificationOptions) => {
  const isPhoneVerification = verificationMethod === VERIFICATION_METHOD.SMS
  try {
    const verificationResult = await TwilioService.confirmStudentVerification(
      sendTo,
      verificationCode
    )
    const isVerified = verificationResult.valid
    if (isVerified) {
      const update: {
        verified: boolean
        phone?: string
        verifiedPhone?: boolean
        verifiedEmail?: boolean
      } = { verified: true }
      if (isPhoneVerification) {
        update.verifiedPhone = true
        update.phone = sendTo
      } else update.verifiedEmail = true
      await UserService.updateUser({ _id: userId }, update)
    }
    return isVerified
  } catch (error) {
    throw error
  }
}
