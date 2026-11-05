/** Types generated for queries found in "server/models/NTHSRenewal/nths_renewal.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type stringArray = (string)[];

/** 'GetNthsRenewalState' parameters type */
export interface IGetNthsRenewalStateParams {
  groupId: string;
  schoolYearStartsOn: DateOrString;
  viewerId?: string | null | void;
}

/** 'GetNthsRenewalState' return type */
export interface IGetNthsRenewalStateResult {
  /** not_pii: When the chapter closed; null while open */
  closedAt: Date | null;
  /** not_pii */
  createdAt: Date;
  hasConfirmedPresident: boolean;
  hasManager: boolean;
  /** not_pii: true when the user accepted the presidency, false when they declined or stepped down, null before they answer */
  viewerAccepted: boolean | null;
}

/** 'GetNthsRenewalState' query type */
export interface IGetNthsRenewalStateQuery {
  params: IGetNthsRenewalStateParams;
  result: IGetNthsRenewalStateResult;
}

const getNthsRenewalStateIR: any = {"usedParamSet":{"groupId":true,"schoolYearStartsOn":true,"viewerId":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":422,"b":430},{"a":1850,"b":1858}]},{"name":"schoolYearStartsOn","required":true,"transform":{"type":"scalar"},"locs":[{"a":479,"b":498},{"a":1747,"b":1766}]},{"name":"viewerId","required":false,"transform":{"type":"scalar"},"locs":[{"a":1813,"b":1821}]}],"statement":"WITH current_member_candidates AS (\n    SELECT\n        candidates.accepted\n    FROM\n        nths_group_renewal_candidates candidates\n        JOIN nths_group_members members ON members.nths_group_id = candidates.nths_group_id\n            AND members.user_id = candidates.user_id\n            AND members.deactivated_at IS NULL\n        JOIN users ON users.id = candidates.user_id\n    WHERE\n        candidates.nths_group_id = :groupId!\n        AND candidates.school_year_starts_on = :schoolYearStartsOn!::date\n        AND users.deleted IS NOT TRUE\n)\nSELECT\n    nths_groups.created_at,\n    nths_groups.closed_at,\n    COALESCE((\n        SELECT\n            bool_or(accepted IS TRUE)\n        FROM current_member_candidates), FALSE) AS \"has_confirmed_president!\",\n    viewer_candidate.accepted AS viewer_accepted,\n    EXISTS (\n        SELECT\n            1\n        FROM\n            nths_group_members members\n            JOIN users ON users.id = members.user_id\n            JOIN nths_group_member_roles member_roles ON member_roles.nths_group_id = members.nths_group_id\n                AND member_roles.user_id = members.user_id\n            JOIN nths_group_roles roles ON roles.id = member_roles.role_id\n            JOIN volunteer_occupations occupations ON occupations.user_id = members.user_id\n        WHERE\n            members.nths_group_id = nths_groups.id\n            AND members.deactivated_at IS NULL\n            AND users.deleted IS NOT TRUE\n            AND roles.name = 'admin'\n            AND occupations.occupation = 'A high school student') AS \"has_manager!\"\nFROM\n    nths_groups\n    LEFT JOIN nths_group_renewal_candidates viewer_candidate ON viewer_candidate.nths_group_id = nths_groups.id\n        AND viewer_candidate.school_year_starts_on = :schoolYearStartsOn!::date\n        AND viewer_candidate.user_id = :viewerId\nWHERE\n    nths_groups.id = :groupId!"};

/**
 * Query generated from SQL:
 * ```
 * WITH current_member_candidates AS (
 *     SELECT
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
 *     viewer_candidate.accepted AS viewer_accepted,
 *     EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             nths_group_members members
 *             JOIN users ON users.id = members.user_id
 *             JOIN nths_group_member_roles member_roles ON member_roles.nths_group_id = members.nths_group_id
 *                 AND member_roles.user_id = members.user_id
 *             JOIN nths_group_roles roles ON roles.id = member_roles.role_id
 *             JOIN volunteer_occupations occupations ON occupations.user_id = members.user_id
 *         WHERE
 *             members.nths_group_id = nths_groups.id
 *             AND members.deactivated_at IS NULL
 *             AND users.deleted IS NOT TRUE
 *             AND roles.name = 'admin'
 *             AND occupations.occupation = 'A high school student') AS "has_manager!"
 * FROM
 *     nths_groups
 *     LEFT JOIN nths_group_renewal_candidates viewer_candidate ON viewer_candidate.nths_group_id = nths_groups.id
 *         AND viewer_candidate.school_year_starts_on = :schoolYearStartsOn!::date
 *         AND viewer_candidate.user_id = :viewerId
 * WHERE
 *     nths_groups.id = :groupId!
 * ```
 */
export const getNthsRenewalState = new PreparedQuery<IGetNthsRenewalStateParams,IGetNthsRenewalStateResult>(getNthsRenewalStateIR);


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


/** 'GetRenewalEmailMembers' parameters type */
export interface IGetRenewalEmailMembersParams {
  groupId: string;
  schoolYearStartsOn: DateOrString;
  sentSince: DateOrString;
  templateIds: stringArray;
}

/** 'GetRenewalEmailMembers' return type */
export interface IGetRenewalEmailMembersResult {
  /** not_pii: Human-readable name */
  chapterName: string;
  /** pii: User email address */
  email: string;
  /** pii: First name */
  firstName: string;
  isAdmin: boolean;
  isPresident: boolean;
  sentTemplateIds: stringArray;
  /** not_pii: Primary key */
  userId: string;
}

/** 'GetRenewalEmailMembers' query type */
export interface IGetRenewalEmailMembersQuery {
  params: IGetRenewalEmailMembersParams;
  result: IGetRenewalEmailMembersResult;
}

const getRenewalEmailMembersIR: any = {"usedParamSet":{"templateIds":true,"sentSince":true,"groupId":true,"schoolYearStartsOn":true},"params":[{"name":"templateIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":460,"b":472}]},{"name":"sentSince","required":true,"transform":{"type":"scalar"},"locs":[{"a":524,"b":534}]},{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":989,"b":997}]},{"name":"schoolYearStartsOn","required":true,"transform":{"type":"scalar"},"locs":[{"a":1070,"b":1089}]}],"statement":"SELECT\n    users.id AS user_id,\n    users.email,\n    users.first_name,\n    nths_groups.name AS chapter_name,\n    COALESCE(roles.name = 'admin', FALSE) AS \"is_admin!\",\n    COALESCE(members.title = 'President', FALSE) AS \"is_president!\",\n    ARRAY (\n        SELECT\n            notifications.email_template_id\n        FROM\n            notifications\n        WHERE\n            notifications.user_id = users.id\n            AND notifications.email_template_id = ANY (:templateIds!::text[])\n            AND notifications.sent_at >= :sentSince!) AS \"sent_template_ids!\"\nFROM\n    nths_groups\n    JOIN nths_group_members members ON members.nths_group_id = nths_groups.id\n        AND members.deactivated_at IS NULL\n    JOIN users ON users.id = members.user_id\n    LEFT JOIN nths_group_member_roles member_roles ON member_roles.nths_group_id = nths_groups.id\n        AND member_roles.user_id = users.id\n    LEFT JOIN nths_group_roles roles ON roles.id = member_roles.role_id\nWHERE\n    nths_groups.id = :groupId!\n    AND nths_groups.closed_at IS NULL\n    AND nths_groups.created_at < :schoolYearStartsOn!::date::timestamp AT TIME ZONE 'UTC'\n    AND users.deleted IS NOT TRUE\n    AND users.deactivated IS FALSE"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id AS user_id,
 *     users.email,
 *     users.first_name,
 *     nths_groups.name AS chapter_name,
 *     COALESCE(roles.name = 'admin', FALSE) AS "is_admin!",
 *     COALESCE(members.title = 'President', FALSE) AS "is_president!",
 *     ARRAY (
 *         SELECT
 *             notifications.email_template_id
 *         FROM
 *             notifications
 *         WHERE
 *             notifications.user_id = users.id
 *             AND notifications.email_template_id = ANY (:templateIds!::text[])
 *             AND notifications.sent_at >= :sentSince!) AS "sent_template_ids!"
 * FROM
 *     nths_groups
 *     JOIN nths_group_members members ON members.nths_group_id = nths_groups.id
 *         AND members.deactivated_at IS NULL
 *     JOIN users ON users.id = members.user_id
 *     LEFT JOIN nths_group_member_roles member_roles ON member_roles.nths_group_id = nths_groups.id
 *         AND member_roles.user_id = users.id
 *     LEFT JOIN nths_group_roles roles ON roles.id = member_roles.role_id
 * WHERE
 *     nths_groups.id = :groupId!
 *     AND nths_groups.closed_at IS NULL
 *     AND nths_groups.created_at < :schoolYearStartsOn!::date::timestamp AT TIME ZONE 'UTC'
 *     AND users.deleted IS NOT TRUE
 *     AND users.deactivated IS FALSE
 * ```
 */
export const getRenewalEmailMembers = new PreparedQuery<IGetRenewalEmailMembersParams,IGetRenewalEmailMembersResult>(getRenewalEmailMembersIR);


/** 'GetRenewalCycleChapters' parameters type */
export interface IGetRenewalCycleChaptersParams {
  closesAt: DateOrString;
  schoolYearStartsOn: DateOrString;
}

/** 'GetRenewalCycleChapters' return type */
export interface IGetRenewalCycleChaptersResult {
  /** not_pii: Primary key */
  id: string;
}

/** 'GetRenewalCycleChapters' query type */
export interface IGetRenewalCycleChaptersQuery {
  params: IGetRenewalCycleChaptersParams;
  result: IGetRenewalCycleChaptersResult;
}

const getRenewalCycleChaptersIR: any = {"usedParamSet":{"schoolYearStartsOn":true,"closesAt":true},"params":[{"name":"schoolYearStartsOn","required":true,"transform":{"type":"scalar"},"locs":[{"a":58,"b":77}]},{"name":"closesAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":166,"b":175}]}],"statement":"SELECT\n    id\nFROM\n    nths_groups\nWHERE\n    created_at < :schoolYearStartsOn!::date::timestamp AT TIME ZONE 'UTC'\n    AND (closed_at IS NULL\n        OR closed_at >= :closesAt!)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id
 * FROM
 *     nths_groups
 * WHERE
 *     created_at < :schoolYearStartsOn!::date::timestamp AT TIME ZONE 'UTC'
 *     AND (closed_at IS NULL
 *         OR closed_at >= :closesAt!)
 * ```
 */
export const getRenewalCycleChapters = new PreparedQuery<IGetRenewalCycleChaptersParams,IGetRenewalCycleChaptersResult>(getRenewalCycleChaptersIR);


/** 'GetChapterDueToRenewalClose' parameters type */
export interface IGetChapterDueToRenewalCloseParams {
  closesAt: DateOrString;
  groupId: string;
  schoolYearStartsOn: DateOrString;
}

/** 'GetChapterDueToRenewalClose' return type */
export interface IGetChapterDueToRenewalCloseResult {
  affectedUserIds: stringArray;
}

/** 'GetChapterDueToRenewalClose' query type */
export interface IGetChapterDueToRenewalCloseQuery {
  params: IGetChapterDueToRenewalCloseParams;
  result: IGetChapterDueToRenewalCloseResult;
}

const getChapterDueToRenewalCloseIR: any = {"usedParamSet":{"groupId":true,"schoolYearStartsOn":true,"closesAt":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":651,"b":659}]},{"name":"schoolYearStartsOn","required":true,"transform":{"type":"scalar"},"locs":[{"a":740,"b":759},{"a":1405,"b":1424}]},{"name":"closesAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":1202,"b":1211},{"a":1526,"b":1535}]}],"statement":"SELECT\n    ARRAY (\n        SELECT\n            members.user_id\n        FROM\n            nths_group_members members\n        WHERE\n            members.nths_group_id = nths_groups.id\n            AND (members.deactivated_at IS NULL\n                OR NOT EXISTS (\n                    SELECT\n                        1\n                    FROM\n                        nths_group_members current_members\n                    WHERE\n                        current_members.nths_group_id = nths_groups.id\n                        AND current_members.deactivated_at IS NULL))) AS \"affected_user_ids!\"\n    FROM\n        nths_groups\n    WHERE\n        nths_groups.id = :groupId!\n        AND nths_groups.closed_at IS NULL\n        AND nths_groups.created_at < :schoolYearStartsOn!::date::timestamp AT TIME ZONE 'UTC'\n        AND NOT EXISTS (\n            SELECT\n                1\n            FROM\n                nths_group_renewal_candidates candidates\n                JOIN nths_group_members members ON members.nths_group_id = candidates.nths_group_id\n                    AND members.user_id = candidates.user_id\n                    AND (members.deactivated_at IS NULL\n                        OR members.deactivated_at > :closesAt!)\n                JOIN users ON users.id = candidates.user_id\n            WHERE\n                candidates.nths_group_id = nths_groups.id\n                AND candidates.school_year_starts_on = :schoolYearStartsOn!::date\n                AND candidates.accepted IS TRUE\n                AND candidates.responded_at < :closesAt!\n                AND users.deleted IS NOT TRUE)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ARRAY (
 *         SELECT
 *             members.user_id
 *         FROM
 *             nths_group_members members
 *         WHERE
 *             members.nths_group_id = nths_groups.id
 *             AND (members.deactivated_at IS NULL
 *                 OR NOT EXISTS (
 *                     SELECT
 *                         1
 *                     FROM
 *                         nths_group_members current_members
 *                     WHERE
 *                         current_members.nths_group_id = nths_groups.id
 *                         AND current_members.deactivated_at IS NULL))) AS "affected_user_ids!"
 *     FROM
 *         nths_groups
 *     WHERE
 *         nths_groups.id = :groupId!
 *         AND nths_groups.closed_at IS NULL
 *         AND nths_groups.created_at < :schoolYearStartsOn!::date::timestamp AT TIME ZONE 'UTC'
 *         AND NOT EXISTS (
 *             SELECT
 *                 1
 *             FROM
 *                 nths_group_renewal_candidates candidates
 *                 JOIN nths_group_members members ON members.nths_group_id = candidates.nths_group_id
 *                     AND members.user_id = candidates.user_id
 *                     AND (members.deactivated_at IS NULL
 *                         OR members.deactivated_at > :closesAt!)
 *                 JOIN users ON users.id = candidates.user_id
 *             WHERE
 *                 candidates.nths_group_id = nths_groups.id
 *                 AND candidates.school_year_starts_on = :schoolYearStartsOn!::date
 *                 AND candidates.accepted IS TRUE
 *                 AND candidates.responded_at < :closesAt!
 *                 AND users.deleted IS NOT TRUE)
 * ```
 */
export const getChapterDueToRenewalClose = new PreparedQuery<IGetChapterDueToRenewalCloseParams,IGetChapterDueToRenewalCloseResult>(getChapterDueToRenewalCloseIR);


/** 'GetRenewalClosedEmailRecipients' parameters type */
export interface IGetRenewalClosedEmailRecipientsParams {
  closesAt: DateOrString;
  emailTemplateId: string;
  groupId: string;
  schoolYearStartsOn: DateOrString;
}

/** 'GetRenewalClosedEmailRecipients' return type */
export interface IGetRenewalClosedEmailRecipientsResult {
  /** not_pii: Human-readable name */
  chapterName: string;
  /** pii: User email address */
  email: string;
  /** pii: First name */
  firstName: string;
  /** not_pii: Primary key */
  userId: string;
}

/** 'GetRenewalClosedEmailRecipients' query type */
export interface IGetRenewalClosedEmailRecipientsQuery {
  params: IGetRenewalClosedEmailRecipientsParams;
  result: IGetRenewalClosedEmailRecipientsResult;
}

const getRenewalClosedEmailRecipientsIR: any = {"usedParamSet":{"groupId":true,"schoolYearStartsOn":true,"closesAt":true,"emailTemplateId":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":338,"b":346}]},{"name":"schoolYearStartsOn","required":true,"transform":{"type":"scalar"},"locs":[{"a":381,"b":400},{"a":1166,"b":1185}]},{"name":"closesAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":471,"b":480},{"a":965,"b":974},{"a":1279,"b":1288},{"a":1594,"b":1603}]},{"name":"emailTemplateId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1535,"b":1551}]}],"statement":"SELECT\n    users.id AS user_id,\n    users.email,\n    users.first_name,\n    nths_groups.name AS chapter_name\nFROM\n    nths_groups\n    JOIN nths_group_members members ON members.nths_group_id = nths_groups.id\n        AND members.deactivated_at = nths_groups.closed_at\n    JOIN users ON users.id = members.user_id\nWHERE\n    nths_groups.id = :groupId!\n    AND nths_groups.created_at < :schoolYearStartsOn!::date::timestamp AT TIME ZONE 'UTC'\n    AND nths_groups.closed_at >= :closesAt!\n    AND users.deleted IS NOT TRUE\n    AND users.deactivated IS FALSE\n    AND NOT EXISTS (\n        SELECT\n            1\n        FROM\n            nths_group_renewal_candidates candidates\n            JOIN nths_group_members acceptor_members ON acceptor_members.nths_group_id = candidates.nths_group_id\n                AND acceptor_members.user_id = candidates.user_id\n                AND (acceptor_members.deactivated_at IS NULL\n                    OR acceptor_members.deactivated_at > :closesAt!)\n            JOIN users acceptors ON acceptors.id = candidates.user_id\n        WHERE\n            candidates.nths_group_id = nths_groups.id\n            AND candidates.school_year_starts_on = :schoolYearStartsOn!::date\n            AND candidates.accepted IS TRUE\n            AND candidates.responded_at < :closesAt!\n            AND acceptors.deleted IS NOT TRUE)\n    AND NOT EXISTS (\n        SELECT\n            1\n        FROM\n            notifications\n        WHERE\n            notifications.user_id = users.id\n            AND notifications.email_template_id = :emailTemplateId!\n            AND notifications.sent_at >= :closesAt!)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id AS user_id,
 *     users.email,
 *     users.first_name,
 *     nths_groups.name AS chapter_name
 * FROM
 *     nths_groups
 *     JOIN nths_group_members members ON members.nths_group_id = nths_groups.id
 *         AND members.deactivated_at = nths_groups.closed_at
 *     JOIN users ON users.id = members.user_id
 * WHERE
 *     nths_groups.id = :groupId!
 *     AND nths_groups.created_at < :schoolYearStartsOn!::date::timestamp AT TIME ZONE 'UTC'
 *     AND nths_groups.closed_at >= :closesAt!
 *     AND users.deleted IS NOT TRUE
 *     AND users.deactivated IS FALSE
 *     AND NOT EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             nths_group_renewal_candidates candidates
 *             JOIN nths_group_members acceptor_members ON acceptor_members.nths_group_id = candidates.nths_group_id
 *                 AND acceptor_members.user_id = candidates.user_id
 *                 AND (acceptor_members.deactivated_at IS NULL
 *                     OR acceptor_members.deactivated_at > :closesAt!)
 *             JOIN users acceptors ON acceptors.id = candidates.user_id
 *         WHERE
 *             candidates.nths_group_id = nths_groups.id
 *             AND candidates.school_year_starts_on = :schoolYearStartsOn!::date
 *             AND candidates.accepted IS TRUE
 *             AND candidates.responded_at < :closesAt!
 *             AND acceptors.deleted IS NOT TRUE)
 *     AND NOT EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             notifications
 *         WHERE
 *             notifications.user_id = users.id
 *             AND notifications.email_template_id = :emailTemplateId!
 *             AND notifications.sent_at >= :closesAt!)
 * ```
 */
export const getRenewalClosedEmailRecipients = new PreparedQuery<IGetRenewalClosedEmailRecipientsParams,IGetRenewalClosedEmailRecipientsResult>(getRenewalClosedEmailRecipientsIR);


/** 'GetStaffClosedEmailRecipients' parameters type */
export interface IGetStaffClosedEmailRecipientsParams {
  emailTemplateId: string;
  groupId: string;
}

/** 'GetStaffClosedEmailRecipients' return type */
export interface IGetStaffClosedEmailRecipientsResult {
  /** not_pii: Human-readable name */
  chapterName: string;
  /** pii: User email address */
  email: string;
  /** pii: First name */
  firstName: string;
  /** not_pii: Primary key */
  userId: string;
}

/** 'GetStaffClosedEmailRecipients' query type */
export interface IGetStaffClosedEmailRecipientsQuery {
  params: IGetStaffClosedEmailRecipientsParams;
  result: IGetStaffClosedEmailRecipientsResult;
}

const getStaffClosedEmailRecipientsIR: any = {"usedParamSet":{"groupId":true,"emailTemplateId":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":338,"b":346}]},{"name":"emailTemplateId","required":true,"transform":{"type":"scalar"},"locs":[{"a":615,"b":631}]}],"statement":"SELECT\n    users.id AS user_id,\n    users.email,\n    users.first_name,\n    nths_groups.name AS chapter_name\nFROM\n    nths_groups\n    JOIN nths_group_members members ON members.nths_group_id = nths_groups.id\n        AND members.deactivated_at = nths_groups.closed_at\n    JOIN users ON users.id = members.user_id\nWHERE\n    nths_groups.id = :groupId!\n    AND users.deleted IS NOT TRUE\n    AND users.deactivated IS FALSE\n    AND NOT EXISTS (\n        SELECT\n            1\n        FROM\n            notifications\n        WHERE\n            notifications.user_id = users.id\n            AND notifications.email_template_id = :emailTemplateId!\n            AND notifications.sent_at >= nths_groups.closed_at)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id AS user_id,
 *     users.email,
 *     users.first_name,
 *     nths_groups.name AS chapter_name
 * FROM
 *     nths_groups
 *     JOIN nths_group_members members ON members.nths_group_id = nths_groups.id
 *         AND members.deactivated_at = nths_groups.closed_at
 *     JOIN users ON users.id = members.user_id
 * WHERE
 *     nths_groups.id = :groupId!
 *     AND users.deleted IS NOT TRUE
 *     AND users.deactivated IS FALSE
 *     AND NOT EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             notifications
 *         WHERE
 *             notifications.user_id = users.id
 *             AND notifications.email_template_id = :emailTemplateId!
 *             AND notifications.sent_at >= nths_groups.closed_at)
 * ```
 */
export const getStaffClosedEmailRecipients = new PreparedQuery<IGetStaffClosedEmailRecipientsParams,IGetStaffClosedEmailRecipientsResult>(getStaffClosedEmailRecipientsIR);


