import Queue from 'bull'
import Redis from 'ioredis'
import config from '../config'

const queue = new Queue(config.workerQueueName, {
  createClient: () => new Redis(config.redisConnectionString),
})

export default queue
