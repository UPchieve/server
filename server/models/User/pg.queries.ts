/** Types generated for queries found in "server/models/User/user.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type ban_types = 'complete' | 'shadow';

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

const getUserRolesByIdIR: any = {"name":"getUserRolesById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":217,"b":219,"line":9,"col":16}]}}],"usedParamSet":{"id":true},"statement":{"body":"SELECT\n    user_roles.name\nFROM\n    users\n    LEFT JOIN users_roles ON users_roles.user_id = users.id\n    LEFT JOIN user_roles ON user_roles.id = users_roles.role_id\nWHERE\n    users.id = :id!","loc":{"a":29,"b":219,"line":2,"col":0}}};

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


/** 'CreateUser' parameters type */
export interface ICreateUserParams {
  email: string;
  emailVerified: boolean | null | void;
  firstName: string;
  id: string;
  lastName: string;
  otherSignupSource: string | null | void;
  password: string | null | void;
  passwordResetToken: string | null | void;
  phone: string | null | void;
  phoneVerified: boolean | null | void;
  proxyEmail: string | null | void;
  referralCode: string;
  referredBy: string | null | void;
  signupSourceId: number | null | void;
  verified: boolean | null | void;
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

const createUserIR: any = {"name":"createUser","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":492,"b":494,"line":14,"col":13}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":498,"b":507,"line":14,"col":19}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":511,"b":519,"line":14,"col":32}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":523,"b":528,"line":14,"col":44}]}},{"name":"proxyEmail","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":532,"b":541,"line":14,"col":53}]}},{"name":"phone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":545,"b":549,"line":14,"col":66}]}},{"name":"password","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":553,"b":560,"line":14,"col":74}]}},{"name":"passwordResetToken","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":564,"b":581,"line":14,"col":85}]}},{"name":"verified","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":585,"b":592,"line":14,"col":106}]}},{"name":"emailVerified","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":596,"b":608,"line":14,"col":117}]}},{"name":"phoneVerified","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":612,"b":624,"line":14,"col":133}]}},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":628,"b":637,"line":14,"col":149}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":641,"b":653,"line":14,"col":162}]}},{"name":"signupSourceId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":657,"b":670,"line":14,"col":178}]}},{"name":"otherSignupSource","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":674,"b":690,"line":14,"col":195}]}}],"usedParamSet":{"id":true,"firstName":true,"lastName":true,"email":true,"proxyEmail":true,"phone":true,"password":true,"passwordResetToken":true,"verified":true,"emailVerified":true,"phoneVerified":true,"referredBy":true,"referralCode":true,"signupSourceId":true,"otherSignupSource":true},"statement":{"body":"INSERT INTO users (id, first_name, last_name, email, proxy_email, phone, PASSWORD, password_reset_token, verified, email_verified, phone_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at)\n    VALUES (:id!, :firstName!, :lastName!, :email!, :proxyEmail, :phone, :password, :passwordResetToken, :verified, :emailVerified, :phoneVerified, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW())\nON CONFLICT (email)\n    DO NOTHING\nRETURNING\n    id, email, first_name, proxy_email","loc":{"a":247,"b":782,"line":13,"col":0}}};

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


/** 'UpsertUser' parameters type */
export interface IUpsertUserParams {
  email: string;
  emailVerified: boolean | null | void;
  firstName: string;
  id: string;
  lastName: string;
  otherSignupSource: string | null | void;
  password: string | null | void;
  passwordResetToken: string | null | void;
  phone: string | null | void;
  phoneVerified: boolean | null | void;
  proxyEmail: string | null | void;
  referralCode: string;
  referredBy: string | null | void;
  signupSourceId: number | null | void;
  verified: boolean | null | void;
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

const upsertUserIR: any = {"name":"upsertUser","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1055,"b":1057,"line":23,"col":13}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1061,"b":1070,"line":23,"col":19},{"a":1323,"b":1332,"line":26,"col":22}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1074,"b":1082,"line":23,"col":32},{"a":1348,"b":1356,"line":26,"col":47}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1086,"b":1091,"line":23,"col":44}]}},{"name":"proxyEmail","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1095,"b":1104,"line":23,"col":53},{"a":1374,"b":1383,"line":26,"col":73}]}},{"name":"phone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1108,"b":1112,"line":23,"col":66},{"a":1395,"b":1399,"line":26,"col":94}]}},{"name":"password","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1116,"b":1123,"line":23,"col":74},{"a":1414,"b":1421,"line":26,"col":113}]}},{"name":"passwordResetToken","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1127,"b":1144,"line":23,"col":85},{"a":1448,"b":1465,"line":26,"col":147}]}},{"name":"verified","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1148,"b":1155,"line":23,"col":106},{"a":1480,"b":1487,"line":26,"col":179}]}},{"name":"emailVerified","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1159,"b":1171,"line":23,"col":117},{"a":1508,"b":1520,"line":26,"col":207}]}},{"name":"phoneVerified","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1175,"b":1187,"line":23,"col":133},{"a":1541,"b":1553,"line":26,"col":240}]}},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1191,"b":1200,"line":23,"col":149},{"a":1571,"b":1580,"line":26,"col":270}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1204,"b":1216,"line":23,"col":162},{"a":1600,"b":1612,"line":26,"col":299}]}},{"name":"signupSourceId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1220,"b":1233,"line":23,"col":178},{"a":1635,"b":1648,"line":26,"col":334}]}},{"name":"otherSignupSource","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1237,"b":1253,"line":23,"col":195},{"a":1674,"b":1690,"line":26,"col":373}]}}],"usedParamSet":{"id":true,"firstName":true,"lastName":true,"email":true,"proxyEmail":true,"phone":true,"password":true,"passwordResetToken":true,"verified":true,"emailVerified":true,"phoneVerified":true,"referredBy":true,"referralCode":true,"signupSourceId":true,"otherSignupSource":true},"statement":{"body":"INSERT INTO users (id, first_name, last_name, email, proxy_email, phone, PASSWORD, password_reset_token, verified, email_verified, phone_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at)\n    VALUES (:id!, :firstName!, :lastName!, :email!, :proxyEmail, :phone, :password, :passwordResetToken, :verified, :emailVerified, :phoneVerified, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW())\nON CONFLICT (email)\n    DO UPDATE SET\n        first_name = :firstName!, last_name = :lastName!, proxy_email = :proxyEmail, phone = :phone, PASSWORD = :password, password_reset_token = :passwordResetToken, verified = :verified, email_verified = :emailVerified, phone_verified = :phoneVerified, referred_by = :referredBy, referral_code = :referralCode!, signup_source_id = :signupSourceId, other_signup_source = :otherSignupSource\n    RETURNING\n        id, email, first_name, proxy_email, (xmax = 0) AS is_created","loc":{"a":810,"b":1773,"line":22,"col":0}}};

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

