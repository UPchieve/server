/* @name upsertUsersSchool */
INSERT INTO users_schools (user_id, school_id, association_type, updated_at)
    VALUES (:userId!, :schoolId!, :associationType!, NOW())
ON CONFLICT (user_id)
    DO UPDATE SET
        school_id = :schoolId!, association_type = :associationType!, updated_at = NOW()
    RETURNING
        *;


/* @name deleteUsersSchool */
DELETE FROM users_schools
WHERE user_id = :userId!
    AND school_id = :schoolId!;


/* @name backfillStudentAndTeacherSchools */
WITH students_to_backfill AS (
    SELECT
        sp.user_id,
        sp.school_id
    FROM
        student_profiles sp
        LEFT JOIN users_schools us ON us.user_id = sp.user_id
    WHERE
        us.user_id IS NULL
        AND sp.school_id IS NOT NULL
),
teachers_to_backfill AS (
    SELECT
        tp.user_id,
        tp.school_id
    FROM
        teacher_profiles tp
        LEFT JOIN users_schools us ON us.user_id = tp.user_id
    WHERE
        us.user_id IS NULL
        AND tp.school_id IS NOT NULL
),
student_insert AS (
INSERT INTO users_schools (user_id, school_id, association_type)
    SELECT
        stb.user_id,
        stb.school_id,
        'student_at_school'
    FROM
        students_to_backfill stb)
    INSERT INTO users_schools (user_id, school_id, association_type)
    SELECT
        ttb.user_id,
        ttb.school_id,
        'teacher_at_school'
    FROM
        teachers_to_backfill ttb;

