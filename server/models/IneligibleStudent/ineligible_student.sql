/* @name getIneligibleStudentByEmail */
SELECT
    ineligible_students.id,
    email,
    postal_code AS zip_code,
    ip_addresses.ip AS ip_address,
    school_id AS school,
    grade_levels.name AS current_grade,
    ineligible_students.created_at,
    ineligible_students.updated_at
FROM
    ineligible_students
    LEFT JOIN ip_addresses ON ineligible_students.ip_address_id = ip_addresses.id
    LEFT JOIN grade_levels ON ineligible_students.grade_level_id = grade_levels.id
WHERE
    email = :email!;


/* @name insertIneligibleStudent */
WITH TEMP AS (
    SELECT
        1)
INSERT INTO ineligible_students (id, email, postal_code, ip_address_id, school_id, grade_level_id, referred_by, created_at, updated_at)
SELECT
    :id!,
    :email!,
    :postalCode,
    ip_addresses.id,
    :schoolId,
    grade_levels.id,
    :referredBy,
    NOW(),
    NOW()
FROM
    TEMP
    LEFT JOIN grade_levels ON grade_levels.name = :gradeLevel
    LEFT JOIN ip_addresses ON ip_addresses.ip = :ip
ON CONFLICT (email)
    DO UPDATE SET
        school_id = :schoolId
    RETURNING
        id AS ok;


/* @name getIneligibleStudentsPaginated */
SELECT
    email,
    postal_code AS zip_code,
    ip_addresses.ip AS ip_address,
    school_id,
    schools.name AS school_name,
    cities.us_state_code AS school_state,
    cities.name AS school_city,
    postal_code AS school_zip_code,
    schools.approved AS is_approved,
    postal_codes.income AS median_income,
    ineligible_students.created_at,
    ineligible_students.updated_at
FROM
    ineligible_students
    LEFT JOIN ip_addresses ON ineligible_students.ip_address_id = ip_addresses.id
    LEFT JOIN postal_codes ON ineligible_students.postal_code = postal_codes.code
    LEFT JOIN schools ON ineligible_students.school_id = schools.id
    LEFT JOIN cities ON schools.city_id = cities.id
ORDER BY
    ineligible_students.created_at DESC
LIMIT (:limit!)::int OFFSET (:offset!)::int;


/* @name deleteIneligibleStudent */
DELETE FROM ineligible_students
WHERE email = :email!;

