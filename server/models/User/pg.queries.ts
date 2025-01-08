/** Types generated for queries found in "server/models/User/user.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** Query 'GetUserRolesById' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetUserRolesByIdResult = never;

/** Query 'GetUserRolesById' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetUserRolesByIdParams = never;

const getUserRolesByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":187,"b":190}]}],"statement":"SELECT\n    user_roles.name\nFROM\n    users\n    LEFT JOIN users_roles ON users_roles.user_id = users.id\n    LEFT JOIN user_roles ON user_roles.id = users_roles.role_id\nWHERE\n    users.id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_roles.name
 * FROM
 *     users
 *     LEFT JOIN users_roles ON users_roles.user_id = users.id
 *     LEFT JOIN user_roles ON user_roles.id = users_roles.role_id
 * WHERE
 *     users.id = :id!
 * ```
 */
export const getUserRolesById = new PreparedQuery<IGetUserRolesByIdParams,IGetUserRolesByIdResult>(getUserRolesByIdIR);


/** Query 'CreateUser' is invalid, so its result is assigned type 'never'.
 *  */
export type ICreateUserResult = never;

/** Query 'CreateUser' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ICreateUserParams = never;

const createUserIR: any = {"usedParamSet":{"id":true,"firstName":true,"lastName":true,"email":true,"proxyEmail":true,"phone":true,"password":true,"passwordResetToken":true,"verified":true,"emailVerified":true,"phoneVerified":true,"referredBy":true,"referralCode":true,"signupSourceId":true,"otherSignupSource":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":244,"b":247}]},{"name":"firstName","required":true,"transform":{"type":"scalar"},"locs":[{"a":250,"b":260}]},{"name":"lastName","required":true,"transform":{"type":"scalar"},"locs":[{"a":263,"b":272}]},{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":275,"b":281}]},{"name":"proxyEmail","required":false,"transform":{"type":"scalar"},"locs":[{"a":284,"b":294}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":297,"b":302}]},{"name":"password","required":false,"transform":{"type":"scalar"},"locs":[{"a":305,"b":313}]},{"name":"passwordResetToken","required":false,"transform":{"type":"scalar"},"locs":[{"a":316,"b":334}]},{"name":"verified","required":false,"transform":{"type":"scalar"},"locs":[{"a":337,"b":345}]},{"name":"emailVerified","required":false,"transform":{"type":"scalar"},"locs":[{"a":348,"b":361}]},{"name":"phoneVerified","required":false,"transform":{"type":"scalar"},"locs":[{"a":364,"b":377}]},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"locs":[{"a":380,"b":390}]},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":393,"b":406}]},{"name":"signupSourceId","required":false,"transform":{"type":"scalar"},"locs":[{"a":409,"b":423}]},{"name":"otherSignupSource","required":false,"transform":{"type":"scalar"},"locs":[{"a":426,"b":443}]}],"statement":"INSERT INTO users (id, first_name, last_name, email, proxy_email, phone, PASSWORD, password_reset_token, verified, email_verified, phone_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at)\n    VALUES (:id!, :firstName!, :lastName!, :email!, :proxyEmail, :phone, :password, :passwordResetToken, :verified, :emailVerified, :phoneVerified, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW())\nON CONFLICT (email)\n    DO NOTHING\nRETURNING\n    id, email, first_name, proxy_email"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (id, first_name, last_name, email, proxy_email, phone, PASSWORD, password_reset_token, verified, email_verified, phone_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at)
 *     VALUES (:id!, :firstName!, :lastName!, :email!, :proxyEmail, :phone, :password, :passwordResetToken, :verified, :emailVerified, :phoneVerified, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW())
 * ON CONFLICT (email)
 *     DO NOTHING
 * RETURNING
 *     id, email, first_name, proxy_email
 * ```
 */
export const createUser = new PreparedQuery<ICreateUserParams,ICreateUserResult>(createUserIR);


/** Query 'UpsertUser' is invalid, so its result is assigned type 'never'.
 *  */
export type IUpsertUserResult = never;

/** Query 'UpsertUser' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IUpsertUserParams = never;

const upsertUserIR: any = {"usedParamSet":{"id":true,"firstName":true,"lastName":true,"email":true,"proxyEmail":true,"phone":true,"password":true,"passwordResetToken":true,"verified":true,"emailVerified":true,"phoneVerified":true,"referredBy":true,"referralCode":true,"signupSourceId":true,"otherSignupSource":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":244,"b":247}]},{"name":"firstName","required":true,"transform":{"type":"scalar"},"locs":[{"a":250,"b":260},{"a":512,"b":522}]},{"name":"lastName","required":true,"transform":{"type":"scalar"},"locs":[{"a":263,"b":272},{"a":537,"b":546}]},{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":275,"b":281}]},{"name":"proxyEmail","required":false,"transform":{"type":"scalar"},"locs":[{"a":284,"b":294},{"a":563,"b":573}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":297,"b":302},{"a":584,"b":589}]},{"name":"password","required":false,"transform":{"type":"scalar"},"locs":[{"a":305,"b":313},{"a":603,"b":611}]},{"name":"passwordResetToken","required":false,"transform":{"type":"scalar"},"locs":[{"a":316,"b":334},{"a":637,"b":655}]},{"name":"verified","required":false,"transform":{"type":"scalar"},"locs":[{"a":337,"b":345},{"a":669,"b":677}]},{"name":"emailVerified","required":false,"transform":{"type":"scalar"},"locs":[{"a":348,"b":361},{"a":697,"b":710}]},{"name":"phoneVerified","required":false,"transform":{"type":"scalar"},"locs":[{"a":364,"b":377},{"a":730,"b":743}]},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"locs":[{"a":380,"b":390},{"a":760,"b":770}]},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":393,"b":406},{"a":789,"b":802}]},{"name":"signupSourceId","required":false,"transform":{"type":"scalar"},"locs":[{"a":409,"b":423},{"a":824,"b":838}]},{"name":"otherSignupSource","required":false,"transform":{"type":"scalar"},"locs":[{"a":426,"b":443},{"a":863,"b":880}]}],"statement":"INSERT INTO users (id, first_name, last_name, email, proxy_email, phone, PASSWORD, password_reset_token, verified, email_verified, phone_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at)\n    VALUES (:id!, :firstName!, :lastName!, :email!, :proxyEmail, :phone, :password, :passwordResetToken, :verified, :emailVerified, :phoneVerified, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW())\nON CONFLICT (email)\n    DO UPDATE SET\n        first_name = :firstName!, last_name = :lastName!, proxy_email = :proxyEmail, phone = :phone, PASSWORD = :password, password_reset_token = :passwordResetToken, verified = :verified, email_verified = :emailVerified, phone_verified = :phoneVerified, referred_by = :referredBy, referral_code = :referralCode!, signup_source_id = :signupSourceId, other_signup_source = :otherSignupSource\n    RETURNING\n        id, email, first_name, proxy_email, (xmax = 0) AS is_created"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (id, first_name, last_name, email, proxy_email, phone, PASSWORD, password_reset_token, verified, email_verified, phone_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at)
 *     VALUES (:id!, :firstName!, :lastName!, :email!, :proxyEmail, :phone, :password, :passwordResetToken, :verified, :emailVerified, :phoneVerified, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW())
 * ON CONFLICT (email)
 *     DO UPDATE SET
 *         first_name = :firstName!, last_name = :lastName!, proxy_email = :proxyEmail, phone = :phone, PASSWORD = :password, password_reset_token = :passwordResetToken, verified = :verified, email_verified = :emailVerified, phone_verified = :phoneVerified, referred_by = :referredBy, referral_code = :referralCode!, signup_source_id = :signupSourceId, other_signup_source = :otherSignupSource
 *     RETURNING
 *         id, email, first_name, proxy_email, (xmax = 0) AS is_created
 * ```
 */
export const upsertUser = new PreparedQuery<IUpsertUserParams,IUpsertUserResult>(upsertUserIR);


