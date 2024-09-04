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
