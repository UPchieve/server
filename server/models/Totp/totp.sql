/* @name getSecret */
SELECT
    *
FROM
    totp
WHERE
    user_id = :userId!;


/* @name storeSecret */
INSERT INTO totp (user_id, secret)
    VALUES (:userId!, :secret!)
ON CONFLICT (user_id)
    DO UPDATE SET
        secret = EXCLUDED.secret, verified = FALSE, last_used_counter = NULL, updated_at = NOW()
    WHERE
        NOT totp.verified;


/* @name updateSecret */
UPDATE
    totp
SET
    verified = COALESCE(:verified, verified),
    last_used_counter = COALESCE(:lastUsedCounter, last_used_counter),
    updated_at = NOW()
WHERE
    user_id = :userId!;

