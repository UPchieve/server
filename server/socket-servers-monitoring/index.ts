import { createAdapter } from '@socket.io/redis-streams-adapter'
import { createServer } from 'http'
import newrelic from 'newrelic'
import { Server } from 'socket.io'
import logger from '../logger'
import { redisClient } from '../services/RedisService'

const FIVE_MINUTES_IN_MS = 5 * 60 * 1000

async function main() {
  const httpServer = createServer()
  const io = new Server(httpServer, {
    adapter: createAdapter(redisClient),
  })

  setInterval(() => {
    io.serverSideEmit('ping', (err: Error, response: string[]) => {
      if (err) {
        logger.error(
          `Error in ping callback (received ${response.length} responses): ${err}`
        )
        newrelic.noticeError(err)
        return
      }

      if (response.length < 1) {
        logger.error('Socket servers are not communicating!!')
      }
      logger.info(response, `Ping response length is: ${response.length}`)
    })
  }, FIVE_MINUTES_IN_MS)

  logger.info('Socket Servers Monitoring ping interval set.')
}

try {
  main()
} catch (err) {
  logger.error(`Error in socket-servers-monitoring main: ${err}`)
  newrelic.noticeError(err as Error)
}
