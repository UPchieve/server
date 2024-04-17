import { SocketUser } from '../router/extract-user'
import { getLogSocketConnectionEventsFeatureFlag } from '../services/FeatureFlagService'
import { Ulid } from '../models/pgUtils'
import * as SessionService from '../services/SessionService'
import logger from '../logger'

export const logSocketConnectionInfo = async (
  event: string,
  socket: SocketUser
) => {
  const userId = socket.request.user?.id as Ulid
  const loggingEnabled = await getLogSocketConnectionEventsFeatureFlag(userId)
  if (!loggingEnabled) return

  try {
    const currentSession = await SessionService.currentSession(userId)
    const analyticsData = {
      user: {
        id: userId,
        isVolunteer: socket.request.user?.isVolunteer,
      },
      rooms: Array.from(socket.rooms),
      currentSession: currentSession
        ? {
            id: currentSession?.id,
          }
        : undefined,
    }
    logger.info(analyticsData, `Socket connection event: ${event}`) // If the message format changes, please update the Parsing Rule in NewRelic
  } catch (err) {
    logger.error(
      err,
      `Failed to log socket connection info for userId=${userId}`
    )
  }
}
