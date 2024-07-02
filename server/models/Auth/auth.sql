/* @name deleteAuthSessionsForUser */
DELETE FROM auth.session
WHERE (sess -> 'passport') ->> 'user' = :userId!
RETURNING
    sid AS ok;

