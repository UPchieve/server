/** Types generated for queries found in "database/seeds/static/sessions/sessions.sql" */
import { PreparedQuery } from '@pgtyped/query'

/** 'InsertReportReason' parameters type */
export interface IInsertReportReasonParams {
  reason: string
}

/** 'InsertReportReason' return type */
export interface IInsertReportReasonResult {
  ok: number
}

/** 'InsertReportReason' query type */
export interface IInsertReportReasonQuery {
  params: IInsertReportReasonParams
  result: IInsertReportReasonResult
}

const insertReportReasonIR: any = {
  name: 'insertReportReason',
  params: [
    {
      name: 'reason',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 100, b: 106, line: 2, col: 69 }] },
    },
  ],
  usedParamSet: { reason: true },
  statement: {
    body:
      'INSERT INTO report_reasons (reason, created_at, updated_at) VALUES (:reason!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 31, b: 163, line: 2, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO report_reasons (reason, created_at, updated_at) VALUES (:reason!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertReportReason = new PreparedQuery<
  IInsertReportReasonParams,
  IInsertReportReasonResult
>(insertReportReasonIR)

/** 'InsertSessionFlag' parameters type */
export interface IInsertSessionFlagParams {
  name: string
}

/** 'InsertSessionFlag' return type */
export interface IInsertSessionFlagResult {
  ok: number
}

/** 'InsertSessionFlag' query type */
export interface IInsertSessionFlagQuery {
  params: IInsertSessionFlagParams
  result: IInsertSessionFlagResult
}

const insertSessionFlagIR: any = {
  name: 'insertSessionFlag',
  params: [
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 263, b: 267, line: 5, col: 66 }] },
    },
  ],
  usedParamSet: { name: true },
  statement: {
    body:
      'INSERT INTO session_flags (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 197, b: 324, line: 5, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_flags (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertSessionFlag = new PreparedQuery<
  IInsertSessionFlagParams,
  IInsertSessionFlagResult
>(insertSessionFlagIR)
