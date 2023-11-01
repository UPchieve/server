import { VERIFICATION_METHOD } from '../constants'
import { Ulid } from '../models/pgUtils'
import { getUserIdByPhone, getUserVerificationInfoById } from '../models/User'
import {
  updateFallIncentiveProgram,
  getPublicUPFByUserId,
} from '../models/UserProductFlags'
import * as TwilioService from './TwilioService'

export async function checkIfInIncentiveProgram(userId: Ulid) {
  const flags = await getPublicUPFByUserId(userId)
  if (flags?.fallIncentiveProgram)
    throw new Error('Already in the fall incentive program')
}

// TODO: Remove once VerificationSerivice.initiateVerification supports SMS
export async function incentiveProgramEnrollmentVerify(
  userId: Ulid,
  firstName: string,
  phone: string
) {
  try {
    const currentUser = await getUserIdByPhone(phone)
    if (currentUser) throw new Error('Phone number in use')
    await checkIfInIncentiveProgram(userId)
    await TwilioService.sendVerification(
      phone,
      VERIFICATION_METHOD.SMS,
      firstName,
      userId
    )
  } catch (error) {
    throw error
  }
}

export async function incentiveProgramEnrollmentEnroll(userId: Ulid) {
  try {
    const userVerificationInfo = await getUserVerificationInfoById(userId)
    if (!userVerificationInfo?.phoneVerified)
      throw new Error(
        'Your phone number must be verified before joining the program.'
      )
    await updateFallIncentiveProgram(userId, true)
  } catch (error) {
    throw error
  }
}
