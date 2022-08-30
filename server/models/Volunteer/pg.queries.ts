/** Types generated for queries found in "server/models/Volunteer/volunteer.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type stringArray = (string)[];

/** 'GetVolunteerContactInfoById' parameters type */
export interface IGetVolunteerContactInfoByIdParams {
  userId: string;
}

/** 'GetVolunteerContactInfoById' return type */
export interface IGetVolunteerContactInfoByIdResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetVolunteerContactInfoById' query type */
export interface IGetVolunteerContactInfoByIdQuery {
  params: IGetVolunteerContactInfoByIdParams;
  result: IGetVolunteerContactInfoByIdResult;
}

const getVolunteerContactInfoByIdIR: any = {"name":"getVolunteerContactInfoById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":393,"b":399,"line":14,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.id = :userId!\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE","loc":{"a":40,"b":497,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     users.id = :userId!
 *     AND users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 * ```
 */
export const getVolunteerContactInfoById = new PreparedQuery<IGetVolunteerContactInfoByIdParams,IGetVolunteerContactInfoByIdResult>(getVolunteerContactInfoByIdIR);


/** 'GetVolunteerContactInfoByIds' parameters type */
export interface IGetVolunteerContactInfoByIdsParams {
  userIds: stringArray;
}

/** 'GetVolunteerContactInfoByIds' return type */
export interface IGetVolunteerContactInfoByIdsResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetVolunteerContactInfoByIds' query type */
export interface IGetVolunteerContactInfoByIdsQuery {
  params: IGetVolunteerContactInfoByIdsParams;
  result: IGetVolunteerContactInfoByIdsResult;
}

const getVolunteerContactInfoByIdsIR: any = {"name":"getVolunteerContactInfoByIds","params":[{"name":"userIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":901,"b":908,"line":33,"col":21}]}}],"usedParamSet":{"userIds":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.id = ANY (:userIds!)\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE                                                                                                                                                            ","loc":{"a":543,"b":1007,"line":21,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     users.id = ANY (:userIds!)
 *     AND users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE                                                                                                                                                            
 * ```
 */
export const getVolunteerContactInfoByIds = new PreparedQuery<IGetVolunteerContactInfoByIdsParams,IGetVolunteerContactInfoByIdsResult>(getVolunteerContactInfoByIdsIR);


/** 'GetVolunteersForBlackoutOver' parameters type */
export interface IGetVolunteersForBlackoutOverParams {
  startDate: Date;
}

/** 'GetVolunteersForBlackoutOver' return type */
export interface IGetVolunteersForBlackoutOverResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetVolunteersForBlackoutOver' query type */
export interface IGetVolunteersForBlackoutOverQuery {
  params: IGetVolunteersForBlackoutOverParams;
  result: IGetVolunteersForBlackoutOverResult;
}

const getVolunteersForBlackoutOverIR: any = {"name":"getVolunteersForBlackoutOver","params":[{"name":"startDate","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1572,"b":1581,"line":54,"col":30}]}}],"usedParamSet":{"startDate":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.last_activity_at < :startDate!\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.volunteer_partner_org_id IS NULL","loc":{"a":1210,"b":1784,"line":42,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     users.last_activity_at < :startDate!
 *     AND users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND volunteer_profiles.onboarded IS TRUE
 *     AND volunteer_profiles.volunteer_partner_org_id IS NULL
 * ```
 */
export const getVolunteersForBlackoutOver = new PreparedQuery<IGetVolunteersForBlackoutOverParams,IGetVolunteersForBlackoutOverResult>(getVolunteersForBlackoutOverIR);


/** 'GetVolunteerForQuickTips' parameters type */
export interface IGetVolunteerForQuickTipsParams {
  mongoUserId: string | null | void;
  userId: string | null | void;
}

/** 'GetVolunteerForQuickTips' return type */
export interface IGetVolunteerForQuickTipsResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetVolunteerForQuickTips' query type */
export interface IGetVolunteerForQuickTipsQuery {
  params: IGetVolunteerForQuickTipsParams;
  result: IGetVolunteerForQuickTipsResult;
}

const getVolunteerForQuickTipsIR: any = {"name":"getVolunteerForQuickTips","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2176,"b":2181,"line":74,"col":25}]}},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2214,"b":2224,"line":75,"col":31}]}}],"usedParamSet":{"userId":true,"mongoUserId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE (users.id::uuid = :userId\n    OR users.mongo_id::text = :mongoUserId)\nAND volunteer_profiles.onboarded IS TRUE\nAND users.banned IS FALSE\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE","loc":{"a":1825,"b":2352,"line":63,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE (users.id::uuid = :userId
 *     OR users.mongo_id::text = :mongoUserId)
 * AND volunteer_profiles.onboarded IS TRUE
 * AND users.banned IS FALSE
 * AND users.deactivated IS FALSE
 * AND users.test_user IS FALSE
 * ```
 */
export const getVolunteerForQuickTips = new PreparedQuery<IGetVolunteerForQuickTipsParams,IGetVolunteerForQuickTipsResult>(getVolunteerForQuickTipsIR);


/** 'GetPartnerVolunteerForLowHours' parameters type */
export interface IGetPartnerVolunteerForLowHoursParams {
  mongoUserId: string | null | void;
  userId: string | null | void;
}

/** 'GetPartnerVolunteerForLowHours' return type */
export interface IGetPartnerVolunteerForLowHoursResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetPartnerVolunteerForLowHours' query type */
export interface IGetPartnerVolunteerForLowHoursQuery {
  params: IGetPartnerVolunteerForLowHoursParams;
  result: IGetPartnerVolunteerForLowHoursResult;
}

const getPartnerVolunteerForLowHoursIR: any = {"name":"getPartnerVolunteerForLowHours","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2877,"b":2882,"line":100,"col":37},{"a":2936,"b":2941,"line":101,"col":25}]}},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2974,"b":2984,"line":102,"col":31}]}}],"usedParamSet":{"userId":true,"mongoUserId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = :userId) AS total_sessions ON TRUE\nWHERE (users.id::uuid = :userId\n    OR users.mongo_id::text = :mongoUserId)\nAND volunteer_profiles.onboarded IS TRUE\nAND volunteer_profiles.volunteer_partner_org_id IS NOT NULL\nAND users.banned IS FALSE\nAND users.deactivated IS FALSE\nAND total_sessions.total > 0\nAND users.test_user IS FALSE","loc":{"a":2400,"b":3201,"line":83,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN (
 *         SELECT
 *             COUNT(*)::int AS total
 *         FROM
 *             sessions
 *         WHERE
 *             sessions.volunteer_id = :userId) AS total_sessions ON TRUE
 * WHERE (users.id::uuid = :userId
 *     OR users.mongo_id::text = :mongoUserId)
 * AND volunteer_profiles.onboarded IS TRUE
 * AND volunteer_profiles.volunteer_partner_org_id IS NOT NULL
 * AND users.banned IS FALSE
 * AND users.deactivated IS FALSE
 * AND total_sessions.total > 0
 * AND users.test_user IS FALSE
 * ```
 */
export const getPartnerVolunteerForLowHours = new PreparedQuery<IGetPartnerVolunteerForLowHoursParams,IGetPartnerVolunteerForLowHoursResult>(getPartnerVolunteerForLowHoursIR);


/** 'GetVolunteersForWeeklyHourSummary' parameters type */
export type IGetVolunteersForWeeklyHourSummaryParams = void;

/** 'GetVolunteersForWeeklyHourSummary' return type */
export interface IGetVolunteersForWeeklyHourSummaryResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  sentHourSummaryIntroEmail: boolean;
  volunteerPartnerOrg: string;
}

/** 'GetVolunteersForWeeklyHourSummary' query type */
export interface IGetVolunteersForWeeklyHourSummaryQuery {
  params: IGetVolunteersForWeeklyHourSummaryParams;
  result: IGetVolunteersForWeeklyHourSummaryResult;
}

const getVolunteersForWeeklyHourSummaryIR: any = {"name":"getVolunteersForWeeklyHourSummary","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    sent_hour_summary_intro_email\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id\nWHERE (volunteer_partner_orgs.id IS NULL\n    OR volunteer_partner_orgs.receive_weekly_hour_summary_email IS TRUE)\nAND users.banned IS FALSE\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE\nGROUP BY\n    users.id,\n    volunteer_partner_org,\n    sent_hour_summary_intro_email","loc":{"a":3252,"b":3969,"line":112,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     sent_hour_summary_intro_email
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id
 * WHERE (volunteer_partner_orgs.id IS NULL
 *     OR volunteer_partner_orgs.receive_weekly_hour_summary_email IS TRUE)
 * AND users.banned IS FALSE
 * AND users.deactivated IS FALSE
 * AND users.test_user IS FALSE
 * GROUP BY
 *     users.id,
 *     volunteer_partner_org,
 *     sent_hour_summary_intro_email
 * ```
 */
export const getVolunteersForWeeklyHourSummary = new PreparedQuery<IGetVolunteersForWeeklyHourSummaryParams,IGetVolunteersForWeeklyHourSummaryResult>(getVolunteersForWeeklyHourSummaryIR);


/** 'UpdateVolunteerHourSummaryIntroById' parameters type */
export interface IUpdateVolunteerHourSummaryIntroByIdParams {
  userId: string;
}

/** 'UpdateVolunteerHourSummaryIntroById' return type */
export interface IUpdateVolunteerHourSummaryIntroByIdResult {
  ok: string;
}

/** 'UpdateVolunteerHourSummaryIntroById' query type */
export interface IUpdateVolunteerHourSummaryIntroByIdQuery {
  params: IUpdateVolunteerHourSummaryIntroByIdParams;
  result: IUpdateVolunteerHourSummaryIntroByIdResult;
}

const updateVolunteerHourSummaryIntroByIdIR: any = {"name":"updateVolunteerHourSummaryIntroById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4142,"b":4148,"line":143,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_hour_summary_intro_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":4022,"b":4176,"line":137,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_hour_summary_intro_email = TRUE,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateVolunteerHourSummaryIntroById = new PreparedQuery<IUpdateVolunteerHourSummaryIntroByIdParams,IUpdateVolunteerHourSummaryIntroByIdResult>(updateVolunteerHourSummaryIntroByIdIR);


/** 'UpdateVolunteerThroughAvailability' parameters type */
export interface IUpdateVolunteerThroughAvailabilityParams {
  onboarded: boolean | null | void;
  timezone: string | null | void;
  userId: string;
}

/** 'UpdateVolunteerThroughAvailability' return type */
export interface IUpdateVolunteerThroughAvailabilityResult {
  ok: string;
}

/** 'UpdateVolunteerThroughAvailability' query type */
export interface IUpdateVolunteerThroughAvailabilityQuery {
  params: IUpdateVolunteerThroughAvailabilityParams;
  result: IUpdateVolunteerThroughAvailabilityResult;
}

const updateVolunteerThroughAvailabilityIR: any = {"name":"updateVolunteerThroughAvailability","params":[{"name":"timezone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4287,"b":4294,"line":152,"col":25}]}},{"name":"onboarded","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4334,"b":4342,"line":153,"col":26}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4401,"b":4407,"line":156,"col":15}]}}],"usedParamSet":{"timezone":true,"onboarded":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    timezone = COALESCE(:timezone, timezone),\n    onboarded = COALESCE(:onboarded, onboarded),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":4228,"b":4435,"line":149,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     timezone = COALESCE(:timezone, timezone),
 *     onboarded = COALESCE(:onboarded, onboarded),
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateVolunteerThroughAvailability = new PreparedQuery<IUpdateVolunteerThroughAvailabilityParams,IUpdateVolunteerThroughAvailabilityResult>(updateVolunteerThroughAvailabilityIR);


/** 'GetVolunteerIdsForElapsedAvailability' parameters type */
export type IGetVolunteerIdsForElapsedAvailabilityParams = void;

/** 'GetVolunteerIdsForElapsedAvailability' return type */
export interface IGetVolunteerIdsForElapsedAvailabilityResult {
  userId: string;
}

/** 'GetVolunteerIdsForElapsedAvailability' query type */
export interface IGetVolunteerIdsForElapsedAvailabilityQuery {
  params: IGetVolunteerIdsForElapsedAvailabilityParams;
  result: IGetVolunteerIdsForElapsedAvailabilityResult;
}

const getVolunteerIdsForElapsedAvailabilityIR: any = {"name":"getVolunteerIdsForElapsedAvailability","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    user_id\nFROM\n    volunteer_profiles\n    JOIN users ON volunteer_profiles.user_id = users.id\nWHERE\n    users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE","loc":{"a":4490,"b":4750,"line":162,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id
 * FROM
 *     volunteer_profiles
 *     JOIN users ON volunteer_profiles.user_id = users.id
 * WHERE
 *     users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND volunteer_profiles.onboarded IS TRUE
 *     AND volunteer_profiles.approved IS TRUE
 * ```
 */
export const getVolunteerIdsForElapsedAvailability = new PreparedQuery<IGetVolunteerIdsForElapsedAvailabilityParams,IGetVolunteerIdsForElapsedAvailabilityResult>(getVolunteerIdsForElapsedAvailabilityIR);


/** 'GetVolunteersForTotalHours' parameters type */
export interface IGetVolunteersForTotalHoursParams {
  targetPartnerOrgs: stringArray;
}

/** 'GetVolunteersForTotalHours' return type */
export interface IGetVolunteersForTotalHoursResult {
  id: string;
}

/** 'GetVolunteersForTotalHours' query type */
export interface IGetVolunteersForTotalHoursQuery {
  params: IGetVolunteersForTotalHoursParams;
  result: IGetVolunteersForTotalHoursResult;
}

const getVolunteersForTotalHoursIR: any = {"name":"getVolunteersForTotalHours","params":[{"name":"targetPartnerOrgs","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5129,"b":5146,"line":183,"col":39}]}}],"usedParamSet":{"targetPartnerOrgs":true},"statement":{"body":"SELECT\n    users.id\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id\nWHERE\n    volunteer_partner_orgs.key = ANY (:targetPartnerOrgs!)\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\nGROUP BY\n    users.id","loc":{"a":4794,"b":5356,"line":175,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id
 * WHERE
 *     volunteer_partner_orgs.key = ANY (:targetPartnerOrgs!)
 *     AND volunteer_profiles.onboarded IS TRUE
 *     AND volunteer_profiles.approved IS TRUE
 *     AND users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 * GROUP BY
 *     users.id
 * ```
 */
export const getVolunteersForTotalHours = new PreparedQuery<IGetVolunteersForTotalHoursParams,IGetVolunteersForTotalHoursResult>(getVolunteersForTotalHoursIR);


/** 'GetVolunteerForOnboardingById' parameters type */
export interface IGetVolunteerForOnboardingByIdParams {
  mongoUserId: string | null | void;
  userId: string | null | void;
}

/** 'GetVolunteerForOnboardingById' return type */
export interface IGetVolunteerForOnboardingByIdResult {
  availabilityLastModifiedAt: Date | null;
  country: string | null;
  email: string;
  firstName: string;
  id: string;
  onboarded: boolean;
  subjects: stringArray | null;
}

/** 'GetVolunteerForOnboardingById' query type */
export interface IGetVolunteerForOnboardingByIdQuery {
  params: IGetVolunteerForOnboardingByIdParams;
  result: IGetVolunteerForOnboardingByIdResult;
}

const getVolunteerForOnboardingByIdIR: any = {"name":"getVolunteerForOnboardingById","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6442,"b":6447,"line":226,"col":30},{"a":6946,"b":6951,"line":239,"col":27}]}},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6488,"b":6498,"line":227,"col":39},{"a":6988,"b":6998,"line":240,"col":35}]}}],"usedParamSet":{"userId":true,"mongoUserId":true},"statement":{"body":"WITH CTE AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n)\nSELECT\n    users.id,\n    email,\n    first_name,\n    volunteer_profiles.onboarded,\n    COALESCE(array_agg(subjects_unlocked.subject) FILTER (WHERE subjects_unlocked.subject IS NOT NULL), '{}') AS subjects,\n    country,\n    MAX(availabilities.updated_at) AS availability_last_modified_at\nFROM\n    users\n    LEFT JOIN (\n        SELECT\n            subjects.name AS subject,\n            COUNT(*)::int AS earned_certs,\n            CTE.total\n        FROM\n            users_certifications\n            JOIN certification_subject_unlocks USING (certification_id)\n            JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n            JOIN users ON users.id = users_certifications.user_id\n            JOIN CTE ON CTE.name = subjects.name\n        WHERE\n            users.id::uuid = :userId\n            OR users.mongo_id::text = :mongoUserId\n        GROUP BY\n            subjects.name, CTE.total\n        HAVING\n            COUNT(*)::int >= CTE.total) AS subjects_unlocked ON TRUE\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN availabilities ON availabilities.user_id = users.id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS FALSE\n    AND (users.id::uuid = :userId\n        OR users.mongo_id::text = :mongoUserId)\nGROUP BY\n    users.id,\n    onboarded,\n    country","loc":{"a":5403,"b":7049,"line":194,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH CTE AS (
 *     SELECT
 *         subjects.name,
 *         COUNT(*)::int AS total
 *     FROM
 *         certification_subject_unlocks
 *         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *     GROUP BY
 *         subjects.name
 * )
 * SELECT
 *     users.id,
 *     email,
 *     first_name,
 *     volunteer_profiles.onboarded,
 *     COALESCE(array_agg(subjects_unlocked.subject) FILTER (WHERE subjects_unlocked.subject IS NOT NULL), '{}') AS subjects,
 *     country,
 *     MAX(availabilities.updated_at) AS availability_last_modified_at
 * FROM
 *     users
 *     LEFT JOIN (
 *         SELECT
 *             subjects.name AS subject,
 *             COUNT(*)::int AS earned_certs,
 *             CTE.total
 *         FROM
 *             users_certifications
 *             JOIN certification_subject_unlocks USING (certification_id)
 *             JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *             JOIN users ON users.id = users_certifications.user_id
 *             JOIN CTE ON CTE.name = subjects.name
 *         WHERE
 *             users.id::uuid = :userId
 *             OR users.mongo_id::text = :mongoUserId
 *         GROUP BY
 *             subjects.name, CTE.total
 *         HAVING
 *             COUNT(*)::int >= CTE.total) AS subjects_unlocked ON TRUE
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN availabilities ON availabilities.user_id = users.id
 * WHERE
 *     users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND volunteer_profiles.onboarded IS FALSE
 *     AND (users.id::uuid = :userId
 *         OR users.mongo_id::text = :mongoUserId)
 * GROUP BY
 *     users.id,
 *     onboarded,
 *     country
 * ```
 */
export const getVolunteerForOnboardingById = new PreparedQuery<IGetVolunteerForOnboardingByIdParams,IGetVolunteerForOnboardingByIdResult>(getVolunteerForOnboardingByIdIR);


/** 'GetVolunteersForTelecomReport' parameters type */
export interface IGetVolunteersForTelecomReportParams {
  partnerOrg: string;
}

/** 'GetVolunteersForTelecomReport' return type */
export interface IGetVolunteersForTelecomReportResult {
  createdAt: Date;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  volunteerPartnerOrg: string;
}

/** 'GetVolunteersForTelecomReport' query type */
export interface IGetVolunteersForTelecomReportQuery {
  params: IGetVolunteersForTelecomReportParams;
  result: IGetVolunteersForTelecomReportResult;
}

const getVolunteersForTelecomReportIR: any = {"name":"getVolunteersForTelecomReport","params":[{"name":"partnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7473,"b":7483,"line":260,"col":34}]}}],"usedParamSet":{"partnerOrg":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    users.created_at\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    volunteer_partner_orgs.key = :partnerOrg!\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE\nGROUP BY\n    users.id,\n    volunteer_partner_org","loc":{"a":7096,"b":7719,"line":248,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     users.created_at
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     volunteer_partner_orgs.key = :partnerOrg!
 *     AND users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND volunteer_profiles.onboarded IS TRUE
 *     AND volunteer_profiles.approved IS TRUE
 * GROUP BY
 *     users.id,
 *     volunteer_partner_org
 * ```
 */
export const getVolunteersForTelecomReport = new PreparedQuery<IGetVolunteersForTelecomReportParams,IGetVolunteersForTelecomReportResult>(getVolunteersForTelecomReportIR);


/** 'GetVolunteersNotifiedSinceDate' parameters type */
export interface IGetVolunteersNotifiedSinceDateParams {
  sinceDate: Date;
}

/** 'GetVolunteersNotifiedSinceDate' return type */
export interface IGetVolunteersNotifiedSinceDateResult {
  id: string;
}

/** 'GetVolunteersNotifiedSinceDate' query type */
export interface IGetVolunteersNotifiedSinceDateQuery {
  params: IGetVolunteersNotifiedSinceDateParams;
  result: IGetVolunteersNotifiedSinceDateResult;
}

const getVolunteersNotifiedSinceDateIR: any = {"name":"getVolunteersNotifiedSinceDate","params":[{"name":"sinceDate","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7929,"b":7938,"line":280,"col":34}]}}],"usedParamSet":{"sinceDate":true},"statement":{"body":"SELECT\n    users.id\nFROM\n    users\n    LEFT JOIN notifications ON users.id = notifications.user_id\nGROUP BY\n    users.id\nHAVING\n    MAX(notifications.sent_at) > :sinceDate!","loc":{"a":7767,"b":7938,"line":272,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id
 * FROM
 *     users
 *     LEFT JOIN notifications ON users.id = notifications.user_id
 * GROUP BY
 *     users.id
 * HAVING
 *     MAX(notifications.sent_at) > :sinceDate!
 * ```
 */
export const getVolunteersNotifiedSinceDate = new PreparedQuery<IGetVolunteersNotifiedSinceDateParams,IGetVolunteersNotifiedSinceDateResult>(getVolunteersNotifiedSinceDateIR);


/** 'GetVolunteersNotifiedBySessionId' parameters type */
export interface IGetVolunteersNotifiedBySessionIdParams {
  sessionId: string;
}

/** 'GetVolunteersNotifiedBySessionId' return type */
export interface IGetVolunteersNotifiedBySessionIdResult {
  userId: string;
}

/** 'GetVolunteersNotifiedBySessionId' query type */
export interface IGetVolunteersNotifiedBySessionIdQuery {
  params: IGetVolunteersNotifiedBySessionIdParams;
  result: IGetVolunteersNotifiedBySessionIdResult;
}

const getVolunteersNotifiedBySessionIdIR: any = {"name":"getVolunteersNotifiedBySessionId","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8082,"b":8091,"line":289,"col":32}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    notifications.user_id\nFROM\n    notifications\nWHERE\n    notifications.session_id = :sessionId!","loc":{"a":7988,"b":8091,"line":284,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     notifications.user_id
 * FROM
 *     notifications
 * WHERE
 *     notifications.session_id = :sessionId!
 * ```
 */
export const getVolunteersNotifiedBySessionId = new PreparedQuery<IGetVolunteersNotifiedBySessionIdParams,IGetVolunteersNotifiedBySessionIdResult>(getVolunteersNotifiedBySessionIdIR);


/** 'GetVolunteerByReference' parameters type */
export interface IGetVolunteerByReferenceParams {
  referenceId: string;
}

/** 'GetVolunteerByReference' return type */
export interface IGetVolunteerByReferenceResult {
  referenceEmail: string;
  volunteerId: string;
}

/** 'GetVolunteerByReference' query type */
export interface IGetVolunteerByReferenceQuery {
  params: IGetVolunteerByReferenceParams;
  result: IGetVolunteerByReferenceResult;
}

const getVolunteerByReferenceIR: any = {"name":"getVolunteerByReference","params":[{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8417,"b":8428,"line":300,"col":31}]}}],"usedParamSet":{"referenceId":true},"statement":{"body":"SELECT\n    volunteer_references.user_id AS volunteer_id,\n    volunteer_references.email AS reference_email\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_references.id = :referenceId!\n    AND volunteer_reference_statuses.name <> 'removed'\nLIMIT 1","loc":{"a":8132,"b":8491,"line":293,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_references.user_id AS volunteer_id,
 *     volunteer_references.email AS reference_email
 * FROM
 *     volunteer_references
 *     LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     volunteer_references.id = :referenceId!
 *     AND volunteer_reference_statuses.name <> 'removed'
 * LIMIT 1
 * ```
 */
export const getVolunteerByReference = new PreparedQuery<IGetVolunteerByReferenceParams,IGetVolunteerByReferenceResult>(getVolunteerByReferenceIR);


/** 'AddVolunteerReferenceById' parameters type */
export interface IAddVolunteerReferenceByIdParams {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  userId: string;
}

/** 'AddVolunteerReferenceById' return type */
export interface IAddVolunteerReferenceByIdResult {
  ok: string;
}

/** 'AddVolunteerReferenceById' query type */
export interface IAddVolunteerReferenceByIdQuery {
  params: IAddVolunteerReferenceByIdParams;
  result: IAddVolunteerReferenceByIdResult;
}

const addVolunteerReferenceByIdIR: any = {"name":"addVolunteerReferenceById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8658,"b":8660,"line":308,"col":5}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8668,"b":8674,"line":309,"col":5}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8682,"b":8691,"line":310,"col":5}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8699,"b":8707,"line":311,"col":5}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8715,"b":8720,"line":312,"col":5}]}}],"usedParamSet":{"id":true,"userId":true,"firstName":true,"lastName":true,"email":true},"statement":{"body":"INSERT INTO volunteer_references (id, user_id, first_name, last_name, email, status_id, created_at, updated_at)\nSELECT\n    :id!,\n    :userId!,\n    :firstName!,\n    :lastName!,\n    :email!,\n    volunteer_reference_statuses.id,\n    NOW(),\n    NOW()\nFROM\n    volunteer_reference_statuses\nWHERE\n    name = 'unsent'::text\nRETURNING\n    id AS ok","loc":{"a":8534,"b":8872,"line":306,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO volunteer_references (id, user_id, first_name, last_name, email, status_id, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :userId!,
 *     :firstName!,
 *     :lastName!,
 *     :email!,
 *     volunteer_reference_statuses.id,
 *     NOW(),
 *     NOW()
 * FROM
 *     volunteer_reference_statuses
 * WHERE
 *     name = 'unsent'::text
 * RETURNING
 *     id AS ok
 * ```
 */
export const addVolunteerReferenceById = new PreparedQuery<IAddVolunteerReferenceByIdParams,IAddVolunteerReferenceByIdResult>(addVolunteerReferenceByIdIR);


/** 'UpdateVolunteerReferenceSubmission' parameters type */
export interface IUpdateVolunteerReferenceSubmissionParams {
  additionalInfo: string | null | void;
  affiliation: string | null | void;
  agreeableAndApproachable: number | null | void;
  communicatesEffectively: number | null | void;
  patient: number | null | void;
  positiveRoleModel: number | null | void;
  referenceId: string;
  rejectionReason: string | null | void;
  relationshipLength: string | null | void;
  trustworthyWithChildren: number | null | void;
}

/** 'UpdateVolunteerReferenceSubmission' return type */
export interface IUpdateVolunteerReferenceSubmissionResult {
  ok: string;
}

/** 'UpdateVolunteerReferenceSubmission' query type */
export interface IUpdateVolunteerReferenceSubmissionQuery {
  params: IUpdateVolunteerReferenceSubmissionParams;
  result: IUpdateVolunteerReferenceSubmissionResult;
}

const updateVolunteerReferenceSubmissionIR: any = {"name":"updateVolunteerReferenceSubmission","params":[{"name":"affiliation","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9017,"b":9027,"line":329,"col":28}]}},{"name":"relationshipLength","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9080,"b":9097,"line":330,"col":36}]}},{"name":"rejectionReason","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9155,"b":9169,"line":331,"col":33}]}},{"name":"additionalInfo","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9223,"b":9236,"line":332,"col":32}]}},{"name":"patient","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9281,"b":9287,"line":333,"col":24}]}},{"name":"positiveRoleModel","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9336,"b":9352,"line":334,"col":36}]}},{"name":"agreeableAndApproachable","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9420,"b":9443,"line":335,"col":43}]}},{"name":"communicatesEffectively","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9516,"b":9538,"line":336,"col":41}]}},{"name":"trustworthyWithChildren","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9610,"b":9632,"line":337,"col":42}]}},{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9848,"b":9859,"line":347,"col":31}]}}],"usedParamSet":{"affiliation":true,"relationshipLength":true,"rejectionReason":true,"additionalInfo":true,"patient":true,"positiveRoleModel":true,"agreeableAndApproachable":true,"communicatesEffectively":true,"trustworthyWithChildren":true,"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    affiliation = COALESCE(:affiliation, affiliation),\n    relationship_length = COALESCE(:relationshipLength, relationship_length),\n    rejection_reason = COALESCE(:rejectionReason, rejection_reason),\n    additional_info = COALESCE(:additionalInfo, additional_info),\n    patient = COALESCE(:patient, patient),\n    positive_role_model = COALESCE(:positiveRoleModel, positive_role_model),\n    agreeable_and_approachable = COALESCE(:agreeableAndApproachable, agreeable_and_approachable),\n    communicates_effectively = COALESCE(:communicatesEffectively, communicates_effectively),\n    trustworthy_with_children = COALESCE(:trustworthyWithChildren, trustworthy_with_children),\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = 'submitted') AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":8924,"b":9903,"line":325,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_references
 * SET
 *     status_id = subquery.id,
 *     affiliation = COALESCE(:affiliation, affiliation),
 *     relationship_length = COALESCE(:relationshipLength, relationship_length),
 *     rejection_reason = COALESCE(:rejectionReason, rejection_reason),
 *     additional_info = COALESCE(:additionalInfo, additional_info),
 *     patient = COALESCE(:patient, patient),
 *     positive_role_model = COALESCE(:positiveRoleModel, positive_role_model),
 *     agreeable_and_approachable = COALESCE(:agreeableAndApproachable, agreeable_and_approachable),
 *     communicates_effectively = COALESCE(:communicatesEffectively, communicates_effectively),
 *     trustworthy_with_children = COALESCE(:trustworthyWithChildren, trustworthy_with_children),
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         volunteer_reference_statuses
 *     WHERE
 *         name = 'submitted') AS subquery
 * WHERE
 *     volunteer_references.id = :referenceId!
 * RETURNING
 *     volunteer_references.id AS ok
 * ```
 */
export const updateVolunteerReferenceSubmission = new PreparedQuery<IUpdateVolunteerReferenceSubmissionParams,IUpdateVolunteerReferenceSubmissionResult>(updateVolunteerReferenceSubmissionIR);


/** 'GetInactiveVolunteers' parameters type */
export interface IGetInactiveVolunteersParams {
  end: Date;
  start: Date;
}

/** 'GetInactiveVolunteers' return type */
export interface IGetInactiveVolunteersResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetInactiveVolunteers' query type */
export interface IGetInactiveVolunteersQuery {
  params: IGetInactiveVolunteersParams;
  result: IGetInactiveVolunteersResult;
}

const getInactiveVolunteersIR: any = {"name":"getInactiveVolunteers","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10305,"b":10310,"line":365,"col":31}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10346,"b":10349,"line":366,"col":34}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.last_activity_at >= :start!\n    AND users.last_activity_at < :end!\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE","loc":{"a":9942,"b":10492,"line":353,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     users.last_activity_at >= :start!
 *     AND users.last_activity_at < :end!
 *     AND users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND volunteer_profiles.onboarded IS TRUE
 * ```
 */
