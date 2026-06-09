/** Types generated for queries found in "server/models/Referrals/referrals.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type stringArray = (string)[];

/** 'AddReferral' parameters type */
export interface IAddReferralParams {
  referredBy?: string | null | void;
  userId?: string | null | void;
}

/** 'AddReferral' return type */
export type IAddReferralResult = void;

/** 'AddReferral' query type */
export interface IAddReferralQuery {
  params: IAddReferralParams;
  result: IAddReferralResult;
}

const addReferralIR: any = {"usedParamSet":{"userId":true,"referredBy":true},"params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":57,"b":63}]},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"locs":[{"a":66,"b":76}]}],"statement":"INSERT INTO referrals (user_id, referred_by)\n    VALUES (:userId, :referredBy)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO referrals (user_id, referred_by)
 *     VALUES (:userId, :referredBy)
 * ```
 */
export const addReferral = new PreparedQuery<IAddReferralParams,IAddReferralResult>(addReferralIR);


/** 'GetReferredUsersWithFilter' parameters type */
export interface IGetReferredUsersWithFilterParams {
  hasRoles?: stringArray | null | void;
  phoneOrEmailVerified?: boolean | null | void;
  userId: string;
}

/** 'GetReferredUsersWithFilter' return type */
export interface IGetReferredUsersWithFilterResult {
  id: string;
  roles: stringArray | null;
}

/** 'GetReferredUsersWithFilter' query type */
export interface IGetReferredUsersWithFilterQuery {
  params: IGetReferredUsersWithFilterParams;
  result: IGetReferredUsersWithFilterResult;
}

const getReferredUsersWithFilterIR: any = {"usedParamSet":{"userId":true,"phoneOrEmailVerified":true,"hasRoles":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":240,"b":247}]},{"name":"phoneOrEmailVerified","required":false,"transform":{"type":"scalar"},"locs":[{"a":264,"b":284},{"a":333,"b":353},{"a":394,"b":414}]},{"name":"hasRoles","required":false,"transform":{"type":"scalar"},"locs":[{"a":497,"b":505}]}],"statement":"SELECT\n    u.id,\n    array_agg(roles.name)::text[] AS roles\nFROM\n    referrals r\n    JOIN users u ON u.id = r.user_id\n    JOIN users_roles ur ON ur.user_id = u.id\n    JOIN user_roles roles ON roles.id = ur.role_id\nWHERE\n    r.referred_by = :userId!::uuid\n    AND (:phoneOrEmailVerified::boolean IS NULL\n        OR u.phone_verified = :phoneOrEmailVerified::boolean\n        OR u.email_verified = :phoneOrEmailVerified::boolean)\nGROUP BY\n    u.id\nHAVING\n    array_agg(roles.name)::text[] @> COALESCE(:hasRoles::text[], ARRAY[]::text[])"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     u.id,
 *     array_agg(roles.name)::text[] AS roles
 * FROM
 *     referrals r
 *     JOIN users u ON u.id = r.user_id
 *     JOIN users_roles ur ON ur.user_id = u.id
 *     JOIN user_roles roles ON roles.id = ur.role_id
 * WHERE
 *     r.referred_by = :userId!::uuid
 *     AND (:phoneOrEmailVerified::boolean IS NULL
 *         OR u.phone_verified = :phoneOrEmailVerified::boolean
 *         OR u.email_verified = :phoneOrEmailVerified::boolean)
 * GROUP BY
 *     u.id
 * HAVING
 *     array_agg(roles.name)::text[] @> COALESCE(:hasRoles::text[], ARRAY[]::text[])
 * ```
 */
export const getReferredUsersWithFilter = new PreparedQuery<IGetReferredUsersWithFilterParams,IGetReferredUsersWithFilterResult>(getReferredUsersWithFilterIR);


