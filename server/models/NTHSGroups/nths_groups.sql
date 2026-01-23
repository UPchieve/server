/* @name getGroupsByUser */
SELECT
    ngm.title AS member_title,
    ngm.joined_at,
    ng.id AS group_id,
    ng.name AS group_name,
    ng.key AS group_key,
    ng.invite_code,
    roles.name AS role_name
FROM
    nths_group_members ngm
    INNER JOIN nths_groups ng ON ng.id = ngm.nths_group_id
    INNER JOIN nths_group_member_roles member_roles ON member_roles.user_id = :userId!
        AND member_roles.nths_group_id = ng.id
    INNER JOIN nths_group_roles roles ON roles.id = member_roles.role_id
WHERE
    ngm.user_id = :userId!;


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


/* @name joinGroupById */
INSERT INTO nths_group_members ("nths_group_id", "user_id", "title")
    VALUES (:groupId!, :userId!, :title!)
RETURNING
    *;


/* @name getAllNthsUsers */
SELECT
    *
FROM
    nths_group_members;


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
    users.email,
    users.first_name
FROM
    nths_group_members ngm
    JOIN nths_group_member_roles member_roles ON member_roles.nths_group_id = :groupId!
        AND member_roles.user_id = ngm.user_id
    JOIN nths_group_roles roles ON roles.id = member_roles.role_id
    JOIN users ON users.id = ngm.user_id
WHERE
    ngm.nths_group_id = :groupId!;