export const getInactiveVolunteers = new PreparedQuery<IGetInactiveVolunteersParams,IGetInactiveVolunteersResult>(getInactiveVolunteersIR);


/** 'UpdateVolunteerReferenceSentById' parameters type */
export interface IUpdateVolunteerReferenceSentByIdParams {
  referenceId: string;
}

/** 'UpdateVolunteerReferenceSentById' return type */
export interface IUpdateVolunteerReferenceSentByIdResult {
  ok: string;
}

/** 'UpdateVolunteerReferenceSentById' query type */
export interface IUpdateVolunteerReferenceSentByIdQuery {
  params: IUpdateVolunteerReferenceSentByIdParams;
  result: IUpdateVolunteerReferenceSentByIdResult;
}

const updateVolunteerReferenceSentByIdIR: any = {"name":"updateVolunteerReferenceSentById","params":[{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10808,"b":10819,"line":388,"col":31}]}}],"usedParamSet":{"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    sent_at = NOW(),\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = 'sent') AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":10542,"b":10863,"line":374,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_references
 * SET
 *     status_id = subquery.id,
 *     sent_at = NOW(),
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         volunteer_reference_statuses
 *     WHERE
 *         name = 'sent') AS subquery
 * WHERE
 *     volunteer_references.id = :referenceId!
 * RETURNING
 *     volunteer_references.id AS ok
 * ```
 */
export const updateVolunteerReferenceSentById = new PreparedQuery<IUpdateVolunteerReferenceSentByIdParams,IUpdateVolunteerReferenceSentByIdResult>(updateVolunteerReferenceSentByIdIR);


/** 'UpdateVolunteerReferenceStatusById' parameters type */
export interface IUpdateVolunteerReferenceStatusByIdParams {
  referenceId: string;
  status: string;
}

/** 'UpdateVolunteerReferenceStatusById' return type */
export interface IUpdateVolunteerReferenceStatusByIdResult {
  ok: string;
}

/** 'UpdateVolunteerReferenceStatusById' query type */
export interface IUpdateVolunteerReferenceStatusByIdQuery {
  params: IUpdateVolunteerReferenceStatusByIdParams;
  result: IUpdateVolunteerReferenceStatusByIdResult;
}

const updateVolunteerReferenceStatusByIdIR: any = {"name":"updateVolunteerReferenceStatusById","params":[{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11125,"b":11131,"line":406,"col":16}]}},{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11183,"b":11194,"line":408,"col":31}]}}],"usedParamSet":{"status":true,"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    sent_at = NOW(),\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":10915,"b":11238,"line":394,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_references
 * SET
 *     status_id = subquery.id,
 *     sent_at = NOW(),
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         volunteer_reference_statuses
 *     WHERE
 *         name = :status!) AS subquery
 * WHERE
 *     volunteer_references.id = :referenceId!
 * RETURNING
 *     volunteer_references.id AS ok
 * ```
 */
export const updateVolunteerReferenceStatusById = new PreparedQuery<IUpdateVolunteerReferenceStatusByIdParams,IUpdateVolunteerReferenceStatusByIdResult>(updateVolunteerReferenceStatusByIdIR);


/** 'DeleteVolunteerReferenceById' parameters type */
export interface IDeleteVolunteerReferenceByIdParams {
  referenceEmail: string;
  userId: string;
}

/** 'DeleteVolunteerReferenceById' return type */
export interface IDeleteVolunteerReferenceByIdResult {
  ok: string;
}

