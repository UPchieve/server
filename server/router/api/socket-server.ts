/**
 * Creates the socket server and returns the Server instance
 */
import * as http from 'http'
import { createAdapter } from 'socket.io-redis'
import * as socket from 'socket.io'
import config from '../../config'
import logger from '../../logger'
import {
  socketIoPubClient,
  socketIoSubClient
} from '../../services/RedisService'

// Create an HTTPS server if in production, otherwise use HTTP.
const createServer = app => {
  return http.createServer(app)
}

export default function(app) {
  const httpServer = createServer(app)

  const port =
    process.env.NODE_ENV === 'test'
      ? // @todo: utilize the superagent port
        4000 + Math.floor(Math.random() * 5000) + 1
      : config.socketsPort

  httpServer.listen(port)

  logger.info('socket.io listening on port ' + port)

  const io = new socket.Server(httpServer, {
    // set pingTimeout longer than pingInterval
    // 60s used to be the default but they dropped it
    // in 3.0 they're increasing it again
    // (default interval is 25000)
    // explicitly enabling cookie, setting maxHttpBufferSize to 1e8 and switching parser
    pingInterval: 25000,
    pingTimeout: 30000,
    cookie: true,
    maxHttpBufferSize: 1e8,
    allowEIO3: true, // false by default
    cors: {
      origin:
        config.NODE_ENV === 'dev'
          ? ['localhost:3000', 'localhost:3001']
          : config.host,
      credentials: false,
      exposedHeaders: config.NODE_ENV === 'dev' ? ['Date'] : undefined
    }
  })

  if (process.env.NODE_ENV === 'test') return io

  // TO CHECK
  io.adapter(
    createAdapter({
      pubClient: socketIoPubClient,
      subClient: socketIoSubClient
    })
  )
  return io
}
