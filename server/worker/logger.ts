import newrelic from 'newrelic'
import config from '../config'

// TODO: use pino
export function log(message: string): void {
  newrelic.recordLogEvent({
    message,
    level: config.logLevel,
  })
}

export function logError(
  error: Error,
  customAttributes?: { [key: string]: string | number | boolean }
): void {
  newrelic.noticeError(error, customAttributes)
}
