/* @name createAssignment */
INSERT INTO assignments (id, class_id, description, title, number_of_sessions, min_duration_in_minutes, due_date, is_required, start_date, subject_id, created_at, updated_at)
    VALUES (:id!, :classId!, :description, :title, :numberOfSessions, :minDurationInMinutes, :dueDate, :isRequired, :startDate, :subjectId, NOW(), NOW())
RETURNING
    id, class_id, description, title, number_of_sessions, min_duration_in_minutes, is_required, due_date, start_date, subject_id, created_at, updated_at;


/* @name getAssignmentsByClassId */
SELECT
    id,
    class_id,
    description,
    title,
    number_of_sessions,
    min_duration_in_minutes,
    is_required,
    due_date,
    start_date,
    subject_id,
    created_at,
    updated_at
FROM
    assignments
WHERE
    class_id = :classId!;

