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

const getVolunteerContactInfoByIdIR: any = {"name":"getVolunteerContactInfoById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":455,"b":461,"line":15,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN banned_users ON banned_users.user_id = users.id\nWHERE\n    users.id = :userId!\n    AND banned_users.user_id IS NULL\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE","loc":{"a":40,"b":566,"line":2,"col":0}}};

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
 *     LEFT JOIN banned_users ON banned_users.user_id = users.id
 * WHERE
 *     users.id = :userId!
 *     AND banned_users.user_id IS NULL
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

const getVolunteerContactInfoByIdsIR: any = {"name":"getVolunteerContactInfoByIds","params":[{"name":"userIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1032,"b":1039,"line":35,"col":21}]}}],"usedParamSet":{"userIds":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN banned_users ON banned_users.user_id = users.id\nWHERE\n    users.id = ANY (:userIds!)\n    AND banned_users.user_id IS NULL\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE                                                                                                                                                            ","loc":{"a":612,"b":1145,"line":22,"col":0}}};

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
 *     LEFT JOIN banned_users ON banned_users.user_id = users.id
 * WHERE
 *     users.id = ANY (:userIds!)
 *     AND banned_users.user_id IS NULL
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

const getVolunteersForBlackoutOverIR: any = {"name":"getVolunteersForBlackoutOver","params":[{"name":"startDate","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1772,"b":1781,"line":57,"col":30}]}}],"usedParamSet":{"startDate":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN banned_users ON banned_users.user_id = users.id\nWHERE\n    users.last_activity_at < :startDate!\n    AND banned_users.user_id IS NULL\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.volunteer_partner_org_id IS NULL","loc":{"a":1348,"b":1991,"line":44,"col":0}}};

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
 *     LEFT JOIN banned_users ON banned_users.user_id = users.id
 * WHERE
 *     users.last_activity_at < :startDate!
 *     AND banned_users.user_id IS NULL
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

const getVolunteerForQuickTipsIR: any = {"name":"getVolunteerForQuickTips","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2445,"b":2450,"line":78,"col":25}]}},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2483,"b":2493,"line":79,"col":31}]}}],"usedParamSet":{"userId":true,"mongoUserId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN banned_users ON banned_users.user_id = users.id\nWHERE (users.id::uuid = :userId\n    OR users.mongo_id::text = :mongoUserId)\nAND volunteer_profiles.onboarded IS TRUE\nAND banned_users.user_id IS NULL\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE","loc":{"a":2032,"b":2628,"line":66,"col":0}}};

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
 *     LEFT JOIN banned_users ON banned_users.user_id = users.id
 * WHERE (users.id::uuid = :userId
 *     OR users.mongo_id::text = :mongoUserId)
 * AND volunteer_profiles.onboarded IS TRUE
 * AND banned_users.user_id IS NULL
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

const getPartnerVolunteerForLowHoursIR: any = {"name":"getPartnerVolunteerForLowHours","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3153,"b":3158,"line":104,"col":37},{"a":3274,"b":3279,"line":106,"col":25}]}},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3312,"b":3322,"line":107,"col":31}]}}],"usedParamSet":{"userId":true,"mongoUserId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = :userId) AS total_sessions ON TRUE\n    LEFT JOIN banned_users ON banned_users.user_id = users.id\nWHERE (users.id::uuid = :userId\n    OR users.mongo_id::text = :mongoUserId)\nAND volunteer_profiles.onboarded IS TRUE\nAND volunteer_profiles.volunteer_partner_org_id IS NOT NULL\nAND banned_users.user_id IS NULL\nAND users.deactivated IS FALSE\nAND total_sessions.total > 0\nAND users.test_user IS FALSE","loc":{"a":2676,"b":3546,"line":87,"col":0}}};

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
 *     LEFT JOIN banned_users ON banned_users.user_id = users.id
 * WHERE (users.id::uuid = :userId
 *     OR users.mongo_id::text = :mongoUserId)
 * AND volunteer_profiles.onboarded IS TRUE
 * AND volunteer_profiles.volunteer_partner_org_id IS NOT NULL
 * AND banned_users.user_id IS NULL
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

const getVolunteersForWeeklyHourSummaryIR: any = {"name":"getVolunteersForWeeklyHourSummary","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    sent_hour_summary_intro_email\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id\n    LEFT JOIN banned_users ON banned_users.user_id = users.id\nWHERE (volunteer_partner_orgs.id IS NULL\n    OR volunteer_partner_orgs.receive_weekly_hour_summary_email IS TRUE)\nAND banned_users.user_id IS NULL\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE\nGROUP BY\n    users.id,\n    volunteer_partner_org,\n    sent_hour_summary_intro_email","loc":{"a":3597,"b":4383,"line":117,"col":0}}};

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
 *     LEFT JOIN banned_users ON banned_users.user_id = users.id
 * WHERE (volunteer_partner_orgs.id IS NULL
 *     OR volunteer_partner_orgs.receive_weekly_hour_summary_email IS TRUE)
 * AND banned_users.user_id IS NULL
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

const updateVolunteerHourSummaryIntroByIdIR: any = {"name":"updateVolunteerHourSummaryIntroById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4556,"b":4562,"line":149,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_hour_summary_intro_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":4436,"b":4590,"line":143,"col":0}}};

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

const updateVolunteerThroughAvailabilityIR: any = {"name":"updateVolunteerThroughAvailability","params":[{"name":"timezone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4701,"b":4708,"line":158,"col":25}]}},{"name":"onboarded","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4748,"b":4756,"line":159,"col":26}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4815,"b":4821,"line":162,"col":15}]}}],"usedParamSet":{"timezone":true,"onboarded":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    timezone = COALESCE(:timezone, timezone),\n    onboarded = COALESCE(:onboarded, onboarded),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":4642,"b":4849,"line":155,"col":0}}};

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

const getVolunteerIdsForElapsedAvailabilityIR: any = {"name":"getVolunteerIdsForElapsedAvailability","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    user_id\nFROM\n    volunteer_profiles\n    JOIN users ON volunteer_profiles.user_id = users.id\nWHERE\n    users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE","loc":{"a":4904,"b":5164,"line":168,"col":0}}};

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

const getVolunteersForTotalHoursIR: any = {"name":"getVolunteersForTotalHours","params":[{"name":"targetPartnerOrgs","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5605,"b":5622,"line":190,"col":39}]}}],"usedParamSet":{"targetPartnerOrgs":true},"statement":{"body":"SELECT\n    users.id\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id\n    LEFT JOIN banned_users ON banned_users.user_id = users.id\nWHERE\n    volunteer_partner_orgs.key = ANY (:targetPartnerOrgs!)\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE\n    AND banned_users.user_id IS NULL\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\nGROUP BY\n    users.id","loc":{"a":5208,"b":5839,"line":181,"col":0}}};

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
 *     LEFT JOIN banned_users ON banned_users.user_id = users.id
 * WHERE
 *     volunteer_partner_orgs.key = ANY (:targetPartnerOrgs!)
 *     AND volunteer_profiles.onboarded IS TRUE
 *     AND volunteer_profiles.approved IS TRUE
 *     AND banned_users.user_id IS NULL
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

const getVolunteerForOnboardingByIdIR: any = {"name":"getVolunteerForOnboardingById","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6902,"b":6907,"line":232,"col":30},{"a":7421,"b":7426,"line":244,"col":27}]}},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6948,"b":6958,"line":233,"col":39},{"a":7463,"b":7473,"line":245,"col":35}]}}],"usedParamSet":{"userId":true,"mongoUserId":true},"statement":{"body":"WITH CTE AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n)\nSELECT\n    users.id,\n    email,\n    first_name,\n    volunteer_profiles.onboarded,\n    COALESCE(array_agg(subjects_unlocked.subject) FILTER (WHERE subjects_unlocked.subject IS NOT NULL), '{}') AS subjects,\n    country,\n    MAX(availabilities.updated_at) AS availability_last_modified_at\nFROM\n    users\n    LEFT JOIN (\n        SELECT\n            subjects.name AS subject,\n            COUNT(*)::int AS earned_certs\n        FROM\n            users_certifications\n            JOIN certification_subject_unlocks USING (certification_id)\n            JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n            JOIN users ON users.id = users_certifications.user_id\n            JOIN CTE ON CTE.name = subjects.name\n        WHERE\n            users.id::uuid = :userId\n            OR users.mongo_id::text = :mongoUserId\n        GROUP BY\n            subjects.name, CTE.total) AS subjects_unlocked ON TRUE\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN availabilities ON availabilities.user_id = users.id\n    LEFT JOIN banned_users ON banned_users.user_id = users.id\nWHERE\n    banned_users.user_id IS NULL\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS FALSE\n    AND (users.id::uuid = :userId\n        OR users.mongo_id::text = :mongoUserId)\nGROUP BY\n    users.id,\n    onboarded,\n    country","loc":{"a":5886,"b":7524,"line":201,"col":0}}};

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
 *             COUNT(*)::int AS earned_certs
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
 *             subjects.name, CTE.total) AS subjects_unlocked ON TRUE
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN availabilities ON availabilities.user_id = users.id
 *     LEFT JOIN banned_users ON banned_users.user_id = users.id
 * WHERE
 *     banned_users.user_id IS NULL
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

const getVolunteersForTelecomReportIR: any = {"name":"getVolunteersForTelecomReport","params":[{"name":"partnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8010,"b":8020,"line":266,"col":34}]}}],"usedParamSet":{"partnerOrg":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    users.created_at\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN banned_users ON banned_users.user_id = users.id\nWHERE\n    volunteer_partner_orgs.key = :partnerOrg!\n    AND banned_users.user_id IS NULL\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE\nGROUP BY\n    users.id,\n    volunteer_partner_org","loc":{"a":7571,"b":8263,"line":253,"col":0}}};

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
 *     LEFT JOIN banned_users ON banned_users.user_id = users.id
 * WHERE
 *     volunteer_partner_orgs.key = :partnerOrg!
 *     AND banned_users.user_id IS NULL
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

const getVolunteersNotifiedSinceDateIR: any = {"name":"getVolunteersNotifiedSinceDate","params":[{"name":"sinceDate","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8473,"b":8482,"line":286,"col":34}]}}],"usedParamSet":{"sinceDate":true},"statement":{"body":"SELECT\n    users.id\nFROM\n    users\n    LEFT JOIN notifications ON users.id = notifications.user_id\nGROUP BY\n    users.id\nHAVING\n    MAX(notifications.sent_at) > :sinceDate!","loc":{"a":8311,"b":8482,"line":278,"col":0}}};

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

const getVolunteersNotifiedBySessionIdIR: any = {"name":"getVolunteersNotifiedBySessionId","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8626,"b":8635,"line":295,"col":32}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    notifications.user_id\nFROM\n    notifications\nWHERE\n    notifications.session_id = :sessionId!","loc":{"a":8532,"b":8635,"line":290,"col":0}}};

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

const getVolunteerByReferenceIR: any = {"name":"getVolunteerByReference","params":[{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8961,"b":8972,"line":306,"col":31}]}}],"usedParamSet":{"referenceId":true},"statement":{"body":"SELECT\n    volunteer_references.user_id AS volunteer_id,\n    volunteer_references.email AS reference_email\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_references.id = :referenceId!\n    AND volunteer_reference_statuses.name <> 'removed'\nLIMIT 1","loc":{"a":8676,"b":9035,"line":299,"col":0}}};

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

const addVolunteerReferenceByIdIR: any = {"name":"addVolunteerReferenceById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9202,"b":9204,"line":314,"col":5}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9212,"b":9218,"line":315,"col":5}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9226,"b":9235,"line":316,"col":5}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9243,"b":9251,"line":317,"col":5}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9259,"b":9264,"line":318,"col":5}]}}],"usedParamSet":{"id":true,"userId":true,"firstName":true,"lastName":true,"email":true},"statement":{"body":"INSERT INTO volunteer_references (id, user_id, first_name, last_name, email, status_id, created_at, updated_at)\nSELECT\n    :id!,\n    :userId!,\n    :firstName!,\n    :lastName!,\n    :email!,\n    volunteer_reference_statuses.id,\n    NOW(),\n    NOW()\nFROM\n    volunteer_reference_statuses\nWHERE\n    name = 'unsent'::text\nRETURNING\n    id AS ok","loc":{"a":9078,"b":9416,"line":312,"col":0}}};

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

const updateVolunteerReferenceSubmissionIR: any = {"name":"updateVolunteerReferenceSubmission","params":[{"name":"affiliation","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9561,"b":9571,"line":335,"col":28}]}},{"name":"relationshipLength","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9624,"b":9641,"line":336,"col":36}]}},{"name":"rejectionReason","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9699,"b":9713,"line":337,"col":33}]}},{"name":"additionalInfo","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9767,"b":9780,"line":338,"col":32}]}},{"name":"patient","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9825,"b":9831,"line":339,"col":24}]}},{"name":"positiveRoleModel","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9880,"b":9896,"line":340,"col":36}]}},{"name":"agreeableAndApproachable","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9964,"b":9987,"line":341,"col":43}]}},{"name":"communicatesEffectively","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10060,"b":10082,"line":342,"col":41}]}},{"name":"trustworthyWithChildren","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10154,"b":10176,"line":343,"col":42}]}},{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10392,"b":10403,"line":353,"col":31}]}}],"usedParamSet":{"affiliation":true,"relationshipLength":true,"rejectionReason":true,"additionalInfo":true,"patient":true,"positiveRoleModel":true,"agreeableAndApproachable":true,"communicatesEffectively":true,"trustworthyWithChildren":true,"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    affiliation = COALESCE(:affiliation, affiliation),\n    relationship_length = COALESCE(:relationshipLength, relationship_length),\n    rejection_reason = COALESCE(:rejectionReason, rejection_reason),\n    additional_info = COALESCE(:additionalInfo, additional_info),\n    patient = COALESCE(:patient, patient),\n    positive_role_model = COALESCE(:positiveRoleModel, positive_role_model),\n    agreeable_and_approachable = COALESCE(:agreeableAndApproachable, agreeable_and_approachable),\n    communicates_effectively = COALESCE(:communicatesEffectively, communicates_effectively),\n    trustworthy_with_children = COALESCE(:trustworthyWithChildren, trustworthy_with_children),\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = 'submitted') AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":9468,"b":10447,"line":331,"col":0}}};

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

