/** Types generated for queries found in "server/models/ModerationInfractions/moderation_infractions.sql" */
import { PreparedQuery } from '@pgtyped/query';

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
  infractionCount: string | null;
}

/** 'InsertModerationInfraction' query type */
export interface IInsertModerationInfractionQuery {
  params: IInsertModerationInfractionParams;
  result: IInsertModerationInfractionResult;
}

const insertModerationInfractionIR: any = {"name":"insertModerationInfraction","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":153,"b":155,"line":4,"col":17}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":159,"b":165,"line":4,"col":23},{"a":313,"b":319,"line":10,"col":19}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":169,"b":178,"line":4,"col":33},{"a":351,"b":360,"line":11,"col":30}]}},{"name":"reason","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":182,"b":188,"line":4,"col":46}]}}],"usedParamSet":{"id":true,"userId":true,"sessionId":true,"reason":true},"statement":{"body":"WITH insert_infraction AS (\nINSERT INTO moderation_infractions (id, user_id, session_id, reason)\n        VALUES (:id!, :userId!, :sessionId!, :reason!))\n    SELECT\n        1 + count(*) AS infraction_count\n    FROM\n        moderation_infractions\n    WHERE\n        user_id = :userId!\n            AND session_id = :sessionId!","loc":{"a":39,"b":360,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH insert_infraction AS (
 * INSERT INTO moderation_infractions (id, user_id, session_id, reason)
 *         VALUES (:id!, :userId!, :sessionId!, :reason!))
 *     SELECT
 *         1 + count(*) AS infraction_count
 *     FROM
 *         moderation_infractions
 *     WHERE
 *         user_id = :userId!
 *             AND session_id = :sessionId!
 * ```
 */
export const insertModerationInfraction = new PreparedQuery<IInsertModerationInfractionParams,IInsertModerationInfractionResult>(insertModerationInfractionIR);


/** 'UpdateModerationInfractionById' parameters type */
export interface IUpdateModerationInfractionByIdParams {
  active: boolean | null | void;
  id: string;
}

/** 'UpdateModerationInfractionById' return type */
export type IUpdateModerationInfractionByIdResult = void;

/** 'UpdateModerationInfractionById' query type */
export interface IUpdateModerationInfractionByIdQuery {
  params: IUpdateModerationInfractionByIdParams;
  result: IUpdateModerationInfractionByIdResult;
}

const updateModerationInfractionByIdIR: any = {"name":"updateModerationInfractionById","params":[{"name":"active","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":469,"b":474,"line":18,"col":23}]}},{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":501,"b":503,"line":20,"col":10}]}}],"usedParamSet":{"active":true,"id":true},"statement":{"body":"UPDATE\n    moderation_infractions\nSET\n    active = COALESCE(:active, active)\nWHERE\n    id = :id!","loc":{"a":408,"b":503,"line":15,"col":0}}};

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


/** 'GetModerationInfractionsByUserAndSession' parameters type */
export interface IGetModerationInfractionsByUserAndSessionParams {
  sessionId: string;
  userId: string;
}

/** 'GetModerationInfractionsByUserAndSession' return type */
export interface IGetModerationInfractionsByUserAndSessionResult {
  active: boolean;
  createdAt: Date;
  id: string;
  reason: Json;
  sessionId: string;
  updatedAt: Date;
  userId: string;
}

/** 'GetModerationInfractionsByUserAndSession' query type */
export interface IGetModerationInfractionsByUserAndSessionQuery {
  params: IGetModerationInfractionsByUserAndSessionParams;
  result: IGetModerationInfractionsByUserAndSessionResult;
}

const getModerationInfractionsByUserAndSessionIR: any = {"name":"getModerationInfractionsByUserAndSession","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":627,"b":633,"line":29,"col":15}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":657,"b":666,"line":30,"col":22}]}}],"usedParamSet":{"userId":true,"sessionId":true},"statement":{"body":"SELECT\n    *\nFROM\n    moderation_infractions\nWHERE\n    user_id = :userId!\n    AND session_id = :sessionId!","loc":{"a":561,"b":666,"line":24,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     moderation_infractions
 * WHERE
 *     user_id = :userId!
 *     AND session_id = :sessionId!
 * ```
 */
export const getModerationInfractionsByUserAndSession = new PreparedQuery<IGetModerationInfractionsByUserAndSessionParams,IGetModerationInfractionsByUserAndSessionResult>(getModerationInfractionsByUserAndSessionIR);


