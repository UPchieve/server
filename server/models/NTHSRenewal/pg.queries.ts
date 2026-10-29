/** Types generated for queries found in "server/models/NTHSRenewal/nths_renewal.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type stringArray = (string)[];

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


/** 'GetRenewalSuccessors' parameters type */
export interface IGetRenewalSuccessorsParams {
  groupId: string;
  schoolYearStartsOn: DateOrString;
}

/** 'GetRenewalSuccessors' return type */
export interface IGetRenewalSuccessorsResult {
  /** not_pii: true when the user accepted the presidency, false when they declined or stepped down, null before they answer */
  accepted: boolean | null;
  /** pii: First name */
  firstName: string;
  lastInitial: string | null;
  /** pii: First name */
  namedByFirstName: string | null;
  namedByLastInitial: string | null;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'GetRenewalSuccessors' query type */
export interface IGetRenewalSuccessorsQuery {
  params: IGetRenewalSuccessorsParams;
  result: IGetRenewalSuccessorsResult;
}

const getRenewalSuccessorsIR: any = {"usedParamSet":{"groupId":true,"schoolYearStartsOn":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":662,"b":670}]},{"name":"schoolYearStartsOn","required":true,"transform":{"type":"scalar"},"locs":[{"a":715,"b":734}]}],"statement":"SELECT\n    candidates.user_id,\n    users.first_name,\n    LEFT (users.last_name,\n        1) AS last_initial,\n    candidates.accepted,\n    namers.first_name AS \"named_by_first_name?\",\n    LEFT (namers.last_name,\n        1) AS named_by_last_initial\nFROM\n    nths_group_renewal_candidates candidates\n    JOIN nths_group_members members ON members.nths_group_id = candidates.nths_group_id\n        AND members.user_id = candidates.user_id\n        AND members.deactivated_at IS NULL\n    JOIN users ON users.id = candidates.user_id\n    LEFT JOIN users namers ON namers.id = candidates.named_by\n        AND namers.deleted IS NOT TRUE\nWHERE\n    candidates.nths_group_id = :groupId!\n    AND candidates.school_year_starts_on = :schoolYearStartsOn!::date\n    AND users.deleted IS NOT TRUE"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     candidates.user_id,
 *     users.first_name,
 *     LEFT (users.last_name,
 *         1) AS last_initial,
 *     candidates.accepted,
 *     namers.first_name AS "named_by_first_name?",
 *     LEFT (namers.last_name,
 *         1) AS named_by_last_initial
 * FROM
 *     nths_group_renewal_candidates candidates
 *     JOIN nths_group_members members ON members.nths_group_id = candidates.nths_group_id
 *         AND members.user_id = candidates.user_id
 *         AND members.deactivated_at IS NULL
 *     JOIN users ON users.id = candidates.user_id
 *     LEFT JOIN users namers ON namers.id = candidates.named_by
 *         AND namers.deleted IS NOT TRUE
 * WHERE
 *     candidates.nths_group_id = :groupId!
 *     AND candidates.school_year_starts_on = :schoolYearStartsOn!::date
 *     AND users.deleted IS NOT TRUE
 * ```
 */
export const getRenewalSuccessors = new PreparedQuery<IGetRenewalSuccessorsParams,IGetRenewalSuccessorsResult>(getRenewalSuccessorsIR);


/** 'InsertRenewalNominations' parameters type */
export interface IInsertRenewalNominationsParams {
  groupId: string;
  namedBy: string;
  schoolYearStartsOn: DateOrString;
  userIds: stringArray;
}

/** 'InsertRenewalNominations' return type */
export type IInsertRenewalNominationsResult = void;

/** 'InsertRenewalNominations' query type */
export interface IInsertRenewalNominationsQuery {
  params: IInsertRenewalNominationsParams;
  result: IInsertRenewalNominationsResult;
}

const insertRenewalNominationsIR: any = {"usedParamSet":{"groupId":true,"schoolYearStartsOn":true,"namedBy":true,"userIds":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":121,"b":129}]},{"name":"schoolYearStartsOn","required":true,"transform":{"type":"scalar"},"locs":[{"a":136,"b":155}]},{"name":"namedBy","required":true,"transform":{"type":"scalar"},"locs":[{"a":195,"b":203}]},{"name":"userIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":221,"b":229}]}],"statement":"INSERT INTO nths_group_renewal_candidates (nths_group_id, school_year_starts_on, user_id, named_at, named_by)\nSELECT\n    :groupId!,\n    :schoolYearStartsOn!::date,\n    nominee_id,\n    NOW(),\n    :namedBy!\nFROM\n    unnest(:userIds!::uuid[]) AS nominee_id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO nths_group_renewal_candidates (nths_group_id, school_year_starts_on, user_id, named_at, named_by)
 * SELECT
 *     :groupId!,
 *     :schoolYearStartsOn!::date,
 *     nominee_id,
 *     NOW(),
 *     :namedBy!
 * FROM
 *     unnest(:userIds!::uuid[]) AS nominee_id
 * ```
 */
export const insertRenewalNominations = new PreparedQuery<IInsertRenewalNominationsParams,IInsertRenewalNominationsResult>(insertRenewalNominationsIR);


/** 'DeleteUnansweredRenewalNominations' parameters type */
export interface IDeleteUnansweredRenewalNominationsParams {
  groupId: string;
  schoolYearStartsOn: DateOrString;
  userIds: stringArray;
}

/** 'DeleteUnansweredRenewalNominations' return type */
export type IDeleteUnansweredRenewalNominationsResult = void;

/** 'DeleteUnansweredRenewalNominations' query type */
export interface IDeleteUnansweredRenewalNominationsQuery {
  params: IDeleteUnansweredRenewalNominationsParams;
  result: IDeleteUnansweredRenewalNominationsResult;
}

const deleteUnansweredRenewalNominationsIR: any = {"usedParamSet":{"groupId":true,"schoolYearStartsOn":true,"userIds":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":64,"b":72}]},{"name":"schoolYearStartsOn","required":true,"transform":{"type":"scalar"},"locs":[{"a":106,"b":125}]},{"name":"userIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":156,"b":164}]}],"statement":"DELETE FROM nths_group_renewal_candidates\nWHERE nths_group_id = :groupId!\n    AND school_year_starts_on = :schoolYearStartsOn!::date\n    AND user_id = ANY (:userIds!)\n    AND accepted IS NULL                                                          "};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM nths_group_renewal_candidates
 * WHERE nths_group_id = :groupId!
 *     AND school_year_starts_on = :schoolYearStartsOn!::date
 *     AND user_id = ANY (:userIds!)
 *     AND accepted IS NULL                                                          
 * ```
 */
export const deleteUnansweredRenewalNominations = new PreparedQuery<IDeleteUnansweredRenewalNominationsParams,IDeleteUnansweredRenewalNominationsResult>(deleteUnansweredRenewalNominationsIR);


/** 'UpsertRenewalAnswer' parameters type */
export interface IUpsertRenewalAnswerParams {
  accepted: boolean;
  commitments?: Json | null | void;
  groupId: string;
  schoolYearStartsOn: DateOrString;
  userId: string;
}

/** 'UpsertRenewalAnswer' return type */
export type IUpsertRenewalAnswerResult = void;

/** 'UpsertRenewalAnswer' query type */
export interface IUpsertRenewalAnswerQuery {
  params: IUpsertRenewalAnswerParams;
  result: IUpsertRenewalAnswerResult;
}

const upsertRenewalAnswerIR: any = {"usedParamSet":{"groupId":true,"schoolYearStartsOn":true,"userId":true,"accepted":true,"commitments":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":139,"b":147}]},{"name":"schoolYearStartsOn","required":true,"transform":{"type":"scalar"},"locs":[{"a":150,"b":169}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":178,"b":185}]},{"name":"accepted","required":true,"transform":{"type":"scalar"},"locs":[{"a":188,"b":197}]},{"name":"commitments","required":false,"transform":{"type":"scalar"},"locs":[{"a":207,"b":218}]}],"statement":"INSERT INTO nths_group_renewal_candidates (nths_group_id, school_year_starts_on, user_id, accepted, responded_at, commitments)\n    VALUES (:groupId!, :schoolYearStartsOn!::date, :userId!, :accepted!, NOW(), :commitments)\nON CONFLICT ON CONSTRAINT nths_group_renewal_candidates_group_school_year_user_key\n    DO UPDATE SET\n        accepted = EXCLUDED.accepted, responded_at = EXCLUDED.responded_at, commitments = EXCLUDED.commitments, updated_at = NOW()"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO nths_group_renewal_candidates (nths_group_id, school_year_starts_on, user_id, accepted, responded_at, commitments)
 *     VALUES (:groupId!, :schoolYearStartsOn!::date, :userId!, :accepted!, NOW(), :commitments)
 * ON CONFLICT ON CONSTRAINT nths_group_renewal_candidates_group_school_year_user_key
 *     DO UPDATE SET
 *         accepted = EXCLUDED.accepted, responded_at = EXCLUDED.responded_at, commitments = EXCLUDED.commitments, updated_at = NOW()
 * ```
 */
export const upsertRenewalAnswer = new PreparedQuery<IUpsertRenewalAnswerParams,IUpsertRenewalAnswerResult>(upsertRenewalAnswerIR);


/** 'DemotePresidentsNotRenewing' parameters type */
export interface IDemotePresidentsNotRenewingParams {
  groupId: string;
  schoolYearStartsOn: DateOrString;
}

/** 'DemotePresidentsNotRenewing' return type */
export interface IDemotePresidentsNotRenewingResult {
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'DemotePresidentsNotRenewing' query type */
export interface IDemotePresidentsNotRenewingQuery {
  params: IDemotePresidentsNotRenewingParams;
  result: IDemotePresidentsNotRenewingResult;
}

const demotePresidentsNotRenewingIR: any = {"usedParamSet":{"groupId":true,"schoolYearStartsOn":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":205,"b":213}]},{"name":"schoolYearStartsOn","required":true,"transform":{"type":"scalar"},"locs":[{"a":585,"b":604}]}],"statement":"UPDATE\n    nths_group_members members\nSET\n    title = 'Member',\n    updated_at = NOW()\nFROM\n    users\nWHERE\n    users.id = members.user_id\n    AND users.deleted IS NOT TRUE\n    AND members.nths_group_id = :groupId!\n    AND members.deactivated_at IS NULL\n    AND members.title = 'President'\n    AND NOT EXISTS (\n        SELECT\n            1\n        FROM\n            nths_group_renewal_candidates candidates\n        WHERE\n            candidates.nths_group_id = members.nths_group_id\n            AND candidates.user_id = members.user_id\n            AND candidates.school_year_starts_on = :schoolYearStartsOn!::date\n            AND (candidates.accepted IS TRUE\n                OR (candidates.named_at IS NOT NULL\n                    AND candidates.accepted IS NULL)))\nRETURNING\n    members.user_id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     nths_group_members members
 * SET
 *     title = 'Member',
 *     updated_at = NOW()
 * FROM
 *     users
 * WHERE
 *     users.id = members.user_id
 *     AND users.deleted IS NOT TRUE
 *     AND members.nths_group_id = :groupId!
 *     AND members.deactivated_at IS NULL
 *     AND members.title = 'President'
 *     AND NOT EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             nths_group_renewal_candidates candidates
 *         WHERE
 *             candidates.nths_group_id = members.nths_group_id
 *             AND candidates.user_id = members.user_id
 *             AND candidates.school_year_starts_on = :schoolYearStartsOn!::date
 *             AND (candidates.accepted IS TRUE
 *                 OR (candidates.named_at IS NOT NULL
 *                     AND candidates.accepted IS NULL)))
 * RETURNING
 *     members.user_id
 * ```
 */
export const demotePresidentsNotRenewing = new PreparedQuery<IDemotePresidentsNotRenewingParams,IDemotePresidentsNotRenewingResult>(demotePresidentsNotRenewingIR);


