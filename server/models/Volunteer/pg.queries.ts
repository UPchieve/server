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

const getVolunteerContactInfoByIdsIR: any = {"name":"getVolunteerContactInfoByIds","params":[{"name":"userIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":901,"b":908,"line":33,"col":21}]}}],"usedParamSet":{"userIds":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.id = ANY (:userIds!)\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE","loc":{"a":543,"b":1007,"line":21,"col":0}}};

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

const getVolunteersForBlackoutOverIR: any = {"name":"getVolunteersForBlackoutOver","params":[{"name":"startDate","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1415,"b":1424,"line":52,"col":30}]}}],"usedParamSet":{"startDate":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.last_activity_at < :startDate!\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE","loc":{"a":1053,"b":1522,"line":40,"col":0}}};

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

const getVolunteerForQuickTipsIR: any = {"name":"getVolunteerForQuickTips","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1914,"b":1919,"line":70,"col":25}]}},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1952,"b":1962,"line":71,"col":31}]}}],"usedParamSet":{"userId":true,"mongoUserId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE (users.id::uuid = :userId\n    OR users.mongo_id::text = :mongoUserId)\nAND volunteer_profiles.onboarded IS TRUE\nAND users.banned IS FALSE\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE","loc":{"a":1563,"b":2090,"line":59,"col":0}}};

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

const getPartnerVolunteerForLowHoursIR: any = {"name":"getPartnerVolunteerForLowHours","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2615,"b":2620,"line":96,"col":37},{"a":2674,"b":2679,"line":97,"col":25}]}},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2712,"b":2722,"line":98,"col":31}]}}],"usedParamSet":{"userId":true,"mongoUserId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = :userId) AS total_sessions ON TRUE\nWHERE (users.id::uuid = :userId\n    OR users.mongo_id::text = :mongoUserId)\nAND volunteer_profiles.onboarded IS TRUE\nAND volunteer_profiles.volunteer_partner_org_id IS NOT NULL\nAND users.banned IS FALSE\nAND users.deactivated IS FALSE\nAND total_sessions.total > 0\nAND users.test_user IS FALSE","loc":{"a":2138,"b":2939,"line":79,"col":0}}};

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

const getVolunteersForWeeklyHourSummaryIR: any = {"name":"getVolunteersForWeeklyHourSummary","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    sent_hour_summary_intro_email\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id\nWHERE (volunteer_partner_orgs.id IS NULL\n    OR volunteer_partner_orgs.receive_weekly_hour_summary_email IS TRUE)\nAND users.banned IS FALSE\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE\nGROUP BY\n    users.id,\n    volunteer_partner_org,\n    sent_hour_summary_intro_email","loc":{"a":2990,"b":3707,"line":108,"col":0}}};

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

const updateVolunteerHourSummaryIntroByIdIR: any = {"name":"updateVolunteerHourSummaryIntroById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3880,"b":3886,"line":139,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_hour_summary_intro_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":3760,"b":3914,"line":133,"col":0}}};

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

const updateVolunteerThroughAvailabilityIR: any = {"name":"updateVolunteerThroughAvailability","params":[{"name":"timezone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4025,"b":4032,"line":148,"col":25}]}},{"name":"onboarded","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4072,"b":4080,"line":149,"col":26}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4139,"b":4145,"line":152,"col":15}]}}],"usedParamSet":{"timezone":true,"onboarded":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    timezone = COALESCE(:timezone, timezone),\n    onboarded = COALESCE(:onboarded, onboarded),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":3966,"b":4173,"line":145,"col":0}}};

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

const getVolunteerIdsForElapsedAvailabilityIR: any = {"name":"getVolunteerIdsForElapsedAvailability","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    user_id\nFROM\n    volunteer_profiles\n    JOIN users ON volunteer_profiles.user_id = users.id\nWHERE\n    users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE","loc":{"a":4228,"b":4488,"line":158,"col":0}}};

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

const getVolunteersForTotalHoursIR: any = {"name":"getVolunteersForTotalHours","params":[{"name":"targetPartnerOrgs","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4867,"b":4884,"line":179,"col":39}]}}],"usedParamSet":{"targetPartnerOrgs":true},"statement":{"body":"SELECT\n    users.id\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id\nWHERE\n    volunteer_partner_orgs.key = ANY (:targetPartnerOrgs!)\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\nGROUP BY\n    users.id","loc":{"a":4532,"b":5094,"line":171,"col":0}}};

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

const getVolunteerForOnboardingByIdIR: any = {"name":"getVolunteerForOnboardingById","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6180,"b":6185,"line":222,"col":30},{"a":6684,"b":6689,"line":235,"col":27}]}},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6226,"b":6236,"line":223,"col":39},{"a":6726,"b":6736,"line":236,"col":35}]}}],"usedParamSet":{"userId":true,"mongoUserId":true},"statement":{"body":"WITH CTE AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n)\nSELECT\n    users.id,\n    email,\n    first_name,\n    volunteer_profiles.onboarded,\n    COALESCE(array_agg(subjects_unlocked.subject) FILTER (WHERE subjects_unlocked.subject IS NOT NULL), '{}') AS subjects,\n    country,\n    MAX(availabilities.updated_at) AS availability_last_modified_at\nFROM\n    users\n    LEFT JOIN (\n        SELECT\n            subjects.name AS subject,\n            COUNT(*)::int AS earned_certs,\n            CTE.total\n        FROM\n            users_certifications\n            JOIN certification_subject_unlocks USING (certification_id)\n            JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n            JOIN users ON users.id = users_certifications.user_id\n            JOIN CTE ON CTE.name = subjects.name\n        WHERE\n            users.id::uuid = :userId\n            OR users.mongo_id::text = :mongoUserId\n        GROUP BY\n            subjects.name, CTE.total\n        HAVING\n            COUNT(*)::int >= CTE.total) AS subjects_unlocked ON TRUE\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN availabilities ON availabilities.user_id = users.id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS FALSE\n    AND (users.id::uuid = :userId\n        OR users.mongo_id::text = :mongoUserId)\nGROUP BY\n    users.id,\n    onboarded,\n    country","loc":{"a":5141,"b":6787,"line":190,"col":0}}};

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

const getVolunteersForTelecomReportIR: any = {"name":"getVolunteersForTelecomReport","params":[{"name":"partnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7211,"b":7221,"line":256,"col":34}]}}],"usedParamSet":{"partnerOrg":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    users.created_at\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    volunteer_partner_orgs.key = :partnerOrg!\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE\nGROUP BY\n    users.id,\n    volunteer_partner_org","loc":{"a":6834,"b":7457,"line":244,"col":0}}};

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

const getVolunteersNotifiedSinceDateIR: any = {"name":"getVolunteersNotifiedSinceDate","params":[{"name":"sinceDate","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7667,"b":7676,"line":276,"col":34}]}}],"usedParamSet":{"sinceDate":true},"statement":{"body":"SELECT\n    users.id\nFROM\n    users\n    LEFT JOIN notifications ON users.id = notifications.user_id\nGROUP BY\n    users.id\nHAVING\n    MAX(notifications.sent_at) > :sinceDate!","loc":{"a":7505,"b":7676,"line":268,"col":0}}};

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

const getVolunteersNotifiedBySessionIdIR: any = {"name":"getVolunteersNotifiedBySessionId","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7820,"b":7829,"line":285,"col":32}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    notifications.user_id\nFROM\n    notifications\nWHERE\n    notifications.session_id = :sessionId!","loc":{"a":7726,"b":7829,"line":280,"col":0}}};

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

const getVolunteerByReferenceIR: any = {"name":"getVolunteerByReference","params":[{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8155,"b":8166,"line":296,"col":31}]}}],"usedParamSet":{"referenceId":true},"statement":{"body":"SELECT\n    volunteer_references.user_id AS volunteer_id,\n    volunteer_references.email AS reference_email\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_references.id = :referenceId!\n    AND volunteer_reference_statuses.name <> 'removed'\nLIMIT 1","loc":{"a":7870,"b":8229,"line":289,"col":0}}};

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

const addVolunteerReferenceByIdIR: any = {"name":"addVolunteerReferenceById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8396,"b":8398,"line":304,"col":5}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8406,"b":8412,"line":305,"col":5}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8420,"b":8429,"line":306,"col":5}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8437,"b":8445,"line":307,"col":5}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8453,"b":8458,"line":308,"col":5}]}}],"usedParamSet":{"id":true,"userId":true,"firstName":true,"lastName":true,"email":true},"statement":{"body":"INSERT INTO volunteer_references (id, user_id, first_name, last_name, email, status_id, created_at, updated_at)\nSELECT\n    :id!,\n    :userId!,\n    :firstName!,\n    :lastName!,\n    :email!,\n    volunteer_reference_statuses.id,\n    NOW(),\n    NOW()\nFROM\n    volunteer_reference_statuses\nWHERE\n    name = 'unsent'::text\nRETURNING\n    id AS ok","loc":{"a":8272,"b":8610,"line":302,"col":0}}};

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

const updateVolunteerReferenceSubmissionIR: any = {"name":"updateVolunteerReferenceSubmission","params":[{"name":"affiliation","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8755,"b":8765,"line":325,"col":28}]}},{"name":"relationshipLength","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8818,"b":8835,"line":326,"col":36}]}},{"name":"rejectionReason","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8893,"b":8907,"line":327,"col":33}]}},{"name":"additionalInfo","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8961,"b":8974,"line":328,"col":32}]}},{"name":"patient","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9019,"b":9025,"line":329,"col":24}]}},{"name":"positiveRoleModel","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9074,"b":9090,"line":330,"col":36}]}},{"name":"agreeableAndApproachable","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9158,"b":9181,"line":331,"col":43}]}},{"name":"communicatesEffectively","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9254,"b":9276,"line":332,"col":41}]}},{"name":"trustworthyWithChildren","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9348,"b":9370,"line":333,"col":42}]}},{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9586,"b":9597,"line":343,"col":31}]}}],"usedParamSet":{"affiliation":true,"relationshipLength":true,"rejectionReason":true,"additionalInfo":true,"patient":true,"positiveRoleModel":true,"agreeableAndApproachable":true,"communicatesEffectively":true,"trustworthyWithChildren":true,"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    affiliation = COALESCE(:affiliation, affiliation),\n    relationship_length = COALESCE(:relationshipLength, relationship_length),\n    rejection_reason = COALESCE(:rejectionReason, rejection_reason),\n    additional_info = COALESCE(:additionalInfo, additional_info),\n    patient = COALESCE(:patient, patient),\n    positive_role_model = COALESCE(:positiveRoleModel, positive_role_model),\n    agreeable_and_approachable = COALESCE(:agreeableAndApproachable, agreeable_and_approachable),\n    communicates_effectively = COALESCE(:communicatesEffectively, communicates_effectively),\n    trustworthy_with_children = COALESCE(:trustworthyWithChildren, trustworthy_with_children),\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = 'submitted') AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":8662,"b":9641,"line":321,"col":0}}};

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

