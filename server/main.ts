import 'newrelic'
import { connect } from './db'
import initializeUnleash from './utils/initialize-unleash'
import rawConfig from './config'
import { Config } from './config-type'
import app from './app'
import logger from './logger'

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

  const port = process.env.PORT || 3000
  app.listen(port, () => {
    logger.info('api server listening on port ' + port)
  })
}

try {
  main()
} catch (err) {
  logger.error(err)
  process.exit(1)
}
