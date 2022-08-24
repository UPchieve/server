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


/* @name getFullStudentPartnerOrgByKey */
SELECT
    KEY,
    spo.name,
    signup_code,
    high_school_signup,
    college_signup,
    school_signup_required,
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
    KEY = :key!;


/* @name getStudentPartnerOrgs */
SELECT
    KEY,
    spo.name AS name,
    signup_code,
    high_school_signup,
    college_signup,
    school_signup_required,
    sites.sites
FROM
    student_partner_orgs spo
    LEFT JOIN LATERAL (
        SELECT
            array_agg(name) AS sites
        FROM
            student_partner_org_sites spos
        WHERE
            spo.id = spos.student_partner_org_id) AS sites ON TRUE;


/* @name getStudentPartnerOrgKeyByCode */
SELECT
    KEY
FROM
    student_partner_orgs
WHERE
    signup_code = :signupCode!;


/* @name migrateExistingStudentPartnerOrgs */
INSERT INTO student_partner_orgs_upchieve_instances (id, student_partner_org_id, created_at, updated_at)
SELECT
    generate_ulid (),
    spo.id,
    spo.created_at,
    NOW()
FROM
    student_partner_orgs spo;


/* @name migratepPartnerSchoolsToPartnerOrgs */
INSERT INTO student_partner_orgs (id, KEY, name, high_school_signup, college_signup, school_signup_required, school_id, created_at, updated_at)
SELECT
    generate_ulid (),
    schools.name,
    schools.name,
    TRUE,
    FALSE,
    TRUE,
    schools.id,
    schools.created_at,
    NOW()
FROM
    schools
WHERE
    partner IS TRUE;


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
    sp.student_partner_org_id,
    NULL,
    NULL,
    sp.created_at,
    NOW()
FROM
    users
    JOIN student_profiles sp ON sp.user_id = users.id
    JOIN student_partner_orgs spo ON spo.school_id = sp.school_id;

