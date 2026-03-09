/* @name getGroupsByUser */
SELECT
    ngm.title AS member_title,
    ngm.joined_at,
    ng.id AS group_id,
    ng.name AS group_name,
    ng.key AS group_key,
    ng.invite_code,
    roles.name AS role_name,
    aff_statuses.name AS school_affiliation_status
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


/* @name getNTHSGroupAdminsContactInfo */
SELECT
    u.id AS user_id,
    u.first_name,
    u.email,
    :groupId!::uuid AS nths_group_id
FROM
    nths_group_member_roles mr
    JOIN nths_group_roles roles ON roles.id = mr.role_id
    JOIN users u ON U.id = mr.user_id
WHERE
    mr.nths_group_id = :groupId!::uuid
    AND roles.name = 'admin';


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


/* @name getGroupMember */
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
    AND m.nths_group_id = :nthsGroupId!;


/* @name getGroupMembers */
SELECT
    ngm.*,
    roles.name AS role_name,
    LEFT (users.last_name,
        1) AS last_initial,
    users.first_name
FROM
    nths_group_members ngm
    JOIN nths_group_member_roles member_roles ON member_roles.nths_group_id = :groupId!
        AND member_roles.user_id = ngm.user_id
    JOIN nths_group_roles roles ON roles.id = member_roles.role_id
    JOIN users ON users.id = ngm.user_id
WHERE
    ngm.nths_group_id = :groupId!
    AND (:includeDeactivated IS TRUE
        OR ngm.deactivated_at IS NULL);


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


/* @name deactivateGroupMember */
UPDATE
    nths_group_members
SET
    deactivated_at = NOW(),
    updated_at = NOW()
WHERE
    user_id = :userId!
    AND nths_group_id = :groupId!;


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


/* @name insertNthsAdvisor */
INSERT INTO nths_advisors (id, nths_group_id, first_name, last_name, email, phone, phone_extension, title, school_id)
    VALUES (generate_ulid (), :nthsGroupId!, :firstName!, :lastName!, :email!, :phone, :phoneExtension, :title!, :schoolId!)
RETURNING
    *;


/* @name addSchoolToSchoolAffiliation */
UPDATE
    nths_group_school_affiliation
SET
    school_id = :schoolId!,
    updated_at = NOW()
WHERE
    nths_group_id = :nthsGroupId!;


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