const getInactiveVolunteersIR: any = {"name":"getInactiveVolunteers","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10043,"b":10048,"line":361,"col":31}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10084,"b":10087,"line":362,"col":34}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.last_activity_at >= :start!\n    AND users.last_activity_at < :end!\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE","loc":{"a":9680,"b":10185,"line":349,"col":0}}};

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

const updateVolunteerReferenceSentByIdIR: any = {"name":"updateVolunteerReferenceSentById","params":[{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10501,"b":10512,"line":383,"col":31}]}}],"usedParamSet":{"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    sent_at = NOW(),\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = 'sent') AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":10235,"b":10556,"line":369,"col":0}}};

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

const updateVolunteerReferenceStatusByIdIR: any = {"name":"updateVolunteerReferenceStatusById","params":[{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10818,"b":10824,"line":401,"col":16}]}},{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10876,"b":10887,"line":403,"col":31}]}}],"usedParamSet":{"status":true,"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    sent_at = NOW(),\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":10608,"b":10931,"line":389,"col":0}}};

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

const deleteVolunteerReferenceByIdIR: any = {"name":"deleteVolunteerReferenceById","params":[{"name":"referenceEmail","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11228,"b":11242,"line":422,"col":34}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11284,"b":11290,"line":423,"col":40}]}}],"usedParamSet":{"referenceEmail":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = 'removed') AS subquery\nWHERE\n    volunteer_references.email = :referenceEmail!\n    AND volunteer_references.user_id = :userId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":10977,"b":11334,"line":409,"col":0}}};

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

const updateVolunteersReadyToCoachByIdsIR: any = {"name":"updateVolunteersReadyToCoachByIds","params":[{"name":"userIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11506,"b":11513,"line":435,"col":20}]}}],"usedParamSet":{"userIds":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_ready_to_coach_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = ANY (:userIds!)\nRETURNING\n    user_id AS ok","loc":{"a":11385,"b":11542,"line":429,"col":0}}};

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

const updateVolunteerElapsedAvailabilityByIdIR: any = {"name":"updateVolunteerElapsedAvailabilityById","params":[{"name":"elapsedAvailability","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11738,"b":11757,"line":447,"col":46}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11839,"b":11845,"line":451,"col":19},{"a":11881,"b":11887,"line":453,"col":15}]}}],"usedParamSet":{"elapsedAvailability":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    elapsed_availability = subquery.total\nFROM (\n    SELECT\n        COALESCE(elapsed_availability, 0) + (:elapsedAvailability!)::int AS total\n    FROM\n        volunteer_profiles\n    WHERE\n        user_id = :userId!) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":11598,"b":11915,"line":441,"col":0}}};

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

const updateVolunteerTotalHoursByIdIR: any = {"name":"updateVolunteerTotalHoursById","params":[{"name":"totalHours","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12104,"b":12114,"line":465,"col":47}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12200,"b":12206,"line":469,"col":19},{"a":12242,"b":12248,"line":471,"col":15}]}}],"usedParamSet":{"totalHours":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    total_volunteer_hours = subquery.total\nFROM (\n    SELECT\n        COALESCE(total_volunteer_hours, 0) + (:totalHours!)::numeric AS total\n    FROM\n        volunteer_profiles\n    WHERE\n        user_id = :userId!) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":11962,"b":12276,"line":459,"col":0}}};

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

const getVolunteerTrainingCoursesIR: any = {"name":"getVolunteerTrainingCourses","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12691,"b":12697,"line":489,"col":38}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    user_id,\n    complete,\n    training_courses.name AS training_course,\n    progress,\n    completed_materials,\n    users_training_courses.created_at,\n    users_training_courses.updated_at\nFROM\n    users_training_courses\n    LEFT JOIN training_courses ON training_courses.id = users_training_courses.training_course_id\nWHERE\n    users_training_courses.user_id = :userId!","loc":{"a":12321,"b":12697,"line":477,"col":0}}};

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

