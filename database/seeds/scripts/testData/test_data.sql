/* @name insertSchool */
INSERT INTO schools (id, name, approved, partner, created_at, updated_at) VALUES (:id!, :name!, :approved!, :partner!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertStudentUser */
INSERT INTO users (id, email, password, first_name, last_name, referral_code, verified, created_at, updated_at) VALUES (:id!, :email!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertStudentProfile */
INSERT INTO student_profiles (user_id, student_partner_org_id, created_at, updated_at) VALUES (:userId!, :studentPartnerOrgId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok;

/* @name insertVolunteerUser */
INSERT INTO users (id, email, password, first_name, last_name, referral_code, verified, test_user, time_tutored, created_at, updated_at) VALUES (:id!, :email!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, :testUser!, :timeTutored!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertVolunteerProfile */
INSERT INTO volunteer_profiles (user_id, timezone, approved, onboarded, college, volunteer_partner_org_id, created_at, updated_at) VALUES (:userId!, :timezone!, :approved!, :onboarded!, :college!, :volunteerPartnerOrgId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok;

/* @name insertUserCertification */
INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at) VALUES (:userId!, :certificationId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok;

/* @name insertIntoUserQuizzes */
INSERT INTO users_quizzes (user_id, quiz_id, created_at, updated_at) VALUES (:userId!, :quizId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok;

/* @name insertAdminProfile */
INSERT INTO admin_profiles (user_id, created_at, updated_at) VALUES (:userId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok;
