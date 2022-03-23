/* @name create */
WITH subject AS (
INSERT INTO subjects (id, name, created_at, updated_at)
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
                subjects
            WHERE
                subjects.name = :category!)
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
    *;


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
    subcat.name
FROM
    quiz_questions AS questions
    LEFT JOIN quiz_subcategories subcat ON questions.quiz_subcategory_id = subcat.id
GROUP BY
    subcat.id;


/* @name topics */
SELECT
    topics.name
FROM
    subjects
    LEFT JOIN topics ON subjects.topic_id = topics.id
GROUP BY
    topics.id;