const updateVolunteerTrainingByIdIR: any = {"name":"updateVolunteerTrainingById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12891,"b":12897,"line":495,"col":5}]}},{"name":"complete","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12930,"b":12938,"line":497,"col":5},{"a":13173,"b":13181,"line":509,"col":20}]}},{"name":"progress","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12946,"b":12954,"line":498,"col":5},{"a":13204,"b":13212,"line":510,"col":20}]}},{"name":"materialKey","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12969,"b":12980,"line":499,"col":12},{"a":13284,"b":13295,"line":511,"col":69},{"a":13349,"b":13360,"line":514,"col":13}]}},{"name":"trainingCourse","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13073,"b":13087,"line":505,"col":29}]}}],"usedParamSet":{"userId":true,"complete":true,"progress":true,"materialKey":true,"trainingCourse":true},"statement":{"body":"INSERT INTO users_training_courses AS ins (user_id, training_course_id, complete, progress, completed_materials, created_at, updated_at)\nSELECT\n    :userId!,\n    training_courses.id,\n    :complete!,\n    :progress!,\n    ARRAY[(:materialKey!)::text],\n    NOW(),\n    NOW()\nFROM\n    training_courses\nWHERE\n    training_courses.name = :trainingCourse!\nON CONFLICT (user_id,\n    training_course_id)\n    DO UPDATE SET\n        complete = :complete!,\n        progress = :progress!,\n        completed_materials = ARRAY_APPEND(ins.completed_materials, :materialKey!),\n        updated_at = NOW()\n    WHERE\n        NOT :materialKey! = ANY (ins.completed_materials)\n    RETURNING\n        user_id AS ok","loc":{"a":12742,"b":13428,"line":493,"col":0}}};

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

const updateVolunteerPhotoIdByIdIR: any = {"name":"updateVolunteerPhotoIdById","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13529,"b":13532,"line":523,"col":23}]}},{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13659,"b":13665,"line":531,"col":16}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13701,"b":13707,"line":533,"col":15}]}}],"usedParamSet":{"key":true,"status":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    photo_id_s3_key = :key!,\n    photo_id_status = subquery.id\nFROM (\n    SELECT\n        id\n    FROM\n        photo_id_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":13472,"b":13735,"line":520,"col":0}}};

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

const updateVolunteerSentInactive30DayEmailIR: any = {"name":"updateVolunteerSentInactive30DayEmail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13911,"b":13917,"line":545,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_thirty_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":13790,"b":13945,"line":539,"col":0}}};

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

const updateVolunteerSentInactive60DayEmailIR: any = {"name":"updateVolunteerSentInactive60DayEmail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14163,"b":14169,"line":558,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_thirty_day_email = TRUE,\n    sent_inactive_sixty_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":14000,"b":14197,"line":551,"col":0}}};

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

const updateVolunteerSentInactive90DayEmailIR: any = {"name":"updateVolunteerSentInactive90DayEmail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14373,"b":14379,"line":570,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_ninety_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":14252,"b":14407,"line":564,"col":0}}};

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

const updateVolunteerProfileByIdIR: any = {"name":"updateVolunteerProfileById","params":[{"name":"deactivated","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14500,"b":14510,"line":579,"col":28}]}},{"name":"phone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14549,"b":14553,"line":580,"col":22}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14579,"b":14585,"line":582,"col":10}]}}],"usedParamSet":{"deactivated":true,"phone":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    deactivated = COALESCE(:deactivated, deactivated),\n    phone = COALESCE(:phone, phone)\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":14451,"b":14608,"line":576,"col":0}}};

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

const getVolunteerUnsentReferencesIR: any = {"name":"getVolunteerUnsentReferences","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    volunteer_references.id,\n    user_id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_reference_statuses.name = 'unsent'","loc":{"a":14654,"b":14987,"line":588,"col":0}}};

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

const getReferencesForReferenceFormApologyIR: any = {"name":"getReferencesForReferenceFormApology","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    volunteer_references.id,\n    user_id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_reference_statuses.name = 'sent'\n    AND volunteer_references.sent_at <= '2022-04-12 18:00:00.000'\n    AND volunteer_references.sent_at >= '2022-02-26 00:00:00.000'","loc":{"a":15041,"b":15504,"line":603,"col":0}}};

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

const getReferencesByVolunteerIR: any = {"name":"getReferencesByVolunteer","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15855,"b":15861,"line":630,"col":36}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    volunteer_references.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_references.user_id = :userId!\n    AND volunteer_reference_statuses.name != 'removed'","loc":{"a":15546,"b":15916,"line":620,"col":0}}};

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

const checkReferenceExistsBeforeAddingIR: any = {"name":"checkReferenceExistsBeforeAdding","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16410,"b":16416,"line":651,"col":36},{"a":16528,"b":16534,"line":654,"col":36}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16466,"b":16471,"line":652,"col":48},{"a":16574,"b":16579,"line":655,"col":38}]}}],"usedParamSet":{"userId":true,"email":true},"statement":{"body":"SELECT\n    volunteer_references.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status,\n    sub.actions\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\n    LEFT JOIN (\n        SELECT\n            array_agg(action) AS actions\n        FROM\n            user_actions\n        WHERE\n            user_actions.user_id = :userId!\n            AND user_actions.reference_email = :email!) sub ON TRUE\nWHERE\n    volunteer_references.user_id = :userId!\n    AND volunteer_references.email = :email!","loc":{"a":15966,"b":16579,"line":635,"col":0}}};

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

const getReferencesByVolunteerForAdminDetailIR: any = {"name":"getReferencesByVolunteerForAdminDetail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17160,"b":17166,"line":678,"col":36}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    volunteer_references.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status,\n    affiliation,\n    relationship_length,\n    patient,\n    positive_role_model,\n    agreeable_and_approachable,\n    communicates_effectively,\n    rejection_reason,\n    additional_info,\n    trustworthy_with_children\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_references.user_id = :userId!\n    AND volunteer_reference_statuses.name != 'removed'","loc":{"a":16635,"b":17221,"line":659,"col":0}}};

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

const getVolunteerForPendingStatusIR: any = {"name":"getVolunteerForPendingStatus","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18025,"b":18031,"line":706,"col":23},{"a":18079,"b":18085,"line":708,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_profiles.approved,\n    volunteer_profiles.onboarded,\n    volunteer_profiles.country,\n    photo_id_statuses.name AS photo_id_status,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    occupations.occupations\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    LEFT JOIN (\n        SELECT\n            array_agg(occupation) AS occupations\n        FROM\n            volunteer_occupations\n        WHERE\n            user_id = :userId!) AS occupations ON TRUE\nWHERE\n    users.id = :userId!","loc":{"a":17267,"b":18085,"line":683,"col":0}}};

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

const updateVolunteerReferenceStatusIR: any = {"name":"updateVolunteerReferenceStatus","params":[{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18322,"b":18328,"line":723,"col":16}]}},{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18380,"b":18391,"line":725,"col":31}]}}],"usedParamSet":{"status":true,"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":18133,"b":18435,"line":712,"col":0}}};

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

const updateVolunteerApprovedIR: any = {"name":"updateVolunteerApproved","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18594,"b":18600,"line":737,"col":34}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    approved = TRUE,\n    updated_at = NOW()\nWHERE\n    volunteer_profiles.user_id = :userId!\nRETURNING\n    volunteer_profiles.user_id AS ok","loc":{"a":18476,"b":18647,"line":731,"col":0}}};

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

