import * as db from '../db'
import logger from '../logger'
import { Uuid } from '../models/pgUtils'
import { getSessionById, updateSessionFlagsById } from '../models/Session'
import {
  createSessionMetrics,
  updateSessionMetrics,
} from '../models/SessionMetrics'
import {
  computeMetricsForFeedbackSaved,
  computeMetricsForReportedSession,
  computeMetricsForSession,
  computeSessionFlagsFromMetrics,
} from '../services/SessionMetricsService'

/**
 *
 * We only want to update the session metrics and set the relevant
 * session flags for the session. We want to avoid setting off any
 * jobs that trigger emails or causing the session to be marked
 * for review.
 *
 */
async function storeSessionMetricsAndSessionFlags(sessionId: Uuid) {
  const session = await getSessionById(sessionId)
  const sessionMetrics = await computeMetricsForSession(session)
  const feedbackMetrics = await computeMetricsForFeedbackSaved(session)
  const reportMetrics = await computeMetricsForReportedSession(session)
  const updatedMetrics = await updateSessionMetrics(sessionId, {
    ...sessionMetrics,
    ...feedbackMetrics,
    ...reportMetrics,
  })
  const sessionFlags = computeSessionFlagsFromMetrics(updatedMetrics)
  await updateSessionFlagsById(session.id, sessionFlags)
}

export default async function main(): Promise<void> {
  let totalProcessed = 0
  try {
    await db.connect()
    const limit = 100
    let offset = 0
    let sessions = []

    while (true) {
      const result = await db.getClient().query(`
        SELECT id
        FROM sessions
        WHERE ended_at IS NOT NULL
        ORDER BY created_at ASC
        LIMIT ${limit} OFFSET ${offset}
      `)
      sessions = result.rows
      if (!sessions.length) break

      for (const session of sessions) {
        const result = await db.getClient().query(
          `
            SELECT session_id
            FROM session_metrics
            WHERE session_id = $1
          `,
          [session.id]
        )
        if (!result.rowCount) await createSessionMetrics(session.id)
        await storeSessionMetricsAndSessionFlags(session.id)
        totalProcessed++
      }

      offset += limit
    }

    logger.info(
      `Successfully backfilled ${totalProcessed} sessions with session_metrics`
    )
  } catch (error) {
    logger.info(
      `Failed to backfill session_metrics. Processed ${totalProcessed} sessions. Failed due to ${error}`
    )
  }
}
