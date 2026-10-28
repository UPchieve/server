/** Types generated for queries found in "server/models/NTHSRenewal/nths_renewal.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

/** 'GetNthsRenewalState' parameters type */
export interface IGetNthsRenewalStateParams {
  groupId: string;
  schoolYearStartsOn: DateOrString;
  viewerId: string;
}

/** 'GetNthsRenewalState' return type */
export interface IGetNthsRenewalStateResult {
  /** not_pii: When the chapter closed; null while open */
  closedAt: Date | null;
  /** not_pii */
  createdAt: Date;
  hasConfirmedPresident: boolean;
  hasNamedSuccessor: boolean;
  /** not_pii: true when the user accepted the presidency, false when they declined or stepped down, null before they answer */
  viewerAccepted: boolean | null;
  /** not_pii: When an admin named the user as a successor; null for a member who answers at the member stage */
  viewerNamedAt: Date | null;
}

/** 'GetNthsRenewalState' query type */
export interface IGetNthsRenewalStateQuery {
  params: IGetNthsRenewalStateParams;
  result: IGetNthsRenewalStateResult;
}

const getNthsRenewalStateIR: any = {"usedParamSet":{"groupId":true,"schoolYearStartsOn":true,"viewerId":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":451,"b":459},{"a":1372,"b":1380}]},{"name":"schoolYearStartsOn","required":true,"transform":{"type":"scalar"},"locs":[{"a":508,"b":527},{"a":1268,"b":1287}]},{"name":"viewerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1334,"b":1343}]}],"statement":"WITH current_member_candidates AS (\n    SELECT\n        candidates.named_at,\n        candidates.accepted\n    FROM\n        nths_group_renewal_candidates candidates\n        JOIN nths_group_members members ON members.nths_group_id = candidates.nths_group_id\n            AND members.user_id = candidates.user_id\n            AND members.deactivated_at IS NULL\n        JOIN users ON users.id = candidates.user_id\n    WHERE\n        candidates.nths_group_id = :groupId!\n        AND candidates.school_year_starts_on = :schoolYearStartsOn!::date\n        AND users.deleted IS NOT TRUE\n)\nSELECT\n    nths_groups.created_at,\n    nths_groups.closed_at,\n    COALESCE((\n        SELECT\n            bool_or(accepted IS TRUE)\n        FROM current_member_candidates), FALSE) AS \"has_confirmed_president!\",\n    COALESCE((\n        SELECT\n            bool_or(named_at IS NOT NULL\n                AND accepted IS DISTINCT FROM FALSE)\n        FROM current_member_candidates), FALSE) AS \"has_named_successor!\",\n    viewer_candidate.named_at AS viewer_named_at,\n    viewer_candidate.accepted AS viewer_accepted\nFROM\n    nths_groups\n    LEFT JOIN nths_group_renewal_candidates viewer_candidate ON viewer_candidate.nths_group_id = nths_groups.id\n        AND viewer_candidate.school_year_starts_on = :schoolYearStartsOn!::date\n        AND viewer_candidate.user_id = :viewerId!\nWHERE\n    nths_groups.id = :groupId!"};

/**
 * Query generated from SQL:
 * ```
 * WITH current_member_candidates AS (
 *     SELECT
 *         candidates.named_at,
 *         candidates.accepted
 *     FROM
 *         nths_group_renewal_candidates candidates
 *         JOIN nths_group_members members ON members.nths_group_id = candidates.nths_group_id
 *             AND members.user_id = candidates.user_id
 *             AND members.deactivated_at IS NULL
 *         JOIN users ON users.id = candidates.user_id
 *     WHERE
 *         candidates.nths_group_id = :groupId!
 *         AND candidates.school_year_starts_on = :schoolYearStartsOn!::date
 *         AND users.deleted IS NOT TRUE
 * )
 * SELECT
 *     nths_groups.created_at,
 *     nths_groups.closed_at,
 *     COALESCE((
 *         SELECT
 *             bool_or(accepted IS TRUE)
 *         FROM current_member_candidates), FALSE) AS "has_confirmed_president!",
 *     COALESCE((
 *         SELECT
 *             bool_or(named_at IS NOT NULL
 *                 AND accepted IS DISTINCT FROM FALSE)
 *         FROM current_member_candidates), FALSE) AS "has_named_successor!",
 *     viewer_candidate.named_at AS viewer_named_at,
 *     viewer_candidate.accepted AS viewer_accepted
 * FROM
 *     nths_groups
 *     LEFT JOIN nths_group_renewal_candidates viewer_candidate ON viewer_candidate.nths_group_id = nths_groups.id
 *         AND viewer_candidate.school_year_starts_on = :schoolYearStartsOn!::date
 *         AND viewer_candidate.user_id = :viewerId!
 * WHERE
 *     nths_groups.id = :groupId!
 * ```
 */
export const getNthsRenewalState = new PreparedQuery<IGetNthsRenewalStateParams,IGetNthsRenewalStateResult>(getNthsRenewalStateIR);