const getUserIdByEmailIR: any = {"name":"getUserIdByEmail","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1855,"b":1860,"line":37,"col":13}]}}],"usedParamSet":{"email":true},"statement":{"body":"SELECT\n    id\nFROM\n    users\nWHERE\n    email = :email!\nLIMIT 1","loc":{"a":1807,"b":1868,"line":32,"col":0}}};

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

const getUserIdByPhoneIR: any = {"name":"getUserIdByPhone","params":[{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1950,"b":1955,"line":47,"col":13}]}}],"usedParamSet":{"phone":true},"statement":{"body":"SELECT\n    id\nFROM\n    users\nWHERE\n    phone = :phone!\nLIMIT 1","loc":{"a":1902,"b":1963,"line":42,"col":0}}};

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
  approved: boolean;
  banned: boolean;
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
  smsConsent: boolean;
  studentPartnerOrg: string;
  volunteerPartnerOrg: string;
}

/** 'GetUserContactInfoById' query type */
export interface IGetUserContactInfoByIdQuery {
  params: IGetUserContactInfoByIdParams;
  result: IGetUserContactInfoByIdResult;
}

const getUserContactInfoByIdIR: any = {"name":"getUserContactInfoById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3077,"b":3079,"line":86,"col":16}]}}],"usedParamSet":{"id":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    email,\n    banned,\n    ban_type,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    student_partner_orgs.key AS student_partner_org,\n    users.last_activity_at,\n    deactivated,\n    volunteer_profiles.approved,\n    users.phone,\n    users.phone_verified,\n    users.sms_consent\nFROM\n    users\n    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\nWHERE\n    users.id = :id!\nLIMIT 1","loc":{"a":2003,"b":3087,"line":52,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     email,
 *     banned,
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
 *     users.sms_consent
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
  approved: boolean;
  banned: boolean;
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
  smsConsent: boolean;
  studentPartnerOrg: string;
  volunteerPartnerOrg: string;
}

/** 'GetUserContactInfoByReferralCode' query type */
export interface IGetUserContactInfoByReferralCodeQuery {
  params: IGetUserContactInfoByReferralCodeParams;
  result: IGetUserContactInfoByReferralCodeResult;
}

const getUserContactInfoByReferralCodeIR: any = {"name":"getUserContactInfoByReferralCode","params":[{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4216,"b":4228,"line":125,"col":21}]}}],"usedParamSet":{"referralCode":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    email,\n    banned,\n    ban_type,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    student_partner_orgs.key AS student_partner_org,\n    users.last_activity_at,\n    deactivated,\n    volunteer_profiles.approved,\n    users.phone,\n    users.phone_verified,\n    users.sms_consent\nFROM\n    users\n    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\nWHERE\n    referral_code = :referralCode!\nLIMIT 1","loc":{"a":3137,"b":4236,"line":91,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     email,
 *     banned,
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
 *     users.sms_consent
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

const getUserReferralLinkIR: any = {"name":"getUserReferralLink","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4356,"b":4358,"line":137,"col":10}]}}],"usedParamSet":{"id":true},"statement":{"body":"SELECT\n    first_name,\n    email,\n    referral_code\nFROM\n    users\nWHERE\n    id = :id!","loc":{"a":4273,"b":4358,"line":130,"col":0}}};

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

const getUserForPassportIR: any = {"name":"getUserForPassport","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4497,"b":4502,"line":149,"col":26}]}}],"usedParamSet":{"email":true},"statement":{"body":"SELECT\n    id,\n    email,\n    proxy_email,\n    PASSWORD\nFROM\n    users\nWHERE\n    LOWER(email) = LOWER(:email!)\nLIMIT 1","loc":{"a":4394,"b":4511,"line":141,"col":0}}};

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


/** 'GetUserContactInfoByResetToken' parameters type */
export interface IGetUserContactInfoByResetTokenParams {
  resetToken: string;
}

/** 'GetUserContactInfoByResetToken' return type */
export interface IGetUserContactInfoByResetTokenResult {
  approved: boolean;
  banned: boolean;
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
  smsConsent: boolean;
  studentPartnerOrg: string;
  volunteerPartnerOrg: string;
}

/** 'GetUserContactInfoByResetToken' query type */
export interface IGetUserContactInfoByResetTokenQuery {
  params: IGetUserContactInfoByResetTokenParams;
  result: IGetUserContactInfoByResetTokenResult;
}

const getUserContactInfoByResetTokenIR: any = {"name":"getUserContactInfoByResetToken","params":[{"name":"resetToken","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5645,"b":5655,"line":188,"col":28}]}}],"usedParamSet":{"resetToken":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    email,\n    banned,\n    ban_type,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    student_partner_orgs.key AS student_partner_org,\n    users.last_activity_at,\n    deactivated,\n    volunteer_profiles.approved,\n    users.phone,\n    users.phone_verified,\n    users.sms_consent\nFROM\n    users\n    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\nWHERE\n    password_reset_token = :resetToken!\nLIMIT 1","loc":{"a":4559,"b":5663,"line":154,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     email,
 *     banned,
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
 *     users.sms_consent
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


/** 'DeleteUser' parameters type */
export interface IDeleteUserParams {
  email: string;
  userId: string;
}

/** 'DeleteUser' return type */
export interface IDeleteUserResult {
  ok: string;
}

/** 'DeleteUser' query type */
export interface IDeleteUserQuery {
  params: IDeleteUserParams;
  result: IDeleteUserResult;
}

const deleteUserIR: any = {"name":"deleteUser","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5725,"b":5730,"line":196,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5772,"b":5778,"line":199,"col":10}]}}],"usedParamSet":{"email":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    email = :email!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":5691,"b":5801,"line":193,"col":0}}};

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

const countUsersReferredByOtherIdIR: any = {"name":"countUsersReferredByOtherId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5920,"b":5926,"line":210,"col":19}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    count(*)::int AS total\nFROM\n    users\nWHERE\n    referred_by = :userId!\n    AND phone_verified IS TRUE\n    OR email_verified IS TRUE","loc":{"a":5846,"b":5987,"line":205,"col":0}}};

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

const updateUserResetTokenByIdIR: any = {"name":"updateUserResetTokenById","params":[{"name":"token","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6078,"b":6083,"line":219,"col":28}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6125,"b":6131,"line":222,"col":10}]}}],"usedParamSet":{"token":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    password_reset_token = :token!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id","loc":{"a":6029,"b":6148,"line":216,"col":0}}};

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

const updateUserPasswordByIdIR: any = {"name":"updateUserPasswordById","params":[{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6225,"b":6233,"line":231,"col":16}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6275,"b":6281,"line":234,"col":10}]}}],"usedParamSet":{"password":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    PASSWORD = :password!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":6188,"b":6304,"line":228,"col":0}}};

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

const insertUserIpByIdIR: any = {"name":"insertUserIpById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6453,"b":6455,"line":242,"col":17}]}},{"name":"ipId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6459,"b":6463,"line":242,"col":23},{"a":6708,"b":6712,"line":257,"col":25}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6467,"b":6473,"line":242,"col":31},{"a":6741,"b":6747,"line":258,"col":27}]}}],"usedParamSet":{"id":true,"ipId":true,"userId":true},"statement":{"body":"WITH ins AS (\nINSERT INTO users_ip_addresses (id, ip_address_id, user_id, created_at, updated_at)\n        VALUES (:id!, :ipId!, :userId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id AS ok\n    FROM\n        users_ip_addresses\n    WHERE\n        ip_address_id = :ipId!\n            AND user_id = :userId!","loc":{"a":6338,"b":6747,"line":240,"col":0}}};

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

