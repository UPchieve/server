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


/* @name deleteDuplicatePushTokens */
DELETE FROM push_tokens
WHERE id IN (
        SELECT
            id
        FROM (
            SELECT
                id,
                ROW_NUMBER() OVER (PARTITION BY user_id, token ORDER BY id) AS row_num
            FROM
                push_tokens) t
        WHERE
            t.row_num > 1);

