-- migrate:up
CREATE OR REPLACE VIEW upchieve.user_session_metrics_view AS
WITH metrics_by_role AS (
    -- Get metrics for sessions where the user was a student
    SELECT
        student_id AS user_id,
        absent_student::int AS absent_student,
        absent_volunteer::int AS absent_volunteer,
        low_session_rating_from_coach::int AS low_session_rating_from_coach,
        low_session_rating_from_student::int AS low_session_rating_from_student,
        low_coach_rating_from_student::int AS low_coach_rating_from_student,
        reported::int AS reported,
        only_looking_for_answers::int AS only_looking_for_answers,
        rude_or_inappropriate::int AS rude_or_inappropriate,
        comment_from_student::int AS comment_from_student,
        comment_from_volunteer::int AS comment_from_volunteer,
        has_been_unmatched::int AS has_been_unmatched,
        has_had_technical_issues::int AS has_had_technical_issues,
        personal_identifying_info::int AS personal_identifying_info,
        graded_assignment::int AS graded_assignment,
        coach_uncomfortable::int AS coach_uncomfortable,
        student_crisis::int AS student_crisis,
        upchieve.session_metrics.created_at
    FROM
        upchieve.sessions
        JOIN upchieve.session_metrics ON upchieve.sessions.id = upchieve.session_metrics.session_id
UNION ALL
-- Get metrics for sessions where the user was a volunteer
SELECT
    volunteer_id AS user_id,
    absent_student::int AS absent_student,
    absent_volunteer::int AS absent_volunteer,
    low_session_rating_from_coach::int AS low_session_rating_from_coach,
    low_session_rating_from_student::int AS low_session_rating_from_student,
    low_coach_rating_from_student::int AS low_coach_rating_from_student,
    reported::int AS reported,
    only_looking_for_answers::int AS only_looking_for_answers,
    rude_or_inappropriate::int AS rude_or_inappropriate,
    comment_from_student::int AS comment_from_student,
    comment_from_volunteer::int AS comment_from_volunteer,
    has_been_unmatched::int AS has_been_unmatched,
    has_had_technical_issues::int AS has_had_technical_issues,
    personal_identifying_info::int AS personal_identifying_info,
    graded_assignment::int AS graded_assignment,
    coach_uncomfortable::int AS coach_uncomfortable,
    student_crisis::int AS student_crisis,
    upchieve.session_metrics.created_at
FROM
    upchieve.sessions
    JOIN upchieve.session_metrics ON upchieve.sessions.id = upchieve.session_metrics.session_id
)
SELECT
    user_id,
    SUM(absent_student) AS absent_student,
    SUM(absent_volunteer) AS absent_volunteer,
    SUM(low_session_rating_from_coach) AS low_session_rating_from_coach,
    SUM(low_session_rating_from_student) AS low_session_rating_from_student,
    SUM(low_coach_rating_from_student) AS low_coach_rating_from_student,
    SUM(reported) AS reported,
    SUM(only_looking_for_answers) AS only_looking_for_answers,
    SUM(rude_or_inappropriate) AS rude_or_inappropriate,
    SUM(comment_from_student) AS comment_from_student,
    SUM(comment_from_volunteer) AS comment_from_volunteer,
    SUM(has_been_unmatched) AS has_been_unmatched,
    SUM(has_had_technical_issues) AS has_had_technical_issues,
    SUM(personal_identifying_info) AS personal_identifying_info,
    SUM(graded_assignment) AS graded_assignment,
    SUM(coach_uncomfortable) AS coach_uncomfortable,
    SUM(student_crisis) AS student_crisis,
    MIN(created_at) AS created_at
FROM
    metrics_by_role
GROUP BY
    user_id;

-- migrate:down
DROP VIEW IF EXISTS upchieve.user_session_metrics_view;

