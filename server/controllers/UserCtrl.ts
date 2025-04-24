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
import { getClient, runInTransaction } from '../db'

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
  const client = getClient()
  // Replaced by VolunteerRepo.createVolunteer
  return await runInTransaction(async (tc) => {
    try {
      const volunteer = await VolunteerRepo.createVolunteer(volunteerData, tc)
      await USMRepo.createUSMByUserId(volunteer.id, tc)
      await UPFRepo.createUPFByUserId(volunteer.id, tc)
      await UserActionRepo.createAccountAction(
        {
          action: ACCOUNT_USER_ACTIONS.CREATED,
          userId: volunteer.id,
          ipAddress: ip,
        },
        tc
      )
      await createContact(volunteer.id)
      return volunteer
    } catch (err) {
      captureException(err)
      logError(err as Error)
      throw err
    }
  }, client)
}
