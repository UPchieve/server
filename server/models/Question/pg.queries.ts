/** Types generated for queries found in "server/models/Question/question.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

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
  category: string;
  correctAnswer: string;
  imageSrc: string;
  possibleAnswers: Json;
  questionId: number;
  questionText: string;
  quizSubcategoryId: number;
  subcategory: string;
  subjectId: number;
}

/** 'Create' return type */
export type ICreateResult = void;

/** 'Create' query type */
export interface ICreateQuery {
  params: ICreateParams;
  result: ICreateResult;
}

const createIR: any = {"name":"create","params":[{"name":"subjectId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":598,"b":607,"line":26,"col":9}]}},{"name":"category","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":619,"b":627,"line":27,"col":9},{"a":821,"b":829,"line":37,"col":32}]}},{"name":"quizSubcategoryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":938,"b":955,"line":42,"col":9}]}},{"name":"subcategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":967,"b":978,"line":43,"col":9},{"a":1194,"b":1205,"line":53,"col":43}]}},{"name":"questionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1394,"b":1404,"line":58,"col":5}]}},{"name":"questionText","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1412,"b":1424,"line":59,"col":5}]}},{"name":"possibleAnswers","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1432,"b":1447,"line":60,"col":5}]}},{"name":"correctAnswer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1455,"b":1468,"line":61,"col":5}]}},{"name":"imageSrc","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1476,"b":1484,"line":62,"col":5}]}}],"usedParamSet":{"subjectId":true,"category":true,"quizSubcategoryId":true,"subcategory":true,"questionId":true,"questionText":true,"possibleAnswers":true,"correctAnswer":true,"imageSrc":true},"statement":{"body":"WITH quiz AS (\nINSERT INTO quizzes (id, name, created_at, updated_at)\n    SELECT\n        :subjectId!,\n        :category!,\n        NOW(),\n        NOW()\n    WHERE\n        NOT EXISTS (\n            SELECT\n                name\n            FROM\n                quizzes\n            WHERE\n                quizzes.name = :category!)\n),\nsubcategory AS (\nINSERT INTO quiz_subcategories (id, name, created_at, updated_at)\n    SELECT\n        :quizSubcategoryId!,\n        :subcategory!,\n        NOW(),\n        NOW()\n    WHERE\n        NOT EXISTS (\n            SELECT\n                name\n            FROM\n                quiz_subcategories\n            WHERE\n                quiz_subcategories.name = :subcategory!)\n        RETURNING\n            id)\nINSERT INTO quiz_questions (id, question_text, possible_answers, correct_answer, image_source, created_at, updated_at, quiz_subcategory_id)\nSELECT\n    :questionId!,\n    :questionText!,\n    :possibleAnswers!,\n    :correctAnswer!,\n    :imageSrc!,\n    NOW(),\n    NOw(),\n    subcategory.id\nFROM\n    subcategory","loc":{"a":508,"b":1547,"line":23,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH quiz AS (
 * INSERT INTO quizzes (id, name, created_at, updated_at)
 *     SELECT
 *         :subjectId!,
 *         :category!,
 *         NOW(),
 *         NOW()
 *     WHERE
 *         NOT EXISTS (
 *             SELECT
 *                 name
 *             FROM
 *                 quizzes
 *             WHERE
 *                 quizzes.name = :category!)
 * ),
 * subcategory AS (
 * INSERT INTO quiz_subcategories (id, name, created_at, updated_at)
 *     SELECT
 *         :quizSubcategoryId!,
 *         :subcategory!,
 *         NOW(),
 *         NOW()
 *     WHERE
 *         NOT EXISTS (
 *             SELECT
 *                 name
 *             FROM
 *                 quiz_subcategories
 *             WHERE
 *                 quiz_subcategories.name = :subcategory!)
 *         RETURNING
 *             id)
 * INSERT INTO quiz_questions (id, question_text, possible_answers, correct_answer, image_source, created_at, updated_at, quiz_subcategory_id)
 * SELECT
 *     :questionId!,
 *     :questionText!,
 *     :possibleAnswers!,
 *     :correctAnswer!,
 *     :imageSrc!,
 *     NOW(),
 *     NOw(),
 *     subcategory.id
 * FROM
 *     subcategory
 * ```
 */
export const create = new PreparedQuery<ICreateParams,ICreateResult>(createIR);


/** 'Destroy' parameters type */
export interface IDestroyParams {
  questionId: number;
}

/** 'Destroy' return type */
export interface IDestroyResult {
  correctAnswer: string;
  createdAt: Date;
  id: number;
  imageSrc: string | null;
  mongoId: string | null;
  possibleAnswers: Json | null;
  questionText: string;
  updatedAt: Date;
}

/** 'Destroy' query type */
export interface IDestroyQuery {
  params: IDestroyParams;
  result: IDestroyResult;
}

const destroyIR: any = {"name":"destroy","params":[{"name":"questionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1626,"b":1636,"line":72,"col":27}]}}],"usedParamSet":{"questionId":true},"statement":{"body":"DELETE FROM quiz_questions\nWHERE quiz_questions.id = :questionId!\nRETURNING\n    id,\n    question_text,\n    possible_answers,\n    correct_answer,\n    image_source AS image_src,\n    created_at,\n    updated_at,\n    mongo_id","loc":{"a":1572,"b":1791,"line":71,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM quiz_questions
 * WHERE quiz_questions.id = :questionId!
 * RETURNING
 *     id,
 *     question_text,
 *     possible_answers,
 *     correct_answer,
 *     image_source AS image_src,
 *     created_at,
 *     updated_at,
 *     mongo_id
 * ```
 */
