import pino from 'pino'
import config from './config'
import newrelic from 'newrelic'

const logger =
  config.NODE_ENV !== 'dev'
    ? pino({
        level: config.logLevel,
      })
    : pino({
        level: config.logLevel,
        transport: {
          target: 'pino-pretty',
        },
      })

// TODO: Consolidate into one logger file
export function logError(
  error: Error,
  customAttributes?: { [key: string]: string | number | boolean }
): void {
  newrelic.noticeError(error, customAttributes)
}

export default logger