const getInactiveVolunteersIR: any = {"name":"getInactiveVolunteers","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10911,"b":10916,"line":372,"col":31}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10952,"b":10955,"line":373,"col":34}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN banned_users ON banned_users.user_id = users.id\nWHERE\n    users.last_activity_at >= :start!\n    AND users.last_activity_at < :end!\n    AND banned_users.user_id IS NULL\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE","loc":{"a":10486,"b":11105,"line":359,"col":0}}};

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
 *     LEFT JOIN banned_users ON banned_users.user_id = users.id
 * WHERE
 *     users.last_activity_at >= :start!
 *     AND users.last_activity_at < :end!
 *     AND banned_users.user_id IS NULL
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

const updateVolunteerReferenceSentByIdIR: any = {"name":"updateVolunteerReferenceSentById","params":[{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11421,"b":11432,"line":395,"col":31}]}}],"usedParamSet":{"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    sent_at = NOW(),\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = 'sent') AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":11155,"b":11476,"line":381,"col":0}}};

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

const updateVolunteerReferenceStatusByIdIR: any = {"name":"updateVolunteerReferenceStatusById","params":[{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11738,"b":11744,"line":413,"col":16}]}},{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11796,"b":11807,"line":415,"col":31}]}}],"usedParamSet":{"status":true,"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    sent_at = NOW(),\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":11528,"b":11851,"line":401,"col":0}}};

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

const deleteVolunteerReferenceByIdIR: any = {"name":"deleteVolunteerReferenceById","params":[{"name":"referenceEmail","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12148,"b":12162,"line":434,"col":34}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12204,"b":12210,"line":435,"col":40}]}}],"usedParamSet":{"referenceEmail":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = 'removed') AS subquery\nWHERE\n    volunteer_references.email = :referenceEmail!\n    AND volunteer_references.user_id = :userId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":11897,"b":12254,"line":421,"col":0}}};

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

const updateVolunteersReadyToCoachByIdsIR: any = {"name":"updateVolunteersReadyToCoachByIds","params":[{"name":"userIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12426,"b":12433,"line":447,"col":20}]}}],"usedParamSet":{"userIds":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_ready_to_coach_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = ANY (:userIds!)\nRETURNING\n    user_id AS ok","loc":{"a":12305,"b":12462,"line":441,"col":0}}};

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

const updateVolunteerElapsedAvailabilityByIdIR: any = {"name":"updateVolunteerElapsedAvailabilityById","params":[{"name":"elapsedAvailability","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12658,"b":12677,"line":459,"col":46}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12759,"b":12765,"line":463,"col":19},{"a":12801,"b":12807,"line":465,"col":15}]}}],"usedParamSet":{"elapsedAvailability":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    elapsed_availability = subquery.total\nFROM (\n    SELECT\n        COALESCE(elapsed_availability, 0) + (:elapsedAvailability!)::int AS total\n    FROM\n        volunteer_profiles\n    WHERE\n        user_id = :userId!) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":12518,"b":12835,"line":453,"col":0}}};

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

const updateVolunteerTotalHoursByIdIR: any = {"name":"updateVolunteerTotalHoursById","params":[{"name":"totalHours","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13024,"b":13034,"line":477,"col":47}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13120,"b":13126,"line":481,"col":19},{"a":13162,"b":13168,"line":483,"col":15}]}}],"usedParamSet":{"totalHours":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    total_volunteer_hours = subquery.total\nFROM (\n    SELECT\n        COALESCE(total_volunteer_hours, 0) + (:totalHours!)::numeric AS total\n    FROM\n        volunteer_profiles\n    WHERE\n        user_id = :userId!) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":12882,"b":13196,"line":471,"col":0}}};

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

const getVolunteerTrainingCoursesIR: any = {"name":"getVolunteerTrainingCourses","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13611,"b":13617,"line":501,"col":38}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    user_id,\n    complete,\n    training_courses.name AS training_course,\n    progress,\n    completed_materials,\n    users_training_courses.created_at,\n    users_training_courses.updated_at\nFROM\n    users_training_courses\n    LEFT JOIN training_courses ON training_courses.id = users_training_courses.training_course_id\nWHERE\n    users_training_courses.user_id = :userId!","loc":{"a":13241,"b":13617,"line":489,"col":0}}};

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

const updateVolunteerTrainingByIdIR: any = {"name":"updateVolunteerTrainingById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13811,"b":13817,"line":507,"col":5}]}},{"name":"complete","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13850,"b":13858,"line":509,"col":5},{"a":14093,"b":14101,"line":521,"col":20}]}},{"name":"progress","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13866,"b":13874,"line":510,"col":5},{"a":14124,"b":14132,"line":522,"col":20}]}},{"name":"materialKey","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13889,"b":13900,"line":511,"col":12},{"a":14204,"b":14215,"line":523,"col":69},{"a":14269,"b":14280,"line":526,"col":13}]}},{"name":"trainingCourse","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13993,"b":14007,"line":517,"col":29}]}}],"usedParamSet":{"userId":true,"complete":true,"progress":true,"materialKey":true,"trainingCourse":true},"statement":{"body":"INSERT INTO users_training_courses AS ins (user_id, training_course_id, complete, progress, completed_materials, created_at, updated_at)\nSELECT\n    :userId!,\n    training_courses.id,\n    :complete!,\n    :progress!,\n    ARRAY[(:materialKey!)::text],\n    NOW(),\n    NOW()\nFROM\n    training_courses\nWHERE\n    training_courses.name = :trainingCourse!\nON CONFLICT (user_id,\n    training_course_id)\n    DO UPDATE SET\n        complete = :complete!,\n        progress = :progress!,\n        completed_materials = ARRAY_APPEND(ins.completed_materials, :materialKey!),\n        updated_at = NOW()\n    WHERE\n        NOT :materialKey! = ANY (ins.completed_materials)\n    RETURNING\n        user_id AS ok","loc":{"a":13662,"b":14348,"line":505,"col":0}}};

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

const updateVolunteerPhotoIdByIdIR: any = {"name":"updateVolunteerPhotoIdById","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14449,"b":14452,"line":535,"col":23}]}},{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14579,"b":14585,"line":543,"col":16}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14621,"b":14627,"line":545,"col":15}]}}],"usedParamSet":{"key":true,"status":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    photo_id_s3_key = :key!,\n    photo_id_status = subquery.id\nFROM (\n    SELECT\n        id\n    FROM\n        photo_id_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":14392,"b":14655,"line":532,"col":0}}};

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

const updateVolunteerSentInactive30DayEmailIR: any = {"name":"updateVolunteerSentInactive30DayEmail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14831,"b":14837,"line":557,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_thirty_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":14710,"b":14865,"line":551,"col":0}}};

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

const updateVolunteerSentInactive60DayEmailIR: any = {"name":"updateVolunteerSentInactive60DayEmail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15083,"b":15089,"line":570,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_thirty_day_email = TRUE,\n    sent_inactive_sixty_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":14920,"b":15117,"line":563,"col":0}}};

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

const updateVolunteerSentInactive90DayEmailIR: any = {"name":"updateVolunteerSentInactive90DayEmail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15293,"b":15299,"line":582,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_ninety_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":15172,"b":15327,"line":576,"col":0}}};

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

