/** Types generated for queries found in "server/models/NTHSEligibility/nths_eligibility.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type ban_types = 'complete' | 'live_media' | 'shadow';

export type stringArray = (string)[];

/** 'GetAtLargeEligibility' parameters type */
export interface IGetAtLargeEligibilityParams {
  userId: string;
}

/** 'GetAtLargeEligibility' return type */
export interface IGetAtLargeEligibilityResult {
  /** not_pii: Type of ban (shadow, complete, live_media) */
  banType: ban_types | null;
  /** not_pii: Whether the user account has been deactivated */
  deactivated: boolean;
  /** not_pii: Soft-delete flag */
  deleted: boolean | null;
  gradeLevel: string | null;
  roles: stringArray | null;
  /** not_pii: Whether the account is a test or internal account */
  testUser: boolean;
}

/** 'GetAtLargeEligibility' query type */
export interface IGetAtLargeEligibilityQuery {
  params: IGetAtLargeEligibilityParams;
  result: IGetAtLargeEligibilityResult;
}

const getAtLargeEligibilityIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":542,"b":549}]}],"statement":"SELECT\n    users.ban_type,\n    users.deactivated,\n    users.deleted,\n    users.test_user,\n    current_grade_levels.current_grade_name AS grade_level,\n    ARRAY (\n        SELECT\n            user_roles.name\n        FROM\n            users_roles\n            JOIN user_roles ON user_roles.id = users_roles.role_id\n        WHERE\n            users_roles.user_id = users.id\n        ORDER BY\n            users_roles.created_at) AS roles\nFROM\n    users\n    LEFT JOIN current_grade_levels ON current_grade_levels.user_id = users.id\nWHERE\n    users.id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.ban_type,
 *     users.deactivated,
 *     users.deleted,
 *     users.test_user,
 *     current_grade_levels.current_grade_name AS grade_level,
 *     ARRAY (
 *         SELECT
 *             user_roles.name
 *         FROM
 *             users_roles
 *             JOIN user_roles ON user_roles.id = users_roles.role_id
 *         WHERE
 *             users_roles.user_id = users.id
 *         ORDER BY
 *             users_roles.created_at) AS roles
 * FROM
 *     users
 *     LEFT JOIN current_grade_levels ON current_grade_levels.user_id = users.id
 * WHERE
 *     users.id = :userId!
 * ```
 */
export const getAtLargeEligibility = new PreparedQuery<IGetAtLargeEligibilityParams,IGetAtLargeEligibilityResult>(getAtLargeEligibilityIR);


