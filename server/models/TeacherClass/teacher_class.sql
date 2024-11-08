/* @name getTeacherClassesForStudent */
SELECT
    tc.id,
    tc.name,
    active,
    topic_id,
    tc.created_at,
    tc.updated_at
FROM
    teacher_classes tc
    LEFT JOIN student_classes sc ON tc.id = sc.class_id
WHERE
    sc.user_id = :studentId!
    AND tc.deactivated_on IS NULL
ORDER BY
    tc.created_at ASC;


/* @name getTotalStudentsInClass */
SELECT
    COUNT(*)::int AS count
FROM
    student_classes
WHERE
    class_id = :classId!;


/* @name removeStudentFromClass */
DELETE FROM student_classes
WHERE user_id = :studentId!
    AND class_id = :classId!
RETURNING
    user_id AS studentId;


/* @name getStudentsInPriorityClasses */
SELECT
    sc.user_id AS id
FROM
    student_classes sc
    LEFT JOIN teacher_classes tc ON tc.id = sc.class_id
WHERE
    tc.is_priority = TRUE;

