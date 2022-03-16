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
  email: string;
  firstName: string;
  id: string;
}

/** 'GetUserContactInfoById' query type */
export interface IGetUserContactInfoByIdQuery {
  params: IGetUserContactInfoByIdParams;
  result: IGetUserContactInfoByIdResult;
}

const getUserContactInfoByIdIR: any = {"name":"getUserContactInfoById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":297,"b":299,"line":29,"col":10}]}}],"usedParamSet":{"id":true},"statement":{"body":"SELECT\n    id,\n    first_name,\n    email\nFROM\n    users\nWHERE\n    id = :id!\nLIMIT 1","loc":{"a":225,"b":307,"line":22,"col":0}}};

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

const getUserContactInfoByReferralCodeIR: any = {"name":"getUserContactInfoByReferralCode","params":[{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":440,"b":452,"line":41,"col":21}]}}],"usedParamSet":{"referralCode":true},"statement":{"body":"SELECT\n    id,\n    first_name,\n    email\nFROM\n    users\nWHERE\n    referral_code = :referralCode!\nLIMIT 1","loc":{"a":357,"b":460,"line":34,"col":0}}};

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

const getUserForPassportIR: any = {"name":"getUserForPassport","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":569,"b":574,"line":53,"col":13}]}}],"usedParamSet":{"email":true},"statement":{"body":"SELECT\n    id,\n    email,\n    PASSWORD\nFROM\n    users\nWHERE\n    email = :email!\nLIMIT 1","loc":{"a":496,"b":582,"line":46,"col":0}}};

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
  email: string;
  firstName: string;
  id: string;
}

/** 'GetUserContactInfoByResetToken' query type */
export interface IGetUserContactInfoByResetTokenQuery {
  params: IGetUserContactInfoByResetTokenParams;
  result: IGetUserContactInfoByResetTokenResult;
}

const getUserContactInfoByResetTokenIR: any = {"name":"getUserContactInfoByResetToken","params":[{"name":"resetToken","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":720,"b":730,"line":65,"col":28}]}}],"usedParamSet":{"resetToken":true},"statement":{"body":"SELECT\n    id,\n    first_name,\n    email\nFROM\n    users\nWHERE\n    password_reset_token = :resetToken!\nLIMIT 1","loc":{"a":630,"b":738,"line":58,"col":0}}};

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

const countUsersReferredByOtherIdIR: any = {"name":"countUsersReferredByOtherId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":857,"b":863,"line":75,"col":19}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    count(*)::int AS total\nFROM\n    users\nWHERE\n    referred_by = :userId!","loc":{"a":783,"b":863,"line":70,"col":0}}};

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

const updateUserResetTokenByIdIR: any = {"name":"updateUserResetTokenById","params":[{"name":"token","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":954,"b":959,"line":82,"col":28}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":977,"b":983,"line":84,"col":10}]}}],"usedParamSet":{"token":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    password_reset_token = :token!\nWHERE\n    id = :userId!\nRETURNING\n    id","loc":{"a":905,"b":1000,"line":79,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     password_reset_token = :token!
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

const updateUserPasswordByIdIR: any = {"name":"updateUserPasswordById","params":[{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1077,"b":1085,"line":93,"col":16}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1103,"b":1109,"line":95,"col":10}]}}],"usedParamSet":{"password":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    PASSWORD = :password!\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":1040,"b":1132,"line":90,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     PASSWORD = :password!
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

const insertUserIpByIdIR: any = {"name":"insertUserIpById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1281,"b":1283,"line":103,"col":17}]}},{"name":"ipId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1287,"b":1291,"line":103,"col":23},{"a":1536,"b":1540,"line":118,"col":25}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1295,"b":1301,"line":103,"col":31},{"a":1569,"b":1575,"line":119,"col":27}]}}],"usedParamSet":{"id":true,"ipId":true,"userId":true},"statement":{"body":"WITH ins AS (\nINSERT INTO users_ip_addresses (id, ip_address_id, user_id, created_at, updated_at)\n        VALUES (:id!, :ipId!, :userId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id AS ok\n    FROM\n        users_ip_addresses\n    WHERE\n        ip_address_id = :ipId!\n            AND user_id = :userId!","loc":{"a":1166,"b":1575,"line":101,"col":0}}};

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

