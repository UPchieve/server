/* @name createTeacherProfile */
INSERT INTO teacher_profiles (user_id, school_id, created_at, updated_at)
    VALUES (:userId!, :schoolId, NOW(), NOW());

