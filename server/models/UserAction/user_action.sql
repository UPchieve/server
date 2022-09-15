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


/* @name getQuizzesPassedForDateRangeForTelecomReportByVolunteerId */
SELECT
    created_at
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


/* @name upsertIpAddress */
WITH ins AS (
INSERT INTO ip_addresses (ip, created_at, updated_at)
        VALUES (:ip!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id)
    SELECT
        *
    FROM
        ins
    UNION
    SELECT
        id
    FROM
        ip_addresses
    WHERE
        ip = :ip!;


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
    VALUES (:actionType!, :action!, :userId!, :quizSubcategory!, :quizCategory!, :ipAddressId, NOW(), NOW())
RETURNING
    id AS ok;


/* @name createSessionAction */
INSERT INTO user_actions (user_id, session_id, action_type, action, ip_address_id, device, browser, browser_version, operating_system, operating_system_version, created_at, updated_at)
    VALUES (:userId!, :sessionId!, :actionType!, :action!, :ipAddressId, :device, :browser, :browserVersion, :operatingSystem, :operatingSystemVersion, NOW(), NOW())
RETURNING
    id AS ok;


/* @name createAccountAction */
INSERT INTO user_actions (user_id, action_type, action, ip_address_id, reference_email, volunteer_id, session_id, ban_reason, created_at, updated_at)
    VALUES (:userId!, :actionType!, :action!, :ipAddressId, :referenceEmail, :volunteerId, :sessionId, :banReason, NOW(), NOW())
RETURNING
    id AS ok;


/* @name createAdminAction */
INSERT INTO user_actions (user_id, action_type, action, created_at, updated_at)
    VALUES (:userId!, :actionType!, :action!, NOW(), NOW())
RETURNING
    id AS ok;


/* @name deleteSelfFavoritedVolunteersActions */
DELETE FROM user_actions
WHERE user_id = volunteer_id
    AND action = 'VOLUNTEER FAVORITED';

