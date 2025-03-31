/** Types generated for queries found in "server/models/ModerationInfractions/moderation_infractions.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'InsertModerationInfraction' parameters type */
export interface IInsertModerationInfractionParams {
  id: string;
  reason: Json;
  sessionId: string;
  userId: string;
}

/** 'InsertModerationInfraction' return type */
export interface IInsertModerationInfractionResult {
  active: boolean;
  createdAt: Date;
  id: string;
  reason: Json;
  sessionId: string;
  updatedAt: Date;
  userId: string;
}

/** 'InsertModerationInfraction' query type */
export interface IInsertModerationInfractionQuery {
  params: IInsertModerationInfractionParams;
  result: IInsertModerationInfractionResult;
}

const insertModerationInfractionIR: any = {"usedParamSet":{"id":true,"userId":true,"sessionId":true,"reason":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":89,"b":92}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":95,"b":102}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":105,"b":115}]},{"name":"reason","required":true,"transform":{"type":"scalar"},"locs":[{"a":118,"b":125}]}],"statement":"INSERT INTO moderation_infractions (id, user_id, session_id, reason, active)\n    VALUES (:id!, :userId!, :sessionId!, :reason!, TRUE)\nRETURNING\n    *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO moderation_infractions (id, user_id, session_id, reason, active)
 *     VALUES (:id!, :userId!, :sessionId!, :reason!, TRUE)
 * RETURNING
 *     *
 * ```
 */
export const insertModerationInfraction = new PreparedQuery<IInsertModerationInfractionParams,IInsertModerationInfractionResult>(insertModerationInfractionIR);


/** 'UpdateModerationInfractionById' parameters type */
export interface IUpdateModerationInfractionByIdParams {
  active?: boolean | null | void;
  id: string;
}

/** 'UpdateModerationInfractionById' return type */
export type IUpdateModerationInfractionByIdResult = void;

/** 'UpdateModerationInfractionById' query type */
export interface IUpdateModerationInfractionByIdQuery {
  params: IUpdateModerationInfractionByIdParams;
  result: IUpdateModerationInfractionByIdResult;
}

const updateModerationInfractionByIdIR: any = {"usedParamSet":{"active":true,"id":true},"params":[{"name":"active","required":false,"transform":{"type":"scalar"},"locs":[{"a":60,"b":66}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":92,"b":95}]}],"statement":"UPDATE\n    moderation_infractions\nSET\n    active = COALESCE(:active, active)\nWHERE\n    id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     moderation_infractions
 * SET
 *     active = COALESCE(:active, active)
 * WHERE
 *     id = :id!
 * ```
 */
export const updateModerationInfractionById = new PreparedQuery<IUpdateModerationInfractionByIdParams,IUpdateModerationInfractionByIdResult>(updateModerationInfractionByIdIR);


/** 'DeactivateModerationInfractionByUserId' parameters type */
export interface IDeactivateModerationInfractionByUserIdParams {
  userId: string;
}

/** 'DeactivateModerationInfractionByUserId' return type */
export type IDeactivateModerationInfractionByUserIdResult = void;

/** 'DeactivateModerationInfractionByUserId' query type */
export interface IDeactivateModerationInfractionByUserIdQuery {
  params: IDeactivateModerationInfractionByUserIdParams;
  result: IDeactivateModerationInfractionByUserIdResult;
}

const deactivateModerationInfractionByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":77,"b":84}]}],"statement":"UPDATE\n    moderation_infractions\nSET\n    active = FALSE\nWHERE\n    user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     moderation_infractions
 * SET
 *     active = FALSE
 * WHERE
 *     user_id = :userId!
 * ```
 */
export const deactivateModerationInfractionByUserId = new PreparedQuery<IDeactivateModerationInfractionByUserIdParams,IDeactivateModerationInfractionByUserIdResult>(deactivateModerationInfractionByUserIdIR);


/** 'GetModerationInfractionsByUser' parameters type */
export interface IGetModerationInfractionsByUserParams {
  active?: boolean | null | void;
  sessionId?: string | null | void;
  userId: string;
}

/** 'GetModerationInfractionsByUser' return type */
export interface IGetModerationInfractionsByUserResult {
  active: boolean;
  createdAt: Date;
  id: string;
  reason: Json;
  sessionId: string;
  updatedAt: Date;
  userId: string;
}

/** 'GetModerationInfractionsByUser' query type */
export interface IGetModerationInfractionsByUserQuery {
  params: IGetModerationInfractionsByUserParams;
  result: IGetModerationInfractionsByUserResult;
}

const getModerationInfractionsByUserIR: any = {"usedParamSet":{"userId":true,"sessionId":true,"active":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":65,"b":72}]},{"name":"sessionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":83,"b":92},{"a":132,"b":141}]},{"name":"active","required":false,"transform":{"type":"scalar"},"locs":[{"a":153,"b":159},{"a":198,"b":204}]}],"statement":"SELECT\n    *\nFROM\n    moderation_infractions\nWHERE\n    user_id = :userId!\n    AND (:sessionId::uuid IS NULL\n        OR session_id = :sessionId)\n    AND (:active::boolean IS NULL\n        OR active = :active)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     moderation_infractions
 * WHERE
 *     user_id = :userId!
 *     AND (:sessionId::uuid IS NULL
 *         OR session_id = :sessionId)
 *     AND (:active::boolean IS NULL
 *         OR active = :active)
 * ```
 */
export const getModerationInfractionsByUser = new PreparedQuery<IGetModerationInfractionsByUserParams,IGetModerationInfractionsByUserResult>(getModerationInfractionsByUserIR);


