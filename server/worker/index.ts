import newrelic from 'newrelic'
import * as db from '../db'
import logger from '../logger'
import { addJobProcessors } from './jobs'
import { registerListeners } from '../services/listeners'
import QueueService from '../services/QueueService'

const main = async (): Promise<void> => {
  try {
    await db.connect()
    logger.info('Starting queue')
    const queue = QueueService.queue

    addJobProcessors(queue)
    registerListeners()
  } catch (error) {
    newrelic.noticeError(error as Error)
    // handle redis connection errors; for whatever reason Redis.ReplyError type is not in the declarations file
    if ((error as any).code === 'ECONNREFUSED') {
      logger.error(
        error,
        `Could not connect to redis server; Check your redisConnectionString env var`
      )
    } else {
      logger.error(error, `Error from worker process`)
    }
  }
}

main().catch((error) => {
  logger.error(`error in worker main: ${error}`)
  newrelic.noticeError(error)
})
