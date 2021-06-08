import { CustomError } from 'ts-custom-error'
import { Response } from 'express'
import Sentry from '@sentry/node'
import { InputError, LookupError } from '../services/Errors'
import config from '../config'

// Define errors to be used across routers
// Route requires authentication
export class AuthenticationError extends CustomError {}
// Route requires admin status
export class AdminError extends CustomError {}
// Missing fields
export class RequestError extends CustomError {}

// Generic router middleware error handler
// @todo: refactor router to actually use this as middleaare without epxlicit invocation
export function errorHandler(res: Response, err: CustomError, status?: number): void {
  if (status) {
    /* keep provided status */
  }
  else if (err instanceof AuthenticationError) status = 401
  else if (err instanceof AdminError) status = 403
  else if (err instanceof RequestError) status = 400
  else if (err instanceof InputError) status = 422
  else if (err instanceof LookupError) status = 409
  // unknown error
  else status = 500

  if (config.NODE_ENV === 'production' && status === 500)
    Sentry.captureException(err)

  res.status(status).json({
    err: err.message
  })
}