/** Query 'GetUserIdByEmail' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetUserIdByEmailResult = never;

/** Query 'GetUserIdByEmail' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetUserIdByEmailParams = never;

const getUserIdByEmailIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":47,"b":53}]}],"statement":"SELECT\n    id\nFROM\n    users\nWHERE\n    email = :email!\nLIMIT 1"};

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


/** Query 'GetUserIdByPhone' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetUserIdByPhoneResult = never;

/** Query 'GetUserIdByPhone' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetUserIdByPhoneParams = never;

const getUserIdByPhoneIR: any = {"usedParamSet":{"phone":true},"params":[{"name":"phone","required":true,"transform":{"type":"scalar"},"locs":[{"a":47,"b":53}]}],"statement":"SELECT\n    id\nFROM\n    users\nWHERE\n    phone = :phone!\nLIMIT 1"};

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


/** Query 'GetUserContactInfoById' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetUserContactInfoByIdResult = never;

/** Query 'GetUserContactInfoById' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetUserContactInfoByIdParams = never;

const getUserContactInfoByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":1243,"b":1246}]}],"statement":"SELECT\n    users.id,\n    first_name,\n    email,\n    proxy_email,\n    ban_type,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    student_partner_orgs.key AS student_partner_org,\n    users.last_activity_at,\n    deactivated,\n    volunteer_profiles.approved,\n    users.phone,\n    users.phone_verified,\n    users.sms_consent,\n    array_agg(user_roles.name) AS roles\nFROM\n    users\n    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN users_roles ON users_roles.user_id = users.id\n    LEFT JOIN user_roles ON user_roles.id = users_roles.role_id\nWHERE\n    users.id = :id!\nGROUP BY\n    users.id,\n    volunteer_profiles.user_id,\n    admin_profiles.user_id,\n    volunteer_partner_orgs.id,\n    student_partner_orgs.id\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     email,
 *     proxy_email,
 *     ban_type,
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
 *     deactivated,
 *     volunteer_profiles.approved,
 *     users.phone,
 *     users.phone_verified,
 *     users.sms_consent,
 *     array_agg(user_roles.name) AS roles
 * FROM
 *     users
 *     LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 *     LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
 *     LEFT JOIN users_roles ON users_roles.user_id = users.id
 *     LEFT JOIN user_roles ON user_roles.id = users_roles.role_id
 * WHERE
 *     users.id = :id!
 * GROUP BY
 *     users.id,
 *     volunteer_profiles.user_id,
 *     admin_profiles.user_id,
 *     volunteer_partner_orgs.id,
 *     student_partner_orgs.id
 * LIMIT 1
 * ```
 */
export const getUserContactInfoById = new PreparedQuery<IGetUserContactInfoByIdParams,IGetUserContactInfoByIdResult>(getUserContactInfoByIdIR);


/** Query 'GetUserByReferralCode' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetUserByReferralCodeResult = never;

/** Query 'GetUserByReferralCode' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetUserByReferralCodeParams = never;

const getUserByReferralCodeIR: any = {"usedParamSet":{"referralCode":true},"params":[{"name":"referralCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":77,"b":90}]}],"statement":"SELECT\n    users.id,\n    first_name\nFROM\n    users\nWHERE\n    referral_code = :referralCode!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name
 * FROM
 *     users
 * WHERE
 *     referral_code = :referralCode!
 * LIMIT 1
 * ```
 */
export const getUserByReferralCode = new PreparedQuery<IGetUserByReferralCodeParams,IGetUserByReferralCodeResult>(getUserByReferralCodeIR);


/** Query 'GetUserReferralLink' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetUserReferralLinkResult = never;

/** Query 'GetUserReferralLink' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetUserReferralLinkParams = never;

const getUserReferralLinkIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":82,"b":85}]}],"statement":"SELECT\n    first_name,\n    email,\n    referral_code\nFROM\n    users\nWHERE\n    id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     first_name,
 *     email,
 *     referral_code
 * FROM
 *     users
 * WHERE
 *     id = :id!
 * ```
 */
export const getUserReferralLink = new PreparedQuery<IGetUserReferralLinkParams,IGetUserReferralLinkResult>(getUserReferralLinkIR);


/** Query 'GetUserForPassport' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetUserForPassportResult = never;

/** Query 'GetUserForPassport' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetUserForPassportParams = never;

const getUserForPassportIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":102,"b":108}]}],"statement":"SELECT\n    id,\n    email,\n    proxy_email,\n    PASSWORD\nFROM\n    users\nWHERE\n    LOWER(email) = LOWER(:email!)\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     email,
 *     proxy_email,
 *     PASSWORD
 * FROM
 *     users
 * WHERE
 *     LOWER(email) = LOWER(:email!)
 * LIMIT 1
 * ```
 */
export const getUserForPassport = new PreparedQuery<IGetUserForPassportParams,IGetUserForPassportResult>(getUserForPassportIR);


/** Query 'GetUserByResetToken' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetUserByResetTokenResult = never;

/** Query 'GetUserByResetToken' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetUserByResetTokenParams = never;

const getUserByResetTokenIR: any = {"usedParamSet":{"resetToken":true},"params":[{"name":"resetToken","required":true,"transform":{"type":"scalar"},"locs":[{"a":73,"b":84}]}],"statement":"SELECT\n    id,\n    email\nFROM\n    users\nWHERE\n    password_reset_token = :resetToken!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     email
 * FROM
 *     users
 * WHERE
 *     password_reset_token = :resetToken!
 * ```
 */
export const getUserByResetToken = new PreparedQuery<IGetUserByResetTokenParams,IGetUserByResetTokenResult>(getUserByResetTokenIR);


/** Query 'DeleteUser' is invalid, so its result is assigned type 'never'.
 *  */
export type IDeleteUserResult = never;

/** Query 'DeleteUser' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IDeleteUserParams = never;

const deleteUserIR: any = {"usedParamSet":{"email":true,"userId":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":33,"b":39}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":80,"b":87}]}],"statement":"UPDATE\n    users\nSET\n    email = :email!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     email = :email!,
 *     updated_at = NOW()
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const deleteUser = new PreparedQuery<IDeleteUserParams,IDeleteUserResult>(deleteUserIR);


/** Query 'CountUsersReferredByOtherId' is invalid, so its result is assigned type 'never'.
 *  */
export type ICountUsersReferredByOtherIdResult = never;

/** Query 'CountUsersReferredByOtherId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ICountUsersReferredByOtherIdParams = never;

const countUsersReferredByOtherIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":73,"b":80}]}],"statement":"SELECT\n    count(*)::int AS total\nFROM\n    users\nWHERE\n    referred_by = :userId!\n    AND phone_verified IS TRUE\n    OR email_verified IS TRUE"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     count(*)::int AS total
 * FROM
 *     users
 * WHERE
 *     referred_by = :userId!
 *     AND phone_verified IS TRUE
 *     OR email_verified IS TRUE
 * ```
 */
export const countUsersReferredByOtherId = new PreparedQuery<ICountUsersReferredByOtherIdParams,ICountUsersReferredByOtherIdResult>(countUsersReferredByOtherIdIR);


/** Query 'UpdateUserResetTokenById' is invalid, so its result is assigned type 'never'.
 *  */
export type IUpdateUserResetTokenByIdResult = never;

/** Query 'UpdateUserResetTokenById' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IUpdateUserResetTokenByIdParams = never;

const updateUserResetTokenByIdIR: any = {"usedParamSet":{"token":true,"userId":true},"params":[{"name":"token","required":true,"transform":{"type":"scalar"},"locs":[{"a":48,"b":54}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":95,"b":102}]}],"statement":"UPDATE\n    users\nSET\n    password_reset_token = :token!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id"};

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


/** Query 'UpdateUserPasswordById' is invalid, so its result is assigned type 'never'.
 *  */
export type IUpdateUserPasswordByIdResult = never;

/** Query 'UpdateUserPasswordById' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IUpdateUserPasswordByIdParams = never;

const updateUserPasswordByIdIR: any = {"usedParamSet":{"password":true,"userId":true},"params":[{"name":"password","required":true,"transform":{"type":"scalar"},"locs":[{"a":36,"b":45}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":86,"b":93}]}],"statement":"UPDATE\n    users\nSET\n    PASSWORD = :password!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok"};

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


/** Query 'InsertUserIpById' is invalid, so its result is assigned type 'never'.
 *  */