/** 'DeleteVolunteerReferenceById' query type */
export interface IDeleteVolunteerReferenceByIdQuery {
  params: IDeleteVolunteerReferenceByIdParams;
  result: IDeleteVolunteerReferenceByIdResult;
}

const deleteVolunteerReferenceByIdIR: any = {"name":"deleteVolunteerReferenceById","params":[{"name":"referenceEmail","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11535,"b":11549,"line":427,"col":34}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11591,"b":11597,"line":428,"col":40}]}}],"usedParamSet":{"referenceEmail":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = 'removed') AS subquery\nWHERE\n    volunteer_references.email = :referenceEmail!\n    AND volunteer_references.user_id = :userId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":11284,"b":11641,"line":414,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_references
 * SET
 *     status_id = subquery.id,
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         volunteer_reference_statuses
 *     WHERE
 *         name = 'removed') AS subquery
 * WHERE
 *     volunteer_references.email = :referenceEmail!
 *     AND volunteer_references.user_id = :userId!
 * RETURNING
 *     volunteer_references.id AS ok
 * ```
 */
export const deleteVolunteerReferenceById = new PreparedQuery<IDeleteVolunteerReferenceByIdParams,IDeleteVolunteerReferenceByIdResult>(deleteVolunteerReferenceByIdIR);


/** 'UpdateVolunteersReadyToCoachByIds' parameters type */
export interface IUpdateVolunteersReadyToCoachByIdsParams {
  userIds: stringArray;
}

/** 'UpdateVolunteersReadyToCoachByIds' return type */
export interface IUpdateVolunteersReadyToCoachByIdsResult {
  ok: string;
}

/** 'UpdateVolunteersReadyToCoachByIds' query type */
export interface IUpdateVolunteersReadyToCoachByIdsQuery {
  params: IUpdateVolunteersReadyToCoachByIdsParams;
  result: IUpdateVolunteersReadyToCoachByIdsResult;
}

const updateVolunteersReadyToCoachByIdsIR: any = {"name":"updateVolunteersReadyToCoachByIds","params":[{"name":"userIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11813,"b":11820,"line":440,"col":20}]}}],"usedParamSet":{"userIds":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_ready_to_coach_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = ANY (:userIds!)\nRETURNING\n    user_id AS ok","loc":{"a":11692,"b":11849,"line":434,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_ready_to_coach_email = TRUE,
 *     updated_at = NOW()
 * WHERE
 *     user_id = ANY (:userIds!)
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateVolunteersReadyToCoachByIds = new PreparedQuery<IUpdateVolunteersReadyToCoachByIdsParams,IUpdateVolunteersReadyToCoachByIdsResult>(updateVolunteersReadyToCoachByIdsIR);


/** 'UpdateVolunteerElapsedAvailabilityById' parameters type */
export interface IUpdateVolunteerElapsedAvailabilityByIdParams {
  elapsedAvailability: number;
  userId: string;
}

/** 'UpdateVolunteerElapsedAvailabilityById' return type */
export interface IUpdateVolunteerElapsedAvailabilityByIdResult {
  ok: string;
}

/** 'UpdateVolunteerElapsedAvailabilityById' query type */
export interface IUpdateVolunteerElapsedAvailabilityByIdQuery {
  params: IUpdateVolunteerElapsedAvailabilityByIdParams;
  result: IUpdateVolunteerElapsedAvailabilityByIdResult;
}

const updateVolunteerElapsedAvailabilityByIdIR: any = {"name":"updateVolunteerElapsedAvailabilityById","params":[{"name":"elapsedAvailability","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12045,"b":12064,"line":452,"col":46}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12146,"b":12152,"line":456,"col":19},{"a":12188,"b":12194,"line":458,"col":15}]}}],"usedParamSet":{"elapsedAvailability":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    elapsed_availability = subquery.total\nFROM (\n    SELECT\n        COALESCE(elapsed_availability, 0) + (:elapsedAvailability!)::int AS total\n    FROM\n        volunteer_profiles\n    WHERE\n        user_id = :userId!) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":11905,"b":12222,"line":446,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     elapsed_availability = subquery.total
 * FROM (
 *     SELECT
 *         COALESCE(elapsed_availability, 0) + (:elapsedAvailability!)::int AS total
 *     FROM
 *         volunteer_profiles
 *     WHERE
 *         user_id = :userId!) AS subquery
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateVolunteerElapsedAvailabilityById = new PreparedQuery<IUpdateVolunteerElapsedAvailabilityByIdParams,IUpdateVolunteerElapsedAvailabilityByIdResult>(updateVolunteerElapsedAvailabilityByIdIR);


/** 'UpdateVolunteerTotalHoursById' parameters type */
export interface IUpdateVolunteerTotalHoursByIdParams {
  totalHours: string;
  userId: string;
}

/** 'UpdateVolunteerTotalHoursById' return type */
export interface IUpdateVolunteerTotalHoursByIdResult {
  ok: string;
}

/** 'UpdateVolunteerTotalHoursById' query type */
export interface IUpdateVolunteerTotalHoursByIdQuery {
  params: IUpdateVolunteerTotalHoursByIdParams;
  result: IUpdateVolunteerTotalHoursByIdResult;
}

const updateVolunteerTotalHoursByIdIR: any = {"name":"updateVolunteerTotalHoursById","params":[{"name":"totalHours","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12411,"b":12421,"line":470,"col":47}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12507,"b":12513,"line":474,"col":19},{"a":12549,"b":12555,"line":476,"col":15}]}}],"usedParamSet":{"totalHours":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    total_volunteer_hours = subquery.total\nFROM (\n    SELECT\n        COALESCE(total_volunteer_hours, 0) + (:totalHours!)::numeric AS total\n    FROM\n        volunteer_profiles\n    WHERE\n        user_id = :userId!) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":12269,"b":12583,"line":464,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     total_volunteer_hours = subquery.total
 * FROM (
 *     SELECT
 *         COALESCE(total_volunteer_hours, 0) + (:totalHours!)::numeric AS total
 *     FROM
 *         volunteer_profiles
 *     WHERE
 *         user_id = :userId!) AS subquery
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateVolunteerTotalHoursById = new PreparedQuery<IUpdateVolunteerTotalHoursByIdParams,IUpdateVolunteerTotalHoursByIdResult>(updateVolunteerTotalHoursByIdIR);


/** 'GetVolunteerTrainingCourses' parameters type */
export interface IGetVolunteerTrainingCoursesParams {
  userId: string;
}

/** 'GetVolunteerTrainingCourses' return type */
export interface IGetVolunteerTrainingCoursesResult {
  complete: boolean;
  completedMaterials: stringArray | null;
  createdAt: Date;
  progress: number;
  trainingCourse: string;
  updatedAt: Date;
  userId: string;
}

/** 'GetVolunteerTrainingCourses' query type */
export interface IGetVolunteerTrainingCoursesQuery {
  params: IGetVolunteerTrainingCoursesParams;
  result: IGetVolunteerTrainingCoursesResult;
}

const getVolunteerTrainingCoursesIR: any = {"name":"getVolunteerTrainingCourses","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12998,"b":13004,"line":494,"col":38}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    user_id,\n    complete,\n    training_courses.name AS training_course,\n    progress,\n    completed_materials,\n    users_training_courses.created_at,\n    users_training_courses.updated_at\nFROM\n    users_training_courses\n    LEFT JOIN training_courses ON training_courses.id = users_training_courses.training_course_id\nWHERE\n    users_training_courses.user_id = :userId!","loc":{"a":12628,"b":13004,"line":482,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     complete,
 *     training_courses.name AS training_course,
 *     progress,
 *     completed_materials,
 *     users_training_courses.created_at,
 *     users_training_courses.updated_at
 * FROM
 *     users_training_courses
 *     LEFT JOIN training_courses ON training_courses.id = users_training_courses.training_course_id
 * WHERE
 *     users_training_courses.user_id = :userId!
 * ```
 */
export const getVolunteerTrainingCourses = new PreparedQuery<IGetVolunteerTrainingCoursesParams,IGetVolunteerTrainingCoursesResult>(getVolunteerTrainingCoursesIR);


/** 'UpdateVolunteerTrainingById' parameters type */
export interface IUpdateVolunteerTrainingByIdParams {
  complete: boolean;
  materialKey: string;
  progress: number;
  trainingCourse: string;
  userId: string;
}

/** 'UpdateVolunteerTrainingById' return type */
export interface IUpdateVolunteerTrainingByIdResult {
  ok: string;
}

/** 'UpdateVolunteerTrainingById' query type */
export interface IUpdateVolunteerTrainingByIdQuery {
  params: IUpdateVolunteerTrainingByIdParams;
  result: IUpdateVolunteerTrainingByIdResult;
}

const updateVolunteerTrainingByIdIR: any = {"name":"updateVolunteerTrainingById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13198,"b":13204,"line":500,"col":5}]}},{"name":"complete","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13237,"b":13245,"line":502,"col":5},{"a":13480,"b":13488,"line":514,"col":20}]}},{"name":"progress","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13253,"b":13261,"line":503,"col":5},{"a":13511,"b":13519,"line":515,"col":20}]}},{"name":"materialKey","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13276,"b":13287,"line":504,"col":12},{"a":13591,"b":13602,"line":516,"col":69},{"a":13656,"b":13667,"line":519,"col":13}]}},{"name":"trainingCourse","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13380,"b":13394,"line":510,"col":29}]}}],"usedParamSet":{"userId":true,"complete":true,"progress":true,"materialKey":true,"trainingCourse":true},"statement":{"body":"INSERT INTO users_training_courses AS ins (user_id, training_course_id, complete, progress, completed_materials, created_at, updated_at)\nSELECT\n    :userId!,\n    training_courses.id,\n    :complete!,\n    :progress!,\n    ARRAY[(:materialKey!)::text],\n    NOW(),\n    NOW()\nFROM\n    training_courses\nWHERE\n    training_courses.name = :trainingCourse!\nON CONFLICT (user_id,\n    training_course_id)\n    DO UPDATE SET\n        complete = :complete!,\n        progress = :progress!,\n        completed_materials = ARRAY_APPEND(ins.completed_materials, :materialKey!),\n        updated_at = NOW()\n    WHERE\n        NOT :materialKey! = ANY (ins.completed_materials)\n    RETURNING\n        user_id AS ok","loc":{"a":13049,"b":13735,"line":498,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_training_courses AS ins (user_id, training_course_id, complete, progress, completed_materials, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     training_courses.id,
 *     :complete!,
 *     :progress!,
 *     ARRAY[(:materialKey!)::text],
 *     NOW(),
 *     NOW()
 * FROM
 *     training_courses
 * WHERE
 *     training_courses.name = :trainingCourse!
 * ON CONFLICT (user_id,
 *     training_course_id)
 *     DO UPDATE SET
 *         complete = :complete!,
 *         progress = :progress!,
 *         completed_materials = ARRAY_APPEND(ins.completed_materials, :materialKey!),
 *         updated_at = NOW()
 *     WHERE
 *         NOT :materialKey! = ANY (ins.completed_materials)
 *     RETURNING
 *         user_id AS ok
 * ```
 */
export const updateVolunteerTrainingById = new PreparedQuery<IUpdateVolunteerTrainingByIdParams,IUpdateVolunteerTrainingByIdResult>(updateVolunteerTrainingByIdIR);


/** 'UpdateVolunteerPhotoIdById' parameters type */
export interface IUpdateVolunteerPhotoIdByIdParams {
  key: string;
  status: string;
  userId: string;
}

/** 'UpdateVolunteerPhotoIdById' return type */
export interface IUpdateVolunteerPhotoIdByIdResult {
  ok: string;
}

/** 'UpdateVolunteerPhotoIdById' query type */
export interface IUpdateVolunteerPhotoIdByIdQuery {
  params: IUpdateVolunteerPhotoIdByIdParams;
  result: IUpdateVolunteerPhotoIdByIdResult;
}

const updateVolunteerPhotoIdByIdIR: any = {"name":"updateVolunteerPhotoIdById","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13836,"b":13839,"line":528,"col":23}]}},{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13966,"b":13972,"line":536,"col":16}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14008,"b":14014,"line":538,"col":15}]}}],"usedParamSet":{"key":true,"status":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    photo_id_s3_key = :key!,\n    photo_id_status = subquery.id\nFROM (\n    SELECT\n        id\n    FROM\n        photo_id_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":13779,"b":14042,"line":525,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     photo_id_s3_key = :key!,
 *     photo_id_status = subquery.id
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         photo_id_statuses
 *     WHERE
 *         name = :status!) AS subquery
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateVolunteerPhotoIdById = new PreparedQuery<IUpdateVolunteerPhotoIdByIdParams,IUpdateVolunteerPhotoIdByIdResult>(updateVolunteerPhotoIdByIdIR);


/** 'UpdateVolunteerSentInactive30DayEmail' parameters type */
export interface IUpdateVolunteerSentInactive30DayEmailParams {
  userId: string;
}

/** 'UpdateVolunteerSentInactive30DayEmail' return type */
export interface IUpdateVolunteerSentInactive30DayEmailResult {
  ok: string;
}

/** 'UpdateVolunteerSentInactive30DayEmail' query type */
export interface IUpdateVolunteerSentInactive30DayEmailQuery {
  params: IUpdateVolunteerSentInactive30DayEmailParams;
  result: IUpdateVolunteerSentInactive30DayEmailResult;
}

const updateVolunteerSentInactive30DayEmailIR: any = {"name":"updateVolunteerSentInactive30DayEmail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14218,"b":14224,"line":550,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_thirty_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":14097,"b":14252,"line":544,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_inactive_thirty_day_email = TRUE,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateVolunteerSentInactive30DayEmail = new PreparedQuery<IUpdateVolunteerSentInactive30DayEmailParams,IUpdateVolunteerSentInactive30DayEmailResult>(updateVolunteerSentInactive30DayEmailIR);


/** 'UpdateVolunteerSentInactive60DayEmail' parameters type */
export interface IUpdateVolunteerSentInactive60DayEmailParams {
  userId: string;
}

/** 'UpdateVolunteerSentInactive60DayEmail' return type */
export interface IUpdateVolunteerSentInactive60DayEmailResult {
  ok: string;
}

/** 'UpdateVolunteerSentInactive60DayEmail' query type */
export interface IUpdateVolunteerSentInactive60DayEmailQuery {
  params: IUpdateVolunteerSentInactive60DayEmailParams;
  result: IUpdateVolunteerSentInactive60DayEmailResult;
}

const updateVolunteerSentInactive60DayEmailIR: any = {"name":"updateVolunteerSentInactive60DayEmail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14470,"b":14476,"line":563,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_thirty_day_email = TRUE,\n    sent_inactive_sixty_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":14307,"b":14504,"line":556,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_inactive_thirty_day_email = TRUE,
 *     sent_inactive_sixty_day_email = TRUE,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateVolunteerSentInactive60DayEmail = new PreparedQuery<IUpdateVolunteerSentInactive60DayEmailParams,IUpdateVolunteerSentInactive60DayEmailResult>(updateVolunteerSentInactive60DayEmailIR);


/** 'UpdateVolunteerSentInactive90DayEmail' parameters type */
export interface IUpdateVolunteerSentInactive90DayEmailParams {
  userId: string;
}

/** 'UpdateVolunteerSentInactive90DayEmail' return type */
export interface IUpdateVolunteerSentInactive90DayEmailResult {
  ok: string;
}

/** 'UpdateVolunteerSentInactive90DayEmail' query type */
export interface IUpdateVolunteerSentInactive90DayEmailQuery {
  params: IUpdateVolunteerSentInactive90DayEmailParams;
  result: IUpdateVolunteerSentInactive90DayEmailResult;
}

const updateVolunteerSentInactive90DayEmailIR: any = {"name":"updateVolunteerSentInactive90DayEmail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14680,"b":14686,"line":575,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_ninety_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":14559,"b":14714,"line":569,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_inactive_ninety_day_email = TRUE,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateVolunteerSentInactive90DayEmail = new PreparedQuery<IUpdateVolunteerSentInactive90DayEmailParams,IUpdateVolunteerSentInactive90DayEmailResult>(updateVolunteerSentInactive90DayEmailIR);


/** 'UpdateVolunteerProfileById' parameters type */
export interface IUpdateVolunteerProfileByIdParams {
  deactivated: boolean | null | void;
  phone: string | null | void;
  userId: string;
}

/** 'UpdateVolunteerProfileById' return type */
export interface IUpdateVolunteerProfileByIdResult {
  ok: string;
}

/** 'UpdateVolunteerProfileById' query type */
export interface IUpdateVolunteerProfileByIdQuery {
  params: IUpdateVolunteerProfileByIdParams;
  result: IUpdateVolunteerProfileByIdResult;
}

const updateVolunteerProfileByIdIR: any = {"name":"updateVolunteerProfileById","params":[{"name":"deactivated","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14807,"b":14817,"line":584,"col":28}]}},{"name":"phone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14856,"b":14860,"line":585,"col":22}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14886,"b":14892,"line":587,"col":10}]}}],"usedParamSet":{"deactivated":true,"phone":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    deactivated = COALESCE(:deactivated, deactivated),\n    phone = COALESCE(:phone, phone)\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":14758,"b":14915,"line":581,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     deactivated = COALESCE(:deactivated, deactivated),
 *     phone = COALESCE(:phone, phone)
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateVolunteerProfileById = new PreparedQuery<IUpdateVolunteerProfileByIdParams,IUpdateVolunteerProfileByIdResult>(updateVolunteerProfileByIdIR);


/** 'GetVolunteerUnsentReferences' parameters type */
export type IGetVolunteerUnsentReferencesParams = void;

/** 'GetVolunteerUnsentReferences' return type */
export interface IGetVolunteerUnsentReferencesResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  status: string;
  userId: string;
}

/** 'GetVolunteerUnsentReferences' query type */
export interface IGetVolunteerUnsentReferencesQuery {
  params: IGetVolunteerUnsentReferencesParams;
  result: IGetVolunteerUnsentReferencesResult;
}

const getVolunteerUnsentReferencesIR: any = {"name":"getVolunteerUnsentReferences","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    volunteer_references.id,\n    user_id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_reference_statuses.name = 'unsent'","loc":{"a":14961,"b":15294,"line":593,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_references.id,
 *     user_id,
 *     first_name,
 *     last_name,
 *     email,
 *     volunteer_reference_statuses.name AS status
 * FROM
 *     volunteer_references
 *     LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     volunteer_reference_statuses.name = 'unsent'
 * ```
 */
export const getVolunteerUnsentReferences = new PreparedQuery<IGetVolunteerUnsentReferencesParams,IGetVolunteerUnsentReferencesResult>(getVolunteerUnsentReferencesIR);


/** 'GetReferencesForReferenceFormApology' parameters type */
export type IGetReferencesForReferenceFormApologyParams = void;

/** 'GetReferencesForReferenceFormApology' return type */
export interface IGetReferencesForReferenceFormApologyResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  status: string;
  userId: string;
}

