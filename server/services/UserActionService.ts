import * as UserActionRepo from '../models/UserAction'

export async function createAccountAction(
  params: UserActionRepo.AccountActionParams
) {
  return UserActionRepo.createAccountAction(params)
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