const getVolunteerUnsentReferencesIR: any = {"name":"getVolunteerUnsentReferences","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    volunteer_references.id,\n    user_id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_reference_statuses.name = 'unsent'","loc":{"a":15373,"b":15706,"line":588,"col":0}}};

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

const getReferencesForReferenceFormApologyIR: any = {"name":"getReferencesForReferenceFormApology","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    volunteer_references.id,\n    user_id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_reference_statuses.name = 'sent'\n    AND volunteer_references.sent_at <= '2022-04-12 18:00:00.000'\n    AND volunteer_references.sent_at >= '2022-02-26 00:00:00.000'","loc":{"a":15760,"b":16223,"line":603,"col":0}}};

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

const getReferencesByVolunteerIR: any = {"name":"getReferencesByVolunteer","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16574,"b":16580,"line":630,"col":36}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    volunteer_references.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_references.user_id = :userId!\n    AND volunteer_reference_statuses.name != 'removed'","loc":{"a":16265,"b":16635,"line":620,"col":0}}};

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

const checkReferenceExistsBeforeAddingIR: any = {"name":"checkReferenceExistsBeforeAdding","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17129,"b":17135,"line":651,"col":36},{"a":17247,"b":17253,"line":654,"col":36}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17185,"b":17190,"line":652,"col":48},{"a":17293,"b":17298,"line":655,"col":38}]}}],"usedParamSet":{"userId":true,"email":true},"statement":{"body":"SELECT\n    volunteer_references.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status,\n    sub.actions\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\n    LEFT JOIN (\n        SELECT\n            array_agg(action) AS actions\n        FROM\n            user_actions\n        WHERE\n            user_actions.user_id = :userId!\n            AND user_actions.reference_email = :email!) sub ON TRUE\nWHERE\n    volunteer_references.user_id = :userId!\n    AND volunteer_references.email = :email!","loc":{"a":16685,"b":17298,"line":635,"col":0}}};

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

const getReferencesByVolunteerForAdminDetailIR: any = {"name":"getReferencesByVolunteerForAdminDetail","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17879,"b":17885,"line":678,"col":36}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    volunteer_references.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status,\n    affiliation,\n    relationship_length,\n    patient,\n    positive_role_model,\n    agreeable_and_approachable,\n    communicates_effectively,\n    rejection_reason,\n    additional_info,\n    trustworthy_with_children\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_references.user_id = :userId!\n    AND volunteer_reference_statuses.name != 'removed'","loc":{"a":17354,"b":17940,"line":659,"col":0}}};

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

const getVolunteerForPendingStatusIR: any = {"name":"getVolunteerForPendingStatus","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18744,"b":18750,"line":706,"col":23},{"a":18798,"b":18804,"line":708,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_profiles.approved,\n    volunteer_profiles.onboarded,\n    volunteer_profiles.country,\n    photo_id_statuses.name AS photo_id_status,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    occupations.occupations\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    LEFT JOIN (\n        SELECT\n            array_agg(occupation) AS occupations\n        FROM\n            volunteer_occupations\n        WHERE\n            user_id = :userId!) AS occupations ON TRUE\nWHERE\n    users.id = :userId!","loc":{"a":17986,"b":18804,"line":683,"col":0}}};

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

const updateVolunteerReferenceStatusIR: any = {"name":"updateVolunteerReferenceStatus","params":[{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19041,"b":19047,"line":723,"col":16}]}},{"name":"referenceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19099,"b":19110,"line":725,"col":31}]}}],"usedParamSet":{"status":true,"referenceId":true},"statement":{"body":"UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok","loc":{"a":18852,"b":19154,"line":712,"col":0}}};

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

const updateVolunteerApprovedIR: any = {"name":"updateVolunteerApproved","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19313,"b":19319,"line":737,"col":34}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    approved = TRUE,\n    updated_at = NOW()\nWHERE\n    volunteer_profiles.user_id = :userId!\nRETURNING\n    volunteer_profiles.user_id AS ok","loc":{"a":19195,"b":19366,"line":731,"col":0}}};

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

const updateVolunteerPendingIR: any = {"name":"updateVolunteerPending","params":[{"name":"approved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19456,"b":19464,"line":746,"col":16}]}},{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19615,"b":19621,"line":755,"col":16}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19676,"b":19682,"line":757,"col":34}]}}],"usedParamSet":{"approved":true,"status":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    approved = :approved!,\n    photo_id_status = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        photo_id_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    volunteer_profiles.user_id = :userId!\nRETURNING\n    volunteer_profiles.user_id AS ok","loc":{"a":19406,"b":19729,"line":743,"col":0}}};

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

const updateVolunteerOnboardedIR: any = {"name":"updateVolunteerOnboarded","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19890,"b":19896,"line":769,"col":34}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    onboarded = TRUE,\n    updated_at = NOW()\nWHERE\n    volunteer_profiles.user_id = :userId!\nRETURNING\n    volunteer_profiles.user_id AS ok","loc":{"a":19771,"b":19943,"line":763,"col":0}}};

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

const getVolunteersForNiceToMeetYouIR: any = {"name":"getVolunteersForNiceToMeetYou","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20514,"b":20519,"line":791,"col":29}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20549,"b":20552,"line":792,"col":28}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN banned_users ON banned_users.user_id = users.id\nWHERE\n    banned_users.user_id IS NULL\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND users.created_at >= :start!\n    AND users.created_at < :end!","loc":{"a":19990,"b":20552,"line":775,"col":0}}};

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
 *     LEFT JOIN banned_users ON banned_users.user_id = users.id
 * WHERE
 *     banned_users.user_id IS NULL
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

const getVolunteersForReadyToCoachIR: any = {"name":"getVolunteersForReadyToCoach","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN user_product_flags ON user_product_flags.user_id = users.id\n    LEFT JOIN banned_users ON banned_users.user_id = users.id\nWHERE\n    banned_users.user_id IS NULL\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE\n    AND user_product_flags.sent_ready_to_coach_email IS FALSE","loc":{"a":20598,"b":21316,"line":796,"col":0}}};

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
 *     LEFT JOIN banned_users ON banned_users.user_id = users.id
 * WHERE
 *     banned_users.user_id IS NULL
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

const getVolunteersForWaitingReferencesIR: any = {"name":"getVolunteersForWaitingReferences","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22166,"b":22171,"line":838,"col":40}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22213,"b":22216,"line":839,"col":40}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name,\n    users.last_name,\n    users.phone,\n    users.email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN volunteer_references ON volunteer_references.user_id = users.id\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\n    LEFT JOIN banned_users ON banned_users.user_id = users.id\nWHERE\n    banned_users.user_id IS NULL\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_reference_statuses.name = 'sent'\n    AND volunteer_references.sent_at > :start!\n    AND volunteer_references.sent_at < :end!\nGROUP BY\n    users.id,\n    volunteer_partner_orgs.key","loc":{"a":21367,"b":22270,"line":819,"col":0}}};

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
 *     LEFT JOIN banned_users ON banned_users.user_id = users.id
 * WHERE
 *     banned_users.user_id IS NULL
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

const addVolunteerCertificationIR: any = {"name":"addVolunteerCertification","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22410,"b":22416,"line":848,"col":5}]}},{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22626,"b":22633,"line":859,"col":24}]}}],"usedParamSet":{"userId":true,"subject":true},"statement":{"body":"INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at)\nSELECT\n    :userId!,\n    subquery.id,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        certifications.id\n    FROM\n        certifications\n        JOIN quizzes ON quizzes.name = certifications.name\n    WHERE\n        quizzes.name = :subject!) AS subquery\nON CONFLICT (user_id,\n    certification_id)\n    DO NOTHING\nRETURNING\n    user_id AS ok","loc":{"a":22313,"b":22733,"line":846,"col":0}}};

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

const updateVolunteerQuizIR: any = {"name":"updateVolunteerQuiz","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22876,"b":22882,"line":870,"col":5}]}},{"name":"passed","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22914,"b":22920,"line":873,"col":5},{"a":23167,"b":23173,"line":887,"col":18}]}},{"name":"quiz","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23040,"b":23044,"line":882,"col":24}]}}],"usedParamSet":{"userId":true,"passed":true,"quiz":true},"statement":{"body":"INSERT INTO users_quizzes AS ins (user_id, quiz_id, attempts, passed, created_at, updated_at)\nSELECT\n    :userId!,\n    subquery.id,\n    1,\n    :passed!,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        quizzes.id\n    FROM\n        quizzes\n    WHERE\n        quizzes.name = :quiz!) AS subquery\nON CONFLICT (user_id,\n    quiz_id)\n    DO UPDATE SET\n        attempts = ins.attempts + 1,\n        passed = :passed!,\n        updated_at = NOW()\n    RETURNING\n        user_id AS ok","loc":{"a":22770,"b":23237,"line":868,"col":0}}};

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

const getVolunteerForTextResponseIR: any = {"name":"getVolunteerForTextResponse","params":[{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23814,"b":23819,"line":909,"col":19}]}}],"usedParamSet":{"phone":true},"statement":{"body":"SELECT\n    users.id AS volunteer_id,\n    sessions.id AS session_id,\n    sessions.volunteer_joined_at,\n    sessions.ended_at,\n    subjects.name AS subject,\n    topics.name AS topic\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN notifications ON notifications.user_id = users.id\n    LEFT JOIN sessions ON sessions.id = notifications.session_id\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\nWHERE\n    users.phone = :phone!\nORDER BY\n    notifications.created_at DESC\nLIMIT 1","loc":{"a":23282,"b":23870,"line":894,"col":0}}};

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

