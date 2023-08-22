/** Types generated for queries found in "server/models/Question/question.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type numberArray = (number)[];

export type stringArray = (string)[];

/** 'List' parameters type */
export interface IListParams {
  category: string;
  subcategory: string | null | void;
}

/** 'List' return type */
export interface IListResult {
  category: string;
  correctAnswer: string;
  createdAt: Date;
  id: number;
  imageSrc: string | null;
  possibleAnswers: Json | null;
  questionText: string;
  subcategory: string;
  updatedAt: Date;
}

/** 'List' query type */
export interface IListQuery {
  params: IListParams;
  result: IListResult;
}

const listIR: any = {"name":"list","params":[{"name":"category","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":423,"b":431,"line":17,"col":20}]}},{"name":"subcategory","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":455,"b":465,"line":18,"col":22}]}}],"usedParamSet":{"category":true,"subcategory":true},"statement":{"body":"SELECT\n    ques.id,\n    question_text,\n    possible_answers,\n    correct_answer,\n    quizzes.name AS category,\n    subcat.name AS subcategory,\n    image_source AS image_src,\n    ques.created_at,\n    ques.updated_at\nFROM\n    quiz_questions AS ques\n    LEFT JOIN quiz_subcategories subcat ON ques.quiz_subcategory_id = subcat.id\n    LEFT JOIN quizzes ON quizzes.id = subcat.quiz_id\nWHERE\n    quizzes.name = :category!\n    OR subcat.name = :subcategory","loc":{"a":17,"b":465,"line":2,"col":0}}};

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
export const list = new PreparedQuery<IListParams,IListResult>(listIR);


/** 'Create' parameters type */
export interface ICreateParams {
  correctAnswer: string;
  imageSrc: string | null | void;
  possibleAnswers: Json;
  questionText: string;
  subcategoryId: number;
}

/** 'Create' return type */
export interface ICreateResult {
  correctAnswer: string;
  createdAt: Date;
  id: number;
  imageSrc: string | null;
  possibleAnswers: Json | null;
  questionText: string;
  updatedAt: Date;
}

/** 'Create' query type */
export interface ICreateQuery {
  params: ICreateParams;
  result: ICreateResult;
}

