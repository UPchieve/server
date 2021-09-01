// Db imports
// import mongoose from 'mongoose'
// import * as db from '../db'
/*
await db.connect()
await FooModel.FindOne(...).lean().exec()
mongoose.disconnect()
*/

// queue imports
// import Queue from 'bull'
// import Redis from 'ioredis'
// import config from '../config'
/*
const queue = new Queue(config.workerQueueName, {
  createClient: () => new Redis(config.redisConnectionString),
  settings: {
    stalledInterval: 1000 * 60 * 30,
    lockDuration: 1000 * 60 * 30
  }
})
*/

// cache imports
// import * as cache from '../cache'

async function main() {
  let exitCode = 0
  try {
    // Fill script here
    console.log('Doing stuff!')
  } catch (error) {
    console.log(`Uncaught error: ${error}`)
    exitCode = 1
  } finally {
    process.exit(exitCode)
  }
}

main()
