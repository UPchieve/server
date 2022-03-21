/* @name findSchoolByUpchieveId */
SELECT
    schools.id,
    schools.name AS name_stored,
    schools.us_state_code AS state_stored,
    approved AS is_approved,
    partner AS is_partner,
    schools.created_at,
    schools.updated_at,
    cities.name AS city_name_stored,
    meta.fipst,
    meta.school_year,
    meta.sch_name,
    meta.lea_name,
    meta.st,
    meta.st_schid,
    meta.mcity,
    meta.mzip,
    meta.lcity,
    meta.lzip,
    meta.g_9_offered,
    meta.g_10_offered,
    meta.g_11_offered,
    meta.g_12_offered
FROM
    schools
    LEFT JOIN cities ON schools.city_id = cities.id
    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
WHERE
    schools.id = :schoolId!;


/* @name getSchool */
SELECT
    approved AS is_approved,
    partner AS is_partner,
    meta.mzip AS zip_code,
    COALESCE(meta.sch_name, schools.name) AS name,
    COALESCE(meta.st, schools.us_state_code) AS state,
    COALESCE(meta.lcity, cities.name) AS city
FROM
    schools
    LEFT JOIN cities ON schools.city_id = cities.id
    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
WHERE
    schools.id = :schoolId!;


/* @name createSchoolMetaData */
INSERT INTO school_nces_metadata (mzip, lzip)
    VALUES (:zipCode!, :zipCode!);


/* @name createSchool */
WITH city AS (
INSERT INTO cities (name)
        VALUES (:city!)
    RETURNING
        id)
    INSERT INTO schools (name, approved, us_state_code, created_at, updated_at, city_id)
    SELECT
        :name!,
        :isApproved!,
        :state!,
        NOW(),
        NOW(),
        id
    FROM
        city;


/* @name updateApproval */
UPDATE
    schools
SET
    approved = :isApproved!
WHERE
    id = :schoolId!;


/* @name updateIsPartner */
UPDATE
    schools
SET
    partner = :isPartner!
WHERE
    id = :schoolId!;


/* @name adminUpdateSchool */
WITH updated_school AS (
    UPDATE
        schools
    SET
        name = :name,
        approved = :isApproved,
        us_state_code = :state
    WHERE
        id = :schoolId!
    RETURNING
        city_id)
UPDATE
    cities
SET
    name = :city
FROM
    updated_school
WHERE
    cities.id = updated_school.city_id;


/* @name adminUpdateSchoolMetaData */
UPDATE
    school_nces_metadata
SET
    mzip = :zipCode,
    lzip = :zipCode
WHERE
    school_id = :schoolId!;

