import { runInTransaction, TransactionClient } from '../db'
import { Ulid } from '../models/pgUtils'
import * as Repo from '../models/FederatedCredential'

export enum Issuer {
  CLEVER = 'https://clever.com',
  GOOGLE = 'https://accounts.google.com',
}

export async function getFedCredForUser(profileId: string, issuer: string) {
  return Repo.getFederatedCredential(profileId, issuer)
}

export async function linkAccount(
  profileId: string,
  issuer: string,
  userId: string,
  tc?: TransactionClient
) {
  return runInTransaction(async (tc: TransactionClient) => {
    await Repo.insertFederatedCredential(profileId, issuer, userId, tc)
  }, tc)
}
