import { CustomError } from 'ts-custom-error'
import { Response } from 'express'
import Sentry from '@sentry/node'
import { DocUpdateError } from '../models/Errors'
import { RegistrationError, ResetError } from '../utils/auth-utils'
import { InputError, LookupError } from '../utils/type-utils'
import config from '../config'
import { StartSessionError } from '../utils/session-utils'
import logger from '../logger'

export function resError(
  res: Response,
  err: CustomError,
  status?: number
): void {
  logger.error(err)
  if (status) {
    /* keep provided status */
  }
  // database lookup returned null
  else if (err instanceof LookupError) status = 409
  // business logic errors
  else if (err instanceof RegistrationError) status = 422
  else if (err instanceof ResetError) status = 422
  else if (err instanceof StartSessionError) status = 422
  // bad input
  else if (err instanceof InputError) status = 422
  // database update error
  else if (err instanceof DocUpdateError) status = 500
  // unknown error
  else status = 500

  if (config.NODE_ENV === 'production' && status === 500)
    Sentry.captureException(err)

  res.status(status).json({
    err: err.message
  })
}
