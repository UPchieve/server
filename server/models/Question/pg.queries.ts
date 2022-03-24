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

const createIR: any = {"name":"create","params":[{"name":"subjectId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":595,"b":604,"line":25,"col":17}]}},{"name":"category","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":608,"b":616,"line":25,"col":30}]}},{"name":"quizSubcategoryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":771,"b":788,"line":30,"col":17}]}},{"name":"subcategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":792,"b":803,"line":30,"col":38}]}},{"name":"questionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1045,"b":1055,"line":37,"col":9}]}},{"name":"questionText","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1067,"b":1079,"line":38,"col":9}]}},{"name":"possibleAnswers","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1091,"b":1106,"line":39,"col":9}]}},{"name":"correctAnswer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1118,"b":1131,"line":40,"col":9}]}},{"name":"imageSrc","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1143,"b":1151,"line":41,"col":9}]}}],"usedParamSet":{"subjectId":true,"category":true,"quizSubcategoryId":true,"subcategory":true,"questionId":true,"questionText":true,"possibleAnswers":true,"correctAnswer":true,"imageSrc":true},"statement":{"body":"WITH quiz AS (\nINSERT INTO quizzes (id, name, created_at, updated_at)\n        VALUES (:subjectId!, :category!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n), subcategory AS (\nINSERT INTO quiz_subcategories (id, name, created_at, updated_at)\n        VALUES (:quizSubcategoryId!, :subcategory!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id)\n    INSERT INTO quiz_questions (id, question_text, possible_answers, correct_answer, image_source, created_at, updated_at, quiz_subcategory_id)\n    SELECT\n        :questionId!,\n        :questionText!,\n        :possibleAnswers!,\n        :correctAnswer!,\n        :imageSrc!,\n        NOW(),\n        NOw(),\n        subcategory.id\n    FROM\n        subcategory","loc":{"a":508,"b":1234,"line":23,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH quiz AS (
 * INSERT INTO quizzes (id, name, created_at, updated_at)
 *         VALUES (:subjectId!, :category!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 * ), subcategory AS (
 * INSERT INTO quiz_subcategories (id, name, created_at, updated_at)
 *         VALUES (:quizSubcategoryId!, :subcategory!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id)
 *     INSERT INTO quiz_questions (id, question_text, possible_answers, correct_answer, image_source, created_at, updated_at, quiz_subcategory_id)
 *     SELECT
 *         :questionId!,
 *         :questionText!,
 *         :possibleAnswers!,
 *         :correctAnswer!,
 *         :imageSrc!,
 *         NOW(),
 *         NOw(),
 *         subcategory.id
 *     FROM
 *         subcategory
 * ```
 */
export const create = new PreparedQuery<ICreateParams,ICreateResult>(createIR);


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

const destroyIR: any = {"name":"destroy","params":[{"name":"questionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1313,"b":1323,"line":51,"col":27}]}}],"usedParamSet":{"questionId":true},"statement":{"body":"DELETE FROM quiz_questions\nWHERE quiz_questions.id = :questionId!\nRETURNING\n    id AS ok","loc":{"a":1259,"b":1346,"line":50,"col":0}}};

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

const updateIR: any = {"name":"update","params":[{"name":"quizSubcategoryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1475,"b":1492,"line":59,"col":17}]}},{"name":"subcategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1496,"b":1507,"line":59,"col":38}]}},{"name":"questionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1641,"b":1651,"line":67,"col":14},{"a":1990,"b":2000,"line":77,"col":29}]}},{"name":"questionText","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1679,"b":1691,"line":68,"col":25}]}},{"name":"txt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1759,"b":1762,"line":69,"col":65}]}},{"name":"correctAnswer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1798,"b":1811,"line":70,"col":26}]}},{"name":"imageSrc","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1838,"b":1846,"line":71,"col":24}]}}],"usedParamSet":{"quizSubcategoryId":true,"subcategory":true,"questionId":true,"questionText":true,"txt":true,"correctAnswer":true,"imageSrc":true},"statement":{"body":"WITH subcategory AS (\nINSERT INTO quiz_subcategories (id, name, created_at, updated_at)\n        VALUES (:quizSubcategoryId!, :subcategory!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id)\n    UPDATE\n        quiz_questions\n    SET\n        id = :questionId!,\n        question_text = :questionText!,\n        possible_answers = jsonb_set(possible_answers, '{txt}', :txt!, TRUE),\n        correct_answer = :correctAnswer!,\n        image_source = :imageSrc!,\n        updated_at = NOW(),\n        quiz_subcategory_id = subcategory.id\n    FROM\n        subcategory\n    WHERE\n        quiz_questions.id = :questionId!","loc":{"a":1370,"b":2000,"line":57,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH subcategory AS (
 * INSERT INTO quiz_subcategories (id, name, created_at, updated_at)
 *         VALUES (:quizSubcategoryId!, :subcategory!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id)
 *     UPDATE
 *         quiz_questions
 *     SET
 *         id = :questionId!,
 *         question_text = :questionText!,
 *         possible_answers = jsonb_set(possible_answers, '{txt}', :txt!, TRUE),
 *         correct_answer = :correctAnswer!,
 *         image_source = :imageSrc!,
 *         updated_at = NOW(),
 *         quiz_subcategory_id = subcategory.id
 *     FROM
 *         subcategory
 *     WHERE
 *         quiz_questions.id = :questionId!
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

const categoriesIR: any = {"name":"categories","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    quizzes.name AS categories,\n    array_agg(quiz_subcategories.name) AS subcategories\nFROM\n    quizzes\n    LEFT JOIN quiz_subcategories ON quiz_subcategories.quiz_id = quizzes.id\nGROUP BY\n    quizzes.name","loc":{"a":2028,"b":2240,"line":81,"col":0}}};

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