const updateVolunteerPendingIR: any = {"name":"updateVolunteerPending","params":[{"name":"approved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18737,"b":18745,"line":746,"col":16}]}},{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18896,"b":18902,"line":755,"col":16}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18957,"b":18963,"line":757,"col":34}]}}],"usedParamSet":{"approved":true,"status":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    approved = :approved!,\n    photo_id_status = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        photo_id_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    volunteer_profiles.user_id = :userId!\nRETURNING\n    volunteer_profiles.user_id AS ok","loc":{"a":18687,"b":19010,"line":743,"col":0}}};

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

const updateVolunteerOnboardedIR: any = {"name":"updateVolunteerOnboarded","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19171,"b":19177,"line":769,"col":34}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    onboarded = TRUE,\n    updated_at = NOW()\nWHERE\n    volunteer_profiles.user_id = :userId!\nRETURNING\n    volunteer_profiles.user_id AS ok","loc":{"a":19052,"b":19224,"line":763,"col":0}}};

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

const getVolunteersForNiceToMeetYouIR: any = {"name":"getVolunteersForNiceToMeetYou","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19726,"b":19731,"line":790,"col":29}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19761,"b":19764,"line":791,"col":28}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND users.created_at >= :start!\n    AND users.created_at < :end!","loc":{"a":19271,"b":19764,"line":775,"col":0}}};

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

const getVolunteersForReadyToCoachIR: any = {"name":"getVolunteersForReadyToCoach","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN user_product_flags ON user_product_flags.user_id = users.id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE\n    AND user_product_flags.sent_ready_to_coach_email IS FALSE","loc":{"a":19810,"b":20459,"line":795,"col":0}}};

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

const getVolunteersForWaitingReferencesIR: any = {"name":"getVolunteersForWaitingReferences","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21240,"b":21245,"line":835,"col":40}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21287,"b":21290,"line":836,"col":40}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name,\n    users.last_name,\n    users.phone,\n    users.email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN volunteer_references ON volunteer_references.user_id = users.id\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_reference_statuses.name = 'sent'\n    AND volunteer_references.sent_at > :start!\n    AND volunteer_references.sent_at < :end!\nGROUP BY\n    users.id,\n    volunteer_partner_orgs.key","loc":{"a":20510,"b":21344,"line":817,"col":0}}};

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

const addVolunteerCertificationIR: any = {"name":"addVolunteerCertification","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21484,"b":21490,"line":845,"col":5}]}},{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21700,"b":21707,"line":856,"col":24}]}}],"usedParamSet":{"userId":true,"subject":true},"statement":{"body":"INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at)\nSELECT\n    :userId!,\n    subquery.id,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        certifications.id\n    FROM\n        certifications\n        JOIN quizzes ON quizzes.name = certifications.name\n    WHERE\n        quizzes.name = :subject!) AS subquery\nON CONFLICT (user_id,\n    certification_id)\n    DO NOTHING\nRETURNING\n    user_id AS ok","loc":{"a":21387,"b":21807,"line":843,"col":0}}};

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

const updateVolunteerQuizIR: any = {"name":"updateVolunteerQuiz","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21950,"b":21956,"line":867,"col":5}]}},{"name":"passed","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21988,"b":21994,"line":870,"col":5},{"a":22241,"b":22247,"line":884,"col":18}]}},{"name":"quiz","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22114,"b":22118,"line":879,"col":24}]}}],"usedParamSet":{"userId":true,"passed":true,"quiz":true},"statement":{"body":"INSERT INTO users_quizzes AS ins (user_id, quiz_id, attempts, passed, created_at, updated_at)\nSELECT\n    :userId!,\n    subquery.id,\n    1,\n    :passed!,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        quizzes.id\n    FROM\n        quizzes\n    WHERE\n        quizzes.name = :quiz!) AS subquery\nON CONFLICT (user_id,\n    quiz_id)\n    DO UPDATE SET\n        attempts = ins.attempts + 1,\n        passed = :passed!,\n        updated_at = NOW()\n    RETURNING\n        user_id AS ok","loc":{"a":21844,"b":22311,"line":865,"col":0}}};

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

const getVolunteersAdminAvailabilityIR: any = {"name":"getVolunteersAdminAvailability","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22591,"b":22598,"line":898,"col":25},{"a":23141,"b":23148,"line":916,"col":29}]}}],"usedParamSet":{"subject":true},"statement":{"body":"WITH certs_for_subject AS (\n    SELECT\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    WHERE\n        subjects.name = :subject!\n)\nSELECT\n    users.id\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN (\n        SELECT\n            users_certifications.user_id,\n            COUNT(*)::int AS earned_certs,\n            certs_for_subject.total\n        FROM\n            users_certifications\n            JOIN certification_subject_unlocks USING (certification_id)\n            JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n            JOIN certs_for_subject ON TRUE\n        WHERE\n            subjects.name = :subject!\n        GROUP BY\n            users_certifications.user_id, subjects.name, certs_for_subject.total\n        HAVING\n            COUNT(*)::int >= certs_for_subject.total) user_certs ON user_certs.user_id = users.id\nWHERE\n    users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND users.deactivated IS FALSE\n    AND users.banned IS FALSE","loc":{"a":22359,"b":23504,"line":891,"col":0}}};

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

const getVolunteerForTextResponseIR: any = {"name":"getVolunteerForTextResponse","params":[{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24081,"b":24086,"line":944,"col":19}]}}],"usedParamSet":{"phone":true},"statement":{"body":"SELECT\n    users.id AS volunteer_id,\n    sessions.id AS session_id,\n    sessions.volunteer_joined_at,\n    sessions.ended_at,\n    subjects.name AS subject,\n    topics.name AS topic\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN notifications ON notifications.user_id = users.id\n    LEFT JOIN sessions ON sessions.id = notifications.session_id\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\nWHERE\n    users.phone = :phone!\nORDER BY\n    notifications.created_at DESC\nLIMIT 1","loc":{"a":23549,"b":24137,"line":929,"col":0}}};

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

const getVolunteersToReviewIR: any = {"name":"getVolunteersToReview","params":[{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25688,"b":25693,"line":988,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25710,"b":25716,"line":988,"col":30}]}}],"usedParamSet":{"limit":true,"offset":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name AS first_name,\n    users.last_name AS last_name,\n    users.first_name AS firstname,\n    users.last_name AS lastname,\n    users.email,\n    users.created_at,\n    MAX(user_actions.created_at) AS ready_for_review_at\nFROM\n    users\n    JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\n    JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    JOIN (\n        SELECT\n            user_id,\n            count(*) AS total_references\n        FROM\n            volunteer_references\n            JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\n        WHERE\n            volunteer_reference_statuses.name = ANY ('{ \"submitted\", \"approved\" }')\n        GROUP BY\n            user_id) AS reference_count ON reference_count.user_id = users.id\n    JOIN volunteer_occupations ON volunteer_occupations.user_id = users.id -- user is only ready for review if they submitted background info\n    JOIN user_actions ON user_actions.user_id = users.id\nWHERE\n    volunteer_profiles.approved IS FALSE\n    AND NOT volunteer_profiles.country IS NULL\n    AND NOT volunteer_profiles.photo_id_s3_key IS NULL\n    AND photo_id_statuses.name = ANY ('{ \"submitted\", \"approved\" }')\n    AND user_actions.action = ANY ('{ \"ADDED PHOTO ID\", \"SUBMITTED REFERENCE FORM\", \"COMPLETED BACKGROUND INFO\" }')\n    AND reference_count.total_references = 2\nGROUP BY\n    users.id\nORDER BY\n    ready_for_review_at ASC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":24176,"b":25722,"line":951,"col":0}}};

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

const getReferencesToFollowupIR: any = {"name":"getReferencesToFollowup","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26564,"b":26569,"line":1010,"col":40}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26611,"b":26614,"line":1011,"col":40}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id AS volunteer_id,\n    users.first_name AS volunteer_first_name,\n    users.last_name AS volunteer_last_name,\n    volunteer_references.id AS reference_id,\n    volunteer_references.first_name AS reference_first_name,\n    volunteer_references.last_name AS reference_last_name,\n    volunteer_references.email AS reference_email\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN volunteer_references ON volunteer_references.user_id = users.id\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_reference_statuses.name = 'sent'\n    AND volunteer_references.sent_at > :start!\n    AND volunteer_references.sent_at < :end!","loc":{"a":25763,"b":26614,"line":992,"col":0}}};

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

