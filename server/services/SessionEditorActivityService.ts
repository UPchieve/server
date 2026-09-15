import * as cache from '../cache'
import logger from '../logger'
import { insertSessionEditorActivity } from '../models/SessionEditorActivity/queries'
import { EditorActivitySource } from '../models/SessionEditorActivity/types'
import { minutesInSeconds } from '../utils/time-utils'

const THROTTLE_SECONDS = minutesInSeconds(5)

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
