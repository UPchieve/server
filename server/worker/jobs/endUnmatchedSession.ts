import { Job } from 'bull'
import { Types } from 'mongoose'
import Session from '../../models/Session'
import SessionService from '../../services/SessionService'
import logger from '../../logger'

export interface EndUnmatchedSessionJobData {
  sessionId: string | Types.ObjectId
}

export default async (job: Job<EndUnmatchedSessionJobData>): Promise<void> => {
  const { sessionId } = job.data
  const session = await Session.findById(sessionId)
    .lean()
    .exec()
  if (!session) return logger.info(`session ${sessionId} not found`)

  const fulfilled = SessionService.isSessionFulfilled(session)
  if (fulfilled)
    return logger.info(
      `session ${sessionId} fulfilled, cancel ending unmatched session`
    )

  try {
    await SessionService.endSession({ sessionId: session._id, isAdmin: true })
    logger.info(`Ended unmatched session: ${sessionId}`)
  } catch (error) {
    logger.error(`Failed to end unmatched session: ${sessionId}: ${error}`)
  }
}
