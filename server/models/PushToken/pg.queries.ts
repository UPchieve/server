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

const deletePushTokensForUserIR: any = {"name":"deletePushTokensForUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":466,"b":472,"line":23,"col":17}]}}],"usedParamSet":{"userId":true},"statement":{"body":"DELETE FROM push_tokens\nWHERE user_id = :userId!","loc":{"a":425,"b":472,"line":22,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM push_tokens
 * WHERE user_id = :userId!
 * ```
 */
export const deletePushTokensForUser = new PreparedQuery<IDeletePushTokensForUserParams,IDeletePushTokensForUserResult>(deletePushTokensForUserIR);


