/** Types generated for queries found in "server/models/IpAddress/ip_address.sql" */
import { PreparedQuery } from '@pgtyped/query';

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

const getIpByRawStringIR: any = {"name":"getIpByRawString","params":[{"name":"ip","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":133,"b":135,"line":11,"col":10}]}}],"usedParamSet":{"ip":true},"statement":{"body":"SELECT\n    id,\n    ip,\n    status,\n    created_at,\n    updated_at\nFROM\n    ip_addresses\nWHERE\n    ip = :ip!","loc":{"a":29,"b":135,"line":2,"col":0}}};

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
  id: string;
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

const insertIpByRawStringIR: any = {"name":"insertIpByRawString","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":243,"b":245,"line":16,"col":13}]}},{"name":"ip","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":249,"b":251,"line":16,"col":19}]}}],"usedParamSet":{"id":true,"ip":true},"statement":{"body":"INSERT INTO ip_addresses (id, ip, created_at, updated_at)\n    VALUES (:id!, :ip!, NOW(), NOW())\nRETURNING\n    id, ip, status, created_at, updated_at","loc":{"a":172,"b":319,"line":15,"col":0}}};

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

const insertUsersIpByIdIR: any = {"name":"insertUsersIpById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":451,"b":453,"line":23,"col":13}]}},{"name":"ipId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":457,"b":461,"line":23,"col":19}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":465,"b":471,"line":23,"col":27}]}}],"usedParamSet":{"id":true,"ipId":true,"userId":true},"statement":{"body":"INSERT INTO users_ip_addresses (id, ip_address_id, user_id, created_at, updated_at)\n    VALUES (:id!, :ipId!, :userId!, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":354,"b":509,"line":22,"col":0}}};

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
  userId: string | null | void;
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

const updateIpStatusByUserIdIR: any = {"name":"updateIpStatusByUserId","params":[{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":596,"b":602,"line":32,"col":14}]}},{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":771,"b":776,"line":41,"col":23}]}}],"usedParamSet":{"status":true,"userId":true},"statement":{"body":"UPDATE\n    ONLY ip_addresses\nSET\n    status = :status!,\n    updated_at = NOW()\nWHERE\n    id = ANY (\n        SELECT\n            ip_address_id\n        FROM\n            users_ip_addresses\n        WHERE\n            user_id = :userId)\nRETURNING\n    id AS ok","loc":{"a":549,"b":800,"line":29,"col":0}}};

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


