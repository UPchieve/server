/** Types generated for queries found in "database/seeds/static/geography/geography.sql" */
import { PreparedQuery } from '@pgtyped/query'

/** 'InsertUsState' parameters type */
export interface IInsertUsStateParams {
  code: string
  name: string
}

/** 'InsertUsState' return type */
export interface IInsertUsStateResult {
  ok: string
}

/** 'InsertUsState' query type */
export interface IInsertUsStateQuery {
  params: IInsertUsStateParams
  result: IInsertUsStateResult
}

const insertUsStateIR: any = {
  name: 'insertUsState',
  params: [
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 98, b: 102, line: 3, col: 13 }] },
    },
    {
      name: 'code',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 106, b: 110, line: 3, col: 21 }] },
    },
  ],
  usedParamSet: { name: true, code: true },
  statement: {
    body:
      'INSERT INTO us_states (name, code, created_at, updated_at)\n    VALUES (:name!, :code!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    name AS ok',
    loc: { a: 26, b: 177, line: 2, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO us_states (name, code, created_at, updated_at)
 *     VALUES (:name!, :code!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     name AS ok
 * ```
 */
export const insertUsState = new PreparedQuery<
  IInsertUsStateParams,
  IInsertUsStateResult
>(insertUsStateIR)

/** 'InsertZipCode' parameters type */
export interface IInsertZipCodeParams {
  code: string
  income: number
  latitude: number
  longitude: number
  usStateCode: string
}

/** 'InsertZipCode' return type */
export interface IInsertZipCodeResult {
  ok: string
}

/** 'InsertZipCode' query type */
export interface IInsertZipCodeQuery {
  params: IInsertZipCodeParams
  result: IInsertZipCodeResult
}

const insertZipCodeIR: any = {
  name: 'insertZipCode',
  params: [
    {
      name: 'code',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 310, b: 314, line: 12, col: 13 }] },
    },
    {
      name: 'usStateCode',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 318, b: 329, line: 12, col: 21 }] },
    },
    {
      name: 'income',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 333, b: 339, line: 12, col: 36 }] },
    },
    {
      name: 'latitude',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 349, b: 357, line: 12, col: 52 }] },
    },
    {
      name: 'longitude',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 361, b: 370, line: 12, col: 64 }] },
    },
  ],
  usedParamSet: {
    code: true,
    usStateCode: true,
    income: true,
    latitude: true,
    longitude: true,
  },
  statement: {
    body:
      'INSERT INTO postal_codes (code, us_state_code, income, LOCATION, created_at, updated_at)\n    VALUES (:code!, :usStateCode!, :income!, POINT(:latitude!, :longitude!), NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    code AS ok',
    loc: { a: 208, b: 438, line: 11, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO postal_codes (code, us_state_code, income, LOCATION, created_at, updated_at)
 *     VALUES (:code!, :usStateCode!, :income!, POINT(:latitude!, :longitude!), NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     code AS ok
 * ```
 */
export const insertZipCode = new PreparedQuery<
  IInsertZipCodeParams,
  IInsertZipCodeResult
>(insertZipCodeIR)

/** 'InsertWeekday' parameters type */
export interface IInsertWeekdayParams {
  day: string
  id: number
}

/** 'InsertWeekday' return type */
export interface IInsertWeekdayResult {
  ok: number
}

/** 'InsertWeekday' query type */
export interface IInsertWeekdayQuery {
  params: IInsertWeekdayParams
  result: IInsertWeekdayResult
}

const insertWeekdayIR: any = {
  name: 'insertWeekday',
  params: [
    {
      name: 'id',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 537, b: 539, line: 21, col: 13 }] },
    },
    {
      name: 'day',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 543, b: 546, line: 21, col: 19 }] },
    },
  ],
  usedParamSet: { id: true, day: true },
  statement: {
    body:
      'INSERT INTO weekdays (id, day, created_at, updated_at)\n    VALUES (:id!, :day!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 469, b: 611, line: 20, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO weekdays (id, day, created_at, updated_at)
 *     VALUES (:id!, :day!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertWeekday = new PreparedQuery<
  IInsertWeekdayParams,
  IInsertWeekdayResult
>(insertWeekdayIR)
