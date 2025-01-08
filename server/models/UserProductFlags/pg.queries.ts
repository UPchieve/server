/** Types generated for queries found in "server/models/UserProductFlags/user_product_flags.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** Query 'CreateUpfByUserId' is invalid, so its result is assigned type 'never'.
 *  */
export type ICreateUpfByUserIdResult = never;

/** Query 'CreateUpfByUserId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ICreateUpfByUserIdParams = never;

const createUpfByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":76,"b":83},{"a":239,"b":246}]}],"statement":"INSERT INTO user_product_flags (user_id, created_at, updated_at)\nSELECT\n    :userId!,\n    NOW(),\n    NOW()\nWHERE\n    NOT EXISTS (\n        SELECT\n            1\n        FROM\n            user_product_flags\n        WHERE\n            user_id = :userId!)\nRETURNING\n    user_id,\n    sent_ready_to_coach_email,\n    sent_hour_summary_intro_email,\n    sent_inactive_thirty_day_email,\n    sent_inactive_sixty_day_email,\n    sent_inactive_ninety_day_email,\n    gates_qualified,\n    fall_incentive_enrollment_at,\n    created_at,\n    updated_at"};

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


/** Query 'GetUpfByUserId' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetUpfByUserIdResult = never;

/** Query 'GetUpfByUserId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetUpfByUserIdParams = never;

const getUpfByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":327,"b":334}]}],"statement":"SELECT\n    user_id,\n    sent_ready_to_coach_email,\n    sent_hour_summary_intro_email,\n    sent_inactive_thirty_day_email,\n    sent_inactive_sixty_day_email,\n    sent_inactive_ninety_day_email,\n    gates_qualified,\n    fall_incentive_enrollment_at,\n    created_at,\n    updated_at\nFROM\n    user_product_flags\nWHERE\n    user_id = :userId!"};

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


/** Query 'GetPublicUpfByUserId' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetPublicUpfByUserIdResult = never;

/** Query 'GetPublicUpfByUserId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetPublicUpfByUserIdParams = never;

const getPublicUpfByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":122,"b":129}]}],"statement":"SELECT\n    user_id,\n    gates_qualified,\n    fall_incentive_enrollment_at\nFROM\n    user_product_flags\nWHERE\n    user_id = :userId!"};

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


/** Query 'UpdateSentInactiveThirtyDayEmail' is invalid, so its result is assigned type 'never'.
 *  */
export type IUpdateSentInactiveThirtyDayEmailResult = never;

/** Query 'UpdateSentInactiveThirtyDayEmail' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IUpdateSentInactiveThirtyDayEmailParams = never;

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


/** Query 'UpdateSentInactiveSixtyDayEmail' is invalid, so its result is assigned type 'never'.
 *  */
export type IUpdateSentInactiveSixtyDayEmailResult = never;

/** Query 'UpdateSentInactiveSixtyDayEmail' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IUpdateSentInactiveSixtyDayEmailParams = never;

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


/** Query 'UpdateSentInactiveNinetyDayEmail' is invalid, so its result is assigned type 'never'.
 *  */
export type IUpdateSentInactiveNinetyDayEmailResult = never;

/** Query 'UpdateSentInactiveNinetyDayEmail' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IUpdateSentInactiveNinetyDayEmailParams = never;

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


/** Query 'EnrollStudentToFallIncentiveProgram' is invalid, so its result is assigned type 'never'.
 *  */
export type IEnrollStudentToFallIncentiveProgramResult = never;

/** Query 'EnrollStudentToFallIncentiveProgram' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IEnrollStudentToFallIncentiveProgramParams = never;

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