const updateVolunteerBackgroundInfoIR: any = {"name":"updateVolunteerBackgroundInfo","params":[{"name":"occupation","codeRefs":{"defined":{"a":26667,"b":26676,"line":1016,"col":8},"used":[{"a":26944,"b":26954,"line":1025,"col":13}]},"transform":{"type":"pick_array_spread","keys":[{"name":"userId","required":false},{"name":"occupation","required":false},{"name":"createdAt","required":false},{"name":"updatedAt","required":false}]},"required":true},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26812,"b":26818,"line":1020,"col":21},{"a":27602,"b":27608,"line":1042,"col":23}]}},{"name":"approved","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27091,"b":27098,"line":1031,"col":33}]}},{"name":"experience","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27147,"b":27156,"line":1032,"col":35}]}},{"name":"company","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27204,"b":27210,"line":1033,"col":32}]}},{"name":"college","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27255,"b":27261,"line":1034,"col":32}]}},{"name":"linkedInUrl","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27311,"b":27321,"line":1035,"col":37}]}},{"name":"country","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27371,"b":27377,"line":1036,"col":32}]}},{"name":"state","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27420,"b":27424,"line":1037,"col":30}]}},{"name":"city","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27464,"b":27467,"line":1038,"col":29}]}},{"name":"languages","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27511,"b":27519,"line":1039,"col":34}]}}],"usedParamSet":{"userId":true,"occupation":true,"approved":true,"experience":true,"company":true,"college":true,"linkedInUrl":true,"country":true,"state":true,"city":true,"languages":true},"statement":{"body":"WITH clear_occ AS (\n    DELETE FROM volunteer_occupations\n    WHERE user_id = :userId!\n),\nins_occ AS (\nINSERT INTO volunteer_occupations (user_id, occupation, created_at, updated_at)\n        VALUES\n            :occupation!\n        ON CONFLICT\n            DO NOTHING)\n        UPDATE\n            volunteer_profiles\n        SET\n            approved = COALESCE(:approved, approved),\n            experience = COALESCE(:experience, experience),\n            company = COALESCE(:company, company),\n            college = COALESCE(:college, college),\n            linkedin_url = COALESCE(:linkedInUrl, linkedin_url),\n            country = COALESCE(:country, country),\n            state = COALESCE(:state, state),\n            city = COALESCE(:city, city),\n            languages = COALESCE(:languages, languages),\n            updated_at = NOW()\n        WHERE\n            user_id = :userId!\n        RETURNING\n            user_id AS ok","loc":{"a":26733,"b":27652,"line":1018,"col":0}}};

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

const getQuizzesPassedForDateRangeIR: any = {"name":"getQuizzesPassedForDateRange","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27776,"b":27782,"line":1053,"col":15}]}},{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27807,"b":27812,"line":1054,"col":23}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27837,"b":27840,"line":1055,"col":23}]}}],"usedParamSet":{"userId":true,"start":true,"end":true},"statement":{"body":"SELECT\n    COUNT(*)::int AS total\nFROM\n    users_quizzes\nWHERE\n    user_id = :userId!\n    AND updated_at >= :start!\n    AND updated_at <= :end!\n    AND passed IS TRUE","loc":{"a":27698,"b":27863,"line":1048,"col":0}}};

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

const updateVolunteerUserForAdminIR: any = {"name":"updateVolunteerUserForAdmin","params":[{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27947,"b":27956,"line":1063,"col":18}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27976,"b":27984,"line":1064,"col":17}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28000,"b":28005,"line":1065,"col":13}]}},{"name":"isVerified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28024,"b":28034,"line":1066,"col":16}]}},{"name":"isBanned","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28051,"b":28059,"line":1067,"col":14}]}},{"name":"isDeactivated","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28081,"b":28094,"line":1068,"col":19}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28118,"b":28124,"line":1070,"col":16}]}}],"usedParamSet":{"firstName":true,"lastName":true,"email":true,"isVerified":true,"isBanned":true,"isDeactivated":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    first_name = :firstName!,\n    last_name = :lastName!,\n    email = :email!,\n    verified = :isVerified!,\n    banned = :isBanned!,\n    deactivated = :isDeactivated!\nWHERE\n    users.id = :userId!\nRETURNING\n    id AS ok","loc":{"a":27908,"b":28147,"line":1060,"col":0}}};

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

