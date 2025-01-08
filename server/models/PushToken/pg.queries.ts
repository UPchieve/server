/** Types generated for queries found in "server/models/PushToken/push_token.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** Query 'GetPushTokensByUserId' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetPushTokensByUserIdResult = never;

/** Query 'GetPushTokensByUserId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetPushTokensByUserIdParams = never;

const getPushTokensByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":119,"b":126}]}],"statement":"SELECT\n    id,\n    user_id AS USER,\n    token,\n    created_at,\n    updated_at\nFROM\n    push_tokens\nWHERE\n    user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     user_id AS USER,
 *     token,
 *     created_at,
 *     updated_at
 * FROM
 *     push_tokens
 * WHERE
 *     user_id = :userId!
 * ```
 */
export const getPushTokensByUserId = new PreparedQuery<IGetPushTokensByUserIdParams,IGetPushTokensByUserIdResult>(getPushTokensByUserIdIR);


/** Query 'CreatePushTokenByUserId' is invalid, so its result is assigned type 'never'.
 *  */
export type ICreatePushTokenByUserIdResult = never;

/** Query 'CreatePushTokenByUserId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ICreatePushTokenByUserIdParams = never;

const createPushTokenByUserIdIR: any = {"usedParamSet":{"id":true,"userId":true,"token":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":81,"b":84}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":87,"b":94}]},{"name":"token","required":true,"transform":{"type":"scalar"},"locs":[{"a":97,"b":103}]}],"statement":"INSERT INTO push_tokens (id, user_id, token, created_at, updated_at)\n    VALUES (:id!, :userId!, :token!, NOW(), NOW())\nRETURNING\n    id, user_id AS USER, token, created_at, updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO push_tokens (id, user_id, token, created_at, updated_at)
 *     VALUES (:id!, :userId!, :token!, NOW(), NOW())
 * RETURNING
 *     id, user_id AS USER, token, created_at, updated_at
 * ```
 */
export const createPushTokenByUserId = new PreparedQuery<ICreatePushTokenByUserIdParams,ICreatePushTokenByUserIdResult>(createPushTokenByUserIdIR);


/** Query 'DeletePushTokensForUser' is invalid, so its result is assigned type 'never'.
 *  */
export type IDeletePushTokensForUserResult = never;

/** Query 'DeletePushTokensForUser' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IDeletePushTokensForUserParams = never;

const deletePushTokensForUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":40,"b":47}]}],"statement":"DELETE FROM push_tokens\nWHERE user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM push_tokens
 * WHERE user_id = :userId!
 * ```
 */
export const deletePushTokensForUser = new PreparedQuery<IDeletePushTokensForUserParams,IDeletePushTokensForUserResult>(deletePushTokensForUserIR);


