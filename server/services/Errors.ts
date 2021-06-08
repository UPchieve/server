import { CustomError } from 'ts-custom-error'

// Define errors to be used across services
// Bad input type
export class InputError extends CustomError {}

// Failure to find expected object in db
export class LookupError extends CustomError {}

// Generic business logic failure
export class DomainError extends CustomError {}