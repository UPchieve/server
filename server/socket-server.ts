/**
 * Creates the socket server and returns the Server instance
 */
import * as http from 'http'
import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-streams-adapter'
import config from './config'
import { redisClient } from './services/RedisService'
import SocketService from './services/SocketService'
import { instrument } from '@socket.io/admin-ui'
import { isDevEnvironment } from './utils/environments'
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from './types/socket-types'

export default function (server: http.Server) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    pingTimeout: 30000,
    cors: {
      origin: `${config.protocol}://${config.host}`,
      credentials: true,
    },
    // TODO(axellindsay): Monitor app versions and remove in about a month.
    allowEIO3: true,
    connectionStateRecovery: {
      // the backup duration of the sessions and the packets
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: false,
    },
    maxHttpBufferSize: 5e6, // 5 megabytes
  })
  // Set up Socket IO admin UI
  instrument(io, {
    mode:
      config.socketIOAdminUIMode === 'development'
        ? 'development'
        : 'production', // options are development or production
    readonly: config.socketIOAdminUIReadOnly,
    auth: !isDevEnvironment()
      ? {
          type: 'basic',
          username: config.socketIOAdminUsername,
          password: config.socketIOAdminPassword,
        }
      : false,
  })
  if (process.env.NODE_ENV === 'test') return io

  io.adapter(createAdapter(redisClient))
  // Instantiate the SocketService singleton
  SocketService.getInstance(io)
  return io
}
