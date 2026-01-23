/** Types generated for queries found in "server/models/User/user.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type ban_types = 'complete' | 'live_media' | 'shadow';

export type DateOrString = Date | string;

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type stringArray = (string)[];

/** 'GetUserRolesById' parameters type */
export interface IGetUserRolesByIdParams {
  id: string;
}

/** 'GetUserRolesById' return type */
export interface IGetUserRolesByIdResult {
  name: string;
}

/** 'GetUserRolesById' query type */
export interface IGetUserRolesByIdQuery {
  params: IGetUserRolesByIdParams;
  result: IGetUserRolesByIdResult;
}

const getUserRolesByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":187,"b":190}]}],"statement":"SELECT\n    user_roles.name\nFROM\n    users\n    LEFT JOIN users_roles ON users_roles.user_id = users.id\n    LEFT JOIN user_roles ON user_roles.id = users_roles.role_id\nWHERE\n    users.id = :id!\nORDER BY\n    users_roles.created_at ASC"};

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
 * ORDER BY
 *     users_roles.created_at ASC
 * ```
 */
export const getUserRolesById = new PreparedQuery<IGetUserRolesByIdParams,IGetUserRolesByIdResult>(getUserRolesByIdIR);


/** 'CreateUser' parameters type */
export interface ICreateUserParams {
  email: string;
  emailVerified?: boolean | null | void;
  firstName: string;
  id: string;
  lastName: string;
  otherSignupSource?: string | null | void;
  password?: string | null | void;
  passwordResetToken?: string | null | void;
  phone?: string | null | void;
  phoneVerified?: boolean | null | void;
  proxyEmail?: string | null | void;
  referralCode: string;
  referredBy?: string | null | void;
  signupSourceId?: number | null | void;
  smsConsent?: boolean | null | void;
  verified?: boolean | null | void;
}

/** 'CreateUser' return type */
export interface ICreateUserResult {
  email: string;
  firstName: string;
  id: string;
  proxyEmail: string | null;
}

/** 'CreateUser' query type */
export interface ICreateUserQuery {
  params: ICreateUserParams;
  result: ICreateUserResult;
}

const createUserIR: any = {"usedParamSet":{"id":true,"firstName":true,"lastName":true,"email":true,"proxyEmail":true,"phone":true,"smsConsent":true,"password":true,"passwordResetToken":true,"verified":true,"emailVerified":true,"phoneVerified":true,"referredBy":true,"referralCode":true,"signupSourceId":true,"otherSignupSource":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":257,"b":260}]},{"name":"firstName","required":true,"transform":{"type":"scalar"},"locs":[{"a":263,"b":273}]},{"name":"lastName","required":true,"transform":{"type":"scalar"},"locs":[{"a":276,"b":285}]},{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":288,"b":294}]},{"name":"proxyEmail","required":false,"transform":{"type":"scalar"},"locs":[{"a":297,"b":307}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":310,"b":315}]},{"name":"smsConsent","required":false,"transform":{"type":"scalar"},"locs":[{"a":318,"b":328}]},{"name":"password","required":false,"transform":{"type":"scalar"},"locs":[{"a":331,"b":339}]},{"name":"passwordResetToken","required":false,"transform":{"type":"scalar"},"locs":[{"a":342,"b":360}]},{"name":"verified","required":false,"transform":{"type":"scalar"},"locs":[{"a":363,"b":371}]},{"name":"emailVerified","required":false,"transform":{"type":"scalar"},"locs":[{"a":374,"b":387}]},{"name":"phoneVerified","required":false,"transform":{"type":"scalar"},"locs":[{"a":390,"b":403}]},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"locs":[{"a":406,"b":416}]},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":419,"b":432}]},{"name":"signupSourceId","required":false,"transform":{"type":"scalar"},"locs":[{"a":435,"b":449}]},{"name":"otherSignupSource","required":false,"transform":{"type":"scalar"},"locs":[{"a":452,"b":469}]}],"statement":"INSERT INTO users (id, first_name, last_name, email, proxy_email, phone, sms_consent, PASSWORD, password_reset_token, verified, email_verified, phone_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at)\n    VALUES (:id!, :firstName!, :lastName!, :email!, :proxyEmail, :phone, :smsConsent, :password, :passwordResetToken, :verified, :emailVerified, :phoneVerified, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW())\nON CONFLICT (email)\n    DO NOTHING\nRETURNING\n    id, email, first_name, proxy_email"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (id, first_name, last_name, email, proxy_email, phone, sms_consent, PASSWORD, password_reset_token, verified, email_verified, phone_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at)
 *     VALUES (:id!, :firstName!, :lastName!, :email!, :proxyEmail, :phone, :smsConsent, :password, :passwordResetToken, :verified, :emailVerified, :phoneVerified, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW())
 * ON CONFLICT (email)
 *     DO NOTHING
 * RETURNING
 *     id, email, first_name, proxy_email
 * ```
 */
export const createUser = new PreparedQuery<ICreateUserParams,ICreateUserResult>(createUserIR);


/** 'UpsertUser' parameters type */
export interface IUpsertUserParams {
  email: string;
  emailVerified?: boolean | null | void;
  firstName: string;
  id: string;
  lastName: string;
  otherSignupSource?: string | null | void;
  password?: string | null | void;
  passwordResetToken?: string | null | void;
  phone?: string | null | void;
  phoneVerified?: boolean | null | void;
  proxyEmail?: string | null | void;
  referralCode: string;
  referredBy?: string | null | void;
  signupSourceId?: number | null | void;
  verified?: boolean | null | void;
}

/** 'UpsertUser' return type */
export interface IUpsertUserResult {
  email: string;
  firstName: string;
  id: string;
  isCreated: boolean | null;
  proxyEmail: string | null;
}

/** 'UpsertUser' query type */
export interface IUpsertUserQuery {
  params: IUpsertUserParams;
  result: IUpsertUserResult;
}

