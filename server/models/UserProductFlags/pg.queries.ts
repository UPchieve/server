/** Types generated for queries found in "server/models/UserProductFlags/user_product_flags.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'CreateUpfByUserId' parameters type */
export interface ICreateUpfByUserIdParams {
  userId: string;
}

/** 'CreateUpfByUserId' return type */
export interface ICreateUpfByUserIdResult {
  /** not_pii */
  createdAt: Date;
  /** not_pii: Timestamp when the user enrolled in the fall incentive program */
  fallIncentiveEnrollmentAt: Date | null;
  /** not_pii: Whether the user qualifies for the Gates Foundation study */
  gatesQualified: boolean;
  /** not_pii: JSON map of impact study campaign assignments for the user */
  impactStudyCampaigns: Json | null;
  /** not_pii: Timestamp when the user enrolled in the impact study */
  impactStudyEnrollmentAt: Date | null;
  /** not_pii: Whether the hour summary intro email has been sent */
  sentHourSummaryIntroEmail: boolean;
  /** not_pii: Whether the 90-day inactivity re-engagement email has been sent */
  sentInactiveNinetyDayEmail: boolean;
  /** not_pii: Whether the 60-day inactivity re-engagement email has been sent */
  sentInactiveSixtyDayEmail: boolean;
  /** not_pii: Whether the 30-day inactivity re-engagement email has been sent */
  sentInactiveThirtyDayEmail: boolean;
  /** not_pii: Whether the ready-to-coach onboarding email has been sent */
  sentReadyToCoachEmail: boolean;
  /** not_pii */
  updatedAt: Date;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'CreateUpfByUserId' query type */
export interface ICreateUpfByUserIdQuery {
  params: ICreateUpfByUserIdParams;
  result: ICreateUpfByUserIdResult;
}

const createUpfByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":76,"b":83},{"a":239,"b":246}]}],"statement":"INSERT INTO user_product_flags (user_id, created_at, updated_at)\nSELECT\n    :userId!,\n    NOW(),\n    NOW()\nWHERE\n    NOT EXISTS (\n        SELECT\n            1\n        FROM\n            user_product_flags\n        WHERE\n            user_id = :userId!)\nRETURNING\n    user_id,\n    sent_ready_to_coach_email,\n    sent_hour_summary_intro_email,\n    sent_inactive_thirty_day_email,\n    sent_inactive_sixty_day_email,\n    sent_inactive_ninety_day_email,\n    gates_qualified,\n    fall_incentive_enrollment_at,\n    impact_study_enrollment_at,\n    impact_study_campaigns,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_product_flags (user_id, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     NOW(),
 *     NOW()
 * WHERE
 *     NOT EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             user_product_flags
 *         WHERE
 *             user_id = :userId!)
 * RETURNING
 *     user_id,
 *     sent_ready_to_coach_email,
 *     sent_hour_summary_intro_email,
 *     sent_inactive_thirty_day_email,
 *     sent_inactive_sixty_day_email,
 *     sent_inactive_ninety_day_email,
 *     gates_qualified,
 *     fall_incentive_enrollment_at,
 *     impact_study_enrollment_at,
 *     impact_study_campaigns,
 *     created_at,
 *     updated_at
 * ```
 */
export const createUpfByUserId = new PreparedQuery<ICreateUpfByUserIdParams,ICreateUpfByUserIdResult>(createUpfByUserIdIR);


/** 'GetUpfByUserId' parameters type */
export interface IGetUpfByUserIdParams {
  userId: string;
}

/** 'GetUpfByUserId' return type */
export interface IGetUpfByUserIdResult {
  /** not_pii */
  createdAt: Date;
  /** not_pii: Timestamp when the user enrolled in the fall incentive program */
  fallIncentiveEnrollmentAt: Date | null;
  /** not_pii: Whether the user qualifies for the Gates Foundation study */
  gatesQualified: boolean;
  /** not_pii: JSON map of impact study campaign assignments for the user */
  impactStudyCampaigns: Json | null;
  /** not_pii: Timestamp when the user enrolled in the impact study */
  impactStudyEnrollmentAt: Date | null;
  /** not_pii: Whether the hour summary intro email has been sent */
  sentHourSummaryIntroEmail: boolean;
  /** not_pii: Whether the 90-day inactivity re-engagement email has been sent */
  sentInactiveNinetyDayEmail: boolean;
  /** not_pii: Whether the 60-day inactivity re-engagement email has been sent */
  sentInactiveSixtyDayEmail: boolean;
  /** not_pii: Whether the 30-day inactivity re-engagement email has been sent */
  sentInactiveThirtyDayEmail: boolean;
  /** not_pii: Whether the ready-to-coach onboarding email has been sent */
  sentReadyToCoachEmail: boolean;
  /** not_pii */
  updatedAt: Date;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'GetUpfByUserId' query type */
export interface IGetUpfByUserIdQuery {
  params: IGetUpfByUserIdParams;
  result: IGetUpfByUserIdResult;
}

const getUpfByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":387,"b":394}]}],"statement":"SELECT\n    user_id,\n    sent_ready_to_coach_email,\n    sent_hour_summary_intro_email,\n    sent_inactive_thirty_day_email,\n    sent_inactive_sixty_day_email,\n    sent_inactive_ninety_day_email,\n    gates_qualified,\n    fall_incentive_enrollment_at,\n    impact_study_enrollment_at,\n    impact_study_campaigns,\n    created_at,\n    updated_at\nFROM\n    user_product_flags\nWHERE\n    user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     sent_ready_to_coach_email,
 *     sent_hour_summary_intro_email,
 *     sent_inactive_thirty_day_email,
 *     sent_inactive_sixty_day_email,
 *     sent_inactive_ninety_day_email,
 *     gates_qualified,
 *     fall_incentive_enrollment_at,
 *     impact_study_enrollment_at,
 *     impact_study_campaigns,
 *     created_at,
 *     updated_at
 * FROM
 *     user_product_flags
 * WHERE
 *     user_id = :userId!
 * ```
 */
export const getUpfByUserId = new PreparedQuery<IGetUpfByUserIdParams,IGetUpfByUserIdResult>(getUpfByUserIdIR);


/** 'GetPublicUpfByUserId' parameters type */
export interface IGetPublicUpfByUserIdParams {
  userId: string;
}

/** 'GetPublicUpfByUserId' return type */
export interface IGetPublicUpfByUserIdResult {
  /** not_pii: Timestamp when the user enrolled in the fall incentive program */
  fallIncentiveEnrollmentAt: Date | null;
  /** not_pii: Whether the user qualifies for the Gates Foundation study */
  gatesQualified: boolean;
  /** not_pii: JSON map of impact study campaign assignments for the user */
  impactStudyCampaigns: Json | null;
  /** not_pii: Timestamp when the user enrolled in the impact study */
  impactStudyEnrollmentAt: Date | null;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'GetPublicUpfByUserId' query type */
export interface IGetPublicUpfByUserIdQuery {
  params: IGetPublicUpfByUserIdParams;
  result: IGetPublicUpfByUserIdResult;
}

const getPublicUpfByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":182,"b":189}]}],"statement":"SELECT\n    user_id,\n    gates_qualified,\n    fall_incentive_enrollment_at,\n    impact_study_enrollment_at,\n    impact_study_campaigns\nFROM\n    user_product_flags\nWHERE\n    user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     gates_qualified,
 *     fall_incentive_enrollment_at,
 *     impact_study_enrollment_at,
 *     impact_study_campaigns
 * FROM
 *     user_product_flags
 * WHERE
 *     user_id = :userId!
 * ```
 */
export const getPublicUpfByUserId = new PreparedQuery<IGetPublicUpfByUserIdParams,IGetPublicUpfByUserIdResult>(getPublicUpfByUserIdIR);


/** 'UpdateSentInactiveThirtyDayEmail' parameters type */
export interface IUpdateSentInactiveThirtyDayEmailParams {
  sentInactiveThirtyDayEmail: boolean;
  userId: string;
}

/** 'UpdateSentInactiveThirtyDayEmail' return type */
export interface IUpdateSentInactiveThirtyDayEmailResult {
  /** not_pii: Foreign key to upchieve.users */
  ok: string;
}

/** 'UpdateSentInactiveThirtyDayEmail' query type */
export interface IUpdateSentInactiveThirtyDayEmailQuery {
  params: IUpdateSentInactiveThirtyDayEmailParams;
  result: IUpdateSentInactiveThirtyDayEmailResult;
}

const updateSentInactiveThirtyDayEmailIR: any = {"usedParamSet":{"sentInactiveThirtyDayEmail":true,"userId":true},"params":[{"name":"sentInactiveThirtyDayEmail","required":true,"transform":{"type":"scalar"},"locs":[{"a":71,"b":98}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":144,"b":151}]}],"statement":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_thirty_day_email = :sentInactiveThirtyDayEmail!,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_inactive_thirty_day_email = :sentInactiveThirtyDayEmail!,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateSentInactiveThirtyDayEmail = new PreparedQuery<IUpdateSentInactiveThirtyDayEmailParams,IUpdateSentInactiveThirtyDayEmailResult>(updateSentInactiveThirtyDayEmailIR);


/** 'UpdateSentInactiveSixtyDayEmail' parameters type */
export interface IUpdateSentInactiveSixtyDayEmailParams {
  sentInactiveSixtyDayEmail: boolean;
  userId: string;
}

/** 'UpdateSentInactiveSixtyDayEmail' return type */
export interface IUpdateSentInactiveSixtyDayEmailResult {
  /** not_pii: Foreign key to upchieve.users */
  ok: string;
}

/** 'UpdateSentInactiveSixtyDayEmail' query type */
export interface IUpdateSentInactiveSixtyDayEmailQuery {
  params: IUpdateSentInactiveSixtyDayEmailParams;
  result: IUpdateSentInactiveSixtyDayEmailResult;
}

const updateSentInactiveSixtyDayEmailIR: any = {"usedParamSet":{"sentInactiveSixtyDayEmail":true,"userId":true},"params":[{"name":"sentInactiveSixtyDayEmail","required":true,"transform":{"type":"scalar"},"locs":[{"a":70,"b":96}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":142,"b":149}]}],"statement":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_sixty_day_email = :sentInactiveSixtyDayEmail!,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_inactive_sixty_day_email = :sentInactiveSixtyDayEmail!,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateSentInactiveSixtyDayEmail = new PreparedQuery<IUpdateSentInactiveSixtyDayEmailParams,IUpdateSentInactiveSixtyDayEmailResult>(updateSentInactiveSixtyDayEmailIR);


/** 'UpdateSentInactiveNinetyDayEmail' parameters type */
export interface IUpdateSentInactiveNinetyDayEmailParams {
  sentInactiveNinetyDayEmail: boolean;
  userId: string;
}

/** 'UpdateSentInactiveNinetyDayEmail' return type */
export interface IUpdateSentInactiveNinetyDayEmailResult {
  /** not_pii: Foreign key to upchieve.users */
  ok: string;
}

/** 'UpdateSentInactiveNinetyDayEmail' query type */
export interface IUpdateSentInactiveNinetyDayEmailQuery {
  params: IUpdateSentInactiveNinetyDayEmailParams;
  result: IUpdateSentInactiveNinetyDayEmailResult;
}

const updateSentInactiveNinetyDayEmailIR: any = {"usedParamSet":{"sentInactiveNinetyDayEmail":true,"userId":true},"params":[{"name":"sentInactiveNinetyDayEmail","required":true,"transform":{"type":"scalar"},"locs":[{"a":71,"b":98}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":144,"b":151}]}],"statement":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_ninety_day_email = :sentInactiveNinetyDayEmail!,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_inactive_ninety_day_email = :sentInactiveNinetyDayEmail!,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateSentInactiveNinetyDayEmail = new PreparedQuery<IUpdateSentInactiveNinetyDayEmailParams,IUpdateSentInactiveNinetyDayEmailResult>(updateSentInactiveNinetyDayEmailIR);


/** 'EnrollStudentToFallIncentiveProgram' parameters type */
export interface IEnrollStudentToFallIncentiveProgramParams {
  userId: string;
}

/** 'EnrollStudentToFallIncentiveProgram' return type */
export interface IEnrollStudentToFallIncentiveProgramResult {
  /** not_pii: Timestamp when the user enrolled in the fall incentive program */
  fallIncentiveEnrollmentAt: Date | null;
}

/** 'EnrollStudentToFallIncentiveProgram' query type */
export interface IEnrollStudentToFallIncentiveProgramQuery {
  params: IEnrollStudentToFallIncentiveProgramParams;
  result: IEnrollStudentToFallIncentiveProgramResult;
}

const enrollStudentToFallIncentiveProgramIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":119,"b":126}]}],"statement":"UPDATE\n    user_product_flags\nSET\n    fall_incentive_enrollment_at = NOW(),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    fall_incentive_enrollment_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     fall_incentive_enrollment_at = NOW(),
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     fall_incentive_enrollment_at
 * ```
 */
export const enrollStudentToFallIncentiveProgram = new PreparedQuery<IEnrollStudentToFallIncentiveProgramParams,IEnrollStudentToFallIncentiveProgramResult>(enrollStudentToFallIncentiveProgramIR);


/** 'EnrollStudentToImpactStudy' parameters type */
export interface IEnrollStudentToImpactStudyParams {
  userId: string;
}

/** 'EnrollStudentToImpactStudy' return type */
export interface IEnrollStudentToImpactStudyResult {
  /** not_pii: Timestamp when the user enrolled in the impact study */
  impactStudyEnrollmentAt: Date | null;
}

/** 'EnrollStudentToImpactStudy' query type */
export interface IEnrollStudentToImpactStudyQuery {
  params: IEnrollStudentToImpactStudyParams;
  result: IEnrollStudentToImpactStudyResult;
}

const enrollStudentToImpactStudyIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":117,"b":124}]}],"statement":"UPDATE\n    user_product_flags\nSET\n    impact_study_enrollment_at = NOW(),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    impact_study_enrollment_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     impact_study_enrollment_at = NOW(),
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     impact_study_enrollment_at
 * ```
 */
export const enrollStudentToImpactStudy = new PreparedQuery<IEnrollStudentToImpactStudyParams,IEnrollStudentToImpactStudyResult>(enrollStudentToImpactStudyIR);


/** 'UpsertImpactStudyCampaign' parameters type */
export interface IUpsertImpactStudyCampaignParams {
  campaignData?: Json | null | void;
  campaignId?: string | null | void;
  userId: string;
}

/** 'UpsertImpactStudyCampaign' return type */
export interface IUpsertImpactStudyCampaignResult {
  /** not_pii: Foreign key to upchieve.users */
  ok: string;
}

/** 'UpsertImpactStudyCampaign' query type */
export interface IUpsertImpactStudyCampaignQuery {
  params: IUpsertImpactStudyCampaignParams;
  result: IUpsertImpactStudyCampaignResult;
}

const upsertImpactStudyCampaignIR: any = {"usedParamSet":{"campaignId":true,"campaignData":true,"userId":true},"params":[{"name":"campaignId","required":false,"transform":{"type":"scalar"},"locs":[{"a":119,"b":129}]},{"name":"campaignData","required":false,"transform":{"type":"scalar"},"locs":[{"a":143,"b":155}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":216,"b":223}]}],"statement":"UPDATE\n    user_product_flags\nSET\n    impact_study_campaigns = jsonb_set(COALESCE(impact_study_campaigns, '{}'), ARRAY[:campaignId], to_jsonb (:campaignData::jsonb), TRUE),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     impact_study_campaigns = jsonb_set(COALESCE(impact_study_campaigns, '{}'), ARRAY[:campaignId], to_jsonb (:campaignData::jsonb), TRUE),
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const upsertImpactStudyCampaign = new PreparedQuery<IUpsertImpactStudyCampaignParams,IUpsertImpactStudyCampaignResult>(upsertImpactStudyCampaignIR);


