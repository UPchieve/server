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
      codeRefs: { used: [{ a: 92, b: 96, line: 2, col: 64 }] },
    },
  ],
  usedParamSet: { name: true },
  statement: {
    body:
      'INSERT INTO ban_reasons (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 28, b: 153, line: 2, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO ban_reasons (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
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
      codeRefs: { used: [{ a: 251, b: 255, line: 5, col: 65 }] },
    },
  ],
  usedParamSet: { name: true },
  statement: {
    body:
      'INSERT INTO grade_levels (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 186, b: 312, line: 5, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO grade_levels (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
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
      codeRefs: { used: [{ a: 418, b: 422, line: 8, col: 70 }] },
    },
  ],
  usedParamSet: { name: true },
  statement: {
    body:
      'INSERT INTO photo_id_statuses (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 348, b: 479, line: 8, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO photo_id_statuses (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
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
      codeRefs: { used: [{ a: 581, b: 585, line: 11, col: 67 }] },
    },
  ],
  usedParamSet: { name: true },
  statement: {
    body:
      'INSERT INTO signup_sources (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 514, b: 642, line: 11, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO signup_sources (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
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
      codeRefs: { used: [{ a: 736, b: 740, line: 14, col: 63 }] },
    },
  ],
  usedParamSet: { name: true },
  statement: {
    body:
      'INSERT INTO user_roles (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 673, b: 797, line: 14, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_roles (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
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
      codeRefs: { used: [{ a: 925, b: 929, line: 17, col: 81 }] },
    },
  ],
  usedParamSet: { name: true },
  statement: {
    body:
      'INSERT INTO volunteer_reference_statuses (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 844, b: 986, line: 17, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO volunteer_reference_statuses (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertVolunteerReferenceStatus = new PreparedQuery<
  IInsertVolunteerReferenceStatusParams,
  IInsertVolunteerReferenceStatusResult
>(insertVolunteerReferenceStatusIR)
