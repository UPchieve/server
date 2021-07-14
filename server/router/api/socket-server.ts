/**
 * Creates the socket server and returns the Server instance
 */
import * as http from 'http'
import socket from 'socket.io'
import redisAdapter from 'socket.io-redis'
import config from '../../config'
import logger from '../../logger'
const {
  socketIoPubClient,
  socketIoSubClient
} = require('../../services/RedisService')

// Create an HTTPS server if in production, otherwise use HTTP.
const createServer = app => {
  return http.createServer(app)
}

export default function(app) {
  const server = createServer(app)

  const port =
    process.env.NODE_ENV === 'test'
      ? // @todo: utilize the superagent port
        4000 + Math.floor(Math.random() * 5000) + 1
      : config.socketsPort

  server.listen(port)

  logger.info('socket.io listening on port ' + port)

  const io = socket(server, {
    // set pingTimeout longer than pingInterval
    // 60s used to be the default but they dropped it
    // in 3.0 they're increasing it again
    // (default interval is 25000)
    pingInterval: 25000,
    pingTimeout: 30000
  })
  if (process.env.NODE_ENV === 'test') return io

  io.adapter(
    redisAdapter({ pubClient: socketIoPubClient, subClient: socketIoSubClient })
  )
  return io
}
