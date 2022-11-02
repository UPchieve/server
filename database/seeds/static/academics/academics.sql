/* @name insertCertification */
INSERT INTO certifications (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertQuiz */
INSERT INTO quizzes (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertCertificationGrant */
INSERT INTO quiz_certification_grants (quiz_id, certification_id, created_at, updated_at) VALUES (:quizId!, :certificationId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING quiz_id AS ok;

/* @name insertQuizSubcategory */
INSERT INTO quiz_subcategories (quiz_id, name, created_at, updated_at) VALUES (:quizId!, :name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertQuizQuestion */
INSERT INTO quiz_questions (correct_answer, possible_answers, quiz_subcategory_id, question_text, created_at, updated_at) VALUES (:correctAnswer!, :possibleAnswers!, :subCategoryId!, :questionText!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertSubject */
INSERT INTO subjects (name, display_name, display_order, tool_type_id, topic_id, created_at, updated_at) VALUES (:name!, :displayName!, :displayOrder!, :toolTypeId!, :topicId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertCertificationSubjectUnlocks */
INSERT INTO certification_subject_unlocks (certification_id, subject_id, created_at, updated_at) VALUES (:certificationId!, :subjectId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING subject_id AS ok;

/* @name insertToolType */
INSERT INTO tool_types (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertTopic */
INSERT INTO topics (name, display_name, dashboard_order, created_at, updated_at) VALUES (:name!, :displayName!, :dashboardOrder!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertTrainingCourse */
INSERT INTO training_courses (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING name AS ok;

/* @name getCertifications */
SELECT
    id,
    name
FROM
    certifications;

/* @name getQuizzes */
SELECT
    id,
    name
FROM
    quizzes;