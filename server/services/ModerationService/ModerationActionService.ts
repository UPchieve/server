import { ACCOUNT_USER_ACTIONS } from '../../constants'
import { Uuid } from '../../models/pgUtils'
import { shadowBanStudent } from '../../models/RulesActions/queries'
import { createAccountAction } from '../../models/UserAction'

export async function executeModerationActionById(actionId: number, studentId: Uuid, sessionId: Uuid) {

  if(actionId === 1) {
    await shadowBanStudent(studentId)

    await createAccountAction({
      userId: studentId,
      sessionId,
      action: ACCOUNT_USER_ACTIONS.SHADOW_BANNED,
    })
  }
}

export async function queueExecuteModerationActionById() {
  
}