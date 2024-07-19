/* @name createTeacherProfile */
INSERT INTO teacher_profiles (user_id, school_id, created_at, updated_at)
    VALUES (:userId!, :schoolId, NOW(), NOW());


/* @name createTeacherClass */
INSERT INTO teacher_classes (id, user_id, name, code, active, created_at, updated_at)
    VALUES (:id!, :userId!, :name!, :code!, TRUE, NOW(), NOW())
RETURNING
    id, user_id, name, code, active, created_at, updated_at;


/* @name getTeacherClassesByUserId */
SELECT
    id,
    teacher_classes.user_id,
    name,
    code,
    active,
    COUNT(student_classes.user_id)::int AS total_students,
    teacher_classes.created_at,
    teacher_classes.updated_at
FROM
    teacher_classes
    LEFT JOIN student_classes ON teacher_classes.id = student_classes.class_id
WHERE
    teacher_classes.user_id = :userId!
GROUP BY
    id;


/* @name getTeacherClassByClassCode */
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
    code = :code!;


/* @name getStudentIdsInTeacherClass */
SELECT
    user_id
FROM
    student_classes
WHERE
    class_id = :classId!;

