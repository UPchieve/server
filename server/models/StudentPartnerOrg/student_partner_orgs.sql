/* @name getStudentPartnerOrgForRegistrationByKey */
SELECT
    KEY,
    spo.name,
    spo.school_signup_required,
    sites.sites
FROM
    student_partner_orgs spo
    LEFT JOIN LATERAL (
        SELECT
            array_agg(name) AS sites
        FROM
            student_partner_org_sites spos
        WHERE
            spo.id = spos.student_partner_org_id) AS sites ON TRUE
WHERE
    spo.key = :key!;


/* @name getStudentPartnerOrgByKey */
SELECT
    spo.id AS partner_id,
    spo.key AS partner_key,
    spo.name AS partner_name,
    spos.id AS site_id,
    spos.name AS site_name,
    spo.school_id AS school_id
FROM
    student_partner_orgs spo
    LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id
WHERE
    spo.key = :partnerKey!
    AND ((:partnerSite)::text IS NULL
        OR spos.name = :partnerSite);


/* @name getStudentPartnerOrgBySchoolId */
SELECT
    spo.id AS partner_id,
    spo.key AS partner_key,
    spo.name AS partner_name,
    spos.id AS site_id,
    spos.name AS site_name,
    spo.school_id AS school_id
FROM
    student_partner_orgs spo
    LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id
    LEFT JOIN schools school ON spo.school_id = school.id
WHERE
    school.id = :schoolId!
    AND school.partner = TRUE;


/* @name getFullStudentPartnerOrgByKey */
SELECT
    KEY,
    spo.name,
    signup_code,
    high_school_signup,
    college_signup,
    school_signup_required,
    sites.sites,
    (
        CASE WHEN school_id IS NOT NULL THEN
            TRUE
        ELSE
            FALSE
        END) AS is_school,
    CASE WHEN spoui.deactivated_on IS NULL THEN
        FALSE
    ELSE
        TRUE
    END AS deactivated
FROM
    student_partner_orgs spo
    LEFT JOIN LATERAL (
        SELECT
            array_agg(name) AS sites
        FROM
            student_partner_org_sites spos
        WHERE
            spo.id = spos.student_partner_org_id) AS sites ON TRUE
    JOIN ( SELECT DISTINCT ON (student_partner_org_id)
            student_partner_org_id,
            deactivated_on
        FROM
            student_partner_orgs_upchieve_instances
        ORDER BY
            student_partner_org_id,
            created_at DESC,
            updated_at DESC) AS spoui ON spo.id = spoui.student_partner_org_id
WHERE
    KEY = :key!;


/* @name getStudentPartnerOrgs */
SELECT
    KEY,
    spo.name AS name,
    signup_code,
    high_school_signup,
    college_signup,
    school_signup_required,
    sites.sites,
    (
        CASE WHEN school_id IS NOT NULL THEN
            TRUE
        ELSE
            FALSE
        END) AS is_school,
    CASE WHEN spoui.deactivated_on IS NULL THEN
        FALSE
    ELSE
        TRUE
    END AS deactivated
FROM
    student_partner_orgs spo
    LEFT JOIN LATERAL (
        SELECT
            array_agg(name) AS sites
        FROM
            student_partner_org_sites spos
        WHERE
            spo.id = spos.student_partner_org_id) AS sites ON TRUE
    JOIN ( SELECT DISTINCT ON (student_partner_org_id)
            student_partner_org_id,
            deactivated_on
        FROM
            student_partner_orgs_upchieve_instances
        ORDER BY
            student_partner_org_id,
            created_at DESC) AS spoui ON spo.id = spoui.student_partner_org_id;


/* @name getStudentPartnerOrgKeyByCode */
SELECT
    KEY
FROM
    student_partner_orgs
WHERE
    signup_code = :signupCode!;


/* @name createUserStudentPartnerOrgInstance */
INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id)
    VALUES (:userId!, :spoId!, :sposId);


/* @name migrateExistingStudentPartnerOrgs */
INSERT INTO student_partner_orgs_upchieve_instances (id, student_partner_org_id, created_at, updated_at)
SELECT
    generate_ulid (),
    spo.id,
    spo.created_at,
    NOW()
FROM
    student_partner_orgs spo;


/* @name backfillStudentPartnerOrgStartDates */
UPDATE
    student_partner_orgs_upchieve_instances
SET
    created_at = :createdAt!,
    deactivated_on = :endedAt,
    updated_at = NOW()
FROM
    student_partner_orgs spo
WHERE
    spo.id = student_partner_orgs_upchieve_instances.student_partner_org_id
    AND spo.name = :spoName!
RETURNING
    student_partner_orgs_upchieve_instances.id AS ok;


/* @name createStudentPartnerOrgInstance */
INSERT INTO student_partner_orgs_upchieve_instances (id, student_partner_org_id, created_at, updated_at)
SELECT
    generate_ulid (),
    spo.id,
    spo.created_at,
    NOW()
FROM
    student_partner_orgs spo
WHERE
    spo.name = :spoName!;


/* @name createSchoolStudentPartnerOrg */
INSERT INTO student_partner_orgs (id, KEY, name, signup_code, high_school_signup, college_signup, school_signup_required, school_id, created_at, updated_at)
SELECT
    generate_ulid (),
    TRANSLATE(BTRIM(LOWER(schools.name)), ' ', '-'),
    schools.name,
    TRANSLATE(BTRIM(UPPER(schools.name)), ' ', '-'),
    TRUE,
    FALSE,
    TRUE,
    COALESCE(schools.id, NULL),
    NOW(),
    NOW()
FROM
    schools
WHERE
    partner IS TRUE
    AND name = :schoolName!
ON CONFLICT (name)
    DO UPDATE SET
        updated_at = NOW();


/* @name deactivateStudentPartnerOrg */
UPDATE
    student_partner_orgs_upchieve_instances
SET
    deactivated_on = NOW(),
    updated_at = NOW()
FROM
    student_partner_orgs spo
WHERE
    spo.id = student_partner_orgs_upchieve_instances.student_partner_org_id
    AND spo.name = :spoName!
RETURNING
    student_partner_orgs_upchieve_instances.id AS ok;


/* @name migratePartnerSchoolsToPartnerOrgs */
INSERT INTO student_partner_orgs (id, KEY, name, signup_code, high_school_signup, college_signup, school_signup_required, school_id, created_at, updated_at)
SELECT
    generate_ulid (),
    TRANSLATE(BTRIM(LOWER(schools.name)), ' ', '-'),
    schools.name,
    TRANSLATE(BTRIM(UPPER(schools.name)), ' ', '-'),
    TRUE,
    FALSE,
    TRUE,
    schools.id,
    :createdAt!,
    NOW()
FROM
    schools
WHERE
    partner IS TRUE
    AND name = :schoolName!;


/* @name migrateExistingStudentPartnerOrgRelationships */
INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, student_partner_org_user_id, created_at, updated_at)
SELECT
    users.id,
    sp.student_partner_org_id,
    sp.student_partner_org_site_id,
    sp.student_partner_org_user_id,
    sp.created_at,
    NOW()
FROM
    users
    JOIN student_profiles sp ON sp.user_id = users.id
WHERE
    sp.student_partner_org_id IS NOT NULL;


/* @name migrateExistingPartnerSchoolRelationships */
INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, student_partner_org_user_id, created_at, updated_at)
SELECT
    users.id,
    spo.id,
    NULL,
    NULL,
    sp.created_at,
    NOW()
FROM
    users
    JOIN student_profiles sp ON sp.user_id = users.id
    JOIN student_partner_orgs spo ON spo.school_id = sp.school_id;

