-- migrate:up
CREATE OR REPLACE VIEW upchieve.user_session_metrics_view AS
WITH metrics_by_role AS (
    -- Get metrics for sessions where the user was a student
    SELECT
        student_id AS user_id,
        absent_student,
        absent_volunteer,
        low_session_rating_from_coach,
        low_session_rating_from_student,
        low_coach_rating_from_student,
        reported,
        only_looking_for_answers,
        rude_or_inappropriate,
        comment_from_student,
        comment_from_volunteer,
        has_been_unmatched,
        has_had_technical_issues,
        personal_identifying_info,
        graded_assignment,
        coach_uncomfortable,
        student_crisis,
        upchieve.session_metrics.created_at
    FROM
        upchieve.sessions
        JOIN upchieve.session_metrics ON upchieve.sessions.id = upchieve.session_metrics.session_id
UNION ALL
-- Get metrics for sessions where the user was a volunteer
SELECT
    volunteer_id AS user_id,
    absent_student,
    absent_volunteer,
    low_session_rating_from_coach,
    low_session_rating_from_student,
    low_coach_rating_from_student,
    reported,
    only_looking_for_answers,
    rude_or_inappropriate,
    comment_from_student,
    comment_from_volunteer,
    has_been_unmatched,
    has_had_technical_issues,
    personal_identifying_info,
    graded_assignment,
    coach_uncomfortable,
    student_crisis,
    upchieve.session_metrics.created_at
FROM
    upchieve.sessions
    JOIN upchieve.session_metrics ON upchieve.sessions.id = upchieve.session_metrics.session_id
)
SELECT
    user_id,
    COALESCE(SUM(absent_student), 0)::int AS absent_student,
    COALESCE(SUM(absent_volunteer), 0)::int AS absent_volunteer,
    COALESCE(SUM(low_session_rating_from_coach), 0)::int AS low_session_rating_from_coach,
    COALESCE(SUM(low_session_rating_from_student), 0)::int AS low_session_rating_from_student,
    COALESCE(SUM(low_coach_rating_from_student), 0)::int AS low_coach_rating_from_student,
    COALESCE(SUM(reported), 0)::int AS reported,
    COALESCE(SUM(only_looking_for_answers), 0)::int AS only_looking_for_answers,
    COALESCE(SUM(rude_or_inappropriate), 0)::int AS rude_or_inappropriate,
    COALESCE(SUM(comment_from_student), 0)::int AS comment_from_student,
    COALESCE(SUM(comment_from_volunteer), 0)::int AS comment_from_volunteer,
    COALESCE(SUM(has_been_unmatched), 0)::int AS has_been_unmatched,
    COALESCE(SUM(has_had_technical_issues), 0)::int AS has_had_technical_issues,
    COALESCE(SUM(personal_identifying_info), 0)::int AS personal_identifying_info,
    COALESCE(SUM(graded_assignment), 0)::int AS graded_assignment,
    COALESCE(SUM(coach_uncomfortable), 0)::int AS coach_uncomfortable,
    COALESCE(SUM(student_crisis), 0)::int AS student_crisis,
    MIN(created_at) AS created_at
FROM
    metrics_by_role
GROUP BY
    user_id;

-- migrate:down
DROP VIEW IF EXISTS upchieve.user_session_metrics_view;

