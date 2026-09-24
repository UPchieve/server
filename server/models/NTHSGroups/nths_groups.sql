/* @name getGroupsByUser */
SELECT
    ngm.title AS member_title,
    ngm.joined_at,
    ng.id AS group_id,
    ng.name AS group_name,
    ng.key AS group_key,
    ng.invite_code,
    roles.name AS role_name,
    aff_statuses.name AS school_affiliation_status,
    aff.school_id IS NOT NULL AS has_school_on_record
FROM
    nths_group_members ngm
    INNER JOIN nths_groups ng ON ng.id = ngm.nths_group_id
    INNER JOIN nths_group_member_roles member_roles ON member_roles.user_id = :userId!
        AND member_roles.nths_group_id = ng.id
    INNER JOIN nths_group_roles roles ON roles.id = member_roles.role_id
    LEFT JOIN nths_group_school_affiliation aff ON aff.nths_group_id = ngm.nths_group_id
    LEFT JOIN nths_school_affiliation_statuses aff_statuses ON aff_statuses.id = aff.nths_school_affiliation_status_id
WHERE
    ngm.user_id = :userId!
    AND ngm.deactivated_at IS NULL;


/* @name getInviteCodeForGroup */
SELECT
    invite_code
FROM
    nths_groups
WHERE
    id = :id!;


/* @name getGroupByInviteCode */
SELECT
    id,
    name,
    KEY,
    created_at
FROM
    nths_groups
WHERE
    invite_code = :inviteCode!;


/* @name getGroupById */
SELECT
    id,
    name,
    KEY,
    created_at,
    invite_code
FROM
    nths_groups
WHERE
    id = :groupId!;


/* Leaving a chapter keeps the nths_group_member_roles row, so without the
 nths_group_members join a departed admin still reads as an admin contact. */
/* @name getNTHSGroupAdminsContactInfo */
SELECT
    u.id AS user_id,
    u.first_name,
    u.email,
    g.name AS chapter_name,
    :groupId!::uuid AS nths_group_id
FROM
    nths_group_member_roles mr
    JOIN nths_group_roles roles ON roles.id = mr.role_id
    JOIN nths_groups g ON g.id = mr.nths_group_id
    JOIN users u ON U.id = mr.user_id
    JOIN nths_group_members ngm ON ngm.user_id = mr.user_id
        AND ngm.nths_group_id = mr.nths_group_id
        AND ngm.deactivated_at IS NULL
WHERE
    mr.nths_group_id = :groupId!::uuid
    AND roles.name = 'admin'
    AND u.deleted IS NOT TRUE;


/* @name getAdvisorContactInfo */
SELECT
    first_name,
    last_name,
    email,
    nths_group_id,
    g.name AS chapter_name
FROM
    nths_advisors
    JOIN nths_groups g ON g.id = nths_advisors.nths_group_id
WHERE
    nths_group_id = :groupId!;


/* @name joinGroupById */
INSERT INTO nths_group_members ("nths_group_id", "user_id", "title")
    VALUES (:groupId!, :userId!, :title!)
RETURNING
    *;


/* @name insertNthsGroupMemberRole */
INSERT INTO nths_group_member_roles (user_id, nths_group_id, role_id)
SELECT
    :userId!,
    :nthsGroupId!,
    roles.id
FROM
    nths_group_roles roles
WHERE
    roles.name = :roleName!
RETURNING
    *;


/* @name upsertNthsGroupMemberRole */
INSERT INTO nths_group_member_roles (user_id, nths_group_id, role_id)
SELECT
    :userId!,
    :nthsGroupId!,
    roles.id
FROM
    nths_group_roles roles
WHERE
    roles.name = :roleName!
ON CONFLICT (user_id,
    nths_group_id)
    DO UPDATE SET
        role_id = EXCLUDED.role_id,
        updated_at = NOW()
    RETURNING
        *,
        :roleName AS role_name;


/* Leaving a chapter keeps the nths_group_member_roles row, so without the
 deactivated_at predicate a departed admin still reads as an admin. */
/* @name getActiveGroupMember */
SELECT
    m.*,
    roles.name AS role_name
FROM
    nths_group_members m
    JOIN nths_group_member_roles member_roles ON member_roles.user_id = m.user_id
        AND member_roles.nths_group_id = m.nths_group_id
    JOIN nths_group_roles roles ON roles.id = member_roles.role_id
WHERE
    m.user_id = :userId!
    AND m.nths_group_id = :nthsGroupId!
    AND m.deactivated_at IS NULL;


/* @name getGroupMembers */
SELECT
    ngm.*,
    roles.name AS role_name,
    LEFT (users.last_name,
        1) AS last_initial,
    users.first_name,
    users.deleted IS TRUE AS deleted
