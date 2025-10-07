import { updateUserProfileById, updateSubjectAlerts } from '../models/User'
import { UserContactInfo, EditUserProfilePayload } from '../models/User/types'
import { runInTransaction, TransactionClient } from '../db'
import { createAccountAction } from '../models/UserAction'
import { ACCOUNT_USER_ACTIONS } from '../constants'
import * as MailService from './MailService'
import { upsertStudent } from './UserCreationService'
import { Ulid } from '../models/pgUtils'

export async function updateUserProfile(
  user: UserContactInfo,
  ipAddress: string,
  data: EditUserProfilePayload
) {
  await runInTransaction(async (tc: TransactionClient) => {
    await updateUserProfileById(user.id, data, tc)

    if (user.roleContext.isActiveRole('volunteer')) {
      await updateSubjectAlerts(user.id, data.mutedSubjectAlerts, tc)
    } else if (user.roleContext.isActiveRole('student')) {
      await upsertStudent({ userId: user.id, schoolId: data.schoolId }, tc)
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
//TODO move other user profile related code here
