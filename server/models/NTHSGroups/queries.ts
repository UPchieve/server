import { getRoClient } from '../../db'
import { RepoReadError } from '../Errors'
import { makeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'

export async function getGroupsByUser(userId: Ulid) {
  try {
    const results = await pgQueries.getGroupsByUser.run(
      {
        userId,
      },
      getRoClient()
    )
    return results.map(makeRequired)
  } catch (err) {
    throw new RepoReadError(err)
  }
}
