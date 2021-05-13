import { CustomError } from 'ts-custom-error'

// TODO: put this somewhere shared
export class InputError extends CustomError {}
export class LookupError extends CustomError {}

// Typecheck framework taken from https://stackoverflow.com/a/58861766
// TODO: test primitive typechecks and factory function

// Use via asOptional(asPrimitive)
export function asOptional<T>(as: (s: unknown, errMsg?: string) => T) {
  return function(s: unknown, errMsg?: string): T | undefined {
    if (s === undefined || s === null) return s
    return as(s, errMsg)
  }
}

// Primitive typechecks
export function asString(s: unknown, errMsg = ''): string {
  if (typeof s === 'string') return s as string
  throw new InputError(`${errMsg} ${s} is not a string`)
}

export function asNumber(s: unknown, errMsg?: string): number {
  if (typeof s === 'number') return s as number
  throw new InputError(`${errMsg} :${s} is not a number`)
}

export function asBoolean(s: unknown, errMsg?: string): boolean {
  if (typeof s === 'boolean') return s as boolean
  throw new InputError(`${errMsg} :${s} is not a boolean`)
}

type KeyValidators<T> = {
  [P in keyof T]-?: (s: unknown, errMsg?: string) => T[P]
}

/**
 * Typecheck Factory use:
 *
 * interface Foo {
 *     bar: string,
 *     baz?: number
 * }
 * interface Fizz {
 *     buzz: Foo
 * }
 *
 * const asFoo = asFactory<Foo>({
 *     bar: asString,
 *     baz: asOptional(asNumber)
 * })
 *
 * const asFizz = asFactory<Fizz>({
 *     buzz: asFoo
 * })
 */
export function asFactory<T extends object>(keyValidators: KeyValidators<T>) {
  return function(data: unknown, errMsg = ''): T {
    if (typeof data === 'object' && data !== null) {
      const maybeT = data as T
      for (const key of Object.keys(keyValidators) as Array<keyof T>) {
        keyValidators[key](maybeT[key], errMsg + key + ':')
      }
      return maybeT
    }
    throw new InputError(`${errMsg}: data is not compatible with type`)
  }
}
