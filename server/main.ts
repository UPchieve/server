import 'newrelic'
import { connect } from './db'
import initializeUnleash from './utils/initialize-unleash'
import rawConfig from './config'
import { Config } from './config-type'
import app, { io } from './app'
import logger from './logger'
import { registerListeners } from './services/listeners'
import { Mongoose } from 'mongoose'
import { serverSetup } from './server-setup'
import { registerGracefulShutdownListeners } from './graceful-shutdown'

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

  // avoid conflict with development tools that allow for restarts when a file changes
  if (rawConfig.NODE_ENV !== 'dev') {
    serverSetup(server)
    registerGracefulShutdownListeners(server, dbConn, io)
  }
}

try {
  main()
} catch (err) {
  logger.error(err as Error)
  process.exit(1)
}
