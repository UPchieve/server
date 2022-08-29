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
      codeRefs: { used: [{ a: 94, b: 98, line: 2, col: 68 }] },
    },
    {
      name: 'code',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 102, b: 106, line: 2, col: 76 }] },
    },
  ],
  usedParamSet: { name: true, code: true },
  statement: {
    body:
      'INSERT INTO us_states (name, code, created_at, updated_at) VALUES (:name!, :code!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING name AS ok',
    loc: { a: 26, b: 165, line: 2, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO us_states (name, code, created_at, updated_at) VALUES (:name!, :code!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING name AS ok
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
      codeRefs: { used: [{ a: 293, b: 297, line: 5, col: 98 }] },
    },
    {
      name: 'usStateCode',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 301, b: 312, line: 5, col: 106 }] },
    },
    {
      name: 'income',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 316, b: 322, line: 5, col: 121 }] },
    },
    {
      name: 'latitude',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 332, b: 340, line: 5, col: 137 }] },
    },
    {
      name: 'longitude',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 344, b: 353, line: 5, col: 149 }] },
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
      'INSERT INTO postal_codes (code, us_state_code, income, location, created_at, updated_at) VALUES (:code!, :usStateCode!, :income!, POINT(:latitude!, :longitude!), NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING code AS ok',
    loc: { a: 195, b: 413, line: 5, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO postal_codes (code, us_state_code, income, location, created_at, updated_at) VALUES (:code!, :usStateCode!, :income!, POINT(:latitude!, :longitude!), NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING code AS ok
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
      codeRefs: { used: [{ a: 507, b: 509, line: 8, col: 64 }] },
    },
    {
      name: 'day',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 513, b: 516, line: 8, col: 70 }] },
    },
  ],
  usedParamSet: { id: true, day: true },
  statement: {
    body:
      'INSERT INTO weekdays (id, day, created_at, updated_at) VALUES (:id!, :day!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 443, b: 573, line: 8, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO weekdays (id, day, created_at, updated_at) VALUES (:id!, :day!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertWeekday = new PreparedQuery<
  IInsertWeekdayParams,
  IInsertWeekdayResult
>(insertWeekdayIR)
