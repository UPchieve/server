/** Types generated for queries found in "database/seeds/static/users/users.sql" */
import { PreparedQuery } from '@pgtyped/query'

/** 'InsertBanReason' parameters type */
export interface IInsertBanReasonParams {
  name: string
}

/** 'InsertBanReason' return type */
export interface IInsertBanReasonResult {
  ok: number
}

/** 'InsertBanReason' query type */
export interface IInsertBanReasonQuery {
  params: IInsertBanReasonParams
  result: IInsertBanReasonResult
}

const insertBanReasonIR: any = {
  name: 'insertBanReason',
  params: [
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 96, b: 100, line: 3, col: 13 }] },
    },
  ],
  usedParamSet: { name: true },
  statement: {
    body: 'INSERT INTO ban_reasons (name, created_at, updated_at)\n    VALUES (:name!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 28, b: 165, line: 2, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO ban_reasons (name, created_at, updated_at)
 *     VALUES (:name!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertBanReason = new PreparedQuery<
  IInsertBanReasonParams,
  IInsertBanReasonResult
>(insertBanReasonIR)

/** 'InsertGradeLevel' parameters type */
export interface IInsertGradeLevelParams {
  name: string
}

/** 'InsertGradeLevel' return type */
export interface IInsertGradeLevelResult {
  ok: number
}

/** 'InsertGradeLevel' query type */
export interface IInsertGradeLevelQuery {
  params: IInsertGradeLevelParams
  result: IInsertGradeLevelResult
}

const insertGradeLevelIR: any = {
  name: 'insertGradeLevel',
  params: [
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 268, b: 272, line: 12, col: 13 }] },
    },
  ],
  usedParamSet: { name: true },
  statement: {
    body: 'INSERT INTO grade_levels (name, created_at, updated_at)\n    VALUES (:name!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 199, b: 337, line: 11, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO grade_levels (name, created_at, updated_at)
 *     VALUES (:name!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertGradeLevel = new PreparedQuery<
  IInsertGradeLevelParams,
  IInsertGradeLevelResult
>(insertGradeLevelIR)

/** 'InsertPhotoIdStatus' parameters type */
export interface IInsertPhotoIdStatusParams {
  name: string
}

/** 'InsertPhotoIdStatus' return type */
export interface IInsertPhotoIdStatusResult {
  ok: number
}

/** 'InsertPhotoIdStatus' query type */
export interface IInsertPhotoIdStatusQuery {
  params: IInsertPhotoIdStatusParams
  result: IInsertPhotoIdStatusResult
}

const insertPhotoIdStatusIR: any = {
  name: 'insertPhotoIdStatus',
  params: [
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 448, b: 452, line: 21, col: 13 }] },
    },
  ],
  usedParamSet: { name: true },
  statement: {
    body: 'INSERT INTO photo_id_statuses (name, created_at, updated_at)\n    VALUES (:name!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 374, b: 517, line: 20, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO photo_id_statuses (name, created_at, updated_at)
 *     VALUES (:name!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertPhotoIdStatus = new PreparedQuery<
  IInsertPhotoIdStatusParams,
  IInsertPhotoIdStatusResult
>(insertPhotoIdStatusIR)

/** 'InsertSignupSource' parameters type */
export interface IInsertSignupSourceParams {
  name: string
}

/** 'InsertSignupSource' return type */
export interface IInsertSignupSourceResult {
  ok: number
}

/** 'InsertSignupSource' query type */
export interface IInsertSignupSourceQuery {
  params: IInsertSignupSourceParams
  result: IInsertSignupSourceResult
}

const insertSignupSourceIR: any = {
  name: 'insertSignupSource',
  params: [
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 624, b: 628, line: 30, col: 13 }] },
    },
  ],
  usedParamSet: { name: true },
  statement: {
    body: 'INSERT INTO signup_sources (name, created_at, updated_at)\n    VALUES (:name!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 553, b: 693, line: 29, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO signup_sources (name, created_at, updated_at)
 *     VALUES (:name!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertSignupSource = new PreparedQuery<
  IInsertSignupSourceParams,
  IInsertSignupSourceResult
>(insertSignupSourceIR)

/** 'InsertUserRole' parameters type */
export interface IInsertUserRoleParams {
  name: string
}

/** 'InsertUserRole' return type */
export interface IInsertUserRoleResult {
  ok: number
}

/** 'InsertUserRole' query type */
export interface IInsertUserRoleQuery {
  params: IInsertUserRoleParams
  result: IInsertUserRoleResult
}

const insertUserRoleIR: any = {
  name: 'insertUserRole',
  params: [
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 792, b: 796, line: 39, col: 13 }] },
    },
  ],
  usedParamSet: { name: true },
  statement: {
    body: 'INSERT INTO user_roles (name, created_at, updated_at)\n    VALUES (:name!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 725, b: 861, line: 38, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_roles (name, created_at, updated_at)
 *     VALUES (:name!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertUserRole = new PreparedQuery<
  IInsertUserRoleParams,
  IInsertUserRoleResult
>(insertUserRoleIR)

/** 'InsertVolunteerReferenceStatus' parameters type */
export interface IInsertVolunteerReferenceStatusParams {
  name: string
}

/** 'InsertVolunteerReferenceStatus' return type */
export interface IInsertVolunteerReferenceStatusResult {
  ok: number
}

/** 'InsertVolunteerReferenceStatus' query type */
export interface IInsertVolunteerReferenceStatusQuery {
  params: IInsertVolunteerReferenceStatusParams
  result: IInsertVolunteerReferenceStatusResult
}

const insertVolunteerReferenceStatusIR: any = {
  name: 'insertVolunteerReferenceStatus',
  params: [
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 994, b: 998, line: 48, col: 13 }] },
    },
  ],
  usedParamSet: { name: true },
  statement: {
    body: 'INSERT INTO volunteer_reference_statuses (name, created_at, updated_at)\n    VALUES (:name!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 909, b: 1063, line: 47, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO volunteer_reference_statuses (name, created_at, updated_at)
 *     VALUES (:name!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertVolunteerReferenceStatus = new PreparedQuery<
  IInsertVolunteerReferenceStatusParams,
  IInsertVolunteerReferenceStatusResult
>(insertVolunteerReferenceStatusIR)