const upsertUserIR: any = {"usedParamSet":{"id":true,"firstName":true,"lastName":true,"email":true,"proxyEmail":true,"phone":true,"password":true,"passwordResetToken":true,"verified":true,"emailVerified":true,"phoneVerified":true,"referredBy":true,"referralCode":true,"signupSourceId":true,"otherSignupSource":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":244,"b":247}]},{"name":"firstName","required":true,"transform":{"type":"scalar"},"locs":[{"a":250,"b":260},{"a":512,"b":522}]},{"name":"lastName","required":true,"transform":{"type":"scalar"},"locs":[{"a":263,"b":272},{"a":537,"b":546}]},{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":275,"b":281}]},{"name":"proxyEmail","required":false,"transform":{"type":"scalar"},"locs":[{"a":284,"b":294},{"a":563,"b":573}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":297,"b":302},{"a":584,"b":589}]},{"name":"password","required":false,"transform":{"type":"scalar"},"locs":[{"a":305,"b":313},{"a":603,"b":611}]},{"name":"passwordResetToken","required":false,"transform":{"type":"scalar"},"locs":[{"a":316,"b":334},{"a":637,"b":655}]},{"name":"verified","required":false,"transform":{"type":"scalar"},"locs":[{"a":337,"b":345},{"a":669,"b":677}]},{"name":"emailVerified","required":false,"transform":{"type":"scalar"},"locs":[{"a":348,"b":361},{"a":697,"b":710}]},{"name":"phoneVerified","required":false,"transform":{"type":"scalar"},"locs":[{"a":364,"b":377},{"a":730,"b":743}]},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"locs":[{"a":380,"b":390}]},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":393,"b":406}]},{"name":"signupSourceId","required":false,"transform":{"type":"scalar"},"locs":[{"a":409,"b":423},{"a":765,"b":779}]},{"name":"otherSignupSource","required":false,"transform":{"type":"scalar"},"locs":[{"a":426,"b":443},{"a":804,"b":821}]}],"statement":"INSERT INTO users (id, first_name, last_name, email, proxy_email, phone, PASSWORD, password_reset_token, verified, email_verified, phone_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at)\n    VALUES (:id!, :firstName!, :lastName!, :email!, :proxyEmail, :phone, :password, :passwordResetToken, :verified, :emailVerified, :phoneVerified, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW())\nON CONFLICT (email)\n    DO UPDATE SET\n        first_name = :firstName!, last_name = :lastName!, proxy_email = :proxyEmail, phone = :phone, PASSWORD = :password, password_reset_token = :passwordResetToken, verified = :verified, email_verified = :emailVerified, phone_verified = :phoneVerified, signup_source_id = :signupSourceId, other_signup_source = :otherSignupSource\n    RETURNING\n        id, email, first_name, proxy_email, (xmax = 0) AS is_created"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (id, first_name, last_name, email, proxy_email, phone, PASSWORD, password_reset_token, verified, email_verified, phone_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at)
 *     VALUES (:id!, :firstName!, :lastName!, :email!, :proxyEmail, :phone, :password, :passwordResetToken, :verified, :emailVerified, :phoneVerified, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW())
 * ON CONFLICT (email)
 *     DO UPDATE SET
 *         first_name = :firstName!, last_name = :lastName!, proxy_email = :proxyEmail, phone = :phone, PASSWORD = :password, password_reset_token = :passwordResetToken, verified = :verified, email_verified = :emailVerified, phone_verified = :phoneVerified, signup_source_id = :signupSourceId, other_signup_source = :otherSignupSource
 *     RETURNING
 *         id, email, first_name, proxy_email, (xmax = 0) AS is_created
 * ```
 */
export const upsertUser = new PreparedQuery<IUpsertUserParams,IUpsertUserResult>(upsertUserIR);


/** 'GetUserVerificationByEmail' parameters type */
export interface IGetUserVerificationByEmailParams {
  email: string;
}

/** 'GetUserVerificationByEmail' return type */
export interface IGetUserVerificationByEmailResult {
  email: string;
  emailVerified: boolean;
  id: string;
  phoneVerified: boolean;
  verified: boolean;
}

/** 'GetUserVerificationByEmail' query type */
export interface IGetUserVerificationByEmailQuery {
  params: IGetUserVerificationByEmailParams;
  result: IGetUserVerificationByEmailResult;
}

const getUserVerificationByEmailIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":112,"b":118}]}],"statement":"SELECT\n    id,\n    email,\n    email_verified,\n    phone_verified,\n    verified\nFROM\n    users\nWHERE\n    email = :email!\n    AND deactivated IS FALSE\n    AND deleted IS FALSE"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     email,
 *     email_verified,
 *     phone_verified,
 *     verified
 * FROM
 *     users
 * WHERE
 *     email = :email!
 *     AND deactivated IS FALSE
 *     AND deleted IS FALSE
 * ```
 */
export const getUserVerificationByEmail = new PreparedQuery<IGetUserVerificationByEmailParams,IGetUserVerificationByEmailResult>(getUserVerificationByEmailIR);


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


/** 'GetUserById' parameters type */
export interface IGetUserByIdParams {
  deactivated?: boolean | null | void;
  id: string;
}

/** 'GetUserById' return type */
export interface IGetUserByIdResult {
  approved: boolean;
  banType: ban_types | null;
  deactivated: boolean;
  email: string;
  firstName: string;
  id: string;
  isAdmin: boolean | null;
  isVolunteer: boolean | null;
  lastActivityAt: Date | null;
  phone: string | null;
  phoneVerified: boolean;
  proxyEmail: string | null;
  referralCode: string;
  roles: stringArray | null;
  smsConsent: boolean;
  studentPartnerOrg: string;
  volunteerPartnerOrg: string;
}

/** 'GetUserById' query type */
export interface IGetUserByIdQuery {
  params: IGetUserByIdParams;
  result: IGetUserByIdResult;
}

