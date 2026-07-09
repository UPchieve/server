/* @name getTeacherClassesForStudent */
SELECT
    tc.id,
    tc.user_id,
    tc.name,
    tc.code,
    active,
    topic_id,
    tc.created_at,
    tc.deactivated_on,
    tc.clever_id
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


/*
 @name removeStudentsFromClass
 @param studentIds -> (...)
 */
DELETE FROM student_classes
WHERE user_id IN :studentIds!
    AND class_id = :classId!
RETURNING
    user_id AS student_id;

