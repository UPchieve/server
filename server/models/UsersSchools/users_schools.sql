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

