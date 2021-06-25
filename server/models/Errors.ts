import { CustomError } from 'ts-custom-error'

export class UserNotFoundError extends CustomError {
  constructor(attemptedParam, attemptedValue: string) {
    super(
      `user not found via parameter ${attemptedParam} and value ${attemptedValue}`
    )
  }
}

export class DocCreationError extends CustomError {}

export class DocUpdateError extends CustomError {
  constructor(error, query, update) {
    super(
      `Document update error ${error.message} via query ${JSON.stringify(
        query
      )} and update ${JSON.stringify(update)}`
    )
  }
}

export class RepoCreateError extends CustomError {}
export class RepoReadError extends CustomError {}
export class RepoUpdateError extends CustomError {}
export class RepoDeleteError extends CustomError {}

export class NotAllowed extends CustomError {}
export class InputError extends CustomError {}
export class LookupError extends CustomError {}
