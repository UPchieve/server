import { insertFederatedCredential } from '../models/FederatedCredential'

export async function linkAccount(
  profileId: string,
  issuer: string,
  userId: string
) {
  await insertFederatedCredential(profileId, issuer, userId)
}
