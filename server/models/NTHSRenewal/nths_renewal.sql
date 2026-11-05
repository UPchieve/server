/* @name getNthsRenewalState */
WITH current_member_candidates AS (
    SELECT
        candidates.user_id
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
    EXISTS (
        SELECT
            1
        FROM
            current_member_candidates) AS "has_confirmed_president!",
    (viewer_candidate.user_id IS NOT NULL) AS "viewer_accepted!",
    EXISTS (
        SELECT
            1
        FROM
            nths_group_members members
            JOIN users ON users.id = members.user_id
            JOIN nths_group_member_roles member_roles ON member_roles.nths_group_id = members.nths_group_id
                AND member_roles.user_id = members.user_id
            JOIN nths_group_roles roles ON roles.id = member_roles.role_id
            JOIN volunteer_occupations occupations ON occupations.user_id = members.user_id
        WHERE
            members.nths_group_id = nths_groups.id
            AND members.deactivated_at IS NULL
            AND users.deleted IS NOT TRUE
            AND roles.name = 'admin'
            AND occupations.occupation = 'A high school student') AS "has_manager!"
FROM
    nths_groups
    LEFT JOIN nths_group_renewal_candidates viewer_candidate ON viewer_candidate.nths_group_id = nths_groups.id
        AND viewer_candidate.school_year_starts_on = :schoolYearStartsOn!::date
        AND viewer_candidate.user_id = :viewerId
WHERE
    nths_groups.id = :groupId!;


/* @name upsertRenewalAnswer */
INSERT INTO nths_group_renewal_candidates (nths_group_id, school_year_starts_on, user_id, commitments)
    VALUES (:groupId!, :schoolYearStartsOn!::date, :userId!, :commitments)
ON CONFLICT ON CONSTRAINT nths_group_renewal_candidates_group_school_year_user_key
    DO UPDATE SET
        commitments = EXCLUDED.commitments, updated_at = NOW();


/* @name getRenewalEmailMembers */
SELECT
    users.id AS user_id,
    users.email,
    users.first_name,
    nths_groups.name AS chapter_name,
    COALESCE(roles.name = 'admin', FALSE) AS "is_admin!",
    COALESCE(members.title = 'President', FALSE) AS "is_president!",
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
WHERE
    nths_groups.id = :groupId!
    AND nths_groups.closed_at IS NULL
    AND nths_groups.created_at < :schoolYearStartsOn!::date::timestamp AT TIME ZONE 'UTC'
    AND users.deleted IS NOT TRUE
    AND users.deactivated IS FALSE;


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
                AND candidates.created_at < :closesAt!
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
            AND candidates.created_at < :closesAt!
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


/* @name getStaffClosedEmailRecipients */
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
    AND users.deleted IS NOT TRUE
    AND users.deactivated IS FALSE
    AND NOT EXISTS (
        SELECT
            1
        FROM
            notifications
        WHERE
            notifications.user_id = users.id
            AND notifications.email_template_id = :emailTemplateId!
            AND notifications.sent_at >= nths_groups.closed_at);