/** 'GetReferencesForReferenceFormApology' query type */
export interface IGetReferencesForReferenceFormApologyQuery {
  params: IGetReferencesForReferenceFormApologyParams;
  result: IGetReferencesForReferenceFormApologyResult;
}

const getReferencesForReferenceFormApologyIR: any = {"name":"getReferencesForReferenceFormApology","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    volunteer_references.id,\n    user_id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_reference_statuses.name = 'sent'\n    AND volunteer_references.sent_at <= '2022-04-12 18:00:00.000'\n    AND volunteer_references.sent_at >= '2022-02-26 00:00:00.000'","loc":{"a":15348,"b":15811,"line":608,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_references.id,
 *     user_id,
 *     first_name,
 *     last_name,
 *     email,
 *     volunteer_reference_statuses.name AS status
 * FROM
 *     volunteer_references
 *     LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     volunteer_reference_statuses.name = 'sent'
 *     AND volunteer_references.sent_at <= '2022-04-12 18:00:00.000'
 *     AND volunteer_references.sent_at >= '2022-02-26 00:00:00.000'
 * ```
 */
export const getReferencesForReferenceFormApology = new PreparedQuery<IGetReferencesForReferenceFormApologyParams,IGetReferencesForReferenceFormApologyResult>(getReferencesForReferenceFormApologyIR);


/** 'GetReferencesByVolunteer' parameters type */
export interface IGetReferencesByVolunteerParams {
  userId: string;
}

/** 'GetReferencesByVolunteer' return type */
export interface IGetReferencesByVolunteerResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  status: string;
}

/** 'GetReferencesByVolunteer' query type */
export interface IGetReferencesByVolunteerQuery {
  params: IGetReferencesByVolunteerParams;
  result: IGetReferencesByVolunteerResult;
}

const getReferencesByVolunteerIR: any = {"name":"getReferencesByVolunteer","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16162,"b":16168,"line":635,"col":36}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    volunteer_references.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_references.user_id = :userId!\n    AND volunteer_reference_statuses.name != 'removed'","loc":{"a":15853,"b":16223,"line":625,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_references.id,
 *     first_name,
 *     last_name,
 *     email,
 *     volunteer_reference_statuses.name AS status
 * FROM
 *     volunteer_references
 *     LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     volunteer_references.user_id = :userId!
 *     AND volunteer_reference_statuses.name != 'removed'
 * ```
 */
export const getReferencesByVolunteer = new PreparedQuery<IGetReferencesByVolunteerParams,IGetReferencesByVolunteerResult>(getReferencesByVolunteerIR);


/** 'CheckReferenceExistsBeforeAdding' parameters type */
export interface ICheckReferenceExistsBeforeAddingParams {
  email: string;
  userId: string;
}

/** 'CheckReferenceExistsBeforeAdding' return type */
export interface ICheckReferenceExistsBeforeAddingResult {
  actions: stringArray | null;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  status: string;
}

/** 'CheckReferenceExistsBeforeAdding' query type */
export interface ICheckReferenceExistsBeforeAddingQuery {
  params: ICheckReferenceExistsBeforeAddingParams;
  result: ICheckReferenceExistsBeforeAddingResult;
}

const checkReferenceExistsBeforeAddingIR: any = {"name":"checkReferenceExistsBeforeAdding","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16717,"b":16723,"line":656,"col":36},{"a":16835,"b":16841,"line":659,"col":36}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16773,"b":16778,"line":657,"col":48},{"a":16881,"b":16886,"line":660,"col":38}]}}],"usedParamSet":{"userId":true,"email":true},"statement":{"body":"SELECT\n    volunteer_references.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status,\n    sub.actions\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\n    LEFT JOIN (\n        SELECT\n            array_agg(action) AS actions\n        FROM\n            user_actions\n        WHERE\n            user_actions.user_id = :userId!\n            AND user_actions.reference_email = :email!) sub ON TRUE\nWHERE\n    volunteer_references.user_id = :userId!\n    AND volunteer_references.email = :email!","loc":{"a":16273,"b":16886,"line":640,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_references.id,
 *     first_name,
 *     last_name,
 *     email,
 *     volunteer_reference_statuses.name AS status,
 *     sub.actions
 * FROM
 *     volunteer_references
 *     LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 *     LEFT JOIN (
 *         SELECT
 *             array_agg(action) AS actions
 *         FROM
 *             user_actions
 *         WHERE
 *             user_actions.user_id = :userId!
 *             AND user_actions.reference_email = :email!) sub ON TRUE
 * WHERE
 *     volunteer_references.user_id = :userId!
 *     AND volunteer_references.email = :email!
 * ```
 */
export const checkReferenceExistsBeforeAdding = new PreparedQuery<ICheckReferenceExistsBeforeAddingParams,ICheckReferenceExistsBeforeAddingResult>(checkReferenceExistsBeforeAddingIR);


/** 'GetReferencesByVolunteerForAdminDetail' parameters type */
export interface IGetReferencesByVolunteerForAdminDetailParams {
  userId: string;
}

/** 'GetReferencesByVolunteerForAdminDetail' return type */
export interface IGetReferencesByVolunteerForAdminDetailResult {
  additionalInfo: string | null;
  affiliation: string | null;
  agreeableAndApproachable: number | null;
  communicatesEffectively: number | null;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  patient: number | null;
  positiveRoleModel: number | null;
  rejectionReason: string | null;
  relationshipLength: string | null;
  status: string;
  trustworthyWithChildren: number | null;
}

/** 'GetReferencesByVolunteerForAdminDetail' query type */
export interface IGetReferencesByVolunteerForAdminDetailQuery {
  params: IGetReferencesByVolunteerForAdminDetailParams;
  result: IGetReferencesByVolunteerForAdminDetailResult;
}

const getReferencesByVolunteerForAdminDetailIR: any = {"name":"getReferencesByVolunteerForAdminDetail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17467,"b":17473,"line":683,"col":36}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    volunteer_references.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status,\n    affiliation,\n    relationship_length,\n    patient,\n    positive_role_model,\n    agreeable_and_approachable,\n    communicates_effectively,\n    rejection_reason,\n    additional_info,\n    trustworthy_with_children\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_references.user_id = :userId!\n    AND volunteer_reference_statuses.name != 'removed'","loc":{"a":16942,"b":17528,"line":664,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_references.id,
 *     first_name,
 *     last_name,
 *     email,
 *     volunteer_reference_statuses.name AS status,
 *     affiliation,
 *     relationship_length,
 *     patient,
 *     positive_role_model,
 *     agreeable_and_approachable,
 *     communicates_effectively,
 *     rejection_reason,
 *     additional_info,
 *     trustworthy_with_children
 * FROM
 *     volunteer_references
 *     LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     volunteer_references.user_id = :userId!
 *     AND volunteer_reference_statuses.name != 'removed'
 * ```
 */
export const getReferencesByVolunteerForAdminDetail = new PreparedQuery<IGetReferencesByVolunteerForAdminDetailParams,IGetReferencesByVolunteerForAdminDetailResult>(getReferencesByVolunteerForAdminDetailIR);


/** 'GetVolunteerForPendingStatus' parameters type */
export interface IGetVolunteerForPendingStatusParams {
  userId: string;
}

/** 'GetVolunteerForPendingStatus' return type */
export interface IGetVolunteerForPendingStatusResult {
  approved: boolean;
  country: string | null;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  occupations: stringArray | null;
  onboarded: boolean;
  phone: string | null;
  photoIdStatus: string;
  volunteerPartnerOrg: string;
}

/** 'GetVolunteerForPendingStatus' query type */
export interface IGetVolunteerForPendingStatusQuery {
  params: IGetVolunteerForPendingStatusParams;
  result: IGetVolunteerForPendingStatusResult;
}

const getVolunteerForPendingStatusIR: any = {"name":"getVolunteerForPendingStatus","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18332,"b":18338,"line":711,"col":23},{"a":18386,"b":18392,"line":713,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_profiles.approved,\n    volunteer_profiles.onboarded,\n    volunteer_profiles.country,\n    photo_id_statuses.name AS photo_id_status,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    occupations.occupations\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    LEFT JOIN (\n        SELECT\n            array_agg(occupation) AS occupations\n        FROM\n            volunteer_occupations\n        WHERE\n            user_id = :userId!) AS occupations ON TRUE\nWHERE\n    users.id = :userId!","loc":{"a":17574,"b":18392,"line":688,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_profiles.approved,
 *     volunteer_profiles.onboarded,
 *     volunteer_profiles.country,
 *     photo_id_statuses.name AS photo_id_status,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     occupations.occupations
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status
 *     LEFT JOIN (
 *         SELECT
 *             array_agg(occupation) AS occupations
 *         FROM
 *             volunteer_occupations
 *         WHERE
 *             user_id = :userId!) AS occupations ON TRUE
 * WHERE
 *     users.id = :userId!
 * ```
 */
export const getVolunteerForPendingStatus = new PreparedQuery<IGetVolunteerForPendingStatusParams,IGetVolunteerForPendingStatusResult>(getVolunteerForPendingStatusIR);


/** 'UpdateVolunteerReferenceStatus' parameters type */
export interface IUpdateVolunteerReferenceStatusParams {
  referenceId: string;
  status: string;
}

/** 'UpdateVolunteerReferenceStatus' return type */
export interface IUpdateVolunteerReferenceStatusResult {
  ok: string;
}

/** 'UpdateVolunteerReferenceStatus' query type */
export interface IUpdateVolunteerReferenceStatusQuery {
  params: IUpdateVolunteerReferenceStatusParams;
  result: IUpdateVolunteerReferenceStatusResult;
}

const updateVolunteerReferenceStatusIR: any = {"name":"updateVolunteerReferenceStatus","params":[{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18629,"b":18635,"line":728,"col":16}]}},{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18687,"b":18698,"line":730,"col":31}]}}],"usedParamSet":{"status":true,"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":18440,"b":18742,"line":717,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_references
 * SET
 *     status_id = subquery.id,
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         volunteer_reference_statuses
 *     WHERE
 *         name = :status!) AS subquery
 * WHERE
 *     volunteer_references.id = :referenceId!
 * RETURNING
 *     volunteer_references.id AS ok
 * ```
 */
export const updateVolunteerReferenceStatus = new PreparedQuery<IUpdateVolunteerReferenceStatusParams,IUpdateVolunteerReferenceStatusResult>(updateVolunteerReferenceStatusIR);


/** 'UpdateVolunteerApproved' parameters type */
export interface IUpdateVolunteerApprovedParams {
  userId: string;
}

/** 'UpdateVolunteerApproved' return type */
export interface IUpdateVolunteerApprovedResult {
  ok: string;
}

/** 'UpdateVolunteerApproved' query type */
export interface IUpdateVolunteerApprovedQuery {
  params: IUpdateVolunteerApprovedParams;
  result: IUpdateVolunteerApprovedResult;
}

const updateVolunteerApprovedIR: any = {"name":"updateVolunteerApproved","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18901,"b":18907,"line":742,"col":34}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    approved = TRUE,\n    updated_at = NOW()\nWHERE\n    volunteer_profiles.user_id = :userId!\nRETURNING\n    volunteer_profiles.user_id AS ok","loc":{"a":18783,"b":18954,"line":736,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     approved = TRUE,
 *     updated_at = NOW()
 * WHERE
 *     volunteer_profiles.user_id = :userId!
 * RETURNING
 *     volunteer_profiles.user_id AS ok
 * ```
 */
export const updateVolunteerApproved = new PreparedQuery<IUpdateVolunteerApprovedParams,IUpdateVolunteerApprovedResult>(updateVolunteerApprovedIR);


/** 'UpdateVolunteerPending' parameters type */
export interface IUpdateVolunteerPendingParams {
  approved: boolean;
  status: string;
  userId: string;
}

/** 'UpdateVolunteerPending' return type */
export interface IUpdateVolunteerPendingResult {
  ok: string;
}

/** 'UpdateVolunteerPending' query type */
export interface IUpdateVolunteerPendingQuery {
  params: IUpdateVolunteerPendingParams;
  result: IUpdateVolunteerPendingResult;
}

const updateVolunteerPendingIR: any = {"name":"updateVolunteerPending","params":[{"name":"approved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19044,"b":19052,"line":751,"col":16}]}},{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19203,"b":19209,"line":760,"col":16}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19264,"b":19270,"line":762,"col":34}]}}],"usedParamSet":{"approved":true,"status":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    approved = :approved!,\n    photo_id_status = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        photo_id_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    volunteer_profiles.user_id = :userId!\nRETURNING\n    volunteer_profiles.user_id AS ok","loc":{"a":18994,"b":19317,"line":748,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     approved = :approved!,
 *     photo_id_status = subquery.id,
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         photo_id_statuses
 *     WHERE
 *         name = :status!) AS subquery
 * WHERE
 *     volunteer_profiles.user_id = :userId!
 * RETURNING
 *     volunteer_profiles.user_id AS ok
 * ```
 */
export const updateVolunteerPending = new PreparedQuery<IUpdateVolunteerPendingParams,IUpdateVolunteerPendingResult>(updateVolunteerPendingIR);


/** 'UpdateVolunteerOnboarded' parameters type */
export interface IUpdateVolunteerOnboardedParams {
  userId: string;
}

/** 'UpdateVolunteerOnboarded' return type */
export interface IUpdateVolunteerOnboardedResult {
  ok: string;
}

/** 'UpdateVolunteerOnboarded' query type */
export interface IUpdateVolunteerOnboardedQuery {
  params: IUpdateVolunteerOnboardedParams;
  result: IUpdateVolunteerOnboardedResult;
}

const updateVolunteerOnboardedIR: any = {"name":"updateVolunteerOnboarded","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19478,"b":19484,"line":774,"col":34}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    onboarded = TRUE,\n    updated_at = NOW()\nWHERE\n    volunteer_profiles.user_id = :userId!\nRETURNING\n    volunteer_profiles.user_id AS ok","loc":{"a":19359,"b":19531,"line":768,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     onboarded = TRUE,
 *     updated_at = NOW()
 * WHERE
 *     volunteer_profiles.user_id = :userId!
 * RETURNING
 *     volunteer_profiles.user_id AS ok
 * ```
 */
export const updateVolunteerOnboarded = new PreparedQuery<IUpdateVolunteerOnboardedParams,IUpdateVolunteerOnboardedResult>(updateVolunteerOnboardedIR);


/** 'GetVolunteersForNiceToMeetYou' parameters type */
export interface IGetVolunteersForNiceToMeetYouParams {
  end: Date;
  start: Date;
}

/** 'GetVolunteersForNiceToMeetYou' return type */
export interface IGetVolunteersForNiceToMeetYouResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetVolunteersForNiceToMeetYou' query type */
export interface IGetVolunteersForNiceToMeetYouQuery {
  params: IGetVolunteersForNiceToMeetYouParams;
  result: IGetVolunteersForNiceToMeetYouResult;
}

const getVolunteersForNiceToMeetYouIR: any = {"name":"getVolunteersForNiceToMeetYou","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20033,"b":20038,"line":795,"col":29}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20068,"b":20071,"line":796,"col":28}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND users.created_at >= :start!\n    AND users.created_at < :end!","loc":{"a":19578,"b":20071,"line":780,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND users.created_at >= :start!
 *     AND users.created_at < :end!
 * ```
 */
export const getVolunteersForNiceToMeetYou = new PreparedQuery<IGetVolunteersForNiceToMeetYouParams,IGetVolunteersForNiceToMeetYouResult>(getVolunteersForNiceToMeetYouIR);


/** 'GetVolunteersForReadyToCoach' parameters type */
export type IGetVolunteersForReadyToCoachParams = void;

/** 'GetVolunteersForReadyToCoach' return type */
export interface IGetVolunteersForReadyToCoachResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetVolunteersForReadyToCoach' query type */
export interface IGetVolunteersForReadyToCoachQuery {
  params: IGetVolunteersForReadyToCoachParams;
  result: IGetVolunteersForReadyToCoachResult;
}

const getVolunteersForReadyToCoachIR: any = {"name":"getVolunteersForReadyToCoach","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN user_product_flags ON user_product_flags.user_id = users.id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE\n    AND user_product_flags.sent_ready_to_coach_email IS FALSE","loc":{"a":20117,"b":20766,"line":800,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN user_product_flags ON user_product_flags.user_id = users.id
 * WHERE
 *     users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND volunteer_profiles.onboarded IS TRUE
 *     AND volunteer_profiles.approved IS TRUE
 *     AND user_product_flags.sent_ready_to_coach_email IS FALSE
 * ```
 */
export const getVolunteersForReadyToCoach = new PreparedQuery<IGetVolunteersForReadyToCoachParams,IGetVolunteersForReadyToCoachResult>(getVolunteersForReadyToCoachIR);


/** 'GetVolunteersForWaitingReferences' parameters type */
export interface IGetVolunteersForWaitingReferencesParams {
  end: Date;
  start: Date;
}

/** 'GetVolunteersForWaitingReferences' return type */
export interface IGetVolunteersForWaitingReferencesResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetVolunteersForWaitingReferences' query type */
export interface IGetVolunteersForWaitingReferencesQuery {
  params: IGetVolunteersForWaitingReferencesParams;
  result: IGetVolunteersForWaitingReferencesResult;
}

const getVolunteersForWaitingReferencesIR: any = {"name":"getVolunteersForWaitingReferences","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21547,"b":21552,"line":840,"col":40}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21594,"b":21597,"line":841,"col":40}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name,\n    users.last_name,\n    users.phone,\n    users.email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN volunteer_references ON volunteer_references.user_id = users.id\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_reference_statuses.name = 'sent'\n    AND volunteer_references.sent_at > :start!\n    AND volunteer_references.sent_at < :end!\nGROUP BY\n    users.id,\n    volunteer_partner_orgs.key","loc":{"a":20817,"b":21651,"line":822,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name,
 *     users.last_name,
 *     users.phone,
 *     users.email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN volunteer_references ON volunteer_references.user_id = users.id
 *     LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND volunteer_reference_statuses.name = 'sent'
 *     AND volunteer_references.sent_at > :start!
 *     AND volunteer_references.sent_at < :end!
 * GROUP BY
 *     users.id,
 *     volunteer_partner_orgs.key
 * ```
 */
export const getVolunteersForWaitingReferences = new PreparedQuery<IGetVolunteersForWaitingReferencesParams,IGetVolunteersForWaitingReferencesResult>(getVolunteersForWaitingReferencesIR);


/** 'AddVolunteerCertification' parameters type */
export interface IAddVolunteerCertificationParams {
  subject: string;
  userId: string;
}

/** 'AddVolunteerCertification' return type */
export interface IAddVolunteerCertificationResult {
  ok: string;
}

/** 'AddVolunteerCertification' query type */
export interface IAddVolunteerCertificationQuery {
  params: IAddVolunteerCertificationParams;
  result: IAddVolunteerCertificationResult;
}

const addVolunteerCertificationIR: any = {"name":"addVolunteerCertification","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21791,"b":21797,"line":850,"col":5}]}},{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22007,"b":22014,"line":861,"col":24}]}}],"usedParamSet":{"userId":true,"subject":true},"statement":{"body":"INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at)\nSELECT\n    :userId!,\n    subquery.id,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        certifications.id\n    FROM\n        certifications\n        JOIN quizzes ON quizzes.name = certifications.name\n    WHERE\n        quizzes.name = :subject!) AS subquery\nON CONFLICT (user_id,\n    certification_id)\n    DO NOTHING\nRETURNING\n    user_id AS ok","loc":{"a":21694,"b":22114,"line":848,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     subquery.id,
 *     NOW(),
 *     NOW()
 * FROM (
 *     SELECT
 *         certifications.id
 *     FROM
 *         certifications
 *         JOIN quizzes ON quizzes.name = certifications.name
 *     WHERE
 *         quizzes.name = :subject!) AS subquery
 * ON CONFLICT (user_id,
 *     certification_id)
 *     DO NOTHING
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const addVolunteerCertification = new PreparedQuery<IAddVolunteerCertificationParams,IAddVolunteerCertificationResult>(addVolunteerCertificationIR);


/** 'UpdateVolunteerQuiz' parameters type */
export interface IUpdateVolunteerQuizParams {
  passed: boolean;
  quiz: string;
  userId: string;
}

/** 'UpdateVolunteerQuiz' return type */
export interface IUpdateVolunteerQuizResult {
  ok: string;
}

/** 'UpdateVolunteerQuiz' query type */
export interface IUpdateVolunteerQuizQuery {
  params: IUpdateVolunteerQuizParams;
  result: IUpdateVolunteerQuizResult;
}

const updateVolunteerQuizIR: any = {"name":"updateVolunteerQuiz","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22257,"b":22263,"line":872,"col":5}]}},{"name":"passed","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22295,"b":22301,"line":875,"col":5},{"a":22548,"b":22554,"line":889,"col":18}]}},{"name":"quiz","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22421,"b":22425,"line":884,"col":24}]}}],"usedParamSet":{"userId":true,"passed":true,"quiz":true},"statement":{"body":"INSERT INTO users_quizzes AS ins (user_id, quiz_id, attempts, passed, created_at, updated_at)\nSELECT\n    :userId!,\n    subquery.id,\n    1,\n    :passed!,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        quizzes.id\n    FROM\n        quizzes\n    WHERE\n        quizzes.name = :quiz!) AS subquery\nON CONFLICT (user_id,\n    quiz_id)\n    DO UPDATE SET\n        attempts = ins.attempts + 1,\n        passed = :passed!,\n        updated_at = NOW()\n    RETURNING\n        user_id AS ok","loc":{"a":22151,"b":22618,"line":870,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_quizzes AS ins (user_id, quiz_id, attempts, passed, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     subquery.id,
 *     1,
 *     :passed!,
 *     NOW(),
 *     NOW()
 * FROM (
 *     SELECT
 *         quizzes.id
 *     FROM
 *         quizzes
 *     WHERE
 *         quizzes.name = :quiz!) AS subquery
 * ON CONFLICT (user_id,
 *     quiz_id)
 *     DO UPDATE SET
 *         attempts = ins.attempts + 1,
 *         passed = :passed!,
 *         updated_at = NOW()
 *     RETURNING
 *         user_id AS ok
 * ```
 */
export const updateVolunteerQuiz = new PreparedQuery<IUpdateVolunteerQuizParams,IUpdateVolunteerQuizResult>(updateVolunteerQuizIR);


/** 'GetVolunteersAdminAvailability' parameters type */
export interface IGetVolunteersAdminAvailabilityParams {
  subject: string;
}

/** 'GetVolunteersAdminAvailability' return type */
export interface IGetVolunteersAdminAvailabilityResult {
  id: string;
}

/** 'GetVolunteersAdminAvailability' query type */
export interface IGetVolunteersAdminAvailabilityQuery {
  params: IGetVolunteersAdminAvailabilityParams;
  result: IGetVolunteersAdminAvailabilityResult;
}

const getVolunteersAdminAvailabilityIR: any = {"name":"getVolunteersAdminAvailability","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22898,"b":22905,"line":903,"col":25},{"a":23448,"b":23455,"line":921,"col":29}]}}],"usedParamSet":{"subject":true},"statement":{"body":"WITH certs_for_subject AS (\n    SELECT\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    WHERE\n        subjects.name = :subject!\n)\nSELECT\n    users.id\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN (\n        SELECT\n            users_certifications.user_id,\n            COUNT(*)::int AS earned_certs,\n            certs_for_subject.total\n        FROM\n            users_certifications\n            JOIN certification_subject_unlocks USING (certification_id)\n            JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n            JOIN certs_for_subject ON TRUE\n        WHERE\n            subjects.name = :subject!\n        GROUP BY\n            users_certifications.user_id, subjects.name, certs_for_subject.total\n        HAVING\n            COUNT(*)::int >= certs_for_subject.total) user_certs ON user_certs.user_id = users.id\nWHERE\n    users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND users.deactivated IS FALSE\n    AND users.banned IS FALSE","loc":{"a":22666,"b":23811,"line":896,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH certs_for_subject AS (
 *     SELECT
 *         COUNT(*)::int AS total
 *     FROM
 *         certification_subject_unlocks
 *         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *     WHERE
 *         subjects.name = :subject!
 * )
 * SELECT
 *     users.id
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     JOIN (
 *         SELECT
 *             users_certifications.user_id,
 *             COUNT(*)::int AS earned_certs,
 *             certs_for_subject.total
 *         FROM
 *             users_certifications
 *             JOIN certification_subject_unlocks USING (certification_id)
 *             JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *             JOIN certs_for_subject ON TRUE
 *         WHERE
 *             subjects.name = :subject!
 *         GROUP BY
 *             users_certifications.user_id, subjects.name, certs_for_subject.total
 *         HAVING
 *             COUNT(*)::int >= certs_for_subject.total) user_certs ON user_certs.user_id = users.id
 * WHERE
 *     users.test_user IS FALSE
 *     AND volunteer_profiles.onboarded IS TRUE
 *     AND users.deactivated IS FALSE
 *     AND users.banned IS FALSE
 * ```
 */
export const getVolunteersAdminAvailability = new PreparedQuery<IGetVolunteersAdminAvailabilityParams,IGetVolunteersAdminAvailabilityResult>(getVolunteersAdminAvailabilityIR);


/** 'GetVolunteerForTextResponse' parameters type */
export interface IGetVolunteerForTextResponseParams {
  phone: string;
}

/** 'GetVolunteerForTextResponse' return type */
export interface IGetVolunteerForTextResponseResult {
  endedAt: Date | null;
  sessionId: string;
  subject: string;
  topic: string;
  volunteerId: string;
  volunteerJoinedAt: Date | null;
}

/** 'GetVolunteerForTextResponse' query type */
export interface IGetVolunteerForTextResponseQuery {
  params: IGetVolunteerForTextResponseParams;
  result: IGetVolunteerForTextResponseResult;
}

const getVolunteerForTextResponseIR: any = {"name":"getVolunteerForTextResponse","params":[{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24388,"b":24393,"line":949,"col":19}]}}],"usedParamSet":{"phone":true},"statement":{"body":"SELECT\n    users.id AS volunteer_id,\n    sessions.id AS session_id,\n    sessions.volunteer_joined_at,\n    sessions.ended_at,\n    subjects.name AS subject,\n    topics.name AS topic\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN notifications ON notifications.user_id = users.id\n    LEFT JOIN sessions ON sessions.id = notifications.session_id\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\nWHERE\n    users.phone = :phone!\nORDER BY\n    notifications.created_at DESC\nLIMIT 1","loc":{"a":23856,"b":24444,"line":934,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id AS volunteer_id,
 *     sessions.id AS session_id,
 *     sessions.volunteer_joined_at,
 *     sessions.ended_at,
 *     subjects.name AS subject,
 *     topics.name AS topic
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN notifications ON notifications.user_id = users.id
 *     LEFT JOIN sessions ON sessions.id = notifications.session_id
 *     LEFT JOIN subjects ON subjects.id = sessions.subject_id
 *     LEFT JOIN topics ON topics.id = subjects.topic_id
 * WHERE
 *     users.phone = :phone!
 * ORDER BY
 *     notifications.created_at DESC
 * LIMIT 1
 * ```
 */
export const getVolunteerForTextResponse = new PreparedQuery<IGetVolunteerForTextResponseParams,IGetVolunteerForTextResponseResult>(getVolunteerForTextResponseIR);


/** 'GetVolunteersToReview' parameters type */
export interface IGetVolunteersToReviewParams {
  limit: number;
  offset: number;
}

/** 'GetVolunteersToReview' return type */
export interface IGetVolunteersToReviewResult {
  createdAt: Date;
  email: string;
  firstname: string;
  firstName: string;
  id: string;
  lastname: string;
  lastName: string;
  readyForReviewAt: Date | null;
}

/** 'GetVolunteersToReview' query type */
export interface IGetVolunteersToReviewQuery {
  params: IGetVolunteersToReviewParams;
  result: IGetVolunteersToReviewResult;
}

const getVolunteersToReviewIR: any = {"name":"getVolunteersToReview","params":[{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25995,"b":26000,"line":993,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26017,"b":26023,"line":993,"col":30}]}}],"usedParamSet":{"limit":true,"offset":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name AS first_name,\n    users.last_name AS last_name,\n    users.first_name AS firstname,\n    users.last_name AS lastname,\n    users.email,\n    users.created_at,\n    MAX(user_actions.created_at) AS ready_for_review_at\nFROM\n    users\n    JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\n    JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    JOIN (\n        SELECT\n            user_id,\n            count(*) AS total_references\n        FROM\n            volunteer_references\n            JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\n        WHERE\n            volunteer_reference_statuses.name = ANY ('{ \"submitted\", \"approved\" }')\n        GROUP BY\n            user_id) AS reference_count ON reference_count.user_id = users.id\n    JOIN volunteer_occupations ON volunteer_occupations.user_id = users.id -- user is only ready for review if they submitted background info\n    JOIN user_actions ON user_actions.user_id = users.id\nWHERE\n    volunteer_profiles.approved IS FALSE\n    AND NOT volunteer_profiles.country IS NULL\n    AND NOT volunteer_profiles.photo_id_s3_key IS NULL\n    AND photo_id_statuses.name = ANY ('{ \"submitted\", \"approved\" }')\n    AND user_actions.action = ANY ('{ \"ADDED PHOTO ID\", \"SUBMITTED REFERENCE FORM\", \"COMPLETED BACKGROUND INFO\" }')\n    AND reference_count.total_references = 2\nGROUP BY\n    users.id\nORDER BY\n    ready_for_review_at ASC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":24483,"b":26029,"line":956,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name AS first_name,
 *     users.last_name AS last_name,
 *     users.first_name AS firstname,
 *     users.last_name AS lastname,
 *     users.email,
 *     users.created_at,
 *     MAX(user_actions.created_at) AS ready_for_review_at
 * FROM
 *     users
 *     JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id
 *     JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status
 *     JOIN (
 *         SELECT
 *             user_id,
 *             count(*) AS total_references
 *         FROM
 *             volunteer_references
 *             JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 *         WHERE
 *             volunteer_reference_statuses.name = ANY ('{ "submitted", "approved" }')
 *         GROUP BY
 *             user_id) AS reference_count ON reference_count.user_id = users.id
 *     JOIN volunteer_occupations ON volunteer_occupations.user_id = users.id -- user is only ready for review if they submitted background info
 *     JOIN user_actions ON user_actions.user_id = users.id
 * WHERE
 *     volunteer_profiles.approved IS FALSE
 *     AND NOT volunteer_profiles.country IS NULL
 *     AND NOT volunteer_profiles.photo_id_s3_key IS NULL
 *     AND photo_id_statuses.name = ANY ('{ "submitted", "approved" }')
 *     AND user_actions.action = ANY ('{ "ADDED PHOTO ID", "SUBMITTED REFERENCE FORM", "COMPLETED BACKGROUND INFO" }')
 *     AND reference_count.total_references = 2
 * GROUP BY
 *     users.id
 * ORDER BY
 *     ready_for_review_at ASC
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
export const getVolunteersToReview = new PreparedQuery<IGetVolunteersToReviewParams,IGetVolunteersToReviewResult>(getVolunteersToReviewIR);


/** 'GetReferencesToFollowup' parameters type */
export interface IGetReferencesToFollowupParams {
  end: Date;
  start: Date;
}

/** 'GetReferencesToFollowup' return type */
export interface IGetReferencesToFollowupResult {
  referenceEmail: string;
  referenceFirstName: string;
  referenceId: string;
  referenceLastName: string;
  volunteerFirstName: string;
  volunteerId: string;
  volunteerLastName: string;
}

/** 'GetReferencesToFollowup' query type */
export interface IGetReferencesToFollowupQuery {
  params: IGetReferencesToFollowupParams;
  result: IGetReferencesToFollowupResult;
}

const getReferencesToFollowupIR: any = {"name":"getReferencesToFollowup","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26871,"b":26876,"line":1015,"col":40}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26918,"b":26921,"line":1016,"col":40}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id AS volunteer_id,\n    users.first_name AS volunteer_first_name,\n    users.last_name AS volunteer_last_name,\n    volunteer_references.id AS reference_id,\n    volunteer_references.first_name AS reference_first_name,\n    volunteer_references.last_name AS reference_last_name,\n    volunteer_references.email AS reference_email\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN volunteer_references ON volunteer_references.user_id = users.id\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_reference_statuses.name = 'sent'\n    AND volunteer_references.sent_at > :start!\n    AND volunteer_references.sent_at < :end!","loc":{"a":26070,"b":26921,"line":997,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id AS volunteer_id,
 *     users.first_name AS volunteer_first_name,
 *     users.last_name AS volunteer_last_name,
 *     volunteer_references.id AS reference_id,
 *     volunteer_references.first_name AS reference_first_name,
 *     volunteer_references.last_name AS reference_last_name,
 *     volunteer_references.email AS reference_email
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     JOIN volunteer_references ON volunteer_references.user_id = users.id
 *     LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND volunteer_reference_statuses.name = 'sent'
 *     AND volunteer_references.sent_at > :start!
 *     AND volunteer_references.sent_at < :end!
 * ```
 */
export const getReferencesToFollowup = new PreparedQuery<IGetReferencesToFollowupParams,IGetReferencesToFollowupResult>(getReferencesToFollowupIR);


/** 'UpdateVolunteerBackgroundInfo' parameters type */
export interface IUpdateVolunteerBackgroundInfoParams {
  approved: boolean | null | void;
  city: string | null | void;
  college: string | null | void;
  company: string | null | void;
  country: string | null | void;
  experience: Json | null | void;
  languages: stringArray | null | void;
  linkedInUrl: string | null | void;
  occupation: readonly ({
    userId: string | null | void,
    occupation: string | null | void,
    createdAt: Date | null | void,
    updatedAt: Date | null | void
  })[];
  state: string | null | void;
  userId: string;
}

/** 'UpdateVolunteerBackgroundInfo' return type */
export interface IUpdateVolunteerBackgroundInfoResult {
  ok: string;
}

/** 'UpdateVolunteerBackgroundInfo' query type */
export interface IUpdateVolunteerBackgroundInfoQuery {
  params: IUpdateVolunteerBackgroundInfoParams;
  result: IUpdateVolunteerBackgroundInfoResult;
}

const updateVolunteerBackgroundInfoIR: any = {"name":"updateVolunteerBackgroundInfo","params":[{"name":"occupation","codeRefs":{"defined":{"a":26974,"b":26983,"line":1021,"col":8},"used":[{"a":27251,"b":27261,"line":1030,"col":13}]},"transform":{"type":"pick_array_spread","keys":[{"name":"userId","required":false},{"name":"occupation","required":false},{"name":"createdAt","required":false},{"name":"updatedAt","required":false}]},"required":true},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27119,"b":27125,"line":1025,"col":21},{"a":27909,"b":27915,"line":1047,"col":23}]}},{"name":"approved","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27398,"b":27405,"line":1036,"col":33}]}},{"name":"experience","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27454,"b":27463,"line":1037,"col":35}]}},{"name":"company","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27511,"b":27517,"line":1038,"col":32}]}},{"name":"college","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27562,"b":27568,"line":1039,"col":32}]}},{"name":"linkedInUrl","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27618,"b":27628,"line":1040,"col":37}]}},{"name":"country","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27678,"b":27684,"line":1041,"col":32}]}},{"name":"state","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27727,"b":27731,"line":1042,"col":30}]}},{"name":"city","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27771,"b":27774,"line":1043,"col":29}]}},{"name":"languages","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27818,"b":27826,"line":1044,"col":34}]}}],"usedParamSet":{"userId":true,"occupation":true,"approved":true,"experience":true,"company":true,"college":true,"linkedInUrl":true,"country":true,"state":true,"city":true,"languages":true},"statement":{"body":"WITH clear_occ AS (\n    DELETE FROM volunteer_occupations\n    WHERE user_id = :userId!\n),\nins_occ AS (\nINSERT INTO volunteer_occupations (user_id, occupation, created_at, updated_at)\n        VALUES\n            :occupation!\n        ON CONFLICT\n            DO NOTHING)\n        UPDATE\n            volunteer_profiles\n        SET\n            approved = COALESCE(:approved, approved),\n            experience = COALESCE(:experience, experience),\n            company = COALESCE(:company, company),\n            college = COALESCE(:college, college),\n            linkedin_url = COALESCE(:linkedInUrl, linkedin_url),\n            country = COALESCE(:country, country),\n            state = COALESCE(:state, state),\n            city = COALESCE(:city, city),\n            languages = COALESCE(:languages, languages),\n            updated_at = NOW()\n        WHERE\n            user_id = :userId!\n        RETURNING\n            user_id AS ok","loc":{"a":27040,"b":27959,"line":1023,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH clear_occ AS (
 *     DELETE FROM volunteer_occupations
 *     WHERE user_id = :userId!
 * ),
 * ins_occ AS (
 * INSERT INTO volunteer_occupations (user_id, occupation, created_at, updated_at)
 *         VALUES
 *             :occupation!
 *         ON CONFLICT
 *             DO NOTHING)
 *         UPDATE
 *             volunteer_profiles
 *         SET
 *             approved = COALESCE(:approved, approved),
 *             experience = COALESCE(:experience, experience),
 *             company = COALESCE(:company, company),
 *             college = COALESCE(:college, college),
 *             linkedin_url = COALESCE(:linkedInUrl, linkedin_url),
 *             country = COALESCE(:country, country),
 *             state = COALESCE(:state, state),
 *             city = COALESCE(:city, city),
 *             languages = COALESCE(:languages, languages),
 *             updated_at = NOW()
 *         WHERE
 *             user_id = :userId!
 *         RETURNING
 *             user_id AS ok
 * ```
 */
export const updateVolunteerBackgroundInfo = new PreparedQuery<IUpdateVolunteerBackgroundInfoParams,IUpdateVolunteerBackgroundInfoResult>(updateVolunteerBackgroundInfoIR);


/** 'GetQuizzesPassedForDateRange' parameters type */
export interface IGetQuizzesPassedForDateRangeParams {
  end: Date;
  start: Date;
  userId: string;
}

/** 'GetQuizzesPassedForDateRange' return type */
export interface IGetQuizzesPassedForDateRangeResult {
  total: number | null;
}

/** 'GetQuizzesPassedForDateRange' query type */
export interface IGetQuizzesPassedForDateRangeQuery {
  params: IGetQuizzesPassedForDateRangeParams;
  result: IGetQuizzesPassedForDateRangeResult;
}

const getQuizzesPassedForDateRangeIR: any = {"name":"getQuizzesPassedForDateRange","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28083,"b":28089,"line":1058,"col":15}]}},{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28114,"b":28119,"line":1059,"col":23}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28144,"b":28147,"line":1060,"col":23}]}}],"usedParamSet":{"userId":true,"start":true,"end":true},"statement":{"body":"SELECT\n    COUNT(*)::int AS total\nFROM\n    users_quizzes\nWHERE\n    user_id = :userId!\n    AND updated_at >= :start!\n    AND updated_at <= :end!\n    AND passed IS TRUE","loc":{"a":28005,"b":28170,"line":1053,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     COUNT(*)::int AS total
 * FROM
 *     users_quizzes
 * WHERE
 *     user_id = :userId!
 *     AND updated_at >= :start!
 *     AND updated_at <= :end!
 *     AND passed IS TRUE
 * ```
 */