const getUserByIdIR: any = {"usedParamSet":{"id":true,"deactivated":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":1268,"b":1271}]},{"name":"deactivated","required":false,"transform":{"type":"scalar"},"locs":[{"a":1282,"b":1293},{"a":1343,"b":1354}]}],"statement":"SELECT\n    users.id,\n    first_name,\n    email,\n    proxy_email,\n    ban_type,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    student_partner_orgs.key AS student_partner_org,\n    users.last_activity_at,\n    deactivated,\n    volunteer_profiles.approved,\n    users.phone,\n    users.phone_verified,\n    users.sms_consent,\n    array_agg(user_roles.name) AS roles,\n    users.referral_code\nFROM\n    users\n    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN users_roles ON users_roles.user_id = users.id\n    LEFT JOIN user_roles ON user_roles.id = users_roles.role_id\nWHERE\n    users.id = :id!\n    AND (:deactivated::boolean IS NULL\n        OR users.deactivated = :deactivated::boolean)\n    AND users.deleted IS FALSE\nGROUP BY\n    users.id,\n    volunteer_profiles.user_id,\n    admin_profiles.user_id,\n    volunteer_partner_orgs.id,\n    student_partner_orgs.id\nLIMIT 1"};

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
 *     array_agg(user_roles.name) AS roles,
 *     users.referral_code
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
 *     AND (:deactivated::boolean IS NULL
 *         OR users.deactivated = :deactivated::boolean)
 *     AND users.deleted IS FALSE
 * GROUP BY
 *     users.id,
 *     volunteer_profiles.user_id,
 *     admin_profiles.user_id,
 *     volunteer_partner_orgs.id,
 *     student_partner_orgs.id
 * LIMIT 1
 * ```
 */
export const getUserById = new PreparedQuery<IGetUserByIdParams,IGetUserByIdResult>(getUserByIdIR);


/** 'GetUserBanStatus' parameters type */
export interface IGetUserBanStatusParams {
  id: string;
}

/** 'GetUserBanStatus' return type */
export interface IGetUserBanStatusResult {
  banType: ban_types | null;
}

/** 'GetUserBanStatus' query type */
export interface IGetUserBanStatusQuery {
  params: IGetUserBanStatusParams;
  result: IGetUserBanStatusResult;
}

const getUserBanStatusIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":50,"b":53}]}],"statement":"SELECT\n    ban_type\nFROM\n    users\nWHERE\n    id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ban_type
 * FROM
 *     users
 * WHERE
 *     id = :id!
 * ```
 */
export const getUserBanStatus = new PreparedQuery<IGetUserBanStatusParams,IGetUserBanStatusResult>(getUserBanStatusIR);


/** 'GetUserByReferralCode' parameters type */
export interface IGetUserByReferralCodeParams {
  referralCode: string;
}

/** 'GetUserByReferralCode' return type */
export interface IGetUserByReferralCodeResult {
  firstName: string;
  id: string;
}

/** 'GetUserByReferralCode' query type */
export interface IGetUserByReferralCodeQuery {
  params: IGetUserByReferralCodeParams;
  result: IGetUserByReferralCodeResult;
}

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


/** 'GetUserReferralLink' parameters type */
export interface IGetUserReferralLinkParams {
  id: string;
}

/** 'GetUserReferralLink' return type */
export interface IGetUserReferralLinkResult {
  email: string;
  firstName: string;
  referralCode: string;
}

/** 'GetUserReferralLink' query type */
export interface IGetUserReferralLinkQuery {
  params: IGetUserReferralLinkParams;
  result: IGetUserReferralLinkResult;
}

const getUserReferralLinkIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":82,"b":85}]}],"statement":"SELECT\n    first_name,\n    email,\n    referral_code\nFROM\n    users\nWHERE\n    id = :id!\n    AND deactivated IS FALSE\n    AND deleted IS FALSE"};

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
 *     AND deactivated IS FALSE
 *     AND deleted IS FALSE
 * ```
 */
export const getUserReferralLink = new PreparedQuery<IGetUserReferralLinkParams,IGetUserReferralLinkResult>(getUserReferralLinkIR);


/** 'GetUserForPassport' parameters type */
export interface IGetUserForPassportParams {
  email: string;
}

/** 'GetUserForPassport' return type */
export interface IGetUserForPassportResult {
  email: string;
  id: string;
  password: string | null;
  proxyEmail: string | null;
}

/** 'GetUserForPassport' query type */
export interface IGetUserForPassportQuery {
  params: IGetUserForPassportParams;
  result: IGetUserForPassportResult;
}

const getUserForPassportIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":102,"b":108}]}],"statement":"SELECT\n    id,\n    email,\n    proxy_email,\n    PASSWORD\nFROM\n    users\nWHERE\n    LOWER(email) = LOWER(:email!)\n    AND deleted IS FALSE\nLIMIT 1"};

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
 *     AND deleted IS FALSE
 * LIMIT 1
 * ```
 */
export const getUserForPassport = new PreparedQuery<IGetUserForPassportParams,IGetUserForPassportResult>(getUserForPassportIR);


/** 'GetUserByResetToken' parameters type */
export interface IGetUserByResetTokenParams {
  resetToken: string;
}

/** 'GetUserByResetToken' return type */
export interface IGetUserByResetTokenResult {
  email: string;
  id: string;
}

/** 'GetUserByResetToken' query type */
export interface IGetUserByResetTokenQuery {
  params: IGetUserByResetTokenParams;
  result: IGetUserByResetTokenResult;
}

const getUserByResetTokenIR: any = {"usedParamSet":{"resetToken":true},"params":[{"name":"resetToken","required":true,"transform":{"type":"scalar"},"locs":[{"a":73,"b":84}]}],"statement":"SELECT\n    id,\n    email\nFROM\n    users\nWHERE\n    password_reset_token = :resetToken!\n    AND deleted IS FALSE"};

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
 *     AND deleted IS FALSE
 * ```
 */
export const getUserByResetToken = new PreparedQuery<IGetUserByResetTokenParams,IGetUserByResetTokenResult>(getUserByResetTokenIR);


/** 'CountReferredUsersWithFilter' parameters type */
export interface ICountReferredUsersWithFilterParams {
  hasRoles?: stringArray | null | void;
  phoneOrEmailVerified?: boolean | null | void;
  userId: string;
}

/** 'CountReferredUsersWithFilter' return type */
export interface ICountReferredUsersWithFilterResult {
  id: string;
  roles: stringArray | null;
}

/** 'CountReferredUsersWithFilter' query type */
export interface ICountReferredUsersWithFilterQuery {
  params: ICountReferredUsersWithFilterParams;
  result: ICountReferredUsersWithFilterResult;
}

const countReferredUsersWithFilterIR: any = {"usedParamSet":{"userId":true,"phoneOrEmailVerified":true,"hasRoles":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":199,"b":206}]},{"name":"phoneOrEmailVerified","required":false,"transform":{"type":"scalar"},"locs":[{"a":223,"b":243},{"a":292,"b":312},{"a":353,"b":373}]},{"name":"hasRoles","required":false,"transform":{"type":"scalar"},"locs":[{"a":456,"b":464}]}],"statement":"SELECT\n    u.id,\n    array_agg(roles.name)::text[] AS roles\nFROM\n    users u\n    JOIN users_roles ur ON ur.user_id = u.id\n    JOIN user_roles roles ON roles.id = ur.role_id\nWHERE\n    u.referred_by = :userId!::uuid\n    AND (:phoneOrEmailVerified::boolean IS NULL\n        OR u.phone_verified = :phoneOrEmailVerified::boolean\n        OR u.email_verified = :phoneOrEmailVerified::boolean)\nGROUP BY\n    u.id\nHAVING\n    array_agg(roles.name)::text[] @> COALESCE(:hasRoles::text[], ARRAY[]::text[])"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     u.id,
 *     array_agg(roles.name)::text[] AS roles
 * FROM
 *     users u
 *     JOIN users_roles ur ON ur.user_id = u.id
 *     JOIN user_roles roles ON roles.id = ur.role_id
 * WHERE
 *     u.referred_by = :userId!::uuid
 *     AND (:phoneOrEmailVerified::boolean IS NULL
 *         OR u.phone_verified = :phoneOrEmailVerified::boolean
 *         OR u.email_verified = :phoneOrEmailVerified::boolean)
 * GROUP BY
 *     u.id
 * HAVING
 *     array_agg(roles.name)::text[] @> COALESCE(:hasRoles::text[], ARRAY[]::text[])
 * ```
 */
export const countReferredUsersWithFilter = new PreparedQuery<ICountReferredUsersWithFilterParams,ICountReferredUsersWithFilterResult>(countReferredUsersWithFilterIR);


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


/** 'UpdateUserVerifiedPhoneById' parameters type */
export interface IUpdateUserVerifiedPhoneByIdParams {
  phone: string;
  userId: string;
}

/** 'UpdateUserVerifiedPhoneById' return type */
export interface IUpdateUserVerifiedPhoneByIdResult {
  ok: string | null;
}

/** 'UpdateUserVerifiedPhoneById' query type */
export interface IUpdateUserVerifiedPhoneByIdQuery {
  params: IUpdateUserVerifiedPhoneByIdParams;
  result: IUpdateUserVerifiedPhoneByIdResult;
}

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


/** 'UpdateUserPhoneNumberByUserId' parameters type */
export interface IUpdateUserPhoneNumberByUserIdParams {
  phone: string;
  userId: string;
}

/** 'UpdateUserPhoneNumberByUserId' return type */
export interface IUpdateUserPhoneNumberByUserIdResult {
  ok: string;
}

/** 'UpdateUserPhoneNumberByUserId' query type */
export interface IUpdateUserPhoneNumberByUserIdQuery {
  params: IUpdateUserPhoneNumberByUserIdParams;
  result: IUpdateUserPhoneNumberByUserIdResult;
}

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


/** 'UpdateUserLastActivityById' parameters type */
export interface IUpdateUserLastActivityByIdParams {
  lastActivityAt: DateOrString;
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


/** 'UpdateUserBanById' parameters type */
export interface IUpdateUserBanByIdParams {
  banReason: string;
  banType: ban_types;
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


/** 'GetUsersForAdminSearch' parameters type */
export interface IGetUsersForAdminSearchParams {
  email?: string | null | void;
  firstName?: string | null | void;
  lastName?: string | null | void;
  limit: number;
  offset: number;
  partnerOrg?: string | null | void;
  school?: string | null | void;
  userId?: string | null | void;
}

/** 'GetUsersForAdminSearch' return type */
export interface IGetUsersForAdminSearchResult {
  createdAt: Date;
  email: string;
  firstName: string;
  id: string;
  lastName: string | null;
}

/** 'GetUsersForAdminSearch' query type */
export interface IGetUsersForAdminSearchQuery {
  params: IGetUsersForAdminSearchParams;
  result: IGetUsersForAdminSearchResult;
}

const getUsersForAdminSearchIR: any = {"usedParamSet":{"userId":true,"email":true,"firstName":true,"lastName":true,"partnerOrg":true,"school":true,"limit":true,"offset":true},"params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":870,"b":876},{"a":911,"b":917}]},{"name":"email","required":false,"transform":{"type":"scalar"},"locs":[{"a":926,"b":931},{"a":981,"b":986}]},{"name":"firstName","required":false,"transform":{"type":"scalar"},"locs":[{"a":1003,"b":1012},{"a":1067,"b":1076}]},{"name":"lastName","required":false,"transform":{"type":"scalar"},"locs":[{"a":1093,"b":1101},{"a":1155,"b":1163}]},{"name":"partnerOrg","required":false,"transform":{"type":"scalar"},"locs":[{"a":1180,"b":1190},{"a":1243,"b":1253},{"a":1289,"b":1299}]},{"name":"school","required":false,"transform":{"type":"scalar"},"locs":[{"a":1308,"b":1314},{"a":1365,"b":1371},{"a":1432,"b":1438}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":1508,"b":1514}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":1530,"b":1537}]}],"statement":"SELECT\n    users.id,\n    users.email,\n    users.first_name,\n    (\n        CASE WHEN student_profiles.user_id IS NOT NULL THEN\n            NULL\n        ELSE\n            users.last_name\n        END) AS last_name,\n    users.created_at\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN teacher_profiles ON teacher_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN schools ON schools.id = COALESCE(student_profiles.school_id, teacher_profiles.school_id)\n    LEFT JOIN school_nces_metadata ON school_nces_metadata.school_id = schools.id\nWHERE ((:userId)::uuid IS NULL\n    OR users.id = :userId)\nAND ((:email)::text IS NULL\n    OR users.email ILIKE ('%' || :email || '%'))\nAND ((:firstName)::text IS NULL\n    OR users.first_name ILIKE ('%' || :firstName || '%'))\nAND ((:lastName)::text IS NULL\n    OR users.last_name ILIKE ('%' || :lastName || '%'))\nAND ((:partnerOrg)::text IS NULL\n    OR volunteer_partner_orgs.key = :partnerOrg\n    OR student_partner_orgs.key = :partnerOrg)\nAND ((:school)::text IS NULL\n    OR schools.name ILIKE ('%' || :school || '%')\n    OR school_nces_metadata.sch_name ILIKE ('%' || :school || '%'))\nGROUP BY\n    users.id,\n    student_profiles.user_id\nLIMIT (:limit!)::int OFFSET (:offset!)::int"};

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
 *     users.created_at
 * FROM
 *     users
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 *     LEFT JOIN teacher_profiles ON teacher_profiles.user_id = users.id
 *     LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN schools ON schools.id = COALESCE(student_profiles.school_id, teacher_profiles.school_id)
 *     LEFT JOIN school_nces_metadata ON school_nces_metadata.school_id = schools.id
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


