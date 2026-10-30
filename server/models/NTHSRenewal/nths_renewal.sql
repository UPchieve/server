/* @name getNthsRenewalState */
WITH current_member_candidates AS (
    SELECT
        candidates.named_at,
        candidates.accepted
    FROM
        nths_group_renewal_candidates candidates
        JOIN nths_group_members members ON members.nths_group_id = candidates.nths_group_id
            AND members.user_id = candidates.user_id
            AND members.deactivated_at IS NULL
        JOIN users ON users.id = candidates.user_id
    WHERE
        candidates.nths_group_id = :groupId!
        AND candidates.school_year_starts_on = :schoolYearStartsOn!::date
        AND users.deleted IS NOT TRUE
)
SELECT
    nths_groups.created_at,
    nths_groups.closed_at,
    COALESCE((
        SELECT
            bool_or(accepted IS TRUE)
        FROM current_member_candidates), FALSE) AS "has_confirmed_president!",
    COALESCE((
        SELECT
            bool_or(named_at IS NOT NULL
                AND accepted IS DISTINCT FROM FALSE)
        FROM current_member_candidates), FALSE) AS "has_named_successor!",
    viewer_candidate.named_at AS viewer_named_at,
    viewer_candidate.accepted AS viewer_accepted
FROM
    nths_groups
    LEFT JOIN nths_group_renewal_candidates viewer_candidate ON viewer_candidate.nths_group_id = nths_groups.id
        AND viewer_candidate.school_year_starts_on = :schoolYearStartsOn!::date
        AND viewer_candidate.user_id = :viewerId!
WHERE
    nths_groups.id = :groupId!;


/* @name getRenewalSuccessors */
SELECT
    candidates.user_id,
    users.first_name,
    LEFT (users.last_name,
        1) AS last_initial,
    candidates.accepted,
    namers.first_name AS "named_by_first_name?",
    LEFT (namers.last_name,
        1) AS named_by_last_initial
FROM
    nths_group_renewal_candidates candidates
    JOIN nths_group_members members ON members.nths_group_id = candidates.nths_group_id
        AND members.user_id = candidates.user_id
        AND members.deactivated_at IS NULL
    JOIN users ON users.id = candidates.user_id
    LEFT JOIN users namers ON namers.id = candidates.named_by
        AND namers.deleted IS NOT TRUE
WHERE
    candidates.nths_group_id = :groupId!
    AND candidates.school_year_starts_on = :schoolYearStartsOn!::date
    AND users.deleted IS NOT TRUE;


/* @name insertRenewalNominations */
INSERT INTO nths_group_renewal_candidates (nths_group_id, school_year_starts_on, user_id, named_at, named_by)
SELECT
    :groupId!,
    :schoolYearStartsOn!::date,
    nominee_id,
    NOW(),
    :namedBy!
FROM
    unnest(:userIds!::uuid[]) AS nominee_id;


/* @name deleteUnansweredRenewalNominations */
DELETE FROM nths_group_renewal_candidates
WHERE nths_group_id = :groupId!
    AND school_year_starts_on = :schoolYearStartsOn!::date
    AND user_id = ANY (:userIds!)
    AND accepted IS NULL;


/* Keeps named_at and named_by on a named member's row. */
/* @name upsertRenewalAnswer */
INSERT INTO nths_group_renewal_candidates (nths_group_id, school_year_starts_on, user_id, accepted, responded_at, commitments)
    VALUES (:groupId!, :schoolYearStartsOn!::date, :userId!, :accepted!, NOW(), :commitments)
ON CONFLICT ON CONSTRAINT nths_group_renewal_candidates_group_school_year_user_key
    DO UPDATE SET
        accepted = EXCLUDED.accepted, responded_at = EXCLUDED.responded_at, commitments = EXCLUDED.commitments, updated_at = NOW();


/* @name demotePresidentsNotRenewing */
UPDATE
    nths_group_members members
SET
    title = 'Member',
    updated_at = NOW()
FROM
    users
WHERE
    users.id = members.user_id
    AND users.deleted IS NOT TRUE
    AND members.nths_group_id = :groupId!
    AND members.deactivated_at IS NULL
    AND members.title = 'President'
    AND NOT EXISTS (
        SELECT
            1
        FROM
            nths_group_renewal_candidates candidates
        WHERE
            candidates.nths_group_id = members.nths_group_id
            AND candidates.user_id = members.user_id
            AND candidates.school_year_starts_on = :schoolYearStartsOn!::date
            AND (candidates.accepted IS TRUE
                OR (candidates.named_at IS NOT NULL
                    AND candidates.accepted IS NULL)))
RETURNING
    members.user_id;