const updateUserVerifiedEmailByIdIR: any = {"name":"updateUserVerifiedEmailById","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6826,"b":6831,"line":265,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6921,"b":6927,"line":270,"col":10}]}}],"usedParamSet":{"email":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    email = :email!,\n    email_verified = TRUE,\n    verified = TRUE,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    email AS ok","loc":{"a":6792,"b":6953,"line":262,"col":0}}};

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

const updateUserVerifiedPhoneByIdIR: any = {"name":"updateUserVerifiedPhoneById","params":[{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7032,"b":7037,"line":279,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7127,"b":7133,"line":284,"col":10}]}}],"usedParamSet":{"phone":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    phone = :phone!,\n    phone_verified = TRUE,\n    verified = TRUE,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    phone AS ok","loc":{"a":6998,"b":7159,"line":276,"col":0}}};

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

const updateUserPhoneNumberByUserIdIR: any = {"name":"updateUserPhoneNumberByUserId","params":[{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7240,"b":7245,"line":293,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7287,"b":7293,"line":296,"col":10}]}}],"usedParamSet":{"phone":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    phone = :phone!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":7206,"b":7316,"line":290,"col":0}}};

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

const updateUserLastActivityByIdIR: any = {"name":"updateUserLastActivityById","params":[{"name":"lastActivityAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7405,"b":7419,"line":305,"col":24}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7461,"b":7467,"line":308,"col":10}]}}],"usedParamSet":{"lastActivityAt":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    last_activity_at = :lastActivityAt!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":7360,"b":7490,"line":302,"col":0}}};

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

const updateUserBanByIdIR: any = {"name":"updateUserBanById","params":[{"name":"banType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7592,"b":7599,"line":318,"col":16}]}},{"name":"banReason","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7794,"b":7803,"line":328,"col":16}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7834,"b":7840,"line":330,"col":10}]}}],"usedParamSet":{"banType":true,"banReason":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    banned = subquery.banned,\n    ban_type = :banType!,\n    ban_reason_id = subquery.ban_reason_id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        TRUE AS banned,\n        id AS ban_reason_id\n    FROM\n        ban_reasons\n    WHERE\n        name = :banReason!) AS subquery\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":7525,"b":7863,"line":314,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     banned = subquery.banned,
 *     ban_type = :banType!,
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
  banType: ban_types | null;
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

