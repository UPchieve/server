/** Types generated for queries found in "server/models/FederatedCredential/federated_credential.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetFederatedCredential' parameters type */
export interface IGetFederatedCredentialParams {
  id: string;
  issuer: string;
}

/** 'GetFederatedCredential' return type */
export interface IGetFederatedCredentialResult {
  id: string;
  issuer: string;
  userId: string | null;
}

/** 'GetFederatedCredential' query type */
export interface IGetFederatedCredentialQuery {
  params: IGetFederatedCredentialParams;
  result: IGetFederatedCredentialResult;
}

const getFederatedCredentialIR: any = {"usedParamSet":{"id":true,"issuer":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":59,"b":62}]},{"name":"issuer","required":true,"transform":{"type":"scalar"},"locs":[{"a":81,"b":88}]}],"statement":"SELECT\n    *\nFROM\n    federated_credentials\nWHERE\n    id = :id!\n    AND issuer = :issuer!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     federated_credentials
 * WHERE
 *     id = :id!
 *     AND issuer = :issuer!
 * ```
 */
export const getFederatedCredential = new PreparedQuery<IGetFederatedCredentialParams,IGetFederatedCredentialResult>(getFederatedCredentialIR);


/** 'GetFederatedCredentialForUser' parameters type */
export interface IGetFederatedCredentialForUserParams {
  userId: string;
}

/** 'GetFederatedCredentialForUser' return type */
export interface IGetFederatedCredentialForUserResult {
  id: string;
  issuer: string;
  userId: string | null;
}

/** 'GetFederatedCredentialForUser' query type */
export interface IGetFederatedCredentialForUserQuery {
  params: IGetFederatedCredentialForUserParams;
  result: IGetFederatedCredentialForUserResult;
}

const getFederatedCredentialForUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":64,"b":71}]}],"statement":"SELECT\n    *\nFROM\n    federated_credentials\nWHERE\n    user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     federated_credentials
 * WHERE
 *     user_id = :userId!
 * ```
 */
export const getFederatedCredentialForUser = new PreparedQuery<IGetFederatedCredentialForUserParams,IGetFederatedCredentialForUserResult>(getFederatedCredentialForUserIR);


/** 'InsertFederatedCredential' parameters type */
export interface IInsertFederatedCredentialParams {
  id: string;
  issuer: string;
  userId: string;
}

/** 'InsertFederatedCredential' return type */
export type IInsertFederatedCredentialResult = void;

/** 'InsertFederatedCredential' query type */
export interface IInsertFederatedCredentialQuery {
  params: IInsertFederatedCredentialParams;
  result: IInsertFederatedCredentialResult;
}

const insertFederatedCredentialIR: any = {"usedParamSet":{"id":true,"issuer":true,"userId":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":68,"b":71}]},{"name":"issuer","required":true,"transform":{"type":"scalar"},"locs":[{"a":74,"b":81}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":84,"b":91}]}],"statement":"INSERT INTO federated_credentials (id, issuer, user_id)\n    VALUES (:id!, :issuer!, :userId!)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO federated_credentials (id, issuer, user_id)
 *     VALUES (:id!, :issuer!, :userId!)
 * ```
 */
export const insertFederatedCredential = new PreparedQuery<IInsertFederatedCredentialParams,IInsertFederatedCredentialResult>(insertFederatedCredentialIR);


/** 'DeleteFederatedCredentialsForUser' parameters type */
export interface IDeleteFederatedCredentialsForUserParams {
  userId: string;
}

/** 'DeleteFederatedCredentialsForUser' return type */
export type IDeleteFederatedCredentialsForUserResult = void;

/** 'DeleteFederatedCredentialsForUser' query type */
export interface IDeleteFederatedCredentialsForUserQuery {
  params: IDeleteFederatedCredentialsForUserParams;
  result: IDeleteFederatedCredentialsForUserResult;
}

const deleteFederatedCredentialsForUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":50,"b":57}]}],"statement":"DELETE FROM federated_credentials\nWHERE user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM federated_credentials
 * WHERE user_id = :userId!
 * ```
 */
export const deleteFederatedCredentialsForUser = new PreparedQuery<IDeleteFederatedCredentialsForUserParams,IDeleteFederatedCredentialsForUserResult>(deleteFederatedCredentialsForUserIR);


