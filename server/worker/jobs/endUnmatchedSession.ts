import { Job } from 'bull'
import { Types } from 'mongoose'
import Session from '../../models/Session'
import SessionService from '../../services/SessionService'
import { log } from '../logger'
import { Jobs } from '.'

export interface EndUnmatchedSessionJobData {
  sessionId: string | Types.ObjectId
}

export default async (job: Job<EndUnmatchedSessionJobData>): Promise<void> => {
  const { sessionId } = job.data
  const session = await Session.findById(sessionId)
    .lean()
    .exec()
  if (session) {
    const fulfilled = SessionService.isSessionFulfilled(session)
    if (fulfilled) {
      log(`Cancel ${Jobs.EndUnmatchedSession}: session ${sessionId} fulfilled`)
    } else {
      try {
        await SessionService.endSession({ sessionId: sessionId, isAdmin: true })
        log(`Successfuly ${Jobs.EndUnmatchedSession}: session ${sessionId}`)
      } catch (error) {
        throw new Error(
          `Failed to ${Jobs.EndUnmatchedSession}: session ${sessionId}: ${error}`
        )
      }
    }
  }
}
