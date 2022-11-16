/* @name insertVolunteerPartnerOrg */
INSERT INTO volunteer_partner_orgs (id, name, key, receive_weekly_hour_summary_email, created_at, updated_at) VALUES (:id!, :name!, :key!, :receiveWeeklyHourSummaryEmail!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertStudentPartnerOrg */
INSERT INTO student_partner_orgs (id, name, key, high_school_signup, college_signup, school_signup_required, signup_code, created_at, updated_at) VALUES (:id!, :name!, :key!, :highSchoolSignup!, :collegeSignup!, :schoolSignupRequired!, :signupCode!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertStudentPartnerOrgSite */
INSERT INTO student_partner_org_sites (id, name, student_partner_org_id, created_at, updated_at) VALUES (:id!, :name!, :studentPartnerOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertRequiredEmailDomain */
INSERT INTO required_email_domains (id, domain, volunteer_partner_org_id, created_at, updated_at) VALUES (:id!, :domain!, :volunteerPartnerOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertAssociatedPartner */
INSERT INTO associated_partners (id, key, volunteer_partner_org_id, student_partner_org_id, student_sponsor_org_id, created_at, updated_at) VALUES (:id!, :key!, :vpoId!, :spoId, :soId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertSponsorOrg */
INSERT INTO sponsor_orgs (id, key, name, created_at, updated_at) VALUES (:id!, :key!, :name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertSchoolsSponsorOrg */
INSERT INTO schools_sponsor_orgs (school_id, sponsor_org_id, created_at, updated_at) VALUES (:schoolId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING school_id AS ok;

/* @name insertStudentPartnerSponsorOrg */
INSERT INTO student_partner_orgs_sponsor_orgs (student_partner_org_id, sponsor_org_id, created_at, updated_at) VALUES (:spoId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING student_partner_org_id AS ok;

/* @name insertStudentPartnerOrgInstances */
INSERT INTO student_partner_orgs_upchieve_instances (id, student_partner_org_id, created_at, updated_at)
SELECT
    generate_ulid (),
    spo.id,
    spo.created_at,
    NOW()
FROM
    student_partner_orgs spo;


/* @name insertExistingStudentPartnerOrgRelationships */
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


/* @name insertExistingPartnerSchoolRelationships */
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



/* @name insertExistingVolunteerPartnerOrgs */
INSERT INTO volunteer_partner_orgs_upchieve_instances (id, volunteer_partner_org_id, created_at, updated_at)
SELECT
    generate_ulid (),
    vpo.id,
    vpo.created_at,
    NOW()
FROM
    volunteer_partner_orgs vpo;


/* @name insertExistingVolunteerPartnerOrgRelationships */
INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)
SELECT
    users.id,
    vp.volunteer_partner_org_id,
    vp.created_at,
    NOW()
FROM
    users
    JOIN volunteer_profiles vp ON vp.user_id = users.id
WHERE
    vp.volunteer_partner_org_id IS NOT NULL;


/* @name insertExistingSponsorOrgs */
INSERT INTO sponsor_orgs_upchieve_instances (id, sponsor_org_id, created_at, updated_at)
SELECT
    generate_ulid (),
    so.id,
    so.created_at,
    NOW()
FROM
    sponsor_orgs so;


/* @name insertExistingPartnerOrgSponsorOrgRelationships */
INSERT INTO student_partner_orgs_sponsor_orgs_instances (student_partner_org_id, sponsor_org_id, created_at, updated_at)
SELECT
    sposo.student_partner_org_id,
    sposo.sponsor_org_id,
    sposo.created_at,
    NOW()
FROM
    student_partner_orgs_sponsor_orgs sposo;


/* @name insertExistingSchoolsSponsorOrgRelationships */
INSERT INTO schools_sponsor_orgs_instances (school_id, sponsor_org_id, created_at, updated_at)
SELECT
    sso.school_id,
    sso.sponsor_org_id,
    sso.created_at,
    NOW()
FROM
    schools_sponsor_orgs sso;


/* @name insertStudentPartnerOrgAssociatedPartners */
INSERT INTO student_partner_orgs_volunteer_partner_orgs_instances (student_partner_org_id, volunteer_partner_org_id, created_at, updated_at)
SELECT
    ap.student_partner_org_id,
    ap.volunteer_partner_org_id,
    ap.created_at,
    NOW()
FROM
    associated_partners ap
WHERE
    ap.student_partner_org_id IS NOT NULL;


/* @name insertSponsorOrgAssociatedPartners */
INSERT INTO sponsor_orgs_volunteer_partner_orgs_instances (sponsor_org_id, volunteer_partner_org_id, created_at, updated_at)
SELECT
    ap.student_sponsor_org_id,
    ap.volunteer_partner_org_id,
    ap.created_at,
    NOW()
FROM
    associated_partners ap
WHERE
    ap.student_sponsor_org_id IS NOT NULL;