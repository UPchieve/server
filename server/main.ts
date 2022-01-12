import 'newrelic'
import app, { io } from './app'
import rawConfig from './config'
import { Config } from './config-type'
import { connect } from './db'
import logger from './logger'
import { registerListeners } from './services/listeners'
import initializeUnleash from './utils/initialize-unleash'

async function main() {
  try {
    Config.check(rawConfig)
  } catch (err) {
    throw new Error(`error parsing config on startup: ${err}`)
  }

  initializeUnleash()

  try {
    await connect()
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
    console.log('SIGTERM signal received.')
    server.close(() => {
      console.log('Http server closed.')

      // TODO: close mongoose connection

      // close the socket server
      // TODO: check if closing the socket server also disconnect the connected sockets
      io.close()
    })
  })
}

try {
  main()
} catch (err) {
  logger.error(err as Error)
  process.exit(1)
}
