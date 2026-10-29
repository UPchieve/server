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

