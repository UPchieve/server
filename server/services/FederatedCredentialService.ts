import * as Repo from '../models/FederatedCredential'
import { Ulid } from '../models/pgUtils'

export async function linkAccount(
  profileId: string,
  issuer: string,
  userId: string
) {
  await Repo.insertFederatedCredential(profileId, issuer, userId)
}

export async function getFederatedCredentialByUserId(userId: Ulid) {
  return Repo.getFederatedCredentialForUser(userId)
}
