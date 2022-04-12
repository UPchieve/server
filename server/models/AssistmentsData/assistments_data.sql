/* @name getAssistmentsDataBySession */
SELECT
    id,
    problem_id,
    assignment_id,
    student_id,
    session_id,
    sent,
    sent_at,
    created_at,
    updated_at
FROM
    assistments_data
WHERE
    session_id = :sessionId!;


/* @name updateAssistmentsDataSentById */
UPDATE
    assistments_data
SET
    sent = TRUE
WHERE
    id = :assistmentsDataId!
RETURNING
    id;


/* @name createAssistmentsDataBySessionId */
INSERT INTO assistments_data (id, problem_id, assignment_id, student_id, session_id, sent, created_at, updated_at)
SELECT
    :id!,
    :problemId!,
    :assignmentId!,
    :studentId!,
    :sessionId!,
    FALSE,
    NOW()::date,
    NOW()::date
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            assistments_data
        WHERE
            session_id = :sessionId!)
RETURNING
    id,
    problem_id,
    assignment_id,
    student_id,
    session_id,
    sent,
    sent_at,
    created_at,
    updated_at;
