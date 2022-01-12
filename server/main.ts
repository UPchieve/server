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

  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received')
    server.close(err => {
      if (err) {
        logger.error(err as Error)
        process.exit(1)
      }
      logger.info('api server closed')

      // close the socket server
      io.close(async () => {
        logger.info('socket server closed')

        // allow time for events to finish processing and making db calls before exiting
        await setTimeout(1000 * 5)
        await dbConn.disconnect()
        process.exit(0)
      })
    })
  })
}

try {
  main()
} catch (err) {
  logger.error(err as Error)
  process.exit(1)
}
