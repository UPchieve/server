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

const getVolunteersForBlackoutOverIR: any = {"name":"getVolunteersForBlackoutOver","params":[{"name":"startDate","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1420,"b":1429,"line":52,"col":30}]}}],"usedParamSet":{"startDate":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.last_activity_at < :startDate!\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE","loc":{"a":1053,"b":1527,"line":40,"col":0}}};

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

const getVolunteerForQuickTipsIR: any = {"name":"getVolunteerForQuickTips","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1924,"b":1929,"line":70,"col":25}]}},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1962,"b":1972,"line":71,"col":31}]}}],"usedParamSet":{"userId":true,"mongoUserId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE (users.id::uuid = :userId\n    OR users.mongo_id::text = :mongoUserId)\nAND volunteer_profiles.onboarded IS TRUE\nAND users.banned IS FALSE\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE","loc":{"a":1568,"b":2100,"line":59,"col":0}}};

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

const getPartnerVolunteerForLowHoursIR: any = {"name":"getPartnerVolunteerForLowHours","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2630,"b":2635,"line":96,"col":37},{"a":2689,"b":2694,"line":97,"col":25}]}},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2727,"b":2737,"line":98,"col":31}]}}],"usedParamSet":{"userId":true,"mongoUserId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = :userId) AS total_sessions ON TRUE\nWHERE (users.id::uuid = :userId\n    OR users.mongo_id::text = :mongoUserId)\nAND volunteer_profiles.onboarded IS TRUE\nAND volunteer_profiles.volunteer_partner_org_id IS NOT NULL\nAND users.banned IS FALSE\nAND users.deactivated IS FALSE\nAND total_sessions.total > 0\nAND users.test_user IS FALSE","loc":{"a":2148,"b":2954,"line":79,"col":0}}};

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


/** 'GetPartnerVolunteerForCollege' parameters type */
export interface IGetPartnerVolunteerForCollegeParams {
  mongoUserId: string | null | void;
  userId: string | null | void;
}

/** 'GetPartnerVolunteerForCollege' return type */
export interface IGetPartnerVolunteerForCollegeResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetPartnerVolunteerForCollege' query type */
export interface IGetPartnerVolunteerForCollegeQuery {
  params: IGetPartnerVolunteerForCollegeParams;
  result: IGetPartnerVolunteerForCollegeResult;
}

const getPartnerVolunteerForCollegeIR: any = {"name":"getPartnerVolunteerForCollege","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4239,"b":4244,"line":144,"col":34},{"a":4513,"b":4518,"line":150,"col":25}]}},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4289,"b":4299,"line":145,"col":43},{"a":4551,"b":4561,"line":151,"col":31}]}}],"usedParamSet":{"userId":true,"mongoUserId":true},"statement":{"body":"WITH CTE AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n)\nSELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN (\n        SELECT\n            array_agg(DISTINCT subjects_unlocked.topic) AS topics\n        FROM (\n            SELECT\n                subjects.name AS subject,\n                topics.name AS topic\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN users ON users.id = users_certifications.user_id\n                JOIN topics ON topics.id = subjects.topic_id\n                JOIN CTE ON CTE.name = subjects.name\n            WHERE\n                users.id::uuid = :userId\n                OR users.mongo_id::text = :mongoUserId\n            GROUP BY\n                subjects.name, CTE.total, topics.name\n            HAVING\n                COUNT(*)::int >= CTE.total) AS subjects_unlocked) AS topics_unlocked ON TRUE\nWHERE (users.id::uuid = :userId\n    OR users.mongo_id::text = :mongoUserId)\nAND volunteer_profiles.onboarded IS TRUE\nAND array_length(topics_unlocked.topics, 1) = 1\n    AND topics_unlocked.topics = ARRAY['college']\n    AND volunteer_profiles.volunteer_partner_org_id IS NOT NULL\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE","loc":{"a":3001,"b":4863,"line":108,"col":0}}};

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
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN (
 *         SELECT
 *             array_agg(DISTINCT subjects_unlocked.topic) AS topics
 *         FROM (
 *             SELECT
 *                 subjects.name AS subject,
 *                 topics.name AS topic
 *             FROM
 *                 users_certifications
 *                 JOIN certification_subject_unlocks USING (certification_id)
 *                 JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *                 JOIN users ON users.id = users_certifications.user_id
 *                 JOIN topics ON topics.id = subjects.topic_id
 *                 JOIN CTE ON CTE.name = subjects.name
 *             WHERE
 *                 users.id::uuid = :userId
 *                 OR users.mongo_id::text = :mongoUserId
 *             GROUP BY
 *                 subjects.name, CTE.total, topics.name
 *             HAVING
 *                 COUNT(*)::int >= CTE.total) AS subjects_unlocked) AS topics_unlocked ON TRUE
 * WHERE (users.id::uuid = :userId
 *     OR users.mongo_id::text = :mongoUserId)
 * AND volunteer_profiles.onboarded IS TRUE
 * AND array_length(topics_unlocked.topics, 1) = 1
 *     AND topics_unlocked.topics = ARRAY['college']
 *     AND volunteer_profiles.volunteer_partner_org_id IS NOT NULL
 *     AND users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 * ```
 */
export const getPartnerVolunteerForCollege = new PreparedQuery<IGetPartnerVolunteerForCollegeParams,IGetPartnerVolunteerForCollegeResult>(getPartnerVolunteerForCollegeIR);


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

const getVolunteersForWeeklyHourSummaryIR: any = {"name":"getVolunteersForWeeklyHourSummary","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    sent_hour_summary_intro_email\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id\nWHERE (volunteer_partner_orgs.id IS NULL\n    OR volunteer_partner_orgs.receive_weekly_hour_summary_email IS TRUE)\nAND users.banned IS FALSE\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE\nGROUP BY\n    users.id,\n    volunteer_partner_org,\n    sent_hour_summary_intro_email","loc":{"a":4914,"b":5636,"line":162,"col":0}}};

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
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
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

const updateVolunteerHourSummaryIntroByIdIR: any = {"name":"updateVolunteerHourSummaryIntroById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5809,"b":5815,"line":193,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_hour_summary_intro_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":5689,"b":5843,"line":187,"col":0}}};

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

const updateVolunteerThroughAvailabilityIR: any = {"name":"updateVolunteerThroughAvailability","params":[{"name":"timezone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5954,"b":5961,"line":202,"col":25}]}},{"name":"onboarded","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6001,"b":6009,"line":203,"col":26}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6068,"b":6074,"line":206,"col":15}]}}],"usedParamSet":{"timezone":true,"onboarded":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    timezone = COALESCE(:timezone, timezone),\n    onboarded = COALESCE(:onboarded, onboarded),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":5895,"b":6102,"line":199,"col":0}}};

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

const getVolunteerIdsForElapsedAvailabilityIR: any = {"name":"getVolunteerIdsForElapsedAvailability","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    user_id\nFROM\n    volunteer_profiles\n    LEFT JOIN users ON volunteer_profiles.user_id = users.id\nWHERE\n    users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE","loc":{"a":6157,"b":6422,"line":212,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id
 * FROM
 *     volunteer_profiles
 *     LEFT JOIN users ON volunteer_profiles.user_id = users.id
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

const getVolunteersForTotalHoursIR: any = {"name":"getVolunteersForTotalHours","params":[{"name":"targetPartnerOrgs","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6806,"b":6823,"line":233,"col":39}]}}],"usedParamSet":{"targetPartnerOrgs":true},"statement":{"body":"SELECT\n    users.id\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id\nWHERE\n    volunteer_partner_orgs.key = ANY (:targetPartnerOrgs!)\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\nGROUP BY\n    users.id","loc":{"a":6466,"b":7033,"line":225,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id
 * FROM
 *     users
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
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

const getVolunteerForOnboardingByIdIR: any = {"name":"getVolunteerForOnboardingById","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8119,"b":8124,"line":276,"col":30},{"a":8628,"b":8633,"line":289,"col":27}]}},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8165,"b":8175,"line":277,"col":39},{"a":8670,"b":8680,"line":290,"col":35}]}}],"usedParamSet":{"userId":true,"mongoUserId":true},"statement":{"body":"WITH CTE AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n)\nSELECT\n    users.id,\n    email,\n    first_name,\n    volunteer_profiles.onboarded,\n    COALESCE(array_agg(subjects_unlocked.subject) FILTER (WHERE subjects_unlocked.subject IS NOT NULL), '{}') AS subjects,\n    country,\n    MAX(availabilities.updated_at) AS availability_last_modified_at\nFROM\n    users\n    LEFT JOIN (\n        SELECT\n            subjects.name AS subject,\n            COUNT(*)::int AS earned_certs,\n            CTE.total\n        FROM\n            users_certifications\n            JOIN certification_subject_unlocks USING (certification_id)\n            JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n            JOIN users ON users.id = users_certifications.user_id\n            JOIN CTE ON CTE.name = subjects.name\n        WHERE\n            users.id::uuid = :userId\n            OR users.mongo_id::text = :mongoUserId\n        GROUP BY\n            subjects.name, CTE.total\n        HAVING\n            COUNT(*)::int >= CTE.total) AS subjects_unlocked ON TRUE\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN availabilities ON availabilities.user_id = users.id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS FALSE\n    AND (users.id::uuid = :userId\n        OR users.mongo_id::text = :mongoUserId)\nGROUP BY\n    users.id,\n    onboarded,\n    country","loc":{"a":7080,"b":8731,"line":244,"col":0}}};

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
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
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

const getVolunteersForTelecomReportIR: any = {"name":"getVolunteersForTelecomReport","params":[{"name":"partnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9160,"b":9170,"line":310,"col":34}]}}],"usedParamSet":{"partnerOrg":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    users.created_at\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    volunteer_partner_orgs.key = :partnerOrg!\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE\nGROUP BY\n    users.id,\n    volunteer_partner_org","loc":{"a":8778,"b":9406,"line":298,"col":0}}};

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
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
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

const getVolunteersNotifiedSinceDateIR: any = {"name":"getVolunteersNotifiedSinceDate","params":[{"name":"sinceDate","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9616,"b":9625,"line":330,"col":34}]}}],"usedParamSet":{"sinceDate":true},"statement":{"body":"SELECT\n    users.id\nFROM\n    users\n    LEFT JOIN notifications ON users.id = notifications.user_id\nGROUP BY\n    users.id\nHAVING\n    MAX(notifications.sent_at) > :sinceDate!","loc":{"a":9454,"b":9625,"line":322,"col":0}}};

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

const getVolunteersNotifiedBySessionIdIR: any = {"name":"getVolunteersNotifiedBySessionId","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9769,"b":9778,"line":339,"col":32}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    notifications.user_id\nFROM\n    notifications\nWHERE\n    notifications.session_id = :sessionId!","loc":{"a":9675,"b":9778,"line":334,"col":0}}};

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

const getVolunteerByReferenceIR: any = {"name":"getVolunteerByReference","params":[{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9993,"b":10004,"line":349,"col":31}]}}],"usedParamSet":{"referenceId":true},"statement":{"body":"SELECT\n    volunteer_references.user_id AS volunteer_id,\n    volunteer_references.email AS reference_email\nFROM\n    volunteer_references\nWHERE\n    volunteer_references.id = :referenceId!\nLIMIT 1","loc":{"a":9819,"b":10012,"line":343,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_references.user_id AS volunteer_id,
 *     volunteer_references.email AS reference_email
 * FROM
 *     volunteer_references
 * WHERE
 *     volunteer_references.id = :referenceId!
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

const addVolunteerReferenceByIdIR: any = {"name":"addVolunteerReferenceById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10179,"b":10181,"line":356,"col":5}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10189,"b":10195,"line":357,"col":5}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10203,"b":10212,"line":358,"col":5}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10220,"b":10228,"line":359,"col":5}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10236,"b":10241,"line":360,"col":5}]}}],"usedParamSet":{"id":true,"userId":true,"firstName":true,"lastName":true,"email":true},"statement":{"body":"INSERT INTO volunteer_references (id, user_id, first_name, last_name, email, status_id, created_at, updated_at)\nSELECT\n    :id!,\n    :userId!,\n    :firstName!,\n    :lastName!,\n    :email!,\n    volunteer_reference_statuses.id,\n    NOW(),\n    NOW()\nFROM\n    volunteer_reference_statuses\nWHERE\n    name = 'unsent'::text\nON CONFLICT (user_id,\n    email)\n    DO NOTHING\nRETURNING\n    id AS ok","loc":{"a":10055,"b":10441,"line":354,"col":0}}};

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
 * ON CONFLICT (user_id,
 *     email)
 *     DO NOTHING
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

const updateVolunteerReferenceSubmissionIR: any = {"name":"updateVolunteerReferenceSubmission","params":[{"name":"affiliation","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10586,"b":10596,"line":380,"col":28}]}},{"name":"relationshipLength","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10649,"b":10666,"line":381,"col":36}]}},{"name":"rejectionReason","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10724,"b":10738,"line":382,"col":33}]}},{"name":"additionalInfo","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10792,"b":10805,"line":383,"col":32}]}},{"name":"patient","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10850,"b":10856,"line":384,"col":24}]}},{"name":"positiveRoleModel","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10905,"b":10921,"line":385,"col":36}]}},{"name":"agreeableAndApproachable","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10989,"b":11012,"line":386,"col":43}]}},{"name":"communicatesEffectively","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11085,"b":11107,"line":387,"col":41}]}},{"name":"trustworthyWithChildren","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11179,"b":11201,"line":388,"col":42}]}},{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11417,"b":11428,"line":398,"col":31}]}}],"usedParamSet":{"affiliation":true,"relationshipLength":true,"rejectionReason":true,"additionalInfo":true,"patient":true,"positiveRoleModel":true,"agreeableAndApproachable":true,"communicatesEffectively":true,"trustworthyWithChildren":true,"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    affiliation = COALESCE(:affiliation, affiliation),\n    relationship_length = COALESCE(:relationshipLength, relationship_length),\n    rejection_reason = COALESCE(:rejectionReason, rejection_reason),\n    additional_info = COALESCE(:additionalInfo, additional_info),\n    patient = COALESCE(:patient, patient),\n    positive_role_model = COALESCE(:positiveRoleModel, positive_role_model),\n    agreeable_and_approachable = COALESCE(:agreeableAndApproachable, agreeable_and_approachable),\n    communicates_effectively = COALESCE(:communicatesEffectively, communicates_effectively),\n    trustworthy_with_children = COALESCE(:trustworthyWithChildren, trustworthy_with_children),\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = 'submitted') AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":10493,"b":11472,"line":376,"col":0}}};

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

const getInactiveVolunteersIR: any = {"name":"getInactiveVolunteers","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11879,"b":11884,"line":416,"col":31}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11920,"b":11923,"line":417,"col":34}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.last_activity_at >= :start!\n    AND users.last_activity_at < :end!\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE","loc":{"a":11511,"b":12021,"line":404,"col":0}}};

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

const updateVolunteerReferenceSentByIdIR: any = {"name":"updateVolunteerReferenceSentById","params":[{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12337,"b":12348,"line":438,"col":31}]}}],"usedParamSet":{"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    sent_at = NOW(),\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = 'sent') AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":12071,"b":12392,"line":424,"col":0}}};

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

const updateVolunteerReferenceStatusByIdIR: any = {"name":"updateVolunteerReferenceStatusById","params":[{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12654,"b":12660,"line":456,"col":16}]}},{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12712,"b":12723,"line":458,"col":31}]}}],"usedParamSet":{"status":true,"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    sent_at = NOW(),\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":12444,"b":12767,"line":444,"col":0}}};

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

const deleteVolunteerReferenceByIdIR: any = {"name":"deleteVolunteerReferenceById","params":[{"name":"referenceEmail","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13064,"b":13078,"line":477,"col":34}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13120,"b":13126,"line":478,"col":40}]}}],"usedParamSet":{"referenceEmail":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = 'removed') AS subquery\nWHERE\n    volunteer_references.email = :referenceEmail!\n    AND volunteer_references.user_id = :userId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":12813,"b":13170,"line":464,"col":0}}};

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

const updateVolunteersReadyToCoachByIdsIR: any = {"name":"updateVolunteersReadyToCoachByIds","params":[{"name":"userIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13342,"b":13349,"line":490,"col":20}]}}],"usedParamSet":{"userIds":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_ready_to_coach_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = ANY (:userIds!)\nRETURNING\n    user_id AS ok","loc":{"a":13221,"b":13378,"line":484,"col":0}}};

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

const updateVolunteerElapsedAvailabilityByIdIR: any = {"name":"updateVolunteerElapsedAvailabilityById","params":[{"name":"elapsedAvailability","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13574,"b":13593,"line":502,"col":46}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13675,"b":13681,"line":506,"col":19},{"a":13717,"b":13723,"line":508,"col":15}]}}],"usedParamSet":{"elapsedAvailability":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    elapsed_availability = subquery.total\nFROM (\n    SELECT\n        COALESCE(elapsed_availability, 0) + (:elapsedAvailability!)::int AS total\n    FROM\n        volunteer_profiles\n    WHERE\n        user_id = :userId!) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":13434,"b":13751,"line":496,"col":0}}};

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

const updateVolunteerTotalHoursByIdIR: any = {"name":"updateVolunteerTotalHoursById","params":[{"name":"totalHours","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13940,"b":13950,"line":520,"col":47}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14036,"b":14042,"line":524,"col":19},{"a":14078,"b":14084,"line":526,"col":15}]}}],"usedParamSet":{"totalHours":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    total_volunteer_hours = subquery.total\nFROM (\n    SELECT\n        COALESCE(total_volunteer_hours, 0) + (:totalHours!)::numeric AS total\n    FROM\n        volunteer_profiles\n    WHERE\n        user_id = :userId!) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":13798,"b":14112,"line":514,"col":0}}};

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

const getVolunteerTrainingCoursesIR: any = {"name":"getVolunteerTrainingCourses","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14527,"b":14533,"line":544,"col":38}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    user_id,\n    complete,\n    training_courses.name AS training_course,\n    progress,\n    completed_materials,\n    users_training_courses.created_at,\n    users_training_courses.updated_at\nFROM\n    users_training_courses\n    LEFT JOIN training_courses ON training_courses.id = users_training_courses.training_course_id\nWHERE\n    users_training_courses.user_id = :userId!","loc":{"a":14157,"b":14533,"line":532,"col":0}}};

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

const updateVolunteerTrainingByIdIR: any = {"name":"updateVolunteerTrainingById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14727,"b":14733,"line":550,"col":5}]}},{"name":"complete","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14766,"b":14774,"line":552,"col":5},{"a":15009,"b":15017,"line":564,"col":20}]}},{"name":"progress","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14782,"b":14790,"line":553,"col":5},{"a":15040,"b":15048,"line":565,"col":20}]}},{"name":"materialKey","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14805,"b":14816,"line":554,"col":12},{"a":15120,"b":15131,"line":566,"col":69},{"a":15185,"b":15196,"line":569,"col":13}]}},{"name":"trainingCourse","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14909,"b":14923,"line":560,"col":29}]}}],"usedParamSet":{"userId":true,"complete":true,"progress":true,"materialKey":true,"trainingCourse":true},"statement":{"body":"INSERT INTO users_training_courses AS ins (user_id, training_course_id, complete, progress, completed_materials, created_at, updated_at)\nSELECT\n    :userId!,\n    training_courses.id,\n    :complete!,\n    :progress!,\n    ARRAY[(:materialKey!)::text],\n    NOW(),\n    NOW()\nFROM\n    training_courses\nWHERE\n    training_courses.name = :trainingCourse!\nON CONFLICT (user_id,\n    training_course_id)\n    DO UPDATE SET\n        complete = :complete!,\n        progress = :progress!,\n        completed_materials = ARRAY_APPEND(ins.completed_materials, :materialKey!),\n        updated_at = NOW()\n    WHERE\n        NOT :materialKey! = ANY (ins.completed_materials)\n    RETURNING\n        user_id AS ok","loc":{"a":14578,"b":15264,"line":548,"col":0}}};

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

const updateVolunteerPhotoIdByIdIR: any = {"name":"updateVolunteerPhotoIdById","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15365,"b":15368,"line":578,"col":23}]}},{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15495,"b":15501,"line":586,"col":16}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15537,"b":15543,"line":588,"col":15}]}}],"usedParamSet":{"key":true,"status":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    photo_id_s3_key = :key!,\n    photo_id_status = subquery.id\nFROM (\n    SELECT\n        id\n    FROM\n        photo_id_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":15308,"b":15571,"line":575,"col":0}}};

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

const updateVolunteerSentInactive30DayEmailIR: any = {"name":"updateVolunteerSentInactive30DayEmail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15747,"b":15753,"line":600,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_thirty_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":15626,"b":15781,"line":594,"col":0}}};

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

const updateVolunteerSentInactive60DayEmailIR: any = {"name":"updateVolunteerSentInactive60DayEmail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15999,"b":16005,"line":613,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_thirty_day_email = TRUE,\n    sent_inactive_sixty_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":15836,"b":16033,"line":606,"col":0}}};

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

const updateVolunteerSentInactive90DayEmailIR: any = {"name":"updateVolunteerSentInactive90DayEmail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16209,"b":16215,"line":625,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_ninety_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":16088,"b":16243,"line":619,"col":0}}};

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

const updateVolunteerProfileByIdIR: any = {"name":"updateVolunteerProfileById","params":[{"name":"deactivated","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16336,"b":16346,"line":634,"col":28}]}},{"name":"phone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16385,"b":16389,"line":635,"col":22}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16415,"b":16421,"line":637,"col":10}]}}],"usedParamSet":{"deactivated":true,"phone":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    deactivated = COALESCE(:deactivated, deactivated),\n    phone = COALESCE(:phone, phone)\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":16287,"b":16444,"line":631,"col":0}}};

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

const getVolunteerUnsentReferencesIR: any = {"name":"getVolunteerUnsentReferences","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    volunteer_references.id,\n    user_id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_reference_statuses.name = 'unsent'","loc":{"a":16490,"b":16823,"line":643,"col":0}}};

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

const getReferencesByVolunteerIR: any = {"name":"getReferencesByVolunteer","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17174,"b":17180,"line":668,"col":36}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    volunteer_references.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_references.user_id = :userId!\n    AND volunteer_reference_statuses.name != 'removed'","loc":{"a":16865,"b":17235,"line":658,"col":0}}};

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

const getReferencesByVolunteerForAdminDetailIR: any = {"name":"getReferencesByVolunteerForAdminDetail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17816,"b":17822,"line":692,"col":36}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    volunteer_references.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status,\n    affiliation,\n    relationship_length,\n    patient,\n    positive_role_model,\n    agreeable_and_approachable,\n    communicates_effectively,\n    rejection_reason,\n    additional_info,\n    trustworthy_with_children\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_references.user_id = :userId!\n    AND volunteer_reference_statuses.name != 'removed'","loc":{"a":17291,"b":17877,"line":673,"col":0}}};

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

const getVolunteerForPendingStatusIR: any = {"name":"getVolunteerForPendingStatus","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18686,"b":18692,"line":720,"col":23},{"a":18740,"b":18746,"line":722,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_profiles.approved,\n    volunteer_profiles.onboarded,\n    volunteer_profiles.country,\n    photo_id_statuses.name AS photo_id_status,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    occupations.occupations\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    LEFT JOIN (\n        SELECT\n            array_agg(occupation) AS occupations\n        FROM\n            volunteer_occupations\n        WHERE\n            user_id = :userId!) AS occupations ON TRUE\nWHERE\n    users.id = :userId!","loc":{"a":17923,"b":18746,"line":697,"col":0}}};

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
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
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

const updateVolunteerReferenceStatusIR: any = {"name":"updateVolunteerReferenceStatus","params":[{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18983,"b":18989,"line":737,"col":16}]}},{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19041,"b":19052,"line":739,"col":31}]}}],"usedParamSet":{"status":true,"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":18794,"b":19096,"line":726,"col":0}}};

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

const updateVolunteerApprovedIR: any = {"name":"updateVolunteerApproved","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19255,"b":19261,"line":751,"col":34}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    approved = TRUE,\n    updated_at = NOW()\nWHERE\n    volunteer_profiles.user_id = :userId!\nRETURNING\n    volunteer_profiles.user_id AS ok","loc":{"a":19137,"b":19308,"line":745,"col":0}}};

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

const updateVolunteerPendingIR: any = {"name":"updateVolunteerPending","params":[{"name":"approved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19398,"b":19406,"line":760,"col":16}]}},{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19557,"b":19563,"line":769,"col":16}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19618,"b":19624,"line":771,"col":34}]}}],"usedParamSet":{"approved":true,"status":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    approved = :approved!,\n    photo_id_status = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        photo_id_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    volunteer_profiles.user_id = :userId!\nRETURNING\n    volunteer_profiles.user_id AS ok","loc":{"a":19348,"b":19671,"line":757,"col":0}}};

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

const updateVolunteerOnboardedIR: any = {"name":"updateVolunteerOnboarded","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19832,"b":19838,"line":783,"col":34}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    onboarded = TRUE,\n    updated_at = NOW()\nWHERE\n    volunteer_profiles.user_id = :userId!\nRETURNING\n    volunteer_profiles.user_id AS ok","loc":{"a":19713,"b":19885,"line":777,"col":0}}};

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

const getVolunteersForNiceToMeetYouIR: any = {"name":"getVolunteersForNiceToMeetYou","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20392,"b":20397,"line":804,"col":29}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20427,"b":20430,"line":805,"col":28}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND users.created_at >= :start!\n    AND users.created_at < :end!","loc":{"a":19932,"b":20430,"line":789,"col":0}}};

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

const getVolunteersForReadyToCoachIR: any = {"name":"getVolunteersForReadyToCoach","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN user_product_flags ON user_product_flags.user_id = users.id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE\n    AND user_product_flags.sent_ready_to_coach_email IS FALSE","loc":{"a":20476,"b":21130,"line":809,"col":0}}};

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

const getVolunteersForWaitingReferencesIR: any = {"name":"getVolunteersForWaitingReferences","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21916,"b":21921,"line":849,"col":40}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21963,"b":21966,"line":850,"col":40}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name,\n    users.last_name,\n    users.phone,\n    users.email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN volunteer_references ON volunteer_references.user_id = users.id\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_reference_statuses.name = 'sent'\n    AND volunteer_references.sent_at > :start!\n    AND volunteer_references.sent_at < :end!\nGROUP BY\n    users.id,\n    volunteer_partner_orgs.key","loc":{"a":21181,"b":22020,"line":831,"col":0}}};

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
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
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

const addVolunteerCertificationIR: any = {"name":"addVolunteerCertification","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22160,"b":22166,"line":859,"col":5}]}},{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22376,"b":22383,"line":870,"col":24}]}}],"usedParamSet":{"userId":true,"subject":true},"statement":{"body":"INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at)\nSELECT\n    :userId!,\n    subquery.id,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        certifications.id\n    FROM\n        certifications\n        JOIN quizzes ON quizzes.name = certifications.name\n    WHERE\n        quizzes.name = :subject!) AS subquery\nON CONFLICT (user_id,\n    certification_id)\n    DO NOTHING\nRETURNING\n    user_id AS ok","loc":{"a":22063,"b":22483,"line":857,"col":0}}};

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

const updateVolunteerQuizIR: any = {"name":"updateVolunteerQuiz","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22626,"b":22632,"line":881,"col":5}]}},{"name":"passed","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22664,"b":22670,"line":884,"col":5},{"a":22917,"b":22923,"line":898,"col":18}]}},{"name":"quiz","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22790,"b":22794,"line":893,"col":24}]}}],"usedParamSet":{"userId":true,"passed":true,"quiz":true},"statement":{"body":"INSERT INTO users_quizzes AS ins (user_id, quiz_id, attempts, passed, created_at, updated_at)\nSELECT\n    :userId!,\n    subquery.id,\n    1,\n    :passed!,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        quizzes.id\n    FROM\n        quizzes\n    WHERE\n        quizzes.name = :quiz!) AS subquery\nON CONFLICT (user_id,\n    quiz_id)\n    DO UPDATE SET\n        attempts = ins.attempts + 1,\n        passed = :passed!,\n        updated_at = NOW()\n    RETURNING\n        user_id AS ok","loc":{"a":22520,"b":22987,"line":879,"col":0}}};

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

const getVolunteersAdminAvailabilityIR: any = {"name":"getVolunteersAdminAvailability","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23267,"b":23274,"line":912,"col":25},{"a":23817,"b":23824,"line":930,"col":29}]}}],"usedParamSet":{"subject":true},"statement":{"body":"WITH certs_for_subject AS (\n    SELECT\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    WHERE\n        subjects.name = :subject!\n)\nSELECT\n    users.id\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN (\n        SELECT\n            users_certifications.user_id,\n            COUNT(*)::int AS earned_certs,\n            certs_for_subject.total\n        FROM\n            users_certifications\n            JOIN certification_subject_unlocks USING (certification_id)\n            JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n            JOIN certs_for_subject ON TRUE\n        WHERE\n            subjects.name = :subject!\n        GROUP BY\n            users_certifications.user_id, subjects.name, certs_for_subject.total\n        HAVING\n            COUNT(*)::int >= certs_for_subject.total) user_certs ON user_certs.user_id = users.id\nWHERE\n    users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND users.deactivated IS FALSE\n    AND users.banned IS FALSE","loc":{"a":23035,"b":24180,"line":905,"col":0}}};

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

const getVolunteerForTextResponseIR: any = {"name":"getVolunteerForTextResponse","params":[{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24757,"b":24762,"line":958,"col":19}]}}],"usedParamSet":{"phone":true},"statement":{"body":"SELECT\n    users.id AS volunteer_id,\n    sessions.id AS session_id,\n    sessions.volunteer_joined_at,\n    sessions.ended_at,\n    subjects.name AS subject,\n    topics.name AS topic\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN notifications ON notifications.user_id = users.id\n    LEFT JOIN sessions ON sessions.id = notifications.session_id\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\nWHERE\n    users.phone = :phone!\nORDER BY\n    notifications.created_at DESC\nLIMIT 1","loc":{"a":24225,"b":24813,"line":943,"col":0}}};

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

const getVolunteersToReviewIR: any = {"name":"getVolunteersToReview","params":[{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26364,"b":26369,"line":1002,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26386,"b":26392,"line":1002,"col":30}]}}],"usedParamSet":{"limit":true,"offset":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name AS first_name,\n    users.last_name AS last_name,\n    users.first_name AS firstname,\n    users.last_name AS lastname,\n    users.email,\n    users.created_at,\n    MAX(user_actions.created_at) AS ready_for_review_at\nFROM\n    users\n    JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\n    JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    JOIN (\n        SELECT\n            user_id,\n            count(*) AS total_references\n        FROM\n            volunteer_references\n            JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\n        WHERE\n            volunteer_reference_statuses.name = ANY ('{ \"submitted\", \"approved\" }')\n        GROUP BY\n            user_id) AS reference_count ON reference_count.user_id = users.id\n    JOIN volunteer_occupations ON volunteer_occupations.user_id = users.id -- user is only ready for review if they submitted background info\n    JOIN user_actions ON user_actions.user_id = users.id\nWHERE\n    volunteer_profiles.approved IS FALSE\n    AND NOT volunteer_profiles.country IS NULL\n    AND NOT volunteer_profiles.photo_id_s3_key IS NULL\n    AND photo_id_statuses.name = ANY ('{ \"submitted\", \"approved\" }')\n    AND user_actions.action = ANY ('{ \"ADDED PHOTO ID\", \"SUBMITTED REFERENCE FORM\", \"COMPLETED BACKGROUND INFO\" }')\n    AND reference_count.total_references = 2\nGROUP BY\n    users.id\nORDER BY\n    ready_for_review_at ASC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":24852,"b":26398,"line":965,"col":0}}};

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

const getReferencesToFollowupIR: any = {"name":"getReferencesToFollowup","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27240,"b":27245,"line":1024,"col":40}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27287,"b":27290,"line":1025,"col":40}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id AS volunteer_id,\n    users.first_name AS volunteer_first_name,\n    users.last_name AS volunteer_last_name,\n    volunteer_references.id AS reference_id,\n    volunteer_references.first_name AS reference_first_name,\n    volunteer_references.last_name AS reference_last_name,\n    volunteer_references.email AS reference_email\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN volunteer_references ON volunteer_references.user_id = users.id\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_reference_statuses.name = 'sent'\n    AND volunteer_references.sent_at > :start!\n    AND volunteer_references.sent_at < :end!","loc":{"a":26439,"b":27290,"line":1006,"col":0}}};

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

const updateVolunteerBackgroundInfoIR: any = {"name":"updateVolunteerBackgroundInfo","params":[{"name":"occupation","codeRefs":{"defined":{"a":27343,"b":27352,"line":1030,"col":8},"used":[{"a":27620,"b":27630,"line":1039,"col":13}]},"transform":{"type":"pick_array_spread","keys":[{"name":"userId","required":false},{"name":"occupation","required":false},{"name":"createdAt","required":false},{"name":"updatedAt","required":false}]},"required":true},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27488,"b":27494,"line":1034,"col":21},{"a":28278,"b":28284,"line":1056,"col":23}]}},{"name":"approved","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27767,"b":27774,"line":1045,"col":33}]}},{"name":"experience","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27823,"b":27832,"line":1046,"col":35}]}},{"name":"company","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27880,"b":27886,"line":1047,"col":32}]}},{"name":"college","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27931,"b":27937,"line":1048,"col":32}]}},{"name":"linkedInUrl","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27987,"b":27997,"line":1049,"col":37}]}},{"name":"country","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28047,"b":28053,"line":1050,"col":32}]}},{"name":"state","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28096,"b":28100,"line":1051,"col":30}]}},{"name":"city","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28140,"b":28143,"line":1052,"col":29}]}},{"name":"languages","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28187,"b":28195,"line":1053,"col":34}]}}],"usedParamSet":{"userId":true,"occupation":true,"approved":true,"experience":true,"company":true,"college":true,"linkedInUrl":true,"country":true,"state":true,"city":true,"languages":true},"statement":{"body":"WITH clear_occ AS (\n    DELETE FROM volunteer_occupations\n    WHERE user_id = :userId!\n),\nins_occ AS (\nINSERT INTO volunteer_occupations (user_id, occupation, created_at, updated_at)\n        VALUES\n            :occupation!\n        ON CONFLICT\n            DO NOTHING)\n        UPDATE\n            volunteer_profiles\n        SET\n            approved = COALESCE(:approved, approved),\n            experience = COALESCE(:experience, experience),\n            company = COALESCE(:company, company),\n            college = COALESCE(:college, college),\n            linkedin_url = COALESCE(:linkedInUrl, linkedin_url),\n            country = COALESCE(:country, country),\n            state = COALESCE(:state, state),\n            city = COALESCE(:city, city),\n            languages = COALESCE(:languages, languages),\n            updated_at = NOW()\n        WHERE\n            user_id = :userId!\n        RETURNING\n            user_id AS ok","loc":{"a":27409,"b":28328,"line":1032,"col":0}}};

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

const getQuizzesPassedForDateRangeIR: any = {"name":"getQuizzesPassedForDateRange","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28452,"b":28458,"line":1067,"col":15}]}},{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28483,"b":28488,"line":1068,"col":23}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28513,"b":28516,"line":1069,"col":23}]}}],"usedParamSet":{"userId":true,"start":true,"end":true},"statement":{"body":"SELECT\n    COUNT(*)::int AS total\nFROM\n    users_quizzes\nWHERE\n    user_id = :userId!\n    AND updated_at >= :start!\n    AND updated_at <= :end!\n    AND passed IS TRUE","loc":{"a":28374,"b":28539,"line":1062,"col":0}}};

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

const updateVolunteerUserForAdminIR: any = {"name":"updateVolunteerUserForAdmin","params":[{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28623,"b":28632,"line":1077,"col":18}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28652,"b":28660,"line":1078,"col":17}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28676,"b":28681,"line":1079,"col":13}]}},{"name":"isVerified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28700,"b":28710,"line":1080,"col":16}]}},{"name":"isBanned","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28727,"b":28735,"line":1081,"col":14}]}},{"name":"isDeactivated","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28757,"b":28770,"line":1082,"col":19}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28794,"b":28800,"line":1084,"col":16}]}}],"usedParamSet":{"firstName":true,"lastName":true,"email":true,"isVerified":true,"isBanned":true,"isDeactivated":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    first_name = :firstName!,\n    last_name = :lastName!,\n    email = :email!,\n    verified = :isVerified!,\n    banned = :isBanned!,\n    deactivated = :isDeactivated!\nWHERE\n    users.id = :userId!\nRETURNING\n    id AS ok","loc":{"a":28584,"b":28823,"line":1074,"col":0}}};

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

const updateVolunteerProfilesForAdminIR: any = {"name":"updateVolunteerProfilesForAdmin","params":[{"name":"partnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28938,"b":28949,"line":1093,"col":32}]}},{"name":"approved","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28977,"b":28984,"line":1094,"col":25}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29018,"b":29024,"line":1096,"col":15}]}}],"usedParamSet":{"partnerOrgId":true,"approved":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    volunteer_partner_org_id = :partnerOrgId,\n    approved = COALESCE(:approved, approved)\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":28872,"b":29052,"line":1090,"col":0}}};

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

const createVolunteerUserIR: any = {"name":"createVolunteerUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29234,"b":29240,"line":1103,"col":13}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29244,"b":29249,"line":1103,"col":23}]}},{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29253,"b":29258,"line":1103,"col":32}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29262,"b":29271,"line":1103,"col":41}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29275,"b":29283,"line":1103,"col":54}]}},{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29287,"b":29295,"line":1103,"col":66}]}},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29306,"b":29315,"line":1103,"col":85}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29319,"b":29331,"line":1103,"col":98}]}}],"usedParamSet":{"userId":true,"email":true,"phone":true,"firstName":true,"lastName":true,"password":true,"referredBy":true,"referralCode":true},"statement":{"body":"INSERT INTO users (id, email, phone, first_name, last_name, PASSWORD, verified, referred_by, referral_code, created_at, updated_at)\n    VALUES (:userId!, :email!, :phone!, :firstName!, :lastName!, :password!, FALSE, :referredBy, :referralCode!, NOW(), NOW())\nON CONFLICT (email)\n    DO NOTHING\nRETURNING\n    id, email, first_name, last_name, phone, banned, test_user, deactivated, created_at","loc":{"a":29089,"b":29479,"line":1102,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (id, email, phone, first_name, last_name, PASSWORD, verified, referred_by, referral_code, created_at, updated_at)
 *     VALUES (:userId!, :email!, :phone!, :firstName!, :lastName!, :password!, FALSE, :referredBy, :referralCode!, NOW(), NOW())
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

const getVolunteerPartnerOrgIdByKeyIR: any = {"name":"getVolunteerPartnerOrgIdByKey","params":[{"name":"volunteerPartnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29589,"b":29608,"line":1116,"col":11}]}}],"usedParamSet":{"volunteerPartnerOrg":true},"statement":{"body":"SELECT\n    id\nFROM\n    volunteer_partner_orgs\nWHERE\n    KEY = :volunteerPartnerOrg!","loc":{"a":29526,"b":29608,"line":1111,"col":0}}};

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

const createVolunteerProfileIR: any = {"name":"createVolunteerProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29772,"b":29778,"line":1121,"col":13}]}},{"name":"partnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29789,"b":29800,"line":1121,"col":30}]}},{"name":"timezone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29804,"b":29811,"line":1121,"col":45}]}}],"usedParamSet":{"userId":true,"partnerOrgId":true,"timezone":true},"statement":{"body":"INSERT INTO volunteer_profiles (user_id, approved, volunteer_partner_org_id, timezone, created_at, updated_at)\n    VALUES (:userId!, FALSE, :partnerOrgId, :timezone, NOW(), NOW())\nRETURNING\n    user_id AS ok","loc":{"a":29648,"b":29854,"line":1120,"col":0}}};

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


/** 'GetCertificationsForVolunteers' parameters type */
export interface IGetCertificationsForVolunteersParams {
  userIds: stringArray;
}

/** 'GetCertificationsForVolunteers' return type */
export interface IGetCertificationsForVolunteersResult {
  lastAttemptedAt: Date;
  name: string;
  passed: boolean;
  tries: number;
  userId: string;
}

/** 'GetCertificationsForVolunteers' query type */
export interface IGetCertificationsForVolunteersQuery {
  params: IGetCertificationsForVolunteersParams;
  result: IGetCertificationsForVolunteersResult;
}

const getCertificationsForVolunteersIR: any = {"name":"getCertificationsForVolunteers","params":[{"name":"userIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":30129,"b":30136,"line":1137,"col":20}]}}],"usedParamSet":{"userIds":true},"statement":{"body":"SELECT\n    user_id,\n    attempts AS tries,\n    users_quizzes.updated_at AS last_attempted_at,\n    passed,\n    quizzes.name\nFROM\n    users_quizzes\n    JOIN quizzes ON users_quizzes.quiz_id = quizzes.id\nWHERE\n    user_id = ANY (:userIds!)","loc":{"a":29902,"b":30137,"line":1127,"col":0}}};

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
export const getCertificationsForVolunteers = new PreparedQuery<IGetCertificationsForVolunteersParams,IGetCertificationsForVolunteersResult>(getCertificationsForVolunteersIR);


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

const getSubjectsForVolunteerIR: any = {"name":"getSubjectsForVolunteer","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":30887,"b":30893,"line":1164,"col":19}]}}],"usedParamSet":{"userId":true},"statement":{"body":"WITH subject_cert_total AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n)\nSELECT\n    subjects_unlocked.subject\nFROM (\n    SELECT\n        subjects.name AS subject,\n        COUNT(*)::int AS earned_certs,\n        subject_cert_total.total\n    FROM\n        users_certifications\n        JOIN certification_subject_unlocks USING (certification_id)\n        JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n        JOIN subject_cert_total ON subject_cert_total.name = subjects.name\n    WHERE\n        user_id = :userId!\n    GROUP BY\n        subjects.name, subject_cert_total.total\n    HAVING\n        COUNT(*)::int >= subject_cert_total.total) AS subjects_unlocked","loc":{"a":30178,"b":31037,"line":1141,"col":0}}};

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

const getNextVolunteerToNotifyIR: any = {"name":"getNextVolunteerToNotify","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":32829,"b":32836,"line":1218,"col":13}]}},{"name":"highLevelSubjects","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":32955,"b":32971,"line":1220,"col":14},{"a":33007,"b":33023,"line":1221,"col":17}]}},{"name":"disqualifiedVolunteers","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33189,"b":33210,"line":1223,"col":14},{"a":33265,"b":33286,"line":1224,"col":36}]}},{"name":"isPartner","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33345,"b":33353,"line":1226,"col":14},{"a":33390,"b":33398,"line":1227,"col":17},{"a":33499,"b":33507,"line":1229,"col":17}]}},{"name":"specificPartner","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33610,"b":33624,"line":1231,"col":15},{"a":33686,"b":33700,"line":1232,"col":45}]}},{"name":"lastNotified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33903,"b":33915,"line":1240,"col":32}]}}],"usedParamSet":{"subject":true,"highLevelSubjects":true,"disqualifiedVolunteers":true,"isPartner":true,"specificPartner":true,"lastNotified":true},"statement":{"body":"WITH subject_totals AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n),\ncandidates AS (\n    SELECT\n        users.id,\n        first_name,\n        last_name,\n        phone,\n        email,\n        volunteer_partner_orgs.key AS volunteer_partner_org\n    FROM\n        users\n        JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n        JOIN availabilities ON users.id = availabilities.user_id\n        LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n        LEFT JOIN LATERAL (\n            SELECT\n                array_agg(sub_unlocked.subject)::text[] AS subjects\n            FROM (\n                SELECT\n                    subjects.name AS subject\n                FROM\n                    users_certifications\n                    JOIN certification_subject_unlocks USING (certification_id)\n                    JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                    JOIN subject_totals ON subject_totals.name = subjects.name\n                WHERE\n                    users_certifications.user_id = users.id\n                GROUP BY\n                    user_id, subjects.name, subject_totals.total\n                HAVING\n                    COUNT(*)::int >= subject_totals.total) AS sub_unlocked) AS subjects_unlocked ON TRUE\n    WHERE\n        test_user IS FALSE\n        AND banned IS FALSE\n        AND deactivated IS FALSE\n        AND volunteer_profiles.onboarded IS TRUE\n        -- availabilities are all stored in EST so convert server time to EST to be safe\n        AND extract(isodow FROM (NOW() at time zone 'America/New_York')) = availabilities.weekday_id\n        AND extract(hour FROM (NOW() at time zone 'America/New_York')) >= availabilities.available_start\n        AND extract(hour FROM (NOW() at time zone 'America/New_York')) < availabilities.available_end\n        AND :subject! = ANY (subjects_unlocked.subjects)\n        AND ( -- user does not have high level subjects if provided\n            (:highLevelSubjects)::text[] IS NULL\n            OR (:highLevelSubjects)::text[] && subjects_unlocked.subjects IS FALSE)\n        AND ( -- user is not part of disqualified group (like active session volunteers) if provided\n            (:disqualifiedVolunteers)::uuid[] IS NULL\n            OR NOT users.id = ANY (:disqualifiedVolunteers))\n        AND ( -- user is partner or open\n            (:isPartner)::boolean IS NULL\n            OR (:isPartner IS FALSE\n                AND volunteer_profiles.volunteer_partner_org_id IS NULL)\n            OR (:isPartner IS TRUE\n                AND NOT volunteer_profiles.volunteer_partner_org_id IS NULL))\n        AND ((:specificPartner)::text IS NULL\n            OR volunteer_partner_orgs.key = :specificPartner)\n        AND NOT EXISTS (\n            SELECT\n                user_id\n            FROM\n                notifications\n            WHERE\n                user_id = users.id\n                AND sent_at >= :lastNotified!))\nSELECT\n    *\nFROM\n    candidates\nORDER BY\n    RANDOM()\nLIMIT 1","loc":{"a":30751,"b":33980,"line":1169,"col":0}}};

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
 *         -- availabilities are all stored in EST so convert server time to EST to be safe
 *         AND extract(isodow FROM (NOW() at time zone 'America/New_York')) = availabilities.weekday_id
 *         AND extract(hour FROM (NOW() at time zone 'America/New_York')) >= availabilities.available_start
 *         AND extract(hour FROM (NOW() at time zone 'America/New_York')) < availabilities.available_end
 *         AND :subject! = ANY (subjects_unlocked.subjects)
 *         AND ( -- user does not have high level subjects if provided
 *             (:highLevelSubjects)::text[] IS NULL
 *             OR (:highLevelSubjects)::text[] && subjects_unlocked.subjects IS FALSE)
 *         AND ( -- user is not part of disqualified group (like active session volunteers) if provided
 *             (:disqualifiedVolunteers)::uuid[] IS NULL
 *             OR NOT users.id = ANY (:disqualifiedVolunteers))
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
  subjects: stringArray | null;
  volunteerPartnerOrg: string;
}

/** 'GetVolunteerForScheduleUpdate' query type */
export interface IGetVolunteerForScheduleUpdateQuery {
  params: IGetVolunteerForScheduleUpdateParams;
  result: IGetVolunteerForScheduleUpdateResult;
}

const getVolunteerForScheduleUpdateIR: any = {"name":"getVolunteerForScheduleUpdate","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":35638,"b":35644,"line":1290,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    volunteer_profiles.onboarded,\n    subjects_unlocked.subjects\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(sub_unlocked.subject) AS subjects\n        FROM (\n            SELECT\n                user_id,\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_total.total\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        certification_subject_unlocks\n                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_total ON subject_total.name = subjects.name\n                WHERE\n                    users_certifications.user_id = users.id\n                GROUP BY\n                    user_id,\n                    subjects.name,\n                    subject_total.total\n                HAVING\n                    COUNT(*)::int >= subject_total.total) AS sub_unlocked) AS subjects_unlocked ON TRUE\nWHERE\n    users.id = :userId!\nLIMIT 1","loc":{"a":34027,"b":35652,"line":1251,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     volunteer_profiles.onboarded,
 *     subjects_unlocked.subjects
 * FROM
 *     users
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
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

const getVolunteersOnDeckIR: any = {"name":"getVolunteersOnDeck","params":[{"name":"excludedIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":37454,"b":37465,"line":1340,"col":29}]}},{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":37812,"b":37819,"line":1344,"col":37}]}}],"usedParamSet":{"excludedIds":true,"subject":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN availabilities ON users.id = availabilities.user_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    JOIN (\n        SELECT\n            sub_unlocked.user_id,\n            subjects.name AS subject\n        FROM (\n            SELECT\n                user_id,\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_total.total\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        certification_subject_unlocks\n                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_total ON subject_total.name = subjects.name\n                GROUP BY\n                    user_id,\n                    subjects.name,\n                    subject_total.total\n                HAVING\n                    COUNT(*)::int >= subject_total.total) AS sub_unlocked\n                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id\nWHERE\n    test_user IS FALSE\n    AND banned IS FALSE\n    AND deactivated IS FALSE\n    AND NOT users.id = ANY (:excludedIds!)\nAND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end\n    AND subjects_unlocked.subject = :subject!","loc":{"a":35689,"b":37819,"line":1295,"col":0}}};

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
 * AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id
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

const getUniqueStudentsHelpedForAnalyticsReportSummaryIR: any = {"name":"getUniqueStudentsHelpedForAnalyticsReportSummary","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":38045,"b":38050,"line":1350,"col":62},{"a":38642,"b":38647,"line":1362,"col":62}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":38096,"b":38099,"line":1351,"col":44},{"a":38693,"b":38696,"line":1363,"col":44}]}},{"name":"studentPartnerOrgIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":38338,"b":38358,"line":1356,"col":86},{"a":38767,"b":38787,"line":1364,"col":69}]}},{"name":"studentSchoolIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":38415,"b":38431,"line":1357,"col":54},{"a":38848,"b":38864,"line":1365,"col":58}]}},{"name":"volunteerPartnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":39364,"b":39383,"line":1376,"col":34}]}}],"usedParamSet":{"start":true,"end":true,"studentPartnerOrgIds":true,"studentSchoolIds":true,"volunteerPartnerOrg":true},"statement":{"body":"SELECT\n    COALESCE(COUNT(DISTINCT sessions.student_id), 0)::int AS total_unique_students_helped,\n    COALESCE(COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                AND sessions.created_at <= :end! THEN\n                sessions.student_id\n            ELSE\n                NULL\n            END), 0)::int AS total_unique_students_helped_within_range,\n    COALESCE(COUNT(DISTINCT CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                sessions.student_id\n            ELSE\n                NULL\n            END), 0)::int AS total_unique_partner_students_helped,\n    COALESCE(COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                AND sessions.created_at <= :end!\n                AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                sessions.student_id\n            ELSE\n                NULL\n            END), 0)::int AS total_unique_partner_students_helped_within_range\nFROM\n    volunteer_partner_orgs\n    LEFT JOIN volunteer_profiles ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN sessions ON volunteer_profiles.user_id = sessions.volunteer_id\n    LEFT JOIN student_profiles ON sessions.student_id = student_profiles.user_id\nWHERE\n    volunteer_partner_orgs.key = :volunteerPartnerOrg!","loc":{"a":37885,"b":39383,"line":1348,"col":0}}};

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
  isDeactivated: boolean;
  isOnboarded: boolean;
  lastActivityAt: Date | null;
  lastName: string;
  state: string | null;
  totalNotifications: number | null;
  totalNotificationsWithinRange: number | null;
  totalPartnerSessions: number | null;
  totalPartnerSessionsWithinRange: number | null;
  totalPartnerTimeTutored: number | null;
  totalPartnerTimeTutoredWithinRange: number | null;
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

const getVolunteersForAnalyticsReportIR: any = {"name":"getVolunteersForAnalyticsReport","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":42270,"b":42275,"line":1439,"col":61},{"a":42888,"b":42893,"line":1451,"col":61},{"a":43364,"b":43369,"line":1460,"col":50},{"a":43933,"b":43938,"line":1474,"col":50},{"a":44712,"b":44717,"line":1490,"col":50},{"a":45442,"b":45447,"line":1507,"col":38}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":42325,"b":42328,"line":1440,"col":48},{"a":42943,"b":42946,"line":1452,"col":48},{"a":43419,"b":43422,"line":1461,"col":48},{"a":43988,"b":43991,"line":1475,"col":48},{"a":44767,"b":44770,"line":1491,"col":48},{"a":45485,"b":45488,"line":1508,"col":36}]}},{"name":"studentPartnerOrgIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":42569,"b":42589,"line":1445,"col":85},{"a":43021,"b":43041,"line":1453,"col":73},{"a":43643,"b":43663,"line":1467,"col":74},{"a":44066,"b":44086,"line":1476,"col":73},{"a":44398,"b":44418,"line":1483,"col":74},{"a":44845,"b":44865,"line":1492,"col":73}]}},{"name":"studentSchoolIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":42650,"b":42666,"line":1446,"col":58},{"a":43106,"b":43122,"line":1454,"col":62},{"a":43724,"b":43740,"line":1468,"col":58},{"a":44151,"b":44167,"line":1477,"col":62},{"a":44479,"b":44495,"line":1484,"col":58},{"a":44930,"b":44946,"line":1493,"col":62}]}},{"name":"volunteerPartnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":45788,"b":45807,"line":1518,"col":34}]}}],"usedParamSet":{"start":true,"end":true,"studentPartnerOrgIds":true,"studentSchoolIds":true,"volunteerPartnerOrg":true},"statement":{"body":"SELECT\n    users.id AS user_id,\n    users.first_name AS first_name,\n    users.last_name AS last_name,\n    users.email AS email,\n    users.created_at AS created_at,\n    users.deactivated AS is_deactivated,\n    users.last_activity_at AS last_activity_at,\n    volunteer_profiles.state AS state,\n    volunteer_profiles.onboarded AS is_onboarded,\n    user_actions.created_at AS date_onboarded,\n    COALESCE(users_quizzes.total, 0) AS total_quizzes_passed,\n    availabilities.updated_at AS availability_last_modified_at,\n    COALESCE(sessions_stats.total_unique_students_helped, 0) AS total_unique_students_helped,\n    COALESCE(sessions_stats.total_unique_students_helped_within_range, 0) AS total_unique_students_helped_within_range,\n    COALESCE(sessions_stats.total_unique_partner_students_helped, 0) AS total_unique_partner_students_helped,\n    COALESCE(sessions_stats.total_unique_partner_students_helped_within_range, 0) AS total_unique_partner_students_helped_within_range,\n    COALESCE(sessions_stats.total_sessions, 0) AS total_sessions,\n    COALESCE(sessions_stats.total_sessions_within_range, 0) AS total_sessions_within_range,\n    COALESCE(sessions_stats.total_partner_sessions, 0) AS total_partner_sessions,\n    COALESCE(sessions_stats.total_partner_sessions_within_range, 0) AS total_partner_sessions_within_range,\n    COALESCE(sessions_stats.total_partner_time_tutored, 0) AS total_partner_time_tutored,\n    COALESCE(sessions_stats.total_partner_time_tutored_within_range, 0) AS total_partner_time_tutored_within_range,\n    COALESCE(notifications_stats.total, 0) AS total_notifications,\n    COALESCE(notifications_stats.total_within_range, 0) AS total_notifications_within_range\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id\n    LEFT JOIN (\n        SELECT\n            COUNT(*)::int AS total,\n            user_id\n        FROM\n            users_quizzes\n        WHERE\n            passed = TRUE\n        GROUP BY\n            user_id) AS users_quizzes ON users_quizzes.user_id = volunteer_profiles.user_id\n    LEFT JOIN (\n        SELECT\n            MAX(updated_at) AS updated_at,\n            user_id\n        FROM\n            availabilities\n        GROUP BY\n            user_id) AS availabilities ON availabilities.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            created_at,\n            user_id\n        FROM\n            user_actions\n        WHERE\n            action = 'ONBOARDED') AS user_actions ON user_actions.user_id = volunteer_profiles.user_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total_sessions,\n            COUNT(DISTINCT student_id)::int AS total_unique_students_helped,\n            COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end! THEN\n                    student_id\n                ELSE\n                    NULL\n                END)::int AS total_unique_students_helped_within_range,\n            COUNT(DISTINCT CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                    sessions.student_id\n                ELSE\n                    NULL\n                END)::int AS total_unique_partner_students_helped,\n            COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end!\n                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                    sessions.student_id\n                ELSE\n                    NULL\n                END)::int AS total_unique_partner_students_helped_within_range,\n            SUM(\n                CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end! THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_sessions_within_range,\n            SUM(\n                CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_partner_sessions,\n            SUM(\n                CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end!\n                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_partner_sessions_within_range,\n            SUM(\n                CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                    sessions.time_tutored\n                ELSE\n                    0\n                END)::int AS total_partner_time_tutored,\n            SUM(\n                CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end!\n                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                    sessions.time_tutored\n                ELSE\n                    0\n                END)::int AS total_partner_time_tutored_within_range\n        FROM\n            sessions\n    LEFT JOIN student_profiles ON sessions.student_id = student_profiles.user_id\nWHERE\n    volunteer_profiles.user_id = sessions.volunteer_id) AS sessions_stats ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total,\n            SUM(\n                CASE WHEN sent_at >= :start!\n                    AND sent_at <= :end! THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_within_range\n        FROM\n            notifications\n    WHERE\n        volunteer_profiles.user_id = notifications.user_id) AS notifications_stats ON TRUE\nWHERE\n    volunteer_partner_orgs.key = :volunteerPartnerOrg!\nORDER BY\n    users.created_at DESC","loc":{"a":39432,"b":45842,"line":1380,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id AS user_id,
 *     users.first_name AS first_name,
 *     users.last_name AS last_name,
 *     users.email AS email,
 *     users.created_at AS created_at,
 *     users.deactivated AS is_deactivated,
 *     users.last_activity_at AS last_activity_at,
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
 *                 END)::int AS total_partner_time_tutored,
 *             SUM(
 *                 CASE WHEN sessions.created_at >= :start!
 *                     AND sessions.created_at <= :end!
 *                     AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
 *                         OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN
 *                     sessions.time_tutored
 *                 ELSE
 *                     0
 *                 END)::int AS total_partner_time_tutored_within_range
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


