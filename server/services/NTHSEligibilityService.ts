import { CaughtError } from '../models/Errors'

export class NthsStudentConversionConfigurationError extends CaughtError {
  readonly httpStatus = 500
  readonly defaultClientMessage =
    'NTHS registration is unavailable because the at-large chapter is not configured.'

  constructor() {
    super({ message: 'The NTHS at-large chapter is not configured' })
  }
}

export class NthsStudentConversionEligibilityError extends CaughtError {
  readonly httpStatus = 403
  readonly defaultClientMessage =
    'You are not eligible for NTHS student conversion.'

  constructor(context: Record<string, unknown>) {
    super({
      message: 'User is not eligible for NTHS student conversion',
      context,
    })
  }
}
