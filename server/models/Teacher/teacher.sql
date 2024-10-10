/* @name createTeacherProfile */
INSERT INTO teacher_profiles (user_id, school_id, created_at, updated_at)
    VALUES (:userId!, :schoolId, NOW(), NOW());


/* @name createTeacherClass */
INSERT INTO teacher_classes (id, user_id, name, code, topic_id, active, created_at, updated_at)
    VALUES (:id!, :userId!, :name!, :code!, :topicId, TRUE, NOW(), NOW())
RETURNING
    id, user_id, name, code, topic_id, active, created_at, updated_at;


/* @name getTeacherById */
SELECT
    user_id,
    school_id,
    created_at,
    updated_at
FROM
    teacher_profiles
WHERE
    user_id = :userId!;


/* @name getTeacherClassesByUserId */
SELECT
    id,
    teacher_classes.user_id,
    name,
    code,
    topic_id,
    active,
    COUNT(student_classes.user_id)::int AS total_students,
    teacher_classes.created_at,
    teacher_classes.updated_at,
    teacher_classes.deactivated_on
FROM
    teacher_classes
    LEFT JOIN student_classes ON teacher_classes.id = student_classes.class_id
WHERE
    teacher_classes.user_id = :userId!
GROUP BY
    id;


/* @name getTeacherClassByClassCode */
SELECT
    id,
    user_id,
    name,
    code,
    active,
    topic_id,
    created_at,
    updated_at,
    deactivated_on
FROM
    teacher_classes
WHERE
    code = :code!;


/* @name getTeacherClassById */
SELECT
    id,
    user_id,
    name,
    code,
    active,
    topic_id,
    created_at,
    updated_at,
    (
        SELECT
            COUNT(*)
        FROM
            student_classes
        WHERE
            class_id = id)::int AS total_students
FROM
    teacher_classes
WHERE
    id = :id!;


/* @name getStudentIdsInTeacherClass */
SELECT
    user_id
FROM
    student_classes
WHERE
    class_id = :classId!;


/* @name updateTeacherClass */
UPDATE
    teacher_classes
SET
    name = :name!,
    topic_id = :topicId!,
    updated_at = NOW()
WHERE
    id = :id!
RETURNING
    id,
    user_id,
    name,
    code,
    topic_id,
    active,
    created_at,
    updated_at;


/* @name deactivateTeacherClass */
UPDATE
    teacher_classes
SET
    deactivated_on = NOW()
WHERE
    id = :id!
RETURNING
    id,
    user_id,
    name,
    code,
    topic_id,
    active,
    created_at,
    updated_at;

