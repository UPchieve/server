import Queue, { JobOptions } from 'bull'
import Redis from 'ioredis'
import config from '../config'
import { Jobs } from '../worker/jobs'
import logger from '../logger'

export const queue = new Queue(config.workerQueueName, {
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

queue.on('error', (error) => {
  logger.error(error, `error in queue`)
})
queue.on('stalled', (job) => {
  logger.info({ job: job.name }, 'Worker job stalled.')
})
queue.on('lock-extension-failed', (job, error) => {
  logger.error(error, { job: job.name }, 'Worker job failed to extend lock.')
})
queue.on('cleaned', (jobs, type) => {
  logger.info({ jobs, type }, 'Worker jobs cleaned from queue.')
})

export type AddJobOptions = JobOptions
export async function add(job: Jobs, data?: any, options?: AddJobOptions) {
  await queue.add(job, data, {
    removeOnFail: false,
    removeOnComplete: false,
    ...(options ?? {}),
  })
}

export default {
  add,
  queue,
}
