import * as UserActionRepo from '../models/UserAction'

export async function createAccountAction(
  params: UserActionRepo.AccountActionParams
) {
  return UserActionRepo.createAccountAction(params)
}
