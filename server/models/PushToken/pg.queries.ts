/** Types generated for queries found in "server/models/PushToken/push_token.sql" */
import { PreparedQuery } from '@pgtyped/query';

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

const getPushTokensByUserIdIR: any = {"name":"getPushTokensByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":154,"b":160,"line":11,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    id,\n    user_id AS USER,\n    token,\n    created_at,\n    updated_at\nFROM\n    push_tokens\nWHERE\n    user_id = :userId!","loc":{"a":34,"b":160,"line":2,"col":0}}};

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

const createPushTokenByUserIdIR: any = {"name":"createPushTokenByUserId","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":283,"b":285,"line":16,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":289,"b":295,"line":16,"col":19}]}},{"name":"token","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":299,"b":304,"line":16,"col":29}]}}],"usedParamSet":{"id":true,"userId":true,"token":true},"statement":{"body":"INSERT INTO push_tokens (id, user_id, token, created_at, updated_at)\n    VALUES (:id!, :userId!, :token!, NOW(), NOW())\nRETURNING\n    id, user_id AS USER, token, created_at, updated_at","loc":{"a":201,"b":384,"line":15,"col":0}}};

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


/** 'DeleteDuplicatePushTokens' parameters type */
export type IDeleteDuplicatePushTokensParams = void;

/** 'DeleteDuplicatePushTokens' return type */
export type IDeleteDuplicatePushTokensResult = void;

/** 'DeleteDuplicatePushTokens' query type */
export interface IDeleteDuplicatePushTokensQuery {
  params: IDeleteDuplicatePushTokensParams;
  result: IDeleteDuplicatePushTokensResult;
}

const deleteDuplicatePushTokensIR: any = {"name":"deleteDuplicatePushTokens","params":[],"usedParamSet":{},"statement":{"body":"DELETE FROM push_tokens\nWHERE id IN (\n        SELECT\n            id\n        FROM (\n            SELECT\n                id,\n                ROW_NUMBER() OVER (PARTITION BY user_id, token ORDER BY id) AS row_num\n            FROM\n                push_tokens) t\n        WHERE\n            t.row_num > 1)","loc":{"a":427,"b":723,"line":22,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM push_tokens
 * WHERE id IN (
 *         SELECT
 *             id
 *         FROM (
 *             SELECT
 *                 id,
 *                 ROW_NUMBER() OVER (PARTITION BY user_id, token ORDER BY id) AS row_num
 *             FROM
 *                 push_tokens) t
 *         WHERE
 *             t.row_num > 1)
 * ```
 */
export const deleteDuplicatePushTokens = new PreparedQuery<IDeleteDuplicatePushTokensParams,IDeleteDuplicatePushTokensResult>(deleteDuplicatePushTokensIR);