/** 'GetUserForAdminDetail' parameters type */
export interface IGetUserForAdminDetailParams {
  userId: string;
}

/** 'GetUserForAdminDetail' return type */
export interface IGetUserForAdminDetailResult {
  banType: ban_types | null;
  city: string | null;
  college: string | null;
  company: string | null;
  country: string | null;
  createdAt: Date;
  currentGrade: string | null;
  email: string;
  experience: Json | null;
  firstName: string;
  id: string;
  isAdmin: boolean | null;
  isApproved: boolean;
  isDeactivated: boolean;
  isDeleted: boolean | null;
  isOnboarded: boolean;
  isTestUser: boolean;
  languages: stringArray | null;
  lastName: string | null;
  linkedinUrl: string | null;
  numPastSessions: string | null;
  occupation: stringArray | null;
  partnerSite: string;
  photoIdS3Key: string | null;
  photoIdStatus: string;
  schoolId: string;
  schoolName: string | null;
  state: string | null;
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

const getUserForAdminDetailIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":2650,"b":2657},{"a":2687,"b":2694},{"a":3069,"b":3076},{"a":3160,"b":3167}]}],"statement":"SELECT\n    users.id,\n    users.first_name AS first_name,\n    (\n        CASE WHEN student_profiles.user_id IS NOT NULL THEN\n            NULL\n        ELSE\n            users.last_name\n        END) AS last_name,\n    users.email,\n    users.created_at,\n    users.deactivated AS is_deactivated,\n    users.deleted AS is_deleted,\n    users.test_user AS is_test_user,\n    users.verified,\n    users.ban_type AS ban_type,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    session_count.total AS num_past_sessions,\n    -- Volunteer specific fields:\n    volunteer_profiles.approved AS is_approved,\n    volunteer_profiles.onboarded AS is_onboarded,\n    volunteer_partner_orgs.name AS volunteer_partner_org,\n    volunteer_profiles.photo_id_s3_key,\n    photo_id_statuses.name AS photo_id_status,\n    volunteer_profiles.country,\n    volunteer_profiles.linkedin_url,\n    volunteer_profiles.college,\n    volunteer_profiles.company,\n    volunteer_profiles.languages,\n    volunteer_profiles.experience,\n    volunteer_profiles.city,\n    volunteer_profiles.state,\n    occupations.occupation,\n    -- Student specific fields:\n    COALESCE(cgl.current_grade_name, grade_levels.name) AS current_grade,\n    student_profiles.postal_code AS zip_code,\n    student_partner_orgs.name AS student_partner_org,\n    student_partner_org_sites.name AS partner_site,\n    -- Student/teacher field:\n    schools.id AS school_id,\n    COALESCE(schools.name, school_nces_metadata.sch_name) AS school_name\nFROM\n    users\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN teacher_profiles ON teacher_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN student_partner_org_sites ON student_partner_org_sites.id = student_profiles.student_partner_org_site_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id\n    LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    LEFT JOIN user_product_flags ON user_product_flags.user_id = users.id\n    LEFT JOIN grade_levels ON grade_levels.id = student_profiles.grade_level_id\n    LEFT JOIN current_grade_levels_mview cgl ON cgl.user_id = student_profiles.user_id\n    LEFT JOIN (\n        SELECT\n            COUNT(*) AS total\n        FROM\n            sessions\n        WHERE\n            volunteer_id = :userId!\n            OR student_id = :userId!) AS session_count ON TRUE\n    LEFT JOIN schools ON schools.id = COALESCE(student_profiles.school_id, teacher_profiles.school_id)\n    LEFT JOIN school_nces_metadata ON school_nces_metadata.school_id = schools.id\n    LEFT JOIN (\n        SELECT\n            array_agg(occupation) AS occupation\n        FROM\n            volunteer_occupations\n        WHERE\n            user_id = :userId!\n        GROUP BY\n            user_id) AS occupations ON TRUE\nWHERE\n    users.id = :userId!"};

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
 *     users.deleted AS is_deleted,
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


/** 'GetLegacyUser' parameters type */
export interface IGetLegacyUserParams {
  userId: string;
}

/** 'GetLegacyUser' return type */
export interface IGetLegacyUserResult {
  activeSubjects: stringArray | null;
  availabilityLastModifiedAt: Date;
  banReason: string;
  banType: ban_types | null;
  college: string | null;
  country: string | null;
  createdAt: Date;
  elapsedAvailability: string | null;
  email: string;
  emailVerified: boolean;
  firstname: string;
  firstName: string;
  gradeLevel: string | null;
  hoursTutored: number | null;
  id: string;
  isAdmin: boolean | null;
  isApproved: boolean;
  isDeactivated: boolean;
  isFakeUser: boolean | null;
  isOnboarded: boolean;
  isSchoolPartner: boolean | null;
  issuers: stringArray | null;
  isTestUser: boolean;
  isVolunteer: boolean | null;
  lastActivityAt: Date | null;
  lastName: string;
  lastSuccessfulCleverSync: Date | null;
  mutedSubjectAlerts: stringArray | null;
  numberOfStudentClasses: string | null;
  occupation: stringArray | null;
  partnerSite: string;
  pastSessions: stringArray | null;
  phone: string | null;
  phoneVerified: boolean;
  photoIdStatus: string;
  preferredLanguage: string | null;
  proxyEmail: string | null;
  referralCode: string;
  referredBy: string | null;
  roleId: number;
  schoolName: string;
  signupSource: string | null;
  smsConsent: boolean;
  studentPartnerOrg: string;
  subjects: stringArray | null;
  timezone: string | null;
  totalQuizzesPassed: number | null;
  totalTimeTutored: number | null;
  totalTutoredSessions: number | null;
  totalVolunteerHours: number | null;
  verified: boolean;
  volunteerPartnerOrg: string;
}

/** 'GetLegacyUser' query type */
export interface IGetLegacyUserQuery {
  params: IGetLegacyUserParams;
  result: IGetLegacyUserResult;
}

const getLegacyUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":3259,"b":3266},{"a":3519,"b":3526},{"a":5017,"b":5024},{"a":6296,"b":6303},{"a":6865,"b":6872},{"a":6904,"b":6911},{"a":7075,"b":7082},{"a":7759,"b":7766},{"a":7949,"b":7956},{"a":8173,"b":8180},{"a":8316,"b":8323}]}],"statement":"SELECT\n    users.id,\n    users.first_name,\n    users.last_name,\n    users.created_at,\n    users.email,\n    users.email_verified,\n    users.proxy_email,\n    users.verified,\n    users.first_name AS firstname,\n    users.phone,\n    users.phone_verified,\n    users.sms_consent,\n    volunteer_profiles.college,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    users.ban_type AS ban_type,\n    ban_reasons.name AS ban_reason,\n    users.test_user AS is_test_user,\n    FALSE AS is_fake_user,\n    users.deactivated AS is_deactivated,\n    users.last_activity_at AS last_activity_at,\n    users.referral_code AS referral_code,\n    users.referred_by AS referred_by,\n    users.preferred_language AS preferred_language,\n    volunteer_profiles.onboarded AS is_onboarded,\n    volunteer_profiles.approved AS is_approved,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    volunteer_profiles.country,\n    volunteer_profiles.timezone,\n    photo_id_statuses.name AS photo_id_status,\n    COALESCE(past_sessions.sessions, '{}') AS past_sessions,\n    round(past_sessions.time_tutored / 3600000::numeric, 2)::float AS hours_tutored,\n    COALESCE(past_sessions.time_tutored::float, 0) AS total_time_tutored,\n    COALESCE(array_length(past_sessions.total_tutored_sessions, 1), 0) AS total_tutored_sessions,\n    array_cat(total_subjects.subjects, computed_subjects.subjects) AS subjects,\n    recent_availability.updated_at AS availability_last_modified_at,\n    occupations.occupations AS occupation,\n    student_partner_org_sites.name AS partner_site,\n    student_partner_orgs.name AS student_partner_org,\n    COALESCE(volunteer_profiles.elapsed_availability, 0) AS elapsed_availability,\n    volunteer_profiles.total_volunteer_hours,\n    schools.name AS school_name,\n    (\n        CASE WHEN EXISTS (\n            SELECT\n                1\n            FROM\n                student_partner_orgs\n            LEFT JOIN student_partner_orgs_upchieve_instances spoui ON spoui.student_partner_org_id = student_partner_orgs.id\n        WHERE\n            student_partner_orgs.school_id = COALESCE(student_profiles.school_id, teacher_profiles.school_id)\n            AND spoui.deactivated_on IS NULL) THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_school_partner,\nCOALESCE(cgl.current_grade_name, grade_levels.name) AS grade_level,\narray_cat(total_subjects.active_subjects, computed_subjects.active_subjects) AS active_subjects,\nusers_quizzes.total::int AS total_quizzes_passed,\nusers_roles.role_id,\nmuted_users_subject_alerts_agg.muted_subject_alerts,\nnumber_of_student_classes.count AS number_of_student_classes,\nfederated_credentials_agg.issuers,\nteacher_profiles.last_successful_clever_sync,\nCASE WHEN users.other_signup_source <> ''\n    AND users.other_signup_source IS NOT NULL THEN\n    users.other_signup_source\nELSE\n    signup_sources.name\nEND AS signup_source\nFROM\n    users\n    LEFT JOIN (\n        SELECT\n            updated_at\n        FROM\n            availabilities\n        WHERE\n            availabilities.user_id = :userId!\n        ORDER BY\n            updated_at\n        LIMIT 1) AS recent_availability ON TRUE\n    LEFT JOIN (\n        SELECT\n            array_agg(occupation) AS occupations\n        FROM\n            volunteer_occupations\n        WHERE\n            user_id = :userId!) AS occupations ON TRUE\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN admin_profiles ON users.id = admin_profiles.user_id\n    LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\n    LEFT JOIN teacher_profiles ON users.id = teacher_profiles.user_id\n    LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id\n    LEFT JOIN ban_reasons ON users.ban_reason_id = ban_reasons.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN student_partner_org_sites ON student_partner_org_sites.id = student_profiles.student_partner_org_site_id\n    LEFT JOIN (\n        SELECT\n            array_agg(DISTINCT subjects_unlocked.subject) AS subjects,\n            array_agg(DISTINCT subjects_unlocked.subject) FILTER (WHERE subjects_unlocked.active_subject IS TRUE) AS active_subjects\n        FROM (\n            SELECT\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subjects.active AS active_subject\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n            WHERE\n                users_certifications.user_id = :userId!\n            GROUP BY\n                subjects.name, subjects.active) AS subjects_unlocked) AS total_subjects ON TRUE\n    LEFT JOIN (\n        SELECT\n            array_agg(DISTINCT computed_subjects_unlocked.subject) AS subjects,\n            array_agg(DISTINCT computed_subjects_unlocked.subject) FILTER (WHERE computed_subjects_unlocked.active_subject IS TRUE) AS active_subjects\n        FROM (\n            SELECT\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_certs.total,\n                subjects.active AS active_subject\n            FROM\n                users_certifications\n                JOIN computed_subject_unlocks USING (certification_id)\n                JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        computed_subject_unlocks\n                        JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_certs ON subject_certs.name = subjects.name\n                WHERE\n                    users_certifications.user_id = :userId!\n                GROUP BY\n                    subjects.name,\n                    subject_certs.total,\n                    subjects.active\n                HAVING\n                    COUNT(*)::int >= subject_certs.total) AS computed_subjects_unlocked) AS computed_subjects ON TRUE\n    LEFT JOIN (\n        SELECT\n            array_agg(id) AS sessions,\n            sum(time_tutored)::bigint AS time_tutored,\n            array_agg(id) FILTER (WHERE time_tutored > 0) AS total_tutored_sessions\n        FROM\n            sessions\n        WHERE\n            student_id = :userId!\n            OR volunteer_id = :userId!) AS past_sessions ON TRUE\n    LEFT JOIN (\n        SELECT\n            count(*) AS total\n        FROM\n            users_quizzes\n        WHERE\n            user_id = :userId!\n            AND passed IS TRUE) AS users_quizzes ON TRUE\n    LEFT JOIN schools ON schools.id = COALESCE(student_profiles.school_id, teacher_profiles.school_id)\n    LEFT JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id\n    LEFT JOIN current_grade_levels_mview cgl ON cgl.user_id = student_profiles.user_id\n    LEFT JOIN users_roles ON users_roles.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            array_agg(subjects.name) AS muted_subject_alerts\n        FROM\n            muted_users_subject_alerts\n            JOIN subjects ON muted_users_subject_alerts.subject_id = subjects.id\n        WHERE\n            muted_users_subject_alerts.user_id = :userId!) AS muted_users_subject_alerts_agg ON TRUE\n    LEFT JOIN (\n        SELECT\n            COUNT(*) AS count\n        FROM\n            student_classes\n        WHERE\n            user_id = :userId!) AS number_of_student_classes ON TRUE\n    LEFT JOIN (\n        SELECT\n            array_agg(issuer) AS issuers\n        FROM\n            federated_credentials\n        WHERE\n            federated_credentials.user_id = :userId!) AS federated_credentials_agg ON TRUE\n    LEFT JOIN signup_sources ON signup_sources.id = users.signup_source_id\nWHERE\n    users.id = :userId!\n    AND users.deleted IS FALSE"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name,
 *     users.last_name,
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
 *     users.preferred_language AS preferred_language,
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
 *             student_partner_orgs.school_id = COALESCE(student_profiles.school_id, teacher_profiles.school_id)
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
 * federated_credentials_agg.issuers,
 * teacher_profiles.last_successful_clever_sync,
 * CASE WHEN users.other_signup_source <> ''
 *     AND users.other_signup_source IS NOT NULL THEN
 *     users.other_signup_source
 * ELSE
 *     signup_sources.name
 * END AS signup_source
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
 *     LEFT JOIN teacher_profiles ON users.id = teacher_profiles.user_id
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
 *     LEFT JOIN schools ON schools.id = COALESCE(student_profiles.school_id, teacher_profiles.school_id)
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
 *     LEFT JOIN signup_sources ON signup_sources.id = users.signup_source_id
 * WHERE
 *     users.id = :userId!
 *     AND users.deleted IS FALSE
 * ```
 */
export const getLegacyUser = new PreparedQuery<IGetLegacyUserParams,IGetLegacyUserResult>(getLegacyUserIR);


/** 'GetUserToCreateSendGridContact' parameters type */
export interface IGetUserToCreateSendGridContactParams {
  userId: string;
}

/** 'GetUserToCreateSendGridContact' return type */
export interface IGetUserToCreateSendGridContactResult {
  banType: ban_types | null;
  createdAt: Date;
  email: string;
  firstName: string;
  id: string;
  isAdmin: boolean | null;
  isVolunteer: boolean | null;
  lastActivityAt: Date | null;
  lastName: string;
  phoneVerified: boolean;
  smsConsent: boolean;
  studentGradeLevel: string | null;
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

const getUserToCreateSendGridContactIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1421,"b":1428}]}],"statement":"SELECT\n    users.id,\n    first_name,\n    email,\n    sms_consent,\n    phone_verified,\n    ban_type,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    volunteer_partner_orgs.name AS volunteer_partner_org_display,\n    student_partner_orgs.key AS student_partner_org,\n    student_partner_orgs.name AS student_partner_org_display,\n    users.last_activity_at,\n    users.created_at,\n    users.test_user,\n    users.last_name,\n    COALESCE(cgl.current_grade_name, grade_levels.name) AS student_grade_level\nFROM\n    users\n    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id\n    LEFT JOIN current_grade_levels_mview cgl ON student_profiles.user_id = cgl.user_id\nWHERE\n    users.id = :userId!\n    AND users.deactivated IS FALSE\n    AND users.deleted IS FALSE\nLIMIT 1"};

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
 *     LEFT JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id
 *     LEFT JOIN current_grade_levels_mview cgl ON student_profiles.user_id = cgl.user_id
 * WHERE
 *     users.id = :userId!
 *     AND users.deactivated IS FALSE
 *     AND users.deleted IS FALSE
 * LIMIT 1
 * ```
 */
export const getUserToCreateSendGridContact = new PreparedQuery<IGetUserToCreateSendGridContactParams,IGetUserToCreateSendGridContactResult>(getUserToCreateSendGridContactIR);


/** 'GetPastSessionsForAdminDetail' parameters type */
export interface IGetPastSessionsForAdminDetailParams {
  limit: number;
  offset: number;
  userId: string;
}

/** 'GetPastSessionsForAdminDetail' return type */
export interface IGetPastSessionsForAdminDetailResult {
  createdAt: Date;
  endedAt: Date | null;
  id: string;
  student: string;
  studentFirstName: string;
  subTopic: string;
  totalMessages: number | null;
  type: string;
  volunteer: string | null;
  volunteerFirstName: string;
  volunteerJoinedAt: Date | null;
}

/** 'GetPastSessionsForAdminDetail' query type */
export interface IGetPastSessionsForAdminDetailQuery {
  params: IGetPastSessionsForAdminDetailParams;
  result: IGetPastSessionsForAdminDetailResult;
}

const getPastSessionsForAdminDetailIR: any = {"usedParamSet":{"userId":true,"limit":true,"offset":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":866,"b":873},{"a":904,"b":911}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":958,"b":964}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":980,"b":987}]}],"statement":"SELECT\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    sessions.id,\n    messages.total AS total_messages,\n    sessions.volunteer_id AS volunteer,\n    volunteers.first_name AS volunteer_first_name,\n    sessions.student_id AS student,\n    students.first_name AS student_first_name,\n    sessions.volunteer_joined_at,\n    sessions.created_at,\n    sessions.ended_at\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            session_messages\n        WHERE\n            session_id = sessions.id) AS messages ON TRUE\n    LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id\n    LEFT JOIN users students ON students.id = sessions.student_id\nWHERE\n    sessions.volunteer_id = :userId!\n    OR sessions.student_id = :userId!\nORDER BY\n    sessions.created_at DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     topics.name AS TYPE,
 *     subjects.name AS sub_topic,
 *     sessions.id,
 *     messages.total AS total_messages,
 *     sessions.volunteer_id AS volunteer,
 *     volunteers.first_name AS volunteer_first_name,
 *     sessions.student_id AS student,
 *     students.first_name AS student_first_name,
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
 *     LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id
 *     LEFT JOIN users students ON students.id = sessions.student_id
 * WHERE
 *     sessions.volunteer_id = :userId!
 *     OR sessions.student_id = :userId!
 * ORDER BY
 *     sessions.created_at DESC
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
export const getPastSessionsForAdminDetail = new PreparedQuery<IGetPastSessionsForAdminDetailParams,IGetPastSessionsForAdminDetailResult>(getPastSessionsForAdminDetailIR);


/** 'GetLegacyCertifications' parameters type */
export type IGetLegacyCertificationsParams = void;

/** 'GetLegacyCertifications' return type */
export interface IGetLegacyCertificationsResult {
  name: string;
}

/** 'GetLegacyCertifications' query type */
export interface IGetLegacyCertificationsQuery {
  params: IGetLegacyCertificationsParams;
  result: IGetLegacyCertificationsResult;
}

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


/** 'GetTotalSessionsByUserId' parameters type */
export interface IGetTotalSessionsByUserIdParams {
  userId: string;
}

/** 'GetTotalSessionsByUserId' return type */
export interface IGetTotalSessionsByUserIdResult {
  total: number | null;
}

/** 'GetTotalSessionsByUserId' query type */
export interface IGetTotalSessionsByUserIdQuery {
  params: IGetTotalSessionsByUserIdParams;
  result: IGetTotalSessionsByUserIdResult;
}

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


/** 'InsertUserRoleByUserId' parameters type */
export interface IInsertUserRoleByUserIdParams {
  roleName: string;
  userId: string;
}

/** 'InsertUserRoleByUserId' return type */
export interface IInsertUserRoleByUserIdResult {
  ok: string;
}

/** 'InsertUserRoleByUserId' query type */
export interface IInsertUserRoleByUserIdQuery {
  params: IInsertUserRoleByUserIdParams;
  result: IInsertUserRoleByUserIdResult;
}

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


/** 'UpdateUserProfileById' parameters type */
export interface IUpdateUserProfileByIdParams {
  deactivated?: boolean | null | void;
  otherSignupSource?: string | null | void;
  phone?: string | null | void;
  preferredLanguage?: string | null | void;
  signupSourceId?: number | null | void;
  smsConsent?: boolean | null | void;
  userId: string;
}

/** 'UpdateUserProfileById' return type */
export interface IUpdateUserProfileByIdResult {
  ok: string;
}

/** 'UpdateUserProfileById' query type */
export interface IUpdateUserProfileByIdQuery {
  params: IUpdateUserProfileByIdParams;
  result: IUpdateUserProfileByIdResult;
}

const updateUserProfileByIdIR: any = {"usedParamSet":{"deactivated":true,"phone":true,"smsConsent":true,"preferredLanguage":true,"signupSourceId":true,"otherSignupSource":true,"userId":true},"params":[{"name":"deactivated","required":false,"transform":{"type":"scalar"},"locs":[{"a":48,"b":59}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":97,"b":102}]},{"name":"smsConsent","required":false,"transform":{"type":"scalar"},"locs":[{"a":140,"b":150}]},{"name":"preferredLanguage","required":false,"transform":{"type":"scalar"},"locs":[{"a":201,"b":218}]},{"name":"signupSourceId","required":false,"transform":{"type":"scalar"},"locs":[{"a":274,"b":288}]},{"name":"otherSignupSource","required":false,"transform":{"type":"scalar"},"locs":[{"a":345,"b":362}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":401,"b":408}]}],"statement":"UPDATE\n    users\nSET\n    deactivated = COALESCE(:deactivated, deactivated),\n    phone = COALESCE(:phone, phone),\n    sms_consent = COALESCE(:smsConsent, sms_consent),\n    preferred_language = COALESCE(:preferredLanguage, preferred_language),\n    signup_source_id = COALESCE(:signupSourceId, signup_source_id),\n    other_signup_source = COALESCE(:otherSignupSource, other_signup_source)\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     deactivated = COALESCE(:deactivated, deactivated),
 *     phone = COALESCE(:phone, phone),
 *     sms_consent = COALESCE(:smsConsent, sms_consent),
 *     preferred_language = COALESCE(:preferredLanguage, preferred_language),
 *     signup_source_id = COALESCE(:signupSourceId, signup_source_id),
 *     other_signup_source = COALESCE(:otherSignupSource, other_signup_source)
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateUserProfileById = new PreparedQuery<IUpdateUserProfileByIdParams,IUpdateUserProfileByIdResult>(updateUserProfileByIdIR);


/** 'UpdateSmsConsentForPhoneNumber' parameters type */
export interface IUpdateSmsConsentForPhoneNumberParams {
  phoneNumber: string;
  smsConsent: boolean;
}

/** 'UpdateSmsConsentForPhoneNumber' return type */
export type IUpdateSmsConsentForPhoneNumberResult = void;

/** 'UpdateSmsConsentForPhoneNumber' query type */
export interface IUpdateSmsConsentForPhoneNumberQuery {
  params: IUpdateSmsConsentForPhoneNumberParams;
  result: IUpdateSmsConsentForPhoneNumberResult;
}

const updateSmsConsentForPhoneNumberIR: any = {"usedParamSet":{"smsConsent":true,"phoneNumber":true},"params":[{"name":"smsConsent","required":true,"transform":{"type":"scalar"},"locs":[{"a":39,"b":50}]},{"name":"phoneNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":94,"b":106}]}],"statement":"UPDATE\n    users\nSET\n    sms_consent = :smsConsent!,\n    updated_at = NOW()\nWHERE\n    phone = :phoneNumber!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     sms_consent = :smsConsent!,
 *     updated_at = NOW()
 * WHERE
 *     phone = :phoneNumber!
 * ```
 */
export const updateSmsConsentForPhoneNumber = new PreparedQuery<IUpdateSmsConsentForPhoneNumberParams,IUpdateSmsConsentForPhoneNumberResult>(updateSmsConsentForPhoneNumberIR);


/** 'DeletePhone' parameters type */
export interface IDeletePhoneParams {
  userId: string;
}

/** 'DeletePhone' return type */
export interface IDeletePhoneResult {
  ok: string;
}

/** 'DeletePhone' query type */
export interface IDeletePhoneQuery {
  params: IDeletePhoneParams;
  result: IDeletePhoneResult;
}

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


/** 'InsertMutedUserSubjectAlerts' parameters type */
export interface IInsertMutedUserSubjectAlertsParams {
  mutedSubjectAlertIdsWithUserId: readonly ({
    userId: string | null | void,
    subjectId: number | null | void
  })[];
}

/** 'InsertMutedUserSubjectAlerts' return type */
export interface IInsertMutedUserSubjectAlertsResult {
  ok: string;
}

/** 'InsertMutedUserSubjectAlerts' query type */
export interface IInsertMutedUserSubjectAlertsQuery {
  params: IInsertMutedUserSubjectAlertsParams;
  result: IInsertMutedUserSubjectAlertsResult;
}

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


/** 'DeleteAllUserSubjectAlerts' parameters type */
export interface IDeleteAllUserSubjectAlertsParams {
  userId?: string | null | void;
}

/** 'DeleteAllUserSubjectAlerts' return type */
export interface IDeleteAllUserSubjectAlertsResult {
  ok: string;
}

/** 'DeleteAllUserSubjectAlerts' query type */
export interface IDeleteAllUserSubjectAlertsQuery {
  params: IDeleteAllUserSubjectAlertsParams;
  result: IDeleteAllUserSubjectAlertsResult;
}

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


/** 'GetUserVerificationInfoById' parameters type */
export interface IGetUserVerificationInfoByIdParams {
  userId: string;
}

/** 'GetUserVerificationInfoById' return type */
export interface IGetUserVerificationInfoByIdResult {
  emailVerified: boolean;
  phoneVerified: boolean;
  verified: boolean;
}

/** 'GetUserVerificationInfoById' query type */
export interface IGetUserVerificationInfoByIdQuery {
  params: IGetUserVerificationInfoByIdParams;
  result: IGetUserVerificationInfoByIdResult;
}

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


/** 'GetReportedUser' parameters type */
export interface IGetReportedUserParams {
  userId: string;
}

/** 'GetReportedUser' return type */
export interface IGetReportedUserResult {
  banType: ban_types | null;
  createdAt: Date;
  email: string;
  firstName: string;
  id: string;
  isDeactivated: boolean;
  isTestUser: boolean;
  isVolunteer: boolean | null;
  lastName: string;
  studentPartnerOrg: string;
  volunteerPartnerOrg: string;
}

/** 'GetReportedUser' query type */
export interface IGetReportedUserQuery {
  params: IGetReportedUserParams;
  result: IGetReportedUserResult;
}

const getReportedUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":917,"b":924}]}],"statement":"SELECT\n    users.id AS id,\n    first_name,\n    last_name,\n    email,\n    users.created_at AS created_at,\n    test_user AS is_test_user,\n    ban_type,\n    deactivated AS is_deactivated,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    student_partner_orgs.key AS student_partner_org,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN student_profiles ON users.id = student_profiles.user_id\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\n    LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id\nWHERE\n    deactivated IS FALSE\n    AND deleted IS FALSE\n    AND test_user IS FALSE\n    AND users.id = :userId!"};

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
 *     AND deleted IS FALSE
 *     AND test_user IS FALSE
 *     AND users.id = :userId!
 * ```
 */
