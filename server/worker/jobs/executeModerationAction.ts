import { Job } from 'bull'
import { log } from '../logger'
import { Uuid } from '../../models/pgUtils'
import { getSessionById } from '../../models/Session'
import { executeModerationActionById } from '../../services/ModerationService/ModerationActionService'

type ExecuteAction = {
  sessionId: Uuid
  ruleId: number
  actionId: number
  actionName: string
  studentId: Uuid
}

export default async (job: Job<ExecuteAction>): Promise<void> => {
  const sessionId = job.data.sessionId
  const session = await getSessionById(sessionId)
  const student = session.studentId

  try {
    await executeModerationActionById(job.data.actionId, student, sessionId)
    log(`Successfully executed action ${job.data.actionName}`)
  } catch (error) {
    throw new Error(
      `Failed to execute action ${job.data.actionName}. Error: ${error}`
    )
  }
}