/* @name getRenewalEmailMembers */
WITH current_candidates AS (
    SELECT
        candidates.nths_group_id,
        candidates.user_id,
        candidates.named_at,
        candidates.named_by,
        candidates.accepted
    FROM
        nths_group_renewal_candidates candidates
        JOIN nths_group_members members ON members.nths_group_id = candidates.nths_group_id
            AND members.user_id = candidates.user_id
            AND members.deactivated_at IS NULL
        JOIN users ON users.id = candidates.user_id
    WHERE
        candidates.nths_group_id = :groupId!
        AND candidates.school_year_starts_on = :schoolYearStartsOn!::date
        AND users.deleted IS NOT TRUE
)
SELECT
    users.id AS user_id,
    users.email,
    users.first_name,
    nths_groups.name AS chapter_name,
    COALESCE(roles.name = 'admin', FALSE) AS "is_admin!",
    EXISTS (
        SELECT
            1
        FROM
            current_candidates
        WHERE
            current_candidates.nths_group_id = nths_groups.id
            AND current_candidates.accepted IS TRUE) AS "chapter_confirmed!",
    EXISTS (
        SELECT
            1
        FROM
            current_candidates
        WHERE
            current_candidates.nths_group_id = nths_groups.id
            AND current_candidates.named_at IS NOT NULL
            AND current_candidates.accepted IS DISTINCT FROM FALSE) AS "chapter_has_named!",
    COALESCE(own.named_at IS NOT NULL
        AND own.accepted IS NULL, FALSE) AS "named_unanswered!",
    COALESCE(own.named_by = users.id, FALSE) AS "self_named!",
    ARRAY (
        SELECT
            notifications.email_template_id
        FROM
            notifications
        WHERE
            notifications.user_id = users.id
            AND notifications.email_template_id = ANY (:templateIds!::text[])
            AND notifications.sent_at >= :sentSince!) AS "sent_template_ids!"
FROM
    nths_groups
    JOIN nths_group_members members ON members.nths_group_id = nths_groups.id
        AND members.deactivated_at IS NULL
    JOIN users ON users.id = members.user_id
    LEFT JOIN nths_group_member_roles member_roles ON member_roles.nths_group_id = nths_groups.id
        AND member_roles.user_id = users.id
    LEFT JOIN nths_group_roles roles ON roles.id = member_roles.role_id
    LEFT JOIN current_candidates own ON own.nths_group_id = nths_groups.id
        AND own.user_id = users.id
WHERE
    nths_groups.id = :groupId!
    AND nths_groups.closed_at IS NULL
    AND nths_groups.created_at < :schoolYearStartsOn!::date::timestamp AT TIME ZONE 'UTC'
    AND users.deleted IS NOT TRUE
    AND users.deactivated IS FALSE
    AND users.ban_type IS NULL;


/* @name getRenewalCycleChapters */
SELECT
    id
FROM
    nths_groups
WHERE
    created_at < :schoolYearStartsOn!::date::timestamp AT TIME ZONE 'UTC'
    AND (closed_at IS NULL
        OR closed_at >= :closesAt!);


/* @name getChapterDueToRenewalClose */
SELECT
    ARRAY (
        SELECT
            members.user_id
        FROM
            nths_group_members members
        WHERE
            members.nths_group_id = nths_groups.id
            AND (members.deactivated_at IS NULL
                OR NOT EXISTS (
                    SELECT
                        1
                    FROM
                        nths_group_members current_members
                    WHERE
                        current_members.nths_group_id = nths_groups.id
                        AND current_members.deactivated_at IS NULL))) AS "affected_user_ids!"
    FROM
        nths_groups
    WHERE
        nths_groups.id = :groupId!
        AND nths_groups.closed_at IS NULL
        AND nths_groups.created_at < :schoolYearStartsOn!::date::timestamp AT TIME ZONE 'UTC'
        AND NOT EXISTS (
            SELECT
                1
            FROM
                nths_group_renewal_candidates candidates
                JOIN nths_group_members members ON members.nths_group_id = candidates.nths_group_id
                    AND members.user_id = candidates.user_id
                    AND (members.deactivated_at IS NULL
                        OR members.deactivated_at > :closesAt!)
                JOIN users ON users.id = candidates.user_id
            WHERE
                candidates.nths_group_id = nths_groups.id
                AND candidates.school_year_starts_on = :schoolYearStartsOn!::date
                AND candidates.accepted IS TRUE
                AND candidates.responded_at < :closesAt!
                AND users.deleted IS NOT TRUE);


/* @name getRenewalClosedEmailRecipients */
SELECT
    users.id AS user_id,
    users.email,
    users.first_name,
    nths_groups.name AS chapter_name
FROM
    nths_groups
    JOIN nths_group_members members ON members.nths_group_id = nths_groups.id
        AND members.deactivated_at = nths_groups.closed_at
    JOIN users ON users.id = members.user_id
WHERE
    nths_groups.id = :groupId!
    AND nths_groups.created_at < :schoolYearStartsOn!::date::timestamp AT TIME ZONE 'UTC'
    AND nths_groups.closed_at >= :closesAt!
    AND users.deleted IS NOT TRUE
    AND users.deactivated IS FALSE
    AND NOT EXISTS (
        SELECT
            1
        FROM
            nths_group_renewal_candidates candidates
            JOIN nths_group_members acceptor_members ON acceptor_members.nths_group_id = candidates.nths_group_id
                AND acceptor_members.user_id = candidates.user_id
                AND (acceptor_members.deactivated_at IS NULL
                    OR acceptor_members.deactivated_at > :closesAt!)
            JOIN users acceptors ON acceptors.id = candidates.user_id
        WHERE
            candidates.nths_group_id = nths_groups.id
            AND candidates.school_year_starts_on = :schoolYearStartsOn!::date
            AND candidates.accepted IS TRUE
            AND candidates.responded_at < :closesAt!
            AND acceptors.deleted IS NOT TRUE)
    AND NOT EXISTS (
        SELECT
            1
        FROM
            notifications
        WHERE
            notifications.user_id = users.id
            AND notifications.email_template_id = :emailTemplateId!
            AND notifications.sent_at >= :closesAt!);

