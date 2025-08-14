import { captureException } from '@sentry/node'
import * as UPFRepo from '../models/UserProductFlags'
import * as VolunteerRepo from '../models/Volunteer'
import * as UserActionRepo from '../models/UserAction'
import * as ReferralService from '../services/ReferralService'
import { createContact } from '../services/MailService'
import { hashPassword } from '../utils/auth-utils'
import { logError } from '../logger'
import { ACCOUNT_USER_ACTIONS } from '../constants'

// TODO: Move to UserCreationService.
export async function createVolunteer(
  volunteerData: VolunteerRepo.CreateVolunteerPayload,
  ip: string
): Promise<VolunteerRepo.CreatedVolunteer> {
  volunteerData.password = await hashPassword(volunteerData.password)

  const volunteer = await VolunteerRepo.createVolunteer(volunteerData)
  if (volunteerData.referredBy) {
    await ReferralService.addReferralFor(volunteer.id, volunteerData.referredBy)
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
