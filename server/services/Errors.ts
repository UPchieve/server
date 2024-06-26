import { CustomError } from 'ts-custom-error'

export class FavoriteLimitReachedError extends CustomError {}

export class ProgressReportNotFoundError extends CustomError {}
