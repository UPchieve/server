/* @name insertContactFormSubmissionByUser */
INSERT INTO contact_form_submissions (id, user_email, user_id, message, topic, created_at, updated_at)
SELECT
    :id!,
    email,
    :userId!,
    :message!,
    :topic!,
    NOW(),
    NOW()
FROM
    users
WHERE
    id = :userId!
RETURNING
    id,
    user_email,
    user_id,
    message,
    topic,
    created_at,
    updated_at;


/* @name insertContactFormSubmissionByEmail */
INSERT INTO contact_form_submissions (id, user_email, message, topic, created_at, updated_at)
    VALUES (:id!, :userEmail!, :message!, :topic!, NOW(), NOW())
RETURNING
    id, user_email, user_id, message, topic, created_at, updated_at;

