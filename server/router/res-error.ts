import { CustomError } from 'ts-custom-error'
import { Response } from 'express'
import * as Sentry from '@sentry/node'
import {
  NotAllowedError,
  InputError,
  LookupError,
  NotAuthenticatedError,
  AlreadyInUseError,
  AlreadyInNTHSGroupError,
  CannotRemoveSoleNTHSAdminError,
  NTHSGroupNameTakenError,
  NTHSGroupAffiliationExistsError,
  NotAHighSchoolerNTHSJoinError,
} from '../models/Errors'
import { RegistrationError, ResetError } from '../utils/auth-utils'
import config from '../config'
import { StartSessionError } from '../utils/session-utils'
import logger, { logError } from '../logger'
import { ReportNoDataFoundError } from '../services/ReportService'
import { ExistingUserError } from '../services/EligibilityService'

export abstract class CaughtError extends CustomError {
  abstract readonly httpStatus: number
  abstract readonly clientMessage: string
  readonly context: Record<string, unknown>
  readonly cause?: unknown
  constructor(
    message: string,
    context: Record<string, unknown> = {},
    error?: unknown
  ) {
    super(message)
    this.context = context
    this.cause = error
  }
}

export function resError(
  res: Response,
  err: unknown | Error | CustomError | CaughtError,
  status?: number
): void {
  if (err instanceof CaughtError) {
    err.cause
      ? logger.error({ err: err.cause, ...err.context }, err.message)
      : logger.warn(err.context, err.message)
    res.status(status ?? err.httpStatus).json({ err: err.clientMessage })
    return
  }

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
    else if (err instanceof AlreadyInNTHSGroupError) status = 422
    else if (err instanceof NTHSGroupAffiliationExistsError) status = 422
    else if (err instanceof NTHSGroupNameTakenError) status = 422
    else if (err instanceof CannotRemoveSoleNTHSAdminError) status = 422
    else if (err instanceof NotAHighSchoolerNTHSJoinError) status = 422
    else if (err instanceof AlreadyInUseError) status = 409
    // response timeout
    else if (err.message === 'Response timeout') status = 408
    // unknown error
    else status = 500

    if (config.NODE_ENV === 'production' && status === 500) {
      Sentry.captureException(err)
      logError(err as Error)
    }

    res.status(status).json({
      err: message.length ? message : err.message,
    })
  } else {
    logger.error(err, 'Unexpected non-error type thrown')
    res.status(500)
  }
}
