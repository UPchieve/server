import pino from 'pino'
import config from './config'
import newrelic from 'newrelic'
import { isDevEnvironment, isE2eEnvironment } from './utils/environments'

const logger =
  !isDevEnvironment() && !isE2eEnvironment()
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