const getUserForAdminUpdateIR: any = {"name":"getUserForAdminUpdate","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8461,"b":8467,"line":355,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    banned,\n    ban_type,\n    email,\n    deactivated,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    student_partner_orgs.name AS student_partner_org\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\nWHERE\n    users.id = :userId!","loc":{"a":7902,"b":8467,"line":336,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     banned,
 *     ban_type,
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
  lastName: string | null;
}

/** 'GetUsersForAdminSearch' query type */
export interface IGetUsersForAdminSearchQuery {
  params: IGetUsersForAdminSearchParams;
  result: IGetUsersForAdminSearchResult;
}

const getUsersForAdminSearchIR: any = {"name":"getUsersForAdminSearch","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9418,"b":9423,"line":384,"col":9},{"a":9459,"b":9464,"line":385,"col":19}]}},{"name":"email","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9474,"b":9478,"line":386,"col":7},{"a":9529,"b":9533,"line":387,"col":34}]}},{"name":"firstName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9551,"b":9559,"line":388,"col":7},{"a":9615,"b":9623,"line":389,"col":39}]}},{"name":"lastName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9641,"b":9648,"line":390,"col":7},{"a":9703,"b":9710,"line":391,"col":38}]}},{"name":"partnerOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9728,"b":9737,"line":392,"col":7},{"a":9791,"b":9800,"line":393,"col":37},{"a":9837,"b":9846,"line":394,"col":35}]}},{"name":"highSchool","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9856,"b":9865,"line":395,"col":7},{"a":9917,"b":9926,"line":396,"col":35},{"a":9988,"b":9997,"line":397,"col":52}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10016,"b":10021,"line":398,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10038,"b":10044,"line":398,"col":30}]}}],"usedParamSet":{"userId":true,"email":true,"firstName":true,"lastName":true,"partnerOrg":true,"highSchool":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    users.id,\n    users.email,\n    users.first_name,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            users.last_name\n        ELSE\n            NULL\n        END) AS last_name,\n    users.created_at,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN schools ON schools.id = student_profiles.school_id\n    LEFT JOIN school_nces_metadata ON school_nces_metadata.school_id = schools.id\nWHERE ((:userId)::uuid IS NULL\n    OR users.id = :userId)\nAND ((:email)::text IS NULL\n    OR users.email ILIKE ('%' || :email || '%'))\nAND ((:firstName)::text IS NULL\n    OR users.first_name ILIKE ('%' || :firstName || '%'))\nAND ((:lastName)::text IS NULL\n    OR users.last_name ILIKE ('%' || :lastName || '%'))\nAND ((:partnerOrg)::text IS NULL\n    OR volunteer_partner_orgs.key = :partnerOrg\n    OR student_partner_orgs.key = :partnerOrg)\nAND ((:highSchool)::text IS NULL\n    OR schools.name ILIKE ('%' || :highSchool || '%')\n    OR school_nces_metadata.sch_name ILIKE ('%' || :highSchool || '%'))\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":8507,"b":10050,"line":359,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.email,
 *     users.first_name,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
 *             users.last_name
 *         ELSE
 *             NULL
 *         END) AS last_name,
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
 *     OR users.email ILIKE ('%' || :email || '%'))
 * AND ((:firstName)::text IS NULL
 *     OR users.first_name ILIKE ('%' || :firstName || '%'))
 * AND ((:lastName)::text IS NULL
 *     OR users.last_name ILIKE ('%' || :lastName || '%'))
 * AND ((:partnerOrg)::text IS NULL
 *     OR volunteer_partner_orgs.key = :partnerOrg
 *     OR student_partner_orgs.key = :partnerOrg)
 * AND ((:highSchool)::text IS NULL
 *     OR schools.name ILIKE ('%' || :highSchool || '%')
 *     OR school_nces_metadata.sch_name ILIKE ('%' || :highSchool || '%'))
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
  banType: ban_types | null;
  city: string | null;
  college: string | null;
  company: string | null;
  country: string | null;
  createdAt: Date;
  currentGrade: string;
  email: string;
  experience: Json | null;
  firstName: string;
  id: string;
  inGatesStudy: boolean;
  isAdmin: boolean | null;
  isApproved: boolean;
  isBanned: boolean;
  isDeactivated: boolean;
  isOnboarded: boolean;
  isTestUser: boolean;
  isVolunteer: boolean | null;
  languages: stringArray | null;
  lastName: string | null;
  linkedinUrl: string | null;
  numPastSessions: string | null;
  occupation: stringArray | null;
  partnerSite: string;
  photoIdS3Key: string | null;
  photoIdStatus: string;
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

