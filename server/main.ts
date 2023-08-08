import 'newrelic'
import rawConfig from './config'
import { Config } from './config-type'
import app, { io } from './app'
import logger from './logger'
import { registerListeners } from './services/listeners'
import { serverSetup } from './server-setup'
import { registerGracefulShutdownListeners } from './graceful-shutdown'
import { unleashProxy, initializeUnleash } from './services/FeatureFlagService'
import { getClient, setupDbConnection } from './db'

async function main() {
  try {
    Config.check(rawConfig)
  } catch (err) {
    throw new Error(`error parsing config on startup: ${err}`)
  }

  initializeUnleash()
  unleashProxy.listen(rawConfig.featureFlagPort, () => {
    logger.info(
      'feature flag proxy listening on port ' + rawConfig.featureFlagPort
    )
  })

  await setupDbConnection()
  registerListeners()

  const port = rawConfig.apiPort
  const server = app.listen(port, () => {
    logger.info('api server listening on port ' + port)
  })

  // avoid conflict with development tools that allow for restarts when a file changes
  if (rawConfig.NODE_ENV !== 'dev') {
    serverSetup(server)
    registerGracefulShutdownListeners(server, getClient(), io)
  }
}

try {
  main()
} catch (err) {
  logger.error(err as Error)
  process.exit(1)
}
