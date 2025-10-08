import Queue from 'bull'
import newrelic from 'newrelic'
import Redis from 'ioredis'
import config from '../config'
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
    queue.on('error', (error) => {
      logger.error(`error in queue: ${error}`)
      newrelic.noticeError(error)
    })
    queue.on('stalled', (job) => {
      logger.info({ job: job.name }, 'Worker job stalled.')
    })
    queue.on('lock-extension-failed', (job, err) => {
      logger.error({ err, job: job.name }, 'Worker job failed to extend lock.')
    })
    queue.on('cleaned', (jobs, type) => {
      logger.info({ jobs, type }, 'Worker jobs cleaned from queue.')
    })

    addJobProcessors(queue)
    registerListeners()
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

main().catch((error) => {
  logger.error(`error in worker main: ${error}`)
  newrelic.noticeError(error)
})