const getVolunteersToReviewIR: any = {"name":"getVolunteersToReview","params":[{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25177,"b":25182,"line":949,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25199,"b":25205,"line":949,"col":30}]}}],"usedParamSet":{"limit":true,"offset":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name AS first_name,\n    users.last_name AS last_name,\n    users.first_name AS firstname,\n    users.last_name AS lastname,\n    users.email,\n    users.created_at,\n    MAX(user_actions.created_at) AS ready_for_review_at\nFROM\n    users\n    JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\n    JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    JOIN volunteer_occupations ON volunteer_occupations.user_id = users.id -- user is only ready for review if they submitted background info\n    JOIN user_actions ON user_actions.user_id = users.id\nWHERE\n    volunteer_profiles.approved IS FALSE\n    AND NOT volunteer_profiles.country IS NULL\n    AND NOT volunteer_profiles.photo_id_s3_key IS NULL\n    AND photo_id_statuses.name = ANY ('{ \"submitted\", \"approved\" }')\n    AND user_actions.action = ANY ('{ \"ADDED PHOTO ID\", \"COMPLETED BACKGROUND INFO\" }')\n    AND (\n        SELECT\n            MAX(user_actions.created_at)\n        FROM\n            user_actions\n        WHERE\n            action = ANY ('{ \"ADDED PHOTO ID\", \"COMPLETED BACKGROUND INFO\" }')\n            AND user_id = users.id) > CURRENT_DATE - INTERVAL '3 MONTHS'\nGROUP BY\n    users.id\nORDER BY\n    ready_for_review_at ASC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":23909,"b":25211,"line":916,"col":0}}};

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
 *     JOIN volunteer_occupations ON volunteer_occupations.user_id = users.id -- user is only ready for review if they submitted background info
 *     JOIN user_actions ON user_actions.user_id = users.id
 * WHERE
 *     volunteer_profiles.approved IS FALSE
 *     AND NOT volunteer_profiles.country IS NULL
 *     AND NOT volunteer_profiles.photo_id_s3_key IS NULL
 *     AND photo_id_statuses.name = ANY ('{ "submitted", "approved" }')
 *     AND user_actions.action = ANY ('{ "ADDED PHOTO ID", "COMPLETED BACKGROUND INFO" }')
 *     AND (
 *         SELECT
 *             MAX(user_actions.created_at)
 *         FROM
 *             user_actions
 *         WHERE
 *             action = ANY ('{ "ADDED PHOTO ID", "COMPLETED BACKGROUND INFO" }')
 *             AND user_id = users.id) > CURRENT_DATE - INTERVAL '3 MONTHS'
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

const getReferencesToFollowupIR: any = {"name":"getReferencesToFollowup","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26122,"b":26127,"line":972,"col":40}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26169,"b":26172,"line":973,"col":40}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    users.id AS volunteer_id,\n    users.first_name AS volunteer_first_name,\n    users.last_name AS volunteer_last_name,\n    volunteer_references.id AS reference_id,\n    volunteer_references.first_name AS reference_first_name,\n    volunteer_references.last_name AS reference_last_name,\n    volunteer_references.email AS reference_email\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN volunteer_references ON volunteer_references.user_id = users.id\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\n    LEFT JOIN banned_users ON banned_users.user_id = users.id\nWHERE\n    banned_users.user_id IS NULL\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_reference_statuses.name = 'sent'\n    AND volunteer_references.sent_at > :start!\n    AND volunteer_references.sent_at < :end!","loc":{"a":25252,"b":26172,"line":953,"col":0}}};

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
 *     LEFT JOIN banned_users ON banned_users.user_id = users.id
 * WHERE
 *     banned_users.user_id IS NULL
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

const updateVolunteerBackgroundInfoIR: any = {"name":"updateVolunteerBackgroundInfo","params":[{"name":"occupation","codeRefs":{"defined":{"a":26225,"b":26234,"line":978,"col":8},"used":[{"a":26502,"b":26512,"line":987,"col":13}]},"transform":{"type":"pick_array_spread","keys":[{"name":"userId","required":false},{"name":"occupation","required":false},{"name":"createdAt","required":false},{"name":"updatedAt","required":false}]},"required":true},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26370,"b":26376,"line":982,"col":21},{"a":27160,"b":27166,"line":1004,"col":23}]}},{"name":"approved","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26649,"b":26656,"line":993,"col":33}]}},{"name":"experience","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26705,"b":26714,"line":994,"col":35}]}},{"name":"company","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26762,"b":26768,"line":995,"col":32}]}},{"name":"college","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26813,"b":26819,"line":996,"col":32}]}},{"name":"linkedInUrl","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26869,"b":26879,"line":997,"col":37}]}},{"name":"country","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26929,"b":26935,"line":998,"col":32}]}},{"name":"state","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26978,"b":26982,"line":999,"col":30}]}},{"name":"city","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27022,"b":27025,"line":1000,"col":29}]}},{"name":"languages","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27069,"b":27077,"line":1001,"col":34}]}}],"usedParamSet":{"userId":true,"occupation":true,"approved":true,"experience":true,"company":true,"college":true,"linkedInUrl":true,"country":true,"state":true,"city":true,"languages":true},"statement":{"body":"WITH clear_occ AS (\n    DELETE FROM volunteer_occupations\n    WHERE user_id = :userId!\n),\nins_occ AS (\nINSERT INTO volunteer_occupations (user_id, occupation, created_at, updated_at)\n        VALUES\n            :occupation!\n        ON CONFLICT\n            DO NOTHING)\n        UPDATE\n            volunteer_profiles\n        SET\n            approved = COALESCE(:approved, approved),\n            experience = COALESCE(:experience, experience),\n            company = COALESCE(:company, company),\n            college = COALESCE(:college, college),\n            linkedin_url = COALESCE(:linkedInUrl, linkedin_url),\n            country = COALESCE(:country, country),\n            state = COALESCE(:state, state),\n            city = COALESCE(:city, city),\n            languages = COALESCE(:languages, languages),\n            updated_at = NOW()\n        WHERE\n            user_id = :userId!\n        RETURNING\n            user_id AS ok","loc":{"a":26291,"b":27210,"line":980,"col":0}}};

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

const getQuizzesPassedForDateRangeIR: any = {"name":"getQuizzesPassedForDateRange","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27334,"b":27340,"line":1015,"col":15}]}},{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27365,"b":27370,"line":1016,"col":23}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27395,"b":27398,"line":1017,"col":23}]}}],"usedParamSet":{"userId":true,"start":true,"end":true},"statement":{"body":"SELECT\n    COUNT(*)::int AS total\nFROM\n    users_quizzes\nWHERE\n    user_id = :userId!\n    AND updated_at >= :start!\n    AND updated_at <= :end!\n    AND passed IS TRUE","loc":{"a":27256,"b":27421,"line":1010,"col":0}}};

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
  firstName: string | null | void;
  isBanned: boolean;
  isDeactivated: boolean;
  isVerified: boolean;
  lastName: string | null | void;
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

const updateVolunteerUserForAdminIR: any = {"name":"updateVolunteerUserForAdmin","params":[{"name":"firstName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27514,"b":27522,"line":1025,"col":27}]}},{"name":"lastName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27564,"b":27571,"line":1026,"col":26}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27599,"b":27604,"line":1027,"col":13}]}},{"name":"isVerified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27623,"b":27633,"line":1028,"col":16}]}},{"name":"isBanned","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27650,"b":27658,"line":1029,"col":14}]}},{"name":"isDeactivated","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27680,"b":27693,"line":1030,"col":19}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27717,"b":27723,"line":1032,"col":16}]}}],"usedParamSet":{"firstName":true,"lastName":true,"email":true,"isVerified":true,"isBanned":true,"isDeactivated":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    first_name = COALESCE(:firstName, first_name),\n    last_name = COALESCE(:lastName, last_name),\n    email = :email!,\n    verified = :isVerified!,\n    banned = :isBanned!,\n    deactivated = :isDeactivated!\nWHERE\n    users.id = :userId!\nRETURNING\n    id AS ok","loc":{"a":27466,"b":27746,"line":1022,"col":0}}};

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

const updateVolunteerProfilesForAdminIR: any = {"name":"updateVolunteerProfilesForAdmin","params":[{"name":"partnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27861,"b":27872,"line":1041,"col":32}]}},{"name":"approved","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27900,"b":27907,"line":1042,"col":25}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27941,"b":27947,"line":1044,"col":15}]}}],"usedParamSet":{"partnerOrgId":true,"approved":true,"userId":true},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    volunteer_partner_org_id = :partnerOrgId,\n    approved = COALESCE(:approved, approved)\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":27795,"b":27975,"line":1038,"col":0}}};

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
  otherSignupSource: string | null | void;
  password: string;
  phone: string;
  referralCode: string;
  referredBy: string | null | void;
  signupSourceId: number | null | void;
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

