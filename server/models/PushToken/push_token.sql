/* @name getPushTokensByUserId */
SELECT
    id,
    user_id AS USER,
    token,
    created_at,
    updated_at
FROM
    push_tokens
WHERE
    user_id = :userId!;


/* @name createPushTokenByUserId */
INSERT INTO push_tokens (id, user_id, token, created_at, updated_at)
    VALUES (:id!, :userId!, :token!, NOW(), NOW())
RETURNING
    id, user_id AS USER, token, created_at, updated_at;