export const getQuizzesPassedForDateRange = new PreparedQuery<IGetQuizzesPassedForDateRangeParams,IGetQuizzesPassedForDateRangeResult>(getQuizzesPassedForDateRangeIR);


/** 'UpdateVolunteerUserForAdmin' parameters type */
export interface IUpdateVolunteerUserForAdminParams {
  email: string;
  firstName: string;
  isBanned: boolean;
  isDeactivated: boolean;
  isVerified: boolean;
  lastName: string;
  userId: string;
}

/** 'UpdateVolunteerUserForAdmin' return type */
export interface IUpdateVolunteerUserForAdminResult {
  ok: string;
}

/** 'UpdateVolunteerUserForAdmin' query type */
export interface IUpdateVolunteerUserForAdminQuery {
  params: IUpdateVolunteerUserForAdminParams;
  result: IUpdateVolunteerUserForAdminResult;
}

const updateVolunteerUserForAdminIR: any = {"name":"updateVolunteerUserForAdmin","params":[{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28254,"b":28263,"line":1068,"col":18}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28283,"b":28291,"line":1069,"col":17}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28307,"b":28312,"line":1070,"col":13}]}},{"name":"isVerified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28331,"b":28341,"line":1071,"col":16}]}},{"name":"isBanned","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28358,"b":28366,"line":1072,"col":14}]}},{"name":"isDeactivated","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28388,"b":28401,"line":1073,"col":19}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28425,"b":28431,"line":1075,"col":16}]}}],"usedParamSet":{"firstName":true,"lastName":true,"email":true,"isVerified":true,"isBanned":true,"isDeactivated":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    first_name = :firstName!,\n    last_name = :lastName!,\n    email = :email!,\n    verified = :isVerified!,\n    banned = :isBanned!,\n    deactivated = :isDeactivated!\nWHERE\n    users.id = :userId!\nRETURNING\n    id AS ok","loc":{"a":28215,"b":28454,"line":1065,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     first_name = :firstName!,
 *     last_name = :lastName!,
 *     email = :email!,
 *     verified = :isVerified!,
 *     banned = :isBanned!,
 *     deactivated = :isDeactivated!
 * WHERE
 *     users.id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateVolunteerUserForAdmin = new PreparedQuery<IUpdateVolunteerUserForAdminParams,IUpdateVolunteerUserForAdminResult>(updateVolunteerUserForAdminIR);


/** 'UpdateVolunteerProfilesForAdmin' parameters type */
export interface IUpdateVolunteerProfilesForAdminParams {
  approved: boolean | null | void;
  partnerOrgId: string | null | void;
  userId: string;
}

/** 'UpdateVolunteerProfilesForAdmin' return type */
export interface IUpdateVolunteerProfilesForAdminResult {
  ok: string;
}

/** 'UpdateVolunteerProfilesForAdmin' query type */
export interface IUpdateVolunteerProfilesForAdminQuery {
  params: IUpdateVolunteerProfilesForAdminParams;
  result: IUpdateVolunteerProfilesForAdminResult;
}

const updateVolunteerProfilesForAdminIR: any = {"name":"updateVolunteerProfilesForAdmin","params":[{"name":"partnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28569,"b":28580,"line":1084,"col":32}]}},{"name":"approved","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28608,"b":28615,"line":1085,"col":25}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28649,"b":28655,"line":1087,"col":15}]}}],"usedParamSet":{"partnerOrgId":true,"approved":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    volunteer_partner_org_id = :partnerOrgId,\n    approved = COALESCE(:approved, approved)\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":28503,"b":28683,"line":1081,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     volunteer_partner_org_id = :partnerOrgId,
 *     approved = COALESCE(:approved, approved)
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateVolunteerProfilesForAdmin = new PreparedQuery<IUpdateVolunteerProfilesForAdminParams,IUpdateVolunteerProfilesForAdminResult>(updateVolunteerProfilesForAdminIR);


/** 'CreateVolunteerUser' parameters type */
export interface ICreateVolunteerUserParams {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  referralCode: string;
  referredBy: string | null | void;
  userId: string;
}

/** 'CreateVolunteerUser' return type */
export interface ICreateVolunteerUserResult {
  banned: boolean;
  createdAt: Date;
  deactivated: boolean;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  testUser: boolean;
}

/** 'CreateVolunteerUser' query type */
export interface ICreateVolunteerUserQuery {
  params: ICreateVolunteerUserParams;
  result: ICreateVolunteerUserResult;
}

const createVolunteerUserIR: any = {"name":"createVolunteerUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28883,"b":28889,"line":1094,"col":13}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28893,"b":28898,"line":1094,"col":23}]}},{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28902,"b":28907,"line":1094,"col":32}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28911,"b":28920,"line":1094,"col":41}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28924,"b":28932,"line":1094,"col":54}]}},{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28936,"b":28944,"line":1094,"col":66}]}},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28955,"b":28964,"line":1094,"col":85}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28968,"b":28980,"line":1094,"col":98}]}}],"usedParamSet":{"userId":true,"email":true,"phone":true,"firstName":true,"lastName":true,"password":true,"referredBy":true,"referralCode":true},"statement":{"body":"INSERT INTO users (id, email, phone, first_name, last_name, PASSWORD, verified, referred_by, referral_code, last_activity_at, created_at, updated_at)\n    VALUES (:userId!, :email!, :phone!, :firstName!, :lastName!, :password!, FALSE, :referredBy, :referralCode!, NOW(), NOW(), NOW())\nON CONFLICT (email)\n    DO NOTHING\nRETURNING\n    id, email, first_name, last_name, phone, banned, test_user, deactivated, created_at","loc":{"a":28720,"b":29135,"line":1093,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (id, email, phone, first_name, last_name, PASSWORD, verified, referred_by, referral_code, last_activity_at, created_at, updated_at)
 *     VALUES (:userId!, :email!, :phone!, :firstName!, :lastName!, :password!, FALSE, :referredBy, :referralCode!, NOW(), NOW(), NOW())
 * ON CONFLICT (email)
 *     DO NOTHING
 * RETURNING
 *     id, email, first_name, last_name, phone, banned, test_user, deactivated, created_at
 * ```
 */
export const createVolunteerUser = new PreparedQuery<ICreateVolunteerUserParams,ICreateVolunteerUserResult>(createVolunteerUserIR);


/** 'GetVolunteerPartnerOrgIdByKey' parameters type */
export interface IGetVolunteerPartnerOrgIdByKeyParams {
  volunteerPartnerOrg: string;
}

/** 'GetVolunteerPartnerOrgIdByKey' return type */
export interface IGetVolunteerPartnerOrgIdByKeyResult {
  id: string;
}

/** 'GetVolunteerPartnerOrgIdByKey' query type */
export interface IGetVolunteerPartnerOrgIdByKeyQuery {
  params: IGetVolunteerPartnerOrgIdByKeyParams;
  result: IGetVolunteerPartnerOrgIdByKeyResult;
}

const getVolunteerPartnerOrgIdByKeyIR: any = {"name":"getVolunteerPartnerOrgIdByKey","params":[{"name":"volunteerPartnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29245,"b":29264,"line":1107,"col":11}]}}],"usedParamSet":{"volunteerPartnerOrg":true},"statement":{"body":"SELECT\n    id\nFROM\n    volunteer_partner_orgs\nWHERE\n    KEY = :volunteerPartnerOrg!","loc":{"a":29182,"b":29264,"line":1102,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id
 * FROM
 *     volunteer_partner_orgs
 * WHERE
 *     KEY = :volunteerPartnerOrg!
 * ```
 */
export const getVolunteerPartnerOrgIdByKey = new PreparedQuery<IGetVolunteerPartnerOrgIdByKeyParams,IGetVolunteerPartnerOrgIdByKeyResult>(getVolunteerPartnerOrgIdByKeyIR);


/** 'CreateVolunteerProfile' parameters type */
export interface ICreateVolunteerProfileParams {
  partnerOrgId: string | null | void;
  timezone: string | null | void;
  userId: string;
}

/** 'CreateVolunteerProfile' return type */
export interface ICreateVolunteerProfileResult {
  ok: string;
}

/** 'CreateVolunteerProfile' query type */
export interface ICreateVolunteerProfileQuery {
  params: ICreateVolunteerProfileParams;
  result: ICreateVolunteerProfileResult;
}

const createVolunteerProfileIR: any = {"name":"createVolunteerProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29428,"b":29434,"line":1112,"col":13}]}},{"name":"partnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29445,"b":29456,"line":1112,"col":30}]}},{"name":"timezone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29460,"b":29467,"line":1112,"col":45}]}}],"usedParamSet":{"userId":true,"partnerOrgId":true,"timezone":true},"statement":{"body":"INSERT INTO volunteer_profiles (user_id, approved, volunteer_partner_org_id, timezone, created_at, updated_at)\n    VALUES (:userId!, FALSE, :partnerOrgId, :timezone, NOW(), NOW())\nRETURNING\n    user_id AS ok","loc":{"a":29304,"b":29510,"line":1111,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO volunteer_profiles (user_id, approved, volunteer_partner_org_id, timezone, created_at, updated_at)
 *     VALUES (:userId!, FALSE, :partnerOrgId, :timezone, NOW(), NOW())
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const createVolunteerProfile = new PreparedQuery<ICreateVolunteerProfileParams,ICreateVolunteerProfileResult>(createVolunteerProfileIR);


/** 'GetQuizzesForVolunteers' parameters type */
export interface IGetQuizzesForVolunteersParams {
  userIds: stringArray;
}

/** 'GetQuizzesForVolunteers' return type */
export interface IGetQuizzesForVolunteersResult {
  lastAttemptedAt: Date;
  name: string;
  passed: boolean;
  tries: number;
  userId: string;
}

/** 'GetQuizzesForVolunteers' query type */
export interface IGetQuizzesForVolunteersQuery {
  params: IGetQuizzesForVolunteersParams;
  result: IGetQuizzesForVolunteersResult;
}

const getQuizzesForVolunteersIR: any = {"name":"getQuizzesForVolunteers","params":[{"name":"userIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29778,"b":29785,"line":1128,"col":20}]}}],"usedParamSet":{"userIds":true},"statement":{"body":"SELECT\n    user_id,\n    attempts AS tries,\n    users_quizzes.updated_at AS last_attempted_at,\n    passed,\n    quizzes.name\nFROM\n    users_quizzes\n    JOIN quizzes ON users_quizzes.quiz_id = quizzes.id\nWHERE\n    user_id = ANY (:userIds!)","loc":{"a":29551,"b":29786,"line":1118,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     attempts AS tries,
 *     users_quizzes.updated_at AS last_attempted_at,
 *     passed,
 *     quizzes.name
 * FROM
 *     users_quizzes
 *     JOIN quizzes ON users_quizzes.quiz_id = quizzes.id
 * WHERE
 *     user_id = ANY (:userIds!)
 * ```
 */
export const getQuizzesForVolunteers = new PreparedQuery<IGetQuizzesForVolunteersParams,IGetQuizzesForVolunteersResult>(getQuizzesForVolunteersIR);


/** 'GetSubjectsForVolunteer' parameters type */
export interface IGetSubjectsForVolunteerParams {
  userId: string;
}

/** 'GetSubjectsForVolunteer' return type */
export interface IGetSubjectsForVolunteerResult {
  subject: string;
}

/** 'GetSubjectsForVolunteer' query type */
export interface IGetSubjectsForVolunteerQuery {
  params: IGetSubjectsForVolunteerParams;
  result: IGetSubjectsForVolunteerResult;
}

const getSubjectsForVolunteerIR: any = {"name":"getSubjectsForVolunteer","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":30536,"b":30542,"line":1155,"col":19}]}}],"usedParamSet":{"userId":true},"statement":{"body":"WITH subject_cert_total AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n)\nSELECT\n    subjects_unlocked.subject\nFROM (\n    SELECT\n        subjects.name AS subject,\n        COUNT(*)::int AS earned_certs,\n        subject_cert_total.total\n    FROM\n        users_certifications\n        JOIN certification_subject_unlocks USING (certification_id)\n        JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n        JOIN subject_cert_total ON subject_cert_total.name = subjects.name\n    WHERE\n        user_id = :userId!\n    GROUP BY\n        subjects.name, subject_cert_total.total\n    HAVING\n        COUNT(*)::int >= subject_cert_total.total) AS subjects_unlocked","loc":{"a":29827,"b":30686,"line":1132,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH subject_cert_total AS (
 *     SELECT
 *         subjects.name,
 *         COUNT(*)::int AS total
 *     FROM
 *         certification_subject_unlocks
 *         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *     GROUP BY
 *         subjects.name
 * )
 * SELECT
 *     subjects_unlocked.subject
 * FROM (
 *     SELECT
 *         subjects.name AS subject,
 *         COUNT(*)::int AS earned_certs,
 *         subject_cert_total.total
 *     FROM
 *         users_certifications
 *         JOIN certification_subject_unlocks USING (certification_id)
 *         JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *         JOIN subject_cert_total ON subject_cert_total.name = subjects.name
 *     WHERE
 *         user_id = :userId!
 *     GROUP BY
 *         subjects.name, subject_cert_total.total
 *     HAVING
 *         COUNT(*)::int >= subject_cert_total.total) AS subjects_unlocked
 * ```
 */
export const getSubjectsForVolunteer = new PreparedQuery<IGetSubjectsForVolunteerParams,IGetSubjectsForVolunteerResult>(getSubjectsForVolunteerIR);


/** 'GetNextVolunteerToNotify' parameters type */
export interface IGetNextVolunteerToNotifyParams {
  disqualifiedVolunteers: stringArray | null | void;
  favoriteVolunteers: stringArray | null | void;
  highLevelSubjects: stringArray | null | void;
  isPartner: boolean | null | void;
  lastNotified: Date;
  specificPartner: string | null | void;
  subject: string;
}

/** 'GetNextVolunteerToNotify' return type */
export interface IGetNextVolunteerToNotifyResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetNextVolunteerToNotify' query type */
export interface IGetNextVolunteerToNotifyQuery {
  params: IGetNextVolunteerToNotifyParams;
  result: IGetNextVolunteerToNotifyResult;
}

const getNextVolunteerToNotifyIR: any = {"name":"getNextVolunteerToNotify","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":32915,"b":32922,"line":1214,"col":13}]}},{"name":"highLevelSubjects","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33041,"b":33057,"line":1216,"col":14},{"a":33093,"b":33109,"line":1217,"col":17}]}},{"name":"disqualifiedVolunteers","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33275,"b":33296,"line":1219,"col":14},{"a":33351,"b":33372,"line":1220,"col":36}]}},{"name":"favoriteVolunteers","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33436,"b":33453,"line":1222,"col":14},{"a":33504,"b":33521,"line":1223,"col":32}]}},{"name":"isPartner","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33580,"b":33588,"line":1225,"col":14},{"a":33625,"b":33633,"line":1226,"col":17},{"a":33734,"b":33742,"line":1228,"col":17}]}},{"name":"specificPartner","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33845,"b":33859,"line":1230,"col":15},{"a":33921,"b":33935,"line":1231,"col":45}]}},{"name":"lastNotified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":34138,"b":34150,"line":1239,"col":32}]}}],"usedParamSet":{"subject":true,"highLevelSubjects":true,"disqualifiedVolunteers":true,"favoriteVolunteers":true,"isPartner":true,"specificPartner":true,"lastNotified":true},"statement":{"body":"WITH subject_totals AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n),\ncandidates AS (\n    SELECT\n        users.id,\n        first_name,\n        last_name,\n        phone,\n        email,\n        volunteer_partner_orgs.key AS volunteer_partner_org\n    FROM\n        users\n        JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n        JOIN availabilities ON users.id = availabilities.user_id\n        JOIN weekdays ON weekdays.id = availabilities.weekday_id\n        LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n        LEFT JOIN LATERAL (\n            SELECT\n                array_agg(sub_unlocked.subject)::text[] AS subjects\n            FROM (\n                SELECT\n                    subjects.name AS subject\n                FROM\n                    users_certifications\n                    JOIN certification_subject_unlocks USING (certification_id)\n                    JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                    JOIN subject_totals ON subject_totals.name = subjects.name\n                WHERE\n                    users_certifications.user_id = users.id\n                GROUP BY\n                    user_id, subjects.name, subject_totals.total\n                HAVING\n                    COUNT(*)::int >= subject_totals.total) AS sub_unlocked) AS subjects_unlocked ON TRUE\n    WHERE\n        test_user IS FALSE\n        AND banned IS FALSE\n        AND deactivated IS FALSE\n        AND volunteer_profiles.onboarded IS TRUE\n        AND volunteer_profiles.approved IS TRUE\n        -- availabilities are all stored in EST so convert server time to EST to be safe\n        AND TRIM(BOTH FROM to_char(NOW() at time zone 'America/New_York', 'Day')) = weekdays.day\n        AND extract(hour FROM (NOW() at time zone 'America/New_York')) >= availabilities.available_start\n        AND extract(hour FROM (NOW() at time zone 'America/New_York')) < availabilities.available_end\n        AND :subject! = ANY (subjects_unlocked.subjects)\n        AND ( -- user does not have high level subjects if provided\n            (:highLevelSubjects)::text[] IS NULL\n            OR (:highLevelSubjects)::text[] && subjects_unlocked.subjects IS FALSE)\n        AND ( -- user is not part of disqualified group (like active session volunteers) if provided\n            (:disqualifiedVolunteers)::uuid[] IS NULL\n            OR NOT users.id = ANY (:disqualifiedVolunteers))\n        AND ( -- user is a favorite volunteer\n            (:favoriteVolunteers)::uuid[] IS NULL\n            OR users.id = ANY (:favoriteVolunteers))\n        AND ( -- user is partner or open\n            (:isPartner)::boolean IS NULL\n            OR (:isPartner IS FALSE\n                AND volunteer_profiles.volunteer_partner_org_id IS NULL)\n            OR (:isPartner IS TRUE\n                AND NOT volunteer_profiles.volunteer_partner_org_id IS NULL))\n        AND ((:specificPartner)::text IS NULL\n            OR volunteer_partner_orgs.key = :specificPartner)\n        AND NOT EXISTS (\n            SELECT\n                user_id\n            FROM\n                notifications\n            WHERE\n                user_id = users.id\n                AND sent_at >= :lastNotified!))\nSELECT\n    *\nFROM\n    candidates\nORDER BY\n    RANDOM()\nLIMIT 1","loc":{"a":30728,"b":34215,"line":1163,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH subject_totals AS (
 *     SELECT
 *         subjects.name,
 *         COUNT(*)::int AS total
 *     FROM
 *         certification_subject_unlocks
 *         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *     GROUP BY
 *         subjects.name
 * ),
 * candidates AS (
 *     SELECT
 *         users.id,
 *         first_name,
 *         last_name,
 *         phone,
 *         email,
 *         volunteer_partner_orgs.key AS volunteer_partner_org
 *     FROM
 *         users
 *         JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *         JOIN availabilities ON users.id = availabilities.user_id
 *         JOIN weekdays ON weekdays.id = availabilities.weekday_id
 *         LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *         LEFT JOIN LATERAL (
 *             SELECT
 *                 array_agg(sub_unlocked.subject)::text[] AS subjects
 *             FROM (
 *                 SELECT
 *                     subjects.name AS subject
 *                 FROM
 *                     users_certifications
 *                     JOIN certification_subject_unlocks USING (certification_id)
 *                     JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *                     JOIN subject_totals ON subject_totals.name = subjects.name
 *                 WHERE
 *                     users_certifications.user_id = users.id
 *                 GROUP BY
 *                     user_id, subjects.name, subject_totals.total
 *                 HAVING
 *                     COUNT(*)::int >= subject_totals.total) AS sub_unlocked) AS subjects_unlocked ON TRUE
 *     WHERE
 *         test_user IS FALSE
 *         AND banned IS FALSE
 *         AND deactivated IS FALSE
 *         AND volunteer_profiles.onboarded IS TRUE
 *         AND volunteer_profiles.approved IS TRUE
 *         -- availabilities are all stored in EST so convert server time to EST to be safe
 *         AND TRIM(BOTH FROM to_char(NOW() at time zone 'America/New_York', 'Day')) = weekdays.day
 *         AND extract(hour FROM (NOW() at time zone 'America/New_York')) >= availabilities.available_start
 *         AND extract(hour FROM (NOW() at time zone 'America/New_York')) < availabilities.available_end
 *         AND :subject! = ANY (subjects_unlocked.subjects)
 *         AND ( -- user does not have high level subjects if provided
 *             (:highLevelSubjects)::text[] IS NULL
 *             OR (:highLevelSubjects)::text[] && subjects_unlocked.subjects IS FALSE)
 *         AND ( -- user is not part of disqualified group (like active session volunteers) if provided
 *             (:disqualifiedVolunteers)::uuid[] IS NULL
 *             OR NOT users.id = ANY (:disqualifiedVolunteers))
 *         AND ( -- user is a favorite volunteer
 *             (:favoriteVolunteers)::uuid[] IS NULL
 *             OR users.id = ANY (:favoriteVolunteers))
 *         AND ( -- user is partner or open
 *             (:isPartner)::boolean IS NULL
 *             OR (:isPartner IS FALSE
 *                 AND volunteer_profiles.volunteer_partner_org_id IS NULL)
 *             OR (:isPartner IS TRUE
 *                 AND NOT volunteer_profiles.volunteer_partner_org_id IS NULL))
 *         AND ((:specificPartner)::text IS NULL
 *             OR volunteer_partner_orgs.key = :specificPartner)
 *         AND NOT EXISTS (
 *             SELECT
 *                 user_id
 *             FROM
 *                 notifications
 *             WHERE
 *                 user_id = users.id
 *                 AND sent_at >= :lastNotified!))
 * SELECT
 *     *
 * FROM
 *     candidates
 * ORDER BY
 *     RANDOM()
 * LIMIT 1
 * ```
 */
export const getNextVolunteerToNotify = new PreparedQuery<IGetNextVolunteerToNotifyParams,IGetNextVolunteerToNotifyResult>(getNextVolunteerToNotifyIR);


/** 'GetVolunteerForScheduleUpdate' parameters type */
export interface IGetVolunteerForScheduleUpdateParams {
  userId: string;
}

/** 'GetVolunteerForScheduleUpdate' return type */
export interface IGetVolunteerForScheduleUpdateResult {
  id: string;
  onboarded: boolean;
  passedRequiredTraining: boolean | null;
  subjects: stringArray | null;
  volunteerPartnerOrg: string;
}

/** 'GetVolunteerForScheduleUpdate' query type */
export interface IGetVolunteerForScheduleUpdateQuery {
  params: IGetVolunteerForScheduleUpdateParams;
  result: IGetVolunteerForScheduleUpdateResult;
}

const getVolunteerForScheduleUpdateIR: any = {"name":"getVolunteerForScheduleUpdate","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":36248,"b":36254,"line":1299,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    volunteer_profiles.onboarded,\n    subjects_unlocked.subjects,\n    COALESCE(training_quizzes.passed, FALSE) AS passed_required_training\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(sub_unlocked.subject) AS subjects\n        FROM (\n            SELECT\n                user_id,\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_total.total\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        certification_subject_unlocks\n                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_total ON subject_total.name = subjects.name\n                WHERE\n                    users_certifications.user_id = users.id\n                GROUP BY\n                    user_id,\n                    subjects.name,\n                    subject_total.total\n                HAVING\n                    COUNT(*)::int >= subject_total.total) AS sub_unlocked) AS subjects_unlocked ON TRUE\n    LEFT JOIN (\n        SELECT\n            passed,\n            user_id\n        FROM\n            users_quizzes\n            JOIN quizzes ON users_quizzes.quiz_id = quizzes.id\n        WHERE\n            quizzes.name = 'upchieve101') AS training_quizzes ON training_quizzes.user_id = volunteer_profiles.user_id\nWHERE\n    users.id = :userId!\nLIMIT 1","loc":{"a":34262,"b":36262,"line":1250,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     volunteer_profiles.onboarded,
 *     subjects_unlocked.subjects,
 *     COALESCE(training_quizzes.passed, FALSE) AS passed_required_training
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(sub_unlocked.subject) AS subjects
 *         FROM (
 *             SELECT
 *                 user_id,
 *                 subjects.name AS subject,
 *                 COUNT(*)::int AS earned_certs,
 *                 subject_total.total
 *             FROM
 *                 users_certifications
 *                 JOIN certification_subject_unlocks USING (certification_id)
 *                 JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *                 JOIN (
 *                     SELECT
 *                         subjects.name, COUNT(*)::int AS total
 *                     FROM
 *                         certification_subject_unlocks
 *                         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *                     GROUP BY
 *                         subjects.name) AS subject_total ON subject_total.name = subjects.name
 *                 WHERE
 *                     users_certifications.user_id = users.id
 *                 GROUP BY
 *                     user_id,
 *                     subjects.name,
 *                     subject_total.total
 *                 HAVING
 *                     COUNT(*)::int >= subject_total.total) AS sub_unlocked) AS subjects_unlocked ON TRUE
 *     LEFT JOIN (
 *         SELECT
 *             passed,
 *             user_id
 *         FROM
 *             users_quizzes
 *             JOIN quizzes ON users_quizzes.quiz_id = quizzes.id
 *         WHERE
 *             quizzes.name = 'upchieve101') AS training_quizzes ON training_quizzes.user_id = volunteer_profiles.user_id
 * WHERE
 *     users.id = :userId!
 * LIMIT 1
 * ```
 */
