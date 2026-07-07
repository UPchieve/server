/* @name upsertUserGradeLevel */
INSERT INTO users_grade_levels (user_id, signup_grade_level_id, grade_level_id, updated_at)
SELECT
    :userId!,
    gl.id,
    gl.id,
    NOW()
FROM
    grade_levels gl
WHERE
    gl.name = :gradeLevel!
ON CONFLICT (user_id)
    DO UPDATE SET
        grade_level_id = EXCLUDED.grade_level_id,
        updated_at = NOW()
    RETURNING
        *;