const createIR: any = {"name":"create","params":[{"name":"questionText","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":638,"b":650,"line":23,"col":13}]}},{"name":"possibleAnswers","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":654,"b":669,"line":23,"col":29}]}},{"name":"correctAnswer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":673,"b":686,"line":23,"col":48}]}},{"name":"imageSrc","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":690,"b":697,"line":23,"col":65}]}},{"name":"subcategoryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":701,"b":714,"line":23,"col":76}]}}],"usedParamSet":{"questionText":true,"possibleAnswers":true,"correctAnswer":true,"imageSrc":true,"subcategoryId":true},"statement":{"body":"INSERT INTO quiz_questions (question_text, possible_answers, correct_answer, image_source, quiz_subcategory_id, created_at, updated_at)\n    VALUES (:questionText!, :possibleAnswers!, :correctAnswer!, :imageSrc, :subcategoryId!, NOW(), NOW())\nRETURNING\n    id, question_text, possible_answers, correct_answer, image_source AS image_src, created_at, updated_at","loc":{"a":489,"b":846,"line":22,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO quiz_questions (question_text, possible_answers, correct_answer, image_source, quiz_subcategory_id, created_at, updated_at)
 *     VALUES (:questionText!, :possibleAnswers!, :correctAnswer!, :imageSrc, :subcategoryId!, NOW(), NOW())
 * RETURNING
 *     id, question_text, possible_answers, correct_answer, image_source AS image_src, created_at, updated_at
 * ```
 */
export const create = new PreparedQuery<ICreateParams,ICreateResult>(createIR);


/** 'UpsertQuiz' parameters type */
export interface IUpsertQuizParams {
  name: string;
}

/** 'UpsertQuiz' return type */
export interface IUpsertQuizResult {
  id: number | null;
}

/** 'UpsertQuiz' query type */
export interface IUpsertQuizQuery {
  params: IUpsertQuizParams;
  result: IUpsertQuizResult;
}

const upsertQuizIR: any = {"name":"upsertQuiz","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":956,"b":960,"line":31,"col":17},{"a":1170,"b":1174,"line":46,"col":16}]}}],"usedParamSet":{"name":true},"statement":{"body":"WITH ins AS (\nINSERT INTO quizzes (name, created_at, updated_at)\n        VALUES (:name!, NOW(), NOW())\n    ON CONFLICT (name)\n        DO NOTHING\n    RETURNING\n        id)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id\n    FROM\n        quizzes\n    WHERE\n        name = :name!","loc":{"a":874,"b":1174,"line":29,"col":0}}};

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
export const upsertQuiz = new PreparedQuery<IUpsertQuizParams,IUpsertQuizResult>(upsertQuizIR);


/** 'UpsertQuizSubcategory' parameters type */
export interface IUpsertQuizSubcategoryParams {
  name: string;
  quizId: number;
}

/** 'UpsertQuizSubcategory' return type */
export interface IUpsertQuizSubcategoryResult {
  id: number | null;
}

/** 'UpsertQuizSubcategory' query type */
export interface IUpsertQuizSubcategoryQuery {
  params: IUpsertQuizSubcategoryParams;
  result: IUpsertQuizSubcategoryResult;
}

const upsertQuizSubcategoryIR: any = {"name":"upsertQuizSubcategory","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1315,"b":1319,"line":52,"col":17},{"a":1559,"b":1563,"line":67,"col":16}]}},{"name":"quizId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1323,"b":1329,"line":52,"col":25}]}}],"usedParamSet":{"name":true,"quizId":true},"statement":{"body":"WITH ins AS (\nINSERT INTO quiz_subcategories (name, quiz_id, created_at, updated_at)\n        VALUES (:name!, :quizId!, NOW(), NOW())\n    ON CONFLICT (name, quiz_id)\n        DO NOTHING\n    RETURNING\n        id)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id\n    FROM\n        quiz_subcategories\n    WHERE\n        name = :name!","loc":{"a":1213,"b":1563,"line":50,"col":0}}};

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
export const upsertQuizSubcategory = new PreparedQuery<IUpsertQuizSubcategoryParams,IUpsertQuizSubcategoryResult>(upsertQuizSubcategoryIR);


/** 'Destroy' parameters type */
export interface IDestroyParams {
  questionId: number;
}

/** 'Destroy' return type */
export interface IDestroyResult {
  ok: number;
}

/** 'Destroy' query type */
export interface IDestroyQuery {
  params: IDestroyParams;
  result: IDestroyResult;
}

const destroyIR: any = {"name":"destroy","params":[{"name":"questionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1642,"b":1652,"line":72,"col":27}]}}],"usedParamSet":{"questionId":true},"statement":{"body":"DELETE FROM quiz_questions\nWHERE quiz_questions.id = :questionId!\nRETURNING\n    id AS ok","loc":{"a":1588,"b":1675,"line":71,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM quiz_questions
 * WHERE quiz_questions.id = :questionId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const destroy = new PreparedQuery<IDestroyParams,IDestroyResult>(destroyIR);


/** 'UpdateSubcategory' parameters type */
export interface IUpdateSubcategoryParams {
  quizId: number;
  quizSubcategoryId: number;
  subcategory: string;
}

/** 'UpdateSubcategory' return type */
export type IUpdateSubcategoryResult = void;

/** 'UpdateSubcategory' query type */
export interface IUpdateSubcategoryQuery {
  params: IUpdateSubcategoryParams;
  result: IUpdateSubcategoryResult;
}

const updateSubcategoryIR: any = {"name":"updateSubcategory","params":[{"name":"quizSubcategoryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1798,"b":1815,"line":79,"col":13}]}},{"name":"subcategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1819,"b":1830,"line":79,"col":34}]}},{"name":"quizId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1834,"b":1840,"line":79,"col":49}]}}],"usedParamSet":{"quizSubcategoryId":true,"subcategory":true,"quizId":true},"statement":{"body":"INSERT INTO quiz_subcategories (id, name, quiz_id, created_at, updated_at)\n    VALUES (:quizSubcategoryId!, :subcategory!, :quizId!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING","loc":{"a":1710,"b":1882,"line":78,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO quiz_subcategories (id, name, quiz_id, created_at, updated_at)
 *     VALUES (:quizSubcategoryId!, :subcategory!, :quizId!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * ```
 */
export const updateSubcategory = new PreparedQuery<IUpdateSubcategoryParams,IUpdateSubcategoryResult>(updateSubcategoryIR);


/** 'Update' parameters type */
export interface IUpdateParams {
  correctAnswer: string;
  imageSrc: string | null | void;
  possibleAnswers: Json;
  questionId: number;
  questionText: string;
  subcategoryId: number;
}

/** 'Update' return type */
export interface IUpdateResult {
  ok: number;
}

/** 'Update' query type */
export interface IUpdateQuery {
  params: IUpdateParams;
  result: IUpdateResult;
}

const updateIR: any = {"name":"update","params":[{"name":"questionText","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1957,"b":1969,"line":88,"col":21}]}},{"name":"possibleAnswers","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2005,"b":2020,"line":89,"col":33}]}},{"name":"correctAnswer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2064,"b":2077,"line":90,"col":22}]}},{"name":"imageSrc","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2109,"b":2116,"line":91,"col":29}]}},{"name":"subcategoryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2185,"b":2198,"line":93,"col":27}]}},{"name":"questionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2231,"b":2241,"line":95,"col":25}]}}],"usedParamSet":{"questionText":true,"possibleAnswers":true,"correctAnswer":true,"imageSrc":true,"subcategoryId":true,"questionId":true},"statement":{"body":"UPDATE\n    quiz_questions\nSET\n    question_text = :questionText!,\n    possible_answers = COALESCE(:possibleAnswers!, possible_answers),\n    correct_answer = :correctAnswer!,\n    image_source = COALESCE(:imageSrc, image_source),\n    updated_at = NOW(),\n    quiz_subcategory_id = :subcategoryId!\nWHERE\n    quiz_questions.id = :questionId!\nRETURNING\n    id AS ok","loc":{"a":1906,"b":2264,"line":85,"col":0}}};

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
export const update = new PreparedQuery<IUpdateParams,IUpdateResult>(updateIR);


