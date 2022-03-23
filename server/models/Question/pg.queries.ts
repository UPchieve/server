/** Types generated for queries found in "server/models/Question/question.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

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

const createIR: any = {"name":"create","params":[{"name":"subjectId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":113,"b":122,"line":5,"col":9}]}},{"name":"category","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":134,"b":142,"line":6,"col":9},{"a":338,"b":346,"line":16,"col":33}]}},{"name":"quizSubcategoryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":455,"b":472,"line":21,"col":9}]}},{"name":"subcategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":484,"b":495,"line":22,"col":9},{"a":711,"b":722,"line":32,"col":43}]}},{"name":"questionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":911,"b":921,"line":37,"col":5}]}},{"name":"questionText","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":929,"b":941,"line":38,"col":5}]}},{"name":"possibleAnswers","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":949,"b":964,"line":39,"col":5}]}},{"name":"correctAnswer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":972,"b":985,"line":40,"col":5}]}},{"name":"imageSrc","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":993,"b":1001,"line":41,"col":5}]}}],"usedParamSet":{"subjectId":true,"category":true,"quizSubcategoryId":true,"subcategory":true,"questionId":true,"questionText":true,"possibleAnswers":true,"correctAnswer":true,"imageSrc":true},"statement":{"body":"WITH subject AS (\nINSERT INTO subjects (id, name, created_at, updated_at)\n    SELECT\n        :subjectId!,\n        :category!,\n        NOW(),\n        NOW()\n    WHERE\n        NOT EXISTS (\n            SELECT\n                name\n            FROM\n                subjects\n            WHERE\n                subjects.name = :category!)\n),\nsubcategory AS (\nINSERT INTO quiz_subcategories (id, name, created_at, updated_at)\n    SELECT\n        :quizSubcategoryId!,\n        :subcategory!,\n        NOW(),\n        NOW()\n    WHERE\n        NOT EXISTS (\n            SELECT\n                name\n            FROM\n                quiz_subcategories\n            WHERE\n                quiz_subcategories.name = :subcategory!)\n        RETURNING\n            id)\nINSERT INTO quiz_questions (id, question_text, possible_answers, correct_answer, image_source, created_at, updated_at, quiz_subcategory_id)\nSELECT\n    :questionId!,\n    :questionText!,\n    :possibleAnswers!,\n    :correctAnswer!,\n    :imageSrc!,\n    NOW(),\n    NOw(),\n    subcategory.id\nFROM\n    subcategory","loc":{"a":19,"b":1064,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH subject AS (
 * INSERT INTO subjects (id, name, created_at, updated_at)
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
 *                 subjects
 *             WHERE
 *                 subjects.name = :category!)
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
  imageSource: string | null;
  mongoId: string | null;
  possibleAnswers: Json | null;
  questionText: string;
  quizSubcategoryId: number;
  updatedAt: Date;
}

/** 'Destroy' query type */
export interface IDestroyQuery {
  params: IDestroyParams;
  result: IDestroyResult;
}

const destroyIR: any = {"name":"destroy","params":[{"name":"questionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1143,"b":1153,"line":51,"col":27}]}}],"usedParamSet":{"questionId":true},"statement":{"body":"DELETE FROM quiz_questions\nWHERE quiz_questions.id = :questionId!\nRETURNING\n    *","loc":{"a":1089,"b":1169,"line":50,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM quiz_questions
 * WHERE quiz_questions.id = :questionId!
 * RETURNING
 *     *
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

const updateIR: any = {"name":"update","params":[{"name":"quizSubcategoryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1301,"b":1318,"line":60,"col":9}]}},{"name":"subcategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1330,"b":1341,"line":61,"col":9},{"a":1557,"b":1568,"line":71,"col":43}]}},{"name":"questionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1645,"b":1655,"line":77,"col":10},{"a":1954,"b":1964,"line":87,"col":25}]}},{"name":"questionText","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1679,"b":1691,"line":78,"col":21}]}},{"name":"txt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1755,"b":1758,"line":79,"col":61}]}},{"name":"correctAnswer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1790,"b":1803,"line":80,"col":22}]}},{"name":"imageSrc","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1826,"b":1834,"line":81,"col":20}]}}],"usedParamSet":{"quizSubcategoryId":true,"subcategory":true,"questionId":true,"questionText":true,"txt":true,"correctAnswer":true,"imageSrc":true},"statement":{"body":"WITH subcategory AS (\nINSERT INTO quiz_subcategories (id, name, created_at, updated_at)\n    SELECT\n        :quizSubcategoryId!,\n        :subcategory!,\n        NOW(),\n        NOW()\n    WHERE\n        NOT EXISTS (\n            SELECT\n                name\n            FROM\n                quiz_subcategories\n            WHERE\n                quiz_subcategories.name = :subcategory!)\n        RETURNING\n            id)\nUPDATE\n    quiz_questions\nSET\n    id = :questionId!,\n    question_text = :questionText!,\n    possible_answers = jsonb_set(possible_answers, '{txt}', :txt!, TRUE),\n    correct_answer = :correctAnswer!,\n    image_source = :imageSrc!,\n    updated_at = NOW(),\n    quiz_subcategory_id = subcategory.id\nFROM\n    subcategory\nWHERE\n    quiz_questions.id = :questionId!","loc":{"a":1193,"b":1964,"line":57,"col":0}}};

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
  name: string;
}

/** 'Categories' query type */
export interface ICategoriesQuery {
  params: ICategoriesParams;
  result: ICategoriesResult;
}

const categoriesIR: any = {"name":"categories","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    subcat.name\nFROM\n    quiz_questions AS questions\n    LEFT JOIN quiz_subcategories subcat ON questions.quiz_subcategory_id = subcat.id\nGROUP BY\n    subcat.id","loc":{"a":1992,"b":2158,"line":91,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     subcat.name
 * FROM
 *     quiz_questions AS questions
 *     LEFT JOIN quiz_subcategories subcat ON questions.quiz_subcategory_id = subcat.id
 * GROUP BY
 *     subcat.id
 * ```
 */
export const categories = new PreparedQuery<ICategoriesParams,ICategoriesResult>(categoriesIR);


/** 'Topics' parameters type */
export type ITopicsParams = void;

/** 'Topics' return type */
export interface ITopicsResult {
  name: string;
}

/** 'Topics' query type */
export interface ITopicsQuery {
  params: ITopicsParams;
  result: ITopicsResult;
}

const topicsIR: any = {"name":"topics","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    topics.name\nFROM\n    subjects\n    LEFT JOIN topics ON subjects.topic_id = topics.id\nGROUP BY\n    topics.id","loc":{"a":2182,"b":2298,"line":101,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     topics.name
 * FROM
 *     subjects
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
 * GROUP BY
 *     topics.id
 * ```
 */
export const topics = new PreparedQuery<ITopicsParams,ITopicsResult>(topicsIR);


