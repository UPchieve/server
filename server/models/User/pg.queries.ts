/** Types generated for queries found in "server/models/User/user.sql" */
import { PreparedQuery } from '@pgtyped/query';

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

const getUserIdByPhoneIR: any = {"name":"getUserIdByPhone","params":[{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":171,"b":176,"line":16,"col":13}]}}],"usedParamSet":{"phone":true},"statement":{"body":"SELECT\n    id\nFROM\n    users\nWHERE\n    phone = :phone!\nLIMIT 1","loc":{"a":123,"b":184,"line":11,"col":0}}};

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
  email: string;
  firstName: string;
  id: string;
  isVolunteer: boolean | null;
  volunteerPartnerOrg: string;
}

/** 'GetUserContactInfoById' query type */
export interface IGetUserContactInfoByIdQuery {
  params: IGetUserContactInfoByIdParams;
  result: IGetUserContactInfoByIdResult;
}

const getUserContactInfoByIdIR: any = {"name":"getUserContactInfoById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":654,"b":656,"line":35,"col":16}]}}],"usedParamSet":{"id":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    email,\n    (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN true\n        ELSE FALSE\n    END) AS is_volunteer,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM\n    users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.id = :id!\nLIMIT 1","loc":{"a":225,"b":664,"line":22,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     email,
 *     (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN true
 *         ELSE FALSE
 *     END) AS is_volunteer,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM
 *     users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
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
  email: string;
  firstName: string;
  id: string;
  isVolunteer: boolean | null;
  volunteerPartnerOrg: string;
}

/** 'GetUserContactInfoByReferralCode' query type */
export interface IGetUserContactInfoByReferralCodeQuery {
  params: IGetUserContactInfoByReferralCodeParams;
  result: IGetUserContactInfoByReferralCodeResult;
}

