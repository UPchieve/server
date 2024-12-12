/** Types generated for queries found in "server/models/UserProductFlags/user_product_flags.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'CreateUpfByUserId' parameters type */
export interface ICreateUpfByUserIdParams {
  userId: string;
}

/** 'CreateUpfByUserId' return type */
export interface ICreateUpfByUserIdResult {
  createdAt: Date;
  fallIncentiveEnrollmentAt: Date | null;
  gatesQualified: boolean;
  sentHourSummaryIntroEmail: boolean;
  sentInactiveNinetyDayEmail: boolean;
  sentInactiveSixtyDayEmail: boolean;
  sentInactiveThirtyDayEmail: boolean;
  sentReadyToCoachEmail: boolean;
  updatedAt: Date;
  userId: string;
}

/** 'CreateUpfByUserId' query type */
export interface ICreateUpfByUserIdQuery {
  params: ICreateUpfByUserIdParams;
  result: ICreateUpfByUserIdResult;
}

const createUpfByUserIdIR: any = {"name":"createUpfByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":107,"b":113,"line":4,"col":5},{"a":270,"b":276,"line":14,"col":23}]}}],"usedParamSet":{"userId":true},"statement":{"body":"INSERT INTO user_product_flags (user_id, created_at, updated_at)\nSELECT\n    :userId!,\n    NOW(),\n    NOW()\nWHERE\n    NOT EXISTS (\n        SELECT\n            1\n        FROM\n            user_product_flags\n        WHERE\n            user_id = :userId!)\nRETURNING\n    user_id,\n    sent_ready_to_coach_email,\n    sent_hour_summary_intro_email,\n    sent_inactive_thirty_day_email,\n    sent_inactive_sixty_day_email,\n    sent_inactive_ninety_day_email,\n    gates_qualified,\n    fall_incentive_enrollment_at,\n    created_at,\n    updated_at","loc":{"a":30,"b":559,"line":2,"col":0}}};

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
  createdAt: Date;
  fallIncentiveEnrollmentAt: Date | null;
  gatesQualified: boolean;
  sentHourSummaryIntroEmail: boolean;
  sentInactiveNinetyDayEmail: boolean;
  sentInactiveSixtyDayEmail: boolean;
  sentInactiveThirtyDayEmail: boolean;
  sentReadyToCoachEmail: boolean;
  updatedAt: Date;
  userId: string;
}

/** 'GetUpfByUserId' query type */
export interface IGetUpfByUserIdQuery {
  params: IGetUpfByUserIdParams;
  result: IGetUpfByUserIdResult;
}

const getUpfByUserIdIR: any = {"name":"getUpfByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":919,"b":925,"line":43,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    user_id,\n    sent_ready_to_coach_email,\n    sent_hour_summary_intro_email,\n    sent_inactive_thirty_day_email,\n    sent_inactive_sixty_day_email,\n    sent_inactive_ninety_day_email,\n    gates_qualified,\n    fall_incentive_enrollment_at,\n    created_at,\n    updated_at\nFROM\n    user_product_flags\nWHERE\n    user_id = :userId!","loc":{"a":591,"b":925,"line":29,"col":0}}};

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
  fallIncentiveEnrollmentAt: Date | null;
  gatesQualified: boolean;
  userId: string;
}

/** 'GetPublicUpfByUserId' query type */
export interface IGetPublicUpfByUserIdQuery {
  params: IGetPublicUpfByUserIdParams;
  result: IGetPublicUpfByUserIdResult;
}

const getPublicUpfByUserIdIR: any = {"name":"getPublicUpfByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1086,"b":1092,"line":54,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    user_id,\n    gates_qualified,\n    fall_incentive_enrollment_at\nFROM\n    user_product_flags\nWHERE\n    user_id = :userId!","loc":{"a":963,"b":1092,"line":47,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     gates_qualified,
 *     fall_incentive_enrollment_at
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
  ok: string;
}

/** 'UpdateSentInactiveThirtyDayEmail' query type */
export interface IUpdateSentInactiveThirtyDayEmailQuery {
  params: IUpdateSentInactiveThirtyDayEmailParams;
  result: IUpdateSentInactiveThirtyDayEmailResult;
}

const updateSentInactiveThirtyDayEmailIR: any = {"name":"updateSentInactiveThirtyDayEmail","params":[{"name":"sentInactiveThirtyDayEmail","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1214,"b":1240,"line":61,"col":38}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1287,"b":1293,"line":64,"col":15}]}}],"usedParamSet":{"sentInactiveThirtyDayEmail":true,"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_thirty_day_email = :sentInactiveThirtyDayEmail!,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":1142,"b":1321,"line":58,"col":0}}};

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
  ok: string;
}

/** 'UpdateSentInactiveSixtyDayEmail' query type */
export interface IUpdateSentInactiveSixtyDayEmailQuery {
  params: IUpdateSentInactiveSixtyDayEmailParams;
  result: IUpdateSentInactiveSixtyDayEmailResult;
}

const updateSentInactiveSixtyDayEmailIR: any = {"name":"updateSentInactiveSixtyDayEmail","params":[{"name":"sentInactiveSixtyDayEmail","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1441,"b":1466,"line":73,"col":37}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1513,"b":1519,"line":76,"col":15}]}}],"usedParamSet":{"sentInactiveSixtyDayEmail":true,"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_sixty_day_email = :sentInactiveSixtyDayEmail!,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":1370,"b":1547,"line":70,"col":0}}};

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
  ok: string;
}

/** 'UpdateSentInactiveNinetyDayEmail' query type */
export interface IUpdateSentInactiveNinetyDayEmailQuery {
  params: IUpdateSentInactiveNinetyDayEmailParams;
  result: IUpdateSentInactiveNinetyDayEmailResult;
}

const updateSentInactiveNinetyDayEmailIR: any = {"name":"updateSentInactiveNinetyDayEmail","params":[{"name":"sentInactiveNinetyDayEmail","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1669,"b":1695,"line":85,"col":38}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1742,"b":1748,"line":88,"col":15}]}}],"usedParamSet":{"sentInactiveNinetyDayEmail":true,"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_ninety_day_email = :sentInactiveNinetyDayEmail!,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":1597,"b":1776,"line":82,"col":0}}};

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
  fallIncentiveEnrollmentAt: Date | null;
}

/** 'EnrollStudentToFallIncentiveProgram' query type */
export interface IEnrollStudentToFallIncentiveProgramQuery {
  params: IEnrollStudentToFallIncentiveProgramParams;
  result: IEnrollStudentToFallIncentiveProgramResult;
}

const enrollStudentToFallIncentiveProgramIR: any = {"name":"enrollStudentToFallIncentiveProgram","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1949,"b":1955,"line":100,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    fall_incentive_enrollment_at = NOW(),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    fall_incentive_enrollment_at","loc":{"a":1829,"b":1998,"line":94,"col":0}}};

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


