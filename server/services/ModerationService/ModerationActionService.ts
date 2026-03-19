import { ACCOUNT_USER_ACTIONS } from '../../constants'
import { Uuid } from '../../models/pgUtils'
import { shadowBanStudent } from '../../models/User/'
import { createAccountAction } from '../../models/UserAction'

export async function executeModerationActionByName(
  actionName: string,
  studentId: Uuid,
  sessionId: Uuid
) {
  if (actionName === 'shadowBan') {
    await shadowBanStudent(studentId)

    await createAccountAction({
      userId: studentId,
      sessionId,
      action: ACCOUNT_USER_ACTIONS.SHADOW_BANNED,
    })
  } else {
    throw new Error(`Unable to execute ${actionName}`)
  }
}
