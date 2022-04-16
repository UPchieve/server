/* @name getStudentPartnerOrgForRegistrationByKey */
SELECT
    KEY,
    spo.name,
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

