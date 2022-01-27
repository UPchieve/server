/* @name getUserIdByEmail */
SELECT
    id
FROM
    users
WHERE
    email = :email!
LIMIT 1;


/* @name getUserContactInfoById */
SELECT
    id,
    first_name,
    email
FROM
    users
WHERE
    id = :id!
LIMIT 1;


/* @name getUserContactInfoByReferralCode */
SELECT
    id,
    first_name,
    email
FROM
    users
WHERE
    referral_code = :referralCode!
LIMIT 1;


/* @name getUserContactInfoByResetToken */
SELECT
    id,
    first_name,
    email
FROM
    users
WHERE
    password_reset_token = :resetToken!
LIMIT 1;


/* @name countUsersReferredByOtherId */
SELECT
    count(*)::int AS total
FROM
    users
WHERE
    referred_by = :userId!;


/* @name updateUserResetTokenById */
UPDATE
    users
SET
    password_reset_token = :token!
WHERE
    id IN (
        SELECT
            id
        FROM
            users
        WHERE
            id = :userId!)
RETURNING
    id;