const getUserForAdminDetailIR: any = {"name":"getUserForAdminDetail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12672,"b":12678,"line":468,"col":28},{"a":12709,"b":12715,"line":469,"col":29},{"a":13053,"b":13059,"line":478,"col":23},{"a":13144,"b":13150,"line":482,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name AS first_name,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            users.last_name\n        ELSE\n            NULL\n        END) AS last_name,\n    users.email,\n    users.created_at,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    volunteer_profiles.approved AS is_approved,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    volunteer_profiles.onboarded AS is_onboarded,\n    users.deactivated AS is_deactivated,\n    users.test_user AS is_test_user,\n    student_profiles.postal_code AS zip_code,\n    student_partner_orgs.name AS student_partner_org,\n    volunteer_partner_orgs.name AS volunteer_partner_org,\n    volunteer_profiles.photo_id_s3_key,\n    photo_id_statuses.name AS photo_id_status,\n    volunteer_profiles.country,\n    volunteer_profiles.linkedin_url,\n    volunteer_profiles.college,\n    volunteer_profiles.company,\n    volunteer_profiles.languages,\n    volunteer_profiles.experience,\n    volunteer_profiles.city,\n    volunteer_profiles.state,\n    users.verified,\n    users.banned AS is_banned,\n    users.ban_type AS ban_type,\n    user_product_flags.gates_qualified AS in_gates_study,\n    grade_levels.name AS current_grade,\n    student_partner_org_sites.name AS partner_site,\n    session_count.total AS num_past_sessions,\n    occupations.occupation,\n    json_build_object('nameStored', schools.name, 'SCH_NAME', school_nces_metadata.sch_name) AS approved_high_school\nFROM\n    users\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN student_partner_org_sites ON student_partner_org_sites.id = student_profiles.student_partner_org_site_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id\n    LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    LEFT JOIN user_product_flags ON user_product_flags.user_id = users.id\n    LEFT JOIN grade_levels ON grade_levels.id = student_profiles.grade_level_id\n    LEFT JOIN (\n        SELECT\n            COUNT(*) AS total\n        FROM\n            sessions\n        WHERE\n            volunteer_id = :userId!\n            OR student_id = :userId!) AS session_count ON TRUE\n    LEFT JOIN schools ON schools.id = student_profiles.school_id\n    LEFT JOIN school_nces_metadata ON school_nces_metadata.school_id = schools.id\n    LEFT JOIN (\n        SELECT\n            array_agg(occupation) AS occupation\n        FROM\n            volunteer_occupations\n        WHERE\n            user_id = :userId!\n        GROUP BY\n            user_id) AS occupations ON TRUE\nWHERE\n    users.id = :userId!","loc":{"a":10089,"b":13150,"line":402,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name AS first_name,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
 *             users.last_name
 *         ELSE
 *             NULL
 *         END) AS last_name,
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
 *     users.verified,
 *     users.banned AS is_banned,
 *     users.ban_type AS ban_type,
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
  gradeLevel: string;
  hoursTutored: number | null;
  id: string;
  isAdmin: boolean | null;
  isApproved: boolean;
  isBanned: boolean;
  isDeactivated: boolean;
  isFakeUser: boolean | null;
  isOnboarded: boolean;
  isSchoolPartner: boolean;
  isTestUser: boolean;
  isVolunteer: boolean | null;
  lastActivityAt: Date | null;
  mutedSubjectAlerts: stringArray | null;
  occupation: stringArray | null;
  partnerSite: string;
  pastSessions: stringArray | null;
  phone: string | null;
  phoneVerified: boolean;
  photoIdStatus: string;
  referralCode: string;
  referredBy: string | null;
  roleId: number;
  schoolName: string;
  smsConsent: boolean;
  studentPartnerOrg: string;
  subjects: stringArray | null;
  timezone: string | null;
  totalQuizzesPassed: number | null;
  totalTimeTutored: number | null;
  totalTutoredSessions: number | null;
  totalVolunteerHours: number | null;
  type: string | null;
  verified: boolean;
  volunteerPartnerOrg: string;
}

/** 'GetLegacyUser' query type */
export interface IGetLegacyUserQuery {
  params: IGetLegacyUserParams;
  result: IGetLegacyUserResult;
}

