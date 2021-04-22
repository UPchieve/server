import { CustomError } from 'ts-custom-error'

export class InvalidIdError extends CustomError {
  constructor() {
    super('user id is not in a valid mongodb id format')
  }
}

export class InvalidEmailError extends CustomError {
  constructor(email: string) {
    super(`${email} is not a valid email`)
  }
}

export class UserNotFoundError extends CustomError {
  constructor(attemptedParam, attemptedValue: string) {
    super(`user not found via parameter ${attemptedParam} and value ${attemptedValue}`)
  }
}

export class DocCreationError extends CustomError {
  constructor(message: string) {
    super(message)
  }
}
