import Queue from 'bull'
import Redis from 'ioredis'
import config from '../config'

const queue = new Queue(config.workerQueueName, {
  createClient: () =>
    new Redis(config.redisConnectionString, {
      // These must be included or else an exception will be thrown, starting in Bull 4.0.0.
      // See https://github.com/OptimalBits/bull/commit/3ade8e6727d7b906a30b09bccb6dc10d76ed1b5f
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    }),
})

export default queue
