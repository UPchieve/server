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
import QueueService from './QueueService'
import { Jobs } from '../worker/jobs'
import {
  deleteUsersSchoolsByUserId,
  upsertUsersSchool,
} from '../models/UsersSchools'

export async function updateUserProfile(
  user: UserContactInfo,
  ipAddress: string = '',
  data: EditUserProfilePayload
) {
  await runInTransaction(async (tc: TransactionClient) => {
    await updateUserProfileById(user.id, data, tc)

    if (user.roleContext.isActiveRole('volunteer')) {
      await updateSubjectAlerts(user.id, data.mutedSubjectAlerts, tc)
      if (data.occupation) {
        await VolunteerRepo.deleteVolunteerOccupations(user.id, tc)
        await VolunteerRepo.insertVolunteerOccupations(
          user.id,
          data.occupation,
          tc
        )
      }
      if (data.company || data.college || data.country) {
        await VolunteerRepo.updateVolunteerProfile(
          user.id,
          {
            company: data.company,
            college: data.college,
            country: data.country,
            city: data.city,
            state: data.state,
          },
          tc
        )
      }
      // Omitting schoolId preserves the existing association; high-line must send
      // an explicit null to remove it.
      if (data.schoolId === null) {
        await deleteUsersSchoolsByUserId(user.id, tc)
      } else if (data.schoolId) {
        await upsertUsersSchool(user.id, data.schoolId, 'student_at_school', tc)
      }
    } else if (user.roleContext.isActiveRole('student')) {
      await upsertStudent(
        { userId: user.id, schoolId: data.schoolId ?? undefined },
        tc
      )
    }

    if (data.gradeLevel) {
      await UsersGradeLevelsRepo.upsertUserGradeLevel(
        user.id,
        data.gradeLevel,
        tc
      )
      await createOrUpdateSendGridContact(user.id)
    }
  })

  if (data.deactivated !== user.deactivated) {
    if (data.deactivated) {
      await MailService.deleteContactByEmail(user.email)
    } else {
      await createOrUpdateSendGridContact(user.id)
    }

    await createAccountAction({
      action: ACCOUNT_USER_ACTIONS.DEACTIVATED,
      userId: user.id,
      ipAddress: ipAddress,
    })
  }
}

async function createOrUpdateSendGridContact(userId: Ulid) {
  await QueueService.add(Jobs.SyncSendGridContact, { delay: 0 }, { userId })
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
