/** Types generated for queries found in "server/models/Question/question.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type numberArray = (number)[];

export type stringArray = (string)[];

/** 'List' parameters type */
export interface IListParams {
  category: string;
  subcategory?: string | null | void;
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

const listIR: any = {"usedParamSet":{"category":true,"subcategory":true},"params":[{"name":"category","required":true,"transform":{"type":"scalar"},"locs":[{"a":405,"b":414}]},{"name":"subcategory","required":false,"transform":{"type":"scalar"},"locs":[{"a":437,"b":448}]}],"statement":"SELECT\n    ques.id,\n    question_text,\n    possible_answers,\n    correct_answer,\n    quizzes.name AS category,\n    subcat.name AS subcategory,\n    image_source AS image_src,\n    ques.created_at,\n    ques.updated_at\nFROM\n    quiz_questions AS ques\n    LEFT JOIN quiz_subcategories subcat ON ques.quiz_subcategory_id = subcat.id\n    LEFT JOIN quizzes ON quizzes.id = subcat.quiz_id\nWHERE\n    quizzes.name = :category!\n    OR subcat.name = :subcategory"};

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
  imageSrc?: string | null | void;
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

const createIR: any = {"usedParamSet":{"questionText":true,"possibleAnswers":true,"correctAnswer":true,"imageSrc":true,"subcategoryId":true},"params":[{"name":"questionText","required":true,"transform":{"type":"scalar"},"locs":[{"a":148,"b":161}]},{"name":"possibleAnswers","required":true,"transform":{"type":"scalar"},"locs":[{"a":164,"b":180}]},{"name":"correctAnswer","required":true,"transform":{"type":"scalar"},"locs":[{"a":183,"b":197}]},{"name":"imageSrc","required":false,"transform":{"type":"scalar"},"locs":[{"a":200,"b":208}]},{"name":"subcategoryId","required":true,"transform":{"type":"scalar"},"locs":[{"a":211,"b":225}]}],"statement":"INSERT INTO quiz_questions (question_text, possible_answers, correct_answer, image_source, quiz_subcategory_id, created_at, updated_at)\n    VALUES (:questionText!, :possibleAnswers!, :correctAnswer!, :imageSrc, :subcategoryId!, NOW(), NOW())\nRETURNING\n    id, question_text, possible_answers, correct_answer, image_source AS image_src, created_at, updated_at"};

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

const upsertQuizIR: any = {"usedParamSet":{"name":true},"params":[{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":81,"b":86},{"a":295,"b":300}]}],"statement":"WITH ins AS (\nINSERT INTO quizzes (name, created_at, updated_at)\n        VALUES (:name!, NOW(), NOW())\n    ON CONFLICT (name)\n        DO NOTHING\n    RETURNING\n        id)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id\n    FROM\n        quizzes\n    WHERE\n        name = :name!"};

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

const upsertQuizSubcategoryIR: any = {"usedParamSet":{"name":true,"quizId":true},"params":[{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":101,"b":106},{"a":345,"b":350}]},{"name":"quizId","required":true,"transform":{"type":"scalar"},"locs":[{"a":109,"b":116}]}],"statement":"WITH ins AS (\nINSERT INTO quiz_subcategories (name, quiz_id, created_at, updated_at)\n        VALUES (:name!, :quizId!, NOW(), NOW())\n    ON CONFLICT (name, quiz_id)\n        DO NOTHING\n    RETURNING\n        id)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id\n    FROM\n        quiz_subcategories\n    WHERE\n        name = :name!"};

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

const destroyIR: any = {"usedParamSet":{"questionId":true},"params":[{"name":"questionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":53,"b":64}]}],"statement":"DELETE FROM quiz_questions\nWHERE quiz_questions.id = :questionId!\nRETURNING\n    id AS ok"};

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

const updateSubcategoryIR: any = {"usedParamSet":{"quizSubcategoryId":true,"subcategory":true,"quizId":true},"params":[{"name":"quizSubcategoryId","required":true,"transform":{"type":"scalar"},"locs":[{"a":87,"b":105}]},{"name":"subcategory","required":true,"transform":{"type":"scalar"},"locs":[{"a":108,"b":120}]},{"name":"quizId","required":true,"transform":{"type":"scalar"},"locs":[{"a":123,"b":130}]}],"statement":"INSERT INTO quiz_subcategories (id, name, quiz_id, created_at, updated_at)\n    VALUES (:quizSubcategoryId!, :subcategory!, :quizId!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING"};

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
  imageSrc?: string | null | void;
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

const updateIR: any = {"usedParamSet":{"questionText":true,"possibleAnswers":true,"correctAnswer":true,"imageSrc":true,"subcategoryId":true,"questionId":true},"params":[{"name":"questionText","required":true,"transform":{"type":"scalar"},"locs":[{"a":50,"b":63}]},{"name":"possibleAnswers","required":true,"transform":{"type":"scalar"},"locs":[{"a":98,"b":114}]},{"name":"correctAnswer","required":true,"transform":{"type":"scalar"},"locs":[{"a":157,"b":171}]},{"name":"imageSrc","required":false,"transform":{"type":"scalar"},"locs":[{"a":202,"b":210}]},{"name":"subcategoryId","required":true,"transform":{"type":"scalar"},"locs":[{"a":278,"b":292}]},{"name":"questionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":324,"b":335}]}],"statement":"UPDATE\n    quiz_questions\nSET\n    question_text = :questionText!,\n    possible_answers = COALESCE(:possibleAnswers!, possible_answers),\n    correct_answer = :correctAnswer!,\n    image_source = COALESCE(:imageSrc, image_source),\n    updated_at = NOW(),\n    quiz_subcategory_id = :subcategoryId!\nWHERE\n    quiz_questions.id = :questionId!\nRETURNING\n    id AS ok"};

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

const categoriesIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    quizzes.name AS categories,\n    array_agg(quiz_subcategories.name) AS subcategories\nFROM\n    quizzes\n    LEFT JOIN quiz_subcategories ON quiz_subcategories.quiz_id = quizzes.id\nGROUP BY\n    quizzes.name"};

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

const getSubcategoriesForQuizIR: any = {"usedParamSet":{"quizName":true},"params":[{"name":"quizName","required":true,"transform":{"type":"scalar"},"locs":[{"a":148,"b":157}]}],"statement":"SELECT\n    quiz_subcategories.name\nFROM\n    quiz_subcategories\n    JOIN quizzes ON quiz_subcategories.quiz_id = quizzes.id\nWHERE\n    quizzes.name = :quizName!"};

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

const getMultipleQuestionsByIdIR: any = {"usedParamSet":{"ids":true},"params":[{"name":"ids","required":true,"transform":{"type":"scalar"},"locs":[{"a":431,"b":435}]}],"statement":"SELECT\n    ques.id,\n    question_text,\n    possible_answers,\n    correct_answer,\n    quizzes.name AS category,\n    quiz_subcategories.name AS subcategory,\n    image_source AS image_src,\n    ques.created_at,\n    ques.updated_at\nFROM\n    quiz_questions ques\n    LEFT JOIN quiz_subcategories ON quiz_subcategories.id = ques.quiz_subcategory_id\n    LEFT JOIN quizzes ON quizzes.id = quiz_subcategories.quiz_id\nWHERE\n    ques.id = ANY (:ids!)"};

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

const getQuestionsByCategoryIR: any = {"usedParamSet":{"category":true,"limit":true,"offset":true},"params":[{"name":"category","required":true,"transform":{"type":"scalar"},"locs":[{"a":431,"b":440}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":449,"b":455}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":471,"b":478}]}],"statement":"SELECT\n    ques.id,\n    question_text,\n    possible_answers,\n    correct_answer,\n    quizzes.name AS category,\n    quiz_subcategories.name AS subcategory,\n    image_source AS image_src,\n    ques.created_at,\n    ques.updated_at\nFROM\n    quiz_questions ques\n    LEFT JOIN quiz_subcategories ON quiz_subcategories.id = ques.quiz_subcategory_id\n    LEFT JOIN quizzes ON quizzes.id = quiz_subcategories.quiz_id\nWHERE\n    quizzes.name = :category!\nLIMIT (:limit!)::int OFFSET (:offset!)::int"};

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

const getQuizReviewMaterialsIR: any = {"usedParamSet":{"category":true},"params":[{"name":"category","required":true,"transform":{"type":"scalar"},"locs":[{"a":187,"b":196}]}],"statement":"SELECT\n    q.name AS category,\n    qm.title,\n    qm.pdf,\n    qm.image\nFROM\n    upchieve.quiz_review_materials AS qm\n    JOIN upchieve.quizzes AS q ON q.id = qm.quiz_id\nWHERE\n    q.name = :category!"};

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

const getQuizCertUnlocksByQuizNameIR: any = {"usedParamSet":{"quizName":true},"params":[{"name":"quizName","required":true,"transform":{"type":"scalar"},"locs":[{"a":825,"b":834}]}],"statement":"SELECT\n    quizzes.name AS quiz_name,\n    quiz_info.display_name AS quiz_display_name,\n    quiz_info.display_order AS quiz_display_order,\n    certs.name AS unlocked_cert_name,\n    cert_info.display_name AS unlocked_cert_display_name,\n    cert_info.display_order AS unlocked_cert_display_order,\n    topics.name AS topic_name,\n    topics.display_name AS topic_display_name,\n    topics.dashboard_order AS topic_dashboard_order,\n    topics.training_order AS topic_training_order\nFROM\n    quiz_certification_grants qcg\n    JOIN quizzes ON quizzes.id = qcg.quiz_id\n    JOIN subjects AS quiz_info ON quiz_info.name = quizzes.name\n    JOIN certifications certs ON certs.id = qcg.certification_id\n    JOIN subjects AS cert_info ON cert_info.name = certs.name\n    JOIN topics ON topics.id = cert_info.topic_id\nWHERE\n    quizzes.name = :quizName!"};

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

const getQuizByNameIR: any = {"usedParamSet":{"quizName":true},"params":[{"name":"quizName","required":true,"transform":{"type":"scalar"},"locs":[{"a":109,"b":118}]}],"statement":"SELECT\n    id,\n    name,\n    active,\n    questions_per_subcategory\nFROM\n    quizzes\nWHERE\n    quizzes.name = :quizName!"};

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


