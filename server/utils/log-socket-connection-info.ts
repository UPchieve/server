import { SocketUser } from '../router/extract-user'
import { Ulid } from '../models/pgUtils'
import logger from '../logger'
import { DISCONNECT_REASONS } from '../router/api/sockets'

export const logSocketConnectionInfo = async (
  event: string,
  socket: SocketUser,
  args?: any
) => {
  const userId = socket.request.user?.id as Ulid
  const disconnectReason =
    event === 'disconnect' || event === 'disconnection'
      ? DISCONNECT_REASONS[args as keyof typeof DISCONNECT_REASONS]
      : undefined

  try {
    const analyticsData = {
      eventName: event,
      disconnectReason: disconnectReason?.description,
      disconnectIsError: disconnectReason?.isError,
      user: {
        id: userId,
        isVolunteer: socket.request.user?.isVolunteer,
      },
      rooms: Array.from(socket.rooms),
    }
    const message = `Socket connection event: ${event}`
    disconnectReason?.isError
      ? logger.error(analyticsData, message)
      : logger.info(analyticsData, message)
  } catch (err) {
    logger.error(
      err,
      `Failed to log socket connection info for userId=${userId}`
    )
  }
}
