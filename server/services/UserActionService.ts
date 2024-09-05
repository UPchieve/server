import { ACCOUNT_USER_ACTIONS } from '../constants'
import { Ulid } from '../models/pgUtils'
import * as UserActionRepo from '../models/UserAction'

export async function createAccountAction(
  params: UserActionRepo.AccountActionParams
) {
  return await UserActionRepo.createAccountAction(params)
}

export async function getEmailActivityByEmailTemplateId(
  userId: Ulid,
  emailTemplateId: string,
  start?: Date,
  end?: Date
) {
  return await UserActionRepo.getEmailActivityByEmailTemplateId(
    userId,
    emailTemplateId,
    start,
    end
  )
}

export async function logEmailActivity(userId: string, templateId: string) {
  await createAccountAction({
    action: ACCOUNT_USER_ACTIONS.EMAILED,
    userId,
    emailTemplateId: templateId,
  })
}

export async function hasEmailBeenSent(
  userId: string,
  templateId: string,
  startDate: Date
) {
  const emailActivity = await getEmailActivityByEmailTemplateId(
    userId,
    templateId,
    startDate
  )
  return emailActivity.length > 0
}
