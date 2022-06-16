import Queue from 'bull'
import newrelic from 'newrelic'
import Redis from 'ioredis'
import config from '../config'
import * as db from '../db'
import { initializeUnleash } from '../services/FeatureFlagService'
import logger from '../logger'
import { addJobProcessors } from './jobs'
import { startSocket } from './sockets'

const main = async (): Promise<void> => {
  try {
    initializeUnleash()
    await db.connect()
    logger.info('Starting queue')
    const queue = new Queue(config.workerQueueName, {
      createClient: () =>
        new Redis(config.redisConnectionString, {
          /**
           *
           * `enableReadyCheck: false` and `maxRetriesPerRequest: null` are defaults introduced in bull v4.0
           * that allow for the queue to continue processing jobs after Redis reconnects. Without these options,
           * jobs are stuck and not processed by the queue once Redis reconnects.
           * The only solution when that happens is to restart the queue manually.
           *
           * You can read more about the reconnection issue and bull solution here:
           * https://github.com/OptimalBits/bull/issues/890#issuecomment-430645188
           *
           *
           * TODO: remove `enableReadyCheck` and `maxRetriesPerRequest` options once our version of `bull` is upgraded to v4.0+
           *
           */
          enableReadyCheck: false,
          maxRetriesPerRequest: null,
        }),
      settings: {
        // to prevent stalling long jobs
        stalledInterval: 1000 * 60 * 30,
        lockDuration: 1000 * 60 * 30,
      },
    })
    queue.on('error', error => {
      logger.error(`error in queue: ${error}`)
      newrelic.noticeError(error)
    })
    startSocket()
    addJobProcessors(queue)
  } catch (error) {
    newrelic.noticeError(error as Error)
    // handle redis connection errors; for whatever reason Redis.ReplyError type is not in the declarations file
    if ((error as any).code === 'ECONNREFUSED') {
      logger.error(
        `could not connect to redis server: ${config.redisConnectionString}`
      )
    } else {
      logger.error(`error from worker process: ${error}`)
    }
  }
}

main().catch(error => {
  logger.error(`error in worker main: ${error}`)
  newrelic.noticeError(error)
})
