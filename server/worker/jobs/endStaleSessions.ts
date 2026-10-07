import { Job } from 'bull'
import * as SessionService from '../../services/SessionService'
import logger from '../../logger'

export default async (job: Job<undefined>): Promise<void> => {
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
  logger.info(`Successfuly ${job.name} for ${totalEnded} sessions.`)
  if (errors.length) {
    throw new Error(`Failed to ${job.name} for: ${errors}`)
  }
}