const getLegacyUserIR: any = {"name":"getLegacyUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15728,"b":15734,"line":557,"col":38},{"a":15988,"b":15994,"line":567,"col":23},{"a":18000,"b":18006,"line":601,"col":32},{"a":19536,"b":19542,"line":632,"col":32},{"a":20111,"b":20117,"line":647,"col":26},{"a":20150,"b":20156,"line":648,"col":31},{"a":20321,"b":20327,"line":655,"col":23},{"a":20880,"b":20886,"line":667,"col":50},{"a":20953,"b":20959,"line":669,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name,\n    users.created_at,\n    users.email,\n    users.email_verified,\n    users.verified,\n    users.first_name AS firstname,\n    users.phone,\n    users.phone_verified,\n    users.sms_consent,\n    volunteer_profiles.college,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    users.banned AS is_banned,\n    users.ban_type AS ban_type,\n    ban_reasons.name AS ban_reason,\n    users.test_user AS is_test_user,\n    FALSE AS is_fake_user,\n    users.deactivated AS is_deactivated,\n    users.last_activity_at AS last_activity_at,\n    users.referral_code AS referral_code,\n    users.referred_by AS referred_by,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            'volunteer'\n        ELSE\n            'student'\n        END) AS TYPE,\n    volunteer_profiles.onboarded AS is_onboarded,\n    volunteer_profiles.approved AS is_approved,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    volunteer_profiles.country,\n    volunteer_profiles.timezone,\n    photo_id_statuses.name AS photo_id_status,\n    COALESCE(past_sessions.sessions, '{}') AS past_sessions,\n    round(past_sessions.time_tutored / 3600000::numeric, 2)::float AS hours_tutored,\n    COALESCE(past_sessions.time_tutored::float, 0) AS total_time_tutored,\n    COALESCE(array_length(past_sessions.total_tutored_sessions, 1), 0) AS total_tutored_sessions,\n    array_cat(total_subjects.subjects, computed_subjects.subjects) AS subjects,\n    recent_availability.updated_at AS availability_last_modified_at,\n    occupations.occupations AS occupation,\n    student_partner_org_sites.name AS partner_site,\n    student_partner_orgs.name AS student_partner_org,\n    COALESCE(volunteer_profiles.elapsed_availability, 0) AS elapsed_availability,\n    volunteer_profiles.total_volunteer_hours,\n    schools.name AS school_name,\n    schools.partner AS is_school_partner,\n    grade_levels.name AS grade_level,\n    array_cat(total_subjects.active_subjects, computed_subjects.active_subjects) AS active_subjects,\n    users_quizzes.total::int AS total_quizzes_passed,\n    users_roles.role_id,\n    muted_users_subject_alerts_agg.muted_subject_alerts\nFROM\n    users\n    LEFT JOIN (\n        SELECT\n            updated_at\n        FROM\n            availabilities\n        WHERE\n            availabilities.user_id = :userId!\n        ORDER BY\n            updated_at\n        LIMIT 1) AS recent_availability ON TRUE\n    LEFT JOIN (\n        SELECT\n            array_agg(occupation) AS occupations\n        FROM\n            volunteer_occupations\n        WHERE\n            user_id = :userId!) AS occupations ON TRUE\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN admin_profiles ON users.id = admin_profiles.user_id\n    LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\n    LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id\n    LEFT JOIN ban_reasons ON users.ban_reason_id = ban_reasons.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN student_partner_org_sites ON student_partner_org_sites.id = student_profiles.student_partner_org_site_id\n    LEFT JOIN (\n        SELECT\n            array_agg(subjects_unlocked.subject) AS subjects,\n            array_agg(subjects_unlocked.subject) FILTER (WHERE subjects_unlocked.active_cert IS TRUE) AS active_subjects\n        FROM (\n            SELECT\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_certs.total,\n                certifications.active AS active_cert\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN certifications ON users_certifications.certification_id = certifications.id\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN users ON users.id = users_certifications.user_id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        certification_subject_unlocks\n                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_certs ON subject_certs.name = subjects.name\n                WHERE\n                    users.id = :userId!\n                    AND certifications.active = TRUE\n                GROUP BY\n                    subjects.name,\n                    subject_certs.total,\n                    certifications.active) AS subjects_unlocked) AS total_subjects ON TRUE\n    LEFT JOIN (\n        SELECT\n            array_agg(computed_subjects_unlocked.subject) AS subjects,\n            array_agg(computed_subjects_unlocked.subject) FILTER (WHERE computed_subjects_unlocked.active_cert IS TRUE) AS active_subjects\n        FROM (\n            SELECT\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_certs.total,\n                certifications.active AS active_cert\n            FROM\n                users_certifications\n                JOIN computed_subject_unlocks USING (certification_id)\n                JOIN certifications ON users_certifications.certification_id = certifications.id\n                JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id\n                JOIN users ON users.id = users_certifications.user_id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        computed_subject_unlocks\n                        JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_certs ON subject_certs.name = subjects.name\n                WHERE\n                    users.id = :userId!\n                GROUP BY\n                    subjects.name,\n                    subject_certs.total,\n                    certifications.active\n                HAVING\n                    COUNT(*)::int >= subject_certs.total) AS computed_subjects_unlocked) AS computed_subjects ON TRUE\n    LEFT JOIN (\n        SELECT\n            array_agg(id) AS sessions,\n            sum(time_tutored)::bigint AS time_tutored,\n            array_agg(id) FILTER (WHERE time_tutored > 0) AS total_tutored_sessions\n        FROM\n            sessions\n        WHERE\n            student_id = :userId!\n            OR volunteer_id = :userId!) AS past_sessions ON TRUE\n    LEFT JOIN (\n        SELECT\n            count(*) AS total\n        FROM\n            users_quizzes\n        WHERE\n            user_id = :userId!\n            AND passed IS TRUE) AS users_quizzes ON TRUE\n    LEFT JOIN schools ON student_profiles.school_id = schools.id\n    LEFT JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id\n    LEFT JOIN users_roles ON users_roles.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            array_agg(subjects.name) AS muted_subject_alerts\n        FROM\n            muted_users_subject_alerts\n            JOIN subjects ON muted_users_subject_alerts.subject_id = subjects.id\n        WHERE\n            muted_users_subject_alerts.user_id = :userId!) AS muted_users_subject_alerts_agg ON TRUE\nWHERE\n    users.id = :userId!","loc":{"a":13181,"b":20959,"line":486,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name,
 *     users.created_at,
 *     users.email,
 *     users.email_verified,
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
 *     users.banned AS is_banned,
 *     users.ban_type AS ban_type,
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
 *     schools.partner AS is_school_partner,
 *     grade_levels.name AS grade_level,
 *     array_cat(total_subjects.active_subjects, computed_subjects.active_subjects) AS active_subjects,
 *     users_quizzes.total::int AS total_quizzes_passed,
 *     users_roles.role_id,
 *     muted_users_subject_alerts_agg.muted_subject_alerts
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
 *             array_agg(subjects_unlocked.subject) AS subjects,
 *             array_agg(subjects_unlocked.subject) FILTER (WHERE subjects_unlocked.active_cert IS TRUE) AS active_subjects
 *         FROM (
 *             SELECT
 *                 subjects.name AS subject,
 *                 COUNT(*)::int AS earned_certs,
 *                 subject_certs.total,
 *                 certifications.active AS active_cert
 *             FROM
 *                 users_certifications
 *                 JOIN certification_subject_unlocks USING (certification_id)
 *                 JOIN certifications ON users_certifications.certification_id = certifications.id
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
 *                     AND certifications.active = TRUE
 *                 GROUP BY
 *                     subjects.name,
 *                     subject_certs.total,
 *                     certifications.active) AS subjects_unlocked) AS total_subjects ON TRUE
 *     LEFT JOIN (
 *         SELECT
 *             array_agg(computed_subjects_unlocked.subject) AS subjects,
 *             array_agg(computed_subjects_unlocked.subject) FILTER (WHERE computed_subjects_unlocked.active_cert IS TRUE) AS active_subjects
 *         FROM (
 *             SELECT
 *                 subjects.name AS subject,
 *                 COUNT(*)::int AS earned_certs,
 *                 subject_certs.total,
 *                 certifications.active AS active_cert
 *             FROM
 *                 users_certifications
 *                 JOIN computed_subject_unlocks USING (certification_id)
 *                 JOIN certifications ON users_certifications.certification_id = certifications.id
 *                 JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id
 *                 JOIN users ON users.id = users_certifications.user_id
 *                 JOIN (
 *                     SELECT
 *                         subjects.name, COUNT(*)::int AS total
 *                     FROM
 *                         computed_subject_unlocks
 *                         JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id
 *                     GROUP BY
 *                         subjects.name) AS subject_certs ON subject_certs.name = subjects.name
 *                 WHERE
 *                     users.id = :userId!
 *                 GROUP BY
 *                     subjects.name,
 *                     subject_certs.total,
 *                     certifications.active
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
 *     LEFT JOIN users_roles ON users_roles.user_id = users.id
 *     LEFT JOIN (
 *         SELECT
 *             array_agg(subjects.name) AS muted_subject_alerts
 *         FROM
 *             muted_users_subject_alerts
 *             JOIN subjects ON muted_users_subject_alerts.subject_id = subjects.id
 *         WHERE
 *             muted_users_subject_alerts.user_id = :userId!) AS muted_users_subject_alerts_agg ON TRUE
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
  banType: ban_types | null;
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
  phoneVerified: boolean;
  smsConsent: boolean;
  studentGradeLevel: string;
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

const getUserToCreateSendGridContactIR: any = {"name":"getUserToCreateSendGridContact","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22844,"b":22850,"line":727,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    email,\n    sms_consent,\n    phone_verified,\n    banned,\n    ban_type,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    (\n        CASE WHEN admin_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_admin,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    volunteer_partner_orgs.name AS volunteer_partner_org_display,\n    student_partner_orgs.key AS student_partner_org,\n    student_partner_orgs.name AS student_partner_org_display,\n    users.last_activity_at,\n    users.created_at,\n    users.deactivated,\n    (\n        CASE WHEN user_upchieve101.id IS NULL THEN\n            FALSE\n        ELSE\n            TRUE\n        END) AS passed_upchieve101,\n    users.test_user,\n    users.last_name,\n    grade_levels.name AS student_grade_level\nFROM\n    users\n    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\n    LEFT JOIN LATERAL (\n        SELECT\n            id\n        FROM\n            users_training_courses\n            LEFT JOIN training_courses ON training_courses.id = users_training_courses.training_course_id\n        WHERE\n            users_training_courses.user_id = users.id\n            AND training_courses.name = 'UPchieve 101') AS user_upchieve101 ON TRUE\n    LEFT JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id\nWHERE\n    users.id = :userId!\nLIMIT 1","loc":{"a":21007,"b":22858,"line":673,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     email,
 *     sms_consent,
 *     phone_verified,
 *     banned,
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
 *     grade_levels.name AS student_grade_level
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
 * WHERE
 *     users.id = :userId!
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
  subTopic: string;
  totalMessages: number | null;
  type: string;
  volunteer: string | null;
  volunteerJoinedAt: Date | null;
}

/** 'GetPastSessionsForAdminDetail' query type */
export interface IGetPastSessionsForAdminDetailQuery {
  params: IGetPastSessionsForAdminDetailParams;
  result: IGetPastSessionsForAdminDetailResult;
}

const getPastSessionsForAdminDetailIR: any = {"name":"getPastSessionsForAdminDetail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23536,"b":23542,"line":754,"col":29},{"a":23574,"b":23580,"line":755,"col":30}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23628,"b":23633,"line":758,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23650,"b":23656,"line":758,"col":30}]}}],"usedParamSet":{"userId":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    sessions.id,\n    messages.total AS total_messages,\n    sessions.volunteer_id AS volunteer,\n    sessions.student_id AS student,\n    sessions.volunteer_joined_at,\n    sessions.created_at,\n    sessions.ended_at\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            session_messages\n        WHERE\n            session_id = sessions.id) AS messages ON TRUE\nWHERE\n    sessions.volunteer_id = :userId!\n    OR sessions.student_id = :userId!\nORDER BY\n    sessions.created_at DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":22905,"b":23662,"line":732,"col":0}}};

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

const getLegacyCertificationsIR: any = {"name":"getLegacyCertifications","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    name\nFROM\n    quizzes","loc":{"a":23703,"b":23734,"line":762,"col":0}}};

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

const getTotalSessionsByUserIdIR: any = {"name":"getTotalSessionsByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23861,"b":23867,"line":774,"col":27},{"a":23901,"b":23907,"line":775,"col":32}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    count(*)::int AS total\nFROM\n    sessions\nWHERE\n    sessions.student_id = :userId!\n    OR sessions.volunteer_id = :userId!","loc":{"a":23776,"b":23907,"line":769,"col":0}}};

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

