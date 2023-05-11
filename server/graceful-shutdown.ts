import 'newrelic'
import logger from './logger'
import { setTimeout } from 'timers/promises'
import { promisify } from 'util'
import { getConnections } from './server-setup'
import { Server } from 'http'
import { Server as SocketServer } from 'socket.io'
import { Pool } from 'pg'
import { client as phClient } from './posthog'

function gracefulShutdown(server: Server, pool: Pool, ioServer: SocketServer) {
  const shutDownSocketServer = promisify(ioServer.close).bind(ioServer)

  return async function(signal: string) {
    logger.info(`${signal} signal received`)
    // immediately stop accepting new connections to the server
    server.close(async err => {
      if (err) {
        logger.error(err as Error)
        process.exit(1)
      }
      logger.info('api server closed')

      await shutDownSocketServer()
      logger.info('socket server closed')

      await phClient.shutdownAsync()
      logger.info('shutting down posthog')

      // allow time for events to finish processing and making db calls before exiting
      await setTimeout(5000)
      await pool.end()
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
    // allow for existing connections to finish up their responses before forcibly closing them
    await setTimeout(500)
    getConnections().forEach(conn => conn.end())
    // destroy any running connections that may have not been ended
    await setTimeout(5000, () => {
      getConnections().forEach(conn => conn.destroy())
    })
  }
}

export function registerGracefulShutdownListeners(
  server: Server,
  pool: Pool,
  ioServer: SocketServer
) {
  const shutdown = gracefulShutdown(server, pool, ioServer)
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
  process.on('SIGQUIT', shutdown)
}
