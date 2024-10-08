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
ORDER BY
    tc.created_at ASC;


/* @name getTotalStudentsInClass */
SELECT
    COUNT(*)::int AS count
FROM
    student_classes
WHERE
    class_id = :classId!;

