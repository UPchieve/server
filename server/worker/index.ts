import Queue from 'bull'
import newrelic from 'newrelic'
import Redis from 'ioredis'
import config from '../config'
import * as db from '../db'
import initializeUnleash from '../utils/initialize-unleash'
import logger from '../logger'
import { addJobProcessors } from './jobs'

const main = async (): Promise<void> => {
  try {
    initializeUnleash()
    await db.connect()
    logger.info('Starting queue')
    const queue = new Queue(config.workerQueueName, {
      createClient: () => new Redis(config.redisConnectionString),
      settings: {
        // to prevent stalling long jobs
        stalledInterval: 1000 * 60 * 30,
        lockDuration: 1000 * 60 * 30
      }
    })
    queue.on('error', error => {
      logger.error(`error in queue: ${error}`)
      newrelic.noticeError(error)
    })
    addJobProcessors(queue)
  } catch (error) {
    newrelic.noticeError(error)
    if (error.code === 'ECONNREFUSED') {
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
