/* @name insertSchool */
INSERT INTO schools (id, name, approved, partner, city_id, created_at, updated_at) VALUES (:id!, :name!, :approved!, :partner!, :cityId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertStudentUser */
WITH ins AS(
INSERT INTO users (id, email, password, first_name, last_name, referral_code, verified, created_at, updated_at)
VALUES (:id!, :email!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, NOW(), NOW())
ON CONFLICT DO NOTHING
RETURNING id AS ok)
SELECT
    *
FROM
    ins
UNION
SELECT
    id
FROM
    users
WHERE
    email = :email!;


/* @name insertStudentProfile */
INSERT INTO student_profiles (user_id, student_partner_org_id, school_id, created_at, updated_at) VALUES (:userId!, :studentPartnerOrgId, :schoolId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok;

/* @name insertVolunteerUser */
WITH ins AS (
INSERT INTO users (id, email, phone, password, first_name, last_name, referral_code, verified, test_user, time_tutored, created_at, updated_at)
VALUES (:id!, :email!, :phone!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, :testUser!, :timeTutored!, NOW(), NOW())
ON CONFLICT DO NOTHING
RETURNING id AS ok)
SELECT
    *
FROM
    ins
UNION
SELECT
    id
FROM
    users
WHERE
    email = :email!;

/* @name insertUserSessionMetrics */
INSERT INTO user_session_metrics(user_id, created_at, updated_at)
VALUES (:id!, NOW(), NOW())
RETURNING user_id AS ok;

/* @name insertVolunteerProfile */
INSERT INTO volunteer_profiles (user_id, timezone, approved, onboarded, college, volunteer_partner_org_id, created_at, updated_at) VALUES (:userId!, :timezone!, :approved!, :onboarded!, :college!, :volunteerPartnerOrgId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok;

/* @name insertUserCertification */
INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at) VALUES (:userId!, :certificationId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok;

/* @name insertIntoUserQuizzes */
INSERT INTO users_quizzes (user_id, quiz_id, attempts, passed, created_at, updated_at) VALUES (:userId!, :quizId!, :attempts!, :passed!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok;

/* @name insertAdminProfile */
INSERT INTO admin_profiles (user_id, created_at, updated_at) VALUES (:userId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok;

/* @name insertSession */
INSERT INTO sessions (id, student_id, volunteer_id, subject_id, created_at, updated_at) VALUES (:id!, :studentId!, :volunteerId!, :subjectId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertStudentFavoriteVolunteers */
INSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at) VALUES (:studentId!, :volunteerId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING student_id AS ok;

/* @name getVolunteerPartnerOrgs */
SELECT
  id,
  key AS name
FROM volunteer_partner_orgs;

/* @name getStudentPartnerOrgs */
SELECT
  id,
  key AS name
FROM student_partner_orgs;

/* @name getCertifications */
SELECT id, name FROM certifications;

/* @name getQuizzes */
SELECT id, name FROM quizzes;

/* @name getAlgebraOneSubcategories */
SELECT qs.id, qs.name FROM quiz_subcategories qs JOIN quizzes q ON q.id = qs.quiz_id WHERE q.name = 'algebraOne';

/* @name insertQuizQuestion */
INSERT INTO quiz_questions (question_text, possible_answers, correct_answer, quiz_subcategory_id, created_at, updated_at)
VALUES (:questionText!, :possibleAnswers!, :correctAnswer!, :quizSubcategoryId!, NOW(), NOW())
RETURNING id AS ok;

/* @name insertCity */
INSERT INTO cities (name, us_state_code, created_at, updated_at)
VALUES (:name!, :usStateCode!, NOW(), NOW())
RETURNING id as ok;


/* @name insertUserProductFlags */
INSERT INTO user_product_flags (user_id, created_at, updated_at)
VALUES (:id!, NOW(), NOW())
RETURNING user_id AS ok;


/* @name insertSchoolStudentPartners */
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
    NOW(),
    NOW()
FROM
    schools
WHERE
    partner IS TRUE
    AND name = :schoolName!
    RETURNING id as ok;
