import { Ulid } from '../models/pgUtils'
import { captureException } from '@sentry/node'
import * as USMRepo from '../models/UserSessionMetrics'
import * as UPFRepo from '../models/UserProductFlags'
import * as UserRepo from '../models/User'
import * as VolunteerRepo from '../models/Volunteer'
import * as UserActionRepo from '../models/UserAction'
import { createContact } from '../services/MailService'
import { hashPassword } from '../utils/auth-utils'
import { logError } from '../logger'
import { ACCOUNT_USER_ACTIONS, STUDENT_EVENTS } from '../constants'

export async function checkReferral(
  referredByCode: string | undefined
): Promise<Ulid | undefined> {
  if (referredByCode) {
    try {
      const user = await UserRepo.getUserByReferralCode(referredByCode)
      if (user) return user.id
    } catch (error) {
      captureException(error)
      logError(error as Error)
    }
  }
}

// TODO: duck type validation - volunteerData payload
export async function createVolunteer(
  volunteerData: VolunteerRepo.CreateVolunteerPayload,
  ip: string
): Promise<VolunteerRepo.CreatedVolunteer> {
  volunteerData.password = await hashPassword(volunteerData.password)
  // Replaced by VolunteerRepo.createVolunteer
  const volunteer = await VolunteerRepo.createVolunteer(volunteerData)

  // Create a USM object for this new user
  try {
    await USMRepo.createUSMByUserId(volunteer.id)
  } catch (err) {
    captureException(err)
    logError(err as Error)
  }

  // Create a UPF object for this new user
  try {
    await UPFRepo.createUPFByUserId(volunteer.id)
  } catch (err) {
    captureException(err)
    logError(err as Error)
  }

  try {
    await UserActionRepo.createAccountAction({
      action: ACCOUNT_USER_ACTIONS.CREATED,
      userId: volunteer.id,
      ipAddress: ip,
    })
  } catch (err) {
    captureException(err)
    logError(err as Error)
  }

  try {
    // needs id, firstname, lastname, email, isvolunteer, ban type, testuser, admin, deactivated, createdat
    await createContact(volunteer.id)
  } catch (err) {
    captureException(err)
    logError(err as Error)
  }

  // needs to return id and partner org for frontend
  return volunteer
}
