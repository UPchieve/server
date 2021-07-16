/**
 * Creates the socket server and returns the Server instance
 */
import * as http from 'http'
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

  /// /only works with require("socket.io") and not if replaced with socket ??
  const io = require('socket.io')(server, {
    // set pingTimeout longer than pingInterval
    // 60s used to be the default but they dropped it
    // in 3.0 they're increasing it again
    // (default interval is 25000)
    // explicitly enabling cookie, setting maxHttpBufferSize to 1e8 and switching parser
    pingInterval: 25000,
    pingTimeout: 30000,
    cookie: true,
    parser: require('socket.io-msgpack-parser'),
    maxHttpBufferSize: 1e8,
    allowEIO3: true // false by default
  })
  if (process.env.NODE_ENV === 'test') return io

  // only works with require("socket.io-redis") and not if replaced with redisAdapter
  io.adapter(
    require('socket.io-redis')({
      pubClient: socketIoPubClient,
      subClient: socketIoSubClient
    })
  )
  return io
}
