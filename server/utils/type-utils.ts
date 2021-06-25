import { Types } from 'mongoose'
import { InputError } from '../models/Errors'

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

// Use via asArray(asPrimitive)
export function asArray<T>(as: (s: unknown, errMsg?: string) => T) {
  return function(s: unknown, errMsg?: string): T[] | undefined {
    if (Array.isArray(s)) {
      const maybeT = s as T[]
      if (maybeT.every(item => as(item, errMsg))) return maybeT as T[]
    } else
      throw new InputError(`${errMsg} :${s} is not an array of the given type`)
  }
}

export function asDate(s: unknown, errMsg?: string): Date {
  if (s instanceof Date) return s as Date
  throw new InputError(`${errMsg} :${s} is not a Date`)
}

export function asFunction(s: unknown, errMsg?: string): Function {
  if (typeof s === 'function') return s as Function
  throw new InputError(`${errMsg} :${s} is not a function`)
}

export function asObjectId(s: unknown, errMsg?: string): Types.ObjectId {
  if (s instanceof Types.ObjectId) return s as Types.ObjectId
  throw new InputError(`${errMsg} :${s} is not an ObjectId`)
}

/**
 * asEnum<T>(enum)
 * example usage: asEnum<USER_BAN_REASON>(USER_BAN_REASON)
 *
 * @todo: create better usage -> asEnum<USER_BAN_REASON>(USER_BAN_REASON.ADMIN)
 **/
export function asEnum<T>(e: unknown) {
  return function(s: unknown, errMsg?: string) {
    for (const value of Object.values(e)) {
      if (value === s) return s as T
    }
    throw new InputError(`${errMsg} :${s} is not a type of the given enum`)
  }
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

// @note: proof of concept
export function asUnion<T>(fns: ((s: unknown, errMsg?: string) => T)[]) {
  return function(s: unknown, errMsg?: string) {
    if (Array.isArray(fns)) {
      const errors = []
      const isUnion = false
      for (const fn of fns) {
        try {
          const maybeT = fn(s, errMsg)
          return maybeT
        } catch (error) {
          errors.push(error)
        }
      }
      if (!isUnion) throw new Error(errors.join(', '))
    } else
      throw new InputError(`${errMsg} :${fns} is not an array of validators`)
  }
}
