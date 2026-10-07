import { Job } from 'bull'
import * as SessionService from '../../services/SessionService'
import * as NotifyVolunteerService from '../../services/NotifyVolunteerService'
import * as sessionUtils from '../../utils/session-utils'
import * as SessionRepo from '../../models/Session/queries'
import logger from '../../logger'
import { asString } from '../../utils/type-utils'

export interface EndUnmatchedSessionJobData {
  sessionId: string
}

export default async (job: Job<EndUnmatchedSessionJobData>): Promise<void> => {
  const sessionId = asString(job.data.sessionId)
  const session = await SessionRepo.getSessionById(sessionId)
  if (!session) return

  await NotifyVolunteerService.clearExclusiveRequest(sessionId)

  const fulfilled = sessionUtils.isSessionFulfilled(session)
  if (fulfilled) {
    logger.info(`Cancel ${job.name}: session ${sessionId} fulfilled`)
    return
  }
  try {
    await SessionService.endSession(sessionId, null, true, undefined, undefined)
    logger.info(`Successfuly ${job.name}: session ${sessionId}`)
  } catch (error) {
    throw new Error(`Failed to ${job.name}: session ${sessionId}: ${error}`)
  }
}
