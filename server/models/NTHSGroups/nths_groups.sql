/* @name getGroupsByUser */
SELECT
    ngm.title AS member_title,
    ngm.joined_at,
    ng.id AS group_id,
    ng.name AS group_name,
    ng.key AS group_key
FROM
    nths_group_members ngm
    INNER JOIN nths_groups ng ON ng.id = ngm.nths_group_id
WHERE
    ngm.user_id = :userId!;

