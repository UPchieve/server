/* @name createUSMByUserId */
INSERT INTO user_session_metrics (user_id, created_at, updated_at)
SELECT
    :userId!,
    NOW(),
    NOW()
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            user_session_metrics
        WHERE
            user_id = :userId!)
RETURNING
    user_id,
    absent_student,
    absent_volunteer,
    low_session_rating_from_coach,
    low_session_rating_from_student,
    low_coach_rating_from_student,
    only_looking_for_answers,
    rude_or_inappropriate,
    comment_from_student,
    comment_from_volunteer,
    has_been_unmatched,
    has_had_technical_issues,
    reported,
    created_at,
    updated_at;


/* @name getUSMByUserId */
SELECT
    user_id,
    absent_student,
    absent_volunteer,
    low_session_rating_from_coach,
    low_session_rating_from_student,
    low_coach_rating_from_student,
    only_looking_for_answers,
    rude_or_inappropriate,
    comment_from_student,
    comment_from_volunteer,
    has_been_unmatched,
    has_had_technical_issues,
    reported,
    created_at,
    updated_at
FROM
    user_session_metrics
WHERE
    user_id = :userId!;


/* @name executeUSMUpdatesByUserId */
UPDATE
    user_session_metrics
SET
    absent_student = COALESCE(:absentStudent!, absent_student),
    absent_volunteer = COALESCE(:absentVolunteer!, absent_volunteer),
    low_session_rating_from_coach = COALESCE(:lowSessionRatingFromCoach!, low_session_rating_from_coach),
    low_session_rating_from_student = COALESCE(:lowSessionRatingFromStudent!, low_session_rating_from_student),
    low_coach_rating_from_student = COALESCE(:lowCoachRatingFromStudent!, low_coach_rating_from_student),
    only_looking_for_answers = COALESCE(:onlyLookingForAnswers!, only_looking_for_answers),
    rude_or_inappropriate = COALESCE(:rudeOrInappropriate!, rude_or_inappropriate),
    comment_from_student = COALESCE(:commentFromStudent!, comment_from_student),
    comment_from_volunteer = COALESCE(:commentFromVolunteer!, comment_from_volunteer),
    has_been_unmatched = COALESCE(:hasBeenUnmatched!, has_been_unmatched),
    has_had_technical_issues = COALESCE(:hasHadTechnicalIssues!, has_had_technical_issues),
    reported = COALESCE(:reported!, reported),
    updated_at = NOW()
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;