/** 'Categories' parameters type */
export type ICategoriesParams = void;

/** 'Categories' return type */
export interface ICategoriesResult {
  categories: string;
  subcategories: stringArray | null;
}

/** 'Categories' query type */
export interface ICategoriesQuery {
  params: ICategoriesParams;
  result: ICategoriesResult;
}

const categoriesIR: any = {"name":"categories","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    quizzes.name AS categories,\n    array_agg(quiz_subcategories.name) AS subcategories\nFROM\n    quizzes\n    LEFT JOIN quiz_subcategories ON quiz_subcategories.quiz_id = quizzes.id\nGROUP BY\n    quizzes.name","loc":{"a":2292,"b":2504,"line":101,"col":0}}};

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
export const categories = new PreparedQuery<ICategoriesParams,ICategoriesResult>(categoriesIR);


/** 'GetSubcategoriesForQuiz' parameters type */
export interface IGetSubcategoriesForQuizParams {
  quizName: string;
}

/** 'GetSubcategoriesForQuiz' return type */
export interface IGetSubcategoriesForQuizResult {
  name: string;
}

/** 'GetSubcategoriesForQuiz' query type */
export interface IGetSubcategoriesForQuizQuery {
  params: IGetSubcategoriesForQuizParams;
  result: IGetSubcategoriesForQuizResult;
}

