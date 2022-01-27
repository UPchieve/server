import { Types } from 'mongoose'
import _ from 'lodash'
import { Ulid as ULID } from 'id128'
import { CustomError } from 'ts-custom-error'

type SingleNullToUndefined<T> = T extends null ? undefined : T
type NullToUndefined<T> = { [K in keyof T]: SingleNullToUndefined<T[K]> }
// only works for flat objects (no arrays/nesting)
export function nullToUndefined<T>(obj: T): NullToUndefined<T> {
  const r: any = {}
  for (const key in obj) {
    r[key] = obj[key] === null ? undefined : obj[key]
  }
  return r
}

type SingleOptional<T> = T | undefined
// only works for flat objects (no arrays/nesting)
export type Optional<T> = { [K in keyof T]: SingleOptional<T[K]> }

class UnexpectedNullError extends CustomError {}

type SingleRequired<T> = T extends null
  ? never
  : T extends undefined
  ? never
  : T
type OptionalToRequired<T> = { [K in keyof T]: SingleRequired<T[K]> }
// only works for flat objects (no arrays/nesting)
export function makeRequired<T>(obj: T): OptionalToRequired<T> {
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      throw new UnexpectedNullError(
        `Key ${key} was unexpectedly null or undefined`
      )
    }
  }
  return obj as OptionalToRequired<T>
}

type LValue = string | number | symbol
type Remove<T extends LValue, U extends LValue> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T]
type ReplaceProperty<T, U> = { [P in Remove<keyof T, keyof U>]: T[P] } & U

export function makeSomeRequired<T, U>(
  obj: T,
  optionals: U
): ReplaceProperty<OptionalToRequired<T>, U> {
  const temp: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      if (key in optionals) temp[key] = undefined
      else
        throw new UnexpectedNullError(
          `Key ${key} was unexpectedly null or undefined`
        )
    }
    temp[key] = value
  }
  return temp as ReplaceProperty<OptionalToRequired<T>, U>
}

export function getDbUlid() {
  return ULID.generate().toRaw()
}
//     type Mgid = Types.ObjectId  // mongoId
export type Uuid = string // UUID
export type Ulid = string // ULID
export type Pgid = number // int4
export type ObjectId = Types.ObjectId | Ulid | Pgid

export function mongoId<T extends ObjectId>(id: T): Types.ObjectId {
  if (Types.ObjectId.isValid(id)) return id as Types.ObjectId
  else throw TypeError(`ObjectId ${id} is not a valid MongoId`)
}

export type UlidOrPgid<T> = T extends Ulid
  ? Ulid
  : T extends Pgid
  ? Pgid
  : never

export type AnyObjectId<T> = T extends Types.ObjectId
  ? Types.ObjectId
  : UlidOrPgid<T>

export type Subject = string
