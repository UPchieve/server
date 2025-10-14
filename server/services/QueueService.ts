import Queue, { JobOptions } from 'bull'
import { Queue as QueueMQ, QueueEvents, type JobProgress } from 'bullmq'
import { Jobs } from '../worker/jobs'
import Redis from 'ioredis'
import config from '../config'

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
})

export type AddJobOptions = JobOptions
export async function add(job: Jobs, data?: any, options?: AddJobOptions) {
  await queue.add(job, data, {
    removeOnFail: false,
    removeOnComplete: true,
    ...(options ?? {}),
  })
}

const connection = new Redis(config.redisConnectionString, {
  maxRetriesPerRequest: null,
})

export const QUEUE = 'main-mq'
// Create a new connection in every instance
// This is what we import when we want to add a new job
const queueMQ = new QueueMQ(QUEUE, { connection })
const queueEvents = new QueueEvents(QUEUE)

queueEvents.on(
  'completed',
  ({ jobId, returnvalue }: { jobId: string; returnvalue: any }) => {
    // Called every time a job is completed by any worker.
    console.log('queue completed', { jobId, returnvalue })
  }
)

queueEvents.on(
  'failed',
  ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
    // Called whenever a job is moved to failed by any worker.
    console.log('queue failed', { jobId, failedReason })
  }
)

queueEvents.on(
  'progress',
  ({ jobId, data }: { jobId: string; data: JobProgress }) => {
    console.log('queue progress', { jobId, data })
    // jobId received a progress event
  }
)

export async function addMQ(job: Jobs, data?: any, options?: any) {
  await queueMQ.add(job, data, {
    removeOnFail: false,
    removeOnComplete: false,
    ...(options ?? {}),
  })
}

export default {
  add,
  addMQ,
  queue,
  queueMQ,
}
