import { SocketUser } from '../router/extract-user'
import { Ulid } from '../models/pgUtils'
import logger from '../logger'

// Taken from https://socket.io/docs/v4/server-socket-instance/#disconnect
const SERVER_DISCONNECT_REASONS = {
  'server namespace disconnect': {
    isError: false,
    description:
      'The socket was forcefully disconnected with socket.disconnect()',
  },
  'client namespace disconnect': {
    isError: false,
    description:
      'The client has manually disconnected the socket using socket.disconnect()',
  },
  'server shutting down': {
    isError: false,
    description: 'The server is shutting down',
  },
  'ping timeout': {
    isError: false,
    description:
      'The client did not send a PONG packet in the pingTimeout delay',
  },
  'transport close': {
    isError: false,
    description:
      'The connection was closed (example: the user has lost connection, or the network was changed from WiFi to 4G)',
  },
  'transport error': {
    isError: true,
    description: 'The connection has encountered an error',
  },
  'parse error': {
    isError: true,
    description: 'The server has received an invalid packet from the client.',
  },
  'forced close': {
    isError: true,
    description: 'The server has received an invalid packet from the client.',
  },
  'forced server close': {
    isError: false,
    description:
      'The client did not join a namespace in time (see the connectTimeout option) and was forcefully closed.',
  },
}

// Taken from https://socket.io/docs/v4/client-socket-instance/#disconnect
const CLIENT_DISCONNECT_REASONS = {
  'io server disconnect': {
    isError: false,
    description:
      'The server has forcefully disconnected the socket with socket.disconnect()',
  },
  'io client disconnect': {
    isError: false,
    description:
      'The socket was manually disconnected using socket.disconnect()',
  },
  'ping timeout': {
    isError: false,
    description:
      'The server did not send a PING within the pingInterval + pingTimeout range',
  },
  'transport close': {
    isError: false,
    description:
      'The connection was closed (example: the user has lost connection, or the network was changed from WiFi to 4G)',
  },
  'transport error': {
    isError: true,
    description:
      'The connection has encountered an error (example: the server was killed during a HTTP long-polling cycle)',
  },
}

export const connectionEvents = [
  'connect',
  'disconnect',
  'client_reconnect',
  'client_reconnect_attempt',
  'client_connect_error',
  'client_reconnect_error',
  'client_connect',
  'client_disconnect',
  'leave',
  'join',
]

type SocketLogArg = {
  reason?: string
  error?: Error
  metadata?: { [key: string]: any }
}

export const logSocketConnectionInfo = (
  event: string,
  socket: SocketUser,
  args?: string | SocketLogArg
) => {
  const userId = socket.request.user?.id as Ulid
  let reason: string | undefined
  let error: Error | undefined
  let additionalMetadata: { [key: string]: any } | undefined

  if (typeof args === 'string') reason = args
  else if (typeof args === 'object' && args !== null) {
    reason = args.reason
    error = args.error
    additionalMetadata = args.metadata
  }

  const disconnectReason =
    (event === 'disconnect' || event === 'disconnection') && reason
      ? SERVER_DISCONNECT_REASONS[
          reason as keyof typeof SERVER_DISCONNECT_REASONS
        ]
      : event === 'client_disconnect' && reason
      ? CLIENT_DISCONNECT_REASONS[
          reason as keyof typeof CLIENT_DISCONNECT_REASONS
        ]
      : undefined

  try {
    const analyticsData = {
      eventName: event,
      disconnectReason: disconnectReason?.description,
      disconnectIsError: disconnectReason?.isError,
      errorMessage: error,
      error,
      user: {
        id: userId,
        roles: socket.request.user?.roles,
      },
      rooms: Array.from(socket.rooms),
      transport: socket.conn.transport.name,
      ...additionalMetadata,
      recovered: socket.recovered,
      socketId: socket.id,
    }
    const message = `Socket connection event: ${event}`
    disconnectReason?.isError || error?.message
      ? logger.error(analyticsData, message)
      : logger.info(analyticsData, message)
  } catch (err) {
    logger.error(
      err,
      `Failed to log socket connection info for userId=${userId}`
    )
  }
}
