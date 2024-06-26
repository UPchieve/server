/* @name getSignUpSourceByName */
SELECT
    id,
    name
FROM
    signup_sources
WHERE
    name = :name!;

