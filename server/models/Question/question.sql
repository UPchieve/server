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
    ques.updated_at
FROM
    quiz_questions AS ques
    LEFT JOIN quiz_subcategories subcat ON ques.quiz_subcategory_id = subcat.id
    LEFT JOIN quizzes ON quizzes.id = subcat.quiz_id
WHERE
    quizzes.name = :category!
    OR subcat.name = :subcategory;


/* @name create */
INSERT INTO quiz_questions (question_text, possible_answers, correct_answer, image_source, quiz_subcategory_id, created_at, updated_at)
    VALUES (:questionText!, :possibleAnswers!, :correctAnswer!, :imageSrc, :subcategoryId!, NOW(), NOW())
RETURNING
    id, question_text, possible_answers, correct_answer, image_source AS image_src, created_at, updated_at;


/* @name upsertQuiz */
WITH ins AS (
INSERT INTO quizzes (name, created_at, updated_at)
        VALUES (:name!, NOW(), NOW())
    ON CONFLICT (name)
        DO NOTHING
    RETURNING
        id)
    SELECT
        *
    FROM
        ins
    UNION
    SELECT
        id
    FROM
        quizzes
    WHERE
        name = :name!;


/* @name upsertQuizSubcategory */
WITH ins AS (
INSERT INTO quiz_subcategories (name, quiz_id, created_at, updated_at)
        VALUES (:name!, :quizId!, NOW(), NOW())
    ON CONFLICT (name, quiz_id)
        DO NOTHING
    RETURNING
        id)
    SELECT
        *
    FROM
        ins
    UNION
    SELECT
        id
    FROM
        quiz_subcategories
    WHERE
        name = :name!;


/* @name destroy */
DELETE FROM quiz_questions
WHERE quiz_questions.id = :questionId!
RETURNING
    id AS ok;


/* @name updateSubcategory */
INSERT INTO quiz_subcategories (id, name, quiz_id, created_at, updated_at)
    VALUES (:quizSubcategoryId!, :subcategory!, :quizId!, NOW(), NOW())
ON CONFLICT
    DO NOTHING;


/* @name update */
UPDATE
    quiz_questions
SET
    question_text = :questionText!,
    possible_answers = COALESCE(:possibleAnswers!, possible_answers),
    correct_answer = :correctAnswer!,
    image_source = COALESCE(:imageSrc, image_source),
    updated_at = NOW(),
    quiz_subcategory_id = :subcategoryId!
WHERE
    quiz_questions.id = :questionId!
RETURNING
    id AS ok;


/* @name categories */
SELECT
    quizzes.name AS categories,
    array_agg(quiz_subcategories.name) AS subcategories
FROM
    quizzes
    LEFT JOIN quiz_subcategories ON quiz_subcategories.quiz_id = quizzes.id
GROUP BY
    quizzes.name;


/* @name getSubcategoriesForQuiz */
SELECT
    quiz_subcategories.name
FROM
    quiz_subcategories
    JOIN quizzes ON quiz_subcategories.quiz_id = quizzes.id
WHERE
    quizzes.name = :quizName!;


/* @name getMultipleQuestionsById */
SELECT
    ques.id,
    question_text,
    possible_answers,
    correct_answer,
    quizzes.name AS category,
    quiz_subcategories.name AS subcategory,
    image_source AS image_src,
    ques.created_at,
    ques.updated_at
FROM
    quiz_questions ques
    LEFT JOIN quiz_subcategories ON quiz_subcategories.id = ques.quiz_subcategory_id
    LEFT JOIN quizzes ON quizzes.id = quiz_subcategories.quiz_id
WHERE
    ques.id = ANY (:ids!);


/* @name getQuestionsByCategory */
SELECT
    ques.id,
    question_text,
    possible_answers,
    correct_answer,
    quizzes.name AS category,
    quiz_subcategories.name AS subcategory,
    image_source AS image_src,
    ques.created_at,
    ques.updated_at
FROM
    quiz_questions ques
    LEFT JOIN quiz_subcategories ON quiz_subcategories.id = ques.quiz_subcategory_id
    LEFT JOIN quizzes ON quizzes.id = quiz_subcategories.quiz_id
WHERE
    quizzes.name = :category!
LIMIT (:limit!)::int OFFSET (:offset!)::int;

