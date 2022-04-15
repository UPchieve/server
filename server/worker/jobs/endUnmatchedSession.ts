import { Job } from 'bull'
import * as SessionService from '../../services/SessionService'
import * as sessionUtils from '../../utils/session-utils'
import * as SessionRepo from '../../models/Session/queries'
import { log } from '../logger'
import { Jobs } from '.'
import { asString } from '../../utils/type-utils'

export interface EndUnmatchedSessionJobData {
  sessionId: string
}

export default async (job: Job<EndUnmatchedSessionJobData>): Promise<void> => {
  const sessionId = asString(job.data.sessionId)
  const session = await SessionRepo.getSessionById(sessionId)
  if (session) {
    const fulfilled = sessionUtils.isSessionFulfilled(session)
    if (fulfilled) {
      log(`Cancel ${Jobs.EndUnmatchedSession}: session ${sessionId} fulfilled`)
    } else {
      try {
        await SessionService.endSession(
          sessionId,
          null,
          true,
          undefined,
          undefined
        )
        log(`Successfuly ${Jobs.EndUnmatchedSession}: session ${sessionId}`)
      } catch (error) {
        throw new Error(
          `Failed to ${Jobs.EndUnmatchedSession}: session ${sessionId}: ${error}`
        )
      }
    }
  }
}