const createVolunteerUserIR: any = {"name":"createVolunteerUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28214,"b":28220,"line":1051,"col":13}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28224,"b":28229,"line":1051,"col":23}]}},{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28233,"b":28238,"line":1051,"col":32}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28242,"b":28251,"line":1051,"col":41}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28255,"b":28263,"line":1051,"col":54}]}},{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28267,"b":28275,"line":1051,"col":66}]}},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28286,"b":28295,"line":1051,"col":85}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28299,"b":28311,"line":1051,"col":98}]}},{"name":"signupSourceId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28315,"b":28328,"line":1051,"col":114}]}},{"name":"otherSignupSource","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28332,"b":28348,"line":1051,"col":131}]}}],"usedParamSet":{"userId":true,"email":true,"phone":true,"firstName":true,"lastName":true,"password":true,"referredBy":true,"referralCode":true,"signupSourceId":true,"otherSignupSource":true},"statement":{"body":"INSERT INTO users (id, email, phone, first_name, last_name, PASSWORD, verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at, created_at, updated_at)\n    VALUES (:userId!, :email!, :phone!, :firstName!, :lastName!, :password!, FALSE, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW(), NOW(), NOW())\nON CONFLICT (email)\n    DO NOTHING\nRETURNING\n    id, email, first_name, last_name, phone, banned, test_user, deactivated, created_at","loc":{"a":28012,"b":28503,"line":1050,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (id, email, phone, first_name, last_name, PASSWORD, verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at, created_at, updated_at)
 *     VALUES (:userId!, :email!, :phone!, :firstName!, :lastName!, :password!, FALSE, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW(), NOW(), NOW())
 * ON CONFLICT (email)
 *     DO NOTHING
 * RETURNING
 *     id, email, first_name, last_name, phone, banned, test_user, deactivated, created_at
 * ```
 */
export const createVolunteerUser = new PreparedQuery<ICreateVolunteerUserParams,ICreateVolunteerUserResult>(createVolunteerUserIR);


/** 'CreateUserVolunteerPartnerOrgInstance' parameters type */
export interface ICreateUserVolunteerPartnerOrgInstanceParams {
  userId: string;
  vpoName: string;
}

/** 'CreateUserVolunteerPartnerOrgInstance' return type */
export interface ICreateUserVolunteerPartnerOrgInstanceResult {
  ok: string | null;
}

/** 'CreateUserVolunteerPartnerOrgInstance' query type */
export interface ICreateUserVolunteerPartnerOrgInstanceQuery {
  params: ICreateUserVolunteerPartnerOrgInstanceParams;
  result: ICreateUserVolunteerPartnerOrgInstanceResult;
}

const createUserVolunteerPartnerOrgInstanceIR: any = {"name":"createUserVolunteerPartnerOrgInstance","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28681,"b":28687,"line":1061,"col":5}]}},{"name":"vpoName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28781,"b":28788,"line":1068,"col":16}]}}],"usedParamSet":{"userId":true,"vpoName":true},"statement":{"body":"INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    :userId!,\n    vpo.id,\n    NOW(),\n    NOW()\nFROM\n    volunteer_partner_orgs vpo\nWHERE\n    vpo.name = :vpoName!\nLIMIT 1\nRETURNING\n    user_id AS ok","loc":{"a":28558,"b":28824,"line":1059,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     vpo.id,
 *     NOW(),
 *     NOW()
 * FROM
 *     volunteer_partner_orgs vpo
 * WHERE
 *     vpo.name = :vpoName!
 * LIMIT 1
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const createUserVolunteerPartnerOrgInstance = new PreparedQuery<ICreateUserVolunteerPartnerOrgInstanceParams,ICreateUserVolunteerPartnerOrgInstanceResult>(createUserVolunteerPartnerOrgInstanceIR);


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

const createVolunteerProfileIR: any = {"name":"createVolunteerProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":28988,"b":28994,"line":1076,"col":13}]}},{"name":"partnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29005,"b":29016,"line":1076,"col":30}]}},{"name":"timezone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29020,"b":29027,"line":1076,"col":45}]}}],"usedParamSet":{"userId":true,"partnerOrgId":true,"timezone":true},"statement":{"body":"INSERT INTO volunteer_profiles (user_id, approved, volunteer_partner_org_id, timezone, created_at, updated_at)\n    VALUES (:userId!, FALSE, :partnerOrgId, :timezone, NOW(), NOW())\nRETURNING\n    user_id AS ok","loc":{"a":28864,"b":29070,"line":1075,"col":0}}};

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
  active: boolean;
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

const getQuizzesForVolunteersIR: any = {"name":"getQuizzesForVolunteers","params":[{"name":"userIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29358,"b":29365,"line":1093,"col":20}]}}],"usedParamSet":{"userIds":true},"statement":{"body":"SELECT\n    user_id,\n    attempts AS tries,\n    users_quizzes.updated_at AS last_attempted_at,\n    passed,\n    quizzes.name,\n    quizzes.active\nFROM\n    users_quizzes\n    JOIN quizzes ON users_quizzes.quiz_id = quizzes.id\nWHERE\n    user_id = ANY (:userIds!)","loc":{"a":29111,"b":29366,"line":1082,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     attempts AS tries,
 *     users_quizzes.updated_at AS last_attempted_at,
 *     passed,
 *     quizzes.name,
 *     quizzes.active
 * FROM
 *     users_quizzes
 *     JOIN quizzes ON users_quizzes.quiz_id = quizzes.id
 * WHERE
 *     user_id = ANY (:userIds!)
 * ```
 */
export const getQuizzesForVolunteers = new PreparedQuery<IGetQuizzesForVolunteersParams,IGetQuizzesForVolunteersResult>(getQuizzesForVolunteersIR);


/** 'GetCertificationsForVolunteer' parameters type */
export interface IGetCertificationsForVolunteerParams {
  userIds: stringArray;
}

/** 'GetCertificationsForVolunteer' return type */
export interface IGetCertificationsForVolunteerResult {
  active: boolean;
  lastAttemptedAt: Date;
  name: string;
  userId: string;
}

/** 'GetCertificationsForVolunteer' query type */
export interface IGetCertificationsForVolunteerQuery {
  params: IGetCertificationsForVolunteerParams;
  result: IGetCertificationsForVolunteerResult;
}

const getCertificationsForVolunteerIR: any = {"name":"getCertificationsForVolunteer","params":[{"name":"userIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29683,"b":29690,"line":1106,"col":20}]}}],"usedParamSet":{"userIds":true},"statement":{"body":"SELECT\n    user_id,\n    users_certifications.updated_at AS last_attempted_at,\n    certifications.name,\n    certifications.active\nFROM\n    users_certifications\n    JOIN certifications ON users_certifications.certification_id = certifications.id\nWHERE\n    user_id = ANY (:userIds!)","loc":{"a":29413,"b":29691,"line":1097,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     users_certifications.updated_at AS last_attempted_at,
 *     certifications.name,
 *     certifications.active
 * FROM
 *     users_certifications
 *     JOIN certifications ON users_certifications.certification_id = certifications.id
 * WHERE
 *     user_id = ANY (:userIds!)
 * ```
 */
export const getCertificationsForVolunteer = new PreparedQuery<IGetCertificationsForVolunteerParams,IGetCertificationsForVolunteerResult>(getCertificationsForVolunteerIR);


/** 'GetActiveQuizzesForVolunteers' parameters type */
export interface IGetActiveQuizzesForVolunteersParams {
  userIds: stringArray;
}

/** 'GetActiveQuizzesForVolunteers' return type */
export interface IGetActiveQuizzesForVolunteersResult {
  lastAttemptedAt: Date;
  name: string;
  passed: boolean;
  tries: number;
  userId: string;
}

/** 'GetActiveQuizzesForVolunteers' query type */
export interface IGetActiveQuizzesForVolunteersQuery {
  params: IGetActiveQuizzesForVolunteersParams;
  result: IGetActiveQuizzesForVolunteersResult;
}

const getActiveQuizzesForVolunteersIR: any = {"name":"getActiveQuizzesForVolunteers","params":[{"name":"userIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29965,"b":29972,"line":1120,"col":20}]}}],"usedParamSet":{"userIds":true},"statement":{"body":"SELECT\n    user_id,\n    attempts AS tries,\n    users_quizzes.updated_at AS last_attempted_at,\n    passed,\n    quizzes.name\nFROM\n    users_quizzes\n    JOIN quizzes ON users_quizzes.quiz_id = quizzes.id\nWHERE\n    user_id = ANY (:userIds!)\n    AND quizzes.active IS TRUE","loc":{"a":29738,"b":30004,"line":1110,"col":0}}};

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
 *     AND quizzes.active IS TRUE
 * ```
 */
export const getActiveQuizzesForVolunteers = new PreparedQuery<IGetActiveQuizzesForVolunteersParams,IGetActiveQuizzesForVolunteersResult>(getActiveQuizzesForVolunteersIR);


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

const getSubjectsForVolunteerIR: any = {"name":"getSubjectsForVolunteer","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":30754,"b":30760,"line":1148,"col":19}]}}],"usedParamSet":{"userId":true},"statement":{"body":"WITH subject_cert_total AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n)\nSELECT\n    subjects_unlocked.subject\nFROM (\n    SELECT\n        subjects.name AS subject,\n        COUNT(*)::int AS earned_certs,\n        subject_cert_total.total\n    FROM\n        users_certifications\n        JOIN certification_subject_unlocks USING (certification_id)\n        JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n        JOIN subject_cert_total ON subject_cert_total.name = subjects.name\n    WHERE\n        user_id = :userId!\n    GROUP BY\n        subjects.name, subject_cert_total.total\n    HAVING\n        COUNT(*)::int >= subject_cert_total.total) AS subjects_unlocked","loc":{"a":30045,"b":30904,"line":1125,"col":0}}};

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
  lastNotified: Date | null | void;
  specificPartner: string | null | void;
  subject: string | null | void;
}

/** 'GetNextVolunteerToNotify' return type */
export interface IGetNextVolunteerToNotifyResult {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  rn: string | null;
  volunteerPartnerOrg: string;
}

/** 'GetNextVolunteerToNotify' query type */
export interface IGetNextVolunteerToNotifyQuery {
  params: IGetNextVolunteerToNotifyParams;
  result: IGetNextVolunteerToNotifyResult;
}

