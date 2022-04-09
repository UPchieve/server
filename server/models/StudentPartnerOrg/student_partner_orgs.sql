/* @name getStudentPartnerOrgForRegistrationByKey */
SELECT
    KEY,
    ARRAY_AGG(spos.name) AS sites
FROM
    student_partner_orgs spo
    LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id
WHERE
    spo.key = :key!
GROUP BY
    spo.key;


/* @name getFullStudentPartnerOrgByKey */
SELECT
    KEY,
    string_agg(signup_code, NULL) AS signup_code,
    bool_or(high_school_signup) AS high_school_signup,
    bool_or(college_signup) AS college_signup,
    bool_or(school_signup_required) AS school_signup_required,
    array_agg(spos.name) AS sites
FROM
    student_partner_orgs spo
    LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id
WHERE
    KEY = :key!
GROUP BY
    spo.key;


/* @name getStudentPartnerOrgs */
SELECT
    KEY,
    spo.name AS name,
    max(signup_code) AS signup_code,
    bool_or(high_school_signup) AS high_school_signup,
    bool_or(college_signup) AS college_signup,
    bool_or(school_signup_required) AS school_signup_required,
    array_agg(spos.name) AS sites
FROM
    student_partner_orgs spo
    LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id
GROUP BY
    spo.key,
    spo.name;


/* @name getStudentPartnerOrgKeyByCode */
SELECT
    KEY
FROM
    student_partner_orgs
WHERE
    signup_code = :signupCode!;

