import 'newrelic'
import { connect } from './db'
import initializeUnleash from './utils/initialize-unleash'
import rawConfig from './config'
import { Config } from './config-type'
import app, { io } from './app'
import logger from './logger'
import { registerListeners } from './services/listeners'
import { setTimeout } from 'timers/promises'
import { Mongoose } from 'mongoose'
import { Socket } from 'net'
import { promisify } from 'util'

async function main() {
  try {
    Config.check(rawConfig)
  } catch (err) {
    throw new Error(`error parsing config on startup: ${err}`)
  }

  initializeUnleash()

  let dbConn: Mongoose
  try {
    dbConn = await connect()
  } catch (err) {
    throw new Error(
      `db connection failed after backoff attempts, exiting: ${err}`
    )
  }

  registerListeners()

  const port = process.env.PORT || 3000
  const server = app.listen(port, () => {
    logger.info('api server listening on port ' + port)
  })
  const shutDownSocketServer = promisify(io.close).bind(io)

  let connections: Socket[] = []

  server.on('connection', connection => {
    connections.push(connection)
    connection.on(
      'close',
      () => (connections = connections.filter(curr => curr !== connection))
    )
  })

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received')
    // immediately stop accepting new connections to the server
    server.close(async err => {
      if (err) {
        logger.error(err as Error)
        process.exit(1)
      }
      logger.info('api server closed')

      await shutDownSocketServer()
      logger.info('socket server closed')

      // allow time for events to finish processing and making db calls before exiting
      await setTimeout(5000)
      await dbConn.disconnect()
      process.exit(0)
    })

    /**
     *
     * The API server doesn't close until all connections are closed. When we
     * call `server.close()` above, we stop receiving new connections, but the
     * remaining connections are open indefinitely because of keep-alive connections.
     * In order to close the server, we have to terminate those remaining connections ourselves.
     *
     */
    connections.forEach(conn => conn.end())
    // destroy any running connections that may have not been ended
    await setTimeout(5000, () => {
      connections.forEach(conn => conn.destroy())
    })
  })
}

try {
  main()
} catch (err) {
  logger.error(err as Error)
  process.exit(1)
}