export const getVolunteerForScheduleUpdate = new PreparedQuery<IGetVolunteerForScheduleUpdateParams,IGetVolunteerForScheduleUpdateResult>(getVolunteerForScheduleUpdateIR);


/** 'GetVolunteersOnDeck' parameters type */
export interface IGetVolunteersOnDeckParams {
  excludedIds: stringArray;
  subject: string;
}

/** 'GetVolunteersOnDeck' return type */
export interface IGetVolunteersOnDeckResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetVolunteersOnDeck' query type */
export interface IGetVolunteersOnDeckQuery {
  params: IGetVolunteersOnDeckParams;
  result: IGetVolunteersOnDeckResult;
}

const getVolunteersOnDeckIR: any = {"name":"getVolunteersOnDeck","params":[{"name":"excludedIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":38125,"b":38136,"line":1350,"col":29}]}},{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":38474,"b":38481,"line":1354,"col":37}]}}],"usedParamSet":{"excludedIds":true,"subject":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN availabilities ON users.id = availabilities.user_id\n    JOIN weekdays ON weekdays.id = availabilities.weekday_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    JOIN (\n        SELECT\n            sub_unlocked.user_id,\n            subjects.name AS subject\n        FROM (\n            SELECT\n                user_id,\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_total.total\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        certification_subject_unlocks\n                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_total ON subject_total.name = subjects.name\n                GROUP BY\n                    user_id,\n                    subjects.name,\n                    subject_total.total\n                HAVING\n                    COUNT(*)::int >= subject_total.total) AS sub_unlocked\n                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id\nWHERE\n    test_user IS FALSE\n    AND banned IS FALSE\n    AND deactivated IS FALSE\n    AND NOT users.id = ANY (:excludedIds!)\nAND TRIM(BOTH FROM to_char(NOW() at time zone 'America/New_York', 'Day')) = weekdays.day\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end\n    AND subjects_unlocked.subject = :subject!","loc":{"a":36299,"b":38481,"line":1304,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     JOIN availabilities ON users.id = availabilities.user_id
 *     JOIN weekdays ON weekdays.id = availabilities.weekday_id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     JOIN (
 *         SELECT
 *             sub_unlocked.user_id,
 *             subjects.name AS subject
 *         FROM (
 *             SELECT
 *                 user_id,
 *                 subjects.name AS subject,
 *                 COUNT(*)::int AS earned_certs,
 *                 subject_total.total
 *             FROM
 *                 users_certifications
 *                 JOIN certification_subject_unlocks USING (certification_id)
 *                 JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *                 JOIN (
 *                     SELECT
 *                         subjects.name, COUNT(*)::int AS total
 *                     FROM
 *                         certification_subject_unlocks
 *                         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *                     GROUP BY
 *                         subjects.name) AS subject_total ON subject_total.name = subjects.name
 *                 GROUP BY
 *                     user_id,
 *                     subjects.name,
 *                     subject_total.total
 *                 HAVING
 *                     COUNT(*)::int >= subject_total.total) AS sub_unlocked
 *                 JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id
 * WHERE
 *     test_user IS FALSE
 *     AND banned IS FALSE
 *     AND deactivated IS FALSE
 *     AND NOT users.id = ANY (:excludedIds!)
 * AND TRIM(BOTH FROM to_char(NOW() at time zone 'America/New_York', 'Day')) = weekdays.day
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end
 *     AND subjects_unlocked.subject = :subject!
 * ```
 */
export const getVolunteersOnDeck = new PreparedQuery<IGetVolunteersOnDeckParams,IGetVolunteersOnDeckResult>(getVolunteersOnDeckIR);


/** 'GetUniqueStudentsHelpedForAnalyticsReportSummary' parameters type */
export interface IGetUniqueStudentsHelpedForAnalyticsReportSummaryParams {
  end: Date;
  start: Date;
  studentPartnerOrgIds: stringArray;
  studentSchoolIds: stringArray;
  volunteerPartnerOrg: string;
}

/** 'GetUniqueStudentsHelpedForAnalyticsReportSummary' return type */
export interface IGetUniqueStudentsHelpedForAnalyticsReportSummaryResult {
  totalUniquePartnerStudentsHelped: number | null;
  totalUniquePartnerStudentsHelpedWithinRange: number | null;
  totalUniqueStudentsHelped: number | null;
  totalUniqueStudentsHelpedWithinRange: number | null;
}

/** 'GetUniqueStudentsHelpedForAnalyticsReportSummary' query type */
export interface IGetUniqueStudentsHelpedForAnalyticsReportSummaryQuery {
  params: IGetUniqueStudentsHelpedForAnalyticsReportSummaryParams;
  result: IGetUniqueStudentsHelpedForAnalyticsReportSummaryResult;
}

const getUniqueStudentsHelpedForAnalyticsReportSummaryIR: any = {"name":"getUniqueStudentsHelpedForAnalyticsReportSummary","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":38707,"b":38712,"line":1360,"col":62},{"a":39304,"b":39309,"line":1372,"col":62}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":38758,"b":38761,"line":1361,"col":44},{"a":39355,"b":39358,"line":1373,"col":44}]}},{"name":"studentPartnerOrgIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":39000,"b":39020,"line":1366,"col":86},{"a":39429,"b":39449,"line":1374,"col":69}]}},{"name":"studentSchoolIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":39077,"b":39093,"line":1367,"col":54},{"a":39510,"b":39526,"line":1375,"col":58}]}},{"name":"volunteerPartnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":40026,"b":40045,"line":1386,"col":34}]}}],"usedParamSet":{"start":true,"end":true,"studentPartnerOrgIds":true,"studentSchoolIds":true,"volunteerPartnerOrg":true},"statement":{"body":"SELECT\n    COALESCE(COUNT(DISTINCT sessions.student_id), 0)::int AS total_unique_students_helped,\n    COALESCE(COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                AND sessions.created_at <= :end! THEN\n                sessions.student_id\n            ELSE\n                NULL\n            END), 0)::int AS total_unique_students_helped_within_range,\n    COALESCE(COUNT(DISTINCT CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                sessions.student_id\n            ELSE\n                NULL\n            END), 0)::int AS total_unique_partner_students_helped,\n    COALESCE(COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                AND sessions.created_at <= :end!\n                AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                sessions.student_id\n            ELSE\n                NULL\n            END), 0)::int AS total_unique_partner_students_helped_within_range\nFROM\n    volunteer_partner_orgs\n    LEFT JOIN volunteer_profiles ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN sessions ON volunteer_profiles.user_id = sessions.volunteer_id\n    LEFT JOIN student_profiles ON sessions.student_id = student_profiles.user_id\nWHERE\n    volunteer_partner_orgs.key = :volunteerPartnerOrg!","loc":{"a":38547,"b":40045,"line":1358,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     COALESCE(COUNT(DISTINCT sessions.student_id), 0)::int AS total_unique_students_helped,
 *     COALESCE(COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!
 *                 AND sessions.created_at <= :end! THEN
 *                 sessions.student_id
 *             ELSE
 *                 NULL
 *             END), 0)::int AS total_unique_students_helped_within_range,
 *     COALESCE(COUNT(DISTINCT CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
 *                 OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN
 *                 sessions.student_id
 *             ELSE
 *                 NULL
 *             END), 0)::int AS total_unique_partner_students_helped,
 *     COALESCE(COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!
 *                 AND sessions.created_at <= :end!
 *                 AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
 *                     OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN
 *                 sessions.student_id
 *             ELSE
 *                 NULL
 *             END), 0)::int AS total_unique_partner_students_helped_within_range
 * FROM
 *     volunteer_partner_orgs
 *     LEFT JOIN volunteer_profiles ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN sessions ON volunteer_profiles.user_id = sessions.volunteer_id
 *     LEFT JOIN student_profiles ON sessions.student_id = student_profiles.user_id
 * WHERE
 *     volunteer_partner_orgs.key = :volunteerPartnerOrg!
 * ```
 */
export const getUniqueStudentsHelpedForAnalyticsReportSummary = new PreparedQuery<IGetUniqueStudentsHelpedForAnalyticsReportSummaryParams,IGetUniqueStudentsHelpedForAnalyticsReportSummaryResult>(getUniqueStudentsHelpedForAnalyticsReportSummaryIR);


/** 'GetVolunteersForAnalyticsReport' parameters type */
export interface IGetVolunteersForAnalyticsReportParams {
  end: Date;
  start: Date;
  studentPartnerOrgIds: stringArray;
  studentSchoolIds: stringArray;
  volunteerPartnerOrg: string;
}

/** 'GetVolunteersForAnalyticsReport' return type */
export interface IGetVolunteersForAnalyticsReportResult {
  availabilityLastModifiedAt: Date | null;
  createdAt: Date;
  dateOnboarded: Date;
  email: string;
  firstName: string;
  isOnboarded: boolean;
  lastName: string;
  state: string | null;
  totalNotifications: number | null;
  totalNotificationsWithinRange: number | null;
  totalPartnerSessions: number | null;
  totalPartnerSessionsWithinRange: number | null;
  totalPartnerTimeTutored: string | null;
  totalPartnerTimeTutoredWithinRange: string | null;
  totalQuizzesPassed: number | null;
  totalSessions: number | null;
  totalSessionsWithinRange: number | null;
  totalUniquePartnerStudentsHelped: number | null;
  totalUniquePartnerStudentsHelpedWithinRange: number | null;
  totalUniqueStudentsHelped: number | null;
  totalUniqueStudentsHelpedWithinRange: number | null;
  userId: string;
}

/** 'GetVolunteersForAnalyticsReport' query type */
export interface IGetVolunteersForAnalyticsReportQuery {
  params: IGetVolunteersForAnalyticsReportParams;
  result: IGetVolunteersForAnalyticsReportResult;
}

const getVolunteersForAnalyticsReportIR: any = {"name":"getVolunteersForAnalyticsReport","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":42843,"b":42848,"line":1447,"col":61},{"a":43461,"b":43466,"line":1459,"col":61},{"a":43937,"b":43942,"line":1468,"col":50},{"a":44506,"b":44511,"line":1482,"col":50},{"a":45288,"b":45293,"line":1498,"col":50},{"a":46021,"b":46026,"line":1515,"col":38}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":42898,"b":42901,"line":1448,"col":48},{"a":43516,"b":43519,"line":1460,"col":48},{"a":43992,"b":43995,"line":1469,"col":48},{"a":44561,"b":44564,"line":1483,"col":48},{"a":45343,"b":45346,"line":1499,"col":48},{"a":46064,"b":46067,"line":1516,"col":36}]}},{"name":"studentPartnerOrgIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":43142,"b":43162,"line":1453,"col":85},{"a":43594,"b":43614,"line":1461,"col":73},{"a":44216,"b":44236,"line":1475,"col":74},{"a":44639,"b":44659,"line":1484,"col":73},{"a":44971,"b":44991,"line":1491,"col":74},{"a":45421,"b":45441,"line":1500,"col":73}]}},{"name":"studentSchoolIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":43223,"b":43239,"line":1454,"col":58},{"a":43679,"b":43695,"line":1462,"col":62},{"a":44297,"b":44313,"line":1476,"col":58},{"a":44724,"b":44740,"line":1485,"col":62},{"a":45052,"b":45068,"line":1492,"col":58},{"a":45506,"b":45522,"line":1501,"col":62}]}},{"name":"volunteerPartnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":46367,"b":46386,"line":1526,"col":34}]}}],"usedParamSet":{"start":true,"end":true,"studentPartnerOrgIds":true,"studentSchoolIds":true,"volunteerPartnerOrg":true},"statement":{"body":"SELECT\n    users.id AS user_id,\n    users.first_name AS first_name,\n    users.last_name AS last_name,\n    users.email AS email,\n    users.created_at AS created_at,\n    volunteer_profiles.state AS state,\n    volunteer_profiles.onboarded AS is_onboarded,\n    user_actions.created_at AS date_onboarded,\n    COALESCE(users_quizzes.total, 0) AS total_quizzes_passed,\n    availabilities.updated_at AS availability_last_modified_at,\n    COALESCE(sessions_stats.total_unique_students_helped, 0) AS total_unique_students_helped,\n    COALESCE(sessions_stats.total_unique_students_helped_within_range, 0) AS total_unique_students_helped_within_range,\n    COALESCE(sessions_stats.total_unique_partner_students_helped, 0) AS total_unique_partner_students_helped,\n    COALESCE(sessions_stats.total_unique_partner_students_helped_within_range, 0) AS total_unique_partner_students_helped_within_range,\n    COALESCE(sessions_stats.total_sessions, 0) AS total_sessions,\n    COALESCE(sessions_stats.total_sessions_within_range, 0) AS total_sessions_within_range,\n    COALESCE(sessions_stats.total_partner_sessions, 0) AS total_partner_sessions,\n    COALESCE(sessions_stats.total_partner_sessions_within_range, 0) AS total_partner_sessions_within_range,\n    COALESCE(sessions_stats.total_partner_time_tutored, 0) AS total_partner_time_tutored,\n    COALESCE(sessions_stats.total_partner_time_tutored_within_range, 0) AS total_partner_time_tutored_within_range,\n    COALESCE(notifications_stats.total, 0) AS total_notifications,\n    COALESCE(notifications_stats.total_within_range, 0) AS total_notifications_within_range\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id\n    LEFT JOIN (\n        SELECT\n            COUNT(*)::int AS total,\n            user_id\n        FROM\n            users_quizzes\n        WHERE\n            passed = TRUE\n        GROUP BY\n            user_id) AS users_quizzes ON users_quizzes.user_id = volunteer_profiles.user_id\n    LEFT JOIN (\n        SELECT\n            MAX(updated_at) AS updated_at,\n            user_id\n        FROM\n            availabilities\n        GROUP BY\n            user_id) AS availabilities ON availabilities.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            created_at,\n            user_id\n        FROM\n            user_actions\n        WHERE\n            action = 'ONBOARDED') AS user_actions ON user_actions.user_id = volunteer_profiles.user_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total_sessions,\n            COUNT(DISTINCT student_id)::int AS total_unique_students_helped,\n            COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end! THEN\n                    student_id\n                ELSE\n                    NULL\n                END)::int AS total_unique_students_helped_within_range,\n            COUNT(DISTINCT CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                    sessions.student_id\n                ELSE\n                    NULL\n                END)::int AS total_unique_partner_students_helped,\n            COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end!\n                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                    sessions.student_id\n                ELSE\n                    NULL\n                END)::int AS total_unique_partner_students_helped_within_range,\n            SUM(\n                CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end! THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_sessions_within_range,\n            SUM(\n                CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_partner_sessions,\n            SUM(\n                CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end!\n                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_partner_sessions_within_range,\n            SUM(\n                CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                    sessions.time_tutored\n                ELSE\n                    0\n                END)::bigint AS total_partner_time_tutored,\n            SUM(\n                CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end!\n                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                    sessions.time_tutored\n                ELSE\n                    0\n                END)::bigint AS total_partner_time_tutored_within_range\n        FROM\n            sessions\n    LEFT JOIN student_profiles ON sessions.student_id = student_profiles.user_id\nWHERE\n    volunteer_profiles.user_id = sessions.volunteer_id) AS sessions_stats ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total,\n            SUM(\n                CASE WHEN sent_at >= :start!\n                    AND sent_at <= :end! THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_within_range\n        FROM\n            notifications\n    WHERE\n        volunteer_profiles.user_id = notifications.user_id) AS notifications_stats ON TRUE\nWHERE\n    volunteer_partner_orgs.key = :volunteerPartnerOrg!\nORDER BY\n    users.created_at DESC","loc":{"a":40094,"b":46421,"line":1390,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id AS user_id,
 *     users.first_name AS first_name,
 *     users.last_name AS last_name,
 *     users.email AS email,
 *     users.created_at AS created_at,
 *     volunteer_profiles.state AS state,
 *     volunteer_profiles.onboarded AS is_onboarded,
 *     user_actions.created_at AS date_onboarded,
 *     COALESCE(users_quizzes.total, 0) AS total_quizzes_passed,
 *     availabilities.updated_at AS availability_last_modified_at,
 *     COALESCE(sessions_stats.total_unique_students_helped, 0) AS total_unique_students_helped,
 *     COALESCE(sessions_stats.total_unique_students_helped_within_range, 0) AS total_unique_students_helped_within_range,
 *     COALESCE(sessions_stats.total_unique_partner_students_helped, 0) AS total_unique_partner_students_helped,
 *     COALESCE(sessions_stats.total_unique_partner_students_helped_within_range, 0) AS total_unique_partner_students_helped_within_range,
 *     COALESCE(sessions_stats.total_sessions, 0) AS total_sessions,
 *     COALESCE(sessions_stats.total_sessions_within_range, 0) AS total_sessions_within_range,
 *     COALESCE(sessions_stats.total_partner_sessions, 0) AS total_partner_sessions,
 *     COALESCE(sessions_stats.total_partner_sessions_within_range, 0) AS total_partner_sessions_within_range,
 *     COALESCE(sessions_stats.total_partner_time_tutored, 0) AS total_partner_time_tutored,
 *     COALESCE(sessions_stats.total_partner_time_tutored_within_range, 0) AS total_partner_time_tutored_within_range,
 *     COALESCE(notifications_stats.total, 0) AS total_notifications,
 *     COALESCE(notifications_stats.total_within_range, 0) AS total_notifications_within_range
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id
 *     LEFT JOIN (
 *         SELECT
 *             COUNT(*)::int AS total,
 *             user_id
 *         FROM
 *             users_quizzes
 *         WHERE
 *             passed = TRUE
 *         GROUP BY
 *             user_id) AS users_quizzes ON users_quizzes.user_id = volunteer_profiles.user_id
 *     LEFT JOIN (
 *         SELECT
 *             MAX(updated_at) AS updated_at,
 *             user_id
 *         FROM
 *             availabilities
 *         GROUP BY
 *             user_id) AS availabilities ON availabilities.user_id = users.id
 *     LEFT JOIN (
 *         SELECT
 *             created_at,
 *             user_id
 *         FROM
 *             user_actions
 *         WHERE
 *             action = 'ONBOARDED') AS user_actions ON user_actions.user_id = volunteer_profiles.user_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(*)::int AS total_sessions,
 *             COUNT(DISTINCT student_id)::int AS total_unique_students_helped,
 *             COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!
 *                     AND sessions.created_at <= :end! THEN
 *                     student_id
 *                 ELSE
 *                     NULL
 *                 END)::int AS total_unique_students_helped_within_range,
 *             COUNT(DISTINCT CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
 *                     OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN
 *                     sessions.student_id
 *                 ELSE
 *                     NULL
 *                 END)::int AS total_unique_partner_students_helped,
 *             COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!
 *                     AND sessions.created_at <= :end!
 *                     AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
 *                         OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN
 *                     sessions.student_id
 *                 ELSE
 *                     NULL
 *                 END)::int AS total_unique_partner_students_helped_within_range,
 *             SUM(
 *                 CASE WHEN sessions.created_at >= :start!
 *                     AND sessions.created_at <= :end! THEN
 *                     1
 *                 ELSE
 *                     0
 *                 END)::int AS total_sessions_within_range,
 *             SUM(
 *                 CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
 *                     OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN
 *                     1
 *                 ELSE
 *                     0
 *                 END)::int AS total_partner_sessions,
 *             SUM(
 *                 CASE WHEN sessions.created_at >= :start!
 *                     AND sessions.created_at <= :end!
 *                     AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
 *                         OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN
 *                     1
 *                 ELSE
 *                     0
 *                 END)::int AS total_partner_sessions_within_range,
 *             SUM(
 *                 CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
 *                     OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN
 *                     sessions.time_tutored
 *                 ELSE
 *                     0
 *                 END)::bigint AS total_partner_time_tutored,
 *             SUM(
 *                 CASE WHEN sessions.created_at >= :start!
 *                     AND sessions.created_at <= :end!
 *                     AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
 *                         OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN
 *                     sessions.time_tutored
 *                 ELSE
 *                     0
 *                 END)::bigint AS total_partner_time_tutored_within_range
 *         FROM
 *             sessions
 *     LEFT JOIN student_profiles ON sessions.student_id = student_profiles.user_id
 * WHERE
 *     volunteer_profiles.user_id = sessions.volunteer_id) AS sessions_stats ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(*)::int AS total,
 *             SUM(
 *                 CASE WHEN sent_at >= :start!
 *                     AND sent_at <= :end! THEN
 *                     1
 *                 ELSE
 *                     0
 *                 END)::int AS total_within_range
 *         FROM
 *             notifications
 *     WHERE
 *         volunteer_profiles.user_id = notifications.user_id) AS notifications_stats ON TRUE
 * WHERE
 *     volunteer_partner_orgs.key = :volunteerPartnerOrg!
 * ORDER BY
 *     users.created_at DESC
 * ```
 */
export const getVolunteersForAnalyticsReport = new PreparedQuery<IGetVolunteersForAnalyticsReportParams,IGetVolunteersForAnalyticsReportResult>(getVolunteersForAnalyticsReportIR);


