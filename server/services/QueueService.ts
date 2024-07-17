import Queue from 'bull'
import Redis from 'ioredis'
import config from '../config'

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
})

export default queue