const getUserContactInfoByReferralCodeIR: any = {"name":"getUserContactInfoByReferralCode","params":[{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1148,"b":1160,"line":53,"col":21}]}}],"usedParamSet":{"referralCode":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    email,\n    (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN true\n        ELSE FALSE\n    END) AS is_volunteer,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM\n    users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    referral_code = :referralCode!\nLIMIT 1","loc":{"a":714,"b":1168,"line":40,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     email,
 *     (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN true
 *         ELSE FALSE
 *     END) AS is_volunteer,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM
 *     users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
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

const getUserForPassportIR: any = {"name":"getUserForPassport","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1277,"b":1282,"line":65,"col":13}]}}],"usedParamSet":{"email":true},"statement":{"body":"SELECT\n    id,\n    email,\n    PASSWORD\nFROM\n    users\nWHERE\n    email = :email!\nLIMIT 1","loc":{"a":1204,"b":1290,"line":58,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     email,
 *     password
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
  email: string;
  firstName: string;
  id: string;
  isVolunteer: boolean | null;
  volunteerPartnerOrg: string;
}

/** 'GetUserContactInfoByResetToken' query type */
export interface IGetUserContactInfoByResetTokenQuery {
  params: IGetUserContactInfoByResetTokenParams;
  result: IGetUserContactInfoByResetTokenResult;
}

const getUserContactInfoByResetTokenIR: any = {"name":"getUserContactInfoByResetToken","params":[{"name":"resetToken","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1779,"b":1789,"line":83,"col":28}]}}],"usedParamSet":{"resetToken":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    email,\n    (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN true\n        ELSE FALSE\n    END) AS is_volunteer,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM\n    users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    password_reset_token = :resetToken!\nLIMIT 1","loc":{"a":1338,"b":1797,"line":70,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     email,
 *     (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN true
 *         ELSE FALSE
 *     END) AS is_volunteer,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM
 *     users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
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

const countUsersReferredByOtherIdIR: any = {"name":"countUsersReferredByOtherId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1916,"b":1922,"line":93,"col":19}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    count(*)::int AS total\nFROM\n    users\nWHERE\n    referred_by = :userId!","loc":{"a":1842,"b":1922,"line":88,"col":0}}};

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

const updateUserResetTokenByIdIR: any = {"name":"updateUserResetTokenById","params":[{"name":"token","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2013,"b":2018,"line":100,"col":28}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2060,"b":2066,"line":103,"col":10}]}}],"usedParamSet":{"token":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    password_reset_token = :token!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id","loc":{"a":1964,"b":2083,"line":97,"col":0}}};

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

const updateUserPasswordByIdIR: any = {"name":"updateUserPasswordById","params":[{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2160,"b":2168,"line":112,"col":16}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2210,"b":2216,"line":115,"col":10}]}}],"usedParamSet":{"password":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    PASSWORD = :password!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":2123,"b":2239,"line":109,"col":0}}};

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

const insertUserIpByIdIR: any = {"name":"insertUserIpById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2388,"b":2390,"line":123,"col":17}]}},{"name":"ipId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2394,"b":2398,"line":123,"col":23},{"a":2643,"b":2647,"line":138,"col":25}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2402,"b":2408,"line":123,"col":31},{"a":2676,"b":2682,"line":139,"col":27}]}}],"usedParamSet":{"id":true,"ipId":true,"userId":true},"statement":{"body":"WITH ins AS (\nINSERT INTO users_ip_addresses (id, ip_address_id, user_id, created_at, updated_at)\n        VALUES (:id!, :ipId!, :userId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id AS ok\n    FROM\n        users_ip_addresses\n    WHERE\n        ip_address_id = :ipId!\n            AND user_id = :userId!","loc":{"a":2273,"b":2682,"line":121,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO users_ip_addresses (id, ip_address_id, user_id, created_at, updated_at)
 *         VALUES (:id!, :ipId!, :userId!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM users_ip_addresses WHERE ip_address_id = :ipId! AND user_id = :userId!
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

const updateUserVerifiedEmailByIdIR: any = {"name":"updateUserVerifiedEmailById","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2761,"b":2766,"line":146,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2856,"b":2862,"line":151,"col":10}]}}],"usedParamSet":{"email":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    email = :email!,\n    email_verified = TRUE,\n    verified = TRUE,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":2727,"b":2885,"line":143,"col":0}}};

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

const updateUserVerifiedPhoneByIdIR: any = {"name":"updateUserVerifiedPhoneById","params":[{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2964,"b":2969,"line":160,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3059,"b":3065,"line":165,"col":10}]}}],"usedParamSet":{"phone":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    phone = :phone!,\n    phone_verified = TRUE,\n    verified = TRUE,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":2930,"b":3088,"line":157,"col":0}}};

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

const updateUserLastActivityByIdIR: any = {"name":"updateUserLastActivityById","params":[{"name":"lastActivityAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3177,"b":3191,"line":174,"col":24}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3233,"b":3239,"line":177,"col":10}]}}],"usedParamSet":{"lastActivityAt":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    last_activity_at = :lastActivityAt!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":3132,"b":3262,"line":171,"col":0}}};

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

const updateUserBanByIdIR: any = {"name":"updateUserBanById","params":[{"name":"banReason","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3540,"b":3549,"line":196,"col":16}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3580,"b":3586,"line":198,"col":10}]}}],"usedParamSet":{"banReason":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    banned = subquery.banned,\n    ban_reason_id = subquery.ban_reason_id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        TRUE AS banned,\n        id AS ban_reason_id\n    FROM\n        ban_reasons\n    WHERE\n        name = :banReason!) AS subquery\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":3297,"b":3609,"line":183,"col":0}}};

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
 *         true AS banned,
 *         id AS ban_reason_id
 *     FROM
 *         ban_reasons
 *     WHERE
 *         name = :banReason!
 * ) AS subquery
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

