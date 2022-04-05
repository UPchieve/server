import { getClient } from '../../pg'
import { RepoDeleteError } from '../Errors'
import { makeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'

export async function deleteAuthSessionsByUserId(userId: Ulid): Promise<void> {
  try {
    const result = await pgQueries.deleteAuthSessionsForUser.run({ userId }, getClient())
    if (!result.map(v => makeRequired(v).ok).length) throw new Error(`Did not delete auth sessions for user ${userId}`)
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}