export type IInsertUserIpByIdResult = never;

/** Query 'InsertUserIpById' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IInsertUserIpByIdParams = never;

const insertUserIpByIdIR: any = {"usedParamSet":{"id":true,"ipId":true,"userId":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":114,"b":117}]},{"name":"ipId","required":true,"transform":{"type":"scalar"},"locs":[{"a":120,"b":125},{"a":369,"b":374}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":128,"b":135},{"a":402,"b":409}]}],"statement":"WITH ins AS (\nINSERT INTO users_ip_addresses (id, ip_address_id, user_id, created_at, updated_at)\n        VALUES (:id!, :ipId!, :userId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id AS ok\n    FROM\n        users_ip_addresses\n    WHERE\n        ip_address_id = :ipId!\n            AND user_id = :userId!"};

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


/** Query 'UpdateUserVerifiedEmailById' is invalid, so its result is assigned type 'never'.
 *  */
export type IUpdateUserVerifiedEmailByIdResult = never;

/** Query 'UpdateUserVerifiedEmailById' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IUpdateUserVerifiedEmailByIdParams = never;

const updateUserVerifiedEmailByIdIR: any = {"usedParamSet":{"email":true,"userId":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":33,"b":39}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":128,"b":135}]}],"statement":"UPDATE\n    users\nSET\n    email = :email!,\n    email_verified = TRUE,\n    verified = TRUE,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    email AS ok"};

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
 *     email AS ok
 * ```
 */
export const updateUserVerifiedEmailById = new PreparedQuery<IUpdateUserVerifiedEmailByIdParams,IUpdateUserVerifiedEmailByIdResult>(updateUserVerifiedEmailByIdIR);


/** Query 'UpdateUserVerifiedPhoneById' is invalid, so its result is assigned type 'never'.
 *  */
export type IUpdateUserVerifiedPhoneByIdResult = never;

/** Query 'UpdateUserVerifiedPhoneById' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IUpdateUserVerifiedPhoneByIdParams = never;

const updateUserVerifiedPhoneByIdIR: any = {"usedParamSet":{"phone":true,"userId":true},"params":[{"name":"phone","required":true,"transform":{"type":"scalar"},"locs":[{"a":33,"b":39}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":128,"b":135}]}],"statement":"UPDATE\n    users\nSET\n    phone = :phone!,\n    phone_verified = TRUE,\n    verified = TRUE,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    phone AS ok"};

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
 *     phone AS ok
 * ```
 */
export const updateUserVerifiedPhoneById = new PreparedQuery<IUpdateUserVerifiedPhoneByIdParams,IUpdateUserVerifiedPhoneByIdResult>(updateUserVerifiedPhoneByIdIR);


/** Query 'UpdateUserPhoneNumberByUserId' is invalid, so its result is assigned type 'never'.
 *  */
export type IUpdateUserPhoneNumberByUserIdResult = never;

/** Query 'UpdateUserPhoneNumberByUserId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IUpdateUserPhoneNumberByUserIdParams = never;

const updateUserPhoneNumberByUserIdIR: any = {"usedParamSet":{"phone":true,"userId":true},"params":[{"name":"phone","required":true,"transform":{"type":"scalar"},"locs":[{"a":33,"b":39}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":80,"b":87}]}],"statement":"UPDATE\n    users\nSET\n    phone = :phone!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     phone = :phone!,
 *     updated_at = NOW()
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateUserPhoneNumberByUserId = new PreparedQuery<IUpdateUserPhoneNumberByUserIdParams,IUpdateUserPhoneNumberByUserIdResult>(updateUserPhoneNumberByUserIdIR);


/** Query 'UpdateUserLastActivityById' is invalid, so its result is assigned type 'never'.
 *  */
export type IUpdateUserLastActivityByIdResult = never;

/** Query 'UpdateUserLastActivityById' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IUpdateUserLastActivityByIdParams = never;

const updateUserLastActivityByIdIR: any = {"usedParamSet":{"lastActivityAt":true,"userId":true},"params":[{"name":"lastActivityAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":44,"b":59}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":100,"b":107}]}],"statement":"UPDATE\n    users\nSET\n    last_activity_at = :lastActivityAt!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok"};

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


/** Query 'UpdateUserBanById' is invalid, so its result is assigned type 'never'.
 *  */
export type IUpdateUserBanByIdResult = never;