const insertUserRoleByUserIdIR: any = {"name":"insertUserRoleByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24043,"b":24049,"line":782,"col":5}]}},{"name":"roleName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24167,"b":24175,"line":791,"col":27}]}}],"usedParamSet":{"userId":true,"roleName":true},"statement":{"body":"INSERT INTO users_roles (role_id, user_id, created_at, updated_at)\nSELECT\n    subquery.id,\n    :userId!,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        user_roles\n    WHERE\n        user_roles.name = :roleName!) AS subquery\nON CONFLICT\n    DO NOTHING\nRETURNING\n    user_id AS ok","loc":{"a":23947,"b":24243,"line":779,"col":0}}};

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
  deactivated: boolean | null | void;
  phone: string | null | void;
  smsConsent: boolean | null | void;
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

const updateUserProfileByIdIR: any = {"name":"updateUserProfileById","params":[{"name":"deactivated","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24331,"b":24341,"line":802,"col":28}]}},{"name":"phone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24380,"b":24384,"line":803,"col":22}]}},{"name":"smsConsent","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24423,"b":24432,"line":804,"col":28}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24464,"b":24470,"line":806,"col":10}]}}],"usedParamSet":{"deactivated":true,"phone":true,"smsConsent":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    deactivated = COALESCE(:deactivated, deactivated),\n    phone = COALESCE(:phone, phone),\n    sms_consent = COALESCE(:smsConsent, sms_consent)\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":24282,"b":24493,"line":799,"col":0}}};

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