export const getReportedUser = new PreparedQuery<IGetReportedUserParams,IGetReportedUserResult>(getReportedUserIR);


/** 'GetUsersLatestSubjectsByUserId' parameters type */
export interface IGetUsersLatestSubjectsByUserIdParams {
  userId: string;
}

/** 'GetUsersLatestSubjectsByUserId' return type */
export interface IGetUsersLatestSubjectsByUserIdResult {
  subject: string;
}

/** 'GetUsersLatestSubjectsByUserId' query type */
export interface IGetUsersLatestSubjectsByUserIdQuery {
  params: IGetUsersLatestSubjectsByUserIdParams;
  result: IGetUsersLatestSubjectsByUserIdResult;
}

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


/** 'UpdateUserProxyEmail' parameters type */
export interface IUpdateUserProxyEmailParams {
  proxyEmail: string;
  userId: string;
}

/** 'UpdateUserProxyEmail' return type */
export interface IUpdateUserProxyEmailResult {
  ok: string;
}

/** 'UpdateUserProxyEmail' query type */
export interface IUpdateUserProxyEmailQuery {
  params: IUpdateUserProxyEmailParams;
  result: IUpdateUserProxyEmailResult;
}

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


/** 'AdminUpdateUser' parameters type */
export interface IAdminUpdateUserParams {
  ban_reason?: string | null | void;
  banType?: ban_types | null | void;
  email: string;
  firstName?: string | null | void;
  isDeactivated: boolean;
  isVerified: boolean;
  lastName?: string | null | void;
  userId: string;
}

