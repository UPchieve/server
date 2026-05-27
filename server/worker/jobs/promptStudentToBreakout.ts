import { Job } from 'bull'
import * as sessionUtils from '../../utils/session-utils'
import * as SessionRepo from '../../models/Session/queries'
import * as cache from '../../cache'
import SocketService from '../../services/SocketService'
import { log } from '../logger'
import { Jobs } from '.'
import { asString } from '../../utils/type-utils'

export interface PromptStudentToBreakoutJobData {
  sessionId: string
}

export default async (
  job: Job<PromptStudentToBreakoutJobData>
): Promise<void> => {
  const sessionId = asString(job.data.sessionId)
  let session
  try {
    session = await SessionRepo.getSessionById(sessionId)
  } catch {
    log(`${Jobs.PromptStudentToBreakout}: session ${sessionId} not found`)
    return
  }
  if (sessionUtils.isSessionFulfilled(session)) {
    log(`${Jobs.PromptStudentToBreakout}: session ${sessionId} already fulfilled`)
    return
  }
  const exclusiveTo = await cache.hget(
    'exclusiveRequestSessions',
    sessionId
  )
  if (!exclusiveTo) {
    log(
      `${Jobs.PromptStudentToBreakout}: session ${sessionId} no longer exclusive`
    )
    return
  }
  await SocketService.getInstance().emitBreakoutPromptToStudent(
    session.studentId,
    sessionId
  )
}
