/** Types generated for queries found in "server/models/UserAction/user_action.sql" */
import { PreparedQuery } from '@pgtyped/query'

/** 'GetUserIdByEmail' parameters type */
export interface IGetUserIdByEmailParams {
  email: string
}

/** 'GetUserIdByEmail' return type */
export interface IGetUserIdByEmailResult {
  id: string
}

/** 'GetUserIdByEmail' query type */
export interface IGetUserIdByEmailQuery {
  params: IGetUserIdByEmailParams
  result: IGetUserIdByEmailResult
}

const getUserIdByEmailIR: any = {
  name: 'getUserIdByEmail',
  params: [
    {
      name: 'email',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 71, b: 76, line: 7, col: 11 }] },
    },
  ],
  usedParamSet: { email: true },
  statement: {
    body: 'SELECT\n  id\nFROM\n  users\nWHERE\n  email = :email!\nLIMIT\n  1',
    loc: { a: 29, b: 86, line: 2, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id
 * FROM
 *   users
 * WHERE
 *   email = :email!
 * LIMIT
 *   1
 * ```
 */
export const getUserIdByEmail = new PreparedQuery<
  IGetUserIdByEmailParams,
  IGetUserIdByEmailResult
>(getUserIdByEmailIR)

/** 'GetUserContactInfoById' parameters type */
export interface IGetUserContactInfoByIdParams {
  id: string
}

/** 'GetUserContactInfoById' return type */
export interface IGetUserContactInfoByIdResult {
  email: string
  firstName: string
  id: string
}

/** 'GetUserContactInfoById' query type */
export interface IGetUserContactInfoByIdQuery {
  params: IGetUserContactInfoByIdParams
  result: IGetUserContactInfoByIdResult
}

const getUserContactInfoByIdIR: any = {
  name: 'getUserContactInfoById',
  params: [
    {
      name: 'id',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 186, b: 188, line: 18, col: 8 }] },
    },
  ],
  usedParamSet: { id: true },
  statement: {
    body:
      'SELECT\n  id,\n  first_name,\n  email\nFROM\n  users\nWHERE\n  id = :id!\nLIMIT\n  1',
    loc: { a: 124, b: 198, line: 11, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id,
 *   first_name,
 *   email
 * FROM
 *   users
 * WHERE
 *   id = :id!
 * LIMIT
 *   1
 * ```
 */
export const getUserContactInfoById = new PreparedQuery<
  IGetUserContactInfoByIdParams,
  IGetUserContactInfoByIdResult
>(getUserContactInfoByIdIR)

/** 'GetUserContactInfoByReferralCode' parameters type */
export interface IGetUserContactInfoByReferralCodeParams {
  referralCode: string
}

/** 'GetUserContactInfoByReferralCode' return type */
export interface IGetUserContactInfoByReferralCodeResult {
  email: string
  firstName: string
  id: string
}

/** 'GetUserContactInfoByReferralCode' query type */
export interface IGetUserContactInfoByReferralCodeQuery {
  params: IGetUserContactInfoByReferralCodeParams
  result: IGetUserContactInfoByReferralCodeResult
}

const getUserContactInfoByReferralCodeIR: any = {
  name: 'getUserContactInfoByReferralCode',
  params: [
    {
      name: 'referralCode',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 319, b: 331, line: 29, col: 19 }] },
    },
  ],
  usedParamSet: { referralCode: true },
  statement: {
    body:
      'SELECT\n  id,\n  first_name,\n  email\nFROM\n  users\nWHERE\n  referral_code = :referralCode!\nLIMIT\n  1',
    loc: { a: 246, b: 341, line: 22, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id,
 *   first_name,
 *   email
 * FROM
 *   users
 * WHERE
 *   referral_code = :referralCode!
 * LIMIT
 *   1
 * ```
 */
export const getUserContactInfoByReferralCode = new PreparedQuery<
  IGetUserContactInfoByReferralCodeParams,
  IGetUserContactInfoByReferralCodeResult
>(getUserContactInfoByReferralCodeIR)

/** 'GetUserContactInfoByResetToken' parameters type */
export interface IGetUserContactInfoByResetTokenParams {
  resetToken: string
}

/** 'GetUserContactInfoByResetToken' return type */
export interface IGetUserContactInfoByResetTokenResult {
  email: string
  firstName: string
  id: string
}

/** 'GetUserContactInfoByResetToken' query type */
export interface IGetUserContactInfoByResetTokenQuery {
  params: IGetUserContactInfoByResetTokenParams
  result: IGetUserContactInfoByResetTokenResult
}

const getUserContactInfoByResetTokenIR: any = {
  name: 'getUserContactInfoByResetToken',
  params: [
    {
      name: 'resetToken',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 467, b: 477, line: 40, col: 26 }] },
    },
  ],
  usedParamSet: { resetToken: true },
  statement: {
    body:
      'SELECT\n  id,\n  first_name,\n  email\nFROM\n  users\nWHERE\n  password_reset_token = :resetToken!\nLIMIT\n  1',
    loc: { a: 387, b: 487, line: 33, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id,
 *   first_name,
 *   email
 * FROM
 *   users
 * WHERE
 *   password_reset_token = :resetToken!
 * LIMIT
 *   1
 * ```
 */
export const getUserContactInfoByResetToken = new PreparedQuery<
  IGetUserContactInfoByResetTokenParams,
  IGetUserContactInfoByResetTokenResult
>(getUserContactInfoByResetTokenIR)

/** 'CountUsersReferredByOtherId' parameters type */
export interface ICountUsersReferredByOtherIdParams {
  userId: string
}

/** 'CountUsersReferredByOtherId' return type */
export interface ICountUsersReferredByOtherIdResult {
  total: number | null
}

/** 'CountUsersReferredByOtherId' query type */
export interface ICountUsersReferredByOtherIdQuery {
  params: ICountUsersReferredByOtherIdParams
  result: ICountUsersReferredByOtherIdResult
}

const countUsersReferredByOtherIdIR: any = {
  name: 'countUsersReferredByOtherId',
  params: [
    {
      name: 'userId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 599, b: 605, line: 49, col: 17 }] },
    },
  ],
  usedParamSet: { userId: true },
  statement: {
    body:
      'SELECT\n  count(*):: int as total\nFROM\n  users\nWHERE\n  referred_by = :userId!',
    loc: { a: 530, b: 605, line: 44, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   count(*):: int as total
 * FROM
 *   users
 * WHERE
 *   referred_by = :userId!
 * ```
 */
export const countUsersReferredByOtherId = new PreparedQuery<
  ICountUsersReferredByOtherIdParams,
  ICountUsersReferredByOtherIdResult
>(countUsersReferredByOtherIdIR)

/** 'UpdateUserResetTokenById' parameters type */
export interface IUpdateUserResetTokenByIdParams {
  token: string
  userId: string
}

/** 'UpdateUserResetTokenById' return type */
export interface IUpdateUserResetTokenByIdResult {
  id: string
}

/** 'UpdateUserResetTokenById' query type */
export interface IUpdateUserResetTokenByIdQuery {
  params: IUpdateUserResetTokenByIdParams
  result: IUpdateUserResetTokenByIdResult
}

const updateUserResetTokenByIdIR: any = {
  name: 'updateUserResetTokenById',
  params: [
    {
      name: 'token',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 690, b: 695, line: 54, col: 26 }] },
    },
    {
      name: 'userId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 776, b: 782, line: 62, col: 12 }] },
    },
  ],
  usedParamSet: { token: true, userId: true },
  statement: {
    body:
      'UPDATE\n  users\nSET\n  password_reset_token = :token!\nWHERE\n  id IN (\n    SELECT\n      id\n    FROM\n      users\n    WHERE\n      id = :userId!\n  ) RETURNING id',
    loc: { a: 645, b: 799, line: 51, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *   users
 * SET
 *   password_reset_token = :token!
 * WHERE
 *   id IN (
 *     SELECT
 *       id
 *     FROM
 *       users
 *     WHERE
 *       id = :userId!
 *   ) RETURNING id
 * ```
 */
export const updateUserResetTokenById = new PreparedQuery<
  IUpdateUserResetTokenByIdParams,
  IUpdateUserResetTokenByIdResult
>(updateUserResetTokenByIdIR)
