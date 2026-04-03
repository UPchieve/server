/** Types generated for queries found in "server/models/Totp/totp.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetSecret' parameters type */
export interface IGetSecretParams {
  userId: string;
}

/** 'GetSecret' return type */
export interface IGetSecretResult {
  createdAt: Date;
  lastUsedCounter: number | null;
  secret: string;
  updatedAt: Date;
  userId: string;
  verified: boolean;
}

/** 'GetSecret' query type */
export interface IGetSecretQuery {
  params: IGetSecretParams;
  result: IGetSecretResult;
}

const getSecretIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":47,"b":54}]}],"statement":"SELECT\n    *\nFROM\n    totp\nWHERE\n    user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     totp
 * WHERE
 *     user_id = :userId!
 * ```
 */
export const getSecret = new PreparedQuery<IGetSecretParams,IGetSecretResult>(getSecretIR);


/** 'StoreSecret' parameters type */
export interface IStoreSecretParams {
  secret: string;
  userId: string;
}

/** 'StoreSecret' return type */
export type IStoreSecretResult = void;

/** 'StoreSecret' query type */
export interface IStoreSecretQuery {
  params: IStoreSecretParams;
  result: IStoreSecretResult;
}

const storeSecretIR: any = {"usedParamSet":{"userId":true,"secret":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":47,"b":54}]},{"name":"secret","required":true,"transform":{"type":"scalar"},"locs":[{"a":57,"b":64}]}],"statement":"INSERT INTO totp (user_id, secret)\n    VALUES (:userId!, :secret!)\nON CONFLICT (user_id)\n    DO UPDATE SET\n        secret = EXCLUDED.secret, verified = FALSE, last_used_counter = NULL, updated_at = NOW()\n    WHERE\n        NOT totp.verified"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO totp (user_id, secret)
 *     VALUES (:userId!, :secret!)
 * ON CONFLICT (user_id)
 *     DO UPDATE SET
 *         secret = EXCLUDED.secret, verified = FALSE, last_used_counter = NULL, updated_at = NOW()
 *     WHERE
 *         NOT totp.verified
 * ```
 */
export const storeSecret = new PreparedQuery<IStoreSecretParams,IStoreSecretResult>(storeSecretIR);


/** 'UpdateSecret' parameters type */
export interface IUpdateSecretParams {
  lastUsedCounter?: number | null | void;
  userId: string;
  verified?: boolean | null | void;
}

/** 'UpdateSecret' return type */
export type IUpdateSecretResult = void;

/** 'UpdateSecret' query type */
export interface IUpdateSecretQuery {
  params: IUpdateSecretParams;
  result: IUpdateSecretResult;
}

const updateSecretIR: any = {"usedParamSet":{"verified":true,"lastUsedCounter":true,"userId":true},"params":[{"name":"verified","required":false,"transform":{"type":"scalar"},"locs":[{"a":44,"b":52}]},{"name":"lastUsedCounter","required":false,"transform":{"type":"scalar"},"locs":[{"a":99,"b":114}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":180,"b":187}]}],"statement":"UPDATE\n    totp\nSET\n    verified = COALESCE(:verified, verified),\n    last_used_counter = COALESCE(:lastUsedCounter, last_used_counter),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     totp
 * SET
 *     verified = COALESCE(:verified, verified),
 *     last_used_counter = COALESCE(:lastUsedCounter, last_used_counter),
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * ```
 */
export const updateSecret = new PreparedQuery<IUpdateSecretParams,IUpdateSecretResult>(updateSecretIR);


