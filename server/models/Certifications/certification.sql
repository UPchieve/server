/* @name addCertificationsForPassedQuiz */
INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at)
SELECT
    :userId!,
    subquery.certification_id,
    NOW(),
    NOW()
FROM (
    SELECT
        certification_id
    FROM
        quiz_certification_grants
    LEFT JOIN quizzes ON quizzes.id = quiz_certification_grants.quiz_id
WHERE
    quizzes.name = ANY (:quizzes!)) AS subquery
ON CONFLICT
    DO NOTHING
RETURNING (
    SELECT
        name
    FROM
        certifications
    WHERE
        id = certification_id);


/* @name getVolunteersWithCerts */
SELECT
    user_id,
    attempts AS tries,
    users_quizzes.updated_at AS last_attempted_at,
    passed,
    quizzes.name
FROM
    users_quizzes
    JOIN quizzes ON users_quizzes.quiz_id = quizzes.id;