const updateUserVerifiedEmailByIdIR: any = {"name":"updateUserVerifiedEmailById","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1654,"b":1659,"line":126,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1725,"b":1731,"line":130,"col":10}]}}],"usedParamSet":{"email":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    email = :email!,\n    email_verified = TRUE,\n    verified = TRUE\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":1620,"b":1754,"line":123,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     email = :email!,
 *     email_verified = TRUE,
 *     verified = TRUE
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

const updateUserVerifiedPhoneByIdIR: any = {"name":"updateUserVerifiedPhoneById","params":[{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1833,"b":1838,"line":139,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1904,"b":1910,"line":143,"col":10}]}}],"usedParamSet":{"phone":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    phone = :phone!,\n    phone_verified = TRUE,\n    verified = TRUE\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":1799,"b":1933,"line":136,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     phone = :phone!,
 *     phone_verified = TRUE,
 *     verified = TRUE
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

const updateUserLastActivityByIdIR: any = {"name":"updateUserLastActivityById","params":[{"name":"lastActivityAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2022,"b":2036,"line":152,"col":24}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2054,"b":2060,"line":154,"col":10}]}}],"usedParamSet":{"lastActivityAt":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    last_activity_at = :lastActivityAt!\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":1977,"b":2083,"line":149,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     last_activity_at = :lastActivityAt!
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

const updateUserBanByIdIR: any = {"name":"updateUserBanById","params":[{"name":"banReason","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2337,"b":2346,"line":172,"col":16}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2377,"b":2383,"line":174,"col":10}]}}],"usedParamSet":{"banReason":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    banned = subquery.banned,\n    ban_reason_id = subquery.ban_reason_id\nFROM (\n    SELECT\n        TRUE AS banned,\n        id AS ban_reason_id\n    FROM\n        ban_reasons\n    WHERE\n        name = :banReason!) AS subquery\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":2118,"b":2406,"line":160,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     banned = subquery.banned,
 *     ban_reason_id = subquery.ban_reason_id
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


/** 'GetLegacyUser' parameters type */
export interface IGetLegacyUserParams {
  userId: string;
}

/** 'GetLegacyUser' return type */
export interface IGetLegacyUserResult {
  banreason: string;
  college: string | null;
  country: string | null;
  createdAt: Date;
  email: string;
  firstname: string;
  firstName: string;
  id: string;
  isAdmin: boolean | null;
  isapproved: boolean;
  isbanned: boolean;
  isdeactivated: boolean;
  isfakeuser: boolean | null;
  isonboarded: boolean;
  istestuser: boolean;
  isVolunteer: boolean | null;
  lastactivityat: Date | null;
  phone: string | null;
  photoidstatus: number | null;
  referralcode: string;
  referredby: string | null;
  timezone: string;
  type: string | null;
  verified: boolean;
  volunteerpartnerorg: string;
}

/** 'GetLegacyUser' query type */
export interface IGetLegacyUserQuery {
  params: IGetLegacyUserParams;
  result: IGetLegacyUserResult;
}

const getLegacyUserIR: any = {"name":"getLegacyUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3973,"b":3979,"line":228,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name,\n    users.created_at,\n    users.email,\n    users.verified,\n    users.first_name AS firstname,\n    users.phone,\n    volunteer_profiles.college,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    users.banned AS isBanned,\n    ban_reasons.name AS banReason,\n    users.test_user AS isTestUser,\n    FALSE AS isFakeUser,\n    users.deactivated AS isDeactivated,\n    users.last_activity_at AS lastActivityAt,\n    users.referral_code AS referralCode,\n    users.referred_by AS referredBy,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            'volunteer'\n        ELSE\n            'student'\n        END) AS TYPE,\n    volunteer_profiles.onboarded AS isOnboarded,\n    volunteer_profiles.approved AS isApproved,\n    volunteer_partner_orgs.name AS volunteerPartnerOrg,\n    volunteer_profiles.country,\n    volunteer_profiles.timezone,\n    volunteer_profiles.photo_id_status AS photoIdStatus\nFROM\n    users\n    LEFT JOIN admin_profiles ON users.id = admin_profiles.user_id\n    LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id\n    LEFT JOIN ban_reasons ON users.ban_reason_id = ban_reasons.id\nWHERE\n    users.id = :userId!","loc":{"a":2437,"b":3979,"line":180,"col":0}}};

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
 *     users.banned AS isBanned,
 *     ban_reasons.name AS banReason,
 *     users.test_user AS isTestUser,
 *     FALSE AS isFakeUser,
 *     users.deactivated AS isDeactivated,
 *     users.last_activity_at AS lastActivityAt,
 *     users.referral_code AS referralCode,
 *     users.referred_by AS referredBy,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
 *             'volunteer'
 *         ELSE
 *             'student'
 *         END) AS TYPE,
 *     volunteer_profiles.onboarded AS isOnboarded,
 *     volunteer_profiles.approved AS isApproved,
 *     volunteer_partner_orgs.name AS volunteerPartnerOrg,
 *     volunteer_profiles.country,
 *     volunteer_profiles.timezone,
 *     volunteer_profiles.photo_id_status AS photoIdStatus
 * FROM
 *     users
 *     LEFT JOIN admin_profiles ON users.id = admin_profiles.user_id
 *     LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id
 *     LEFT JOIN ban_reasons ON users.ban_reason_id = ban_reasons.id
 * WHERE
 *     users.id = :userId!
 * ```
 */
export const getLegacyUser = new PreparedQuery<IGetLegacyUserParams,IGetLegacyUserResult>(getLegacyUserIR);


