import * as Sentry from '@sentry/node'
import pino from 'pino'
import config from './config'
import newrelic from 'newrelic'
import { isDevEnvironment, isE2eEnvironment } from './utils/environments'

// TODO: Update pino.
export const pinoLogger =
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

type LogContext = Record<string, unknown>
const logger = {
  debug(message: string, context: LogContext = {}) {
    pinoLogger.debug(context, message)
  },
  info(message: string, context: LogContext = {}) {
    pinoLogger.info(context, message)
  },
  warn(message: string, context: LogContext = {}) {
    pinoLogger.warn(context, message)
  },
  error(message: string, context: LogContext & { err: unknown }) {
    pinoLogger.error(context, message)
    const { err, ...attributes } = context
    newrelic.noticeError(
      err as Error,
      attributes as Record<string, string | number | boolean>
    )
    Sentry.captureException(err, { extra: attributes })
  },
}

// TODO: Consolidate into one logger file
// TODO: Remove in favour of `logger.error`.
export function logError(
  error: Error,
  customAttributes?: { [key: string]: string | number | boolean }
): void {
  newrelic.noticeError(error, customAttributes)
}

export default logger
