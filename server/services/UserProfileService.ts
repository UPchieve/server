import {
  updateUserProfileById,
  updateSubjectAlerts,
  updateSmsConsentForPhoneNumber,
} from '../models/User'
import { UserContactInfo, EditUserProfilePayload } from '../models/User/types'
import * as VolunteerRepo from '../models/Volunteer'
import { runInTransaction, TransactionClient } from '../db'
import { createAccountAction } from '../models/UserAction'
import * as UsersGradeLevelsRepo from '../models/UsersGradeLevels'
import { ACCOUNT_USER_ACTIONS } from '../constants'
import * as MailService from './MailService'
import { upsertStudent } from './UserCreationService'
import { Ulid } from '../models/pgUtils'

export async function updateUserProfile(
  user: UserContactInfo,
  ipAddress: string = '',
  data: EditUserProfilePayload
) {
  await runInTransaction(async (tc: TransactionClient) => {
    await updateUserProfileById(user.id, data, tc)

    if (user.roleContext.isActiveRole('volunteer')) {
      //TODO: Think of way to move this code block to the VolunteerService if it gets any bigger
      await updateSubjectAlerts(user.id, data.mutedSubjectAlerts, tc)
      if (data.occupation) {
        await VolunteerRepo.deleteVolunteerOccupations(user.id, tc)
        await VolunteerRepo.insertVolunteerOccupations(
          user.id,
          data.occupation,
          tc
        )
      }
      if (data.company || data.college)
        await VolunteerRepo.updateVolunteerProfile(
          user.id,
          {
            company: data.company,
            college: data.college,
          },
          tc
        )
    } else if (user.roleContext.isActiveRole('student')) {
      await upsertStudent({ userId: user.id, schoolId: data.schoolId }, tc)
    }

    if (data.gradeLevel) {
      await UsersGradeLevelsRepo.upsertUserGradeLevel(
        user.id,
        data.gradeLevel,
        tc
      )
    }
  })

  if (data.deactivated !== user.deactivated) {
    if (data.deactivated) {
      await MailService.deleteContactByEmail(user.email)
    } else {
      await MailService.createContact(user.id)
    }

    await createAccountAction({
      action: ACCOUNT_USER_ACTIONS.DEACTIVATED,
      userId: user.id,
      ipAddress: ipAddress,
    })
  }
}

export async function updateUserSmsConsent(
  userId: Ulid,
  hasGivenConsent: boolean
) {
  return updateUserProfileById(userId, { smsConsent: hasGivenConsent })
}

export async function optOutSmsConsentForPhoneNumber(phoneNumber: string) {
  return updateSmsConsentForPhoneNumber(phoneNumber, false)
}

//TODO move other user profile related code here