/** Query 'UpdateUserBanById' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IUpdateUserBanByIdParams = never;

const updateUserBanByIdIR: any = {"usedParamSet":{"banType":true,"banReason":true,"userId":true},"params":[{"name":"banType","required":true,"transform":{"type":"scalar"},"locs":[{"a":36,"b":44}]},{"name":"banReason","required":true,"transform":{"type":"scalar"},"locs":[{"a":214,"b":224}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":254,"b":261}]}],"statement":"UPDATE\n    users\nSET\n    ban_type = :banType!,\n    ban_reason_id = subquery.ban_reason_id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id AS ban_reason_id\n    FROM\n        ban_reasons\n    WHERE\n        name = :banReason!) AS subquery\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     ban_type = :banType!,
 *     ban_reason_id = subquery.ban_reason_id,
 *     updated_at = NOW()
 * FROM (
 *     SELECT
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


/** Query 'GetUsersForAdminSearch' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetUsersForAdminSearchResult = never;

/** Query 'GetUsersForAdminSearch' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetUsersForAdminSearchParams = never;

const getUsersForAdminSearchIR: any = {"usedParamSet":{"userId":true,"email":true,"firstName":true,"lastName":true,"partnerOrg":true,"school":true,"limit":true,"offset":true},"params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":1035,"b":1041},{"a":1076,"b":1082}]},{"name":"email","required":false,"transform":{"type":"scalar"},"locs":[{"a":1091,"b":1096},{"a":1146,"b":1151}]},{"name":"firstName","required":false,"transform":{"type":"scalar"},"locs":[{"a":1168,"b":1177},{"a":1232,"b":1241}]},{"name":"lastName","required":false,"transform":{"type":"scalar"},"locs":[{"a":1258,"b":1266},{"a":1320,"b":1328}]},{"name":"partnerOrg","required":false,"transform":{"type":"scalar"},"locs":[{"a":1345,"b":1355},{"a":1408,"b":1418},{"a":1454,"b":1464}]},{"name":"school","required":false,"transform":{"type":"scalar"},"locs":[{"a":1473,"b":1479},{"a":1530,"b":1536},{"a":1597,"b":1603}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":1673,"b":1679}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":1695,"b":1702}]}],"statement":"SELECT\n    users.id,\n    users.email,\n    users.first_name,\n    (\n        CASE WHEN student_profiles.user_id IS NOT NULL THEN\n            NULL\n        ELSE\n            users.last_name\n        END) AS last_name,\n    users.created_at,\n    array_agg(user_roles.name) AS roles\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN teacher_profiles ON teacher_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN schools ON schools.id = COALESCE(student_profiles.school_id, teacher_profiles.school_id)\n    LEFT JOIN school_nces_metadata ON school_nces_metadata.school_id = schools.id\n    LEFT JOIN users_roles ON users_roles.user_id = users.id\n    LEFT JOIN user_roles ON user_roles.id = users_roles.role_id\nWHERE ((:userId)::uuid IS NULL\n    OR users.id = :userId)\nAND ((:email)::text IS NULL\n    OR users.email ILIKE ('%' || :email || '%'))\nAND ((:firstName)::text IS NULL\n    OR users.first_name ILIKE ('%' || :firstName || '%'))\nAND ((:lastName)::text IS NULL\n    OR users.last_name ILIKE ('%' || :lastName || '%'))\nAND ((:partnerOrg)::text IS NULL\n    OR volunteer_partner_orgs.key = :partnerOrg\n    OR student_partner_orgs.key = :partnerOrg)\nAND ((:school)::text IS NULL\n    OR schools.name ILIKE ('%' || :school || '%')\n    OR school_nces_metadata.sch_name ILIKE ('%' || :school || '%'))\nGROUP BY\n    users.id,\n    student_profiles.user_id\nLIMIT (:limit!)::int OFFSET (:offset!)::int"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.email,
 *     users.first_name,
 *     (
 *         CASE WHEN student_profiles.user_id IS NOT NULL THEN
 *             NULL
 *         ELSE
 *             users.last_name
 *         END) AS last_name,
 *     users.created_at,
 *     array_agg(user_roles.name) AS roles
 * FROM
 *     users
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 *     LEFT JOIN teacher_profiles ON teacher_profiles.user_id = users.id
 *     LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN schools ON schools.id = COALESCE(student_profiles.school_id, teacher_profiles.school_id)
 *     LEFT JOIN school_nces_metadata ON school_nces_metadata.school_id = schools.id
 *     LEFT JOIN users_roles ON users_roles.user_id = users.id
 *     LEFT JOIN user_roles ON user_roles.id = users_roles.role_id
 * WHERE ((:userId)::uuid IS NULL
 *     OR users.id = :userId)
 * AND ((:email)::text IS NULL
 *     OR users.email ILIKE ('%' || :email || '%'))
 * AND ((:firstName)::text IS NULL
 *     OR users.first_name ILIKE ('%' || :firstName || '%'))
 * AND ((:lastName)::text IS NULL
 *     OR users.last_name ILIKE ('%' || :lastName || '%'))
 * AND ((:partnerOrg)::text IS NULL
 *     OR volunteer_partner_orgs.key = :partnerOrg
 *     OR student_partner_orgs.key = :partnerOrg)
 * AND ((:school)::text IS NULL
 *     OR schools.name ILIKE ('%' || :school || '%')
 *     OR school_nces_metadata.sch_name ILIKE ('%' || :school || '%'))
 * GROUP BY
 *     users.id,
 *     student_profiles.user_id
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
export const getUsersForAdminSearch = new PreparedQuery<IGetUsersForAdminSearchParams,IGetUsersForAdminSearchResult>(getUsersForAdminSearchIR);


/** Query 'GetUserForAdminDetail' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetUserForAdminDetailResult = never;

/** Query 'GetUserForAdminDetail' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetUserForAdminDetailParams = never;

const getUserForAdminDetailIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":2617,"b":2624},{"a":2654,"b":2661},{"a":3036,"b":3043},{"a":3127,"b":3134}]}],"statement":"SELECT\n    users.id,\n    users.first_name AS first_name,\n    (\n        CASE WHEN student_profiles.user_id IS NOT NULL THEN\n            NULL\n        ELSE\n            users.last_name\n        END) AS last_name,\n    users.email,\n    users.created_at,\n    users.deactivated AS is_deactivated,\n    users.test_user AS is_test_user,\n    users.verified,\n    users.ban_type AS ban_type,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    session_count.total AS num_past_sessions,\n    -- Volunteer specific fields:\n    volunteer_profiles.approved AS is_approved,\n    volunteer_profiles.onboarded AS is_onboarded,\n    volunteer_partner_orgs.name AS volunteer_partner_org,\n    volunteer_profiles.photo_id_s3_key,\n    photo_id_statuses.name AS photo_id_status,\n    volunteer_profiles.country,\n    volunteer_profiles.linkedin_url,\n    volunteer_profiles.college,\n    volunteer_profiles.company,\n    volunteer_profiles.languages,\n    volunteer_profiles.experience,\n    volunteer_profiles.city,\n    volunteer_profiles.state,\n    occupations.occupation,\n    -- Student specific fields:\n    COALESCE(cgl.current_grade_name, grade_levels.name) AS current_grade,\n    student_profiles.postal_code AS zip_code,\n    student_partner_orgs.name AS student_partner_org,\n    student_partner_org_sites.name AS partner_site,\n    -- Student/teacher field:\n    schools.id AS school_id,\n    COALESCE(schools.name, school_nces_metadata.sch_name) AS school_name\nFROM\n    users\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN teacher_profiles ON teacher_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN student_partner_org_sites ON student_partner_org_sites.id = student_profiles.student_partner_org_site_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id\n    LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    LEFT JOIN user_product_flags ON user_product_flags.user_id = users.id\n    LEFT JOIN grade_levels ON grade_levels.id = student_profiles.grade_level_id\n    LEFT JOIN current_grade_levels_mview cgl ON cgl.user_id = student_profiles.user_id\n    LEFT JOIN (\n        SELECT\n            COUNT(*) AS total\n        FROM\n            sessions\n        WHERE\n            volunteer_id = :userId!\n            OR student_id = :userId!) AS session_count ON TRUE\n    LEFT JOIN schools ON schools.id = COALESCE(student_profiles.school_id, teacher_profiles.school_id)\n    LEFT JOIN school_nces_metadata ON school_nces_metadata.school_id = schools.id\n    LEFT JOIN (\n        SELECT\n            array_agg(occupation) AS occupation\n        FROM\n            volunteer_occupations\n        WHERE\n            user_id = :userId!\n        GROUP BY\n            user_id) AS occupations ON TRUE\nWHERE\n    users.id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name AS first_name,
 *     (
 *         CASE WHEN student_profiles.user_id IS NOT NULL THEN
 *             NULL
 *         ELSE
 *             users.last_name
 *         END) AS last_name,
 *     users.email,
 *     users.created_at,
 *     users.deactivated AS is_deactivated,
 *     users.test_user AS is_test_user,
 *     users.verified,
 *     users.ban_type AS ban_type,
 *     (
 *         CASE WHEN admin_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_admin,
 *     session_count.total AS num_past_sessions,
 *     -- Volunteer specific fields:
 *     volunteer_profiles.approved AS is_approved,
 *     volunteer_profiles.onboarded AS is_onboarded,
 *     volunteer_partner_orgs.name AS volunteer_partner_org,
 *     volunteer_profiles.photo_id_s3_key,
 *     photo_id_statuses.name AS photo_id_status,
 *     volunteer_profiles.country,
 *     volunteer_profiles.linkedin_url,
 *     volunteer_profiles.college,
 *     volunteer_profiles.company,
 *     volunteer_profiles.languages,
 *     volunteer_profiles.experience,
 *     volunteer_profiles.city,
 *     volunteer_profiles.state,
 *     occupations.occupation,
 *     -- Student specific fields:
 *     COALESCE(cgl.current_grade_name, grade_levels.name) AS current_grade,
 *     student_profiles.postal_code AS zip_code,
 *     student_partner_orgs.name AS student_partner_org,
 *     student_partner_org_sites.name AS partner_site,
 *     -- Student/teacher field:
 *     schools.id AS school_id,
 *     COALESCE(schools.name, school_nces_metadata.sch_name) AS school_name
 * FROM
 *     users
 *     LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN teacher_profiles ON teacher_profiles.user_id = users.id
 *     LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
 *     LEFT JOIN student_partner_org_sites ON student_partner_org_sites.id = student_profiles.student_partner_org_site_id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id
 *     LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status
 *     LEFT JOIN user_product_flags ON user_product_flags.user_id = users.id
 *     LEFT JOIN grade_levels ON grade_levels.id = student_profiles.grade_level_id
 *     LEFT JOIN current_grade_levels_mview cgl ON cgl.user_id = student_profiles.user_id
 *     LEFT JOIN (
 *         SELECT
 *             COUNT(*) AS total
 *         FROM
 *             sessions
 *         WHERE
 *             volunteer_id = :userId!
 *             OR student_id = :userId!) AS session_count ON TRUE
 *     LEFT JOIN schools ON schools.id = COALESCE(student_profiles.school_id, teacher_profiles.school_id)
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


/** Query 'GetLegacyUser' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetLegacyUserResult = never;

/** Query 'GetLegacyUser' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetLegacyUserParams = never;

const getLegacyUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":3077,"b":3084},{"a":3337,"b":3344},{"a":4765,"b":4772},{"a":6044,"b":6051},{"a":6613,"b":6620},{"a":6652,"b":6659},{"a":6823,"b":6830},{"a":7469,"b":7476},{"a":7659,"b":7666},{"a":7883,"b":7890},{"a":7951,"b":7958}]}],"statement":"SELECT\n    users.id,\n    users.first_name,\n    users.created_at,\n    users.email,\n    users.email_verified,\n    users.proxy_email,\n    users.verified,\n    users.first_name AS firstname,\n    users.phone,\n    users.phone_verified,\n    users.sms_consent,\n    volunteer_profiles.college,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            'volunteer'\n        ELSE\n            'student'\n        END) AS TYPE,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    users.ban_type AS ban_type,\n    ban_reasons.name AS ban_reason,\n    users.test_user AS is_test_user,\n    FALSE AS is_fake_user,\n    users.deactivated AS is_deactivated,\n    users.last_activity_at AS last_activity_at,\n    users.referral_code AS referral_code,\n    users.referred_by AS referred_by,\n    volunteer_profiles.onboarded AS is_onboarded,\n    volunteer_profiles.approved AS is_approved,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    volunteer_profiles.country,\n    volunteer_profiles.timezone,\n    photo_id_statuses.name AS photo_id_status,\n    COALESCE(past_sessions.sessions, '{}') AS past_sessions,\n    round(past_sessions.time_tutored / 3600000::numeric, 2)::float AS hours_tutored,\n    COALESCE(past_sessions.time_tutored::float, 0) AS total_time_tutored,\n    COALESCE(array_length(past_sessions.total_tutored_sessions, 1), 0) AS total_tutored_sessions,\n    array_cat(total_subjects.subjects, computed_subjects.subjects) AS subjects,\n    recent_availability.updated_at AS availability_last_modified_at,\n    occupations.occupations AS occupation,\n    student_partner_org_sites.name AS partner_site,\n    student_partner_orgs.name AS student_partner_org,\n    COALESCE(volunteer_profiles.elapsed_availability, 0) AS elapsed_availability,\n    volunteer_profiles.total_volunteer_hours,\n    schools.name AS school_name,\n    (\n        CASE WHEN EXISTS (\n            SELECT\n                1\n            FROM\n                student_partner_orgs\n            LEFT JOIN student_partner_orgs_upchieve_instances spoui ON spoui.student_partner_org_id = student_partner_orgs.id\n        WHERE\n            student_partner_orgs.school_id = student_profiles.school_id\n            AND spoui.deactivated_on IS NULL) THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_school_partner,\nCOALESCE(cgl.current_grade_name, grade_levels.name) AS grade_level,\narray_cat(total_subjects.active_subjects, computed_subjects.active_subjects) AS active_subjects,\nusers_quizzes.total::int AS total_quizzes_passed,\nusers_roles.role_id,\nmuted_users_subject_alerts_agg.muted_subject_alerts,\nnumber_of_student_classes.count AS number_of_student_classes,\nfederated_credentials_agg.issuers\nFROM\n    users\n    LEFT JOIN (\n        SELECT\n            updated_at\n        FROM\n            availabilities\n        WHERE\n            availabilities.user_id = :userId!\n        ORDER BY\n            updated_at\n        LIMIT 1) AS recent_availability ON TRUE\n    LEFT JOIN (\n        SELECT\n            array_agg(occupation) AS occupations\n        FROM\n            volunteer_occupations\n        WHERE\n            user_id = :userId!) AS occupations ON TRUE\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN admin_profiles ON users.id = admin_profiles.user_id\n    LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\n    LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id\n    LEFT JOIN ban_reasons ON users.ban_reason_id = ban_reasons.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN student_partner_org_sites ON student_partner_org_sites.id = student_profiles.student_partner_org_site_id\n    LEFT JOIN (\n        SELECT\n            array_agg(DISTINCT subjects_unlocked.subject) AS subjects,\n            array_agg(DISTINCT subjects_unlocked.subject) FILTER (WHERE subjects_unlocked.active_subject IS TRUE) AS active_subjects\n        FROM (\n            SELECT\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subjects.active AS active_subject\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n            WHERE\n                users_certifications.user_id = :userId!\n            GROUP BY\n                subjects.name, subjects.active) AS subjects_unlocked) AS total_subjects ON TRUE\n    LEFT JOIN (\n        SELECT\n            array_agg(DISTINCT computed_subjects_unlocked.subject) AS subjects,\n            array_agg(DISTINCT computed_subjects_unlocked.subject) FILTER (WHERE computed_subjects_unlocked.active_subject IS TRUE) AS active_subjects\n        FROM (\n            SELECT\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_certs.total,\n                subjects.active AS active_subject\n            FROM\n                users_certifications\n                JOIN computed_subject_unlocks USING (certification_id)\n                JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        computed_subject_unlocks\n                        JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_certs ON subject_certs.name = subjects.name\n                WHERE\n                    users_certifications.user_id = :userId!\n                GROUP BY\n                    subjects.name,\n                    subject_certs.total,\n                    subjects.active\n                HAVING\n                    COUNT(*)::int >= subject_certs.total) AS computed_subjects_unlocked) AS computed_subjects ON TRUE\n    LEFT JOIN (\n        SELECT\n            array_agg(id) AS sessions,\n            sum(time_tutored)::bigint AS time_tutored,\n            array_agg(id) FILTER (WHERE time_tutored > 0) AS total_tutored_sessions\n        FROM\n            sessions\n        WHERE\n            student_id = :userId!\n            OR volunteer_id = :userId!) AS past_sessions ON TRUE\n    LEFT JOIN (\n        SELECT\n            count(*) AS total\n        FROM\n            users_quizzes\n        WHERE\n            user_id = :userId!\n            AND passed IS TRUE) AS users_quizzes ON TRUE\n    LEFT JOIN schools ON student_profiles.school_id = schools.id\n    LEFT JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id\n    LEFT JOIN current_grade_levels_mview cgl ON cgl.user_id = student_profiles.user_id\n    LEFT JOIN users_roles ON users_roles.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            array_agg(subjects.name) AS muted_subject_alerts\n        FROM\n            muted_users_subject_alerts\n            JOIN subjects ON muted_users_subject_alerts.subject_id = subjects.id\n        WHERE\n            muted_users_subject_alerts.user_id = :userId!) AS muted_users_subject_alerts_agg ON TRUE\n    LEFT JOIN (\n        SELECT\n            COUNT(*) AS count\n        FROM\n            student_classes\n        WHERE\n            user_id = :userId!) AS number_of_student_classes ON TRUE\n    LEFT JOIN (\n        SELECT\n            array_agg(issuer) AS issuers\n        FROM\n            federated_credentials\n        WHERE\n            federated_credentials.user_id = :userId!) AS federated_credentials_agg ON TRUE\nWHERE\n    users.id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name,
 *     users.created_at,
 *     users.email,
 *     users.email_verified,
 *     users.proxy_email,
 *     users.verified,
 *     users.first_name AS firstname,
 *     users.phone,
 *     users.phone_verified,
 *     users.sms_consent,
 *     volunteer_profiles.college,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_volunteer,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
 *             'volunteer'
 *         ELSE
 *             'student'
 *         END) AS TYPE,
 *     (
 *         CASE WHEN admin_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_admin,
 *     users.ban_type AS ban_type,
 *     ban_reasons.name AS ban_reason,
 *     users.test_user AS is_test_user,
 *     FALSE AS is_fake_user,
 *     users.deactivated AS is_deactivated,
 *     users.last_activity_at AS last_activity_at,
 *     users.referral_code AS referral_code,
 *     users.referred_by AS referred_by,
 *     volunteer_profiles.onboarded AS is_onboarded,
 *     volunteer_profiles.approved AS is_approved,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     volunteer_profiles.country,
 *     volunteer_profiles.timezone,
 *     photo_id_statuses.name AS photo_id_status,
 *     COALESCE(past_sessions.sessions, '{}') AS past_sessions,
 *     round(past_sessions.time_tutored / 3600000::numeric, 2)::float AS hours_tutored,
 *     COALESCE(past_sessions.time_tutored::float, 0) AS total_time_tutored,
 *     COALESCE(array_length(past_sessions.total_tutored_sessions, 1), 0) AS total_tutored_sessions,
 *     array_cat(total_subjects.subjects, computed_subjects.subjects) AS subjects,
 *     recent_availability.updated_at AS availability_last_modified_at,
 *     occupations.occupations AS occupation,
 *     student_partner_org_sites.name AS partner_site,
 *     student_partner_orgs.name AS student_partner_org,
 *     COALESCE(volunteer_profiles.elapsed_availability, 0) AS elapsed_availability,
 *     volunteer_profiles.total_volunteer_hours,
 *     schools.name AS school_name,
 *     (
 *         CASE WHEN EXISTS (
 *             SELECT
 *                 1
 *             FROM
 *                 student_partner_orgs
 *             LEFT JOIN student_partner_orgs_upchieve_instances spoui ON spoui.student_partner_org_id = student_partner_orgs.id
 *         WHERE
 *             student_partner_orgs.school_id = student_profiles.school_id
 *             AND spoui.deactivated_on IS NULL) THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_school_partner,
 * COALESCE(cgl.current_grade_name, grade_levels.name) AS grade_level,
 * array_cat(total_subjects.active_subjects, computed_subjects.active_subjects) AS active_subjects,
 * users_quizzes.total::int AS total_quizzes_passed,
 * users_roles.role_id,
 * muted_users_subject_alerts_agg.muted_subject_alerts,
 * number_of_student_classes.count AS number_of_student_classes,
 * federated_credentials_agg.issuers
 * FROM
 *     users
 *     LEFT JOIN (
 *         SELECT
 *             updated_at
 *         FROM
 *             availabilities
 *         WHERE
 *             availabilities.user_id = :userId!
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
 *             array_agg(DISTINCT subjects_unlocked.subject) AS subjects,
 *             array_agg(DISTINCT subjects_unlocked.subject) FILTER (WHERE subjects_unlocked.active_subject IS TRUE) AS active_subjects
 *         FROM (
 *             SELECT
 *                 subjects.name AS subject,
 *                 COUNT(*)::int AS earned_certs,
 *                 subjects.active AS active_subject
 *             FROM
 *                 users_certifications
 *                 JOIN certification_subject_unlocks USING (certification_id)
 *                 JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *             WHERE
 *                 users_certifications.user_id = :userId!
 *             GROUP BY
 *                 subjects.name, subjects.active) AS subjects_unlocked) AS total_subjects ON TRUE
 *     LEFT JOIN (
 *         SELECT
 *             array_agg(DISTINCT computed_subjects_unlocked.subject) AS subjects,
 *             array_agg(DISTINCT computed_subjects_unlocked.subject) FILTER (WHERE computed_subjects_unlocked.active_subject IS TRUE) AS active_subjects
 *         FROM (
 *             SELECT
 *                 subjects.name AS subject,
 *                 COUNT(*)::int AS earned_certs,
 *                 subject_certs.total,
 *                 subjects.active AS active_subject
 *             FROM
 *                 users_certifications
 *                 JOIN computed_subject_unlocks USING (certification_id)
 *                 JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id
 *                 JOIN (
 *                     SELECT
 *                         subjects.name, COUNT(*)::int AS total
 *                     FROM
 *                         computed_subject_unlocks
 *                         JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id
 *                     GROUP BY
 *                         subjects.name) AS subject_certs ON subject_certs.name = subjects.name
 *                 WHERE
 *                     users_certifications.user_id = :userId!
 *                 GROUP BY
 *                     subjects.name,
 *                     subject_certs.total,
 *                     subjects.active
 *                 HAVING
 *                     COUNT(*)::int >= subject_certs.total) AS computed_subjects_unlocked) AS computed_subjects ON TRUE
 *     LEFT JOIN (
 *         SELECT
 *             array_agg(id) AS sessions,
 *             sum(time_tutored)::bigint AS time_tutored,
 *             array_agg(id) FILTER (WHERE time_tutored > 0) AS total_tutored_sessions
 *         FROM
 *             sessions
 *         WHERE
 *             student_id = :userId!
 *             OR volunteer_id = :userId!) AS past_sessions ON TRUE
 *     LEFT JOIN (
 *         SELECT
 *             count(*) AS total
 *         FROM
 *             users_quizzes
 *         WHERE
 *             user_id = :userId!
 *             AND passed IS TRUE) AS users_quizzes ON TRUE
 *     LEFT JOIN schools ON student_profiles.school_id = schools.id
 *     LEFT JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id
 *     LEFT JOIN current_grade_levels_mview cgl ON cgl.user_id = student_profiles.user_id
 *     LEFT JOIN users_roles ON users_roles.user_id = users.id
 *     LEFT JOIN (
 *         SELECT
 *             array_agg(subjects.name) AS muted_subject_alerts
 *         FROM
 *             muted_users_subject_alerts
 *             JOIN subjects ON muted_users_subject_alerts.subject_id = subjects.id
 *         WHERE
 *             muted_users_subject_alerts.user_id = :userId!) AS muted_users_subject_alerts_agg ON TRUE
 *     LEFT JOIN (
 *         SELECT
 *             COUNT(*) AS count
 *         FROM
 *             student_classes
 *         WHERE
 *             user_id = :userId!) AS number_of_student_classes ON TRUE
 *     LEFT JOIN (
 *         SELECT
 *             array_agg(issuer) AS issuers
 *         FROM
 *             federated_credentials
 *         WHERE
 *             federated_credentials.user_id = :userId!) AS federated_credentials_agg ON TRUE
 * WHERE
 *     users.id = :userId!
 * ```
 */
