import SessionService from '../../services/SessionService'
import logger from '../../logger'

export default async (): Promise<void> => {
  const staleSessions = await SessionService.getStaleSessions()
  for (const session of staleSessions) {
    await SessionService.endSession({ sessionId: session._id, isAdmin: true })
  }
  logger.info(`ended ${staleSessions.length} sessions`)
}
