/* @name getSignUpSourceByName */
SELECT
    id,
    name
FROM
    signup_sources
WHERE
    name = :name!;


/* @name getSignupSources */
SELECT
    id,
    name
FROM
    signup_sources
WHERE
    -- Do not include Roster in general
    name <> 'Roster'
    -- Exclude YouTube for volunteers
    AND (:role::text IS NULL
        OR :role::text = 'student'
        OR (:role::text = 'volunteer'
            AND name <> 'Youtube'))
ORDER BY
    RANDOM();