export const getLegacyUser = new PreparedQuery<IGetLegacyUserParams,IGetLegacyUserResult>(getLegacyUserIR);


/** Query 'GetUserToCreateSendGridContact' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetUserToCreateSendGridContactResult = never;

/** Query 'GetUserToCreateSendGridContact' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetUserToCreateSendGridContactParams = never;

const getUserToCreateSendGridContactIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1945,"b":1952}]}],"statement":"SELECT\n    users.id,\n    first_name,\n    email,\n    sms_consent,\n    phone_verified,\n    ban_type,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    volunteer_partner_orgs.name AS volunteer_partner_org_display,\n    student_partner_orgs.key AS student_partner_org,\n    student_partner_orgs.name AS student_partner_org_display,\n    users.last_activity_at,\n    users.created_at,\n    users.deactivated,\n    (\n        CASE WHEN user_upchieve101.id IS NULL THEN\n            FALSE\n        ELSE\n            TRUE\n        END) AS passed_upchieve101,\n    users.test_user,\n    users.last_name,\n    COALESCE(cgl.current_grade_name, grade_levels.name) AS student_grade_level\nFROM\n    users\n    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN LATERAL (\n        SELECT\n            id\n        FROM\n            users_training_courses\n            LEFT JOIN training_courses ON training_courses.id = users_training_courses.training_course_id\n        WHERE\n            users_training_courses.user_id = users.id\n            AND training_courses.name = 'UPchieve 101') AS user_upchieve101 ON TRUE\n    LEFT JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id\n    LEFT JOIN current_grade_levels_mview cgl ON student_profiles.user_id = cgl.user_id\nWHERE\n    users.id = :userId!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     email,
 *     sms_consent,
 *     phone_verified,
 *     ban_type,
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
 *     (
 *         CASE WHEN user_upchieve101.id IS NULL THEN
 *             FALSE
 *         ELSE
 *             TRUE
 *         END) AS passed_upchieve101,
 *     users.test_user,
 *     users.last_name,
 *     COALESCE(cgl.current_grade_name, grade_levels.name) AS student_grade_level
 * FROM
 *     users
 *     LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 *     LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             id
 *         FROM
 *             users_training_courses
 *             LEFT JOIN training_courses ON training_courses.id = users_training_courses.training_course_id
 *         WHERE
 *             users_training_courses.user_id = users.id
 *             AND training_courses.name = 'UPchieve 101') AS user_upchieve101 ON TRUE
 *     LEFT JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id
 *     LEFT JOIN current_grade_levels_mview cgl ON student_profiles.user_id = cgl.user_id
 * WHERE
 *     users.id = :userId!
 * LIMIT 1
 * ```
 */
