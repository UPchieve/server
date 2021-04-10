/**
 * Creates the socket server and returns the Server instance
 */
import * as http from 'http'
import socket from 'socket.io'
import redisAdapter from 'socket.io-redis'
import config from '../../config'
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
      ? 4000 + Number(process.env.JEST_WORKER_ID)
      : config.socketsPort

  server.listen(port)

  console.log('Sockets.io listening on port ' + port)

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
