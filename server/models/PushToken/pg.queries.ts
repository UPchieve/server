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

const getPushTokensByUserIdIR: any = {"name":"getPushTokensByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":126,"b":132,"line":2,"col":92}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT id, user_id AS user, token, created_at, updated_at FROM push_tokens WHERE user_id = :userId!","loc":{"a":34,"b":132,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, user_id AS user, token, created_at, updated_at FROM push_tokens WHERE user_id = :userId!
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

const createPushTokenByUserIdIR: any = {"name":"createPushTokenByUserId","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":253,"b":255,"line":7,"col":3}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":261,"b":267,"line":8,"col":3}]}},{"name":"token","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":273,"b":278,"line":9,"col":3}]}}],"usedParamSet":{"id":true,"userId":true,"token":true},"statement":{"body":"INSERT INTO push_tokens (id, user_id, token, created_at, updated_at)\nVALUES (\n  :id!,\n  :userId!,\n  :token!,\n  NOW(),\n  NOW()\n)\nRETURNING id, user_id AS user, token, created_at, updated_at","loc":{"a":172,"b":359,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO push_tokens (id, user_id, token, created_at, updated_at)
 * VALUES (
 *   :id!,
 *   :userId!,
 *   :token!,
 *   NOW(),
 *   NOW()
 * )
 * RETURNING id, user_id AS user, token, created_at, updated_at
 * ```
 */
export const createPushTokenByUserId = new PreparedQuery<ICreatePushTokenByUserIdParams,ICreatePushTokenByUserIdResult>(createPushTokenByUserIdIR);


