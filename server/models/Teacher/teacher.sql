/* @name createTeacherProfile */
INSERT INTO teacher_profiles (user_id, school_id, created_at, updated_at)
    VALUES (:userId!, :schoolId, NOW(), NOW());


/* @name createTeacherClass */
INSERT INTO teacher_classes (id, user_id, name, code, active, created_at, updated_at)
    VALUES (:id!, :userId!, :name!, :code!, TRUE, NOW(), NOW())
RETURNING
    user_id, name, code, active, created_at, updated_at;


/* @name getTeacherClassesByUserId */
SELECT
    user_id,
    name,
    code,
    active,
    created_at,
    updated_at
FROM
    teacher_classes
WHERE
    user_id = :userId!;

