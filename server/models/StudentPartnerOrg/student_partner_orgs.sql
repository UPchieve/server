/* @name getStudentPartnerOrgForRegistrationByKey */
SELECT key, ARRAY_AGG(spos.name) AS sites
FROM student_partner_orgs spo
JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id
WHERE spo.key=:key!
GROUP BY spo.key;

/* @name getFullStudentPartnerOrgByKey */
SELECT
       key,
       string_agg(signup_code, null) as signup_code,
       bool_or(high_school_signup) as high_school_signup,
       bool_or(college_signup) as college_signup,
       bool_or(school_signup_required) as school_signup_required,
       array_agg(spos.name) as sites
from student_partner_orgs spo
join student_partner_org_sites spos on spo.id = spos.student_partner_org_id
where key=:key!
group by spo.key;

/* @name getStudentPartnerOrgs */
SELECT
       key,
       max(signup_code) as signup_code,
       bool_or(high_school_signup) as high_school_signup,
       bool_or(college_signup) as college_signup,
       bool_or(school_signup_required) as school_signup_required,
       array_agg(spos.name) as sites
from student_partner_orgs spo
join student_partner_org_sites spos on spo.id = spos.student_partner_org_id
group by spo.key;

/* @name getStudentPartnerOrgKeyByCode */
SELECT key
FROM student_partner_orgs
WHERE signup_code=:signupCode!;
