/* @name findSchoolByUpchieveId */
SELECT
    schools.id,
    schools.name AS name_stored,
    cities.us_state_code AS state_stored,
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
    COALESCE(meta.st, cities.us_state_code) AS state,
    COALESCE(meta.lcity, cities.name) AS city,
    schools.id,
    schools.created_at,
    schools.updated_at
FROM
    schools
    LEFT JOIN cities ON schools.city_id = cities.id
    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
WHERE
    schools.id = :schoolId!;


/* @name getSchools */
SELECT
    approved AS is_approved,
    partner AS is_partner,
    meta.mzip AS zip_code,
    COALESCE(schools.name, meta.sch_name) AS name,
    COALESCE(cities.us_state_code, meta.st) AS state,
    COALESCE(cities.name, meta.lcity) AS city,
    schools.id AS id,
    schools.created_at,
    schools.updated_at
FROM
    schools
    LEFT JOIN cities ON schools.city_id = cities.id
    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
WHERE (:name::text IS NULL
    OR schools.name ILIKE '%' || :name || '%'
    OR meta.sch_name ILIKE '%' || :name || '%')
AND (:state::text IS NULL
    OR meta.st ILIKE :state
    OR cities.us_state_code ILIKE :state)
AND (:city::text IS NULL
    OR meta.mcity ILIKE '%' || :city || '%'
    OR meta.lcity ILIKE '%' || :city || '%'
    OR cities.name ILIKE '%' || :city || '%')
LIMIT :limit!::int OFFSET :offset!::int;


/* @name createSchoolMetaData */
INSERT INTO school_nces_metadata (mzip, lzip)
    VALUES (:zipCode!, :zipCode!);


/* @name createCity */
INSERT INTO cities (name, created_at, updated_at)
    VALUES (:city!, NOW(), NOW())
ON CONFLICT
    DO NOTHING;


/* @name createSchool */
INSERT INTO schools (id, name, approved, city_id, created_at, updated_at)
    VALUES (:id!, :name!, :isApproved!, :cityId!, NOW(), NOW())
RETURNING
    id, approved AS is_approved, partner AS is_partner, name AS name_stored, updated_at, created_at;


/* @name updateApproval */
UPDATE
    schools
SET
    approved = :isApproved!,
    updated_at = NOW()
WHERE
    id = :schoolId!;


/* @name updateIsPartner */
UPDATE
    schools
SET
    partner = :isPartner!,
    updated_at = NOW()
WHERE
    id = :schoolId!;


/* @name adminUpdateSchool */
UPDATE
    schools
SET
    name = COALESCE(:name, schools.name),
    approved = COALESCE(:isApproved, schools.approved),
    updated_at = NOW(),
    city_id = COALESCE(:cityId, schools.city_id)
WHERE
    schools.id = :schoolId!;


/* @name adminUpdateSchoolMetaData */
UPDATE
    school_nces_metadata
SET
    mzip = :zipCode,
    lzip = :zipCode,
    updated_at = NOW()
WHERE
    school_id = :schoolId!;


/* @name schoolSearch */
SELECT
    schools.id,
    COALESCE(meta.sch_name, schools.name) AS name_stored,
    COALESCE(meta.st, cities.us_state_code) AS state_stored,
    COALESCE(meta.lcity, cities.name) AS city_name_stored,
    meta.lea_name AS district_name_stored,
    schools.created_at,
    schools.updated_at,
    approved AS is_approved,
    partner AS is_partner
FROM
    schools
    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
    LEFT JOIN cities ON schools.city_id = cities.id
WHERE
    schools.name ILIKE '%' || :query! || '%'
LIMIT 100;

