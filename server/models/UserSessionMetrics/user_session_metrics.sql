/* @name getUserSessionMetricsByUserId */
WITH flag_rows_by_user AS (
    SELECT
        sessions_session_flags.session_id,
        session_flags.name AS flag_name,
        CASE WHEN (:userRole!::text = 'student') THEN
            sessions.student_id
        WHEN (:userRole!::text = 'volunteer') THEN
            sessions.volunteer_id
        END AS user_id,
        :userRole!::text AS user_role,
        sessions_session_flags.created_at
    FROM
        sessions_session_flags
        JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id
        JOIN sessions ON sessions.id = sessions_session_flags.session_id
    WHERE
        CASE WHEN (:userRole!::text = 'student') THEN
            sessions.student_id = :userId!
        WHEN (:userRole!::text = 'volunteer') THEN
            sessions.volunteer_id = :userId!
        END
),
user_session_metrics AS (
    SELECT
        flag_rows_by_user.user_id,
        flag_rows_by_user.user_role,
        count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Absent student'::text) AS absent_student,
    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Absent volunteer'::text) AS absent_volunteer,
    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Low session rating from coach'::text) AS low_session_rating_from_coach,
    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Low session rating from student'::text) AS low_session_rating_from_student,
    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Low coach rating from student'::text) AS low_coach_rating_from_student,
    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Reported'::text) AS reported,
    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Pressuring coach'::text) AS only_looking_for_answers,
    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Mean or inappropriate'::text) AS rude_or_inappropriate,
    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Comment from student'::text) AS comment_from_student,
    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Comment from volunteer'::text) AS comment_from_volunteer,
    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Has been unmatched'::text) AS has_been_unmatched,
    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Has had technical issues'::text) AS has_had_technical_issues,
    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Personally identifiable information'::text
        OR flag_rows_by_user.flag_name = 'PII'::text) AS personal_identifying_info,
    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Graded assignment'::text) AS graded_assignment,
    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Coach uncomfortable'::text) AS coach_uncomfortable,
    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Student in distress'::text) AS student_crisis,
    min(flag_rows_by_user.created_at) AS created_at
FROM
    flag_rows_by_user
GROUP BY
    flag_rows_by_user.user_id,
    flag_rows_by_user.user_role
)
SELECT
    user_id,
    absent_student::int,
    absent_volunteer::int,
    low_session_rating_from_coach::int,
    low_session_rating_from_student::int,
    low_coach_rating_from_student::int,
    only_looking_for_answers::int,
    rude_or_inappropriate::int,
    comment_from_student::int,
    comment_from_volunteer::int,
    has_been_unmatched::int,
    has_had_technical_issues::int,
    reported::int,
    personal_identifying_info::int,
    graded_assignment::int,
    coach_uncomfortable::int,
    student_crisis::int,
    created_at
FROM
    user_session_metrics;

