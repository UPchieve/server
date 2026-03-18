import { Job } from 'bull'
import { log } from '../logger'
import { Uuid } from '../../models/pgUtils'
import {
  getSessionById,
  getSessionFlagsBySessionId,
} from '../../models/Session'
import { getRulesActionsFromFlagId } from '../../models/RulesActions/queries'
import { executeModerationActionByName } from '../../services/ModerationService/ModerationActionService'

type ExecuteModerationAction = {
  sessionId: Uuid
}

export default async (job: Job<ExecuteModerationAction>): Promise<void> => {
  const sessionId = job.data.sessionId
  const session = await getSessionById(sessionId)
  const studentId = session.studentId

  const sessionFlags = await getSessionFlagsBySessionId(sessionId)

  const actionsBySessionFlag = await Promise.all(
    sessionFlags.map((flag) => getRulesActionsFromFlagId(flag.sessionFlagId))
  )

  const ruleActions = actionsBySessionFlag.flat()

  await Promise.all(
    ruleActions.map(async (action) => {
      try {
        await executeModerationActionByName(
          action.actionName,
          studentId,
          sessionId
        )
        log(`Successfully executed action ${action.actionName}`)
      } catch (error) {
        throw new Error(
          `Failed to execute action ${action.actionName}. Error: ${error}`
        )
      }
    })
  )
}
