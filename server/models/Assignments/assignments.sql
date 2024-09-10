/* @name createAssignment */
INSERT INTO assignments (id, class_id, description, title, number_of_sessions, min_duration_in_minutes, due_date, is_required, start_date, subject_id, created_at, updated_at)
    VALUES (:id!, :classId!, :description, :title, :numberOfSessions, :minDurationInMinutes, :dueDate, :isRequired, :startDate, :subjectId, NOW(), NOW())
RETURNING
    id, class_id, description, title, number_of_sessions, min_duration_in_minutes, is_required, due_date, start_date, subject_id, created_at, updated_at;


/* @name getAssignmentsByClassId */
SELECT
    *
FROM
    assignments
WHERE
    class_id = :classId!;


/* @name getAssignmentById */
SELECT
    *
FROM
    assignments
WHERE
    id = :assignmentId!;


/* @name createStudentAssignment */
INSERT INTO students_assignments (user_id, assignment_id, created_at, updated_at)
    VALUES (:userId!, :assignmentId!, NOW(), NOW())
RETURNING
    user_id, assignment_id, created_at, updated_at;


/* @name getAssignmentsByStudentId */
SELECT
    assignments.class_id,
    assignments.description,
    assignments.title,
    assignments.number_of_sessions,
    assignments.min_duration_in_minutes,
    assignments.due_date,
    assignments.subject_id,
    assignments.start_date,
    assignments.is_required,
    assignments.id,
    students_assignments.submitted_at
FROM
    assignments
    LEFT JOIN students_assignments ON assignments.id = students_assignments.assignment_id
WHERE
    students_assignments.user_id = :userId!;

