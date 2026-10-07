import * as UPFRepo from '../models/UserProductFlags'
import * as VolunteerRepo from '../models/Volunteer'
import * as UserActionRepo from '../models/UserAction'
import * as ReferralService from '../services/ReferralService'
import { hashPassword } from '../utils/auth-utils'
import { ACCOUNT_USER_ACTIONS, USER_EVENTS } from '../constants'
import { runInTransaction } from '../db'
import { emitter } from '../services/EventsService'
import logger from '../logger'

// TODO: Move to UserCreationService.
export async function createVolunteer(
  volunteerData: VolunteerRepo.CreateVolunteerPayload,
  ip: string
): Promise<VolunteerRepo.CreatedVolunteer> {
  volunteerData.password = await hashPassword(volunteerData.password)
  const volunteer = await runInTransaction(async (tc) => {
    const volunteer = await VolunteerRepo.createVolunteer(volunteerData, tc)
    if (volunteerData.referredByCode) {
      await ReferralService.addReferralForUserByCode(
        volunteer.id,
        volunteerData.referredByCode,
        tc
      )
    }
    return volunteer
  })

  // Create a UPF object for this new user
  try {
    await UPFRepo.createUPFByUserId(volunteer.id)
  } catch (err) {
    logger.error('Failed to create UPF object for new user', {
      err,
      userId: volunteer.id,
    })
  }

  try {
    await UserActionRepo.createAccountAction({
      action: ACCOUNT_USER_ACTIONS.CREATED,
      userId: volunteer.id,
      ipAddress: ip,
    })
  } catch (err) {
    logger.error('Failed to create account action', {
      err,
      userId: volunteer.id,
    })
  }

  emitter.emit(USER_EVENTS.USER_CREATED, volunteer.id)

  return volunteer
}
