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

const getVolunteerContactInfoByIdIR: any = {"name":"getVolunteerContactInfoById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":382,"b":388,"line":13,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.id = :userId! AND  \n    users.banned IS FALSE AND\n    users.deactivated IS FALSE AND\n    users.test_user IS FALSE","loc":{"a":40,"b":488,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     users.id = :userId! AND  
 *     users.banned IS FALSE AND
 *     users.deactivated IS FALSE AND
 *     users.test_user IS FALSE
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

const getVolunteerContactInfoByIdsIR: any = {"name":"getVolunteerContactInfoByIds","params":[{"name":"userIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":879,"b":886,"line":30,"col":20}]}}],"usedParamSet":{"userIds":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.id = ANY(:userIds!) AND  \n    users.banned IS FALSE AND\n    users.deactivated IS FALSE AND\n    users.test_user IS FALSE","loc":{"a":533,"b":987,"line":19,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     users.id = ANY(:userIds!) AND  
 *     users.banned IS FALSE AND
 *     users.deactivated IS FALSE AND
 *     users.test_user IS FALSE
 * ```
 */
export const getVolunteerContactInfoByIds = new PreparedQuery<IGetVolunteerContactInfoByIdsParams,IGetVolunteerContactInfoByIdsResult>(getVolunteerContactInfoByIdsIR);


/** 'GetVolunteersForBlackoutOver' parameters type */
export interface IGetVolunteersForBlackoutOverParams {
  startDate: Date;
  userId: string;
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

const getVolunteersForBlackoutOverIR: any = {"name":"getVolunteersForBlackoutOver","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1374,"b":1380,"line":47,"col":16}]}},{"name":"startDate","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1416,"b":1425,"line":48,"col":30}]}}],"usedParamSet":{"userId":true,"startDate":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.id = :userId! AND\n    users.last_activity_at < :startDate! AND\n    users.banned IS FALSE AND\n    users.deactivated IS FALSE AND\n    users.test_user IS FALSE","loc":{"a":1032,"b":1523,"line":36,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     users.id = :userId! AND
 *     users.last_activity_at < :startDate! AND
 *     users.banned IS FALSE AND
 *     users.deactivated IS FALSE AND
 *     users.test_user IS FALSE
 * ```
 */
export const getVolunteersForBlackoutOver = new PreparedQuery<IGetVolunteersForBlackoutOverParams,IGetVolunteersForBlackoutOverResult>(getVolunteersForBlackoutOverIR);


/** 'GetVolunteerForQuickTips' parameters type */
export interface IGetVolunteerForQuickTipsParams {
  userId: string;
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

const getVolunteerForQuickTipsIR: any = {"name":"getVolunteerForQuickTips","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1905,"b":1911,"line":65,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.id = :userId! AND\n    volunteer_profiles.onboarded IS TRUE AND\n    users.banned IS FALSE AND\n    users.deactivated IS FALSE AND\n    users.test_user IS FALSE","loc":{"a":1563,"b":2054,"line":54,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     users.id = :userId! AND
 *     volunteer_profiles.onboarded IS TRUE AND
 *     users.banned IS FALSE AND
 *     users.deactivated IS FALSE AND
 *     users.test_user IS FALSE
 * ```
 */
export const getVolunteerForQuickTips = new PreparedQuery<IGetVolunteerForQuickTipsParams,IGetVolunteerForQuickTipsResult>(getVolunteerForQuickTipsIR);


/** 'GetPartnerVolunteerForLowHours' parameters type */
export interface IGetPartnerVolunteerForLowHoursParams {
  userId: string;
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

const getPartnerVolunteerForLowHoursIR: any = {"name":"getPartnerVolunteerForLowHours","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2512,"b":2518,"line":83,"col":79},{"a":2570,"b":2576,"line":86,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nLEFT JOIN (\n    SELECT COUNT(*)::INT AS total FROM sessions WHERE sessions.volunteer_id = :userId!\n) AS total_sessions ON TRUE\nWHERE\n    users.id = :userId! AND\n    volunteer_profiles.onboarded IS TRUE AND\n    volunteer_profiles.volunteer_partner_org_id IS NOT NULL AND\n    users.banned IS FALSE AND\n    users.deactivated IS FALSE AND\n    total_sessions.total > 0 AND\n    users.test_user IS FALSE","loc":{"a":2101,"b":2816,"line":72,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * LEFT JOIN (
 *     SELECT COUNT(*)::INT AS total FROM sessions WHERE sessions.volunteer_id = :userId!
 * ) AS total_sessions ON TRUE
 * WHERE
 *     users.id = :userId! AND
 *     volunteer_profiles.onboarded IS TRUE AND
 *     volunteer_profiles.volunteer_partner_org_id IS NOT NULL AND
 *     users.banned IS FALSE AND
 *     users.deactivated IS FALSE AND
 *     total_sessions.total > 0 AND
 *     users.test_user IS FALSE
 * ```
 */
export const getPartnerVolunteerForLowHours = new PreparedQuery<IGetPartnerVolunteerForLowHoursParams,IGetPartnerVolunteerForLowHoursResult>(getPartnerVolunteerForLowHoursIR);


/** 'GetPartnerVolunteerForCollege' parameters type */
export interface IGetPartnerVolunteerForCollegeParams {
  userId: string;
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

const getPartnerVolunteerForCollegeIR: any = {"name":"getPartnerVolunteerForCollege","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4019,"b":4025,"line":130,"col":24},{"a":4226,"b":4232,"line":138,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"WITH CTE AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n)\nSELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nLEFT JOIN (\n    SELECT\n        array_agg(DISTINCT subjects_unlocked.topic) AS topics\n    FROM (\n        SELECT\n            subjects.name AS subject,\n            topics.name AS topic\n        FROM\n            users_certifications\n            JOIN certification_subject_unlocks USING (certification_id)\n            JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n            JOIN users ON users.id = users_certifications.user_id\n            JOIN topics ON topics.id = subjects.topic_id\n            JOIN CTE ON CTE.name = subjects.name\n        WHERE\n            users.id = :userId!\n        GROUP BY\n            subjects.name, CTE.total, topics.name\n        HAVING\n            COUNT(*)::int >= CTE.total\n    ) AS subjects_unlocked\n) AS topics_unlocked ON TRUE\nWHERE\n    users.id = :userId! AND\n    volunteer_profiles.onboarded IS TRUE AND\n    array_length(topics_unlocked.topics, 1) = 1 AND\n    topics_unlocked.topics = ARRAY['college'] AND\n    volunteer_profiles.volunteer_partner_org_id IS NOT NULL AND\n    users.banned IS FALSE AND\n    users.deactivated IS FALSE AND\n    users.test_user IS FALSE","loc":{"a":2862,"b":4541,"line":95,"col":0}}};

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
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * LEFT JOIN (
 *     SELECT
 *         array_agg(DISTINCT subjects_unlocked.topic) AS topics
 *     FROM (
 *         SELECT
 *             subjects.name AS subject,
 *             topics.name AS topic
 *         FROM
 *             users_certifications
 *             JOIN certification_subject_unlocks USING (certification_id)
 *             JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *             JOIN users ON users.id = users_certifications.user_id
 *             JOIN topics ON topics.id = subjects.topic_id
 *             JOIN CTE ON CTE.name = subjects.name
 *         WHERE
 *             users.id = :userId!
 *         GROUP BY
 *             subjects.name, CTE.total, topics.name
 *         HAVING
 *             COUNT(*)::int >= CTE.total
 *     ) AS subjects_unlocked
 * ) AS topics_unlocked ON TRUE
 * WHERE
 *     users.id = :userId! AND
 *     volunteer_profiles.onboarded IS TRUE AND
 *     array_length(topics_unlocked.topics, 1) = 1 AND
 *     topics_unlocked.topics = ARRAY['college'] AND
 *     volunteer_profiles.volunteer_partner_org_id IS NOT NULL AND
 *     users.banned IS FALSE AND
 *     users.deactivated IS FALSE AND
 *     users.test_user IS FALSE
 * ```
 */
export const getPartnerVolunteerForCollege = new PreparedQuery<IGetPartnerVolunteerForCollegeParams,IGetPartnerVolunteerForCollegeResult>(getPartnerVolunteerForCollegeIR);


/** 'GetVolunteersForWeeklyHourSummary' parameters type */
export interface IGetVolunteersForWeeklyHourSummaryParams {
  unsubscribedPartners: stringArray;
}

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

const getVolunteersForWeeklyHourSummaryIR: any = {"name":"getVolunteersForWeeklyHourSummary","params":[{"name":"unsubscribedPartners","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5065,"b":5085,"line":161,"col":43}]}}],"usedParamSet":{"unsubscribedPartners":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.name AS volunteer_partner_org,\n    sent_hour_summary_intro_email\nFROM users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nLEFT JOIN user_product_flags ON users.id = user_product_flags.user_id\nWHERE\n    NOT volunteer_partner_orgs.name = ANY(:unsubscribedPartners!) AND\n    users.banned IS FALSE AND\n    users.deactivated IS FALSE AND\n    users.test_user IS FALSE\nGROUP BY users.id, volunteer_partner_org, sent_hour_summary_intro_email","loc":{"a":4591,"b":5256,"line":148,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.name AS volunteer_partner_org,
 *     sent_hour_summary_intro_email
 * FROM users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id
 * WHERE
 *     NOT volunteer_partner_orgs.name = ANY(:unsubscribedPartners!) AND
 *     users.banned IS FALSE AND
 *     users.deactivated IS FALSE AND
 *     users.test_user IS FALSE
 * GROUP BY users.id, volunteer_partner_org, sent_hour_summary_intro_email
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

const updateVolunteerHourSummaryIntroByIdIR: any = {"name":"updateVolunteerHourSummaryIntroById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5428,"b":5434,"line":174,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_hour_summary_intro_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":5308,"b":5462,"line":168,"col":0}}};

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

const getVolunteerIdsForElapsedAvailabilityIR: any = {"name":"getVolunteerIdsForElapsedAvailability","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    user_id\nFROM volunteer_profiles\nLEFT JOIN users ON volunteer_profiles.user_id = users.id\nWHERE\n    users.deactivated IS FALSE AND\n    users.test_user IS FALSE","loc":{"a":5517,"b":5685,"line":179,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id
 * FROM volunteer_profiles
 * LEFT JOIN users ON volunteer_profiles.user_id = users.id
 * WHERE
 *     users.deactivated IS FALSE AND
 *     users.test_user IS FALSE
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

const getVolunteersForTotalHoursIR: any = {"name":"getVolunteersForTotalHours","params":[{"name":"targetPartnerOrgs","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6052,"b":6069,"line":195,"col":39}]}}],"usedParamSet":{"targetPartnerOrgs":true},"statement":{"body":"SELECT\n    users.id\nFROM users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nLEFT JOIN user_product_flags ON users.id = user_product_flags.user_id\nWHERE\n    volunteer_partner_orgs.name = ANY(:targetPartnerOrgs!) AND\n    volunteer_profiles.onboarded IS TRUE AND\n    volunteer_profiles.approved IS TRUE AND \n    users.banned IS FALSE AND\n    users.deactivated IS FALSE AND\n    users.test_user IS FALSE\nGROUP BY users.id","loc":{"a":5728,"b":6276,"line":188,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id
 * FROM users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id
 * WHERE
 *     volunteer_partner_orgs.name = ANY(:targetPartnerOrgs!) AND
 *     volunteer_profiles.onboarded IS TRUE AND
 *     volunteer_profiles.approved IS TRUE AND 
 *     users.banned IS FALSE AND
 *     users.deactivated IS FALSE AND
 *     users.test_user IS FALSE
 * GROUP BY users.id
 * ```
 */
export const getVolunteersForTotalHours = new PreparedQuery<IGetVolunteersForTotalHoursParams,IGetVolunteersForTotalHoursResult>(getVolunteersForTotalHoursIR);


/** 'GetVolunteerForOnboardingById' parameters type */
export interface IGetVolunteerForOnboardingByIdParams {
  userId: string;
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

const getVolunteerForOnboardingByIdIR: any = {"name":"getVolunteerForOnboardingById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7230,"b":7236,"line":235,"col":20}]}}],"usedParamSet":{"userId":true},"statement":{"body":"WITH CTE AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n)\nSELECT\n    users.id,\n    email,\n    first_name,\n    volunteer_profiles.onboarded,\n    array_agg(subjects_unlocked.subject) AS subjects,\n    country,\n    MAX(availabilities.updated_at) AS availability_last_modified_at\nFROM users\nLEFT JOIN (\n    SELECT\n        subjects.name AS subject,\n        COUNT(*)::int AS earned_certs,\n        CTE.total\n    FROM\n        users_certifications\n        JOIN certification_subject_unlocks USING (certification_id)\n        JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n        JOIN users ON users.id = users_certifications.user_id\n        JOIN CTE ON CTE.name = subjects.name\n    WHERE\n        users.id = :userId!\n    GROUP BY\n        subjects.name, CTE.total\n    HAVING\n        COUNT(*)::int >= CTE.total\n) AS subjects_unlocked ON TRUE\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN availabilities ON availabilities.user_id = users.id\nWHERE\n    users.banned IS FALSE AND\n    users.deactivated IS FALSE AND\n    users.test_user IS FALSE AND\n    volunteer_profiles.onboarded IS FALSE\nGROUP BY users.id, onboarded, country","loc":{"a":6322,"b":7675,"line":204,"col":0}}};

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
 *     array_agg(subjects_unlocked.subject) AS subjects,
 *     country,
 *     MAX(availabilities.updated_at) AS availability_last_modified_at
 * FROM users
 * LEFT JOIN (
 *     SELECT
 *         subjects.name AS subject,
 *         COUNT(*)::int AS earned_certs,
 *         CTE.total
 *     FROM
 *         users_certifications
 *         JOIN certification_subject_unlocks USING (certification_id)
 *         JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *         JOIN users ON users.id = users_certifications.user_id
 *         JOIN CTE ON CTE.name = subjects.name
 *     WHERE
 *         users.id = :userId!
 *     GROUP BY
 *         subjects.name, CTE.total
 *     HAVING
 *         COUNT(*)::int >= CTE.total
 * ) AS subjects_unlocked ON TRUE
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN availabilities ON availabilities.user_id = users.id
 * WHERE
 *     users.banned IS FALSE AND
 *     users.deactivated IS FALSE AND
 *     users.test_user IS FALSE AND
 *     volunteer_profiles.onboarded IS FALSE
 * GROUP BY users.id, onboarded, country
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
  phone: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetVolunteersForTelecomReport' query type */
export interface IGetVolunteersForTelecomReportQuery {
  params: IGetVolunteersForTelecomReportParams;
  result: IGetVolunteersForTelecomReportResult;
}

const getVolunteersForTelecomReportIR: any = {"name":"getVolunteersForTelecomReport","params":[{"name":"partnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8104,"b":8114,"line":263,"col":35}]}}],"usedParamSet":{"partnerOrg":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.name AS volunteer_partner_org,\n    users.created_at\nFROM users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    volunteer_partner_orgs.name = :partnerOrg! AND\n    users.banned IS FALSE AND\n    users.deactivated IS FALSE AND\n    users.test_user IS FALSE AND\n    volunteer_profiles.onboarded IS TRUE AND\n    volunteer_profiles.approved IS TRUE\nGROUP BY users.id, volunteer_partner_org","loc":{"a":7721,"b":8342,"line":251,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.name AS volunteer_partner_org,
 *     users.created_at
 * FROM users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     volunteer_partner_orgs.name = :partnerOrg! AND
 *     users.banned IS FALSE AND
 *     users.deactivated IS FALSE AND
 *     users.test_user IS FALSE AND
 *     volunteer_profiles.onboarded IS TRUE AND
 *     volunteer_profiles.approved IS TRUE
 * GROUP BY users.id, volunteer_partner_org
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

const getVolunteersNotifiedSinceDateIR: any = {"name":"getVolunteersNotifiedSinceDate","params":[{"name":"sinceDate","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8535,"b":8544,"line":277,"col":37}]}}],"usedParamSet":{"sinceDate":true},"statement":{"body":"SELECT\n    users.id\nFROM users\nLEFT JOIN notifications ON users.id = notifications.user_id\nGROUP BY users.id\nHAVING MAX(notifications.sent_at) > :sinceDate!","loc":{"a":8389,"b":8544,"line":272,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id
 * FROM users
 * LEFT JOIN notifications ON users.id = notifications.user_id
 * GROUP BY users.id
 * HAVING MAX(notifications.sent_at) > :sinceDate!
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

const getVolunteersNotifiedBySessionIdIR: any = {"name":"getVolunteersNotifiedBySessionId","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8683,"b":8692,"line":284,"col":32}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    notifications.user_id\nFROM notifications\nWHERE\n    notifications.session_id = :sessionId!","loc":{"a":8593,"b":8692,"line":280,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     notifications.user_id
 * FROM notifications
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
  userId: string;
}

/** 'GetVolunteerByReference' query type */
export interface IGetVolunteerByReferenceQuery {
  params: IGetVolunteerByReferenceParams;
  result: IGetVolunteerByReferenceResult;
}

const getVolunteerByReferenceIR: any = {"name":"getVolunteerByReference","params":[{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8835,"b":8846,"line":291,"col":31}]}}],"usedParamSet":{"referenceId":true},"statement":{"body":"SELECT\n    volunteer_references.user_id\nFROM volunteer_references\nWHERE\n    volunteer_references.id = :referenceId!","loc":{"a":8732,"b":8846,"line":287,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_references.user_id
 * FROM volunteer_references
 * WHERE
 *     volunteer_references.id = :referenceId!
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

const addVolunteerReferenceByIdIR: any = {"name":"addVolunteerReferenceById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9012,"b":9014,"line":296,"col":5}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9022,"b":9028,"line":297,"col":5}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9036,"b":9045,"line":298,"col":5}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9053,"b":9061,"line":299,"col":5}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9069,"b":9074,"line":300,"col":5}]}}],"usedParamSet":{"id":true,"userId":true,"firstName":true,"lastName":true,"email":true},"statement":{"body":"INSERT INTO volunteer_references (id, user_id, first_name, last_name, email, status_id, created_at, updated_at)\nSELECT\n    :id!,\n    :userId!,\n    :firstName!,\n    :lastName!,\n    :email!,\n    volunteer_reference_statuses.id,\n    NOW(),\n    NOW()\nFROM volunteer_reference_statuses\nWHERE name = 'unsent'::text\nON CONFLICT (user_id, email) DO NOTHING\nRETURNING id AS ok","loc":{"a":8888,"b":9254,"line":294,"col":0}}};

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
 * FROM volunteer_reference_statuses
 * WHERE name = 'unsent'::text
 * ON CONFLICT (user_id, email) DO NOTHING
 * RETURNING id AS ok
 * ```
 */
export const addVolunteerReferenceById = new PreparedQuery<IAddVolunteerReferenceByIdParams,IAddVolunteerReferenceByIdResult>(addVolunteerReferenceByIdIR);


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

const getInactiveVolunteersIR: any = {"name":"getInactiveVolunteers","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9649,"b":9654,"line":321,"col":31}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9690,"b":9693,"line":322,"col":30}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.last_activity_at >= :start! AND\n    users.last_activity_at < :end! AND\n    users.banned IS FALSE AND\n    users.deactivated IS FALSE AND\n    users.test_user IS FALSE","loc":{"a":9292,"b":9791,"line":310,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     users.last_activity_at >= :start! AND
 *     users.last_activity_at < :end! AND
 *     users.banned IS FALSE AND
 *     users.deactivated IS FALSE AND
 *     users.test_user IS FALSE
 * ```
 */
export const getInactiveVolunteers = new PreparedQuery<IGetInactiveVolunteersParams,IGetInactiveVolunteersResult>(getInactiveVolunteersIR);


/** 'UpdateVolunteerReferenceStatusById' parameters type */
export interface IUpdateVolunteerReferenceStatusByIdParams {
  referenceId: string;
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

const updateVolunteerReferenceStatusByIdIR: any = {"name":"updateVolunteerReferenceStatusById","params":[{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10093,"b":10104,"line":341,"col":31}]}}],"usedParamSet":{"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    sent_at = NOW(),\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM volunteer_reference_statuses\n    WHERE name = 'sent'\n) AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":9842,"b":10148,"line":328,"col":0}}};

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
 *     FROM volunteer_reference_statuses
 *     WHERE name = 'sent'
 * ) AS subquery
 * WHERE
 *     volunteer_references.id = :referenceId!
 * RETURNING
 *     volunteer_references.id AS ok
 * ```
 */
export const updateVolunteerReferenceStatusById = new PreparedQuery<IUpdateVolunteerReferenceStatusByIdParams,IUpdateVolunteerReferenceStatusByIdResult>(updateVolunteerReferenceStatusByIdIR);


/** 'DeleteVolunteerReferenceById' parameters type */
export interface IDeleteVolunteerReferenceByIdParams {
  referenceId: string;
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

const deleteVolunteerReferenceByIdIR: any = {"name":"deleteVolunteerReferenceById","params":[{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10427,"b":10438,"line":358,"col":31}]}}],"usedParamSet":{"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM volunteer_reference_statuses\n    WHERE name = 'removed'\n) AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":10194,"b":10482,"line":346,"col":0}}};

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
 *     FROM volunteer_reference_statuses
 *     WHERE name = 'removed'
 * ) AS subquery
 * WHERE
 *     volunteer_references.id = :referenceId!
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

const updateVolunteersReadyToCoachByIdsIR: any = {"name":"updateVolunteersReadyToCoachByIds","params":[{"name":"userIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10653,"b":10660,"line":369,"col":19}]}}],"usedParamSet":{"userIds":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_ready_to_coach_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = ANY(:userIds!)\nRETURNING\n    user_id AS ok","loc":{"a":10533,"b":10689,"line":363,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_ready_to_coach_email = TRUE,
 *     updated_at = NOW()
 * WHERE
 *     user_id = ANY(:userIds!)
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

const updateVolunteerElapsedAvailabilityByIdIR: any = {"name":"updateVolunteerElapsedAvailabilityById","params":[{"name":"elapsedAvailability","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10876,"b":10895,"line":379,"col":49}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10953,"b":10959,"line":379,"col":126},{"a":10996,"b":11002,"line":382,"col":15}]}}],"usedParamSet":{"elapsedAvailability":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    elapsed_availability = subquery.total\nFROM (\n    SELECT COALESCE(elapsed_availability, 0) + (:elapsedAvailability!)::int AS total FROM volunteer_profiles WHERE user_id = :userId!\n) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":10744,"b":11030,"line":374,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     elapsed_availability = subquery.total
 * FROM (
 *     SELECT COALESCE(elapsed_availability, 0) + (:elapsedAvailability!)::int AS total FROM volunteer_profiles WHERE user_id = :userId!
 * ) AS subquery
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

const updateVolunteerTotalHoursByIdIR: any = {"name":"updateVolunteerTotalHoursById","params":[{"name":"totalHours","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11210,"b":11220,"line":392,"col":50}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11282,"b":11288,"line":392,"col":122},{"a":11325,"b":11331,"line":395,"col":15}]}}],"usedParamSet":{"totalHours":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    total_volunteer_hours = subquery.total\nFROM (\n    SELECT COALESCE(total_volunteer_hours, 0) + (:totalHours!)::numeric AS total FROM volunteer_profiles WHERE user_id = :userId!\n) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":11076,"b":11359,"line":387,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     total_volunteer_hours = subquery.total
 * FROM (
 *     SELECT COALESCE(total_volunteer_hours, 0) + (:totalHours!)::numeric AS total FROM volunteer_profiles WHERE user_id = :userId!
 * ) AS subquery
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateVolunteerTotalHoursById = new PreparedQuery<IUpdateVolunteerTotalHoursByIdParams,IUpdateVolunteerTotalHoursByIdResult>(updateVolunteerTotalHoursByIdIR);


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

const updateVolunteerTrainingByIdIR: any = {"name":"updateVolunteerTrainingById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11550,"b":11556,"line":402,"col":3}]}},{"name":"complete","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11585,"b":11593,"line":404,"col":3},{"a":11802,"b":11810,"line":413,"col":16}]}},{"name":"progress","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11599,"b":11607,"line":405,"col":3},{"a":11829,"b":11837,"line":414,"col":16}]}},{"name":"materialKey","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11620,"b":11631,"line":406,"col":10},{"a":11905,"b":11916,"line":415,"col":65},{"a":11959,"b":11970,"line":418,"col":8}]}},{"name":"trainingCourse","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11712,"b":11726,"line":410,"col":31}]}}],"usedParamSet":{"userId":true,"complete":true,"progress":true,"materialKey":true,"trainingCourse":true},"statement":{"body":"INSERT INTO users_training_courses AS ins (user_id, training_course_id, complete, progress, completed_materials, created_at, updated_at)\nSELECT\n  :userId!,\n  training_courses.id,\n  :complete!,\n  :progress!,\n  ARRAY[(:materialKey!)::text],\n  NOW(),\n  NOW()\nFROM training_courses\nWHERE training_courses.name = :trainingCourse!\nON CONFLICT (user_id, training_course_id) DO UPDATE\n  SET\n    complete = :complete!,\n    progress = :progress!,\n    completed_materials = ARRAY_APPEND(ins.completed_materials, :materialKey!),\n    updated_at = NOW()\n  WHERE\n  \tNOT :materialKey! = ANY(ins.completed_materials)\nRETURNING user_id AS ok","loc":{"a":11403,"b":12025,"line":400,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_training_courses AS ins (user_id, training_course_id, complete, progress, completed_materials, created_at, updated_at)
 * SELECT
 *   :userId!,
 *   training_courses.id,
 *   :complete!,
 *   :progress!,
 *   ARRAY[(:materialKey!)::text],
 *   NOW(),
 *   NOW()
 * FROM training_courses
 * WHERE training_courses.name = :trainingCourse!
 * ON CONFLICT (user_id, training_course_id) DO UPDATE
 *   SET
 *     complete = :complete!,
 *     progress = :progress!,
 *     completed_materials = ARRAY_APPEND(ins.completed_materials, :materialKey!),
 *     updated_at = NOW()
 *   WHERE
 *   	NOT :materialKey! = ANY(ins.completed_materials)
 * RETURNING user_id AS ok
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

const updateVolunteerPhotoIdByIdIR: any = {"name":"updateVolunteerPhotoIdById","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12125,"b":12128,"line":425,"col":23}]}},{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12223,"b":12229,"line":428,"col":51}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12266,"b":12272,"line":431,"col":15}]}}],"usedParamSet":{"key":true,"status":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    photo_id_s3_key = :key!,\n    photo_id_status = subquery.id\nFROM (\n    SELECT id FROM photo_id_statuses WHERE name = :status!\n) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":12068,"b":12300,"line":422,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     photo_id_s3_key = :key!,
 *     photo_id_status = subquery.id
 * FROM (
 *     SELECT id FROM photo_id_statuses WHERE name = :status!
 * ) AS subquery
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

const updateVolunteerSentInactive30DayEmailIR: any = {"name":"updateVolunteerSentInactive30DayEmail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12475,"b":12481,"line":442,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_thirty_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":12354,"b":12509,"line":436,"col":0}}};

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

const updateVolunteerSentInactive60DayEmailIR: any = {"name":"updateVolunteerSentInactive60DayEmail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12726,"b":12732,"line":454,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_thirty_day_email = TRUE,\n    sent_inactive_sixty_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":12563,"b":12760,"line":447,"col":0}}};

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

const updateVolunteerSentInactive90DayEmailIR: any = {"name":"updateVolunteerSentInactive90DayEmail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12935,"b":12941,"line":465,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_ninety_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":12814,"b":12969,"line":459,"col":0}}};

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

const updateVolunteerProfileByIdIR: any = {"name":"updateVolunteerProfileById","params":[{"name":"deactivated","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13061,"b":13071,"line":473,"col":28}]}},{"name":"phone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13110,"b":13114,"line":474,"col":22}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13140,"b":13146,"line":476,"col":10}]}}],"usedParamSet":{"deactivated":true,"phone":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    deactivated = COALESCE(:deactivated, deactivated),\n    phone = COALESCE(:phone, phone)\nWHERE\n    id = :userId!\nRETURNING id AS ok","loc":{"a":13012,"b":13165,"line":470,"col":0}}};

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
 * RETURNING id AS ok
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
  status: string;
  userId: string;
}

/** 'GetVolunteerUnsentReferences' query type */
export interface IGetVolunteerUnsentReferencesQuery {
  params: IGetVolunteerUnsentReferencesParams;
  result: IGetVolunteerUnsentReferencesResult;
}

const getVolunteerUnsentReferencesIR: any = {"name":"getVolunteerUnsentReferences","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    volunteer_references.id,\n    user_id,\n    first_name,\n    email,\n    volunteer_reference_statuses.name AS status\nFROM volunteer_references\nLEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_reference_statuses.name = 'UNSENT'","loc":{"a":13210,"b":13520,"line":480,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_references.id,
 *     user_id,
 *     first_name,
 *     email,
 *     volunteer_reference_statuses.name AS status
 * FROM volunteer_references
 * LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     volunteer_reference_statuses.name = 'UNSENT'
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

const getReferencesByVolunteerIR: any = {"name":"getReferencesByVolunteer","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13862,"b":13868,"line":501,"col":36}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    volunteer_references.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status\nFROM volunteer_references\nLEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_references.user_id = :userId!","loc":{"a":13561,"b":13868,"line":492,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_references.id,
 *     first_name,
 *     last_name,
 *     email,
 *     volunteer_reference_statuses.name AS status
 * FROM volunteer_references
 * LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     volunteer_references.user_id = :userId!
 * ```
 */
export const getReferencesByVolunteer = new PreparedQuery<IGetReferencesByVolunteerParams,IGetReferencesByVolunteerResult>(getReferencesByVolunteerIR);


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

const getVolunteerForPendingStatusIR: any = {"name":"getVolunteerForPendingStatus","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14625,"b":14631,"line":525,"col":19},{"a":14680,"b":14686,"line":528,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_profiles.approved,\n    volunteer_profiles.onboarded,\n    volunteer_profiles.country,\n    photo_id_statuses.name AS photo_id_status,\n    volunteer_partner_orgs.name AS volunteer_partner_org,\n    occupations.occupations\nFROM users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nLEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\nLEFT JOIN (\n    SELECT\n        array_agg(occupation) AS occupations\n    FROM volunteer_occupations\n    WHERE\n        user_id = :userId!\n) AS occupations ON TRUE\nWHERE\n    users.id = :userId!","loc":{"a":13913,"b":14686,"line":504,"col":0}}};

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
 *     volunteer_partner_orgs.name AS volunteer_partner_org,
 *     occupations.occupations
 * FROM users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status
 * LEFT JOIN (
 *     SELECT
 *         array_agg(occupation) AS occupations
 *     FROM volunteer_occupations
 *     WHERE
 *         user_id = :userId!
 * ) AS occupations ON TRUE
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

const updateVolunteerReferenceStatusIR: any = {"name":"updateVolunteerReferenceStatus","params":[{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14890,"b":14896,"line":537,"col":62}]}},{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14949,"b":14960,"line":540,"col":31}]}}],"usedParamSet":{"status":true,"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT id FROM volunteer_reference_statuses WHERE name = :status!\n) AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING volunteer_references.id AS ok","loc":{"a":14733,"b":15000,"line":531,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_references
 * SET
 *     status_id = subquery.id,
 *     updated_at = NOW()
 * FROM (
 *     SELECT id FROM volunteer_reference_statuses WHERE name = :status!
 * ) AS subquery
 * WHERE
 *     volunteer_references.id = :referenceId!
 * RETURNING volunteer_references.id AS ok
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

const updateVolunteerApprovedIR: any = {"name":"updateVolunteerApproved","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15158,"b":15164,"line":550,"col":34}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    approved = TRUE,\n    updated_at = NOW()\nWHERE\n    volunteer_profiles.user_id = :userId!\nRETURNING volunteer_profiles.user_id AS ok","loc":{"a":15040,"b":15207,"line":544,"col":0}}};

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
 * RETURNING volunteer_profiles.user_id AS ok
 * ```
 */
export const updateVolunteerApproved = new PreparedQuery<IUpdateVolunteerApprovedParams,IUpdateVolunteerApprovedResult>(updateVolunteerApprovedIR);


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

const updateVolunteerOnboardedIR: any = {"name":"updateVolunteerOnboarded","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15367,"b":15373,"line":560,"col":34}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    onboarded = TRUE,\n    updated_at = NOW()\nWHERE\n    volunteer_profiles.user_id = :userId!\nRETURNING volunteer_profiles.user_id AS ok","loc":{"a":15248,"b":15416,"line":554,"col":0}}};

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
 * RETURNING volunteer_profiles.user_id AS ok
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

const getVolunteersForNiceToMeetYouIR: any = {"name":"getVolunteersForNiceToMeetYou","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15911,"b":15916,"line":578,"col":25}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15946,"b":15949,"line":579,"col":24}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.banned IS FALSE AND\n    users.deactivated IS FALSE AND\n    users.test_user IS FALSE AND\n    users.created_at >= :start! AND\n    users.created_at < :end!","loc":{"a":15462,"b":15949,"line":564,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     users.banned IS FALSE AND
 *     users.deactivated IS FALSE AND
 *     users.test_user IS FALSE AND
 *     users.created_at >= :start! AND
 *     users.created_at < :end!
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

const getVolunteersForReadyToCoachIR: any = {"name":"getVolunteersForReadyToCoach","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nLEFT JOIN user_product_flags ON user_product_flags.user_id = users.id\nWHERE\n    users.banned IS FALSE AND\n    users.deactivated IS FALSE AND\n    users.test_user IS FALSE AND\n    volunteer_profiles.onboarded IS TRUE AND\n    volunteer_profiles.approved IS TRUE AND\n    user_product_flags.sent_ready_to_coach_email IS FALSE","loc":{"a":15994,"b":16633,"line":582,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * LEFT JOIN user_product_flags ON user_product_flags.user_id = users.id
 * WHERE
 *     users.banned IS FALSE AND
 *     users.deactivated IS FALSE AND
 *     users.test_user IS FALSE AND
 *     volunteer_profiles.onboarded IS TRUE AND
 *     volunteer_profiles.approved IS TRUE AND
 *     user_product_flags.sent_ready_to_coach_email IS FALSE
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

const getVolunteersForWaitingReferencesIR: any = {"name":"getVolunteersForWaitingReferences","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17399,"b":17404,"line":619,"col":36}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17446,"b":17449,"line":620,"col":36}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name,\n    users.last_name,\n    users.phone,\n    users.email,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM users\nLEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nLEFT JOIN volunteer_references ON volunteer_references.user_id = users.id\nLEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    users.banned IS FALSE AND\n    users.deactivated IS FALSE AND\n    users.test_user IS FALSE AND\n    volunteer_reference_statuses.name = 'sent' AND\n    volunteer_references.sent_at > :start! AND\n    volunteer_references.sent_at < :end!\nGROUP BY users.id, volunteer_partner_orgs.name","loc":{"a":16683,"b":17496,"line":602,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name,
 *     users.last_name,
 *     users.phone,
 *     users.email,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM users
 * LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * LEFT JOIN volunteer_references ON volunteer_references.user_id = users.id
 * LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     users.banned IS FALSE AND
 *     users.deactivated IS FALSE AND
 *     users.test_user IS FALSE AND
 *     volunteer_reference_statuses.name = 'sent' AND
 *     volunteer_references.sent_at > :start! AND
 *     volunteer_references.sent_at < :end!
 * GROUP BY users.id, volunteer_partner_orgs.name
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

const addVolunteerCertificationIR: any = {"name":"addVolunteerCertification","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17635,"b":17641,"line":626,"col":5}]}},{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17831,"b":17838,"line":635,"col":26}]}}],"usedParamSet":{"userId":true,"subject":true},"statement":{"body":"INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at)\nSELECT\n    :userId!,\n    subquery.id,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        certifications.id\n    FROM certifications\n    JOIN quizzes ON quizzes.name = certifications.name\n    WHERE quizzes.name = :subject!\n) AS subquery\nON CONFLICT (user_id, certification_id) DO NOTHING\nRETURNING user_id AS ok","loc":{"a":17538,"b":17927,"line":624,"col":0}}};

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
 *     FROM certifications
 *     JOIN quizzes ON quizzes.name = certifications.name
 *     WHERE quizzes.name = :subject!
 * ) AS subquery
 * ON CONFLICT (user_id, certification_id) DO NOTHING
 * RETURNING user_id AS ok
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

const updateVolunteerQuizIR: any = {"name":"updateVolunteerQuiz","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18069,"b":18075,"line":643,"col":5}]}},{"name":"passed","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18107,"b":18113,"line":646,"col":5},{"a":18329,"b":18335,"line":658,"col":14}]}},{"name":"quiz","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18217,"b":18221,"line":653,"col":26}]}}],"usedParamSet":{"userId":true,"passed":true,"quiz":true},"statement":{"body":"INSERT INTO users_quizzes AS ins (user_id, quiz_id, attempts, passed, created_at, updated_at)\nSELECT\n    :userId!,\n    subquery.id,\n    1,\n    :passed!,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        quizzes.id\n    FROM quizzes\n    WHERE quizzes.name = :quiz!\n) AS subquery\nON CONFLICT (user_id, quiz_id) DO UPDATE\nSET\n    attempts = ins.attempts + 1,\n    passed = :passed!,\n    updated_at = NOW()\nRETURNING user_id AS ok","loc":{"a":17963,"b":18383,"line":641,"col":0}}};

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
 *     FROM quizzes
 *     WHERE quizzes.name = :quiz!
 * ) AS subquery
 * ON CONFLICT (user_id, quiz_id) DO UPDATE
 * SET
 *     attempts = ins.attempts + 1,
 *     passed = :passed!,
 *     updated_at = NOW()
 * RETURNING user_id AS ok
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

const getVolunteersAdminAvailabilityIR: any = {"name":"getVolunteersAdminAvailability","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18654,"b":18661,"line":669,"col":27},{"a":19186,"b":19193,"line":685,"col":25}]}}],"usedParamSet":{"subject":true},"statement":{"body":"WITH certs_for_subject AS (\n    SELECT\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    WHERE subjects.name = :subject!\n)\nSELECT users.id FROM users\nJOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nJOIN (\n    SELECT\n        users.id,\n        COUNT(*)::int AS earned_certs,\n        certs_for_subject.total\n    FROM\n        users_certifications\n        JOIN certification_subject_unlocks USING (certification_id)\n        JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n        JOIN users ON users.id = users_certifications.user_id\n        JOIN certs_for_subject ON TRUE\n    WHERE\n        subjects.name = :subject!\n    GROUP BY\n        users.id, subjects.name, certs_for_subject.total\n    HAVING\n        COUNT(*)::int >= certs_for_subject.total\n) user_certs ON user_certs.id = users.id\nWHERE\n    users.test_user IS FALSE AND\n    volunteer_profiles.onboarded IS TRUE AND\n    users.deactivated IS FALSE AND\n    users.banned IS FALSE","loc":{"a":18430,"b":19509,"line":663,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH certs_for_subject AS (
 *     SELECT
 *         COUNT(*)::int AS total
 *     FROM
 *         certification_subject_unlocks
 *         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *     WHERE subjects.name = :subject!
 * )
 * SELECT users.id FROM users
 * JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * JOIN (
 *     SELECT
 *         users.id,
 *         COUNT(*)::int AS earned_certs,
 *         certs_for_subject.total
 *     FROM
 *         users_certifications
 *         JOIN certification_subject_unlocks USING (certification_id)
 *         JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *         JOIN users ON users.id = users_certifications.user_id
 *         JOIN certs_for_subject ON TRUE
 *     WHERE
 *         subjects.name = :subject!
 *     GROUP BY
 *         users.id, subjects.name, certs_for_subject.total
 *     HAVING
 *         COUNT(*)::int >= certs_for_subject.total
 * ) user_certs ON user_certs.id = users.id
 * WHERE
 *     users.test_user IS FALSE AND
 *     volunteer_profiles.onboarded IS TRUE AND
 *     users.deactivated IS FALSE AND
 *     users.banned IS FALSE
 * ```
 */
export const getVolunteersAdminAvailability = new PreparedQuery<IGetVolunteersAdminAvailabilityParams,IGetVolunteersAdminAvailabilityResult>(getVolunteersAdminAvailabilityIR);


/** 'CreateVolunteer' parameters type */
export interface ICreateVolunteerParams {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  password: string;
  phone: string;
  referralCode: string;
  referredBy: string | null | void;
  timezone: string;
  volunteerPartnerOrg: string | null | void;
}

/** 'CreateVolunteer' return type */
export interface ICreateVolunteerResult {
  banned: boolean;
  createdAt: Date;
  deactivated: boolean;
  email: string;
  firstName: string;
  id: string;
  isAdmin: boolean | null;
  isVolunteer: boolean | null;
  lastName: string;
  phone: string | null;
  testUser: boolean;
  volunteerPartnerOrg: string;
}

/** 'CreateVolunteer' query type */
export interface ICreateVolunteerQuery {
  params: ICreateVolunteerParams;
  result: ICreateVolunteerResult;
}

const createVolunteerIR: any = {"name":"createVolunteer","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19709,"b":19711,"line":700,"col":13}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19715,"b":19720,"line":700,"col":19}]}},{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19724,"b":19729,"line":700,"col":28}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19733,"b":19742,"line":700,"col":37}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19746,"b":19754,"line":700,"col":50}]}},{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19758,"b":19766,"line":700,"col":62}]}},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19777,"b":19786,"line":700,"col":81}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19790,"b":19802,"line":700,"col":94}]}},{"name":"timezone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20161,"b":20169,"line":710,"col":5}]}},{"name":"volunteerPartnerOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20375,"b":20393,"line":718,"col":70}]}}],"usedParamSet":{"id":true,"email":true,"phone":true,"firstName":true,"lastName":true,"password":true,"referredBy":true,"referralCode":true,"timezone":true,"volunteerPartnerOrg":true},"statement":{"body":"WITH ins_user AS (\n    INSERT INTO users (id, email, phone, first_name, last_name, password, verified, referred_by, referral_code, created_at, updated_at)\n    VALUES (:id!, :email!, :phone!, :firstName!, :lastName!, :password!, FALSE, :referredBy, :referralCode!, NOW(), NOW())\n    ON CONFLICT (email) DO NOTHING\n    RETURNING id, email, first_name, last_name, phone, banned, test_user, deactivated, created_at\n),\nins_vp AS (\n  INSERT INTO volunteer_profiles (user_id, approved, volunteer_partner_org_id, timezone, created_at, updated_at)\n  SELECT\n    subquery.id,\n    FALSE,\n    subquery.volunteer_partner_org_id,\n    :timezone!,\n    NOW(),\n    NOW()\n  FROM (\n\tSELECT\n    \tins_user.id,\n    \tvolunteer_partner_orgs.id AS volunteer_partner_org_id\n    FROM ins_user\n  \tLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.name = :volunteerPartnerOrg\n  ) AS subquery\n  RETURNING user_id, volunteer_partner_org_id\n)\nSELECT\n    ins_user.id,\n    ins_user.first_name,\n    ins_user.last_name,\n    ins_user.email,\n    ins_user.phone,\n    ins_user.banned,\n    ins_user.test_user,\n    ins_user.deactivated,\n    ins_user.created_at,\n    volunteer_partner_orgs.name AS volunteer_partner_org,\n    TRUE AS is_volunteer,\n    FALSE AS is_admin\nFROM ins_user\nJOIN ins_vp ON ins_user.id = ins_vp.user_id\nLEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = ins_vp.volunteer_partner_org_id","loc":{"a":19541,"b":20926,"line":698,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins_user AS (
 *     INSERT INTO users (id, email, phone, first_name, last_name, password, verified, referred_by, referral_code, created_at, updated_at)
 *     VALUES (:id!, :email!, :phone!, :firstName!, :lastName!, :password!, FALSE, :referredBy, :referralCode!, NOW(), NOW())
 *     ON CONFLICT (email) DO NOTHING
 *     RETURNING id, email, first_name, last_name, phone, banned, test_user, deactivated, created_at
 * ),
 * ins_vp AS (
 *   INSERT INTO volunteer_profiles (user_id, approved, volunteer_partner_org_id, timezone, created_at, updated_at)
 *   SELECT
 *     subquery.id,
 *     FALSE,
 *     subquery.volunteer_partner_org_id,
 *     :timezone!,
 *     NOW(),
 *     NOW()
 *   FROM (
 * 	SELECT
 *     	ins_user.id,
 *     	volunteer_partner_orgs.id AS volunteer_partner_org_id
 *     FROM ins_user
 *   	LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.name = :volunteerPartnerOrg
 *   ) AS subquery
 *   RETURNING user_id, volunteer_partner_org_id
 * )
 * SELECT
 *     ins_user.id,
 *     ins_user.first_name,
 *     ins_user.last_name,
 *     ins_user.email,
 *     ins_user.phone,
 *     ins_user.banned,
 *     ins_user.test_user,
 *     ins_user.deactivated,
 *     ins_user.created_at,
 *     volunteer_partner_orgs.name AS volunteer_partner_org,
 *     TRUE AS is_volunteer,
 *     FALSE AS is_admin
 * FROM ins_user
 * JOIN ins_vp ON ins_user.id = ins_vp.user_id
 * LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = ins_vp.volunteer_partner_org_id
 * ```
 */
export const createVolunteer = new PreparedQuery<ICreateVolunteerParams,ICreateVolunteerResult>(createVolunteerIR);


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

const getVolunteerForTextResponseIR: any = {"name":"getVolunteerForTextResponse","params":[{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21478,"b":21483,"line":754,"col":19}]}}],"usedParamSet":{"phone":true},"statement":{"body":"SELECT\n    users.id AS volunteer_id,\n    sessions.id AS session_id,\n    sessions.volunteer_joined_at,\n    sessions.ended_at,\n    subjects.name AS subject,\n    topics.name AS topic\nFROM users\nJOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nLEFT JOIN notifications ON notifications.user_id = users.id\nLEFT JOIN sessions ON sessions.id = notifications.session_id\nLEFT JOIN subjects ON subjects.id = sessions.subject_id\nLEFT JOIN topics ON topics.id = subjects.topic_id\nWHERE\n    users.phone = :phone!\nORDER BY notifications.created_at DESC LIMIT 1","loc":{"a":20970,"b":21530,"line":740,"col":0}}};

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
 * FROM users
 * JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * LEFT JOIN notifications ON notifications.user_id = users.id
 * LEFT JOIN sessions ON sessions.id = notifications.session_id
 * LEFT JOIN subjects ON subjects.id = sessions.subject_id
 * LEFT JOIN topics ON topics.id = subjects.topic_id
 * WHERE
 *     users.phone = :phone!
 * ORDER BY notifications.created_at DESC LIMIT 1
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
  firstName: string;
  id: string;
  lastName: string;
  readyForReviewAt: Date | null;
}

/** 'GetVolunteersToReview' query type */
export interface IGetVolunteersToReviewQuery {
  params: IGetVolunteersToReviewParams;
  result: IGetVolunteersToReviewResult;
}

const getVolunteersToReviewIR: any = {"name":"getVolunteersToReview","params":[{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22838,"b":22843,"line":787,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22860,"b":22866,"line":787,"col":30}]}}],"usedParamSet":{"limit":true,"offset":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name,\n    users.last_name,\n    users.email,\n    users.created_at,\n    MAX(user_actions.created_at) AS ready_for_review_at\nFROM users\nJOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\nLEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\nLEFT JOIN (\n    SELECT user_id, count(*) AS total_references\n    FROM volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\n    WHERE\n        NOT volunteer_reference_statuses.name = ANY('{ \"sent\", \"unsent\", \"rejected\" }')\n    GROUP BY user_id\n) AS reference_count ON reference_count.user_id = users.id\nJOIN volunteer_occupations ON volunteer_occupations.user_id = users.id\nLEFT JOIN user_actions ON user_actions.user_id = users.id\nWHERE\n    volunteer_profiles.approved IS FALSE AND\n    NOT volunteer_profiles.country IS NULL AND\n    NOT volunteer_profiles.photo_id_s3_key IS NULL AND\n    photo_id_statuses.name = ANY('{ \"submitted\", \"approved\" }') AND\n    user_actions.action_type = ANY('{ \"added photo id\", \"submitted reference form\", \"completed background info\" }') AND\n    reference_count.total_references = 2\nGROUP BY users.id\nORDER BY ready_for_review_at\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":21568,"b":22872,"line":758,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name,
 *     users.last_name,
 *     users.email,
 *     users.created_at,
 *     MAX(user_actions.created_at) AS ready_for_review_at
 * FROM users
 * JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id
 * LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status
 * LEFT JOIN (
 *     SELECT user_id, count(*) AS total_references
 *     FROM volunteer_references
 *     LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 *     WHERE
 *         NOT volunteer_reference_statuses.name = ANY('{ "sent", "unsent", "rejected" }')
 *     GROUP BY user_id
 * ) AS reference_count ON reference_count.user_id = users.id
 * JOIN volunteer_occupations ON volunteer_occupations.user_id = users.id
 * LEFT JOIN user_actions ON user_actions.user_id = users.id
 * WHERE
 *     volunteer_profiles.approved IS FALSE AND
 *     NOT volunteer_profiles.country IS NULL AND
 *     NOT volunteer_profiles.photo_id_s3_key IS NULL AND
 *     photo_id_statuses.name = ANY('{ "submitted", "approved" }') AND
 *     user_actions.action_type = ANY('{ "added photo id", "submitted reference form", "completed background info" }') AND
 *     reference_count.total_references = 2
 * GROUP BY users.id
 * ORDER BY ready_for_review_at
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

const getReferencesToFollowupIR: any = {"name":"getReferencesToFollowup","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23697,"b":23702,"line":807,"col":36}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23744,"b":23747,"line":808,"col":36}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id AS volunteer_id,\n    users.first_name AS volunteer_first_name,\n    users.last_name AS volunteer_last_name,\n    volunteer_references.id AS reference_id,\n    volunteer_references.first_name AS reference_first_name,\n    volunteer_references.last_name AS reference_last_name,\n    volunteer_references.email AS reference_email\nFROM users\nJOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\nJOIN volunteer_references ON volunteer_references.user_id = users.id\nLEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    users.banned IS FALSE AND\n    users.deactivated IS FALSE AND\n    users.test_user IS FALSE AND\n    volunteer_reference_statuses.name = 'sent' AND\n    volunteer_references.sent_at > :start! AND\n    volunteer_references.sent_at < :end!","loc":{"a":22912,"b":23747,"line":790,"col":0}}};

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
 * FROM users
 * JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 * JOIN volunteer_references ON volunteer_references.user_id = users.id
 * LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     users.banned IS FALSE AND
 *     users.deactivated IS FALSE AND
 *     users.test_user IS FALSE AND
 *     volunteer_reference_statuses.name = 'sent' AND
 *     volunteer_references.sent_at > :start! AND
 *     volunteer_references.sent_at < :end!
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

const updateVolunteerBackgroundInfoIR: any = {"name":"updateVolunteerBackgroundInfo","params":[{"name":"occupation","codeRefs":{"defined":{"a":23806,"b":23815,"line":812,"col":11},"used":[{"a":24070,"b":24080,"line":820,"col":12}]},"transform":{"type":"pick_array_spread","keys":[{"name":"userId","required":false},{"name":"occupation","required":false},{"name":"createdAt","required":false},{"name":"updatedAt","required":false}]},"required":true},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23950,"b":23956,"line":816,"col":21},{"a":24589,"b":24595,"line":836,"col":15}]}},{"name":"approved","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24166,"b":24173,"line":825,"col":25}]}},{"name":"experience","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24214,"b":24223,"line":826,"col":27}]}},{"name":"company","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24263,"b":24269,"line":827,"col":24}]}},{"name":"college","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24306,"b":24312,"line":828,"col":24}]}},{"name":"linkedInUrl","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24354,"b":24364,"line":829,"col":29}]}},{"name":"country","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24406,"b":24412,"line":830,"col":24}]}},{"name":"state","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24447,"b":24451,"line":831,"col":22}]}},{"name":"city","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24483,"b":24486,"line":832,"col":21}]}},{"name":"languages","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24522,"b":24530,"line":833,"col":26}]}}],"usedParamSet":{"userId":true,"occupation":true,"approved":true,"experience":true,"company":true,"college":true,"linkedInUrl":true,"country":true,"state":true,"city":true,"languages":true},"statement":{"body":"WITH clear_occ AS (\n    DELETE FROM volunteer_occupations\n    WHERE user_id = :userId!\n),\nins_occ AS (\n    INSERT INTO volunteer_occupations (user_id, occupation, created_at, updated_at)\n    VALUES :occupation!\n    ON CONFLICT DO NOTHING\n)\nUPDATE volunteer_profiles\nSET\n    approved = COALESCE(:approved, approved),\n    experience = COALESCE(:experience, experience),\n    company = COALESCE(:company, company),\n    college = COALESCE(:college, college),\n    linkedin_url = COALESCE(:linkedInUrl, linkedin_url),\n    country = COALESCE(:country, country),\n    state = COALESCE(:state, state),\n    city = COALESCE(:city, city),\n    languages = COALESCE(:languages, languages),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING user_id AS ok","loc":{"a":23871,"b":24619,"line":814,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH clear_occ AS (
 *     DELETE FROM volunteer_occupations
 *     WHERE user_id = :userId!
 * ),
 * ins_occ AS (
 *     INSERT INTO volunteer_occupations (user_id, occupation, created_at, updated_at)
 *     VALUES :occupation!
 *     ON CONFLICT DO NOTHING
 * )
 * UPDATE volunteer_profiles
 * SET
 *     approved = COALESCE(:approved, approved),
 *     experience = COALESCE(:experience, experience),
 *     company = COALESCE(:company, company),
 *     college = COALESCE(:college, college),
 *     linkedin_url = COALESCE(:linkedInUrl, linkedin_url),
 *     country = COALESCE(:country, country),
 *     state = COALESCE(:state, state),
 *     city = COALESCE(:city, city),
 *     languages = COALESCE(:languages, languages),
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING user_id AS ok
 * ```
 */
export const updateVolunteerBackgroundInfo = new PreparedQuery<IUpdateVolunteerBackgroundInfoParams,IUpdateVolunteerBackgroundInfoResult>(updateVolunteerBackgroundInfoIR);


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

const getCertificationsForVolunteersIR: any = {"name":"getCertificationsForVolunteers","params":[{"name":"userIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":24912,"b":24919,"line":877,"col":19}]}}],"usedParamSet":{"userIds":true},"statement":{"body":"SELECT\n    user_id,\n    attempts AS tries,\n    users_quizzes.updated_at AS last_attempted_at,\n    passed,\n    quizzes.name\nFROM users_quizzes\nJOIN quizzes ON users_quizzes.quiz_id = quizzes.id\nWHERE\n    user_id = ANY(:userIds!)","loc":{"a":24694,"b":24920,"line":868,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     attempts AS tries,
 *     users_quizzes.updated_at AS last_attempted_at,
 *     passed,
 *     quizzes.name
 * FROM users_quizzes
 * JOIN quizzes ON users_quizzes.quiz_id = quizzes.id
 * WHERE
 *     user_id = ANY(:userIds!)
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

const getSubjectsForVolunteerIR: any = {"name":"getSubjectsForVolunteer","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25669,"b":25675,"line":903,"col":19}]}}],"usedParamSet":{"userId":true},"statement":{"body":"WITH subject_cert_total AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n)\nSELECT\n    subjects_unlocked.subject\nFROM (\n    SELECT\n        subjects.name AS subject,\n        COUNT(*)::int AS earned_certs,\n        subject_cert_total.total\n    FROM\n        users_certifications\n        JOIN certification_subject_unlocks USING (certification_id)\n        JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n        JOIN subject_cert_total ON subject_cert_total.name = subjects.name\n    WHERE\n        user_id = :userId!\n    GROUP BY\n        subjects.name, subject_cert_total.total\n    HAVING\n        COUNT(*)::int >= subject_cert_total.total) AS subjects_unlocked","loc":{"a":24960,"b":25819,"line":880,"col":0}}};

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


/** 'GetNextAnyVolunteerToNotify' parameters type */
export interface IGetNextAnyVolunteerToNotifyParams {
  lastNotified: Date;
  subject: string;
}

/** 'GetNextAnyVolunteerToNotify' return type */
export interface IGetNextAnyVolunteerToNotifyResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetNextAnyVolunteerToNotify' query type */
export interface IGetNextAnyVolunteerToNotifyQuery {
  params: IGetNextAnyVolunteerToNotifyParams;
  result: IGetNextAnyVolunteerToNotifyResult;
}

const getNextAnyVolunteerToNotifyIR: any = {"name":"getNextAnyVolunteerToNotify","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27948,"b":27955,"line":958,"col":37}]}},{"name":"lastNotified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28130,"b":28142,"line":966,"col":33}]}}],"usedParamSet":{"subject":true,"lastNotified":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN availabilities ON users.id = availabilities.user_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    JOIN (\n        SELECT\n            sub_unlocked.user_id,\n            subjects.name AS subject\n        FROM (\n            SELECT\n                user_id,\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_total.total\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        certification_subject_unlocks\n                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_total ON subject_total.name = subjects.name\n                GROUP BY\n                    user_id,\n                    subjects.name,\n                    subject_total.total\n                HAVING\n                    COUNT(*)::int >= subject_total.total) AS sub_unlocked\n                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id\nWHERE\n    test_user IS FALSE\n    AND banned IS FALSE\n    AND deactivated IS FALSE\n    AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end\n    AND subjects_unlocked.subject = :subject!\n    AND NOT EXISTS (\n        SELECT\n            user_id\n        FROM\n            notifications\n        WHERE\n            user_id = users.id\n            AND sent_at >= DATE(:lastNotified!))\nLIMIT 1","loc":{"a":25863,"b":28152,"line":910,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
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
 *     AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end
 *     AND subjects_unlocked.subject = :subject!
 *     AND NOT EXISTS (
 *         SELECT
 *             user_id
 *         FROM
 *             notifications
 *         WHERE
 *             user_id = users.id
 *             AND sent_at >= DATE(:lastNotified!))
 * LIMIT 1
 * ```
 */
export const getNextAnyVolunteerToNotify = new PreparedQuery<IGetNextAnyVolunteerToNotifyParams,IGetNextAnyVolunteerToNotifyResult>(getNextAnyVolunteerToNotifyIR);


/** 'GetNextOpenVolunteerToNotify' parameters type */
export interface IGetNextOpenVolunteerToNotifyParams {
  lastNotified: Date;
  subject: string;
}

/** 'GetNextOpenVolunteerToNotify' return type */
export interface IGetNextOpenVolunteerToNotifyResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetNextOpenVolunteerToNotify' query type */
export interface IGetNextOpenVolunteerToNotifyQuery {
  params: IGetNextOpenVolunteerToNotifyParams;
  result: IGetNextOpenVolunteerToNotifyResult;
}

const getNextOpenVolunteerToNotifyIR: any = {"name":"getNextOpenVolunteerToNotify","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":30282,"b":30289,"line":1018,"col":37}]}},{"name":"lastNotified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":30524,"b":30536,"line":1027,"col":33}]}}],"usedParamSet":{"subject":true,"lastNotified":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN availabilities ON users.id = availabilities.user_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    JOIN (\n        SELECT\n            sub_unlocked.user_id,\n            subjects.name AS subject\n        FROM (\n            SELECT\n                user_id,\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_total.total\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        certification_subject_unlocks\n                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_total ON subject_total.name = subjects.name\n                GROUP BY\n                    user_id,\n                    subjects.name,\n                    subject_total.total\n                HAVING\n                    COUNT(*)::int >= subject_total.total) AS sub_unlocked\n                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id\nWHERE\n    test_user IS FALSE\n    AND banned IS FALSE\n    AND deactivated IS FALSE\n    AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end\n    AND subjects_unlocked.subject = :subject!\n    AND volunteer_profiles.volunteer_partner_org_id IS NULL\n    AND NOT EXISTS (\n        SELECT\n            user_id\n        FROM\n            notifications\n        WHERE\n            user_id = users.id\n            AND sent_at >= DATE(:lastNotified!))\nLIMIT 1","loc":{"a":28197,"b":30546,"line":970,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
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
 *     AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end
 *     AND subjects_unlocked.subject = :subject!
 *     AND volunteer_profiles.volunteer_partner_org_id IS NULL
 *     AND NOT EXISTS (
 *         SELECT
 *             user_id
 *         FROM
 *             notifications
 *         WHERE
 *             user_id = users.id
 *             AND sent_at >= DATE(:lastNotified!))
 * LIMIT 1
 * ```
 */
export const getNextOpenVolunteerToNotify = new PreparedQuery<IGetNextOpenVolunteerToNotifyParams,IGetNextOpenVolunteerToNotifyResult>(getNextOpenVolunteerToNotifyIR);


/** 'GetNextAnyPartnerVolunteerToNotify' parameters type */
export interface IGetNextAnyPartnerVolunteerToNotifyParams {
  lastNotified: Date;
  subject: string;
}

/** 'GetNextAnyPartnerVolunteerToNotify' return type */
export interface IGetNextAnyPartnerVolunteerToNotifyResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetNextAnyPartnerVolunteerToNotify' query type */
export interface IGetNextAnyPartnerVolunteerToNotifyQuery {
  params: IGetNextAnyPartnerVolunteerToNotifyParams;
  result: IGetNextAnyPartnerVolunteerToNotifyResult;
}

const getNextAnyPartnerVolunteerToNotifyIR: any = {"name":"getNextAnyPartnerVolunteerToNotify","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":32678,"b":32685,"line":1080,"col":37}]}},{"name":"lastNotified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":32924,"b":32936,"line":1089,"col":33}]}}],"usedParamSet":{"subject":true,"lastNotified":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN availabilities ON users.id = availabilities.user_id\n    JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    JOIN (\n        SELECT\n            sub_unlocked.user_id,\n            subjects.name AS subject\n        FROM (\n            SELECT\n                user_id,\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_total.total\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        certification_subject_unlocks\n                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_total ON subject_total.name = subjects.name\n                GROUP BY\n                    user_id,\n                    subjects.name,\n                    subject_total.total\n                HAVING\n                    COUNT(*)::int >= subject_total.total) AS sub_unlocked\n                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id\nWHERE\n    test_user IS FALSE\n    AND banned IS FALSE\n    AND deactivated IS FALSE\n    AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end\n    AND subjects_unlocked.subject = :subject!\n    AND NOT volunteer_profiles.volunteer_partner_org_id IS NULL\n    AND NOT EXISTS (\n        SELECT\n            user_id\n        FROM\n            notifications\n        WHERE\n            user_id = users.id\n            AND sent_at >= DATE(:lastNotified!))\nLIMIT 1","loc":{"a":30598,"b":32946,"line":1032,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     JOIN availabilities ON users.id = availabilities.user_id
 *     JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
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
 *     AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end
 *     AND subjects_unlocked.subject = :subject!
 *     AND NOT volunteer_profiles.volunteer_partner_org_id IS NULL
 *     AND NOT EXISTS (
 *         SELECT
 *             user_id
 *         FROM
 *             notifications
 *         WHERE
 *             user_id = users.id
 *             AND sent_at >= DATE(:lastNotified!))
 * LIMIT 1
 * ```
 */
export const getNextAnyPartnerVolunteerToNotify = new PreparedQuery<IGetNextAnyPartnerVolunteerToNotifyParams,IGetNextAnyPartnerVolunteerToNotifyResult>(getNextAnyPartnerVolunteerToNotifyIR);


/** 'GetNextSpecificPartnerVolunteerToNotify' parameters type */
export interface IGetNextSpecificPartnerVolunteerToNotifyParams {
  lastNotified: Date;
  subject: string;
  volunteerPartnerOrg: string;
}

/** 'GetNextSpecificPartnerVolunteerToNotify' return type */
export interface IGetNextSpecificPartnerVolunteerToNotifyResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetNextSpecificPartnerVolunteerToNotify' query type */
export interface IGetNextSpecificPartnerVolunteerToNotifyQuery {
  params: IGetNextSpecificPartnerVolunteerToNotifyParams;
  result: IGetNextSpecificPartnerVolunteerToNotifyResult;
}

const getNextSpecificPartnerVolunteerToNotifyIR: any = {"name":"getNextSpecificPartnerVolunteerToNotify","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":35083,"b":35090,"line":1142,"col":37}]}},{"name":"volunteerPartnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":35131,"b":35150,"line":1143,"col":39}]}},{"name":"lastNotified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":35325,"b":35337,"line":1151,"col":33}]}}],"usedParamSet":{"subject":true,"volunteerPartnerOrg":true,"lastNotified":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN availabilities ON users.id = availabilities.user_id\n    JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    JOIN (\n        SELECT\n            sub_unlocked.user_id,\n            subjects.name AS subject\n        FROM (\n            SELECT\n                user_id,\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_total.total\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        certification_subject_unlocks\n                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_total ON subject_total.name = subjects.name\n                GROUP BY\n                    user_id,\n                    subjects.name,\n                    subject_total.total\n                HAVING\n                    COUNT(*)::int >= subject_total.total) AS sub_unlocked\n                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id\nWHERE\n    test_user IS FALSE\n    AND banned IS FALSE\n    AND deactivated IS FALSE\n    AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end\n    AND subjects_unlocked.subject = :subject!\n    AND volunteer_partner_orgs.name = :volunteerPartnerOrg!\n    AND NOT EXISTS (\n        SELECT\n            user_id\n        FROM\n            notifications\n        WHERE\n            user_id = users.id\n            AND sent_at >= DATE(:lastNotified!))\nLIMIT 1","loc":{"a":33003,"b":35347,"line":1094,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     JOIN availabilities ON users.id = availabilities.user_id
 *     JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
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
 *     AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end
 *     AND subjects_unlocked.subject = :subject!
 *     AND volunteer_partner_orgs.name = :volunteerPartnerOrg!
 *     AND NOT EXISTS (
 *         SELECT
 *             user_id
 *         FROM
 *             notifications
 *         WHERE
 *             user_id = users.id
 *             AND sent_at >= DATE(:lastNotified!))
 * LIMIT 1
 * ```
 */
export const getNextSpecificPartnerVolunteerToNotify = new PreparedQuery<IGetNextSpecificPartnerVolunteerToNotifyParams,IGetNextSpecificPartnerVolunteerToNotifyResult>(getNextSpecificPartnerVolunteerToNotifyIR);


