/* @name insertUsersSchool */
INSERT INTO users_schools (user_id, school_id, association_type, updated_at)
    VALUES (:userId!, :schoolId!, :associationType!, NOW())
RETURNING
    *;

