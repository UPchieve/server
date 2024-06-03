"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizByName = exports.getQuizCertUnlocksByQuizName = exports.getQuizReviewMaterials = exports.getQuestionsByCategory = exports.getMultipleQuestionsById = exports.getSubcategoriesForQuiz = exports.categories = exports.update = exports.updateSubcategory = exports.destroy = exports.upsertQuizSubcategory = exports.upsertQuiz = exports.create = exports.list = void 0;
/** Types generated for queries found in "server/models/Question/question.sql" */
const query_1 = require("@pgtyped/query");
const listIR = { "name": "list", "params": [{ "name": "category", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 423, "b": 431, "line": 17, "col": 20 }] } }, { "name": "subcategory", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 455, "b": 465, "line": 18, "col": 22 }] } }], "usedParamSet": { "category": true, "subcategory": true }, "statement": { "body": "SELECT\n    ques.id,\n    question_text,\n    possible_answers,\n    correct_answer,\n    quizzes.name AS category,\n    subcat.name AS subcategory,\n    image_source AS image_src,\n    ques.created_at,\n    ques.updated_at\nFROM\n    quiz_questions AS ques\n    LEFT JOIN quiz_subcategories subcat ON ques.quiz_subcategory_id = subcat.id\n    LEFT JOIN quizzes ON quizzes.id = subcat.quiz_id\nWHERE\n    quizzes.name = :category!\n    OR subcat.name = :subcategory", "loc": { "a": 17, "b": 465, "line": 2, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ques.id,
 *     question_text,
 *     possible_answers,
 *     correct_answer,
 *     quizzes.name AS category,
 *     subcat.name AS subcategory,
 *     image_source AS image_src,
 *     ques.created_at,
 *     ques.updated_at
 * FROM
 *     quiz_questions AS ques
 *     LEFT JOIN quiz_subcategories subcat ON ques.quiz_subcategory_id = subcat.id
 *     LEFT JOIN quizzes ON quizzes.id = subcat.quiz_id
 * WHERE
 *     quizzes.name = :category!
 *     OR subcat.name = :subcategory
 * ```
 */
exports.list = new query_1.PreparedQuery(listIR);
const createIR = { "name": "create", "params": [{ "name": "questionText", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 638, "b": 650, "line": 23, "col": 13 }] } }, { "name": "possibleAnswers", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 654, "b": 669, "line": 23, "col": 29 }] } }, { "name": "correctAnswer", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 673, "b": 686, "line": 23, "col": 48 }] } }, { "name": "imageSrc", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 690, "b": 697, "line": 23, "col": 65 }] } }, { "name": "subcategoryId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 701, "b": 714, "line": 23, "col": 76 }] } }], "usedParamSet": { "questionText": true, "possibleAnswers": true, "correctAnswer": true, "imageSrc": true, "subcategoryId": true }, "statement": { "body": "INSERT INTO quiz_questions (question_text, possible_answers, correct_answer, image_source, quiz_subcategory_id, created_at, updated_at)\n    VALUES (:questionText!, :possibleAnswers!, :correctAnswer!, :imageSrc, :subcategoryId!, NOW(), NOW())\nRETURNING\n    id, question_text, possible_answers, correct_answer, image_source AS image_src, created_at, updated_at", "loc": { "a": 489, "b": 846, "line": 22, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO quiz_questions (question_text, possible_answers, correct_answer, image_source, quiz_subcategory_id, created_at, updated_at)
 *     VALUES (:questionText!, :possibleAnswers!, :correctAnswer!, :imageSrc, :subcategoryId!, NOW(), NOW())
 * RETURNING
 *     id, question_text, possible_answers, correct_answer, image_source AS image_src, created_at, updated_at
 * ```
 */
exports.create = new query_1.PreparedQuery(createIR);
const upsertQuizIR = { "name": "upsertQuiz", "params": [{ "name": "name", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 956, "b": 960, "line": 31, "col": 17 }, { "a": 1170, "b": 1174, "line": 46, "col": 16 }] } }], "usedParamSet": { "name": true }, "statement": { "body": "WITH ins AS (\nINSERT INTO quizzes (name, created_at, updated_at)\n        VALUES (:name!, NOW(), NOW())\n    ON CONFLICT (name)\n        DO NOTHING\n    RETURNING\n        id)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id\n    FROM\n        quizzes\n    WHERE\n        name = :name!", "loc": { "a": 874, "b": 1174, "line": 29, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * WITH ins AS (
 * INSERT INTO quizzes (name, created_at, updated_at)
 *         VALUES (:name!, NOW(), NOW())
 *     ON CONFLICT (name)
 *         DO NOTHING
 *     RETURNING
 *         id)
 *     SELECT
 *         *
 *     FROM
 *         ins
 *     UNION
 *     SELECT
 *         id
 *     FROM
 *         quizzes
 *     WHERE
 *         name = :name!
 * ```
 */
exports.upsertQuiz = new query_1.PreparedQuery(upsertQuizIR);
const upsertQuizSubcategoryIR = { "name": "upsertQuizSubcategory", "params": [{ "name": "name", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1315, "b": 1319, "line": 52, "col": 17 }, { "a": 1559, "b": 1563, "line": 67, "col": 16 }] } }, { "name": "quizId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1323, "b": 1329, "line": 52, "col": 25 }] } }], "usedParamSet": { "name": true, "quizId": true }, "statement": { "body": "WITH ins AS (\nINSERT INTO quiz_subcategories (name, quiz_id, created_at, updated_at)\n        VALUES (:name!, :quizId!, NOW(), NOW())\n    ON CONFLICT (name, quiz_id)\n        DO NOTHING\n    RETURNING\n        id)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id\n    FROM\n        quiz_subcategories\n    WHERE\n        name = :name!", "loc": { "a": 1213, "b": 1563, "line": 50, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * WITH ins AS (
 * INSERT INTO quiz_subcategories (name, quiz_id, created_at, updated_at)
 *         VALUES (:name!, :quizId!, NOW(), NOW())
 *     ON CONFLICT (name, quiz_id)
 *         DO NOTHING
 *     RETURNING
 *         id)
 *     SELECT
 *         *
 *     FROM
 *         ins
 *     UNION
 *     SELECT
 *         id
 *     FROM
 *         quiz_subcategories
 *     WHERE
 *         name = :name!
 * ```
 */
exports.upsertQuizSubcategory = new query_1.PreparedQuery(upsertQuizSubcategoryIR);
const destroyIR = { "name": "destroy", "params": [{ "name": "questionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1642, "b": 1652, "line": 72, "col": 27 }] } }], "usedParamSet": { "questionId": true }, "statement": { "body": "DELETE FROM quiz_questions\nWHERE quiz_questions.id = :questionId!\nRETURNING\n    id AS ok", "loc": { "a": 1588, "b": 1675, "line": 71, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * DELETE FROM quiz_questions
 * WHERE quiz_questions.id = :questionId!
 * RETURNING
 *     id AS ok
 * ```
 */
exports.destroy = new query_1.PreparedQuery(destroyIR);
const updateSubcategoryIR = { "name": "updateSubcategory", "params": [{ "name": "quizSubcategoryId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1798, "b": 1815, "line": 79, "col": 13 }] } }, { "name": "subcategory", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1819, "b": 1830, "line": 79, "col": 34 }] } }, { "name": "quizId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1834, "b": 1840, "line": 79, "col": 49 }] } }], "usedParamSet": { "quizSubcategoryId": true, "subcategory": true, "quizId": true }, "statement": { "body": "INSERT INTO quiz_subcategories (id, name, quiz_id, created_at, updated_at)\n    VALUES (:quizSubcategoryId!, :subcategory!, :quizId!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING", "loc": { "a": 1710, "b": 1882, "line": 78, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO quiz_subcategories (id, name, quiz_id, created_at, updated_at)
 *     VALUES (:quizSubcategoryId!, :subcategory!, :quizId!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * ```
 */
exports.updateSubcategory = new query_1.PreparedQuery(updateSubcategoryIR);
const updateIR = { "name": "update", "params": [{ "name": "questionText", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1957, "b": 1969, "line": 88, "col": 21 }] } }, { "name": "possibleAnswers", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2005, "b": 2020, "line": 89, "col": 33 }] } }, { "name": "correctAnswer", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2064, "b": 2077, "line": 90, "col": 22 }] } }, { "name": "imageSrc", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2109, "b": 2116, "line": 91, "col": 29 }] } }, { "name": "subcategoryId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2185, "b": 2198, "line": 93, "col": 27 }] } }, { "name": "questionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2231, "b": 2241, "line": 95, "col": 25 }] } }], "usedParamSet": { "questionText": true, "possibleAnswers": true, "correctAnswer": true, "imageSrc": true, "subcategoryId": true, "questionId": true }, "statement": { "body": "UPDATE\n    quiz_questions\nSET\n    question_text = :questionText!,\n    possible_answers = COALESCE(:possibleAnswers!, possible_answers),\n    correct_answer = :correctAnswer!,\n    image_source = COALESCE(:imageSrc, image_source),\n    updated_at = NOW(),\n    quiz_subcategory_id = :subcategoryId!\nWHERE\n    quiz_questions.id = :questionId!\nRETURNING\n    id AS ok", "loc": { "a": 1906, "b": 2264, "line": 85, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     quiz_questions
 * SET
 *     question_text = :questionText!,
 *     possible_answers = COALESCE(:possibleAnswers!, possible_answers),
 *     correct_answer = :correctAnswer!,
 *     image_source = COALESCE(:imageSrc, image_source),
 *     updated_at = NOW(),
 *     quiz_subcategory_id = :subcategoryId!
 * WHERE
 *     quiz_questions.id = :questionId!
 * RETURNING
 *     id AS ok
 * ```
 */
exports.update = new query_1.PreparedQuery(updateIR);
const categoriesIR = { "name": "categories", "params": [], "usedParamSet": {}, "statement": { "body": "SELECT\n    quizzes.name AS categories,\n    array_agg(quiz_subcategories.name) AS subcategories\nFROM\n    quizzes\n    LEFT JOIN quiz_subcategories ON quiz_subcategories.quiz_id = quizzes.id\nGROUP BY\n    quizzes.name", "loc": { "a": 2292, "b": 2504, "line": 101, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     quizzes.name AS categories,
 *     array_agg(quiz_subcategories.name) AS subcategories
 * FROM
 *     quizzes
 *     LEFT JOIN quiz_subcategories ON quiz_subcategories.quiz_id = quizzes.id
 * GROUP BY
 *     quizzes.name
 * ```
 */
exports.categories = new query_1.PreparedQuery(categoriesIR);
const getSubcategoriesForQuizIR = { "name": "getSubcategoriesForQuiz", "params": [{ "name": "quizName", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2694, "b": 2702, "line": 118, "col": 20 }] } }], "usedParamSet": { "quizName": true }, "statement": { "body": "SELECT\n    quiz_subcategories.name\nFROM\n    quiz_subcategories\n    JOIN quizzes ON quiz_subcategories.quiz_id = quizzes.id\nWHERE\n    quizzes.name = :quizName!", "loc": { "a": 2545, "b": 2702, "line": 112, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     quiz_subcategories.name
 * FROM
 *     quiz_subcategories
 *     JOIN quizzes ON quiz_subcategories.quiz_id = quizzes.id
 * WHERE
 *     quizzes.name = :quizName!
 * ```
 */
exports.getSubcategoriesForQuiz = new query_1.PreparedQuery(getSubcategoriesForQuizIR);
const getMultipleQuestionsByIdIR = { "name": "getMultipleQuestionsById", "params": [{ "name": "ids", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3176, "b": 3179, "line": 137, "col": 20 }] } }], "usedParamSet": { "ids": true }, "statement": { "body": "SELECT\n    ques.id,\n    question_text,\n    possible_answers,\n    correct_answer,\n    quizzes.name AS category,\n    quiz_subcategories.name AS subcategory,\n    image_source AS image_src,\n    ques.created_at,\n    ques.updated_at\nFROM\n    quiz_questions ques\n    LEFT JOIN quiz_subcategories ON quiz_subcategories.id = ques.quiz_subcategory_id\n    LEFT JOIN quizzes ON quizzes.id = quiz_subcategories.quiz_id\nWHERE\n    ques.id = ANY (:ids!)", "loc": { "a": 2744, "b": 3180, "line": 122, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ques.id,
 *     question_text,
 *     possible_answers,
 *     correct_answer,
 *     quizzes.name AS category,
 *     quiz_subcategories.name AS subcategory,
 *     image_source AS image_src,
 *     ques.created_at,
 *     ques.updated_at
 * FROM
 *     quiz_questions ques
 *     LEFT JOIN quiz_subcategories ON quiz_subcategories.id = ques.quiz_subcategory_id
 *     LEFT JOIN quizzes ON quizzes.id = quiz_subcategories.quiz_id
 * WHERE
 *     ques.id = ANY (:ids!)
 * ```
 */
exports.getMultipleQuestionsById = new query_1.PreparedQuery(getMultipleQuestionsByIdIR);
const getQuestionsByCategoryIR = { "name": "getQuestionsByCategory", "params": [{ "name": "category", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3652, "b": 3660, "line": 156, "col": 20 }] } }, { "name": "limit", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3670, "b": 3675, "line": 157, "col": 8 }] } }, { "name": "offset", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3692, "b": 3698, "line": 157, "col": 30 }] } }], "usedParamSet": { "category": true, "limit": true, "offset": true }, "statement": { "body": "SELECT\n    ques.id,\n    question_text,\n    possible_answers,\n    correct_answer,\n    quizzes.name AS category,\n    quiz_subcategories.name AS subcategory,\n    image_source AS image_src,\n    ques.created_at,\n    ques.updated_at\nFROM\n    quiz_questions ques\n    LEFT JOIN quiz_subcategories ON quiz_subcategories.id = ques.quiz_subcategory_id\n    LEFT JOIN quizzes ON quizzes.id = quiz_subcategories.quiz_id\nWHERE\n    quizzes.name = :category!\nLIMIT (:limit!)::int OFFSET (:offset!)::int", "loc": { "a": 3220, "b": 3704, "line": 141, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ques.id,
 *     question_text,
 *     possible_answers,
 *     correct_answer,
 *     quizzes.name AS category,
 *     quiz_subcategories.name AS subcategory,
 *     image_source AS image_src,
 *     ques.created_at,
 *     ques.updated_at
 * FROM
 *     quiz_questions ques
 *     LEFT JOIN quiz_subcategories ON quiz_subcategories.id = ques.quiz_subcategory_id
 *     LEFT JOIN quizzes ON quizzes.id = quiz_subcategories.quiz_id
 * WHERE
 *     quizzes.name = :category!
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
exports.getQuestionsByCategory = new query_1.PreparedQuery(getQuestionsByCategoryIR);
const getQuizReviewMaterialsIR = { "name": "getQuizReviewMaterials", "params": [{ "name": "category", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3932, "b": 3940, "line": 170, "col": 14 }] } }], "usedParamSet": { "category": true }, "statement": { "body": "SELECT\n    q.name AS category,\n    qm.title,\n    qm.pdf,\n    qm.image\nFROM\n    upchieve.quiz_review_materials AS qm\n    JOIN upchieve.quizzes AS q ON q.id = qm.quiz_id\nWHERE\n    q.name = :category!", "loc": { "a": 3744, "b": 3940, "line": 161, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     q.name AS category,
 *     qm.title,
 *     qm.pdf,
 *     qm.image
 * FROM
 *     upchieve.quiz_review_materials AS qm
 *     JOIN upchieve.quizzes AS q ON q.id = qm.quiz_id
 * WHERE
 *     q.name = :category!
 * ```
 */
exports.getQuizReviewMaterials = new query_1.PreparedQuery(getQuizReviewMaterialsIR);
const getQuizCertUnlocksByQuizNameIR = { "name": "getQuizCertUnlocksByQuizName", "params": [{ "name": "quizName", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 4812, "b": 4820, "line": 193, "col": 20 }] } }], "usedParamSet": { "quizName": true }, "statement": { "body": "SELECT\n    quizzes.name AS quiz_name,\n    quiz_info.display_name AS quiz_display_name,\n    quiz_info.display_order AS quiz_display_order,\n    certs.name AS unlocked_cert_name,\n    cert_info.display_name AS unlocked_cert_display_name,\n    cert_info.display_order AS unlocked_cert_display_order,\n    topics.name AS topic_name,\n    topics.display_name AS topic_display_name,\n    topics.dashboard_order AS topic_dashboard_order,\n    topics.training_order AS topic_training_order\nFROM\n    quiz_certification_grants qcg\n    JOIN quizzes ON quizzes.id = qcg.quiz_id\n    JOIN subjects AS quiz_info ON quiz_info.name = quizzes.name\n    JOIN certifications certs ON certs.id = qcg.certification_id\n    JOIN subjects AS cert_info ON cert_info.name = certs.name\n    JOIN topics ON topics.id = cert_info.topic_id\nWHERE\n    quizzes.name = :quizName!", "loc": { "a": 3986, "b": 4820, "line": 174, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     quizzes.name AS quiz_name,
 *     quiz_info.display_name AS quiz_display_name,
 *     quiz_info.display_order AS quiz_display_order,
 *     certs.name AS unlocked_cert_name,
 *     cert_info.display_name AS unlocked_cert_display_name,
 *     cert_info.display_order AS unlocked_cert_display_order,
 *     topics.name AS topic_name,
 *     topics.display_name AS topic_display_name,
 *     topics.dashboard_order AS topic_dashboard_order,
 *     topics.training_order AS topic_training_order
 * FROM
 *     quiz_certification_grants qcg
 *     JOIN quizzes ON quizzes.id = qcg.quiz_id
 *     JOIN subjects AS quiz_info ON quiz_info.name = quizzes.name
 *     JOIN certifications certs ON certs.id = qcg.certification_id
 *     JOIN subjects AS cert_info ON cert_info.name = certs.name
 *     JOIN topics ON topics.id = cert_info.topic_id
 * WHERE
 *     quizzes.name = :quizName!
 * ```
 */
exports.getQuizCertUnlocksByQuizName = new query_1.PreparedQuery(getQuizCertUnlocksByQuizNameIR);
const getQuizByNameIR = { "name": "getQuizByName", "params": [{ "name": "quizName", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 4961, "b": 4969, "line": 205, "col": 20 }] } }], "usedParamSet": { "quizName": true }, "statement": { "body": "SELECT\n    id,\n    name,\n    active,\n    questions_per_subcategory\nFROM\n    quizzes\nWHERE\n    quizzes.name = :quizName!", "loc": { "a": 4851, "b": 4969, "line": 197, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     name,
 *     active,
 *     questions_per_subcategory
 * FROM
 *     quizzes
 * WHERE
 *     quizzes.name = :quizName!
 * ```
 */
exports.getQuizByName = new query_1.PreparedQuery(getQuizByNameIR);