export const destroy = new PreparedQuery<IDestroyParams,IDestroyResult>(destroyIR);


/** 'GetQuestionCategory' parameters type */
export interface IGetQuestionCategoryParams {
  questionId: number;
}

/** 'GetQuestionCategory' return type */
export interface IGetQuestionCategoryResult {
  category: string;
  subcategory: string;
}

/** 'GetQuestionCategory' query type */
export interface IGetQuestionCategoryQuery {
  params: IGetQuestionCategoryParams;
  result: IGetQuestionCategoryResult;
}

const getQuestionCategoryIR: any = {"name":"getQuestionCategory","params":[{"name":"questionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2082,"b":2092,"line":93,"col":15}]}}],"usedParamSet":{"questionId":true},"statement":{"body":"SELECT\n    quizzes.name AS category,\n    subcat.name AS subcategory\nFROM\n    quiz_questions AS ques\n    LEFT JOIN quiz_subcategories subcat ON ques.quiz_subcategory_id = subcat.id\n    LEFT JOIN quizzes ON quizzes.id = subcat.quiz_id\nWHERE\n    ques.id = :questionId!","loc":{"a":1828,"b":2092,"line":85,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     quizzes.name AS category,
 *     subcat.name AS subcategory
 * FROM
 *     quiz_questions AS ques
 *     LEFT JOIN quiz_subcategories subcat ON ques.quiz_subcategory_id = subcat.id
 *     LEFT JOIN quizzes ON quizzes.id = subcat.quiz_id
 * WHERE
 *     ques.id = :questionId!
 * ```
 */
export const getQuestionCategory = new PreparedQuery<IGetQuestionCategoryParams,IGetQuestionCategoryResult>(getQuestionCategoryIR);


/** 'Update' parameters type */
export interface IUpdateParams {
  correctAnswer: string;
  imageSrc: string;
  questionId: number;
  questionText: string;
  quizSubcategoryId: number;
  subcategory: string;
  txt: Json;
}

/** 'Update' return type */
export type IUpdateResult = void;

/** 'Update' query type */
export interface IUpdateQuery {
  params: IUpdateParams;
  result: IUpdateResult;
}

const updateIR: any = {"name":"update","params":[{"name":"quizSubcategoryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2224,"b":2241,"line":100,"col":9}]}},{"name":"subcategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2253,"b":2264,"line":101,"col":9},{"a":2480,"b":2491,"line":111,"col":43}]}},{"name":"questionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2568,"b":2578,"line":117,"col":10},{"a":2877,"b":2887,"line":127,"col":25}]}},{"name":"questionText","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2602,"b":2614,"line":118,"col":21}]}},{"name":"txt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2678,"b":2681,"line":119,"col":61}]}},{"name":"correctAnswer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2713,"b":2726,"line":120,"col":22}]}},{"name":"imageSrc","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2749,"b":2757,"line":121,"col":20}]}}],"usedParamSet":{"quizSubcategoryId":true,"subcategory":true,"questionId":true,"questionText":true,"txt":true,"correctAnswer":true,"imageSrc":true},"statement":{"body":"WITH subcategory AS (\nINSERT INTO quiz_subcategories (id, name, created_at, updated_at)\n    SELECT\n        :quizSubcategoryId!,\n        :subcategory!,\n        NOW(),\n        NOW()\n    WHERE\n        NOT EXISTS (\n            SELECT\n                name\n            FROM\n                quiz_subcategories\n            WHERE\n                quiz_subcategories.name = :subcategory!)\n        RETURNING\n            id)\nUPDATE\n    quiz_questions\nSET\n    id = :questionId!,\n    question_text = :questionText!,\n    possible_answers = jsonb_set(possible_answers, '{txt}', :txt!, TRUE),\n    correct_answer = :correctAnswer!,\n    image_source = :imageSrc!,\n    updated_at = NOW(),\n    quiz_subcategory_id = subcategory.id\nFROM\n    subcategory\nWHERE\n    quiz_questions.id = :questionId!","loc":{"a":2116,"b":2887,"line":97,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH subcategory AS (
 * INSERT INTO quiz_subcategories (id, name, created_at, updated_at)
 *     SELECT
 *         :quizSubcategoryId!,
 *         :subcategory!,
 *         NOW(),
 *         NOW()
 *     WHERE
 *         NOT EXISTS (
 *             SELECT
 *                 name
 *             FROM
 *                 quiz_subcategories
 *             WHERE
 *                 quiz_subcategories.name = :subcategory!)
 *         RETURNING
 *             id)
 * UPDATE
 *     quiz_questions
 * SET
 *     id = :questionId!,
 *     question_text = :questionText!,
 *     possible_answers = jsonb_set(possible_answers, '{txt}', :txt!, TRUE),
 *     correct_answer = :correctAnswer!,
 *     image_source = :imageSrc!,
 *     updated_at = NOW(),
 *     quiz_subcategory_id = subcategory.id
 * FROM
 *     subcategory
 * WHERE
 *     quiz_questions.id = :questionId!
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

const categoriesIR: any = {"name":"categories","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    quizzes.name AS categories,\n    array_agg(quiz_subcategories.name) AS subcategories\nFROM\n    quizzes\n    LEFT JOIN quiz_subcategories ON quiz_subcategories.quiz_id = quizzes.id\nGROUP BY\n    quizzes.name","loc":{"a":2915,"b":3127,"line":131,"col":0}}};

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


