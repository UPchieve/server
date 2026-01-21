/* @name getGroupsByUser */
SELECT
    ngm.title AS member_title,
    ngm.joined_at,
    ng.id AS group_id,
    ng.name AS group_name,
    ng.key AS group_key,
    ng.invite_code
FROM
    nths_group_members ngm
    INNER JOIN nths_groups ng ON ng.id = ngm.nths_group_id
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

