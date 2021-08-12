import { CustomError } from 'ts-custom-error'
import { Response } from 'express'
import * as Sentry from '@sentry/node'
import {
  DocUpdateError,
  NotAllowedError,
  InputError,
  LookupError
} from '../models/Errors'
import { RegistrationError, ResetError } from '../utils/auth-utils'
import config from '../config'
import { StartSessionError } from '../utils/session-utils'
import logger from '../logger'
import { ReportNoDataFoundError } from '../services/ReportService'

export function resError(
  res: Response,
  err: CustomError,
  status?: number
): void {
  logger.error(err)
  if (status) {
    /* keep provided status */
  }
  // user is authenthicated, but not authorized to retrieve resource
  else if (err instanceof NotAllowedError) status = 403
  // database lookup unexpectedly returned null
  else if (err instanceof LookupError) status = 422
  // business logic errors
  else if (err instanceof RegistrationError) status = 422
  else if (err instanceof ResetError) status = 422
  else if (err instanceof StartSessionError) status = 422
  else if (err instanceof ReportNoDataFoundError) status = 422
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
