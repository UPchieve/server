import { backOff } from 'exponential-backoff'
import logger from './logger'
import config from './config'
import mongoose from 'mongoose'

export async function connect() {
  const connectAction = async () =>
    mongoose.connect(config.database, {
      poolSize: 5,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
  return backOff(connectAction, {
    jitter: 'full',
    maxDelay: 2000,
    numOfAttempts: 10,
    retry: (e: any, attemptNumber: number) => {
      logger.error(
        `database connection attempt ${attemptNumber} failed, retrying`
      )
      return true
    },
  })
}

mongoose.connection.on('connecting', () => {
  logger.info('connecting to database')
})
mongoose.connection.on('disconnected', () => {
  logger.error('lost database connection to every member of mongo cluster')
})
mongoose.connection.on('reconnected', () => {
  logger.info('re-established database connection to at least one server')
})
mongoose.connection.on('error', (err: Error) => {
  logger.error(`mongo database error: ${err}`)
})
mongoose.connection.on('connected', function() {
  logger.info('connected to database')
})
mongoose.connection.on('fullsetup', () => {
  logger.info('connected to both a primary and secondary mongo set')
})
