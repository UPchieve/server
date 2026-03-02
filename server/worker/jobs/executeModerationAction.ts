import { Job } from 'bull'
import { log } from '../logger'
import { Uuid } from '../../models/pgUtils'
import { getSessionById } from '../../models/Session'
import { getSessionFlagsBySessionId } from '../../models/Session'
import { getRulesActionsFromFlagId } from '../../models/RulesActions/queries'
import { executeModerationActionById } from '../../services/ModerationService/ModerationActionService'
import { RulesActionsResult } from '../../models/RulesActions/types'

type ExecuteModerationAction = {
  sessionId: Uuid
  ruleId: number
  actionId: number
  actionName: string
  studentId: Uuid
}

export default async (job: Job<ExecuteModerationAction>): Promise<void> => {
  const sessionId = job.data.sessionId
  const session = await getSessionById(sessionId)
  const student = session.studentId

  const sessionFlags = await getSessionFlagsBySessionId(sessionId)

  const ruleActionsNested = await Promise.all(
    sessionFlags.map((flag) => getRulesActionsFromFlagId(flag.sessionFlagId))
  )

  const ruleActions = ruleActionsNested
    .flat()
    .filter((action): action is RulesActionsResult => !!action)

  if (ruleActions) {
    await Promise.all(
      ruleActions.map(async (action) => {
        try {
          await executeModerationActionById(action.actionId, student, sessionId)
          log(`Successfully executed action ${action.actionName}`)
        } catch (error) {
          throw new Error(
            `Failed to execute action ${action.actionName}. Error: ${error}`
          )
        }
      })
    )
  }
}