FROM
    nths_group_members ngm
    JOIN nths_group_member_roles member_roles ON member_roles.nths_group_id = :groupId!
        AND member_roles.user_id = ngm.user_id
    JOIN nths_group_roles roles ON roles.id = member_roles.role_id
    JOIN users ON users.id = ngm.user_id
WHERE
    ngm.nths_group_id = :groupId!
    AND (:includeDeactivated IS TRUE
        OR ngm.deactivated_at IS NULL)
    AND (:excludeClosedAccounts IS NOT TRUE
        OR users.deleted IS NOT TRUE);


/* @name groupsCount */
SELECT
    count(*)
FROM
    nths_groups;


/* @name createGroup */
INSERT INTO nths_groups (id, invite_code, name, KEY)
    VALUES (generate_ulid (), :inviteCode!, :name!, :key!)
RETURNING
    *;


/* Removing someone who already left keeps their original departure time, which
 bounds the sessions their chapter counts. */
/* @name deactivateGroupMember */
UPDATE
    nths_group_members
SET
    deactivated_at = NOW(),
    updated_at = NOW()
WHERE
    user_id = :userId!
    AND nths_group_id = :groupId!
    AND deactivated_at IS NULL;


/* @name updateGroupName */
UPDATE
    nths_groups
SET
    name = :name!,
    updated_at = NOW()
WHERE
    id = :groupId!
RETURNING
    id,
    name,
    KEY,
    created_at,
    invite_code;


/* @name insertNthsGroupAction */
INSERT INTO nths_group_actions (nths_group_id, nths_action_id)
SELECT
    :groupId!,
    actions.id
FROM
    nths_actions actions
WHERE
    actions.name = :actionName!
RETURNING
    id,
    nths_group_id AS group_id,
    nths_action_id AS action_id,
    created_at,
    :actionName! AS action_name;


/* No unique_action_per_group constraint since 20260213143219, so an action
 recorded twice has two rows and this deletes both. */
/* @name deleteNthsGroupAction */
DELETE FROM nths_group_actions
WHERE nths_group_id = :groupId!
    AND nths_action_id IN (
        SELECT
            id
        FROM
            nths_actions
        WHERE
            name = :actionName!);


/* @name getAllNthsGroupActionsByGroupId */
SELECT
    nga.id,
    nga.nths_group_id AS group_id,
    nga.nths_action_id AS action_id,
    nga.created_at,
    actions.name AS action_name
FROM
    nths_group_actions nga
    JOIN nths_actions actions ON actions.id = nga.nths_action_id
WHERE
    nths_group_id = :groupId!;


/* @name getNthsActions */
SELECT
    actions.id,
    actions.name
FROM
    nths_actions actions;


/* @name upsertSchoolAffiliationStatus */
INSERT INTO nths_group_school_affiliation (nths_group_id, nths_school_affiliation_status_id)
SELECT
    :nthsGroupId!,
    statuses.id
FROM
    nths_school_affiliation_statuses statuses
WHERE
    statuses.name = :status!
ON CONFLICT (nths_group_id)
    DO UPDATE SET
        nths_school_affiliation_status_id = EXCLUDED.nths_school_affiliation_status_id,
        updated_at = NOW()
    RETURNING
        *,
        :status! AS status;


/* @name insertSchoolAffiliation */
INSERT INTO nths_group_school_affiliation (nths_group_id, nths_school_affiliation_status_id, school_id)
SELECT
    :nthsGroupId!,
    statuses.id,
    :schoolId!
FROM
    nths_school_affiliation_statuses statuses
WHERE
    statuses.name = :status!
RETURNING
    nths_group_id;


/* @name insertNthsAdvisor */
INSERT INTO nths_advisors (id, nths_group_id, first_name, last_name, email, phone, phone_extension, title, school_id)
    VALUES (generate_ulid (), :nthsGroupId!, :firstName!, :lastName!, :email!, :phone, :phoneExtension, :title!, :schoolId)
RETURNING
    *;


/* Uses a COALESCE rather than a plain assignment to prevent "moving" a chapter
 to another school than the one it was already associated with. Any mismatch is
 reported from here for use by the calling method to respond appropriately */
/* @name addSchoolToSchoolAffiliation */
UPDATE
    nths_group_school_affiliation
SET
    school_id = COALESCE(school_id, :schoolId),
    updated_at = NOW()
WHERE
    nths_group_id = :nthsGroupId!
RETURNING
    school_id,
    :schoolId::uuid IS NOT NULL
    AND school_id IS DISTINCT FROM :schoolId AS mismatched;


/* @name getLatestNthsChapterStatus */
WITH ranked_by_timestamp AS (
    SELECT
        nths_group_id AS group_id,
        nths_chapter_status_id,
        created_at,
        ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
    FROM
        nths_chapters_statuses
    WHERE
        nths_group_id = :groupId!
    LIMIT 1
)
SELECT
    cs.group_id,
    cs.nths_chapter_status_id AS status_id,
    cs.created_at,
    statuses.name AS status_name
