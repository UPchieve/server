import { jobProcessorsMQ } from '../worker/jobs'
import newrelic from 'newrelic'
import logger from '../logger'
import { Worker, type Job } from 'bullmq'
import Redis from 'ioredis'
import config from '../config'
import { QUEUE } from '../services/QueueService'

// example
/*
await mainMQ.add(
  'paint',
  { color: 'red' },
  {
    // after 100 completes, remove the oldest
    // this could also be true or false
    removeOnComplete: 100,
    removeOnFail: 100

    // alternatively, remove based on age

    removeOnComplete: {
      age: 3600, // keep up to 1 hour
      count: 1000, // keep up to 1000 jobs <- we want both in case we get a ton all at once
    },
  }
)
// bulk add is an option if we need it
const jobs = await queue.addBulk([
  { name, data: { paint: 'car' } },
  { name, data: { paint: 'house' } },
  { name, data: { paint: 'boat' } },
]);
*/
const connection = new Redis(config.redisConnectionString, {
  maxRetriesPerRequest: null,
})

// Create a new worker for every job type
const addJobProcessors = (queue: string): void => {
  try {
    for (const jobProcessor of jobProcessorsMQ) {
      const w = new Worker(
        queue,
        async (job) => {
          await newrelic.startBackgroundTransaction(
            `job:${job.name}`,
            async () => {
              const transaction = newrelic.getTransaction()
              logger.info(`Processing job: ${job.name}`)
              try {
                await jobProcessor.processor(job)
                logger.info(`Completed job: ${job.name}`)
              } catch (error) {
                throw error
              } finally {
                transaction.end()
              }
            }
          )
        },
        {
          connection,
        }
      )
      w.on('error', (error) => {
        console.log('worker error', error)
      })
      w.on('drained', () => {
        // Queue is drained, no more jobs left
        console.log('worker drained')
      })

      w.on('completed', (job: Job) => {
        // job has completed
        console.log('worker completed', job)
      })

      w.on('failed', (job: Job | undefined, error: any) => {
        // job has failed
        console.log('worker failed', { job, error })
      })
    }
  } catch (error) {
    logger.error(error, `Error adding job processors`)
  }
}

addJobProcessors(QUEUE)
