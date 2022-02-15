/* @name insertCertification */
WITH ins AS(
    INSERT INTO certifications (name, created_at, updated_at)
        VALUES (:name!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM certifications WHERE name=:name!;


/* @name insertQuiz */
WITH ins AS(
    INSERT INTO quizzes (name, created_at, updated_at)
        VALUES (:name!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM quizzes WHERE name=:name!;


/* @name insertCertificationGrant */
WITH ins AS(
    INSERT INTO quiz_certification_grants (quiz_id, certification_id, created_at, updated_at)
        VALUES (:quizId!, :certificationId!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        quiz_id AS ok
)
SELECT * FROM ins
UNION
    SELECT quiz_id AS ok FROM quiz_certification_grants WHERE quiz_id=:quizId! AND certification_id=:certificationId!;


/* @name insertQuizSubcategory */
WITH ins AS(
    INSERT INTO quiz_subcategories (quiz_id, name, created_at, updated_at)
        VALUES (:quizId!, :name!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        name AS ok
)
SELECT * FROM ins
UNION
    SELECT name AS ok FROM quiz_subcategories WHERE quiz_id=:quizId! AND name=:name!;


/* @name insertSubject */
WITH ins AS(
    INSERT INTO subjects (name, display_name, display_order, tool_type_id, topic_id, created_at, updated_at)
        VALUES (:name!, :displayName!, :displayOrder!, :toolTypeId!, :topicId!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM subjects WHERE name=:name!;


/* @name insertCertificationSubjectUnlocks */
WITH ins AS(
    INSERT INTO certification_subject_unlocks (certification_id, subject_id, created_at, updated_at)
        VALUES (:certificationId!, :subjectId!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        subject_id AS ok
)
SELECT * FROM ins
UNION
    SELECT subject_id AS ok FROM certification_subject_unlocks WHERE certification_id=:certificationId! AND subject_id=:subjectId!;


/* @name insertToolType */
WITH ins AS(
    INSERT INTO tool_types (name, created_at, updated_at)
        VALUES (:name!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM tool_types WHERE name=:name!;


/* @name insertTopic */
WITH ins AS(
    INSERT INTO topics (name, display_name, dashboard_order, created_at, updated_at)
        VALUES (:name!, :displayName!, :dashboardOrder!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM topics WHERE name=:name!;


/* @name insertTrainingCourse */
WITH ins AS(
    INSERT INTO training_courses (name, created_at, updated_at)
        VALUES (:name!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        name AS ok
)
SELECT * FROM ins
UNION
    SELECT name AS ok FROM training_courses WHERE name=:name!;

