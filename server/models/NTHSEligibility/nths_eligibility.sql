/* @name getAtLargeEligibility */
SELECT
    users.ban_type,
    users.deactivated,
    users.deleted,
    users.test_user,
    current_grade_levels.current_grade_name AS grade_level,
    ARRAY (
        SELECT
            user_roles.name
        FROM
            users_roles
            JOIN user_roles ON user_roles.id = users_roles.role_id
        WHERE
            users_roles.user_id = users.id
        ORDER BY
            users_roles.created_at) AS roles
FROM
    users
    LEFT JOIN current_grade_levels ON current_grade_levels.user_id = users.id
WHERE
    users.id = :userId!;

