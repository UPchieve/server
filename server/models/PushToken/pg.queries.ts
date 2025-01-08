/** Types generated for queries found in "server/models/PushToken/push_token.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetPushTokensByUserId' parameters type */
export interface IGetPushTokensByUserIdParams {
  userId: string;
}

/** 'GetPushTokensByUserId' return type */
export interface IGetPushTokensByUserIdResult {
  createdAt: Date;
  id: string;
  token: string;
  updatedAt: Date;
  user: string;
}

/** 'GetPushTokensByUserId' query type */
export interface IGetPushTokensByUserIdQuery {
  params: IGetPushTokensByUserIdParams;
  result: IGetPushTokensByUserIdResult;
}

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


/** 'CreatePushTokenByUserId' parameters type */
export interface ICreatePushTokenByUserIdParams {
  id: string;
  token: string;
  userId: string;
}

/** 'CreatePushTokenByUserId' return type */
export interface ICreatePushTokenByUserIdResult {
  createdAt: Date;
  id: string;
  token: string;
  updatedAt: Date;
  user: string;
}

/** 'CreatePushTokenByUserId' query type */
export interface ICreatePushTokenByUserIdQuery {
  params: ICreatePushTokenByUserIdParams;
  result: ICreatePushTokenByUserIdResult;
}

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


/** 'DeletePushTokensForUser' parameters type */
export interface IDeletePushTokensForUserParams {
  userId: string;
}

/** 'DeletePushTokensForUser' return type */
export type IDeletePushTokensForUserResult = void;

/** 'DeletePushTokensForUser' query type */
export interface IDeletePushTokensForUserQuery {
  params: IDeletePushTokensForUserParams;
  result: IDeletePushTokensForUserResult;
}

const deletePushTokensForUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":40,"b":47}]}],"statement":"DELETE FROM push_tokens\nWHERE user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM push_tokens
 * WHERE user_id = :userId!
 * ```
 */
export const deletePushTokensForUser = new PreparedQuery<IDeletePushTokensForUserParams,IDeletePushTokensForUserResult>(deletePushTokensForUserIR);


