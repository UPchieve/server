import SessionService from '../../services/SessionService'
import { log } from '../logger'
import { Jobs } from '.'

export default async (): Promise<void> => {
  const staleSessions = await SessionService.getStaleSessions()
  let totalEnded = 0
  const errors = []
  for (const session of staleSessions) {
    try {
      await SessionService.endSession({ sessionId: session._id, isAdmin: true })
      totalEnded += 1
    } catch (error) {
      errors.push(`session ${session._id}: ${error}`)
    }
  }
  log(`Successfuly ${Jobs.EndStaleSessions} for ${totalEnded} sessions.`)
  if (errors.length) {
    throw new Error(`Failed to ${Jobs.EndStaleSessions} for: ${errors}`)
  }
}
