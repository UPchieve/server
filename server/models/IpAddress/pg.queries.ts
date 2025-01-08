/** Types generated for queries found in "server/models/IpAddress/ip_address.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type NumberOrString = number | string;

/** 'GetIpByRawString' parameters type */
export interface IGetIpByRawStringParams {
  ip: string;
}

/** 'GetIpByRawString' return type */
export interface IGetIpByRawStringResult {
  createdAt: Date;
  id: string;
  ip: string;
  status: string | null;
  updatedAt: Date;
}

/** 'GetIpByRawString' query type */
export interface IGetIpByRawStringQuery {
  params: IGetIpByRawStringParams;
  result: IGetIpByRawStringResult;
}

const getIpByRawStringIR: any = {"usedParamSet":{"ip":true},"params":[{"name":"ip","required":true,"transform":{"type":"scalar"},"locs":[{"a":103,"b":106}]}],"statement":"SELECT\n    id,\n    ip,\n    status,\n    created_at,\n    updated_at\nFROM\n    ip_addresses\nWHERE\n    ip = :ip!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     ip,
 *     status,
 *     created_at,
 *     updated_at
 * FROM
 *     ip_addresses
 * WHERE
 *     ip = :ip!
 * ```
 */
export const getIpByRawString = new PreparedQuery<IGetIpByRawStringParams,IGetIpByRawStringResult>(getIpByRawStringIR);


/** 'InsertIpByRawString' parameters type */
export interface IInsertIpByRawStringParams {
  id: NumberOrString;
  ip: string;
}

/** 'InsertIpByRawString' return type */
export interface IInsertIpByRawStringResult {
  createdAt: Date;
  id: string;
  ip: string;
  status: string | null;
  updatedAt: Date;
}

/** 'InsertIpByRawString' query type */
export interface IInsertIpByRawStringQuery {
  params: IInsertIpByRawStringParams;
  result: IInsertIpByRawStringResult;
}

const insertIpByRawStringIR: any = {"usedParamSet":{"id":true,"ip":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":70,"b":73}]},{"name":"ip","required":true,"transform":{"type":"scalar"},"locs":[{"a":76,"b":79}]}],"statement":"INSERT INTO ip_addresses (id, ip, created_at, updated_at)\n    VALUES (:id!, :ip!, NOW(), NOW())\nRETURNING\n    id, ip, status, created_at, updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO ip_addresses (id, ip, created_at, updated_at)
 *     VALUES (:id!, :ip!, NOW(), NOW())
 * RETURNING
 *     id, ip, status, created_at, updated_at
 * ```
 */
export const insertIpByRawString = new PreparedQuery<IInsertIpByRawStringParams,IInsertIpByRawStringResult>(insertIpByRawStringIR);


/** 'InsertUsersIpById' parameters type */
export interface IInsertUsersIpByIdParams {
  id: string;
  ipId: number;
  userId: string;
}

/** 'InsertUsersIpById' return type */
export interface IInsertUsersIpByIdResult {
  ok: string;
}

/** 'InsertUsersIpById' query type */
export interface IInsertUsersIpByIdQuery {
  params: IInsertUsersIpByIdParams;
  result: IInsertUsersIpByIdResult;
}

const insertUsersIpByIdIR: any = {"usedParamSet":{"id":true,"ipId":true,"userId":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":96,"b":99}]},{"name":"ipId","required":true,"transform":{"type":"scalar"},"locs":[{"a":102,"b":107}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":110,"b":117}]}],"statement":"INSERT INTO users_ip_addresses (id, ip_address_id, user_id, created_at, updated_at)\n    VALUES (:id!, :ipId!, :userId!, NOW(), NOW())\nRETURNING\n    id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_ip_addresses (id, ip_address_id, user_id, created_at, updated_at)
 *     VALUES (:id!, :ipId!, :userId!, NOW(), NOW())
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertUsersIpById = new PreparedQuery<IInsertUsersIpByIdParams,IInsertUsersIpByIdResult>(insertUsersIpByIdIR);


/** 'UpdateIpStatusByUserId' parameters type */
export interface IUpdateIpStatusByUserIdParams {
  status: string;
  userId?: string | null | void;
}

/** 'UpdateIpStatusByUserId' return type */
export interface IUpdateIpStatusByUserIdResult {
  ok: string;
}

/** 'UpdateIpStatusByUserId' query type */
export interface IUpdateIpStatusByUserIdQuery {
  params: IUpdateIpStatusByUserIdParams;
  result: IUpdateIpStatusByUserIdResult;
}

const updateIpStatusByUserIdIR: any = {"usedParamSet":{"status":true,"userId":true},"params":[{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":46,"b":53}]},{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":221,"b":227}]}],"statement":"UPDATE\n    ONLY ip_addresses\nSET\n    status = :status!,\n    updated_at = NOW()\nWHERE\n    id = ANY (\n        SELECT\n            ip_address_id\n        FROM\n            users_ip_addresses\n        WHERE\n            user_id = :userId)\nRETURNING\n    id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     ONLY ip_addresses
 * SET
 *     status = :status!,
 *     updated_at = NOW()
 * WHERE
 *     id = ANY (
 *         SELECT
 *             ip_address_id
 *         FROM
 *             users_ip_addresses
 *         WHERE
 *             user_id = :userId)
 * RETURNING
 *     id AS ok
 * ```
 */
export const updateIpStatusByUserId = new PreparedQuery<IUpdateIpStatusByUserIdParams,IUpdateIpStatusByUserIdResult>(updateIpStatusByUserIdIR);


