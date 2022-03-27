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
  mongoId: string | null;
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

const listIR: any = {"name":"list","params":[{"name":"category","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":442,"b":450,"line":18,"col":20}]}},{"name":"subcategory","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":474,"b":484,"line":19,"col":22}]}}],"usedParamSet":{"category":true,"subcategory":true},"statement":{"body":"SELECT\n    ques.id,\n    question_text,\n    possible_answers,\n    correct_answer,\n    quizzes.name AS category,\n    subcat.name AS subcategory,\n    image_source AS image_src,\n    ques.created_at,\n    ques.updated_at,\n    ques.mongo_id\nFROM\n    quiz_questions AS ques\n    LEFT JOIN quiz_subcategories subcat ON ques.quiz_subcategory_id = subcat.id\n    LEFT JOIN quizzes ON quizzes.id = subcat.quiz_id\nWHERE\n    quizzes.name = :category!\n    OR subcat.name = :subcategory","loc":{"a":17,"b":484,"line":2,"col":0}}};

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
 *     ques.updated_at,
 *     ques.mongo_id
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
  imageSrc: string;
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

const createIR: any = {"name":"create","params":[{"name":"questionText","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":657,"b":669,"line":24,"col":13}]}},{"name":"possibleAnswers","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":673,"b":688,"line":24,"col":29}]}},{"name":"correctAnswer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":692,"b":705,"line":24,"col":48}]}},{"name":"imageSrc","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":709,"b":717,"line":24,"col":65}]}},{"name":"subcategoryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":721,"b":734,"line":24,"col":77}]}}],"usedParamSet":{"questionText":true,"possibleAnswers":true,"correctAnswer":true,"imageSrc":true,"subcategoryId":true},"statement":{"body":"INSERT INTO quiz_questions (question_text, possible_answers, correct_answer, image_source, quiz_subcategory_id, created_at, updated_at)\n    VALUES (:questionText!, :possibleAnswers!, :correctAnswer!, :imageSrc!, :subcategoryId!, NOW(), NOW())\nRETURNING\n   id, question_text, possible_answers, correct_answer, image_source AS image_src, created_at, updated_at","loc":{"a":508,"b":865,"line":23,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO quiz_questions (question_text, possible_answers, correct_answer, image_source, quiz_subcategory_id, created_at, updated_at)
 *     VALUES (:questionText!, :possibleAnswers!, :correctAnswer!, :imageSrc!, :subcategoryId!, NOW(), NOW())
 * RETURNING
 *    id, question_text, possible_answers, correct_answer, image_source AS image_src, created_at, updated_at
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

const upsertQuizIR: any = {"name":"upsertQuiz","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":975,"b":979,"line":32,"col":17},{"a":1189,"b":1193,"line":47,"col":16}]}}],"usedParamSet":{"name":true},"statement":{"body":"WITH ins AS (\nINSERT INTO quizzes (name, created_at, updated_at)\n        VALUES (:name!, NOW(), NOW())\n    ON CONFLICT (name)\n        DO NOTHING\n    RETURNING\n        id)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id\n    FROM\n        quizzes\n    WHERE\n        name = :name!","loc":{"a":893,"b":1193,"line":30,"col":0}}};

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

const upsertQuizSubcategoryIR: any = {"name":"upsertQuizSubcategory","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1334,"b":1338,"line":53,"col":17},{"a":1578,"b":1582,"line":68,"col":16}]}},{"name":"quizId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1342,"b":1348,"line":53,"col":25}]}}],"usedParamSet":{"name":true,"quizId":true},"statement":{"body":"WITH ins AS (\nINSERT INTO quiz_subcategories (name, quiz_id, created_at, updated_at)\n        VALUES (:name!, :quizId!, NOW(), NOW())\n    ON CONFLICT (name, quiz_id)\n        DO NOTHING\n    RETURNING\n        id)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id\n    FROM\n        quiz_subcategories\n    WHERE\n        name = :name!","loc":{"a":1232,"b":1582,"line":51,"col":0}}};

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

