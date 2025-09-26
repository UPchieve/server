/* @name addReferral */
INSERT INTO referrals (user_id, referred_by)
    VALUES (:userId, :referredBy);


/* @name getReferredUsersWithFilter */
SELECT
    u.id,
    array_agg(roles.name)::text[] AS roles
FROM
    referrals r
    JOIN users u ON u.id = r.user_id
    JOIN users_roles ur ON ur.user_id = u.id
    JOIN user_roles roles ON roles.id = ur.role_id
WHERE
    r.referred_by = :userId!::uuid
    AND (:phoneOrEmailVerified::boolean IS NULL
        OR u.phone_verified = :phoneOrEmailVerified::boolean
        OR u.email_verified = :phoneOrEmailVerified::boolean)
GROUP BY
    u.id
HAVING
    array_agg(roles.name)::text[] @> COALESCE(:hasRoles::text[], ARRAY[]::text[]);

