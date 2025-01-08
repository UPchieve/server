/** Types generated for queries found in "server/models/ModerationInfractions/moderation_infractions.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** Query 'InsertModerationInfraction' is invalid, so its result is assigned type 'never'.
 *  */
export type IInsertModerationInfractionResult = never;

/** Query 'InsertModerationInfraction' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IInsertModerationInfractionParams = never;

const insertModerationInfractionIR: any = {"usedParamSet":{"id":true,"userId":true,"sessionId":true,"reason":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":113,"b":116}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":119,"b":126},{"a":273,"b":280}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":129,"b":139},{"a":311,"b":321}]},{"name":"reason","required":true,"transform":{"type":"scalar"},"locs":[{"a":142,"b":149}]}],"statement":"WITH insert_infraction AS (\nINSERT INTO moderation_infractions (id, user_id, session_id, reason)\n        VALUES (:id!, :userId!, :sessionId!, :reason!))\n    SELECT\n        1 + count(*) AS infraction_count\n    FROM\n        moderation_infractions\n    WHERE\n        user_id = :userId!\n            AND session_id = :sessionId!"};

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


/** Query 'UpdateModerationInfractionById' is invalid, so its result is assigned type 'never'.
 *  */
export type IUpdateModerationInfractionByIdResult = never;

/** Query 'UpdateModerationInfractionById' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IUpdateModerationInfractionByIdParams = never;

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


/** Query 'GetModerationInfractionsByUserAndSession' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetModerationInfractionsByUserAndSessionResult = never;

/** Query 'GetModerationInfractionsByUserAndSession' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetModerationInfractionsByUserAndSessionParams = never;

const getModerationInfractionsByUserAndSessionIR: any = {"usedParamSet":{"userId":true,"sessionId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":65,"b":72}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":95,"b":105}]}],"statement":"SELECT\n    *\nFROM\n    moderation_infractions\nWHERE\n    user_id = :userId!\n    AND session_id = :sessionId!"};

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