const destroyIR: any = {"name":"destroy","params":[{"name":"questionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1661,"b":1671,"line":73,"col":27}]}}],"usedParamSet":{"questionId":true},"statement":{"body":"DELETE FROM quiz_questions\nWHERE quiz_questions.id = :questionId!\nRETURNING\n    id AS ok","loc":{"a":1607,"b":1694,"line":72,"col":0}}};

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

const updateSubcategoryIR: any = {"name":"updateSubcategory","params":[{"name":"quizSubcategoryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1817,"b":1834,"line":80,"col":13}]}},{"name":"subcategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1838,"b":1849,"line":80,"col":34}]}},{"name":"quizId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1853,"b":1859,"line":80,"col":49}]}}],"usedParamSet":{"quizSubcategoryId":true,"subcategory":true,"quizId":true},"statement":{"body":"INSERT INTO quiz_subcategories (id, name, quiz_id, created_at, updated_at)\n    VALUES (:quizSubcategoryId!, :subcategory!, :quizId!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING","loc":{"a":1729,"b":1901,"line":79,"col":0}}};

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
  imageSrc: string;
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

const updateIR: any = {"name":"update","params":[{"name":"questionText","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1976,"b":1988,"line":89,"col":21}]}},{"name":"possibleAnswers","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2024,"b":2039,"line":90,"col":33}]}},{"name":"correctAnswer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2083,"b":2096,"line":91,"col":22}]}},{"name":"imageSrc","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2119,"b":2127,"line":92,"col":20}]}},{"name":"subcategoryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2181,"b":2194,"line":94,"col":27}]}},{"name":"questionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2227,"b":2237,"line":96,"col":25}]}}],"usedParamSet":{"questionText":true,"possibleAnswers":true,"correctAnswer":true,"imageSrc":true,"subcategoryId":true,"questionId":true},"statement":{"body":"UPDATE\n    quiz_questions\nSET\n    question_text = :questionText!,\n    possible_answers = COALESCE(:possibleAnswers!, possible_answers),\n    correct_answer = :correctAnswer!,\n    image_source = :imageSrc!,\n    updated_at = NOW(),\n    quiz_subcategory_id = :subcategoryId!\nWHERE\n    quiz_questions.id = :questionId!\nRETURNING\n    id AS ok","loc":{"a":1925,"b":2260,"line":86,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     quiz_questions
 * SET
 *     question_text = :questionText!,
 *     possible_answers = COALESCE(:possibleAnswers!, possible_answers),
 *     correct_answer = :correctAnswer!,
 *     image_source = :imageSrc!,
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

const categoriesIR: any = {"name":"categories","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    quizzes.name AS categories,\n    array_agg(quiz_subcategories.name) AS subcategories\nFROM\n    quizzes\n    LEFT JOIN quiz_subcategories ON quiz_subcategories.quiz_id = quizzes.id\nGROUP BY\n    quizzes.name","loc":{"a":2288,"b":2500,"line":102,"col":0}}};

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

const getSubcategoriesForQuizIR: any = {"name":"getSubcategoriesForQuiz","params":[{"name":"quizName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2677,"b":2685,"line":116,"col":22}]}}],"usedParamSet":{"quizName":true},"statement":{"body":"SELECT\n    quiz_subcategories.name\nFROM quiz_subcategories\nJOIN quizzes ON quiz_subcategories.quiz_id = quizzes.id\nWHERE quizzes.name = :quizName!","loc":{"a":2540,"b":2685,"line":112,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     quiz_subcategories.name
 * FROM quiz_subcategories
 * JOIN quizzes ON quiz_subcategories.quiz_id = quizzes.id
 * WHERE quizzes.name = :quizName!
 * ```
 */
export const getSubcategoriesForQuiz = new PreparedQuery<IGetSubcategoriesForQuizParams,IGetSubcategoriesForQuizResult>(getSubcategoriesForQuizIR);


/** 'GetMultipleQuestionsById' parameters type */
export interface IGetMultipleQuestionsByIdParams {
  ids: numberArray;
}

/** 'GetMultipleQuestionsById' return type */
export interface IGetMultipleQuestionsByIdResult {
  correctAnswer: string;
  createdAt: Date;
  id: number;
  imageSource: string | null;
  mongoId: string | null;
  possibleAnswers: Json | null;
  questionText: string;
  quizSubcategoryId: number;
  updatedAt: Date;
}

/** 'GetMultipleQuestionsById' query type */
export interface IGetMultipleQuestionsByIdQuery {
  params: IGetMultipleQuestionsByIdParams;
  result: IGetMultipleQuestionsByIdResult;
}

const getMultipleQuestionsByIdIR: any = {"name":"getMultipleQuestionsById","params":[{"name":"ids","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2771,"b":2774,"line":121,"col":16}]}}],"usedParamSet":{"ids":true},"statement":{"body":"SELECT *\nFROM quiz_questions\nWHERE id = ANY(:ids!)","loc":{"a":2726,"b":2775,"line":119,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT *
 * FROM quiz_questions
 * WHERE id = ANY(:ids!)
 * ```
 */
export const getMultipleQuestionsById = new PreparedQuery<IGetMultipleQuestionsByIdParams,IGetMultipleQuestionsByIdResult>(getMultipleQuestionsByIdIR);


