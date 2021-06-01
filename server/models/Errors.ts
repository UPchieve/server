import { CustomError } from 'ts-custom-error'

export class UserNotFoundError extends CustomError {
  constructor(attemptedParam, attemptedValue: string) {
    super(
      `user not found via parameter ${attemptedParam} and value ${attemptedValue}`
    )
  }
}

export class DocCreationError extends CustomError {}

export class RepoCreateError extends CustomError {}
export class RepoReadError extends CustomError {}
export class RepoUpdateError extends CustomError {}
export class RepoDeleteError extends CustomError {}
