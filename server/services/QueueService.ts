import Queue from 'bull'
import Redis from 'ioredis'
import config from '../config'

const queue = new Queue(config.workerQueueName, {
  createClient: () =>
    new Redis(config.redisConnectionString, {
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    }),
})

export default queue