FROM
    ranked_by_timestamp cs
    JOIN nths_chapter_statuses statuses ON statuses.id = cs.nths_chapter_status_id
WHERE
    cs.rn = 1;


/* @name insertStatusForNthsChapter */
INSERT INTO nths_chapters_statuses (nths_group_id, nths_chapter_status_id)
SELECT
    :groupId!,
    statuses.id
FROM
    nths_chapter_statuses statuses
WHERE
    statuses.name = :statusName!
RETURNING
    nths_group_id AS group_id,
    nths_chapter_status_id AS status_id,
    created_at,
    :statusName! AS status_name;


/* @name getAllNthsGroupsWithStatus */
SELECT
    groups.id AS group_id,
    chapter_status.nths_chapter_status_id AS status_id,
    chapter_statuses.name AS status_name,
    school_aff.nths_school_affiliation_status_id AS school_affiliation_status_id,
    school_aff_statuses.name AS school_affiliation_status_name
FROM
    nths_groups GROUPS
    LEFT JOIN nths_chapters_statuses chapter_status ON chapter_status.nths_group_id = groups.id
    LEFT JOIN nths_chapter_statuses chapter_statuses ON chapter_statuses.id = chapter_status.nths_chapter_status_id
    LEFT JOIN nths_group_school_affiliation school_aff ON school_aff.nths_group_id = groups.id
    LEFT JOIN nths_school_affiliation_statuses school_aff_statuses ON school_aff_statuses.id = school_aff.nths_school_affiliation_status_id;


/* Hours stay counted for a member later banned, deleted or departed, since
 dropping a banned member would disclose the ban to their peers.
 users.deactivated is the notifications opt-out, so members_tutoring_this_year
 does not check it. The official-status job does not yet apply the same
 counted-session and test-student filters as this query. */
/* @name getNthsChapterImpact */
SELECT
    count(*) FILTER (WHERE s.volunteer_joined_at >= :startsAt!
        AND s.volunteer_joined_at < :endsAt!)::int AS sessions_completed_this_year,
    count(*)::int AS sessions_completed_all_time,
    count(DISTINCT s.student_id) FILTER (WHERE s.volunteer_joined_at >= :startsAt!
        AND s.volunteer_joined_at < :endsAt!)::int AS students_helped_this_year,
    count(DISTINCT s.student_id)::int AS students_helped_all_time,
    round(COALESCE(sum(s.time_tutored) FILTER (WHERE s.volunteer_joined_at >= :startsAt!
                AND s.volunteer_joined_at < :endsAt!), 0) / 3600000::numeric, 2)::float AS hours_tutored_this_year,
    round(COALESCE(sum(s.time_tutored), 0) / 3600000::numeric, 2)::float AS hours_tutored_all_time,
    count(DISTINCT m.user_id) FILTER (WHERE s.volunteer_joined_at >= :startsAt!
        AND s.volunteer_joined_at < :endsAt!
        AND m.deactivated_at IS NULL
        AND u.deleted IS NOT TRUE)::int AS members_tutoring_this_year
FROM
    nths_group_members m
    JOIN users u ON u.id = m.user_id
    JOIN sessions s ON s.volunteer_id = m.user_id
        AND s.ended_at IS NOT NULL
        AND s.time_tutored > :minSessionLength!::int
        AND s.volunteer_joined_at >= m.joined_at
        AND (m.deactivated_at IS NULL
            OR s.volunteer_joined_at < m.deactivated_at)
    JOIN users student ON student.id = s.student_id
        AND student.test_user IS FALSE
WHERE
    m.nths_group_id = :groupId!
    AND u.test_user IS FALSE;


/* users.deactivated is the notifications opt-out, so it leaves account_closed
 false. Some members have no volunteer_profiles row. */
/* @name getNthsChapterRoster */
SELECT
    m.user_id,
    m.title,
    m.joined_at,
    u.first_name,
    LEFT (u.last_name,
        1) AS last_initial,
    roles.name AS role_name,
    COALESCE(vp.onboarded, FALSE) AS training_complete,
    COALESCE(vp.approved, FALSE) AS safety_approved,
    u.deleted IS TRUE AS account_closed,
    act.sessions_this_year,
    act.hours_this_year,
    act.hours_this_week,
    act.hours_last_two_weeks,
    act.hours_this_month,
    act.last_active_at