const getNextVolunteerToNotifyIR: any = {"name":"getNextVolunteerToNotify","params":[{"name":"subject","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":31209,"b":31215,"line":1164,"col":36},{"a":31560,"b":31566,"line":1176,"col":36},{"a":34157,"b":34163,"line":1242,"col":12},{"a":34212,"b":34218,"line":1243,"col":12}]}},{"name":"highLevelSubjects","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":31231,"b":31247,"line":1164,"col":58},{"a":31582,"b":31598,"line":1176,"col":58},{"a":34339,"b":34355,"line":1245,"col":10},{"a":34387,"b":34403,"line":1246,"col":13}]}},{"name":"disqualifiedVolunteers","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":32198,"b":32219,"line":1197,"col":14},{"a":32274,"b":32295,"line":1198,"col":36}]}},{"name":"favoriteVolunteers","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":35783,"b":35800,"line":1280,"col":10},{"a":35849,"b":35866,"line":1281,"col":30}]}},{"name":"isPartner","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":35917,"b":35925,"line":1283,"col":10},{"a":35958,"b":35966,"line":1284,"col":13},{"a":36059,"b":36067,"line":1286,"col":13}]}},{"name":"specificPartner","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":36162,"b":36176,"line":1288,"col":11},{"a":36234,"b":36248,"line":1289,"col":41}]}},{"name":"lastNotified","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":36421,"b":36432,"line":1297,"col":28}]}}],"usedParamSet":{"subject":true,"highLevelSubjects":true,"disqualifiedVolunteers":true,"favoriteVolunteers":true,"isPartner":true,"specificPartner":true,"lastNotified":true},"statement":{"body":"WITH subject_totals AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    WHERE\n        subjects.name = ANY (ARRAY[:subject] || COALESCE(:highLevelSubjects::text[], '{}'))\n    GROUP BY\n        subjects.name\n),\ncomputed_subject_totals AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        computed_subject_unlocks\n        JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id\n    WHERE\n        subjects.name = ANY (ARRAY[:subject] || COALESCE(:highLevelSubjects::text[], '{}'))\n    GROUP BY\n        subjects.name\n),\nready_to_tutor_volunteers AS (\n    SELECT\n        users.id AS userId,\n        first_name,\n        last_name,\n        phone,\n        email\n    FROM\n        users\n        JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    WHERE\n        test_user IS FALSE\n        AND banned IS FALSE\n        AND deactivated IS FALSE\n        AND volunteer_profiles.onboarded IS TRUE\n        AND volunteer_profiles.approved IS TRUE\n        AND ( -- user is not part of disqualified group (like active session volunteers) if provided\n            (:disqualifiedVolunteers)::uuid[] IS NULL\n            OR NOT users.id = ANY (:disqualifiedVolunteers))\n),\n-- The above volunteers, narrowed down to those who can tutor in the given subject\nvolunteers_with_needed_certification AS (\n    SELECT\n        userId,\n        first_name,\n        last_name,\n        phone,\n        email\n    FROM\n        ready_to_tutor_volunteers\n        LEFT JOIN LATERAL (\n            SELECT\n                array_agg(sub_unlocked.subject)::text[] AS subjects\n            FROM (\n                SELECT\n                    subjects.name AS subject\n                FROM\n                    users_certifications\n                    JOIN certification_subject_unlocks USING (certification_id)\n                    JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                    JOIN subject_totals ON subject_totals.name = subjects.name\n                WHERE\n                    users_certifications.user_id = userId\n                GROUP BY\n                    user_id, subjects.name, subject_totals.total) AS sub_unlocked) AS subjects_unlocked ON TRUE\n        LEFT JOIN LATERAL (\n            SELECT\n                array_agg(sub_unlocked.subject)::text[] AS subjects\n            FROM (\n                SELECT\n                    subjects.name AS subject\n                FROM\n                    users_certifications\n                    JOIN computed_subject_unlocks USING (certification_id)\n                    JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id\n                    JOIN computed_subject_totals ON computed_subject_totals.name = subjects.name\n                WHERE\n                    users_certifications.user_id = userId\n                GROUP BY\n                    user_id, subjects.name, computed_subject_totals.total\n                HAVING\n                    COUNT(*)::int >= computed_subject_totals.total) AS sub_unlocked) AS computed_subjects_unlocked ON TRUE\n    WHERE (:subject = ANY (subjects_unlocked.subjects)\n        OR :subject = ANY (computed_subjects_unlocked.subjects))\n    AND ( -- user does not have high level subjects if provided\n        (:highLevelSubjects)::text[] IS NULL\n        OR (:highLevelSubjects)::text[] && subjects_unlocked.subjects IS FALSE)\n),\n-- The above volunteers, narrowed down to those with availability\nvolunteers_with_availability AS (\n    SELECT\n        vwnc.userId,\n        vwnc.first_name,\n        vwnc.last_name,\n        vwnc.phone,\n        vwnc.email\n    FROM\n        volunteers_with_needed_certification vwnc\n        JOIN availabilities ON userId = availabilities.user_id\n        JOIN weekdays ON weekdays.id = availabilities.weekday_id\n    WHERE\n        -- availabilities are all stored in EST so convert server time to EST to be safe\n        TRIM(BOTH FROM to_char(NOW() at time zone 'America/New_York', 'Day')) = weekdays.day\n        AND extract(hour FROM (NOW() at time zone 'America/New_York')) >= availabilities.available_start\n        AND extract(hour FROM (NOW() at time zone 'America/New_York')) < availabilities.available_end\n),\ncandidates AS (\n    SELECT\n        vol.userId AS id,\n        vol.first_name,\n        vol.last_name,\n        vol.phone,\n        vol.email,\n        volunteer_partner_orgs.key AS volunteer_partner_org,\n        row_number() OVER () AS rn\nFROM\n    volunteers_with_availability vol\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = vol.userId\n        LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    WHERE ( -- user is a favorite volunteer\n        (:favoriteVolunteers)::uuid[] IS NULL\n        OR vol.userId = ANY (:favoriteVolunteers))\n    AND ( -- user is partner or open\n        (:isPartner)::boolean IS NULL\n        OR (:isPartner IS FALSE\n            AND volunteer_profiles.volunteer_partner_org_id IS NULL)\n        OR (:isPartner IS TRUE\n            AND NOT volunteer_profiles.volunteer_partner_org_id IS NULL))\n    AND ((:specificPartner)::text IS NULL\n        OR volunteer_partner_orgs.key = :specificPartner)\n    AND NOT EXISTS (\n        SELECT\n            user_id\n        FROM\n            notifications\n        WHERE\n            user_id = vol.userId\n            AND sent_at >= :lastNotified)\n),\nrow_count AS (\n    SELECT\n        max(rn) AS total_rows\nFROM\n    candidates\n),\nrandom_row AS (\n    SELECT\n        floor(random() * row_count.total_rows + 1) AS random_rn\nFROM\n    row_count\n)\nSELECT\n    *\nFROM\n    candidates\nWHERE\n    rn = (\n        SELECT\n            random_rn\n        FROM\n            random_row\n        LIMIT 1)\nLIMIT 1","loc":{"a":30946,"b":36775,"line":1156,"col":0}}};

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
 *     WHERE
 *         subjects.name = ANY (ARRAY[:subject] || COALESCE(:highLevelSubjects::text[], '{}'))
 *     GROUP BY
 *         subjects.name
 * ),
 * computed_subject_totals AS (
 *     SELECT
 *         subjects.name,
 *         COUNT(*)::int AS total
 *     FROM
 *         computed_subject_unlocks
 *         JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id
 *     WHERE
 *         subjects.name = ANY (ARRAY[:subject] || COALESCE(:highLevelSubjects::text[], '{}'))
 *     GROUP BY
 *         subjects.name
 * ),
 * ready_to_tutor_volunteers AS (
 *     SELECT
 *         users.id AS userId,
 *         first_name,
 *         last_name,
 *         phone,
 *         email
 *     FROM
 *         users
 *         JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     WHERE
 *         test_user IS FALSE
 *         AND banned IS FALSE
 *         AND deactivated IS FALSE
 *         AND volunteer_profiles.onboarded IS TRUE
 *         AND volunteer_profiles.approved IS TRUE
 *         AND ( -- user is not part of disqualified group (like active session volunteers) if provided
 *             (:disqualifiedVolunteers)::uuid[] IS NULL
 *             OR NOT users.id = ANY (:disqualifiedVolunteers))
 * ),
 * -- The above volunteers, narrowed down to those who can tutor in the given subject
 * volunteers_with_needed_certification AS (
 *     SELECT
 *         userId,
 *         first_name,
 *         last_name,
 *         phone,
 *         email
 *     FROM
 *         ready_to_tutor_volunteers
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
 *                     users_certifications.user_id = userId
 *                 GROUP BY
 *                     user_id, subjects.name, subject_totals.total) AS sub_unlocked) AS subjects_unlocked ON TRUE
 *         LEFT JOIN LATERAL (
 *             SELECT
 *                 array_agg(sub_unlocked.subject)::text[] AS subjects
 *             FROM (
 *                 SELECT
 *                     subjects.name AS subject
 *                 FROM
 *                     users_certifications
 *                     JOIN computed_subject_unlocks USING (certification_id)
 *                     JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id
 *                     JOIN computed_subject_totals ON computed_subject_totals.name = subjects.name
 *                 WHERE
 *                     users_certifications.user_id = userId
 *                 GROUP BY
 *                     user_id, subjects.name, computed_subject_totals.total
 *                 HAVING
 *                     COUNT(*)::int >= computed_subject_totals.total) AS sub_unlocked) AS computed_subjects_unlocked ON TRUE
 *     WHERE (:subject = ANY (subjects_unlocked.subjects)
 *         OR :subject = ANY (computed_subjects_unlocked.subjects))
 *     AND ( -- user does not have high level subjects if provided
 *         (:highLevelSubjects)::text[] IS NULL
 *         OR (:highLevelSubjects)::text[] && subjects_unlocked.subjects IS FALSE)
 * ),
 * -- The above volunteers, narrowed down to those with availability
 * volunteers_with_availability AS (
 *     SELECT
 *         vwnc.userId,
 *         vwnc.first_name,
 *         vwnc.last_name,
 *         vwnc.phone,
 *         vwnc.email
 *     FROM
 *         volunteers_with_needed_certification vwnc
 *         JOIN availabilities ON userId = availabilities.user_id
 *         JOIN weekdays ON weekdays.id = availabilities.weekday_id
 *     WHERE
 *         -- availabilities are all stored in EST so convert server time to EST to be safe
 *         TRIM(BOTH FROM to_char(NOW() at time zone 'America/New_York', 'Day')) = weekdays.day
 *         AND extract(hour FROM (NOW() at time zone 'America/New_York')) >= availabilities.available_start
 *         AND extract(hour FROM (NOW() at time zone 'America/New_York')) < availabilities.available_end
 * ),
 * candidates AS (
 *     SELECT
 *         vol.userId AS id,
 *         vol.first_name,
 *         vol.last_name,
 *         vol.phone,
 *         vol.email,
 *         volunteer_partner_orgs.key AS volunteer_partner_org,
 *         row_number() OVER () AS rn
 * FROM
 *     volunteers_with_availability vol
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = vol.userId
 *         LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     WHERE ( -- user is a favorite volunteer
 *         (:favoriteVolunteers)::uuid[] IS NULL
 *         OR vol.userId = ANY (:favoriteVolunteers))
 *     AND ( -- user is partner or open
 *         (:isPartner)::boolean IS NULL
 *         OR (:isPartner IS FALSE
 *             AND volunteer_profiles.volunteer_partner_org_id IS NULL)
 *         OR (:isPartner IS TRUE
 *             AND NOT volunteer_profiles.volunteer_partner_org_id IS NULL))
 *     AND ((:specificPartner)::text IS NULL
 *         OR volunteer_partner_orgs.key = :specificPartner)
 *     AND NOT EXISTS (
 *         SELECT
 *             user_id
 *         FROM
 *             notifications
 *         WHERE
 *             user_id = vol.userId
 *             AND sent_at >= :lastNotified)
 * ),
 * row_count AS (
 *     SELECT
 *         max(rn) AS total_rows
 * FROM
 *     candidates
 * ),
 * random_row AS (
 *     SELECT
 *         floor(random() * row_count.total_rows + 1) AS random_rn
 * FROM
 *     row_count
 * )
 * SELECT
 *     *
 * FROM
 *     candidates
 * WHERE
 *     rn = (
 *         SELECT
 *             random_rn
 *         FROM
 *             random_row
 *         LIMIT 1)
 * LIMIT 1
 * ```
 */
export const getNextVolunteerToNotify = new PreparedQuery<IGetNextVolunteerToNotifyParams,IGetNextVolunteerToNotifyResult>(getNextVolunteerToNotifyIR);


/** 'CheckIfVolunteerMutedSubject' parameters type */
export interface ICheckIfVolunteerMutedSubjectParams {
  subjectName: string | null | void;
  userId: string | null | void;
}

/** 'CheckIfVolunteerMutedSubject' return type */
export interface ICheckIfVolunteerMutedSubjectResult {
  userId: string;
}

/** 'CheckIfVolunteerMutedSubject' query type */
export interface ICheckIfVolunteerMutedSubjectQuery {
  params: ICheckIfVolunteerMutedSubjectParams;
  result: ICheckIfVolunteerMutedSubjectResult;
}

const checkIfVolunteerMutedSubjectIR: any = {"name":"checkIfVolunteerMutedSubject","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":36997,"b":37002,"line":1332,"col":42}]}},{"name":"subjectName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":37029,"b":37039,"line":1333,"col":25}]}}],"usedParamSet":{"userId":true,"subjectName":true},"statement":{"body":"SELECT\n    user_id\nFROM\n    muted_users_subject_alerts\n    JOIN subjects ON muted_users_subject_alerts.subject_id = subjects.id\nWHERE\n    muted_users_subject_alerts.user_id = :userId\n    AND subjects.name = :subjectName","loc":{"a":36821,"b":37039,"line":1326,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id
 * FROM
 *     muted_users_subject_alerts
 *     JOIN subjects ON muted_users_subject_alerts.subject_id = subjects.id
 * WHERE
 *     muted_users_subject_alerts.user_id = :userId
 *     AND subjects.name = :subjectName
 * ```
 */
export const checkIfVolunteerMutedSubject = new PreparedQuery<ICheckIfVolunteerMutedSubjectParams,ICheckIfVolunteerMutedSubjectResult>(checkIfVolunteerMutedSubjectIR);


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

