import { CustomError } from 'ts-custom-error'
import { Response } from 'express'
import { CaughtError } from '../models/Errors'
import logger from '../logger'

export function resError(
  res: Response,
  err: unknown | Error | CustomError | CaughtError,
  status?: number
): void {
  if (err instanceof CaughtError) {
    err.cause
      ? logger.error(err.message, { err: err.cause, ...err.context })
      : logger.warn(err.message, err.context)
    const clientMessage = err.clientMessage ?? err.defaultClientMessage
    res.status(status ?? err.httpStatus).json({
      err: clientMessage,
      clientMessage,
      clientTitle: err.clientTitle,
      code: err.code,
    })
    return
  }

  if (err instanceof Error || err instanceof CustomError) {
    logger.error(err.message, { err })
    if (status) {
      /* keep provided status */
    }
    // response timeout
    else if (err.message === 'Response timeout') status = 408
    // unknown error
    else status = 500

    res.status(status).json({
      err: err.message,
    })
  } else {
    logger.error('Unexpected non-error type thrown', { err })
    res.status(500).json({ err: 'An unexpected error occurred.' })
  }
}
