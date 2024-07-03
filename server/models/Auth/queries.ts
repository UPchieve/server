import { getClient } from '../../db'
import { RepoDeleteError } from '../Errors'
import { makeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'

export async function deleteAuthSessionsByUserId(userId: Ulid): Promise<void> {
  try {
    await pgQueries.deleteAuthSessionsForUser.run({ userId }, getClient())
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}
