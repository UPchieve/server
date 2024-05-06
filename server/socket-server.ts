/**
 * Creates the socket server and returns the Server instance
 */
import * as http from 'http'
import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import config from './config'
import logger from './logger'
import { socketIoPubClient, socketIoSubClient } from './services/RedisService'
import { Express } from 'express'
import SocketService from './services/SocketService'
import { instrument } from '@socket.io/admin-ui'
import { isDevEnvironment } from './utils/environments'

// Create an HTTPS server if in production, otherwise use HTTP.
const createServer = (app: Express) => {
  return http.createServer(app)
}

export default function(app: Express) {
  const server = createServer(app)

  const port =
    process.env.NODE_ENV === 'test'
      ? // TODO: utilize the superagent port
        4000 + Math.floor(Math.random() * 5000) + 1
      : config.socketsPort

  server.listen(port)

  logger.info('socket.io listening on port ' + port)

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
