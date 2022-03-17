/* @name findSchoolById */
SELECT
    schools.id,
    schools.name AS name_stored,
    approved AS is_approved,
    partner AS is_partner,
    us_state_code AS state_stored,
    created_at,
    updated_at,
    cities.name AS city_name_stored
FROM
    schools
    LEFT JOIN cities ON schools.city_id = cities.id
WHERE
    id = :schoolId!;

