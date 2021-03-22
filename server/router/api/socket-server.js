/**
 * Creates the socket server and returns the Server instance
 */
const http = require('http')
const socket = require('socket.io')
const redisAdapter = require('socket.io-redis')
const config = require('../../config')

// Create an HTTPS server if in production, otherwise use HTTP.
const createServer = app => {
  return http.createServer(app)
}

module.exports = function(app) {
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
    pingTimeout: 30000,
    // we're shifting to only using websockets
    // no http long-polling
    allowUpgrades: false,
    transports: ['websocket']
  })
  if (process.env.NODE_ENV === 'test') return io

  const redisUrl = new URL(config.redisConnectionString)
  io.adapter(redisAdapter({ host: redisUrl.hostname, port: redisUrl.port }))
  return io
}