export const getUserToCreateSendGridContact = new PreparedQuery<IGetUserToCreateSendGridContactParams,IGetUserToCreateSendGridContactResult>(getUserToCreateSendGridContactIR);


/** Query 'GetPastSessionsForAdminDetail' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetPastSessionsForAdminDetailResult = never;

/** Query 'GetPastSessionsForAdminDetail' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetPastSessionsForAdminDetailParams = never;

const getPastSessionsForAdminDetailIR: any = {"usedParamSet":{"userId":true,"limit":true,"offset":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":630,"b":637},{"a":668,"b":675}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":722,"b":728}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":744,"b":751}]}],"statement":"SELECT\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    sessions.id,\n    messages.total AS total_messages,\n    sessions.volunteer_id AS volunteer,\n    sessions.student_id AS student,\n    sessions.volunteer_joined_at,\n    sessions.created_at,\n    sessions.ended_at\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            session_messages\n        WHERE\n            session_id = sessions.id) AS messages ON TRUE\nWHERE\n    sessions.volunteer_id = :userId!\n    OR sessions.student_id = :userId!\nORDER BY\n    sessions.created_at DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     topics.name AS TYPE,
 *     subjects.name AS sub_topic,
 *     sessions.id,
 *     messages.total AS total_messages,
 *     sessions.volunteer_id AS volunteer,
 *     sessions.student_id AS student,
 *     sessions.volunteer_joined_at,
 *     sessions.created_at,
 *     sessions.ended_at
 * FROM
 *     sessions
 *     LEFT JOIN subjects ON subjects.id = sessions.subject_id
 *     LEFT JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(*)::int AS total
 *         FROM
 *             session_messages
 *         WHERE
 *             session_id = sessions.id) AS messages ON TRUE
 * WHERE
 *     sessions.volunteer_id = :userId!
 *     OR sessions.student_id = :userId!
 * ORDER BY
 *     sessions.created_at DESC
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
export const getPastSessionsForAdminDetail = new PreparedQuery<IGetPastSessionsForAdminDetailParams,IGetPastSessionsForAdminDetailResult>(getPastSessionsForAdminDetailIR);


/** Query 'GetLegacyCertifications' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetLegacyCertificationsResult = never;

/** Query 'GetLegacyCertifications' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetLegacyCertificationsParams = never;

const getLegacyCertificationsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    name\nFROM\n    quizzes"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     name
 * FROM
 *     quizzes
 * ```
 */
