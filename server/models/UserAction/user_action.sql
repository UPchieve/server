/* @name getQuizzesPassedForDateRangeByVolunteerId */
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


/* @name createQuizAction */
INSERT INTO user_actions (action_type, action, user_id, quiz_subcategory, quiz_category, ip_address_id, created_at, updated_at)
    VALUES (:action_type!, :action!, :user_id!, :quiz_subcategory!, :quiz_category!, :ip_address_id, NOW(), NOW());

/* @name createSessionAction */
INSERT INTO user_actions (user_id, session_id, action_type, action, ip_address_id, device, browser, browser_version, operating_system, operating_system_version, created_at, updated_at)
    VALUES (:user_id!, :session_id!, :action_type!, :action!, :ip_address_id, :device, :browser, :browser_version, :operating_system, :operating_system_version, NOW(), NOW());

/* @name createAccountAction */
INSERT INTO user_actions (user_id, action_type, action, ip_address_id, reference_email, volunteer_id, session_id, created_at, updated_at)
    VALUES (:user_id!, :action_type!, :action!, :ip_address_id, :reference_email, :volunteer_id, :session_id, NOW(), NOW());

/* @name createAdminAction */
INSERT INTO user_actions (user_id, action_type, action, created_at, updated_at)
    VALUES (:user_id!, :action_type!, :action!, NOW(), NOW());
