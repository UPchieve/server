/** Types generated for queries found in "server/models/User/user.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetUserIdByEmail' parameters type */
export interface IGetUserIdByEmailParams {
  email: string;
}

/** 'GetUserIdByEmail' return type */
export interface IGetUserIdByEmailResult {
  id: string;
}

/** 'GetUserIdByEmail' query type */
export interface IGetUserIdByEmailQuery {
  params: IGetUserIdByEmailParams;
  result: IGetUserIdByEmailResult;
}

const getUserIdByEmailIR: any = {"name":"getUserIdByEmail","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":77,"b":82,"line":7,"col":13}]}}],"usedParamSet":{"email":true},"statement":{"body":"SELECT\n    id\nFROM\n    users\nWHERE\n    email = :email!\nLIMIT 1","loc":{"a":29,"b":90,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id
 * FROM
 *     users
 * WHERE
 *     email = :email!
 * LIMIT 1
 * ```
 */
export const getUserIdByEmail = new PreparedQuery<IGetUserIdByEmailParams,IGetUserIdByEmailResult>(getUserIdByEmailIR);


/** 'GetUserContactInfoById' parameters type */
export interface IGetUserContactInfoByIdParams {
  id: string;
}

/** 'GetUserContactInfoById' return type */
export interface IGetUserContactInfoByIdResult {
  email: string;
  firstName: string;
  id: string;
}

/** 'GetUserContactInfoById' query type */
export interface IGetUserContactInfoByIdQuery {
  params: IGetUserContactInfoByIdParams;
  result: IGetUserContactInfoByIdResult;
}

const getUserContactInfoByIdIR: any = {"name":"getUserContactInfoById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":202,"b":204,"line":19,"col":10}]}}],"usedParamSet":{"id":true},"statement":{"body":"SELECT\n    id,\n    first_name,\n    email\nFROM\n    users\nWHERE\n    id = :id!\nLIMIT 1","loc":{"a":130,"b":212,"line":12,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     first_name,
 *     email
 * FROM
 *     users
 * WHERE
 *     id = :id!
 * LIMIT 1
 * ```
 */
export const getUserContactInfoById = new PreparedQuery<IGetUserContactInfoByIdParams,IGetUserContactInfoByIdResult>(getUserContactInfoByIdIR);


/** 'GetUserContactInfoByReferralCode' parameters type */
export interface IGetUserContactInfoByReferralCodeParams {
  referralCode: string;
}

/** 'GetUserContactInfoByReferralCode' return type */
export interface IGetUserContactInfoByReferralCodeResult {
  email: string;
  firstName: string;
  id: string;
}

/** 'GetUserContactInfoByReferralCode' query type */
export interface IGetUserContactInfoByReferralCodeQuery {
  params: IGetUserContactInfoByReferralCodeParams;
  result: IGetUserContactInfoByReferralCodeResult;
}

const getUserContactInfoByReferralCodeIR: any = {"name":"getUserContactInfoByReferralCode","params":[{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":345,"b":357,"line":31,"col":21}]}}],"usedParamSet":{"referralCode":true},"statement":{"body":"SELECT\n    id,\n    first_name,\n    email\nFROM\n    users\nWHERE\n    referral_code = :referralCode!\nLIMIT 1","loc":{"a":262,"b":365,"line":24,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     first_name,
 *     email
 * FROM
 *     users
 * WHERE
 *     referral_code = :referralCode!
 * LIMIT 1
 * ```
 */
export const getUserContactInfoByReferralCode = new PreparedQuery<IGetUserContactInfoByReferralCodeParams,IGetUserContactInfoByReferralCodeResult>(getUserContactInfoByReferralCodeIR);


/** 'GetUserContactInfoByResetToken' parameters type */
export interface IGetUserContactInfoByResetTokenParams {
  resetToken: string;
}

/** 'GetUserContactInfoByResetToken' return type */
export interface IGetUserContactInfoByResetTokenResult {
  email: string;
  firstName: string;
  id: string;
}

/** 'GetUserContactInfoByResetToken' query type */
export interface IGetUserContactInfoByResetTokenQuery {
  params: IGetUserContactInfoByResetTokenParams;
  result: IGetUserContactInfoByResetTokenResult;
}

const getUserContactInfoByResetTokenIR: any = {"name":"getUserContactInfoByResetToken","params":[{"name":"resetToken","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":503,"b":513,"line":43,"col":28}]}}],"usedParamSet":{"resetToken":true},"statement":{"body":"SELECT\n    id,\n    first_name,\n    email\nFROM\n    users\nWHERE\n    password_reset_token = :resetToken!\nLIMIT 1","loc":{"a":413,"b":521,"line":36,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     first_name,
 *     email
 * FROM
 *     users
 * WHERE
 *     password_reset_token = :resetToken!
 * LIMIT 1
 * ```
 */
export const getUserContactInfoByResetToken = new PreparedQuery<IGetUserContactInfoByResetTokenParams,IGetUserContactInfoByResetTokenResult>(getUserContactInfoByResetTokenIR);


/** 'CountUsersReferredByOtherId' parameters type */
export interface ICountUsersReferredByOtherIdParams {
  userId: string;
}

/** 'CountUsersReferredByOtherId' return type */
export interface ICountUsersReferredByOtherIdResult {
  total: number | null;
}

/** 'CountUsersReferredByOtherId' query type */
export interface ICountUsersReferredByOtherIdQuery {
  params: ICountUsersReferredByOtherIdParams;
  result: ICountUsersReferredByOtherIdResult;
}

const countUsersReferredByOtherIdIR: any = {"name":"countUsersReferredByOtherId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":640,"b":646,"line":53,"col":19}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    count(*)::int AS total\nFROM\n    users\nWHERE\n    referred_by = :userId!","loc":{"a":566,"b":646,"line":48,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     count(*)::int AS total
 * FROM
 *     users
 * WHERE
 *     referred_by = :userId!
 * ```
 */
export const countUsersReferredByOtherId = new PreparedQuery<ICountUsersReferredByOtherIdParams,ICountUsersReferredByOtherIdResult>(countUsersReferredByOtherIdIR);


/** 'UpdateUserResetTokenById' parameters type */
export interface IUpdateUserResetTokenByIdParams {
  token: string;
  userId: string;
}

/** 'UpdateUserResetTokenById' return type */
export interface IUpdateUserResetTokenByIdResult {
  id: string;
}

/** 'UpdateUserResetTokenById' query type */
export interface IUpdateUserResetTokenByIdQuery {
  params: IUpdateUserResetTokenByIdParams;
  result: IUpdateUserResetTokenByIdResult;
}

const updateUserResetTokenByIdIR: any = {"name":"updateUserResetTokenById","params":[{"name":"token","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":737,"b":742,"line":60,"col":28}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":855,"b":861,"line":68,"col":18}]}}],"usedParamSet":{"token":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    password_reset_token = :token!\nWHERE\n    id IN (\n        SELECT\n            id\n        FROM\n            users\n        WHERE\n            id = :userId!)\nRETURNING\n    id","loc":{"a":688,"b":879,"line":57,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     password_reset_token = :token!
 * WHERE
 *     id IN (
 *         SELECT
 *             id
 *         FROM
 *             users
 *         WHERE
 *             id = :userId!)
 * RETURNING
 *     id
 * ```
 */
export const updateUserResetTokenById = new PreparedQuery<IUpdateUserResetTokenByIdParams,IUpdateUserResetTokenByIdResult>(updateUserResetTokenByIdIR);