export const getLegacyCertifications = new PreparedQuery<IGetLegacyCertificationsParams,IGetLegacyCertificationsResult>(getLegacyCertificationsIR);


/** Query 'GetTotalSessionsByUserId' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetTotalSessionsByUserIdResult = never;

/** Query 'GetTotalSessionsByUserId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetTotalSessionsByUserIdParams = never;

const getTotalSessionsByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":84,"b":91},{"a":124,"b":131}]}],"statement":"SELECT\n    count(*)::int AS total\nFROM\n    sessions\nWHERE\n    sessions.student_id = :userId!\n    OR sessions.volunteer_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     count(*)::int AS total
 * FROM
 *     sessions
 * WHERE
 *     sessions.student_id = :userId!
 *     OR sessions.volunteer_id = :userId!
 * ```
 */
export const getTotalSessionsByUserId = new PreparedQuery<IGetTotalSessionsByUserIdParams,IGetTotalSessionsByUserIdResult>(getTotalSessionsByUserIdIR);


/** Query 'InsertUserRoleByUserId' is invalid, so its result is assigned type 'never'.
 *  */
export type IInsertUserRoleByUserIdResult = never;

/** Query 'InsertUserRoleByUserId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IInsertUserRoleByUserIdParams = never;

const insertUserRoleByUserIdIR: any = {"usedParamSet":{"userId":true,"roleName":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":95,"b":102}]},{"name":"roleName","required":true,"transform":{"type":"scalar"},"locs":[{"a":219,"b":228}]}],"statement":"INSERT INTO users_roles (role_id, user_id, created_at, updated_at)\nSELECT\n    subquery.id,\n    :userId!,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        user_roles\n    WHERE\n        user_roles.name = :roleName!) AS subquery\nON CONFLICT\n    DO NOTHING\nRETURNING\n    user_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_roles (role_id, user_id, created_at, updated_at)
 * SELECT
 *     subquery.id,
 *     :userId!,
 *     NOW(),
 *     NOW()
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         user_roles
 *     WHERE
 *         user_roles.name = :roleName!) AS subquery
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const insertUserRoleByUserId = new PreparedQuery<IInsertUserRoleByUserIdParams,IInsertUserRoleByUserIdResult>(insertUserRoleByUserIdIR);


/** Query 'UpdateUserProfileById' is invalid, so its result is assigned type 'never'.
 *  */
export type IUpdateUserProfileByIdResult = never;

/** Query 'UpdateUserProfileById' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IUpdateUserProfileByIdParams = never;

const updateUserProfileByIdIR: any = {"usedParamSet":{"deactivated":true,"phone":true,"smsConsent":true,"userId":true},"params":[{"name":"deactivated","required":false,"transform":{"type":"scalar"},"locs":[{"a":48,"b":59}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":97,"b":102}]},{"name":"smsConsent","required":false,"transform":{"type":"scalar"},"locs":[{"a":140,"b":150}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":181,"b":188}]}],"statement":"UPDATE\n    users\nSET\n    deactivated = COALESCE(:deactivated, deactivated),\n    phone = COALESCE(:phone, phone),\n    sms_consent = COALESCE(:smsConsent, sms_consent)\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     deactivated = COALESCE(:deactivated, deactivated),
 *     phone = COALESCE(:phone, phone),
 *     sms_consent = COALESCE(:smsConsent, sms_consent)
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateUserProfileById = new PreparedQuery<IUpdateUserProfileByIdParams,IUpdateUserProfileByIdResult>(updateUserProfileByIdIR);


/** Query 'DeletePhone' is invalid, so its result is assigned type 'never'.
 *  */
export type IDeletePhoneResult = never;

/** Query 'DeletePhone' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IDeletePhoneParams = never;

const deletePhoneIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":106,"b":113}]}],"statement":"UPDATE\n    users\nSET\n    phone = NULL,\n    sms_consent = FALSE,\n    phone_verified = FALSE\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     phone = NULL,
 *     sms_consent = FALSE,
 *     phone_verified = FALSE
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const deletePhone = new PreparedQuery<IDeletePhoneParams,IDeletePhoneResult>(deletePhoneIR);


/** Query 'InsertMutedUserSubjectAlerts' is invalid, so its result is assigned type 'never'.
 *  */
export type IInsertMutedUserSubjectAlertsResult = never;

/** Query 'InsertMutedUserSubjectAlerts' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IInsertMutedUserSubjectAlertsParams = never;

const insertMutedUserSubjectAlertsIR: any = {"usedParamSet":{"mutedSubjectAlertIdsWithUserId":true},"params":[{"name":"mutedSubjectAlertIdsWithUserId","required":false,"transform":{"type":"pick_array_spread","keys":[{"name":"userId","required":false},{"name":"subjectId","required":false}]},"locs":[{"a":80,"b":110}]}],"statement":"INSERT INTO muted_users_subject_alerts (user_id, subject_id)\n    VALUES\n        :mutedSubjectAlertIdsWithUserId\n    ON CONFLICT (user_id, subject_id)\n        DO NOTHING\n    RETURNING\n        user_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO muted_users_subject_alerts (user_id, subject_id)
 *     VALUES
 *         :mutedSubjectAlertIdsWithUserId
 *     ON CONFLICT (user_id, subject_id)
 *         DO NOTHING
 *     RETURNING
 *         user_id AS ok
 * ```
 */
export const insertMutedUserSubjectAlerts = new PreparedQuery<IInsertMutedUserSubjectAlertsParams,IInsertMutedUserSubjectAlertsResult>(insertMutedUserSubjectAlertsIR);


/** Query 'DeleteUnmutedUserSubjectAlerts' is invalid, so its result is assigned type 'never'.
 *  */
export type IDeleteUnmutedUserSubjectAlertsResult = never;

