/* @name getUserSessionMetricsByUserId */
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
    user_session_metrics_view
WHERE
    user_id = :userId!
    AND user_role = :userRole!;

