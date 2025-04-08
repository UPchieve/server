-- migrate:up
CREATE VIEW upchieve.user_session_metrics_view AS
WITH flags_with_users AS (
    SELECT
        upchieve.sessions_session_flags.session_id,
        upchieve.session_flags.name AS flag_name,
        upchieve.sessions.student_id AS student_id,
        upchieve.sessions.volunteer_id AS volunteer_id,
        upchieve.sessions_session_flags.created_at
    FROM
        upchieve.sessions_session_flags
        JOIN upchieve.session_flags ON upchieve.sessions_session_flags.session_flag_id = upchieve.session_flags.id
        JOIN upchieve.sessions ON upchieve.sessions.id = upchieve.sessions_session_flags.session_id
),
flag_rows_by_user AS (
    SELECT
        student_id AS user_id,
        'student' AS user_role,
        flag_name,
        created_at
    FROM
        flags_with_users
    WHERE
        student_id IS NOT NULL
    UNION ALL
    SELECT
        volunteer_id AS user_id,
        'volunteer' AS user_role,
        flag_name,
        created_at
    FROM
        flags_with_users
    WHERE
        volunteer_id IS NOT NULL
)
SELECT
    user_id,
    user_role,
    COUNT(*) FILTER (WHERE flag_name = 'Absent student') AS absent_student,
    COUNT(*) FILTER (WHERE flag_name = 'Absent volunteer') AS absent_volunteer,
    COUNT(*) FILTER (WHERE flag_name = 'Low session rating from coach') AS low_session_rating_from_coach,
    COUNT(*) FILTER (WHERE flag_name = 'Low session rating from student') AS low_session_rating_from_student,
    COUNT(*) FILTER (WHERE flag_name = 'Low coach rating from student') AS low_coach_rating_from_student,
    COUNT(*) FILTER (WHERE flag_name = 'Reported') AS reported,
    COUNT(*) FILTER (WHERE flag_name = 'Pressuring coach') AS only_looking_for_answers,
    COUNT(*) FILTER (WHERE flag_name = 'Mean or inappropriate') AS rude_or_inappropriate,
    COUNT(*) FILTER (WHERE flag_name = 'Comment from student') AS comment_from_student,
    COUNT(*) FILTER (WHERE flag_name = 'Comment from volunteer') AS comment_from_volunteer,
    COUNT(*) FILTER (WHERE flag_name = 'Has been unmatched') AS has_been_unmatched,
    COUNT(*) FILTER (WHERE flag_name = 'Has had technical issues') AS has_had_technical_issues,
    COUNT(*) FILTER (WHERE flag_name = 'Personally identifiable information'
        OR flag_name = 'PII') AS personal_identifying_info,
    COUNT(*) FILTER (WHERE flag_name = 'Graded assignment') AS graded_assignment,
    COUNT(*) FILTER (WHERE flag_name = 'Coach uncomfortable') AS coach_uncomfortable,
    COUNT(*) FILTER (WHERE flag_name = 'Student in distress') AS student_crisis,
    MIN(created_at) AS created_at
FROM
    flag_rows_by_user
GROUP BY
    user_id,
    user_role;

-- migrate:down
DROP VIEW upchieve.user_session_metrics_view;

