import Queue from 'bull'
import newrelic from 'newrelic'
import Redis from 'ioredis'
import config from '../config'
import * as db from '../db'
import logger from '../logger'
import { addJobProcessors } from './jobs'

const main = async (): Promise<void> => {
  try {
    await db.connect()
    logger.info('Starting queue')
    const queue = new Queue(config.workerQueueName, {
      createClient: () =>
        new Redis(config.redisConnectionString, {
          // These must be included or else an exception will be thrown, starting in Bull 4.0.0.
          // See https://github.com/OptimalBits/bull/commit/3ade8e6727d7b906a30b09bccb6dc10d76ed1b5f
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
