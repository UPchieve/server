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
    SELECT
        :subjectId!,
        :category!,
        NOW(),
        NOW()
    WHERE
        NOT EXISTS (
            SELECT
                name
            FROM
                quizzes
            WHERE
                quizzes.name = :category!)
),
subcategory AS (
INSERT INTO quiz_subcategories (id, name, created_at, updated_at)
    SELECT
        :quizSubcategoryId!,
        :subcategory!,
        NOW(),
        NOW()
    WHERE
        NOT EXISTS (
            SELECT
                name
            FROM
                quiz_subcategories
            WHERE
                quiz_subcategories.name = :subcategory!)
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
    id,
    question_text,
    possible_answers,
    correct_answer,
    image_source AS image_src,
    created_at,
    updated_at,
    mongo_id;


/* @name getQuestionCategory */
SELECT
    quizzes.name AS category,
    subcat.name AS subcategory
FROM
    quiz_questions AS ques
    LEFT JOIN quiz_subcategories subcat ON ques.quiz_subcategory_id = subcat.id
    LEFT JOIN quizzes ON quizzes.id = subcat.quiz_id
WHERE
    ques.id = :questionId!;


/* @name update */
WITH subcategory AS (
INSERT INTO quiz_subcategories (id, name, created_at, updated_at)
    SELECT
        :quizSubcategoryId!,
        :subcategory!,
        NOW(),
        NOW()
    WHERE
        NOT EXISTS (
            SELECT
                name
            FROM
                quiz_subcategories
            WHERE
                quiz_subcategories.name = :subcategory!)
        RETURNING
            id)
UPDATE
    quiz_questions
SET
    id = :questionId!,
    question_text = :questionText!,
    possible_answers = jsonb_set(possible_answers, '{txt}', :txt!, TRUE),
    correct_answer = :correctAnswer!,
    image_source = :imageSrc!,
    updated_at = NOW(),
    quiz_subcategory_id = subcategory.id
FROM
    subcategory
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

