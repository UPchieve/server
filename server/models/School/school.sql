/* @name getSchoolById */
SELECT
    schools.id,
    COALESCE(schools.name, meta.sch_name) AS name,
    COALESCE(cities.name, meta.lcity) AS city,
    COALESCE(cities.us_state_code, meta.st) AS state,
    meta.lzip AS zip,
    meta.lea_name AS district,
    meta.school_year,
    approved AS is_admin_approved,
    partner AS is_partner,
    meta.is_school_wide_title1,
    meta.is_title1_eligible,
    meta.national_school_lunch_program,
    meta.total_students,
    meta.nslp_direct_certification,
    meta.frl_eligible
FROM
    schools
    LEFT JOIN cities ON schools.city_id = cities.id
    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
WHERE
    schools.id = :schoolId!;


/* @name getSchoolByNcesId */
SELECT
    school_id AS id
FROM
    school_nces_metadata
WHERE
    school_nces_metadata.ncessch = :ncessch!;


/* @name getSchools */
SELECT
    schools.id,
    COALESCE(schools.name, meta.sch_name) AS name,
    COALESCE(cities.name, meta.lcity) AS city,
    COALESCE(cities.us_state_code, meta.st) AS state,
    meta.lzip AS zip,
    meta.lea_name AS district,
    approved AS is_admin_approved,
    partner AS is_partner
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


/* @name schoolSearch */
SELECT
    schools.id,
    COALESCE(schools.name, meta.sch_name) AS name,
    COALESCE(cities.us_state_code, meta.st) AS state,
    COALESCE(cities.name, meta.lcity) AS city,
    meta.lea_name AS district
FROM
    schools
    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
    LEFT JOIN cities ON schools.city_id = cities.id
WHERE
    schools.name ILIKE '%' || :query! || '%'
LIMIT 100;


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
    mzip = COALESCE(:zip, school_nces_metadata.mzip),
    lzip = COALESCE(:zip, school_nces_metadata.lzip),
    updated_at = NOW()
WHERE
    school_id = :schoolId!;


/* @name titlecaseSchoolNames */
UPDATE
    schools
SET
    name = INITCAP(name)
WHERE
    name ~ '^[A-Z\s\d]*$';


/* @name titlecaseMetadataSchoolNames */
UPDATE
    school_nces_metadata
SET
    sch_name = INITCAP(sch_name)
WHERE
    sch_name ~ '^[A-Z\s\d]*$';


/* @name createSchool */
INSERT INTO schools (id, name, city_id)
    VALUES (:id!, :name!, :city_id)
RETURNING
    id;


/* @name createSchoolMetadata */
INSERT INTO school_nces_metadata (school_id, ncessch, school_year, st, sch_name, lea_name, lcity, lzip, mcity, mstate, mzip, phone, website, sy_status_text, updated_status_text, effective_date, sch_type_text, nogrades, g_pk_offered, g_kg_offered, g_1_offered, g_2_offered, g_3_offered, g_4_offered, g_5_offered, g_6_offered, g_7_offered, g_8_offered, g_9_offered, g_10_offered, g_11_offered, g_12_offered, g_13_offered, g_ug_offered, g_ae_offered, gslo, gshi, level, total_students, is_school_wide_title1, is_title1_eligible, national_school_lunch_program, nslp_direct_certification, frl_eligible)
    VALUES (:school_id, :ncessch, :school_year, :st, :sch_name, :lea_name, :lcity, :lzip, :mcity, :mstate, :mzip, :phone, :website, :sy_status_text, :updated_status_text, :effective_date, :sch_type_text, :nogrades, :g_pk_offered, :g_kg_offered, :g_1_offered, :g_2_offered, :g_3_offered, :g_4_offered, :g_5_offered, :g_6_offered, :g_7_offered, :g_8_offered, :g_9_offered, :g_10_offered, :g_11_offered, :g_12_offered, :g_13_offered, :g_ug_offered, :g_ae_offered, :gslo, :gshi, :level, :total_students, :is_school_wide_title1, :is_title1_eligible, :national_school_lunch_program, :nslp_direct_certification, :frl_eligible);


/* @name updateSchoolMetadata */
UPDATE
    school_nces_metadata
SET
    school_year = :school_year!,
    st = :st,
    sch_name = :sch_name,
    lea_name = :lea_name,
    lcity = :lcity,
    lzip = :lzip,
    mcity = :mcity,
    mstate = :mstate,
    mzip = :mzip,
    phone = :phone,
    website = :website,
    sy_status_text = :sy_status_text,
    updated_status_text = :updated_status_text,
    effective_date = :effective_date,
    sch_type_text = :sch_type_text,
    nogrades = :nogrades,
    g_pk_offered = :g_pk_offered,
    g_kg_offered = :g_kg_offered,
    g_1_offered = :g_1_offered,
    g_2_offered = :g_2_offered,
    g_3_offered = :g_3_offered,
    g_4_offered = :g_4_offered,
    g_5_offered = :g_5_offered,
    g_6_offered = :g_6_offered,
    g_7_offered = :g_7_offered,
    g_8_offered = :g_8_offered,
    g_9_offered = :g_9_offered,
    g_10_offered = :g_10_offered,
    g_11_offered = :g_11_offered,
    g_12_offered = :g_12_offered,
    g_13_offered = :g_13_offered,
    g_ug_offered = :g_ug_offered,
    g_ae_offered = :g_ae_offered,
    gslo = :gslo,
    gshi = :gshi,
    level = :level,
    total_students = :total_students,
    is_school_wide_title1 = :is_school_wide_title1,
    is_title1_eligible = :is_title1_eligible,
    national_school_lunch_program = :national_school_lunch_program,
    nslp_direct_certification = :nslp_direct_certification,
    frl_eligible = :frl_eligible
WHERE
    school_nces_metadata.school_id = :school_id!;


/* @name getPartnerSchools */
SELECT
    schools.name AS school_name,
    schools.id AS school_id,
    spo.key AS partner_key,
    ARRAY_REMOVE(ARRAY_AGG(spos.name), NULL) AS partner_sites
FROM
    schools
    LEFT JOIN student_partner_orgs spo ON schools.id = spo.school_id
    LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id
WHERE
    partner = TRUE
GROUP BY
    schools.name,
    schools.id,
    spo.key;

