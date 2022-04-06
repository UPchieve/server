/* @name insertVolunteerPartnerOrg */
INSERT INTO volunteer_partner_orgs (id, name, key, receive_weekly_hour_summary_email, created_at, updated_at) VALUES (:id!, :name!, :key!, :receiveWeeklyHourSummaryEmail!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertStudentPartnerOrg */
INSERT INTO student_partner_orgs (id, name, key, high_school_signup, college_signup, school_signup_required, signup_code, created_at, updated_at) VALUES (:id!, :name!, :key!, :highSchoolSignup!, :collegeSignup, :schoolSignupRequired!, :signupCode, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertStudentPartnerOrgSite */
INSERT INTO student_partner_org_sites (id, name, student_partner_org_id, created_at, updated_at) VALUES (:id!, :name!, :studentPartnerOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertRequiredEmailDomain */
INSERT INTO required_email_domains (id, domain, volunteer_partner_org_id, created_at, updated_at) VALUES (:id!, :domain!, :volunteerPartnerOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertAssociatedPartner */
INSERT INTO associated_partners (id, key, volunteer_partner_org_id, student_partner_org_id, student_sponsor_org_id, created_at, updated_at) VALUES (:id!, :key!, :volunteerPartnerOrgId!, :studentPartnerOrgId, :studentSponsorOrgId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertSponsorOrg */
INSERT INTO sponsor_orgs (id, key, name, created_at, updated_at) VALUES (:id!, :key!, :name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name getSchoolIdByMongoId */
SELECT id from schools WHERE mongo_id = :mongoId!;

/* @name insertSchoolsSponsorOrgs */
INSERT INTO schools_sponsor_orgs (school_id, sponsor_org_id, created_at, updated_at) VALUES (:schoolId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING school_id, sponsor_org_id AS ok;

/* @name insertStudentPartnerOrgsSponsorOrgs */
INSERT INTO student_partner_orgs_sponsor_orgs (student_partner_org_id, sponsor_org_id, created_at, updated_at) VALUES (:studentPartnerOrgId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING student_partner_org_id, sponsor_org_id AS ok;

/* @name getStudentPartnerOrgs */
SELECT
  id,
  key
FROM student_partner_orgs;

/* @name getSponsorOrgs */
SELECT
  id, key
FROM sponsor_orgs;

/* @name insertAdminUser */
INSERT INTO admin_profiles (user_id, created_at, updated_at)
SELECT
  users.id,
  NOW(),
  NOW()
FROM users
WHERE mongo_id = ANY(:mongoIds!)
RETURNING user_id AS ok;

/* @name updateSchoolPartner */
UPDATE schools
SET
  partner = TRUE
WHERE
  mongo_id = ANY(:mongoIds!)
RETURNING mongo_id AS ok;

/* @name updateInGatesStudy */
UPDATE user_product_flags
SET in_gates_study = TRUE
FROM users
WHERE
  user_id = users.id AND
  users.mongo_id = ANY(:mongoIds!)
RETURNING users.mongo_id AS ok;
