/** Types generated for queries found in "server/models/FederatedCredential/federated_credential.sql" */
import { PreparedQuery } from '@pgtyped/query';

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

const getFederatedCredentialIR: any = {"name":"getFederatedCredential","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":83,"b":85,"line":3,"col":12}]}},{"name":"issuer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":101,"b":107,"line":3,"col":30}]}}],"usedParamSet":{"id":true,"issuer":true},"statement":{"body":"SELECT * FROM federated_credentials\nWHERE id = :id! AND issuer = :issuer!","loc":{"a":35,"b":107,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM federated_credentials
 * WHERE id = :id! AND issuer = :issuer!
 * ```
 */
export const getFederatedCredential = new PreparedQuery<IGetFederatedCredentialParams,IGetFederatedCredentialResult>(getFederatedCredentialIR);


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

const insertFederatedCredentialIR: any = {"name":"insertFederatedCredential","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":215,"b":217,"line":8,"col":9}]}},{"name":"issuer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":221,"b":227,"line":8,"col":15}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":231,"b":237,"line":8,"col":25}]}}],"usedParamSet":{"id":true,"issuer":true,"userId":true},"statement":{"body":"INSERT INTO federated_credentials (id, issuer, user_id)\nVALUES (:id!, :issuer!, :userId!)","loc":{"a":150,"b":238,"line":7,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO federated_credentials (id, issuer, user_id)
 * VALUES (:id!, :issuer!, :userId!)
 * ```
 */
export const insertFederatedCredential = new PreparedQuery<IInsertFederatedCredentialParams,IInsertFederatedCredentialResult>(insertFederatedCredentialIR);


