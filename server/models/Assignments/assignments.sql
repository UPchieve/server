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
    assignments.*,
    subjects.name AS subject_name
FROM
    assignments
    LEFT JOIN subjects ON assignments.subject_id = subjects.id
WHERE
    assignments.id = :assignmentId!;


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
    subjects.name AS subject_name,
    assignments.start_date,
    assignments.is_required,
    assignments.id,
    students_assignments.submitted_at
FROM
    assignments
    LEFT JOIN students_assignments ON assignments.id = students_assignments.assignment_id
    LEFT JOIN subjects ON assignments.subject_id = subjects.id
WHERE
    students_assignments.user_id = :userId!;


/* @name getAllAssignmentsForTeacher */
SELECT
    assignments.*
FROM
    assignments
    JOIN teacher_classes ON assignments.class_id = teacher_classes.id
WHERE
    teacher_classes.user_id = :userId!;


/* @name getStudentAssignmentCompletion */
SELECT
    users.first_name,
    users.last_name,
    students_assignments.submitted_at
FROM
    students_assignments
    LEFT JOIN users ON students_assignments.user_id = users.id
WHERE
    students_assignments.assignment_id = :assignmentId!;


/* @name getStudentAssignmentForSession */
SELECT
    a.title,
    a.description,
    a.number_of_sessions,
    a.min_duration_in_minutes,
    a.due_date,
    a.start_date,
    a.subject_id,
    subjects.name AS subject_name,
    sa.created_at AS assigned_at,
    sa.submitted_at
FROM
    assignments a
    LEFT JOIN students_assignments sa ON sa.assignment_id = a.id
    LEFT JOIN sessions_students_assignments ssa ON ssa.assignment_id = sa.assignment_id
        AND ssa.user_id = sa.user_id
    LEFT JOIN subjects ON a.subject_id = subjects.id
WHERE
    ssa.session_id = :sessionId;

