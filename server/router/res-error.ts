import { CustomError } from 'ts-custom-error'
import { Response } from 'express'
import * as Sentry from '@sentry/node'
import {
  NotAllowedError,
  InputError,
  LookupError,
  NotAuthenticatedError,
  AlreadyInUseError,
} from '../models/Errors'
import { RegistrationError, ResetError } from '../utils/auth-utils'
import config from '../config'
import { StartSessionError } from '../utils/session-utils'
import logger from '../logger'
import { ReportNoDataFoundError } from '../services/ReportService'
import { ExistingUserError } from '../services/EligibilityService'

export function resError(
  res: Response,
  err: unknown | Error | CustomError,
  status?: number
): void {
  let message = ''

  if (err instanceof Error || err instanceof CustomError) {
    logger.error(err as any)
    if (status) {
      /* keep provided status */
    }
    // user is not authenticated
    else if (err instanceof NotAuthenticatedError) status = 401
    // user is authenthicated, but not authorized to retrieve resource
    else if (err instanceof NotAllowedError) status = 403
    // database lookup unexpectedly returned null
    else if (err instanceof LookupError) status = 422
    // business logic errors
    else if (err instanceof RegistrationError) status = 422
    else if (err instanceof ResetError) status = 422
    else if (err instanceof StartSessionError) status = 422
    else if (err instanceof ReportNoDataFoundError) status = 422
    else if (err instanceof ExistingUserError) {
      status = 422
      message = 'Email already in use'
    }
    // bad input
    else if (err instanceof InputError) status = 422
    else if (err instanceof AlreadyInUseError) status = 409
    // unknown error
    else status = 500

    if (config.NODE_ENV === 'production' && status === 500)
      Sentry.captureException(err)

    res.status(status).json({
      err: message || err.message,
    })
  } else {
    logger.error(`Unexpected non-error type thrown: ${err as any}`)
    res.status(500)
  }
}
