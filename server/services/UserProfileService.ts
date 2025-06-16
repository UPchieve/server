import { updateUserProfileById, updateSubjectAlerts } from '../models/User'
import { UserContactInfo, UserProfilePayload } from '../models/User/types'
import { upsertStudentProfile } from '../models/Student'
import { runInTransaction, TransactionClient } from '../db'
import { createAccountAction } from '../models/UserAction'
import { ACCOUNT_USER_ACTIONS } from '../constants'
import * as MailService from './MailService'

export async function updateUserProfile(
  user: UserContactInfo,
  ipAdress: string,
  data: UserProfilePayload
) {
  runInTransaction(async (tc: TransactionClient) => {
    await updateUserProfileById(user.id, data)
    await updateSubjectAlerts(user.id, data)
    await upsertStudentProfile(
      {
        userId: user.id,
        schoolId: data.schoolId,
      },
      tc
    )

    if (data.deactivated !== user.deactivated) {
      await MailService.createContact(user.id)

      await createAccountAction(
        {
          action: ACCOUNT_USER_ACTIONS.DEACTIVATED,
          userId: user.id,
          ipAddress: ipAdress,
        },
        tc
      )
    }
  })
}

//TODO move other user profile related code here