/** Query 'DeleteUnmutedUserSubjectAlerts' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IDeleteUnmutedUserSubjectAlertsParams = never;

const deleteUnmutedUserSubjectAlertsIR: any = {"usedParamSet":{"userId":true,"mutedSubjectAlertIds":true},"params":[{"name":"mutedSubjectAlertIds","required":false,"transform":{"type":"array_spread"},"locs":[{"a":89,"b":109}]},{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":55,"b":61}]}],"statement":"DELETE FROM muted_users_subject_alerts\nWHERE user_id = :userId\n    AND subject_id NOT IN :mutedSubjectAlertIds\nRETURNING\n    user_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM muted_users_subject_alerts
 * WHERE user_id = :userId
 *     AND subject_id NOT IN :mutedSubjectAlertIds
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const deleteUnmutedUserSubjectAlerts = new PreparedQuery<IDeleteUnmutedUserSubjectAlertsParams,IDeleteUnmutedUserSubjectAlertsResult>(deleteUnmutedUserSubjectAlertsIR);


/** Query 'DeleteAllUserSubjectAlerts' is invalid, so its result is assigned type 'never'.
 *  */
export type IDeleteAllUserSubjectAlertsResult = never;

/** Query 'DeleteAllUserSubjectAlerts' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IDeleteAllUserSubjectAlertsParams = never;

const deleteAllUserSubjectAlertsIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":55,"b":61}]}],"statement":"DELETE FROM muted_users_subject_alerts\nWHERE user_id = :userId\nRETURNING\n    user_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM muted_users_subject_alerts
 * WHERE user_id = :userId
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const deleteAllUserSubjectAlerts = new PreparedQuery<IDeleteAllUserSubjectAlertsParams,IDeleteAllUserSubjectAlertsResult>(deleteAllUserSubjectAlertsIR);


/** Query 'GetUserVerificationInfoById' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetUserVerificationInfoByIdResult = never;

/** Query 'GetUserVerificationInfoById' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetUserVerificationInfoByIdParams = never;

const getUserVerificationInfoByIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":90,"b":97}]}],"statement":"SELECT\n    verified,\n    email_verified,\n    phone_verified\nFROM\n    users\nWHERE\n    id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     verified,
 *     email_verified,
 *     phone_verified
 * FROM
 *     users
 * WHERE
 *     id = :userId!
 * ```
 */
export const getUserVerificationInfoById = new PreparedQuery<IGetUserVerificationInfoByIdParams,IGetUserVerificationInfoByIdResult>(getUserVerificationInfoByIdIR);


/** Query 'GetReportedUser' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetReportedUserResult = never;

/** Query 'GetReportedUser' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetReportedUserParams = never;

const getReportedUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":892,"b":899}]}],"statement":"SELECT\n    users.id AS id,\n    first_name,\n    last_name,\n    email,\n    users.created_at AS created_at,\n    test_user AS is_test_user,\n    ban_type,\n    deactivated AS is_deactivated,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    student_partner_orgs.key AS student_partner_org,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN student_profiles ON users.id = student_profiles.user_id\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\n    LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id\nWHERE\n    deactivated IS FALSE\n    AND test_user IS FALSE\n    AND users.id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id AS id,
 *     first_name,
 *     last_name,
 *     email,
 *     users.created_at AS created_at,
 *     test_user AS is_test_user,
 *     ban_type,
 *     deactivated AS is_deactivated,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_volunteer,
 *     student_partner_orgs.key AS student_partner_org,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     LEFT JOIN student_profiles ON users.id = student_profiles.user_id
 *     LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
 *     LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id
 * WHERE
 *     deactivated IS FALSE
 *     AND test_user IS FALSE
 *     AND users.id = :userId!
 * ```
 */
export const getReportedUser = new PreparedQuery<IGetReportedUserParams,IGetReportedUserResult>(getReportedUserIR);


/** Query 'GetUsersLatestSubjectsByUserId' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetUsersLatestSubjectsByUserIdResult = never;

/** Query 'GetUsersLatestSubjectsByUserId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetUsersLatestSubjectsByUserIdParams = never;

const getUsersLatestSubjectsByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":306,"b":313}]}],"statement":"SELECT\n    recent_sessions.subject\nFROM ( SELECT DISTINCT ON (subjects.name)\n        subjects.name AS subject,\n        sessions.created_at\n    FROM\n        users\n        JOIN sessions ON sessions.student_id = users.id\n        JOIN subjects ON subjects.id = sessions.subject_id\n    WHERE\n        users.id = :userId!\n    ORDER BY\n        subjects.name,\n        sessions.created_at DESC) AS recent_sessions\nORDER BY\n    recent_sessions.created_at DESC\nLIMIT 3"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     recent_sessions.subject
 * FROM ( SELECT DISTINCT ON (subjects.name)
 *         subjects.name AS subject,
 *         sessions.created_at
 *     FROM
 *         users
 *         JOIN sessions ON sessions.student_id = users.id
 *         JOIN subjects ON subjects.id = sessions.subject_id
 *     WHERE
 *         users.id = :userId!
 *     ORDER BY
 *         subjects.name,
 *         sessions.created_at DESC) AS recent_sessions
 * ORDER BY
 *     recent_sessions.created_at DESC
 * LIMIT 3
 * ```
 */
export const getUsersLatestSubjectsByUserId = new PreparedQuery<IGetUsersLatestSubjectsByUserIdParams,IGetUsersLatestSubjectsByUserIdResult>(getUsersLatestSubjectsByUserIdIR);


/** Query 'UpdateUserProxyEmail' is invalid, so its result is assigned type 'never'.
 *  */
export type IUpdateUserProxyEmailResult = never;

/** Query 'UpdateUserProxyEmail' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IUpdateUserProxyEmailParams = never;

const updateUserProxyEmailIR: any = {"usedParamSet":{"proxyEmail":true,"userId":true},"params":[{"name":"proxyEmail","required":true,"transform":{"type":"scalar"},"locs":[{"a":39,"b":50}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":91,"b":98}]}],"statement":"UPDATE\n    users\nSET\n    proxy_email = :proxyEmail!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     proxy_email = :proxyEmail!,
 *     updated_at = NOW()
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateUserProxyEmail = new PreparedQuery<IUpdateUserProxyEmailParams,IUpdateUserProxyEmailResult>(updateUserProxyEmailIR);


/** Query 'AdminUpdateUser' is invalid, so its result is assigned type 'never'.
 *  */
export type IAdminUpdateUserResult = never;

/** Query 'AdminUpdateUser' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IAdminUpdateUserParams = never;

const adminUpdateUserIR: any = {"usedParamSet":{"firstName":true,"lastName":true,"email":true,"isVerified":true,"banType":true,"ban_reason":true,"isDeactivated":true,"userId":true},"params":[{"name":"firstName","required":false,"transform":{"type":"scalar"},"locs":[{"a":47,"b":56}]},{"name":"lastName","required":false,"transform":{"type":"scalar"},"locs":[{"a":97,"b":105}]},{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":132,"b":138}]},{"name":"isVerified","required":true,"transform":{"type":"scalar"},"locs":[{"a":156,"b":167}]},{"name":"banType","required":false,"transform":{"type":"scalar"},"locs":[{"a":185,"b":192}]},{"name":"ban_reason","required":false,"transform":{"type":"scalar"},"locs":[{"a":317,"b":327}]},{"name":"isDeactivated","required":true,"transform":{"type":"scalar"},"locs":[{"a":345,"b":359}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":382,"b":389}]}],"statement":"UPDATE\n    users\nSET\n    first_name = COALESCE(:firstName, first_name),\n    last_name = COALESCE(:lastName, last_name),\n    email = :email!,\n    verified = :isVerified!,\n    ban_type = :banType,\n    ban_reason_id = (\n        SELECT\n            id\n        FROM\n            ban_reasons\n        WHERE\n            name = :ban_reason), deactivated = :isDeactivated!\nWHERE\n    users.id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     first_name = COALESCE(:firstName, first_name),
 *     last_name = COALESCE(:lastName, last_name),
 *     email = :email!,
 *     verified = :isVerified!,
 *     ban_type = :banType,
 *     ban_reason_id = (
 *         SELECT
 *             id
 *         FROM
 *             ban_reasons
 *         WHERE
 *             name = :ban_reason), deactivated = :isDeactivated!
 * WHERE
 *     users.id = :userId!
 * ```
 */
export const adminUpdateUser = new PreparedQuery<IAdminUpdateUserParams,IAdminUpdateUserResult>(adminUpdateUserIR);


