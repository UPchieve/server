import { getClient, TransactionClient } from '../../db'
import { RepoReadError } from '../Errors'
import { getDbUlid, makeRequired, Ulid, Uuid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { SessionEditorActivity } from './types'
import { EditorActivitySource, InsertSessionEditorActivityArgs } from './types'
import { RepoCreateError } from '../Errors'

export async function getSessionEditorActivity(
  sessionId: Ulid,
  tc: TransactionClient = getClient()
): Promise<SessionEditorActivity[]> {
  try {
    const results = await pgQueries.getSessionEditorActivity.run(
      { sessionId },
      tc
    )
    return results.map((result) => {
      const res = makeRequired(result)
      return { ...res, source: res.source as EditorActivitySource }
    })
  } catch (error) {
    throw new RepoReadError(error)
  }
}

export async function insertSessionEditorActivity(
  data: InsertSessionEditorActivityArgs,
  client = getClient()
): Promise<Uuid> {
  try {
    const results = await pgQueries.insertSessionEditorActivity.run(
      {
        id: getDbUlid(),
        sessionId: data.sessionId,
        userId: data.userId,
        source: data.source,
      },
      client
    )
    if (!results.length) {
      throw new RepoCreateError('Failed to create SessionEditorActivity')
    }
    return makeRequired(results[0]).id
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