/** 'AdminUpdateUser' return type */
export type IAdminUpdateUserResult = void;

/** 'AdminUpdateUser' query type */
export interface IAdminUpdateUserQuery {
  params: IAdminUpdateUserParams;
  result: IAdminUpdateUserResult;
}

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


/** 'UpdatePreferredLanguageToUser' parameters type */
export interface IUpdatePreferredLanguageToUserParams {
  preferredLanguage: string;
  userId?: string | null | void;
}

/** 'UpdatePreferredLanguageToUser' return type */
export interface IUpdatePreferredLanguageToUserResult {
  ok: string;
}

/** 'UpdatePreferredLanguageToUser' query type */
export interface IUpdatePreferredLanguageToUserQuery {
  params: IUpdatePreferredLanguageToUserParams;
  result: IUpdatePreferredLanguageToUserResult;
}

const updatePreferredLanguageToUserIR: any = {"usedParamSet":{"preferredLanguage":true,"userId":true},"params":[{"name":"preferredLanguage","required":true,"transform":{"type":"scalar"},"locs":[{"a":46,"b":64}]},{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":111,"b":117}]}],"statement":"UPDATE\n    users\nSET\n    preferred_language = :preferredLanguage!,\n    updated_at = NOW()\nWHERE\n    users.id = :userId\nRETURNING\n    id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     preferred_language = :preferredLanguage!,
 *     updated_at = NOW()
 * WHERE
 *     users.id = :userId
 * RETURNING
 *     id AS ok
 * ```
 */
export const updatePreferredLanguageToUser = new PreparedQuery<IUpdatePreferredLanguageToUserParams,IUpdatePreferredLanguageToUserResult>(updatePreferredLanguageToUserIR);


/** 'FlagUserForDeletion' parameters type */
export interface IFlagUserForDeletionParams {
  userId: string;
}

/** 'FlagUserForDeletion' return type */
export type IFlagUserForDeletionResult = void;

/** 'FlagUserForDeletion' query type */
export interface IFlagUserForDeletionQuery {
  params: IFlagUserForDeletionParams;
  result: IFlagUserForDeletionResult;
}

const flagUserForDeletionIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":33,"b":40},{"a":57,"b":64}]}],"statement":"UPDATE\n    users\nSET\n    email = :userId!\nWHERE\n    id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     email = :userId!
 * WHERE
 *     id = :userId!
 * ```
 */
export const flagUserForDeletion = new PreparedQuery<IFlagUserForDeletionParams,IFlagUserForDeletionResult>(flagUserForDeletionIR);


/** 'GetFavoriteVolunteersByUserId' parameters type */
export interface IGetFavoriteVolunteersByUserIdParams {
  userId: string;
}

/** 'GetFavoriteVolunteersByUserId' return type */
export interface IGetFavoriteVolunteersByUserIdResult {
  volunteerId: string;
}

/** 'GetFavoriteVolunteersByUserId' query type */
export interface IGetFavoriteVolunteersByUserIdQuery {
  params: IGetFavoriteVolunteersByUserIdParams;
  result: IGetFavoriteVolunteersByUserIdResult;
}

const getFavoriteVolunteersByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":84,"b":91}]}],"statement":"SELECT\n    volunteer_id\nFROM\n    student_favorite_volunteers\nWHERE\n    student_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_id
 * FROM
 *     student_favorite_volunteers
 * WHERE
 *     student_id = :userId!
 * ```
 */
export const getFavoriteVolunteersByUserId = new PreparedQuery<IGetFavoriteVolunteersByUserIdParams,IGetFavoriteVolunteersByUserIdResult>(getFavoriteVolunteersByUserIdIR);