const getVolunteerForScheduleUpdateIR: any = {"name":"getVolunteerForScheduleUpdate","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":38421,"b":38427,"line":1372,"col":16}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    volunteer_profiles.onboarded,\n    subjects_unlocked.subjects,\n    COALESCE(training_quizzes.passed, FALSE) AS passed_required_training\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(sub_unlocked.subject) AS subjects\n        FROM (\n            SELECT\n                user_id,\n                subjects.name AS subject\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n            WHERE\n                users_certifications.user_id = users.id\n            GROUP BY\n                user_id, subjects.name) AS sub_unlocked) AS subjects_unlocked ON TRUE\n    LEFT JOIN (\n        SELECT\n            passed,\n            user_id\n        FROM\n            users_quizzes\n            JOIN quizzes ON users_quizzes.quiz_id = quizzes.id\n        WHERE\n            quizzes.name = 'upchieve101') AS training_quizzes ON training_quizzes.user_id = volunteer_profiles.user_id\nWHERE\n    users.id = :userId!\nLIMIT 1","loc":{"a":37086,"b":38435,"line":1337,"col":0}}};

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
 *                 subjects.name AS subject
 *             FROM
 *                 users_certifications
 *                 JOIN certification_subject_unlocks USING (certification_id)
 *                 JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *             WHERE
 *                 users_certifications.user_id = users.id
 *             GROUP BY
 *                 user_id, subjects.name) AS sub_unlocked) AS subjects_unlocked ON TRUE
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

const getVolunteersOnDeckIR: any = {"name":"getVolunteersOnDeck","params":[{"name":"excludedIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":41493,"b":41504,"line":1450,"col":29}]}},{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":41843,"b":41850,"line":1454,"col":38},{"a":41901,"b":41908,"line":1455,"col":49}]}}],"usedParamSet":{"excludedIds":true,"subject":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN availabilities ON users.id = availabilities.user_id\n    JOIN weekdays ON weekdays.id = availabilities.weekday_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN (\n        SELECT\n            sub_unlocked.user_id,\n            subjects.name AS subject\n        FROM (\n            SELECT\n                user_id,\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_total.total\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        certification_subject_unlocks\n                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_total ON subject_total.name = subjects.name\n                GROUP BY\n                    user_id,\n                    subjects.name,\n                    subject_total.total) AS sub_unlocked\n                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            sub_unlocked.user_id,\n            subjects.name AS subject\n        FROM (\n            SELECT\n                user_id,\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_total.total\n            FROM\n                users_certifications\n                JOIN computed_subject_unlocks USING (certification_id)\n                JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        computed_subject_unlocks\n                        JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_total ON subject_total.name = subjects.name\n                GROUP BY\n                    user_id,\n                    subjects.name,\n                    subject_total.total\n                HAVING\n                    COUNT(*)::int >= subject_total.total) AS sub_unlocked\n                JOIN subjects ON sub_unlocked.subject = subjects.name) AS computed_subjects_unlocked ON computed_subjects_unlocked.user_id = users.id\nWHERE\n    test_user IS FALSE\n    AND banned IS FALSE\n    AND deactivated IS FALSE\n    AND NOT users.id = ANY (:excludedIds!)\nAND TRIM(BOTH FROM to_char(NOW() at time zone 'America/New_York', 'Day')) = weekdays.day\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end\n    AND (subjects_unlocked.subject = :subject!\n        OR computed_subjects_unlocked.subject = :subject!)\nGROUP BY\n    users.id,\n    volunteer_partner_orgs.key","loc":{"a":38472,"b":41963,"line":1377,"col":0}}};

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
 *     LEFT JOIN (
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
 *                     subject_total.total) AS sub_unlocked
 *                 JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id
 *     LEFT JOIN (
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
 *                 JOIN computed_subject_unlocks USING (certification_id)
 *                 JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id
 *                 JOIN (
 *                     SELECT
 *                         subjects.name, COUNT(*)::int AS total
 *                     FROM
 *                         computed_subject_unlocks
 *                         JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id
 *                     GROUP BY
 *                         subjects.name) AS subject_total ON subject_total.name = subjects.name
 *                 GROUP BY
 *                     user_id,
 *                     subjects.name,
 *                     subject_total.total
 *                 HAVING
 *                     COUNT(*)::int >= subject_total.total) AS sub_unlocked
 *                 JOIN subjects ON sub_unlocked.subject = subjects.name) AS computed_subjects_unlocked ON computed_subjects_unlocked.user_id = users.id
 * WHERE
 *     test_user IS FALSE
 *     AND banned IS FALSE
 *     AND deactivated IS FALSE
 *     AND NOT users.id = ANY (:excludedIds!)
 * AND TRIM(BOTH FROM to_char(NOW() at time zone 'America/New_York', 'Day')) = weekdays.day
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end
 *     AND (subjects_unlocked.subject = :subject!
 *         OR computed_subjects_unlocked.subject = :subject!)
 * GROUP BY
 *     users.id,
 *     volunteer_partner_orgs.key
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

const getUniqueStudentsHelpedForAnalyticsReportSummaryIR: any = {"name":"getUniqueStudentsHelpedForAnalyticsReportSummary","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":42189,"b":42194,"line":1464,"col":62},{"a":42786,"b":42791,"line":1476,"col":62}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":42240,"b":42243,"line":1465,"col":44},{"a":42837,"b":42840,"line":1477,"col":44}]}},{"name":"studentPartnerOrgIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":42482,"b":42502,"line":1470,"col":86},{"a":42911,"b":42931,"line":1478,"col":69}]}},{"name":"studentSchoolIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":42559,"b":42575,"line":1471,"col":54},{"a":42992,"b":43008,"line":1479,"col":58}]}},{"name":"volunteerPartnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":43508,"b":43527,"line":1490,"col":34}]}}],"usedParamSet":{"start":true,"end":true,"studentPartnerOrgIds":true,"studentSchoolIds":true,"volunteerPartnerOrg":true},"statement":{"body":"SELECT\n    COALESCE(COUNT(DISTINCT sessions.student_id), 0)::int AS total_unique_students_helped,\n    COALESCE(COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                AND sessions.created_at <= :end! THEN\n                sessions.student_id\n            ELSE\n                NULL\n            END), 0)::int AS total_unique_students_helped_within_range,\n    COALESCE(COUNT(DISTINCT CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                sessions.student_id\n            ELSE\n                NULL\n            END), 0)::int AS total_unique_partner_students_helped,\n    COALESCE(COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                AND sessions.created_at <= :end!\n                AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                sessions.student_id\n            ELSE\n                NULL\n            END), 0)::int AS total_unique_partner_students_helped_within_range\nFROM\n    volunteer_partner_orgs\n    LEFT JOIN volunteer_profiles ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN sessions ON volunteer_profiles.user_id = sessions.volunteer_id\n    LEFT JOIN student_profiles ON sessions.student_id = student_profiles.user_id\nWHERE\n    volunteer_partner_orgs.key = :volunteerPartnerOrg!","loc":{"a":42029,"b":43527,"line":1462,"col":0}}};

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
  cursor: string | null | void;
  end: Date;
  pageSize: number;
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

