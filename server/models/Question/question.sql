/* @name list */
SELECT
    ques.id,
    question_text,
    possible_answers,
    correct_answer,
    quizzes.name AS category,
    subcat.name AS subcategory,
    image_source AS image_src,
    ques.created_at,
    ques.updated_at,
    ques.mongo_id
FROM
    quiz_questions AS ques
    LEFT JOIN quiz_subcategories subcat ON ques.quiz_subcategory_id = subcat.id
    LEFT JOIN quizzes ON quizzes.id = subcat.quiz_id
WHERE
    quizzes.name = :category!
    OR subcat.name = :subcategory;


/* @name create */
WITH quiz AS (
INSERT INTO quizzes (id, name, created_at, updated_at)
        VALUES (:quizId!, :category!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
), subcategory AS (
INSERT INTO quiz_subcategories (id, name, created_at, updated_at)
        VALUES (:quizSubcategoryId!, :subcategory!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id)
    INSERT INTO quiz_questions (id, question_text, possible_answers, correct_answer, image_source, created_at, updated_at, quiz_subcategory_id)
    SELECT
        :questionId!,
        :questionText!,
        :possibleAnswers!,
        :correctAnswer!,
        :imageSrc!,
        NOW(),
        NOw(),
        subcategory.id
    FROM
        subcategory;


/* @name destroy */
DELETE FROM quiz_questions
WHERE quiz_questions.id = :questionId!
RETURNING
    id AS ok;


/* @name updateSubcategory */
INSERT INTO quiz_subcategories (id, name, created_at, updated_at)
    VALUES (:quizSubcategoryId!, :subcategory!, NOW(), NOW())
ON CONFLICT
    DO NOTHING;


/* @name update */
UPDATE
    quiz_questions
SET
    id = :questionId!,
    question_text = :questionText!,
    possible_answers = possible_answers || jsonb_set(jsonb_set(possible_answers, '{txt}', :txt!, TRUE), '{val}', :val!, TRUE),
    correct_answer = :correctAnswer!,
    image_source = :imageSrc!,
    updated_at = NOW(),
    quiz_subcategory_id = subcat.id
FROM (
    SELECT
        id
    FROM
        quiz_subcategories
    WHERE
        name = :subcategory!) AS subcat
WHERE
    quiz_questions.id = :questionId!;


/* @name categories */
SELECT
    quizzes.name AS categories,
    array_agg(quiz_subcategories.name) AS subcategories
FROM
    quizzes
    LEFT JOIN quiz_subcategories ON quiz_subcategories.quiz_id = quizzes.id
GROUP BY
    quizzes.name;

