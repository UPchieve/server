/* @name insertVolunteerPartnerOrg */
WITH ins AS(
    INSERT INTO volunteer_partner_orgs (id, name, key, receive_weekly_hour_summary_email, created_at, updated_at)
        VALUES (:id!, :name!, :key!, :receiveWeeklyHourSummaryEmail!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM volunteer_partner_orgs WHERE key=:key!;


/* @name insertStudentPartnerOrg */
WITH ins AS(
    INSERT INTO student_partner_orgs (id, name, key, high_school_signup, school_signup_required, created_at, updated_at)
        VALUES (:id!, :name!, :key!, :highSchoolSignup!, :schoolSignupRequired!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM student_partner_orgs WHERE key=:key!;


/* @name insertStudentPartnerOrgSite */
WITH ins AS(
    INSERT INTO student_partner_org_sites (id, name, student_partner_org_id, created_at, updated_at)
        VALUES (:id!, :name!, :studentPartnerOrgId!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM student_partner_org_sites WHERE name=:name! AND student_partner_org_id=:studentPartnerOrgId!;


/* @name insertRequiredEmailDomain */
WITH ins AS(
    INSERT INTO required_email_domains (id, domain, volunteer_partner_org_id, created_at, updated_at)
        VALUES (:id!, :domain!, :volunteerPartnerOrgId!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM required_email_domains WHERE id=:id!;

