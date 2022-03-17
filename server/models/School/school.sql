/* @name findSchoolById */
SELECT
    id,
    name AS name_stored,
    approved AS is_approved,
    partner AS is_partner,
    us_state_code AS state_stored,
    created_at,
    updated_at cities.name AS city_name_stored
FROM
    schools
    LEFT JOIN cities ON cities.id = schools.city_id
WHERE
    id = :schoolId!;

