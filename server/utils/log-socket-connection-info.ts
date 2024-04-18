import { SocketUser } from '../router/extract-user'
import { Ulid } from '../models/pgUtils'
import * as SessionService from '../services/SessionService'
import logger from '../logger'

export const logSocketConnectionInfo = async (
  event: string,
  socket: SocketUser
) => {
  const userId = socket.request.user?.id as Ulid

  try {
    const analyticsData = {
      user: {
        id: userId,
        isVolunteer: socket.request.user?.isVolunteer,
      },
      rooms: Array.from(socket.rooms),
    }
    logger.info(analyticsData, `Socket connection event: ${event}`) // If the message format changes, please update the Parsing Rule in NewRelic
  } catch (err) {
    logger.error(
      err,
      `Failed to log socket connection info for userId=${userId}`
    )
  }
}
