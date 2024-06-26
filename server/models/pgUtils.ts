import _ from 'lodash'
import { Ulid as ULID } from 'id128'
import { v4 as UUID } from 'uuid'
import { CustomError } from 'ts-custom-error'
import base64url from 'base64url'

export function generateReferralCode(userId: Ulid): string {
  return base64url(Buffer.from(userId, 'hex'))
}

/**
 * pgTyped DOES NOT actually modify the incoming data to use camelCase keys even
 * though it does do so for the return type. As such we must manually convert the
 * keys to camelCase at runtime. This function is invoked at the start of
 * makeRequired and makeSomeOptional which themselves are necessary for parsing
 * incoming postgres data to convert null->undefined and, with the inclusion of
 * this function, convert snake_case keys to camelCase keys.
 *
 * Note that the below types/functions only work for flat objects, i.e. no
 * arrays or nesting. With SQL queries this should fit the return type anyways
 */
function camelCaseKeys(obj: any): any {
  const temp: any = {}
  for (const key in obj) {
    temp[_.camelCase(key)] = obj[key]
  }
  return temp
}

export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? true
  : false
type Filter<KeyType, ExcludeType> = Equals<KeyType, ExcludeType> extends true
  ? never
  : KeyType extends ExcludeType
  ? never
  : KeyType

type Required<T> = T extends null ? never : T extends undefined ? never : T
type SetRequired<BaseType, Keys extends keyof BaseType> = BaseType &
  { [K in Keys]: Required<BaseType[K]> }

type NullToUndefined<T> = T extends null ? undefined : T
type Optional<T> = NullToUndefined<T> | undefined
type SetOptional<BaseType, Keys extends keyof BaseType> = {
  [K in Filter<keyof BaseType, Keys>]: NullToUndefined<BaseType[K]>
} &
  { [K in Keys]: Optional<BaseType[K]> }

class UnexpectedNullError extends CustomError {}
export function makeRequired<T>(obj: T): SetRequired<T, keyof T> {
  const temp = camelCaseKeys(obj)
  for (const [key, value] of Object.entries(temp)) {
    if (value === null || value === undefined) {
      throw new UnexpectedNullError(
        `Key ${key} was unexpectedly null or undefined`
      )
    }
  }
  return temp as SetRequired<T, keyof T>
}

type ObjectLike = { [k: string]: any }
export function makeSomeOptional<T extends ObjectLike, U extends keyof T>(
  obj: T,
  optionals: U[]
): SetOptional<SetRequired<T, keyof T>, U> {
  const temp = camelCaseKeys(obj)
  for (const [key, value] of Object.entries(temp) as [keyof T, any]) {
    if (value === null || value === undefined) {
      if (optionals.includes(key)) temp[key] = undefined
      else
        throw new UnexpectedNullError(
          `Key ${key} was unexpectedly null or undefined`
        )
    }
  }
  return temp as SetOptional<SetRequired<T, keyof T>, U>
}

export function makeSomeRequired<T extends ObjectLike, U extends keyof T>(
  obj: T,
  requireds: U[]
): SetRequired<SetOptional<T, keyof T>, U> {
  const temp = camelCaseKeys(obj)
  for (const [key, value] of Object.entries(temp) as [keyof T, any]) {
    if (value === null || value === undefined) {
      if (requireds.includes(key))
        throw new UnexpectedNullError(
          `Key ${key} was unexpectedly null or undefined`
        )
      temp[key] = undefined
    }
  }
  return temp as SetRequired<SetOptional<T, keyof T>, U>
}

export function getDbUlid(): Ulid {
  return ULID.generate().toRaw()
}
export function getUuid(): Uuid {
  return UUID().toString()
}
export function getPgid(): Pgid {
  return Math.floor(Math.random() * 8 ** 4) // int4
}

export type Uuid = string // UUID
export type Ulid = string // ULID
export type Pgid = number // int4/8

export type Subject = string
