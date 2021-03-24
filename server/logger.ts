import pino from 'pino'
import { Types } from 'mongoose'
import config from './config'
import { Jobs } from './worker/jobs'

export interface LogEmailJob {
  job: Jobs
  userId: Types.ObjectId | string
  userType?: string
  error?: Error
}

function newLogger() {
  let logger

  if (config.NODE_ENV === 'dev') {
    logger = pino({
      prettyPrint: {
        colorize: true
      },
      level: 'debug'
    })
  } else {
    logger = pino({
      level: config.logLevel
    })
  }

  return logger
}

const logger = newLogger()

export const logEmailJobSent = ({
  job,
  userId,
  userType = 'user'
}: LogEmailJob) => logger.info(`Sent ${job} to ${userType} ${userId}`)

export const logEmailJobError = ({
  job,
  userId,
  userType = 'user',
  error
}: LogEmailJob) =>
  logger.error(`Failed to send ${job} to ${userType} ${userId}: ${error}`)

export default logger
