import { getClient, TransactionClient } from '../../db'
import { RepoReadError } from '../Errors'
import { getDbUlid, makeRequired, Ulid, Uuid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { SessionEditorActivity } from './types'
import { EditorActivitySource, InsertSessionEditorActivityArgs } from './types'
import { RepoCreateError } from '../Errors'
import * as cache from '../../cache'
import logger from '../../logger'

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

const THROTTLE_SECONDS = 60 * 5

function throttleKey(
  sessionId: string,
  userId: string,
  source: EditorActivitySource
): string {
  return `session-editor-activity-throttle-${source}-${sessionId}-${userId}`
}

/**
 * Records that a user was active in a session's zwibbler/quill editor, at
 * most once per THROTTLE_SECONDS per (session, user, source)
 */
export async function logThrottledEditorActivity(
  sessionId: string,
  userId: string,
  source: EditorActivitySource
): Promise<void> {
  try {
    const key = throttleKey(sessionId, userId, source)
    if (await cache.exists(key)) return
    await cache.saveWithExpiration(key, '1', THROTTLE_SECONDS)
    await insertSessionEditorActivity({
      sessionId,
      userId,
      source,
    })
  } catch (err) {
    logger.warn(
      { err, sessionId, userId, source },
      'Failed to log throttled session editor activity'
    )
  }
}