const getUserForAdminUpdateIR: any = {"name":"getUserForAdminUpdate","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4143,"b":4149,"line":218,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    banned,\n    email,\n    deactivated,\n    (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN true\n        ELSE FALSE\n    END) AS is_volunteer,\n    student_partner_orgs.name AS student_partner_org\nFROM\n    users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN student_profiles ON student_profiles.user_id = users.id\nLEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\nWHERE\n    users.id = :userId!","loc":{"a":3647,"b":4149,"line":203,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     banned,
 *     email,
 *     deactivated,
 *     (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN true
 *         ELSE FALSE
 *     END) AS is_volunteer,
 *     student_partner_orgs.name AS student_partner_org
 * FROM
 *     users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 * LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
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

const getUsersForAdminSearchIR: any = {"name":"getUsersForAdminSearch","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4910,"b":4915,"line":239,"col":7},{"a":4947,"b":4952,"line":239,"col":44}]}},{"name":"email","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4966,"b":4970,"line":240,"col":7},{"a":5008,"b":5012,"line":240,"col":49}]}},{"name":"firstName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5026,"b":5034,"line":241,"col":7},{"a":5077,"b":5085,"line":241,"col":58}]}},{"name":"lastName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5099,"b":5106,"line":242,"col":7},{"a":5148,"b":5155,"line":242,"col":56}]}},{"name":"partnerOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5169,"b":5178,"line":243,"col":7},{"a":5232,"b":5241,"line":243,"col":70},{"a":5278,"b":5287,"line":243,"col":116}]}},{"name":"highSchool","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5301,"b":5310,"line":244,"col":7},{"a":5349,"b":5358,"line":244,"col":55},{"a":5399,"b":5408,"line":244,"col":105}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5419,"b":5424,"line":245,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5441,"b":5447,"line":245,"col":30}]}}],"usedParamSet":{"userId":true,"email":true,"firstName":true,"lastName":true,"partnerOrg":true,"highSchool":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    users.id,\n    users.email,\n    users.first_name,\n    users.last_name,\n    users.created_at,\n    (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN true\n        ELSE FALSE\n    END) AS is_volunteer\nFROM\n    users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN student_profiles ON student_profiles.user_id = users.id\nLEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nLEFT JOIN schools ON schools.id = student_profiles.school_id\nLEFT JOIN school_nces_metadata ON school_nces_metadata.school_id = schools.id\nWHERE\n    ((:userId)::uuid IS NULL OR users.id = :userId) AND\n    ((:email)::text IS NULL OR users.email LIKE :email) AND\n    ((:firstName)::text IS NULL OR users.first_name LIKE :firstName) AND\n    ((:lastName)::text IS NULL OR users.last_name LIKE :lastName) AND\n    ((:partnerOrg)::text IS NULL OR volunteer_partner_orgs.name LIKE :partnerOrg OR student_partner_orgs.name LIKE :partnerOrg) AND\n    ((:highSchool)::text IS NULL OR schools.name LIKE :highSchool OR school_nces_metadata.sch_name LIKE :highSchool)\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":4188,"b":5453,"line":221,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.email,
 *     users.first_name,
 *     users.last_name,
 *     users.created_at,
 *     (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN true
 *         ELSE FALSE
 *     END) AS is_volunteer
 * FROM
 *     users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 * LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * LEFT JOIN schools ON schools.id = student_profiles.school_id
 * LEFT JOIN school_nces_metadata ON school_nces_metadata.school_id = schools.id
 * WHERE
 *     ((:userId)::uuid IS NULL OR users.id = :userId) AND
 *     ((:email)::text IS NULL OR users.email LIKE :email) AND
 *     ((:firstName)::text IS NULL OR users.first_name LIKE :firstName) AND
 *     ((:lastName)::text IS NULL OR users.last_name LIKE :lastName) AND
 *     ((:partnerOrg)::text IS NULL OR volunteer_partner_orgs.name LIKE :partnerOrg OR student_partner_orgs.name LIKE :partnerOrg) AND
 *     ((:highSchool)::text IS NULL OR schools.name LIKE :highSchool OR school_nces_metadata.sch_name LIKE :highSchool)
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
export const getUsersForAdminSearch = new PreparedQuery<IGetUsersForAdminSearchParams,IGetUsersForAdminSearchResult>(getUsersForAdminSearchIR);


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
  pastSessions: stringArray | null;
  phone: string | null;
  photoIdStatus: string;
  referralCode: string;
  referredBy: string | null;
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

const getLegacyUserIR: any = {"name":"getLegacyUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6971,"b":6977,"line":296,"col":37},{"a":7161,"b":7167,"line":306,"col":15},{"a":8471,"b":8477,"line":337,"col":22},{"a":8786,"b":8792,"line":350,"col":17},{"a":8816,"b":8822,"line":351,"col":19},{"a":8873,"b":8879,"line":354,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name,\n    users.created_at,\n    users.email,\n    users.verified,\n    users.first_name AS firstname,\n    users.phone,\n    volunteer_profiles.college,\n    (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN true\n         ELSE FALSE\n    END) as is_volunteer,\n    (CASE WHEN admin_profiles.user_id IS NOT NULL THEN true\n         ELSE FALSE\n    END) as is_admin,\n    users.banned AS is_banned,\n    ban_reasons.name AS ban_reason,\n    users.test_user AS is_test_user,\n    false AS is_fake_user,\n    users.deactivated AS is_deactivated,\n    users.last_activity_at AS last_activity_at,\n    users.referral_code AS referral_code,\n    users.referred_by AS referred_by,\n    (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN 'volunteer'\n         ELSE 'student'\n    END) as type,\n    volunteer_profiles.onboarded AS is_onboarded,\n    volunteer_profiles.approved AS is_approved,\n    volunteer_partner_orgs.name AS volunteer_partner_org,\n    volunteer_profiles.country,\n    volunteer_profiles.timezone,\n    photo_id_statuses.name AS photo_id_status,\n    past_sessions.sessions AS past_sessions,\n    round(past_sessions.time_tutored/3600000::numeric, 2)::float AS hours_tutored,\n    total_subjects.subjects AS subjects,\n    recent_availability.updated_at AS availability_last_modified_at,\n    occupations.occupations AS occupation\nFROM users\nLEFT JOIN (\n  SELECT\n  \tupdated_at\n  FROM\n  \tavailability_histories \n  WHERE\n  \tavailability_histories.user_id = :userId!\n  ORDER BY updated_at\n  LIMIT 1\n) AS recent_availability ON true \nLEFT JOIN (\n  SELECT\n  \tarray_agg(occupation) AS occupations\n  FROM\n  \tvolunteer_occupations\n  WHERE\n    user_id = :userId!\n) AS occupations ON true\nLEFT JOIN admin_profiles ON users.id = admin_profiles.user_id\nLEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\nLEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\nLEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id\nLEFT JOIN ban_reasons ON users.ban_reason_id = ban_reasons.id\nLEFT JOIN (\n  SELECT\n    array_agg(subjects_unlocked.subject) AS subjects\n  FROM (\n      SELECT\n          subjects.name AS subject,\n          COUNT(*)::int AS earned_certs,\n          subject_certs.total\n      FROM\n          users_certifications\n          JOIN certification_subject_unlocks USING (certification_id)\n          JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n          JOIN users ON users.id = users_certifications.user_id\n          JOIN (\n              SELECT\n                  subjects.name,\n                  COUNT(*)::int AS total\n              FROM\n                  certification_subject_unlocks\n                  JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n              GROUP BY\n                  subjects.name\n          ) AS subject_certs ON subject_certs.name = subjects.name\n      WHERE\n          users.id = :userId!\n      GROUP BY\n          subjects.name, subject_certs.total\n      HAVING\n          COUNT(*)::int >= subject_certs.total) AS subjects_unlocked\n) AS total_subjects ON true\nLEFT JOIN (\n  SELECT\n  \tarray_agg(id) AS sessions,\n  \tsum(time_tutored)::int AS time_tutored\n  FROM\n  \tsessions\n  WHERE\n  \tstudent_id = :userId! OR\n  \tvolunteer_id = :userId!\n) AS past_sessions ON true\nWHERE\n    users.id = :userId!","loc":{"a":5487,"b":8879,"line":252,"col":0}}};

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
 *     (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN true
 *          ELSE FALSE
 *     END) as is_volunteer,
 *     (CASE WHEN admin_profiles.user_id IS NOT NULL THEN true
 *          ELSE FALSE
 *     END) as is_admin,
 *     users.banned AS is_banned,
 *     ban_reasons.name AS ban_reason,
 *     users.test_user AS is_test_user,
 *     false AS is_fake_user,
 *     users.deactivated AS is_deactivated,
 *     users.last_activity_at AS last_activity_at,
 *     users.referral_code AS referral_code,
 *     users.referred_by AS referred_by,
 *     (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN 'volunteer'
 *          ELSE 'student'
 *     END) as type,
 *     volunteer_profiles.onboarded AS is_onboarded,
 *     volunteer_profiles.approved AS is_approved,
 *     volunteer_partner_orgs.name AS volunteer_partner_org,
 *     volunteer_profiles.country,
 *     volunteer_profiles.timezone,
 *     photo_id_statuses.name AS photo_id_status,
 *     past_sessions.sessions AS past_sessions,
 *     round(past_sessions.time_tutored/3600000::numeric, 2)::float AS hours_tutored,
 *     total_subjects.subjects AS subjects,
 *     recent_availability.updated_at AS availability_last_modified_at,
 *     occupations.occupations AS occupation
 * FROM users
 * LEFT JOIN (
 *   SELECT
 *   	updated_at
 *   FROM
 *   	availability_histories 
 *   WHERE
 *   	availability_histories.user_id = :userId!
 *   ORDER BY updated_at
 *   LIMIT 1
 * ) AS recent_availability ON true 
 * LEFT JOIN (
 *   SELECT
 *   	array_agg(occupation) AS occupations
 *   FROM
 *   	volunteer_occupations
 *   WHERE
 *     user_id = :userId!
 * ) AS occupations ON true
 * LEFT JOIN admin_profiles ON users.id = admin_profiles.user_id
 * LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id
 * LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status
 * LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id
 * LEFT JOIN ban_reasons ON users.ban_reason_id = ban_reasons.id
 * LEFT JOIN (
 *   SELECT
 *     array_agg(subjects_unlocked.subject) AS subjects
 *   FROM (
 *       SELECT
 *           subjects.name AS subject,
 *           COUNT(*)::int AS earned_certs,
 *           subject_certs.total
 *       FROM
 *           users_certifications
 *           JOIN certification_subject_unlocks USING (certification_id)
 *           JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *           JOIN users ON users.id = users_certifications.user_id
 *           JOIN (
 *               SELECT
 *                   subjects.name,
 *                   COUNT(*)::int AS total
 *               FROM
 *                   certification_subject_unlocks
 *                   JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *               GROUP BY
 *                   subjects.name
 *           ) AS subject_certs ON subject_certs.name = subjects.name
 *       WHERE
 *           users.id = :userId!
 *       GROUP BY
 *           subjects.name, subject_certs.total
 *       HAVING
 *           COUNT(*)::int >= subject_certs.total) AS subjects_unlocked
 * ) AS total_subjects ON true
 * LEFT JOIN (
 *   SELECT
 *   	array_agg(id) AS sessions,
 *   	sum(time_tutored)::int AS time_tutored
 *   FROM
 *   	sessions
 *   WHERE
 *   	student_id = :userId! OR
 *   	volunteer_id = :userId!
 * ) AS past_sessions ON true
 * WHERE
 *     users.id = :userId!
 * ```
 */
export const getLegacyUser = new PreparedQuery<IGetLegacyUserParams,IGetLegacyUserResult>(getLegacyUserIR);


