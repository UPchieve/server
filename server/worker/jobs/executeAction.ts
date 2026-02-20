import { Job } from 'bull'
import { log } from '../logger'
import { Uuid } from '../../models/pgUtils'
import { getSessionById } from '../../models/Session'

type ExecuteAction = {
  sessionId: Uuid
  ruleId: number
  actionId: number
  actionName: string
}

export default async (job: Job<ExecuteAction>): Promise<void> => {
  const sessionId = job.data.sessionId
  const session = await getSessionById(sessionId)

  //create new Rule/Actions service and add logic to perform an action based on the action id (i.e shadow ban -> update user ban_type)
  //update user actions table 
}