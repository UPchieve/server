import './instrument'

import config from './config'
import { io, server } from './app'
import logger from './logger'
import { registerListeners } from './services/listeners'
import { serverSetup } from './server-setup'
import { registerGracefulShutdownListeners } from './graceful-shutdown'
import { getClient, setupDbConnection } from './db'

async function main() {
  await setupDbConnection()
  registerListeners()

  const port = config.apiPort
  server.listen(port, () => {
    logger.info('api server listening on port ' + port)
  })

  // avoid conflict with development tools that allow for restarts when a file changes
  if (config.NODE_ENV !== 'dev') {
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
