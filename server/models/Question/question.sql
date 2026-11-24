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


/* @name getQuizReviewMaterials */
SELECT
    q.name AS category,
    qm.title,
    qm.pdf,
    qm.image
FROM
    upchieve.quiz_review_materials AS qm
    JOIN upchieve.quizzes AS q ON q.id = qm.quiz_id
WHERE
    q.name = :category!;


/* @name getQuizCertUnlocksByQuizName */
SELECT
    quizzes.name AS quiz_name,
    CASE WHEN topics.name IS NULL THEN
        FALSE
    ELSE
        TRUE
    END AS is_subject_certification,
    subject_quiz_info.display_name AS quiz_display_name,
    subject_quiz_info.display_order AS quiz_display_order,
    certs.name AS unlocked_cert_name,
    subject_cert_info.display_name AS unlocked_cert_display_name,
    subject_cert_info.display_order AS unlocked_cert_display_order,
    topics.name AS topic_name,
    topics.display_name AS topic_display_name,
    topics.dashboard_order AS topic_dashboard_order,
    topics.training_order AS topic_training_order
FROM
    quiz_certification_grants qcg
    JOIN quizzes ON quizzes.id = qcg.quiz_id
    JOIN certifications certs ON certs.id = qcg.certification_id
    LEFT JOIN subjects AS subject_quiz_info ON subject_quiz_info.name = quizzes.name
    LEFT JOIN subjects AS subject_cert_info ON subject_cert_info.name = certs.name
    LEFT JOIN topics ON topics.id = subject_cert_info.topic_id
WHERE
    quizzes.name = :quizName!;


/* @name getQuizByName */
SELECT
    id,
    name,
    active,
    questions_per_subcategory
FROM
    quizzes
WHERE
    quizzes.name = :quizName!;

