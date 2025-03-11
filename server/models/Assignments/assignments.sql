/* @name createAssignment */
INSERT INTO assignments (id, class_id, description, title, number_of_sessions, min_duration_in_minutes, due_date, is_required, start_date, subject_id, created_at, updated_at)
    VALUES (:id!, :classId!, :description, :title, :numberOfSessions, :minDurationInMinutes, :dueDate, :isRequired, :startDate, :subjectId, NOW(), NOW())
RETURNING
    id, class_id, description, title, number_of_sessions, min_duration_in_minutes, is_required, due_date, start_date, subject_id, created_at, updated_at;


/* @name getAssignmentsByClassId */
SELECT
    assignments.*,
    ARRAY_AGG(sa.user_id) AS student_ids
FROM
    assignments
    LEFT JOIN students_assignments sa ON assignments.id = sa.assignment_id
WHERE
    assignments.class_id = :classId!
GROUP BY
    assignments.id,
    assignments.class_id;


/* @name getAssignmentById */
SELECT
    assignments.*,
    subjects.name AS subject_name
FROM
    assignments
    LEFT JOIN subjects ON assignments.subject_id = subjects.id
WHERE
    assignments.id = :assignmentId!;


/*
 @name createStudentsAssignmentsForAll
 */
INSERT INTO students_assignments (user_id, assignment_id)
SELECT
    u.user_id,
    a.assignment_id
FROM
    UNNEST(:userIds!::uuid[]) AS u (user_id)
    CROSS JOIN UNNEST(:assignmentIds!::uuid[]) AS a (assignment_id)
ON CONFLICT
    DO NOTHING
RETURNING
    user_id,
    assignment_id,
    created_at,
    updated_at;


/* @name updateSubmittedAtOfStudentAssignment */
UPDATE
    students_assignments
SET
    submitted_at = NOW()
WHERE
    user_id = :userId!
    AND assignment_id = :assignmentId!;


/* @name getAssignmentsByStudentId */
SELECT
    assignments.id,
    students_assignments.created_at AS assigned_at,
    assignments.class_id,
    assignments.description,
    assignments.title,
    assignments.number_of_sessions,
    assignments.min_duration_in_minutes,
    assignments.is_required,
    assignments.due_date,
    assignments.start_date,
    assignments.subject_id,
    subjects.name AS subject_name,
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
    a.id,
    a.class_id,
    a.title,
    a.description,
    a.number_of_sessions,
    a.min_duration_in_minutes,
    a.due_date,
    a.start_date,
    a.subject_id,
    a.is_required,
    subjects.name AS subject_name,
    sa.created_at AS assigned_at,
    sa.submitted_at,
    tc.name AS class_name
FROM
    assignments a
    LEFT JOIN students_assignments sa ON sa.assignment_id = a.id
    LEFT JOIN sessions_students_assignments ssa ON ssa.assignment_id = sa.assignment_id
        AND ssa.user_id = sa.user_id
    LEFT JOIN subjects ON a.subject_id = subjects.id
    LEFT JOIN teacher_classes tc ON a.class_id = tc.id
WHERE
    ssa.session_id = :sessionId;


/* @name linkSessionToAssignment */
INSERT INTO sessions_students_assignments (session_id, user_id, assignment_id)
    VALUES (:sessionId!, :userId!, :assignmentId!)
ON CONFLICT
    DO NOTHING;


/* @name getSessionsForStudentAssignment */
SELECT
    s.volunteer_joined_at,
    s.ended_at,
    s.time_tutored
FROM
    sessions_students_assignments ssa
    JOIN sessions s ON s.id = ssa.session_id
WHERE
    user_id = :userId!
    AND assignment_id = :assignmentId!;


/* @name deleteStudentAssignment*/
DELETE FROM students_assignments
WHERE assignment_id = :assignmentId!;


/* @name deleteAssignment */
DELETE FROM assignments
WHERE id = :assignmentId!;


/* @name deleteSessionForStudentAssignment */
DELETE FROM sessions_students_assignments
WHERE assignment_id = :assignmentId!;


/* @name editAssignmentById */
UPDATE
    assignments
SET
    description = COALESCE(:description, description),
    title = COALESCE(:title, title),
    number_of_sessions = COALESCE(:numberOfSessions, number_of_sessions),
    min_duration_in_minutes = COALESCE(:minDurationInMinutes, min_duration_in_minutes),
    is_required = COALESCE(:isRequired, is_required),
    due_date = COALESCE(:dueDate, due_date),
    start_date = COALESCE(:startDate, start_date),
    subject_id = COALESCE(:subjectId, subject_id),
    updated_at = NOW()
WHERE
    id = :id!
RETURNING
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
    updated_at;


/* @name deleteSessionForStudentAssignmentByStudentId */
DELETE FROM sessions_students_assignments
WHERE assignment_id = :assignmentId!
    AND user_id = :studentId!;


/* @name deleteStudentAssignmentByStudentId */
DELETE FROM students_assignments
WHERE assignment_id = :assignmentId!
    AND user_id = :studentId!;

