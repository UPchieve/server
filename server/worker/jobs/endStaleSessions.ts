import * as SessionService from '../../services/SessionService'
import { log } from '../logger'
import { Jobs } from '.'

export default async (): Promise<void> => {
  const staleSessions = await SessionService.getStaleSessions()
  let totalEnded = 0
  const errors: string[] = []
  for (const sessionId of staleSessions) {
    try {
      await SessionService.endSession(
        sessionId,
        null,
        true,
        undefined,
        undefined
      )
      totalEnded += 1
    } catch (error) {
      errors.push(`session ${sessionId}: ${error}`)
    }
  }
  log(`Successfuly ${Jobs.EndStaleSessions} for ${totalEnded} sessions.`)
  if (errors.length) {
    throw new Error(`Failed to ${Jobs.EndStaleSessions} for: ${errors}`)
  }
}