FROM
    nths_group_members m
    JOIN users u ON u.id = m.user_id
    JOIN nths_group_member_roles member_roles ON member_roles.user_id = m.user_id
        AND member_roles.nths_group_id = m.nths_group_id
    JOIN nths_group_roles roles ON roles.id = member_roles.role_id
    LEFT JOIN volunteer_profiles vp ON vp.user_id = m.user_id
    LEFT JOIN LATERAL (
        SELECT
            count(*) FILTER (WHERE s.volunteer_joined_at >= :startsAt!
                    AND s.volunteer_joined_at < :endsAt!)::int AS sessions_this_year,
                round(COALESCE(sum(s.time_tutored) FILTER (WHERE s.volunteer_joined_at >= :startsAt!
                            AND s.volunteer_joined_at < :endsAt!), 0) / 3600000::numeric, 2)::float AS hours_this_year,
                round(COALESCE(sum(s.time_tutored) FILTER (WHERE s.volunteer_joined_at >= :weekStartsAt!
                            AND s.volunteer_joined_at < :periodEndsAt!), 0) / 3600000::numeric, 2)::float AS hours_this_week,
                round(COALESCE(sum(s.time_tutored) FILTER (WHERE s.volunteer_joined_at >= :lastTwoWeeksStartsAt!
                            AND s.volunteer_joined_at < :periodEndsAt!), 0) / 3600000::numeric, 2)::float AS hours_last_two_weeks,
                round(COALESCE(sum(s.time_tutored) FILTER (WHERE s.volunteer_joined_at >= :monthStartsAt!
                            AND s.volunteer_joined_at < :periodEndsAt!), 0) / 3600000::numeric, 2)::float AS hours_this_month,
                max(s.volunteer_joined_at) AS last_active_at
            FROM
                sessions s
            JOIN users student ON student.id = s.student_id
                AND student.test_user IS FALSE
        WHERE
            s.volunteer_id = m.user_id
            AND s.ended_at IS NOT NULL
            AND s.time_tutored > :minSessionLength!::int
            AND s.volunteer_joined_at >= m.joined_at
            AND (m.deactivated_at IS NULL
                OR s.volunteer_joined_at < m.deactivated_at)) act ON TRUE
WHERE
    m.nths_group_id = :groupId!
    AND m.deactivated_at IS NULL
    AND u.test_user IS FALSE
ORDER BY
    u.first_name,
    m.user_id;


/* Leaves out the president, who recognizes the top tutor each month. A
 demoted founder keeps the 'President' title, so the president is the titled
 member who still holds the admin role. */
/* @name getNthsChapterTopTutor */
SELECT
    m.user_id,
    u.first_name,
    LEFT (u.last_name,
        1) AS last_initial,
    count(*)::int AS sessions_completed,
    round(sum(s.time_tutored) / 3600000::numeric, 2)::float AS hours_tutored
FROM
    nths_group_members m
    JOIN users u ON u.id = m.user_id
    JOIN sessions s ON s.volunteer_id = m.user_id
        AND s.ended_at IS NOT NULL
        AND s.time_tutored > :minSessionLength!::int
        AND s.volunteer_joined_at >= m.joined_at
        AND (m.deactivated_at IS NULL
            OR s.volunteer_joined_at < m.deactivated_at)
        AND s.volunteer_joined_at >= :startsAt!
        AND s.volunteer_joined_at < :endsAt!
    JOIN users student ON student.id = s.student_id
        AND student.test_user IS FALSE
WHERE
    m.nths_group_id = :groupId!
    AND m.deactivated_at IS NULL
    AND (m.title IS DISTINCT FROM 'President'
        OR NOT EXISTS (
            SELECT
                1
            FROM
                nths_group_member_roles member_roles
                JOIN nths_group_roles roles ON roles.id = member_roles.role_id
            WHERE
                member_roles.user_id = m.user_id
                AND member_roles.nths_group_id = m.nths_group_id
                AND roles.name = 'admin'))
    AND u.test_user IS FALSE
    AND u.deleted IS NOT TRUE
GROUP BY
    m.user_id,
    u.first_name,
    u.last_name
ORDER BY
    sum(s.time_tutored) DESC,
    sessions_completed DESC,
    m.user_id
LIMIT 1;


/* @name getNthsChapterMemberHoursTutored */
SELECT
    round(COALESCE(sum(s.time_tutored), 0) / 3600000::numeric, 2)::float AS hours_tutored
FROM
    nths_group_members m
    JOIN sessions s ON s.volunteer_id = m.user_id
        AND s.ended_at IS NOT NULL
        AND s.time_tutored > :minSessionLength!::int
        AND s.volunteer_joined_at >= m.joined_at
        AND (m.deactivated_at IS NULL
            OR s.volunteer_joined_at < m.deactivated_at)
        AND s.volunteer_joined_at >= :startsAt!
        AND s.volunteer_joined_at < :endsAt!
    JOIN users student ON student.id = s.student_id
        AND student.test_user IS FALSE
WHERE
    m.nths_group_id = :groupId!
    AND m.user_id = :userId!;