const deletePhoneIR: any = {"name":"deletePhone","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24629,"b":24635,"line":819,"col":10}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    phone = NULL,\n    sms_consent = FALSE,\n    phone_verified = FALSE\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":24522,"b":24658,"line":812,"col":0}}};

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

const insertMutedUserSubjectAlertsIR: any = {"name":"insertMutedUserSubjectAlerts","params":[{"name":"mutedSubjectAlertIdsWithUserId","codeRefs":{"defined":{"a":24710,"b":24739,"line":826,"col":8},"used":[{"a":24854,"b":24883,"line":830,"col":9}]},"transform":{"type":"pick_array_spread","keys":[{"name":"userId","required":false},{"name":"subjectId","required":false}]},"required":false}],"usedParamSet":{"mutedSubjectAlertIdsWithUserId":true},"statement":{"body":"INSERT INTO muted_users_subject_alerts (user_id, subject_id)\n    VALUES\n        :mutedSubjectAlertIdsWithUserId\n    ON CONFLICT (user_id, subject_id)\n        DO NOTHING\n    RETURNING\n        user_id AS ok","loc":{"a":24773,"b":24976,"line":828,"col":0}}};

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


/** 'DeleteUnmutedUserSubjectAlerts' parameters type */
export interface IDeleteUnmutedUserSubjectAlertsParams {
  mutedSubjectAlertIds: readonly (number | null | void)[];
  userId: string | null | void;
}

/** 'DeleteUnmutedUserSubjectAlerts' return type */
export interface IDeleteUnmutedUserSubjectAlertsResult {
  ok: string;
}

/** 'DeleteUnmutedUserSubjectAlerts' query type */
export interface IDeleteUnmutedUserSubjectAlertsQuery {
  params: IDeleteUnmutedUserSubjectAlertsParams;
  result: IDeleteUnmutedUserSubjectAlertsResult;
}

const deleteUnmutedUserSubjectAlertsIR: any = {"name":"deleteUnmutedUserSubjectAlerts","params":[{"name":"mutedSubjectAlertIds","codeRefs":{"defined":{"a":25030,"b":25049,"line":839,"col":8},"used":[{"a":25154,"b":25173,"line":843,"col":27}]},"transform":{"type":"array_spread"},"required":false},{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25120,"b":25125,"line":842,"col":17}]}}],"usedParamSet":{"userId":true,"mutedSubjectAlertIds":true},"statement":{"body":"DELETE FROM muted_users_subject_alerts\nWHERE user_id = :userId\n    AND subject_id NOT IN :mutedSubjectAlertIds\nRETURNING\n    user_id AS ok","loc":{"a":25064,"b":25201,"line":841,"col":0}}};

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


/** 'DeleteAllUserSubjectAlerts' parameters type */
export interface IDeleteAllUserSubjectAlertsParams {
  userId: string | null | void;
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

const deleteAllUserSubjectAlertsIR: any = {"name":"deleteAllUserSubjectAlerts","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25303,"b":25308,"line":852,"col":17}]}}],"usedParamSet":{"userId":true},"statement":{"body":"DELETE FROM muted_users_subject_alerts\nWHERE user_id = :userId\nRETURNING\n    user_id AS ok","loc":{"a":25247,"b":25336,"line":851,"col":0}}};

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

const getUserVerificationInfoByIdIR: any = {"name":"getUserVerificationInfoById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25472,"b":25478,"line":865,"col":10}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    verified,\n    email_verified,\n    phone_verified\nFROM\n    users\nWHERE\n    id = :userId!","loc":{"a":25381,"b":25478,"line":858,"col":0}}};

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
  isBanned: boolean;
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

const getReportedUserIR: any = {"name":"getReportedUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26429,"b":26435,"line":896,"col":20}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id AS id,\n    first_name,\n    last_name,\n    email,\n    users.created_at AS created_at,\n    test_user AS is_test_user,\n    banned AS is_banned,\n    ban_type,\n    deactivated AS is_deactivated,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    student_partner_orgs.key AS student_partner_org,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN student_profiles ON users.id = student_profiles.user_id\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\n    LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id\nWHERE\n    deactivated IS FALSE\n    AND test_user IS FALSE\n    AND users.id = :userId!","loc":{"a":25511,"b":26435,"line":869,"col":0}}};

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
 *     banned AS is_banned,
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


