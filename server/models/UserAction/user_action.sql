/* @name getQuizzesPassedForDateRangeById */
SELECT
    count(*)::int AS total
FROM
    user_actions
WHERE
    action_type = 'QUIZ'
    AND action = 'PASSED QUIZ'
    AND user_id = :userId!
    AND created_at >= DATE(:start!)
    AND created_at < DATE(:end!);


/* @name getSessionRequestedUserAgentFromSessionId */
SELECT
    id,
    device,
    browser,
    browser_version,
    operating_system,
    operating_system_version
FROM
    user_actions
WHERE
    action_type = 'SESSION'
    AND action = 'REQUESTED SESSION'
    AND session_id = :sessionId!;


/* @name userHasTakenQuiz */
SELECT
    EXISTS (
        SELECT
            1
        FROM
            user_actions
        WHERE
            action_type = 'QUIZ'
            AND (action = 'PASSED QUIZ'
                OR action = 'FAILED QUIZ')
            AND user_id = :userId!);

