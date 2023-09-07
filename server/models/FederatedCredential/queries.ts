import { getClient, TransactionClient } from '../../db'
import * as pgQueries from './pg.queries'
import { makeRequired, Ulid } from '../pgUtils'
import { RepoReadError, RepoUpdateError } from '../Errors'

export async function getFederatedCredential(id: string, issuer: string) {
  try {
    const result = await pgQueries.getFederatedCredential.run(
      { id, issuer },
      getClient()
    )

    if (result.length) {
      return makeRequired(result[0])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function insertFederatedCredential(
  id: string,
  issuer: string,
  userId: Ulid,
  tc?: TransactionClient
) {
  try {
    await pgQueries.insertFederatedCredential.run(
      { id, issuer, userId },
      tc ?? getClient()
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}
