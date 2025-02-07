import * as Repo from '../models/FederatedCredential'
import { Ulid } from '../models/pgUtils'
import { runInTransaction, TransactionClient } from '../db'
import { insertFederatedCredential } from '../models/FederatedCredential'

export enum Issuer {
  CLEVER = 'https://clever.com',
  GOOGLE = 'https://accounts.google.com',
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

export async function getFederatedCredentialByUserId(userId: Ulid) {
  return Repo.getFederatedCredentialForUser(userId)
}
