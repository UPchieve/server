/**
 * Creates the socket server and returns the Server instance
 */
import * as http from 'http'
import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import config from './config'
import { socketIoPubClient, socketIoSubClient } from './services/RedisService'
import SocketService from './services/SocketService'
import { instrument } from '@socket.io/admin-ui'
import { isDevEnvironment } from './utils/environments'

export default function(server: http.Server) {
  const io = new Server(server, {
    pingTimeout: 30000,
    cors: {
      origin: new RegExp(`^(${config.host})$`),
      credentials: true,
    },
    cookie: {
      name: 'subway-io',
      httpOnly: false,
    },
    allowEIO3: true,
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

  io.adapter(createAdapter(socketIoPubClient, socketIoSubClient))
  // Instantiate the SocketService singleton
  SocketService.getInstance(io)
  return io
}
