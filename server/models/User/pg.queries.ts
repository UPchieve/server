/** Types generated for queries found in "server/models/User/user.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type stringArray = (string)[];

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


/** 'GetUserIdByPhone' parameters type */
export interface IGetUserIdByPhoneParams {
  phone: string;
}

/** 'GetUserIdByPhone' return type */
export interface IGetUserIdByPhoneResult {
  id: string;
}

/** 'GetUserIdByPhone' query type */
export interface IGetUserIdByPhoneQuery {
  params: IGetUserIdByPhoneParams;
  result: IGetUserIdByPhoneResult;
}

const getUserIdByPhoneIR: any = {"name":"getUserIdByPhone","params":[{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":172,"b":177,"line":17,"col":13}]}}],"usedParamSet":{"phone":true},"statement":{"body":"SELECT\n    id\nFROM\n    users\nWHERE\n    phone = :phone!\nLIMIT 1","loc":{"a":124,"b":185,"line":12,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id
 * FROM
 *     users
 * WHERE
 *     phone = :phone!
 * LIMIT 1
 * ```
 */
export const getUserIdByPhone = new PreparedQuery<IGetUserIdByPhoneParams,IGetUserIdByPhoneResult>(getUserIdByPhoneIR);


/** 'GetUserContactInfoById' parameters type */
export interface IGetUserContactInfoByIdParams {
  id: string;
}

/** 'GetUserContactInfoById' return type */
export interface IGetUserContactInfoByIdResult {
  banned: boolean;
  deactivated: boolean;
  email: string;
  firstName: string;
  id: string;
  isAdmin: boolean | null;
  isVolunteer: boolean | null;
  lastActivityAt: Date | null;
  studentPartnerOrg: string;
  volunteerPartnerOrg: string;
}

/** 'GetUserContactInfoById' query type */
export interface IGetUserContactInfoByIdQuery {
  params: IGetUserContactInfoByIdParams;
  result: IGetUserContactInfoByIdResult;
}

const getUserContactInfoByIdIR: any = {"name":"getUserContactInfoById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1186,"b":1188,"line":51,"col":16}]}}],"usedParamSet":{"id":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    email,\n    banned,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    student_partner_orgs.key AS student_partner_org,\n    users.last_activity_at,\n    deactivated\nFROM\n    users\n    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\nWHERE\n    users.id = :id!\nLIMIT 1","loc":{"a":225,"b":1196,"line":22,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     email,
 *     banned,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_volunteer,
 *     (
 *         CASE WHEN admin_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_admin,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     student_partner_orgs.key AS student_partner_org,
 *     users.last_activity_at,
 *     deactivated
 * FROM
 *     users
 *     LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 *     LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
 * WHERE
 *     users.id = :id!
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
  banned: boolean;
  deactivated: boolean;
  email: string;
  firstName: string;
  id: string;
  isAdmin: boolean | null;
  isVolunteer: boolean | null;
  lastActivityAt: Date | null;
  studentPartnerOrg: string;
  volunteerPartnerOrg: string;
}

/** 'GetUserContactInfoByReferralCode' query type */
export interface IGetUserContactInfoByReferralCodeQuery {
  params: IGetUserContactInfoByReferralCodeParams;
  result: IGetUserContactInfoByReferralCodeResult;
}

const getUserContactInfoByReferralCodeIR: any = {"name":"getUserContactInfoByReferralCode","params":[{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2212,"b":2224,"line":85,"col":21}]}}],"usedParamSet":{"referralCode":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    email,\n    banned,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    student_partner_orgs.key AS student_partner_org,\n    users.last_activity_at,\n    deactivated\nFROM\n    users\n    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\nWHERE\n    referral_code = :referralCode!\nLIMIT 1","loc":{"a":1246,"b":2232,"line":56,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     email,
 *     banned,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_volunteer,
 *     (
 *         CASE WHEN admin_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_admin,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     student_partner_orgs.key AS student_partner_org,
 *     users.last_activity_at,
 *     deactivated
 * FROM
 *     users
 *     LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 *     LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
 * WHERE
 *     referral_code = :referralCode!
 * LIMIT 1
 * ```
 */
export const getUserContactInfoByReferralCode = new PreparedQuery<IGetUserContactInfoByReferralCodeParams,IGetUserContactInfoByReferralCodeResult>(getUserContactInfoByReferralCodeIR);


/** 'GetUserForPassport' parameters type */
export interface IGetUserForPassportParams {
  email: string;
}

/** 'GetUserForPassport' return type */
export interface IGetUserForPassportResult {
  email: string;
  id: string;
  password: string;
}

/** 'GetUserForPassport' query type */
export interface IGetUserForPassportQuery {
  params: IGetUserForPassportParams;
  result: IGetUserForPassportResult;
}

const getUserForPassportIR: any = {"name":"getUserForPassport","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2341,"b":2346,"line":97,"col":13}]}}],"usedParamSet":{"email":true},"statement":{"body":"SELECT\n    id,\n    email,\n    PASSWORD\nFROM\n    users\nWHERE\n    email = :email!\nLIMIT 1","loc":{"a":2268,"b":2354,"line":90,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     email,
 *     PASSWORD
 * FROM
 *     users
 * WHERE
 *     email = :email!
 * LIMIT 1
 * ```
 */
export const getUserForPassport = new PreparedQuery<IGetUserForPassportParams,IGetUserForPassportResult>(getUserForPassportIR);


/** 'GetUserContactInfoByResetToken' parameters type */
export interface IGetUserContactInfoByResetTokenParams {
  resetToken: string;
}

/** 'GetUserContactInfoByResetToken' return type */
export interface IGetUserContactInfoByResetTokenResult {
  banned: boolean;
  deactivated: boolean;
  email: string;
  firstName: string;
  id: string;
  isAdmin: boolean | null;
  isVolunteer: boolean | null;
  lastActivityAt: Date | null;
  studentPartnerOrg: string;
  volunteerPartnerOrg: string;
}

/** 'GetUserContactInfoByResetToken' query type */
export interface IGetUserContactInfoByResetTokenQuery {
  params: IGetUserContactInfoByResetTokenParams;
  result: IGetUserContactInfoByResetTokenResult;
}

const getUserContactInfoByResetTokenIR: any = {"name":"getUserContactInfoByResetToken","params":[{"name":"resetToken","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3375,"b":3385,"line":131,"col":28}]}}],"usedParamSet":{"resetToken":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    email,\n    banned,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    student_partner_orgs.key AS student_partner_org,\n    users.last_activity_at,\n    deactivated\nFROM\n    users\n    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\nWHERE\n    password_reset_token = :resetToken!\nLIMIT 1","loc":{"a":2402,"b":3393,"line":102,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     email,
 *     banned,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_volunteer,
 *     (
 *         CASE WHEN admin_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_admin,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     student_partner_orgs.key AS student_partner_org,
 *     users.last_activity_at,
 *     deactivated
 * FROM
 *     users
 *     LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 *     LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
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

const countUsersReferredByOtherIdIR: any = {"name":"countUsersReferredByOtherId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3512,"b":3518,"line":141,"col":19}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    count(*)::int AS total\nFROM\n    users\nWHERE\n    referred_by = :userId!","loc":{"a":3438,"b":3518,"line":136,"col":0}}};

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

const updateUserResetTokenByIdIR: any = {"name":"updateUserResetTokenById","params":[{"name":"token","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3609,"b":3614,"line":148,"col":28}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3656,"b":3662,"line":151,"col":10}]}}],"usedParamSet":{"token":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    password_reset_token = :token!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id","loc":{"a":3560,"b":3679,"line":145,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     password_reset_token = :token!,
 *     updated_at = NOW()
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id
 * ```
 */
export const updateUserResetTokenById = new PreparedQuery<IUpdateUserResetTokenByIdParams,IUpdateUserResetTokenByIdResult>(updateUserResetTokenByIdIR);


/** 'UpdateUserPasswordById' parameters type */
export interface IUpdateUserPasswordByIdParams {
  password: string;
  userId: string;
}

/** 'UpdateUserPasswordById' return type */
export interface IUpdateUserPasswordByIdResult {
  ok: string;
}

/** 'UpdateUserPasswordById' query type */
export interface IUpdateUserPasswordByIdQuery {
  params: IUpdateUserPasswordByIdParams;
  result: IUpdateUserPasswordByIdResult;
}

const updateUserPasswordByIdIR: any = {"name":"updateUserPasswordById","params":[{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3756,"b":3764,"line":160,"col":16}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3806,"b":3812,"line":163,"col":10}]}}],"usedParamSet":{"password":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    PASSWORD = :password!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":3719,"b":3835,"line":157,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     PASSWORD = :password!,
 *     updated_at = NOW()
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateUserPasswordById = new PreparedQuery<IUpdateUserPasswordByIdParams,IUpdateUserPasswordByIdResult>(updateUserPasswordByIdIR);


/** 'InsertUserIpById' parameters type */
export interface IInsertUserIpByIdParams {
  id: string;
  ipId: number;
  userId: string;
}

/** 'InsertUserIpById' return type */
export interface IInsertUserIpByIdResult {
  ok: string | null;
}

/** 'InsertUserIpById' query type */
export interface IInsertUserIpByIdQuery {
  params: IInsertUserIpByIdParams;
  result: IInsertUserIpByIdResult;
}

const insertUserIpByIdIR: any = {"name":"insertUserIpById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3984,"b":3986,"line":171,"col":17}]}},{"name":"ipId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3990,"b":3994,"line":171,"col":23},{"a":4239,"b":4243,"line":186,"col":25}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3998,"b":4004,"line":171,"col":31},{"a":4272,"b":4278,"line":187,"col":27}]}}],"usedParamSet":{"id":true,"ipId":true,"userId":true},"statement":{"body":"WITH ins AS (\nINSERT INTO users_ip_addresses (id, ip_address_id, user_id, created_at, updated_at)\n        VALUES (:id!, :ipId!, :userId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id AS ok\n    FROM\n        users_ip_addresses\n    WHERE\n        ip_address_id = :ipId!\n            AND user_id = :userId!","loc":{"a":3869,"b":4278,"line":169,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS (
 * INSERT INTO users_ip_addresses (id, ip_address_id, user_id, created_at, updated_at)
 *         VALUES (:id!, :ipId!, :userId!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok)
 *     SELECT
 *         *
 *     FROM
 *         ins
 *     UNION
 *     SELECT
 *         id AS ok
 *     FROM
 *         users_ip_addresses
 *     WHERE
 *         ip_address_id = :ipId!
 *             AND user_id = :userId!
 * ```
 */
export const insertUserIpById = new PreparedQuery<IInsertUserIpByIdParams,IInsertUserIpByIdResult>(insertUserIpByIdIR);


/** 'UpdateUserVerifiedEmailById' parameters type */
export interface IUpdateUserVerifiedEmailByIdParams {
  email: string;
  userId: string;
}

/** 'UpdateUserVerifiedEmailById' return type */
export interface IUpdateUserVerifiedEmailByIdResult {
  ok: string;
}

/** 'UpdateUserVerifiedEmailById' query type */
export interface IUpdateUserVerifiedEmailByIdQuery {
  params: IUpdateUserVerifiedEmailByIdParams;
  result: IUpdateUserVerifiedEmailByIdResult;
}

const updateUserVerifiedEmailByIdIR: any = {"name":"updateUserVerifiedEmailById","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4357,"b":4362,"line":194,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4452,"b":4458,"line":199,"col":10}]}}],"usedParamSet":{"email":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    email = :email!,\n    email_verified = TRUE,\n    verified = TRUE,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":4323,"b":4481,"line":191,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     email = :email!,
 *     email_verified = TRUE,
 *     verified = TRUE,
 *     updated_at = NOW()
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateUserVerifiedEmailById = new PreparedQuery<IUpdateUserVerifiedEmailByIdParams,IUpdateUserVerifiedEmailByIdResult>(updateUserVerifiedEmailByIdIR);


/** 'UpdateUserVerifiedPhoneById' parameters type */
export interface IUpdateUserVerifiedPhoneByIdParams {
  phone: string;
  userId: string;
}

/** 'UpdateUserVerifiedPhoneById' return type */
export interface IUpdateUserVerifiedPhoneByIdResult {
  ok: string;
}

/** 'UpdateUserVerifiedPhoneById' query type */
export interface IUpdateUserVerifiedPhoneByIdQuery {
  params: IUpdateUserVerifiedPhoneByIdParams;
  result: IUpdateUserVerifiedPhoneByIdResult;
}

const updateUserVerifiedPhoneByIdIR: any = {"name":"updateUserVerifiedPhoneById","params":[{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4560,"b":4565,"line":208,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4655,"b":4661,"line":213,"col":10}]}}],"usedParamSet":{"phone":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    phone = :phone!,\n    phone_verified = TRUE,\n    verified = TRUE,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":4526,"b":4684,"line":205,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     phone = :phone!,
 *     phone_verified = TRUE,
 *     verified = TRUE,
 *     updated_at = NOW()
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateUserVerifiedPhoneById = new PreparedQuery<IUpdateUserVerifiedPhoneByIdParams,IUpdateUserVerifiedPhoneByIdResult>(updateUserVerifiedPhoneByIdIR);


/** 'UpdateUserLastActivityById' parameters type */
export interface IUpdateUserLastActivityByIdParams {
  lastActivityAt: Date;
  userId: string;
}

/** 'UpdateUserLastActivityById' return type */
export interface IUpdateUserLastActivityByIdResult {
  ok: string;
}

/** 'UpdateUserLastActivityById' query type */
export interface IUpdateUserLastActivityByIdQuery {
  params: IUpdateUserLastActivityByIdParams;
  result: IUpdateUserLastActivityByIdResult;
}

const updateUserLastActivityByIdIR: any = {"name":"updateUserLastActivityById","params":[{"name":"lastActivityAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4773,"b":4787,"line":222,"col":24}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4829,"b":4835,"line":225,"col":10}]}}],"usedParamSet":{"lastActivityAt":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    last_activity_at = :lastActivityAt!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":4728,"b":4858,"line":219,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     last_activity_at = :lastActivityAt!,
 *     updated_at = NOW()
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateUserLastActivityById = new PreparedQuery<IUpdateUserLastActivityByIdParams,IUpdateUserLastActivityByIdResult>(updateUserLastActivityByIdIR);


/** 'UpdateUserBanById' parameters type */
export interface IUpdateUserBanByIdParams {
  banReason: string;
  userId: string;
}

/** 'UpdateUserBanById' return type */
export interface IUpdateUserBanByIdResult {
  ok: string;
}

/** 'UpdateUserBanById' query type */
export interface IUpdateUserBanByIdQuery {
  params: IUpdateUserBanByIdParams;
  result: IUpdateUserBanByIdResult;
}

const updateUserBanByIdIR: any = {"name":"updateUserBanById","params":[{"name":"banReason","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5136,"b":5145,"line":244,"col":16}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5176,"b":5182,"line":246,"col":10}]}}],"usedParamSet":{"banReason":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    banned = subquery.banned,\n    ban_reason_id = subquery.ban_reason_id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        TRUE AS banned,\n        id AS ban_reason_id\n    FROM\n        ban_reasons\n    WHERE\n        name = :banReason!) AS subquery\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":4893,"b":5205,"line":231,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     banned = subquery.banned,
 *     ban_reason_id = subquery.ban_reason_id,
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         TRUE AS banned,
 *         id AS ban_reason_id
 *     FROM
 *         ban_reasons
 *     WHERE
 *         name = :banReason!) AS subquery
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateUserBanById = new PreparedQuery<IUpdateUserBanByIdParams,IUpdateUserBanByIdResult>(updateUserBanByIdIR);


/** 'GetUserForAdminUpdate' parameters type */
export interface IGetUserForAdminUpdateParams {
  userId: string;
}

/** 'GetUserForAdminUpdate' return type */
export interface IGetUserForAdminUpdateResult {
  banned: boolean;
  deactivated: boolean;
  email: string;
  id: string;
  isVolunteer: boolean | null;
  studentPartnerOrg: string;
}

/** 'GetUserForAdminUpdate' query type */
export interface IGetUserForAdminUpdateQuery {
  params: IGetUserForAdminUpdateParams;
  result: IGetUserForAdminUpdateResult;
}

const getUserForAdminUpdateIR: any = {"name":"getUserForAdminUpdate","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5789,"b":5795,"line":270,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    banned,\n    email,\n    deactivated,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    student_partner_orgs.name AS student_partner_org\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\nWHERE\n    users.id = :userId!","loc":{"a":5244,"b":5795,"line":252,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     banned,
 *     email,
 *     deactivated,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_volunteer,
 *     student_partner_orgs.name AS student_partner_org
 * FROM
 *     users
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 *     LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
 * WHERE
 *     users.id = :userId!
 * ```
 */
export const getUserForAdminUpdate = new PreparedQuery<IGetUserForAdminUpdateParams,IGetUserForAdminUpdateResult>(getUserForAdminUpdateIR);


/** 'GetUsersForAdminSearch' parameters type */
export interface IGetUsersForAdminSearchParams {
  email: string | null | void;
  firstName: string | null | void;
  highSchool: string | null | void;
  lastName: string | null | void;
  limit: number;
  offset: number;
  partnerOrg: string | null | void;
  userId: string | null | void;
}

/** 'GetUsersForAdminSearch' return type */
export interface IGetUsersForAdminSearchResult {
  createdAt: Date;
  email: string;
  firstName: string;
  id: string;
  isVolunteer: boolean | null;
  lastName: string;
}

/** 'GetUsersForAdminSearch' query type */
export interface IGetUsersForAdminSearchQuery {
  params: IGetUsersForAdminSearchParams;
  result: IGetUsersForAdminSearchResult;
}

const getUsersForAdminSearchIR: any = {"name":"getUsersForAdminSearch","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6614,"b":6619,"line":294,"col":9},{"a":6655,"b":6660,"line":295,"col":19}]}},{"name":"email","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6670,"b":6674,"line":296,"col":7},{"a":6716,"b":6720,"line":297,"col":25}]}},{"name":"firstName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6730,"b":6738,"line":298,"col":7},{"a":6785,"b":6793,"line":299,"col":30}]}},{"name":"lastName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6803,"b":6810,"line":300,"col":7},{"a":6856,"b":6863,"line":301,"col":29}]}},{"name":"partnerOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6873,"b":6882,"line":302,"col":7},{"a":6940,"b":6949,"line":303,"col":41},{"a":6990,"b":6999,"line":304,"col":39}]}},{"name":"highSchool","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7009,"b":7018,"line":305,"col":7},{"a":7061,"b":7070,"line":306,"col":26},{"a":7115,"b":7124,"line":307,"col":43}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7135,"b":7140,"line":308,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7157,"b":7163,"line":308,"col":30}]}}],"usedParamSet":{"userId":true,"email":true,"firstName":true,"lastName":true,"partnerOrg":true,"highSchool":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    users.id,\n    users.email,\n    users.first_name,\n    users.last_name,\n    users.created_at,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN schools ON schools.id = student_profiles.school_id\n    LEFT JOIN school_nces_metadata ON school_nces_metadata.school_id = schools.id\nWHERE ((:userId)::uuid IS NULL\n    OR users.id = :userId)\nAND ((:email)::text IS NULL\n    OR users.email LIKE :email)\nAND ((:firstName)::text IS NULL\n    OR users.first_name LIKE :firstName)\nAND ((:lastName)::text IS NULL\n    OR users.last_name LIKE :lastName)\nAND ((:partnerOrg)::text IS NULL\n    OR volunteer_partner_orgs.name LIKE :partnerOrg\n    OR student_partner_orgs.name LIKE :partnerOrg)\nAND ((:highSchool)::text IS NULL\n    OR schools.name LIKE :highSchool\n    OR school_nces_metadata.sch_name LIKE :highSchool)\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":5835,"b":7169,"line":274,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.email,
 *     users.first_name,
 *     users.last_name,
 *     users.created_at,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_volunteer
 * FROM
 *     users
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 *     LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN schools ON schools.id = student_profiles.school_id
 *     LEFT JOIN school_nces_metadata ON school_nces_metadata.school_id = schools.id
 * WHERE ((:userId)::uuid IS NULL
 *     OR users.id = :userId)
 * AND ((:email)::text IS NULL
 *     OR users.email LIKE :email)
 * AND ((:firstName)::text IS NULL
 *     OR users.first_name LIKE :firstName)
 * AND ((:lastName)::text IS NULL
 *     OR users.last_name LIKE :lastName)
 * AND ((:partnerOrg)::text IS NULL
 *     OR volunteer_partner_orgs.name LIKE :partnerOrg
 *     OR student_partner_orgs.name LIKE :partnerOrg)
 * AND ((:highSchool)::text IS NULL
 *     OR schools.name LIKE :highSchool
 *     OR school_nces_metadata.sch_name LIKE :highSchool)
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
export const getUsersForAdminSearch = new PreparedQuery<IGetUsersForAdminSearchParams,IGetUsersForAdminSearchResult>(getUsersForAdminSearchIR);


/** 'GetUserForAdminDetail' parameters type */
export interface IGetUserForAdminDetailParams {
  userId: string;
}

/** 'GetUserForAdminDetail' return type */
export interface IGetUserForAdminDetailResult {
  approvedHighSchool: Json | null;
  country: string | null;
  createdAt: Date;
  currentGrade: string;
  email: string;
  firstname: string;
  id: string;
  inGatesStudy: boolean;
  isAdmin: boolean | null;
  isApproved: boolean;
  isDeactivated: boolean;
  isOnboarded: boolean;
  isTestUser: boolean;
  isVolunteer: boolean | null;
  lastname: string;
  numPastSessions: string | null;
  occupation: stringArray | null;
  partnerSite: string;
  photoIdS3Key: string | null;
  photoIdStatus: string;
  studentPartnerOrg: string;
  verified: boolean;
  volunteerPartnerOrg: string;
  zipCode: string | null;
}

/** 'GetUserForAdminDetail' query type */
export interface IGetUserForAdminDetailQuery {
  params: IGetUserForAdminDetailParams;
  result: IGetUserForAdminDetailResult;
}

const getUserForAdminDetailIR: any = {"name":"getUserForAdminDetail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9377,"b":9383,"line":364,"col":28},{"a":9414,"b":9420,"line":365,"col":29},{"a":9758,"b":9764,"line":374,"col":23},{"a":9849,"b":9855,"line":378,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name AS firstname,\n    users.last_name AS lastname,\n    users.email,\n    users.created_at,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    volunteer_profiles.approved AS is_approved,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    volunteer_profiles.onboarded AS is_onboarded,\n    users.deactivated AS is_deactivated,\n    users.test_user AS is_test_user,\n    student_profiles.postal_code AS zip_code,\n    student_partner_orgs.name AS student_partner_org,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    volunteer_profiles.photo_id_s3_key,\n    photo_id_statuses.name AS photo_id_status,\n    volunteer_profiles.country,\n    users.verified,\n    user_product_flags.gates_qualified AS in_gates_study,\n    grade_levels.name AS current_grade,\n    student_partner_org_sites.name AS partner_site,\n    session_count.total AS num_past_sessions,\n    occupations.occupation,\n    json_build_object('nameStored', schools.name, 'SCH_NAME', school_nces_metadata.sch_name) AS approved_high_school\nFROM\n    users\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN student_partner_org_sites ON student_partner_org_sites.id = student_profiles.student_partner_org_site_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id\n    LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    LEFT JOIN user_product_flags ON user_product_flags.user_id = users.id\n    LEFT JOIN grade_levels ON grade_levels.id = student_profiles.grade_level_id\n    LEFT JOIN (\n        SELECT\n            COUNT(*) AS total\n        FROM\n            sessions\n        WHERE\n            volunteer_id = :userId!\n            OR student_id = :userId!) AS session_count ON TRUE\n    LEFT JOIN schools ON schools.id = student_profiles.school_id\n    LEFT JOIN school_nces_metadata ON school_nces_metadata.school_id = schools.id\n    LEFT JOIN (\n        SELECT\n            array_agg(occupation) AS occupation\n        FROM\n            volunteer_occupations\n        WHERE\n            user_id = :userId!\n        GROUP BY\n            user_id) AS occupations ON TRUE\nWHERE\n    users.id = :userId!","loc":{"a":7208,"b":9855,"line":312,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name AS firstname,
 *     users.last_name AS lastname,
 *     users.email,
 *     users.created_at,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_volunteer,
 *     volunteer_profiles.approved AS is_approved,
 *     (
 *         CASE WHEN admin_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_admin,
 *     volunteer_profiles.onboarded AS is_onboarded,
 *     users.deactivated AS is_deactivated,
 *     users.test_user AS is_test_user,
 *     student_profiles.postal_code AS zip_code,
 *     student_partner_orgs.name AS student_partner_org,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     volunteer_profiles.photo_id_s3_key,
 *     photo_id_statuses.name AS photo_id_status,
 *     volunteer_profiles.country,
 *     users.verified,
 *     user_product_flags.gates_qualified AS in_gates_study,
 *     grade_levels.name AS current_grade,
 *     student_partner_org_sites.name AS partner_site,
 *     session_count.total AS num_past_sessions,
 *     occupations.occupation,
 *     json_build_object('nameStored', schools.name, 'SCH_NAME', school_nces_metadata.sch_name) AS approved_high_school
 * FROM
 *     users
 *     LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
 *     LEFT JOIN student_partner_org_sites ON student_partner_org_sites.id = student_profiles.student_partner_org_site_id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id
 *     LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status
 *     LEFT JOIN user_product_flags ON user_product_flags.user_id = users.id
 *     LEFT JOIN grade_levels ON grade_levels.id = student_profiles.grade_level_id
 *     LEFT JOIN (
 *         SELECT
 *             COUNT(*) AS total
 *         FROM
 *             sessions
 *         WHERE
 *             volunteer_id = :userId!
 *             OR student_id = :userId!) AS session_count ON TRUE
 *     LEFT JOIN schools ON schools.id = student_profiles.school_id
 *     LEFT JOIN school_nces_metadata ON school_nces_metadata.school_id = schools.id
 *     LEFT JOIN (
 *         SELECT
 *             array_agg(occupation) AS occupation
 *         FROM
 *             volunteer_occupations
 *         WHERE
 *             user_id = :userId!
 *         GROUP BY
 *             user_id) AS occupations ON TRUE
 * WHERE
 *     users.id = :userId!
 * ```
 */
export const getUserForAdminDetail = new PreparedQuery<IGetUserForAdminDetailParams,IGetUserForAdminDetailResult>(getUserForAdminDetailIR);


/** 'GetLegacyUser' parameters type */
export interface IGetLegacyUserParams {
  userId: string;
}

/** 'GetLegacyUser' return type */
export interface IGetLegacyUserResult {
  availabilityLastModifiedAt: Date;
  banReason: string;
  college: string | null;
  country: string | null;
  createdAt: Date;
  email: string;
  firstname: string;
  firstName: string;
  hoursTutored: number | null;
  id: string;
  isAdmin: boolean | null;
  isApproved: boolean;
  isBanned: boolean;
  isDeactivated: boolean;
  isFakeUser: boolean | null;
  isOnboarded: boolean;
  isTestUser: boolean;
  isVolunteer: boolean | null;
  lastActivityAt: Date | null;
  occupation: stringArray | null;
  partnerSite: string;
  pastSessions: stringArray | null;
  phone: string | null;
  photoIdStatus: string;
  referralCode: string;
  referredBy: string | null;
  studentPartnerOrg: string;
  subjects: stringArray | null;
  timezone: string;
  type: string | null;
  verified: boolean;
  volunteerPartnerOrg: string;
}

/** 'GetLegacyUser' query type */
export interface IGetLegacyUserQuery {
  params: IGetLegacyUserParams;
  result: IGetLegacyUserResult;
}

const getLegacyUserIR: any = {"name":"getLegacyUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11637,"b":11643,"line":438,"col":46},{"a":11897,"b":11903,"line":448,"col":23},{"a":13636,"b":13642,"line":479,"col":32},{"a":14068,"b":14074,"line":492,"col":26},{"a":14107,"b":14113,"line":493,"col":31},{"a":14163,"b":14169,"line":495,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name,\n    users.created_at,\n    users.email,\n    users.verified,\n    users.first_name AS firstname,\n    users.phone,\n    volunteer_profiles.college,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    users.banned AS is_banned,\n    ban_reasons.name AS ban_reason,\n    users.test_user AS is_test_user,\n    FALSE AS is_fake_user,\n    users.deactivated AS is_deactivated,\n    users.last_activity_at AS last_activity_at,\n    users.referral_code AS referral_code,\n    users.referred_by AS referred_by,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            'volunteer'\n        ELSE\n            'student'\n        END) AS TYPE,\n    volunteer_profiles.onboarded AS is_onboarded,\n    volunteer_profiles.approved AS is_approved,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    volunteer_profiles.country,\n    volunteer_profiles.timezone,\n    photo_id_statuses.name AS photo_id_status,\n    past_sessions.sessions AS past_sessions,\n    round(past_sessions.time_tutored / 3600000::numeric, 2)::float AS hours_tutored,\n    total_subjects.subjects AS subjects,\n    recent_availability.updated_at AS availability_last_modified_at,\n    occupations.occupations AS occupation,\n    student_partner_org_sites.name AS partner_site,\n    student_partner_orgs.name AS student_partner_org\nFROM\n    users\n    LEFT JOIN (\n        SELECT\n            updated_at\n        FROM\n            availability_histories\n        WHERE\n            availability_histories.user_id = :userId!\n        ORDER BY\n            updated_at\n        LIMIT 1) AS recent_availability ON TRUE\n    LEFT JOIN (\n        SELECT\n            array_agg(occupation) AS occupations\n        FROM\n            volunteer_occupations\n        WHERE\n            user_id = :userId!) AS occupations ON TRUE\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN admin_profiles ON users.id = admin_profiles.user_id\n    LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\n    LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id\n    LEFT JOIN ban_reasons ON users.ban_reason_id = ban_reasons.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN student_partner_org_sites ON student_partner_org_sites.id = student_profiles.student_partner_org_site_id\n    LEFT JOIN (\n        SELECT\n            array_agg(subjects_unlocked.subject) AS subjects\n        FROM (\n            SELECT\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_certs.total\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN users ON users.id = users_certifications.user_id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        certification_subject_unlocks\n                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_certs ON subject_certs.name = subjects.name\n                WHERE\n                    users.id = :userId!\n                GROUP BY\n                    subjects.name,\n                    subject_certs.total\n                HAVING\n                    COUNT(*)::int >= subject_certs.total) AS subjects_unlocked) AS total_subjects ON TRUE\n    LEFT JOIN (\n        SELECT\n            array_agg(id) AS sessions,\n            sum(time_tutored)::int AS time_tutored\n        FROM\n            sessions\n        WHERE\n            student_id = :userId!\n            OR volunteer_id = :userId!) AS past_sessions ON TRUE\nWHERE\n    users.id = :userId!","loc":{"a":9886,"b":14169,"line":382,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name,
 *     users.created_at,
 *     users.email,
 *     users.verified,
 *     users.first_name AS firstname,
 *     users.phone,
 *     volunteer_profiles.college,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_volunteer,
 *     (
 *         CASE WHEN admin_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_admin,
 *     users.banned AS is_banned,
 *     ban_reasons.name AS ban_reason,
 *     users.test_user AS is_test_user,
 *     FALSE AS is_fake_user,
 *     users.deactivated AS is_deactivated,
 *     users.last_activity_at AS last_activity_at,
 *     users.referral_code AS referral_code,
 *     users.referred_by AS referred_by,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
 *             'volunteer'
 *         ELSE
 *             'student'
 *         END) AS TYPE,
 *     volunteer_profiles.onboarded AS is_onboarded,
 *     volunteer_profiles.approved AS is_approved,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     volunteer_profiles.country,
 *     volunteer_profiles.timezone,
 *     photo_id_statuses.name AS photo_id_status,
 *     past_sessions.sessions AS past_sessions,
 *     round(past_sessions.time_tutored / 3600000::numeric, 2)::float AS hours_tutored,
 *     total_subjects.subjects AS subjects,
 *     recent_availability.updated_at AS availability_last_modified_at,
 *     occupations.occupations AS occupation,
 *     student_partner_org_sites.name AS partner_site,
 *     student_partner_orgs.name AS student_partner_org
 * FROM
 *     users
 *     LEFT JOIN (
 *         SELECT
 *             updated_at
 *         FROM
 *             availability_histories
 *         WHERE
 *             availability_histories.user_id = :userId!
 *         ORDER BY
 *             updated_at
 *         LIMIT 1) AS recent_availability ON TRUE
 *     LEFT JOIN (
 *         SELECT
 *             array_agg(occupation) AS occupations
 *         FROM
 *             volunteer_occupations
 *         WHERE
 *             user_id = :userId!) AS occupations ON TRUE
 *     LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 *     LEFT JOIN admin_profiles ON users.id = admin_profiles.user_id
 *     LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id
 *     LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id
 *     LEFT JOIN ban_reasons ON users.ban_reason_id = ban_reasons.id
 *     LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
 *     LEFT JOIN student_partner_org_sites ON student_partner_org_sites.id = student_profiles.student_partner_org_site_id
 *     LEFT JOIN (
 *         SELECT
 *             array_agg(subjects_unlocked.subject) AS subjects
 *         FROM (
 *             SELECT
 *                 subjects.name AS subject,
 *                 COUNT(*)::int AS earned_certs,
 *                 subject_certs.total
 *             FROM
 *                 users_certifications
 *                 JOIN certification_subject_unlocks USING (certification_id)
 *                 JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *                 JOIN users ON users.id = users_certifications.user_id
 *                 JOIN (
 *                     SELECT
 *                         subjects.name, COUNT(*)::int AS total
 *                     FROM
 *                         certification_subject_unlocks
 *                         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *                     GROUP BY
 *                         subjects.name) AS subject_certs ON subject_certs.name = subjects.name
 *                 WHERE
 *                     users.id = :userId!
 *                 GROUP BY
 *                     subjects.name,
 *                     subject_certs.total
 *                 HAVING
 *                     COUNT(*)::int >= subject_certs.total) AS subjects_unlocked) AS total_subjects ON TRUE
 *     LEFT JOIN (
 *         SELECT
 *             array_agg(id) AS sessions,
 *             sum(time_tutored)::int AS time_tutored
 *         FROM
 *             sessions
 *         WHERE
 *             student_id = :userId!
 *             OR volunteer_id = :userId!) AS past_sessions ON TRUE
 * WHERE
 *     users.id = :userId!
 * ```
 */
export const getLegacyUser = new PreparedQuery<IGetLegacyUserParams,IGetLegacyUserResult>(getLegacyUserIR);


/** 'GetUserToCreateSendGridContact' parameters type */
export interface IGetUserToCreateSendGridContactParams {
  userId: string;
}

/** 'GetUserToCreateSendGridContact' return type */
export interface IGetUserToCreateSendGridContactResult {
  banned: boolean;
  createdAt: Date;
  deactivated: boolean;
  email: string;
  firstName: string;
  id: string;
  isAdmin: boolean | null;
  isVolunteer: boolean | null;
  lastActivityAt: Date | null;
  lastName: string;
  passedUpchieve101: boolean | null;
  studentPartnerOrg: string;
  studentPartnerOrgDisplay: string;
  testUser: boolean;
  volunteerPartnerOrg: string;
  volunteerPartnerOrgDisplay: string;
}

/** 'GetUserToCreateSendGridContact' query type */
export interface IGetUserToCreateSendGridContactQuery {
  params: IGetUserToCreateSendGridContactParams;
  result: IGetUserToCreateSendGridContactResult;
}

const getUserToCreateSendGridContactIR: any = {"name":"getUserToCreateSendGridContact","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15772,"b":15778,"line":538,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    email,\n    banned,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    volunteer_partner_orgs.name AS volunteer_partner_org_display,\n    student_partner_orgs.key AS student_partner_org,\n    student_partner_orgs.name AS student_partner_org_display,\n    users.last_activity_at,\n    users.created_at,\n    users.deactivated,\n    (CASE WHEN user_upchieve101.id IS NULL THEN FALSE ELSE TRUE END) AS passed_upchieve101,\n    users.test_user,\n    users.last_name\nFROM\n    users\n    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN LATERAL (\n        SELECT id FROM users_training_courses\n        LEFT JOIN training_courses ON training_courses.id = users_training_courses.training_course_id\n        WHERE users_training_courses.user_id = users.id AND training_courses.name = 'UPchieve 101'\n    ) AS user_upchieve101 ON TRUE\nWHERE\n    users.id = :userId!\nLIMIT 1","loc":{"a":14216,"b":15786,"line":498,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     email,
 *     banned,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_volunteer,
 *     (
 *         CASE WHEN admin_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_admin,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     volunteer_partner_orgs.name AS volunteer_partner_org_display,
 *     student_partner_orgs.key AS student_partner_org,
 *     student_partner_orgs.name AS student_partner_org_display,
 *     users.last_activity_at,
 *     users.created_at,
 *     users.deactivated,
 *     (CASE WHEN user_upchieve101.id IS NULL THEN FALSE ELSE TRUE END) AS passed_upchieve101,
 *     users.test_user,
 *     users.last_name
 * FROM
 *     users
 *     LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 *     LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
 *     LEFT JOIN LATERAL (
 *         SELECT id FROM users_training_courses
 *         LEFT JOIN training_courses ON training_courses.id = users_training_courses.training_course_id
 *         WHERE users_training_courses.user_id = users.id AND training_courses.name = 'UPchieve 101'
 *     ) AS user_upchieve101 ON TRUE
 * WHERE
 *     users.id = :userId!
 * LIMIT 1
 * ```
 */
export const getUserToCreateSendGridContact = new PreparedQuery<IGetUserToCreateSendGridContactParams,IGetUserToCreateSendGridContactResult>(getUserToCreateSendGridContactIR);


