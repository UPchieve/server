import { Types } from 'mongoose'
import _ from 'lodash'
import { Ulid as ULID } from 'id128'

export function getDbUlid() {
  return ULID.generate().toRaw()
}

export type Ulid = string
export type Pgid = number
export type ObjectId = Types.ObjectId | Ulid | Pgid

export type MongoId<T> = T extends Types.ObjectId ? Types.ObjectId : never
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

type IdType<T> = T extends { id: any }
  ? T['id']
  : never
 
export type PortId<T> = T extends { id: ObjectId }
  ? T & { _id: UlidOrPgid<IdType<T>> }
  : never

export function portId<T extends { id: ObjectId }>(obj: T): PortId<T> {
  const temp: any = {
    ...obj,
    _id: obj.id
  }
  delete temp.id
  return temp
}

type SnakeToCamelCase<S extends string> =
  S extends `${infer T}_${infer U}` ?
  `${T}${Capitalize<SnakeToCamelCase<U>>}` :
  S

export type CamelCaseKeys<InputType> = {[K in keyof InputType as SnakeToCamelCase<K & string>]: InputType[K]}

export function camelCaseKeys<T extends {[k: string]: any}>(obj: T): CamelCaseKeys<T> {
  let newObj: any = {}
  for (const key in obj) {
    const newKey = _.camelCase(key)
    newObj[newKey] = obj[key]
  }
  return newObj as CamelCaseKeys<T>
}

// TODO: upgrade prettier to support type string literal interpolation
export type CamelToSnakeCase<S extends string> =
  S extends `${infer T}${infer U}` ?
  `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}` :
  S

export type SnakeCaseKeys<InputType> = {[K in keyof InputType as CamelToSnakeCase<K & string>]: InputType[K]}

export function snakeCaseKeys<T extends {[k: string]: any}>(obj: T): SnakeCaseKeys<T> {
  let newObj: any = {}
  for (const key in obj) {
    const newKey = _.snakeCase(key)
    newObj[newKey] = obj[key]
  }
  return newObj as SnakeCaseKeys<T>
}

export function parsePgToApp<T extends { id: ObjectId, [k: string]: any }>(obj: T): PortId<CamelCaseKeys<T>> {
  return portId(camelCaseKeys(obj))
}
