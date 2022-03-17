/** Types generated for queries found in "server/models/UserProductFlags/user_product_flags.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'CreateUpfByUserId' parameters type */
export interface ICreateUpfByUserIdParams {
  userId: string;
}

/** 'CreateUpfByUserId' return type */
export interface ICreateUpfByUserIdResult {
  createdAt: Date;
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

const createUpfByUserIdIR: any = {"name":"createUpfByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":107,"b":113,"line":4,"col":5},{"a":282,"b":288,"line":14,"col":23}]}}],"usedParamSet":{"userId":true},"statement":{"body":"INSERT INTO user_product_flags (user_id, created_at, updated_at)\nSELECT\n    :userId!,\n    NOW()::date,\n    NOW()::date\nWHERE\n    NOT EXISTS (\n        SELECT\n            1\n        FROM\n            user_product_flags\n        WHERE\n            user_id = :userId!)\nRETURNING\n    user_id,\n    sent_ready_to_coach_email,\n    sent_hour_summary_intro_email,\n    sent_inactive_thirty_day_email,\n    sent_inactive_sixty_day_email,\n    sent_inactive_ninety_day_email,\n    gates_qualified,\n    created_at,\n    updated_at","loc":{"a":30,"b":537,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_product_flags (user_id, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     NOW()::date,
 *     NOW()::date
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

const getUpfByUserIdIR: any = {"name":"getUpfByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":863,"b":869,"line":41,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    user_id,\n    sent_ready_to_coach_email,\n    sent_hour_summary_intro_email,\n    sent_inactive_thirty_day_email,\n    sent_inactive_sixty_day_email,\n    sent_inactive_ninety_day_email,\n    gates_qualified,\n    created_at,\n    updated_at\nFROM\n    user_product_flags\nWHERE\n    user_id = :userId!","loc":{"a":569,"b":869,"line":28,"col":0}}};

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
  gatesQualified: boolean;
  userId: string;
}

/** 'GetPublicUpfByUserId' query type */
export interface IGetPublicUpfByUserIdQuery {
  params: IGetPublicUpfByUserIdParams;
  result: IGetPublicUpfByUserIdResult;
}

const getPublicUpfByUserIdIR: any = {"name":"getPublicUpfByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":996,"b":1002,"line":51,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    user_id,\n    gates_qualified\nFROM\n    user_product_flags\nWHERE\n    user_id = :userId!","loc":{"a":907,"b":1002,"line":45,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     gates_qualified
 * FROM
 *     user_product_flags
 * WHERE
 *     user_id = :userId!
 * ```
 */
export const getPublicUpfByUserId = new PreparedQuery<IGetPublicUpfByUserIdParams,IGetPublicUpfByUserIdResult>(getPublicUpfByUserIdIR);


/** 'GetAllUpf' parameters type */
export type IGetAllUpfParams = void;

/** 'GetAllUpf' return type */
export interface IGetAllUpfResult {
  createdAt: Date;
  gatesQualified: boolean;
  sentHourSummaryIntroEmail: boolean;
  sentInactiveNinetyDayEmail: boolean;
  sentInactiveSixtyDayEmail: boolean;
  sentInactiveThirtyDayEmail: boolean;
  sentReadyToCoachEmail: boolean;
  updatedAt: Date;
  userId: string;
}

/** 'GetAllUpf' query type */
export interface IGetAllUpfQuery {
  params: IGetAllUpfParams;
  result: IGetAllUpfResult;
}

const getAllUpfIR: any = {"name":"getAllUpf","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    user_id,\n    sent_ready_to_coach_email,\n    sent_hour_summary_intro_email,\n    sent_inactive_thirty_day_email,\n    sent_inactive_sixty_day_email,\n    sent_inactive_ninety_day_email,\n    gates_qualified,\n    created_at,\n    updated_at\nFROM\n    user_product_flags","loc":{"a":1029,"b":1300,"line":55,"col":0}}};

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
 *     created_at,
 *     updated_at
 * FROM
 *     user_product_flags
 * ```
 */
export const getAllUpf = new PreparedQuery<IGetAllUpfParams,IGetAllUpfResult>(getAllUpfIR);


/** 'UpdateUpfGatesQualifiedFlagById' parameters type */
export interface IUpdateUpfGatesQualifiedFlagByIdParams {
  gatesQualified: boolean;
  userId: string;
}

/** 'UpdateUpfGatesQualifiedFlagById' return type */
export interface IUpdateUpfGatesQualifiedFlagByIdResult {
  gatesQualified: boolean;
  userId: string;
}

/** 'UpdateUpfGatesQualifiedFlagById' query type */
export interface IUpdateUpfGatesQualifiedFlagByIdQuery {
  params: IUpdateUpfGatesQualifiedFlagByIdParams;
  result: IUpdateUpfGatesQualifiedFlagByIdResult;
}

const updateUpfGatesQualifiedFlagByIdIR: any = {"name":"updateUPFGatesQualifiedFlagById","params":[{"name":"gatesQualified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1406,"b":1420,"line":73,"col":23}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1473,"b":1479,"line":76,"col":15}]}}],"usedParamSet":{"gatesQualified":true,"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    gates_qualified = :gatesQualified!,\n    updated_at = NOW()::date\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id,\n    gates_qualified","loc":{"a":1349,"b":1522,"line":70,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     gates_qualified = :gatesQualified!,
 *     updated_at = NOW()::date
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id,
 *     gates_qualified
 * ```
 */
export const updateUpfGatesQualifiedFlagById = new PreparedQuery<IUpdateUpfGatesQualifiedFlagByIdParams,IUpdateUpfGatesQualifiedFlagByIdResult>(updateUpfGatesQualifiedFlagByIdIR);


/** 'UpdateSentInactiveThirtyDayEmail' parameters type */
export interface IUpdateSentInactiveThirtyDayEmailParams {
  sentInactiveThirtyDayEmail: boolean;
  userId: string;
}

/** 'UpdateSentInactiveThirtyDayEmail' return type */
export interface IUpdateSentInactiveThirtyDayEmailResult {
  sentInactiveThirtyDayEmail: boolean;
  userId: string;
}

/** 'UpdateSentInactiveThirtyDayEmail' query type */
export interface IUpdateSentInactiveThirtyDayEmailQuery {
  params: IUpdateSentInactiveThirtyDayEmailParams;
  result: IUpdateSentInactiveThirtyDayEmailResult;
}

const updateSentInactiveThirtyDayEmailIR: any = {"name":"updateSentInactiveThirtyDayEmail","params":[{"name":"sentInactiveThirtyDayEmail","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1644,"b":1670,"line":86,"col":38}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1723,"b":1729,"line":89,"col":15}]}}],"usedParamSet":{"sentInactiveThirtyDayEmail":true,"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_thirty_day_email = :sentInactiveThirtyDayEmail!,\n    updated_at = NOW()::date\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id,\n    sent_inactive_thirty_day_email","loc":{"a":1572,"b":1787,"line":83,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_inactive_thirty_day_email = :sentInactiveThirtyDayEmail!,
 *     updated_at = NOW()::date
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id,
 *     sent_inactive_thirty_day_email
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
  sentInactiveSixtyDayEmail: boolean;
  userId: string;
}

/** 'UpdateSentInactiveSixtyDayEmail' query type */
export interface IUpdateSentInactiveSixtyDayEmailQuery {
  params: IUpdateSentInactiveSixtyDayEmailParams;
  result: IUpdateSentInactiveSixtyDayEmailResult;
}

const updateSentInactiveSixtyDayEmailIR: any = {"name":"updateSentInactiveSixtyDayEmail","params":[{"name":"sentInactiveSixtyDayEmail","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1907,"b":1932,"line":99,"col":37}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1985,"b":1991,"line":102,"col":15}]}}],"usedParamSet":{"sentInactiveSixtyDayEmail":true,"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_sixty_day_email = :sentInactiveSixtyDayEmail!,\n    updated_at = NOW()::date\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id,\n    sent_inactive_sixty_day_email","loc":{"a":1836,"b":2048,"line":96,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_inactive_sixty_day_email = :sentInactiveSixtyDayEmail!,
 *     updated_at = NOW()::date
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id,
 *     sent_inactive_sixty_day_email
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
  sentInactiveNinetyDayEmail: boolean;
  userId: string;
}

/** 'UpdateSentInactiveNinetyDayEmail' query type */
export interface IUpdateSentInactiveNinetyDayEmailQuery {
  params: IUpdateSentInactiveNinetyDayEmailParams;
  result: IUpdateSentInactiveNinetyDayEmailResult;
}

const updateSentInactiveNinetyDayEmailIR: any = {"name":"updateSentInactiveNinetyDayEmail","params":[{"name":"sentInactiveNinetyDayEmail","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2170,"b":2196,"line":112,"col":38}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2249,"b":2255,"line":115,"col":15}]}}],"usedParamSet":{"sentInactiveNinetyDayEmail":true,"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    sent_inactive_ninety_day_email = :sentInactiveNinetyDayEmail!,\n    updated_at = NOW()::date\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id,\n    sent_inactive_ninety_day_email","loc":{"a":2098,"b":2313,"line":109,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_inactive_ninety_day_email = :sentInactiveNinetyDayEmail!,
 *     updated_at = NOW()::date
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id,
 *     sent_inactive_ninety_day_email
 * ```
 */
export const updateSentInactiveNinetyDayEmail = new PreparedQuery<IUpdateSentInactiveNinetyDayEmailParams,IUpdateSentInactiveNinetyDayEmailResult>(updateSentInactiveNinetyDayEmailIR);