const getVolunteersForAnalyticsReportIR: any = {"name":"getVolunteersForAnalyticsReport","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":46325,"b":46330,"line":1551,"col":61},{"a":46943,"b":46948,"line":1563,"col":61},{"a":47419,"b":47424,"line":1572,"col":50},{"a":47988,"b":47993,"line":1586,"col":50},{"a":48770,"b":48775,"line":1602,"col":50},{"a":49503,"b":49508,"line":1619,"col":38}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":46380,"b":46383,"line":1552,"col":48},{"a":46998,"b":47001,"line":1564,"col":48},{"a":47474,"b":47477,"line":1573,"col":48},{"a":48043,"b":48046,"line":1587,"col":48},{"a":48825,"b":48828,"line":1603,"col":48},{"a":49546,"b":49549,"line":1620,"col":36}]}},{"name":"studentPartnerOrgIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":46624,"b":46644,"line":1557,"col":85},{"a":47076,"b":47096,"line":1565,"col":73},{"a":47698,"b":47718,"line":1579,"col":74},{"a":48121,"b":48141,"line":1588,"col":73},{"a":48453,"b":48473,"line":1595,"col":74},{"a":48903,"b":48923,"line":1604,"col":73}]}},{"name":"studentSchoolIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":46705,"b":46721,"line":1558,"col":58},{"a":47161,"b":47177,"line":1566,"col":62},{"a":47779,"b":47795,"line":1580,"col":58},{"a":48206,"b":48222,"line":1589,"col":62},{"a":48534,"b":48550,"line":1596,"col":58},{"a":48988,"b":49004,"line":1605,"col":62}]}},{"name":"volunteerPartnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":49849,"b":49868,"line":1630,"col":34}]}},{"name":"cursor","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":49880,"b":49885,"line":1631,"col":10},{"a":49925,"b":49930,"line":1632,"col":24}]}},{"name":"pageSize","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":49974,"b":49982,"line":1635,"col":8}]}}],"usedParamSet":{"start":true,"end":true,"studentPartnerOrgIds":true,"studentSchoolIds":true,"volunteerPartnerOrg":true,"cursor":true,"pageSize":true},"statement":{"body":"SELECT\n    users.id AS user_id,\n    users.first_name AS first_name,\n    users.last_name AS last_name,\n    users.email AS email,\n    users.created_at AS created_at,\n    volunteer_profiles.state AS state,\n    volunteer_profiles.onboarded AS is_onboarded,\n    user_actions.created_at AS date_onboarded,\n    COALESCE(users_quizzes.total, 0) AS total_quizzes_passed,\n    availabilities.updated_at AS availability_last_modified_at,\n    COALESCE(sessions_stats.total_unique_students_helped, 0) AS total_unique_students_helped,\n    COALESCE(sessions_stats.total_unique_students_helped_within_range, 0) AS total_unique_students_helped_within_range,\n    COALESCE(sessions_stats.total_unique_partner_students_helped, 0) AS total_unique_partner_students_helped,\n    COALESCE(sessions_stats.total_unique_partner_students_helped_within_range, 0) AS total_unique_partner_students_helped_within_range,\n    COALESCE(sessions_stats.total_sessions, 0) AS total_sessions,\n    COALESCE(sessions_stats.total_sessions_within_range, 0) AS total_sessions_within_range,\n    COALESCE(sessions_stats.total_partner_sessions, 0) AS total_partner_sessions,\n    COALESCE(sessions_stats.total_partner_sessions_within_range, 0) AS total_partner_sessions_within_range,\n    COALESCE(sessions_stats.total_partner_time_tutored, 0) AS total_partner_time_tutored,\n    COALESCE(sessions_stats.total_partner_time_tutored_within_range, 0) AS total_partner_time_tutored_within_range,\n    COALESCE(notifications_stats.total, 0) AS total_notifications,\n    COALESCE(notifications_stats.total_within_range, 0) AS total_notifications_within_range\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id\n    LEFT JOIN (\n        SELECT\n            COUNT(*)::int AS total,\n            user_id\n        FROM\n            users_quizzes\n        WHERE\n            passed = TRUE\n        GROUP BY\n            user_id) AS users_quizzes ON users_quizzes.user_id = volunteer_profiles.user_id\n    LEFT JOIN (\n        SELECT\n            MAX(updated_at) AS updated_at,\n            user_id\n        FROM\n            availabilities\n        GROUP BY\n            user_id) AS availabilities ON availabilities.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            created_at,\n            user_id\n        FROM\n            user_actions\n        WHERE\n            action = 'ONBOARDED') AS user_actions ON user_actions.user_id = volunteer_profiles.user_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total_sessions,\n            COUNT(DISTINCT student_id)::int AS total_unique_students_helped,\n            COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end! THEN\n                    student_id\n                ELSE\n                    NULL\n                END)::int AS total_unique_students_helped_within_range,\n            COUNT(DISTINCT CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                    sessions.student_id\n                ELSE\n                    NULL\n                END)::int AS total_unique_partner_students_helped,\n            COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end!\n                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                    sessions.student_id\n                ELSE\n                    NULL\n                END)::int AS total_unique_partner_students_helped_within_range,\n            SUM(\n                CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end! THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_sessions_within_range,\n            SUM(\n                CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_partner_sessions,\n            SUM(\n                CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end!\n                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_partner_sessions_within_range,\n            SUM(\n                CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                    sessions.time_tutored\n                ELSE\n                    0\n                END)::bigint AS total_partner_time_tutored,\n            SUM(\n                CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end!\n                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                    sessions.time_tutored\n                ELSE\n                    0\n                END)::bigint AS total_partner_time_tutored_within_range\n        FROM\n            sessions\n    LEFT JOIN student_profiles ON sessions.student_id = student_profiles.user_id\nWHERE\n    volunteer_profiles.user_id = sessions.volunteer_id) AS sessions_stats ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total,\n            SUM(\n                CASE WHEN sent_at >= :start!\n                    AND sent_at <= :end! THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_within_range\n        FROM\n            notifications\n    WHERE\n        volunteer_profiles.user_id = notifications.user_id) AS notifications_stats ON TRUE\nWHERE\n    volunteer_partner_orgs.key = :volunteerPartnerOrg!\n    AND (:cursor::uuid IS NULL\n        OR users.id <= :cursor::uuid)\nORDER BY\n    users.id DESC\nLIMIT (:pageSize!::int)","loc":{"a":43576,"b":49988,"line":1494,"col":0}}};

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
 *     AND (:cursor::uuid IS NULL
 *         OR users.id <= :cursor::uuid)
 * ORDER BY
 *     users.id DESC
 * LIMIT (:pageSize!::int)
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

const removeOnboardedStatusForUnqualifiedVolunteersIR: any = {"name":"removeOnboardedStatusForUnqualifiedVolunteers","params":[],"usedParamSet":{},"statement":{"body":"UPDATE\n    volunteer_profiles\nSET\n    onboarded = FALSE,\n    updated_at = NOW()\nFROM (\n    SELECT\n        users_training_courses.complete AS training_course_complete,\n        users_training_courses.user_id,\n        users_quizzes.passed AS training_quiz_passed\n    FROM\n        users_training_courses\n    LEFT JOIN (\n        SELECT\n            users_quizzes.passed,\n            users_quizzes.user_id,\n            quizzes.name\n        FROM\n            users_quizzes\n            LEFT JOIN quizzes ON users_quizzes.quiz_id = quizzes.id) AS users_quizzes ON users_quizzes.user_id = users_training_courses.user_id\n            AND users_quizzes.name = 'upchieve101') AS subquery\nWHERE\n    volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.created_at >= '2022-01-01 00:00:00.000000+00'\n    AND subquery.training_course_complete IS TRUE\n    AND (subquery.training_quiz_passed IS FALSE\n        OR subquery.training_quiz_passed IS NULL)\nAND volunteer_profiles.user_id = subquery.user_id\nRETURNING\n    volunteer_profiles.user_id AS ok","loc":{"a":50051,"b":51086,"line":1639,"col":0}}};

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


/** 'GetPartnerOrgsByVolunteer' parameters type */
export interface IGetPartnerOrgsByVolunteerParams {
  volunteerId: string;
}

/** 'GetPartnerOrgsByVolunteer' return type */
export interface IGetPartnerOrgsByVolunteerResult {
  id: string;
  name: string;
}

/** 'GetPartnerOrgsByVolunteer' query type */
export interface IGetPartnerOrgsByVolunteerQuery {
  params: IGetPartnerOrgsByVolunteerParams;
  result: IGetPartnerOrgsByVolunteerResult;
}

const getPartnerOrgsByVolunteerIR: any = {"name":"getPartnerOrgsByVolunteer","params":[{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":51321,"b":51332,"line":1679,"col":21}]}}],"usedParamSet":{"volunteerId":true},"statement":{"body":"SELECT\n    vpo.name,\n    vpo.id\nFROM\n    users_volunteer_partner_orgs_instances uvpoi\n    JOIN volunteer_partner_orgs vpo ON vpo.id = uvpoi.volunteer_partner_org_id\nWHERE\n    uvpoi.user_id = :volunteerId!\n    AND deactivated_on IS NULL","loc":{"a":51129,"b":51363,"line":1672,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     vpo.name,
 *     vpo.id
 * FROM
 *     users_volunteer_partner_orgs_instances uvpoi
 *     JOIN volunteer_partner_orgs vpo ON vpo.id = uvpoi.volunteer_partner_org_id
 * WHERE
 *     uvpoi.user_id = :volunteerId!
 *     AND deactivated_on IS NULL
 * ```
 */
export const getPartnerOrgsByVolunteer = new PreparedQuery<IGetPartnerOrgsByVolunteerParams,IGetPartnerOrgsByVolunteerResult>(getPartnerOrgsByVolunteerIR);


/** 'AdminDeactivateVolunteerPartnershipInstance' parameters type */
export interface IAdminDeactivateVolunteerPartnershipInstanceParams {
  userId: string;
  vpoId: string;
}

/** 'AdminDeactivateVolunteerPartnershipInstance' return type */
export interface IAdminDeactivateVolunteerPartnershipInstanceResult {
  ok: string | null;
}

/** 'AdminDeactivateVolunteerPartnershipInstance' query type */
export interface IAdminDeactivateVolunteerPartnershipInstanceQuery {
  params: IAdminDeactivateVolunteerPartnershipInstanceParams;
  result: IAdminDeactivateVolunteerPartnershipInstanceResult;
}

const adminDeactivateVolunteerPartnershipInstanceIR: any = {"name":"adminDeactivateVolunteerPartnershipInstance","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":51526,"b":51532,"line":1689,"col":15}]}},{"name":"vpoId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":51570,"b":51575,"line":1690,"col":36}]}}],"usedParamSet":{"userId":true,"vpoId":true},"statement":{"body":"UPDATE\n    users_volunteer_partner_orgs_instances\nSET\n    deactivated_on = NOW()\nWHERE\n    user_id = :userId!\n    AND volunteer_partner_org_id = :vpoId!\nRETURNING\n    user_id AS ok","loc":{"a":51424,"b":51603,"line":1684,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users_volunteer_partner_orgs_instances
 * SET
 *     deactivated_on = NOW()
 * WHERE
 *     user_id = :userId!
 *     AND volunteer_partner_org_id = :vpoId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const adminDeactivateVolunteerPartnershipInstance = new PreparedQuery<IAdminDeactivateVolunteerPartnershipInstanceParams,IAdminDeactivateVolunteerPartnershipInstanceResult>(adminDeactivateVolunteerPartnershipInstanceIR);


/** 'AdminInsertVolunteerPartnershipInstance' parameters type */
export interface IAdminInsertVolunteerPartnershipInstanceParams {
  partnerOrgId: string;
  userId: string;
}

/** 'AdminInsertVolunteerPartnershipInstance' return type */
export interface IAdminInsertVolunteerPartnershipInstanceResult {
  ok: string | null;
}

/** 'AdminInsertVolunteerPartnershipInstance' query type */
export interface IAdminInsertVolunteerPartnershipInstanceQuery {
  params: IAdminInsertVolunteerPartnershipInstanceParams;
  result: IAdminInsertVolunteerPartnershipInstanceResult;
}

const adminInsertVolunteerPartnershipInstanceIR: any = {"name":"adminInsertVolunteerPartnershipInstance","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":51784,"b":51790,"line":1697,"col":13}]}},{"name":"partnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":51794,"b":51806,"line":1697,"col":23}]}}],"usedParamSet":{"userId":true,"partnerOrgId":true},"statement":{"body":"INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)\n    VALUES (:userId!, :partnerOrgId!, NOW(), NOW())\nRETURNING\n    user_id AS ok","loc":{"a":51660,"b":51849,"line":1696,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)
 *     VALUES (:userId!, :partnerOrgId!, NOW(), NOW())
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const adminInsertVolunteerPartnershipInstance = new PreparedQuery<IAdminInsertVolunteerPartnershipInstanceParams,IAdminInsertVolunteerPartnershipInstanceResult>(adminInsertVolunteerPartnershipInstanceIR);


/** 'GetPartnerOrgByKey' parameters type */
export interface IGetPartnerOrgByKeyParams {
  partnerOrgKey: string | null | void;
}

/** 'GetPartnerOrgByKey' return type */
export interface IGetPartnerOrgByKeyResult {
  partnerId: string;
  partnerKey: string;
  partnerName: string;
}

/** 'GetPartnerOrgByKey' query type */
export interface IGetPartnerOrgByKeyQuery {
  params: IGetPartnerOrgByKeyParams;
  result: IGetPartnerOrgByKeyResult;
}

const getPartnerOrgByKeyIR: any = {"name":"getPartnerOrgByKey","params":[{"name":"partnerOrgKey","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":52104,"b":52116,"line":1710,"col":34}]}}],"usedParamSet":{"partnerOrgKey":true},"statement":{"body":"SELECT\n    volunteer_partner_orgs.id AS partner_id,\n    volunteer_partner_orgs.key AS partner_key,\n    volunteer_partner_orgs.name AS partner_name\nFROM\n    volunteer_partner_orgs\nWHERE\n    volunteer_partner_orgs.key = :partnerOrgKey\nLIMIT 1","loc":{"a":51885,"b":52124,"line":1703,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_partner_orgs.id AS partner_id,
 *     volunteer_partner_orgs.key AS partner_key,
 *     volunteer_partner_orgs.name AS partner_name
 * FROM
 *     volunteer_partner_orgs
 * WHERE
 *     volunteer_partner_orgs.key = :partnerOrgKey
 * LIMIT 1
 * ```
 */
export const getPartnerOrgByKey = new PreparedQuery<IGetPartnerOrgByKeyParams,IGetPartnerOrgByKeyResult>(getPartnerOrgByKeyIR);