const updateVolunteerProfilesForAdminIR: any = {"name":"updateVolunteerProfilesForAdmin","params":[{"name":"partnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28262,"b":28273,"line":1079,"col":32}]}},{"name":"approved","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28301,"b":28308,"line":1080,"col":25}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28342,"b":28348,"line":1082,"col":15}]}}],"usedParamSet":{"partnerOrgId":true,"approved":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    volunteer_partner_org_id = :partnerOrgId,\n    approved = COALESCE(:approved, approved)\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":28196,"b":28376,"line":1076,"col":0}}};

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

const createVolunteerUserIR: any = {"name":"createVolunteerUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28576,"b":28582,"line":1089,"col":13}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28586,"b":28591,"line":1089,"col":23}]}},{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28595,"b":28600,"line":1089,"col":32}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28604,"b":28613,"line":1089,"col":41}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28617,"b":28625,"line":1089,"col":54}]}},{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28629,"b":28637,"line":1089,"col":66}]}},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28648,"b":28657,"line":1089,"col":85}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28661,"b":28673,"line":1089,"col":98}]}}],"usedParamSet":{"userId":true,"email":true,"phone":true,"firstName":true,"lastName":true,"password":true,"referredBy":true,"referralCode":true},"statement":{"body":"INSERT INTO users (id, email, phone, first_name, last_name, PASSWORD, verified, referred_by, referral_code, last_activity_at, created_at, updated_at)\n    VALUES (:userId!, :email!, :phone!, :firstName!, :lastName!, :password!, FALSE, :referredBy, :referralCode!, NOW(), NOW(), NOW())\nON CONFLICT (email)\n    DO NOTHING\nRETURNING\n    id, email, first_name, last_name, phone, banned, test_user, deactivated, created_at","loc":{"a":28413,"b":28828,"line":1088,"col":0}}};

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

const getVolunteerPartnerOrgIdByKeyIR: any = {"name":"getVolunteerPartnerOrgIdByKey","params":[{"name":"volunteerPartnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28938,"b":28957,"line":1102,"col":11}]}}],"usedParamSet":{"volunteerPartnerOrg":true},"statement":{"body":"SELECT\n    id\nFROM\n    volunteer_partner_orgs\nWHERE\n    KEY = :volunteerPartnerOrg!","loc":{"a":28875,"b":28957,"line":1097,"col":0}}};

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


/** 'CreateUserStudentPartnerOrgInstance' parameters type */
export interface ICreateUserStudentPartnerOrgInstanceParams {
  userId: string;
  vpoName: string;
}

/** 'CreateUserStudentPartnerOrgInstance' return type */
export interface ICreateUserStudentPartnerOrgInstanceResult {
  ok: string | null;
}

/** 'CreateUserStudentPartnerOrgInstance' query type */
export interface ICreateUserStudentPartnerOrgInstanceQuery {
  params: ICreateUserStudentPartnerOrgInstanceParams;
  result: ICreateUserStudentPartnerOrgInstanceResult;
}

const createUserStudentPartnerOrgInstanceIR: any = {"name":"createUserStudentPartnerOrgInstance","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29132,"b":29138,"line":1107,"col":5}]}},{"name":"vpoName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29229,"b":29236,"line":1113,"col":16}]}}],"usedParamSet":{"userId":true,"vpoName":true},"statement":{"body":"INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    :userId!,\n    vpo.id,\n    NOW(),\n    NOW()\nFROM volunteer_partner_orgs vpo\nWHERE \n    vpo.name = :vpoName!\nLIMIT 1\nRETURNING user_id as ok","loc":{"a":29009,"b":29268,"line":1105,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     vpo.id,
 *     NOW(),
 *     NOW()
 * FROM volunteer_partner_orgs vpo
 * WHERE 
 *     vpo.name = :vpoName!
 * LIMIT 1
 * RETURNING user_id as ok
 * ```
 */
export const createUserStudentPartnerOrgInstance = new PreparedQuery<ICreateUserStudentPartnerOrgInstanceParams,ICreateUserStudentPartnerOrgInstanceResult>(createUserStudentPartnerOrgInstanceIR);


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

const createVolunteerProfileIR: any = {"name":"createVolunteerProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29431,"b":29437,"line":1119,"col":13}]}},{"name":"partnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29448,"b":29459,"line":1119,"col":30}]}},{"name":"timezone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29463,"b":29470,"line":1119,"col":45}]}}],"usedParamSet":{"userId":true,"partnerOrgId":true,"timezone":true},"statement":{"body":"INSERT INTO volunteer_profiles (user_id, approved, volunteer_partner_org_id, timezone, created_at, updated_at)\n    VALUES (:userId!, FALSE, :partnerOrgId, :timezone, NOW(), NOW())\nRETURNING\n    user_id AS ok","loc":{"a":29307,"b":29513,"line":1118,"col":0}}};

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

const getQuizzesForVolunteersIR: any = {"name":"getQuizzesForVolunteers","params":[{"name":"userIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29781,"b":29788,"line":1135,"col":20}]}}],"usedParamSet":{"userIds":true},"statement":{"body":"SELECT\n    user_id,\n    attempts AS tries,\n    users_quizzes.updated_at AS last_attempted_at,\n    passed,\n    quizzes.name\nFROM\n    users_quizzes\n    JOIN quizzes ON users_quizzes.quiz_id = quizzes.id\nWHERE\n    user_id = ANY (:userIds!)","loc":{"a":29554,"b":29789,"line":1125,"col":0}}};

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

const getSubjectsForVolunteerIR: any = {"name":"getSubjectsForVolunteer","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":30539,"b":30545,"line":1162,"col":19}]}}],"usedParamSet":{"userId":true},"statement":{"body":"WITH subject_cert_total AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n)\nSELECT\n    subjects_unlocked.subject\nFROM (\n    SELECT\n        subjects.name AS subject,\n        COUNT(*)::int AS earned_certs,\n        subject_cert_total.total\n    FROM\n        users_certifications\n        JOIN certification_subject_unlocks USING (certification_id)\n        JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n        JOIN subject_cert_total ON subject_cert_total.name = subjects.name\n    WHERE\n        user_id = :userId!\n    GROUP BY\n        subjects.name, subject_cert_total.total\n    HAVING\n        COUNT(*)::int >= subject_cert_total.total) AS subjects_unlocked","loc":{"a":29830,"b":30689,"line":1139,"col":0}}};

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

const getNextVolunteerToNotifyIR: any = {"name":"getNextVolunteerToNotify","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":32918,"b":32925,"line":1221,"col":13}]}},{"name":"highLevelSubjects","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33044,"b":33060,"line":1223,"col":14},{"a":33096,"b":33112,"line":1224,"col":17}]}},{"name":"disqualifiedVolunteers","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33278,"b":33299,"line":1226,"col":14},{"a":33354,"b":33375,"line":1227,"col":36}]}},{"name":"favoriteVolunteers","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33439,"b":33456,"line":1229,"col":14},{"a":33507,"b":33524,"line":1230,"col":32}]}},{"name":"isPartner","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33583,"b":33591,"line":1232,"col":14},{"a":33628,"b":33636,"line":1233,"col":17},{"a":33737,"b":33745,"line":1235,"col":17}]}},{"name":"specificPartner","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33848,"b":33862,"line":1237,"col":15},{"a":33924,"b":33938,"line":1238,"col":45}]}},{"name":"lastNotified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":34141,"b":34153,"line":1246,"col":32}]}}],"usedParamSet":{"subject":true,"highLevelSubjects":true,"disqualifiedVolunteers":true,"favoriteVolunteers":true,"isPartner":true,"specificPartner":true,"lastNotified":true},"statement":{"body":"WITH subject_totals AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n),\ncandidates AS (\n    SELECT\n        users.id,\n        first_name,\n        last_name,\n        phone,\n        email,\n        volunteer_partner_orgs.key AS volunteer_partner_org\n    FROM\n        users\n        JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n        JOIN availabilities ON users.id = availabilities.user_id\n        JOIN weekdays ON weekdays.id = availabilities.weekday_id\n        LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n        LEFT JOIN LATERAL (\n            SELECT\n                array_agg(sub_unlocked.subject)::text[] AS subjects\n            FROM (\n                SELECT\n                    subjects.name AS subject\n                FROM\n                    users_certifications\n                    JOIN certification_subject_unlocks USING (certification_id)\n                    JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                    JOIN subject_totals ON subject_totals.name = subjects.name\n                WHERE\n                    users_certifications.user_id = users.id\n                GROUP BY\n                    user_id, subjects.name, subject_totals.total\n                HAVING\n                    COUNT(*)::int >= subject_totals.total) AS sub_unlocked) AS subjects_unlocked ON TRUE\n    WHERE\n        test_user IS FALSE\n        AND banned IS FALSE\n        AND deactivated IS FALSE\n        AND volunteer_profiles.onboarded IS TRUE\n        AND volunteer_profiles.approved IS TRUE\n        -- availabilities are all stored in EST so convert server time to EST to be safe\n        AND TRIM(BOTH FROM to_char(NOW() at time zone 'America/New_York', 'Day')) = weekdays.day\n        AND extract(hour FROM (NOW() at time zone 'America/New_York')) >= availabilities.available_start\n        AND extract(hour FROM (NOW() at time zone 'America/New_York')) < availabilities.available_end\n        AND :subject! = ANY (subjects_unlocked.subjects)\n        AND ( -- user does not have high level subjects if provided\n            (:highLevelSubjects)::text[] IS NULL\n            OR (:highLevelSubjects)::text[] && subjects_unlocked.subjects IS FALSE)\n        AND ( -- user is not part of disqualified group (like active session volunteers) if provided\n            (:disqualifiedVolunteers)::uuid[] IS NULL\n            OR NOT users.id = ANY (:disqualifiedVolunteers))\n        AND ( -- user is a favorite volunteer\n            (:favoriteVolunteers)::uuid[] IS NULL\n            OR users.id = ANY (:favoriteVolunteers))\n        AND ( -- user is partner or open\n            (:isPartner)::boolean IS NULL\n            OR (:isPartner IS FALSE\n                AND volunteer_profiles.volunteer_partner_org_id IS NULL)\n            OR (:isPartner IS TRUE\n                AND NOT volunteer_profiles.volunteer_partner_org_id IS NULL))\n        AND ((:specificPartner)::text IS NULL\n            OR volunteer_partner_orgs.key = :specificPartner)\n        AND NOT EXISTS (\n            SELECT\n                user_id\n            FROM\n                notifications\n            WHERE\n                user_id = users.id\n                AND sent_at >= :lastNotified!))\nSELECT\n    *\nFROM\n    candidates\nORDER BY\n    RANDOM()\nLIMIT 1","loc":{"a":30731,"b":34218,"line":1170,"col":0}}};

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

const getVolunteerForScheduleUpdateIR: any = {"name":"getVolunteerForScheduleUpdate","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":36251,"b":36257,"line":1306,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    volunteer_profiles.onboarded,\n    subjects_unlocked.subjects,\n    COALESCE(training_quizzes.passed, FALSE) AS passed_required_training\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(sub_unlocked.subject) AS subjects\n        FROM (\n            SELECT\n                user_id,\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_total.total\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        certification_subject_unlocks\n                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_total ON subject_total.name = subjects.name\n                WHERE\n                    users_certifications.user_id = users.id\n                GROUP BY\n                    user_id,\n                    subjects.name,\n                    subject_total.total\n                HAVING\n                    COUNT(*)::int >= subject_total.total) AS sub_unlocked) AS subjects_unlocked ON TRUE\n    LEFT JOIN (\n        SELECT\n            passed,\n            user_id\n        FROM\n            users_quizzes\n            JOIN quizzes ON users_quizzes.quiz_id = quizzes.id\n        WHERE\n            quizzes.name = 'upchieve101') AS training_quizzes ON training_quizzes.user_id = volunteer_profiles.user_id\nWHERE\n    users.id = :userId!\nLIMIT 1","loc":{"a":34265,"b":36265,"line":1257,"col":0}}};

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

const getVolunteersOnDeckIR: any = {"name":"getVolunteersOnDeck","params":[{"name":"excludedIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":38128,"b":38139,"line":1357,"col":29}]}},{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":38477,"b":38484,"line":1361,"col":37}]}}],"usedParamSet":{"excludedIds":true,"subject":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN availabilities ON users.id = availabilities.user_id\n    JOIN weekdays ON weekdays.id = availabilities.weekday_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    JOIN (\n        SELECT\n            sub_unlocked.user_id,\n            subjects.name AS subject\n        FROM (\n            SELECT\n                user_id,\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_total.total\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        certification_subject_unlocks\n                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_total ON subject_total.name = subjects.name\n                GROUP BY\n                    user_id,\n                    subjects.name,\n                    subject_total.total\n                HAVING\n                    COUNT(*)::int >= subject_total.total) AS sub_unlocked\n                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id\nWHERE\n    test_user IS FALSE\n    AND banned IS FALSE\n    AND deactivated IS FALSE\n    AND NOT users.id = ANY (:excludedIds!)\nAND TRIM(BOTH FROM to_char(NOW() at time zone 'America/New_York', 'Day')) = weekdays.day\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end\n    AND subjects_unlocked.subject = :subject!","loc":{"a":36302,"b":38484,"line":1311,"col":0}}};

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

const getUniqueStudentsHelpedForAnalyticsReportSummaryIR: any = {"name":"getUniqueStudentsHelpedForAnalyticsReportSummary","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":38710,"b":38715,"line":1367,"col":62},{"a":39307,"b":39312,"line":1379,"col":62}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":38761,"b":38764,"line":1368,"col":44},{"a":39358,"b":39361,"line":1380,"col":44}]}},{"name":"studentPartnerOrgIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":39003,"b":39023,"line":1373,"col":86},{"a":39432,"b":39452,"line":1381,"col":69}]}},{"name":"studentSchoolIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":39080,"b":39096,"line":1374,"col":54},{"a":39513,"b":39529,"line":1382,"col":58}]}},{"name":"volunteerPartnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":40029,"b":40048,"line":1393,"col":34}]}}],"usedParamSet":{"start":true,"end":true,"studentPartnerOrgIds":true,"studentSchoolIds":true,"volunteerPartnerOrg":true},"statement":{"body":"SELECT\n    COALESCE(COUNT(DISTINCT sessions.student_id), 0)::int AS total_unique_students_helped,\n    COALESCE(COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                AND sessions.created_at <= :end! THEN\n                sessions.student_id\n            ELSE\n                NULL\n            END), 0)::int AS total_unique_students_helped_within_range,\n    COALESCE(COUNT(DISTINCT CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                sessions.student_id\n            ELSE\n                NULL\n            END), 0)::int AS total_unique_partner_students_helped,\n    COALESCE(COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                AND sessions.created_at <= :end!\n                AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                sessions.student_id\n            ELSE\n                NULL\n            END), 0)::int AS total_unique_partner_students_helped_within_range\nFROM\n    volunteer_partner_orgs\n    LEFT JOIN volunteer_profiles ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN sessions ON volunteer_profiles.user_id = sessions.volunteer_id\n    LEFT JOIN student_profiles ON sessions.student_id = student_profiles.user_id\nWHERE\n    volunteer_partner_orgs.key = :volunteerPartnerOrg!","loc":{"a":38550,"b":40048,"line":1365,"col":0}}};

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

const getVolunteersForAnalyticsReportIR: any = {"name":"getVolunteersForAnalyticsReport","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":42846,"b":42851,"line":1454,"col":61},{"a":43464,"b":43469,"line":1466,"col":61},{"a":43940,"b":43945,"line":1475,"col":50},{"a":44509,"b":44514,"line":1489,"col":50},{"a":45291,"b":45296,"line":1505,"col":50},{"a":46024,"b":46029,"line":1522,"col":38}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":42901,"b":42904,"line":1455,"col":48},{"a":43519,"b":43522,"line":1467,"col":48},{"a":43995,"b":43998,"line":1476,"col":48},{"a":44564,"b":44567,"line":1490,"col":48},{"a":45346,"b":45349,"line":1506,"col":48},{"a":46067,"b":46070,"line":1523,"col":36}]}},{"name":"studentPartnerOrgIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":43145,"b":43165,"line":1460,"col":85},{"a":43597,"b":43617,"line":1468,"col":73},{"a":44219,"b":44239,"line":1482,"col":74},{"a":44642,"b":44662,"line":1491,"col":73},{"a":44974,"b":44994,"line":1498,"col":74},{"a":45424,"b":45444,"line":1507,"col":73}]}},{"name":"studentSchoolIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":43226,"b":43242,"line":1461,"col":58},{"a":43682,"b":43698,"line":1469,"col":62},{"a":44300,"b":44316,"line":1483,"col":58},{"a":44727,"b":44743,"line":1492,"col":62},{"a":45055,"b":45071,"line":1499,"col":58},{"a":45509,"b":45525,"line":1508,"col":62}]}},{"name":"volunteerPartnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":46370,"b":46389,"line":1533,"col":34}]}}],"usedParamSet":{"start":true,"end":true,"studentPartnerOrgIds":true,"studentSchoolIds":true,"volunteerPartnerOrg":true},"statement":{"body":"SELECT\n    users.id AS user_id,\n    users.first_name AS first_name,\n    users.last_name AS last_name,\n    users.email AS email,\n    users.created_at AS created_at,\n    volunteer_profiles.state AS state,\n    volunteer_profiles.onboarded AS is_onboarded,\n    user_actions.created_at AS date_onboarded,\n    COALESCE(users_quizzes.total, 0) AS total_quizzes_passed,\n    availabilities.updated_at AS availability_last_modified_at,\n    COALESCE(sessions_stats.total_unique_students_helped, 0) AS total_unique_students_helped,\n    COALESCE(sessions_stats.total_unique_students_helped_within_range, 0) AS total_unique_students_helped_within_range,\n    COALESCE(sessions_stats.total_unique_partner_students_helped, 0) AS total_unique_partner_students_helped,\n    COALESCE(sessions_stats.total_unique_partner_students_helped_within_range, 0) AS total_unique_partner_students_helped_within_range,\n    COALESCE(sessions_stats.total_sessions, 0) AS total_sessions,\n    COALESCE(sessions_stats.total_sessions_within_range, 0) AS total_sessions_within_range,\n    COALESCE(sessions_stats.total_partner_sessions, 0) AS total_partner_sessions,\n    COALESCE(sessions_stats.total_partner_sessions_within_range, 0) AS total_partner_sessions_within_range,\n    COALESCE(sessions_stats.total_partner_time_tutored, 0) AS total_partner_time_tutored,\n    COALESCE(sessions_stats.total_partner_time_tutored_within_range, 0) AS total_partner_time_tutored_within_range,\n    COALESCE(notifications_stats.total, 0) AS total_notifications,\n    COALESCE(notifications_stats.total_within_range, 0) AS total_notifications_within_range\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id\n    LEFT JOIN (\n        SELECT\n            COUNT(*)::int AS total,\n            user_id\n        FROM\n            users_quizzes\n        WHERE\n            passed = TRUE\n        GROUP BY\n            user_id) AS users_quizzes ON users_quizzes.user_id = volunteer_profiles.user_id\n    LEFT JOIN (\n        SELECT\n            MAX(updated_at) AS updated_at,\n            user_id\n        FROM\n            availabilities\n        GROUP BY\n            user_id) AS availabilities ON availabilities.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            created_at,\n            user_id\n        FROM\n            user_actions\n        WHERE\n            action = 'ONBOARDED') AS user_actions ON user_actions.user_id = volunteer_profiles.user_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total_sessions,\n            COUNT(DISTINCT student_id)::int AS total_unique_students_helped,\n            COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end! THEN\n                    student_id\n                ELSE\n                    NULL\n                END)::int AS total_unique_students_helped_within_range,\n            COUNT(DISTINCT CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                    sessions.student_id\n                ELSE\n                    NULL\n                END)::int AS total_unique_partner_students_helped,\n            COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end!\n                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                    sessions.student_id\n                ELSE\n                    NULL\n                END)::int AS total_unique_partner_students_helped_within_range,\n            SUM(\n                CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end! THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_sessions_within_range,\n            SUM(\n                CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_partner_sessions,\n            SUM(\n                CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end!\n                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_partner_sessions_within_range,\n            SUM(\n                CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                    sessions.time_tutored\n                ELSE\n                    0\n                END)::bigint AS total_partner_time_tutored,\n            SUM(\n                CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end!\n                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                    sessions.time_tutored\n                ELSE\n                    0\n                END)::bigint AS total_partner_time_tutored_within_range\n        FROM\n            sessions\n    LEFT JOIN student_profiles ON sessions.student_id = student_profiles.user_id\nWHERE\n    volunteer_profiles.user_id = sessions.volunteer_id) AS sessions_stats ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total,\n            SUM(\n                CASE WHEN sent_at >= :start!\n                    AND sent_at <= :end! THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_within_range\n        FROM\n            notifications\n    WHERE\n        volunteer_profiles.user_id = notifications.user_id) AS notifications_stats ON TRUE\nWHERE\n    volunteer_partner_orgs.key = :volunteerPartnerOrg!\nORDER BY\n    users.created_at DESC","loc":{"a":40097,"b":46424,"line":1397,"col":0}}};

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


/** 'RemoveOnboardedStatusForUnqualifiedVolunteers' parameters type */
export type IRemoveOnboardedStatusForUnqualifiedVolunteersParams = void;

/** 'RemoveOnboardedStatusForUnqualifiedVolunteers' return type */
export interface IRemoveOnboardedStatusForUnqualifiedVolunteersResult {
  ok: string;
}

/** 'RemoveOnboardedStatusForUnqualifiedVolunteers' query type */
export interface IRemoveOnboardedStatusForUnqualifiedVolunteersQuery {
  params: IRemoveOnboardedStatusForUnqualifiedVolunteersParams;
  result: IRemoveOnboardedStatusForUnqualifiedVolunteersResult;
}

const removeOnboardedStatusForUnqualifiedVolunteersIR: any = {"name":"removeOnboardedStatusForUnqualifiedVolunteers","params":[],"usedParamSet":{},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    onboarded = FALSE,\n    updated_at = NOW()\nFROM (\n    SELECT\n        users_training_courses.complete AS training_course_complete,\n        users_training_courses.user_id,\n        users_quizzes.passed AS training_quiz_passed\n    FROM\n        users_training_courses\n    LEFT JOIN (\n        SELECT\n            users_quizzes.passed,\n            users_quizzes.user_id,\n            quizzes.name\n        FROM\n            users_quizzes\n            LEFT JOIN quizzes ON users_quizzes.quiz_id = quizzes.id) AS users_quizzes ON users_quizzes.user_id = users_training_courses.user_id\n            AND users_quizzes.name = 'upchieve101') AS subquery\nWHERE\n    volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.created_at >= '2022-01-01 00:00:00.000000+00'\n    AND subquery.training_course_complete IS TRUE\n    AND (subquery.training_quiz_passed IS FALSE\n        OR subquery.training_quiz_passed IS NULL)\nAND volunteer_profiles.user_id = subquery.user_id\nRETURNING\n    volunteer_profiles.user_id AS ok","loc":{"a":46487,"b":47522,"line":1539,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     onboarded = FALSE,
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         users_training_courses.complete AS training_course_complete,
 *         users_training_courses.user_id,
 *         users_quizzes.passed AS training_quiz_passed
 *     FROM
 *         users_training_courses
 *     LEFT JOIN (
 *         SELECT
 *             users_quizzes.passed,
 *             users_quizzes.user_id,
 *             quizzes.name
 *         FROM
 *             users_quizzes
 *             LEFT JOIN quizzes ON users_quizzes.quiz_id = quizzes.id) AS users_quizzes ON users_quizzes.user_id = users_training_courses.user_id
 *             AND users_quizzes.name = 'upchieve101') AS subquery
 * WHERE
 *     volunteer_profiles.onboarded IS TRUE
 *     AND volunteer_profiles.created_at >= '2022-01-01 00:00:00.000000+00'
 *     AND subquery.training_course_complete IS TRUE
 *     AND (subquery.training_quiz_passed IS FALSE
 *         OR subquery.training_quiz_passed IS NULL)
 * AND volunteer_profiles.user_id = subquery.user_id
 * RETURNING
 *     volunteer_profiles.user_id AS ok
 * ```
 */
export const removeOnboardedStatusForUnqualifiedVolunteers = new PreparedQuery<IRemoveOnboardedStatusForUnqualifiedVolunteersParams,IRemoveOnboardedStatusForUnqualifiedVolunteersResult>(removeOnboardedStatusForUnqualifiedVolunteersIR);