const getSubcategoriesForQuizIR: any = {"name":"getSubcategoriesForQuiz","params":[{"name":"quizName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2694,"b":2702,"line":118,"col":20}]}}],"usedParamSet":{"quizName":true},"statement":{"body":"SELECT\n    quiz_subcategories.name\nFROM\n    quiz_subcategories\n    JOIN quizzes ON quiz_subcategories.quiz_id = quizzes.id\nWHERE\n    quizzes.name = :quizName!","loc":{"a":2545,"b":2702,"line":112,"col":0}}};

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
export const getSubcategoriesForQuiz = new PreparedQuery<IGetSubcategoriesForQuizParams,IGetSubcategoriesForQuizResult>(getSubcategoriesForQuizIR);


/** 'GetMultipleQuestionsById' parameters type */
export interface IGetMultipleQuestionsByIdParams {
  ids: numberArray;
}

/** 'GetMultipleQuestionsById' return type */
export interface IGetMultipleQuestionsByIdResult {
  category: string;
  correctAnswer: string;
  createdAt: Date;
  id: number;
  imageSrc: string | null;
  possibleAnswers: Json | null;
  questionText: string;
  subcategory: string;
  updatedAt: Date;
}

/** 'GetMultipleQuestionsById' query type */
export interface IGetMultipleQuestionsByIdQuery {
  params: IGetMultipleQuestionsByIdParams;
  result: IGetMultipleQuestionsByIdResult;
}

const getMultipleQuestionsByIdIR: any = {"name":"getMultipleQuestionsById","params":[{"name":"ids","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3176,"b":3179,"line":137,"col":20}]}}],"usedParamSet":{"ids":true},"statement":{"body":"SELECT\n    ques.id,\n    question_text,\n    possible_answers,\n    correct_answer,\n    quizzes.name AS category,\n    quiz_subcategories.name AS subcategory,\n    image_source AS image_src,\n    ques.created_at,\n    ques.updated_at\nFROM\n    quiz_questions ques\n    LEFT JOIN quiz_subcategories ON quiz_subcategories.id = ques.quiz_subcategory_id\n    LEFT JOIN quizzes ON quizzes.id = quiz_subcategories.quiz_id\nWHERE\n    ques.id = ANY (:ids!)","loc":{"a":2744,"b":3180,"line":122,"col":0}}};

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
export const getMultipleQuestionsById = new PreparedQuery<IGetMultipleQuestionsByIdParams,IGetMultipleQuestionsByIdResult>(getMultipleQuestionsByIdIR);


/** 'GetQuestionsByCategory' parameters type */
export interface IGetQuestionsByCategoryParams {
  category: string;
  limit: number;
  offset: number;
}

/** 'GetQuestionsByCategory' return type */
export interface IGetQuestionsByCategoryResult {
  category: string;
  correctAnswer: string;
  createdAt: Date;
  id: number;
  imageSrc: string | null;
  possibleAnswers: Json | null;
  questionText: string;
  subcategory: string;
  updatedAt: Date;
}

/** 'GetQuestionsByCategory' query type */
export interface IGetQuestionsByCategoryQuery {
  params: IGetQuestionsByCategoryParams;
  result: IGetQuestionsByCategoryResult;
}

const getQuestionsByCategoryIR: any = {"name":"getQuestionsByCategory","params":[{"name":"category","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3652,"b":3660,"line":156,"col":20}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3670,"b":3675,"line":157,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3692,"b":3698,"line":157,"col":30}]}}],"usedParamSet":{"category":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    ques.id,\n    question_text,\n    possible_answers,\n    correct_answer,\n    quizzes.name AS category,\n    quiz_subcategories.name AS subcategory,\n    image_source AS image_src,\n    ques.created_at,\n    ques.updated_at\nFROM\n    quiz_questions ques\n    LEFT JOIN quiz_subcategories ON quiz_subcategories.id = ques.quiz_subcategory_id\n    LEFT JOIN quizzes ON quizzes.id = quiz_subcategories.quiz_id\nWHERE\n    quizzes.name = :category!\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":3220,"b":3704,"line":141,"col":0}}};

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
export const getQuestionsByCategory = new PreparedQuery<IGetQuestionsByCategoryParams,IGetQuestionsByCategoryResult>(getQuestionsByCategoryIR);


/** 'GetQuizReviewMaterials' parameters type */
export interface IGetQuizReviewMaterialsParams {
  category: string;
}

/** 'GetQuizReviewMaterials' return type */
export interface IGetQuizReviewMaterialsResult {
  category: string;
  image: string;
  pdf: string;
  title: string;
}

/** 'GetQuizReviewMaterials' query type */
export interface IGetQuizReviewMaterialsQuery {
  params: IGetQuizReviewMaterialsParams;
  result: IGetQuizReviewMaterialsResult;
}

const getQuizReviewMaterialsIR: any = {"name":"getQuizReviewMaterials","params":[{"name":"category","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3932,"b":3940,"line":170,"col":14}]}}],"usedParamSet":{"category":true},"statement":{"body":"SELECT\n    q.name AS category,\n    qm.title,\n    qm.pdf,\n    qm.image\nFROM\n    upchieve.quiz_review_materials AS qm\n    JOIN upchieve.quizzes AS q ON q.id = qm.quiz_id\nWHERE\n    q.name = :category!","loc":{"a":3744,"b":3940,"line":161,"col":0}}};

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
export const getQuizReviewMaterials = new PreparedQuery<IGetQuizReviewMaterialsParams,IGetQuizReviewMaterialsResult>(getQuizReviewMaterialsIR);


/** 'GetQuizCertUnlocksByQuizName' parameters type */
export interface IGetQuizCertUnlocksByQuizNameParams {
  quizName: string;
}

/** 'GetQuizCertUnlocksByQuizName' return type */
export interface IGetQuizCertUnlocksByQuizNameResult {
  quizDisplayName: string;
  quizDisplayOrder: number;
  quizName: string;
  topicDashboardOrder: number;
  topicDisplayName: string;
  topicName: string;
  topicTrainingOrder: number;
  unlockedCertDisplayName: string;
  unlockedCertDisplayOrder: number;
  unlockedCertName: string;
}

/** 'GetQuizCertUnlocksByQuizName' query type */
export interface IGetQuizCertUnlocksByQuizNameQuery {
  params: IGetQuizCertUnlocksByQuizNameParams;
  result: IGetQuizCertUnlocksByQuizNameResult;
}

const getQuizCertUnlocksByQuizNameIR: any = {"name":"getQuizCertUnlocksByQuizName","params":[{"name":"quizName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4812,"b":4820,"line":193,"col":20}]}}],"usedParamSet":{"quizName":true},"statement":{"body":"SELECT\n    quizzes.name AS quiz_name,\n    quiz_info.display_name AS quiz_display_name,\n    quiz_info.display_order AS quiz_display_order,\n    certs.name AS unlocked_cert_name,\n    cert_info.display_name AS unlocked_cert_display_name,\n    cert_info.display_order AS unlocked_cert_display_order,\n    topics.name AS topic_name,\n    topics.display_name AS topic_display_name,\n    topics.dashboard_order AS topic_dashboard_order,\n    topics.training_order AS topic_training_order\nFROM\n    quiz_certification_grants qcg\n    JOIN quizzes ON quizzes.id = qcg.quiz_id\n    JOIN subjects AS quiz_info ON quiz_info.name = quizzes.name\n    JOIN certifications certs ON certs.id = qcg.certification_id\n    JOIN subjects AS cert_info ON cert_info.name = certs.name\n    JOIN topics ON topics.id = cert_info.topic_id\nWHERE\n    quizzes.name = :quizName!","loc":{"a":3986,"b":4820,"line":174,"col":0}}};

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
export const getQuizCertUnlocksByQuizName = new PreparedQuery<IGetQuizCertUnlocksByQuizNameParams,IGetQuizCertUnlocksByQuizNameResult>(getQuizCertUnlocksByQuizNameIR);


/** 'GetQuizByName' parameters type */
export interface IGetQuizByNameParams {
  quizName: string;
}

/** 'GetQuizByName' return type */
export interface IGetQuizByNameResult {
  active: boolean;
  id: number;
  name: string;
  questionsPerSubcategory: number;
}

/** 'GetQuizByName' query type */
export interface IGetQuizByNameQuery {
  params: IGetQuizByNameParams;
  result: IGetQuizByNameResult;
}

const getQuizByNameIR: any = {"name":"getQuizByName","params":[{"name":"quizName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4961,"b":4969,"line":205,"col":20}]}}],"usedParamSet":{"quizName":true},"statement":{"body":"SELECT\n    id,\n    name,\n    active,\n    questions_per_subcategory\nFROM\n    quizzes\nWHERE\n    quizzes.name = :quizName!","loc":{"a":4851,"b":4969,"line":197,"col":0}}};

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
export const getQuizByName = new PreparedQuery<IGetQuizByNameParams,IGetQuizByNameResult>(getQuizByNameIR);


