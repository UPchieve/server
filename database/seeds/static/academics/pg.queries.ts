/** Types generated for queries found in "database/seeds/static/academics/academics.sql" */
import { PreparedQuery } from '@pgtyped/query'

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json }

/** 'InsertCertification' parameters type */
export interface IInsertCertificationParams {
  name: string
}

/** 'InsertCertification' return type */
export interface IInsertCertificationResult {
  ok: number
}

/** 'InsertCertification' query type */
export interface IInsertCertificationQuery {
  params: IInsertCertificationParams
  result: IInsertCertificationResult
}

const insertCertificationIR: any = {
  name: 'insertCertification',
  params: [
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 103, b: 107, line: 3, col: 13 }] },
    },
  ],
  usedParamSet: { name: true },
  statement: {
    body:
      'INSERT INTO certifications (name, created_at, updated_at)\n    VALUES (:name!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 32, b: 172, line: 2, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO certifications (name, created_at, updated_at)
 *     VALUES (:name!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertCertification = new PreparedQuery<
  IInsertCertificationParams,
  IInsertCertificationResult
>(insertCertificationIR)

/** 'InsertQuiz' parameters type */
export interface IInsertQuizParams {
  name: string
}

/** 'InsertQuiz' return type */
export interface IInsertQuizResult {
  ok: number
}

/** 'InsertQuiz' query type */
export interface IInsertQuizQuery {
  params: IInsertQuizParams
  result: IInsertQuizResult
}

const insertQuizIR: any = {
  name: 'insertQuiz',
  params: [
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 264, b: 268, line: 12, col: 13 }] },
    },
  ],
  usedParamSet: { name: true },
  statement: {
    body:
      'INSERT INTO quizzes (name, created_at, updated_at)\n    VALUES (:name!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 200, b: 333, line: 11, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO quizzes (name, created_at, updated_at)
 *     VALUES (:name!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertQuiz = new PreparedQuery<
  IInsertQuizParams,
  IInsertQuizResult
>(insertQuizIR)

/** 'InsertCertificationGrant' parameters type */
export interface IInsertCertificationGrantParams {
  certificationId: number
  quizId: number
}

/** 'InsertCertificationGrant' return type */
export interface IInsertCertificationGrantResult {
  ok: number
}

/** 'InsertCertificationGrant' query type */
export interface IInsertCertificationGrantQuery {
  params: IInsertCertificationGrantParams
  result: IInsertCertificationGrantResult
}

const insertCertificationGrantIR: any = {
  name: 'insertCertificationGrant',
  params: [
    {
      name: 'quizId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 478, b: 484, line: 21, col: 13 }] },
    },
    {
      name: 'certificationId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 488, b: 503, line: 21, col: 23 }] },
    },
  ],
  usedParamSet: { quizId: true, certificationId: true },
  statement: {
    body:
      'INSERT INTO quiz_certification_grants (quiz_id, certification_id, created_at, updated_at)\n    VALUES (:quizId!, :certificationId!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    quiz_id AS ok',
    loc: { a: 375, b: 573, line: 20, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO quiz_certification_grants (quiz_id, certification_id, created_at, updated_at)
 *     VALUES (:quizId!, :certificationId!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     quiz_id AS ok
 * ```
 */
export const insertCertificationGrant = new PreparedQuery<
  IInsertCertificationGrantParams,
  IInsertCertificationGrantResult
>(insertCertificationGrantIR)

/** 'InsertQuizSubcategory' parameters type */
export interface IInsertQuizSubcategoryParams {
  name: string
  quizId: number
}

/** 'InsertQuizSubcategory' return type */
export interface IInsertQuizSubcategoryResult {
  ok: number
}

/** 'InsertQuizSubcategory' query type */
export interface IInsertQuizSubcategoryQuery {
  params: IInsertQuizSubcategoryParams
  result: IInsertQuizSubcategoryResult
}

const insertQuizSubcategoryIR: any = {
  name: 'insertQuizSubcategory',
  params: [
    {
      name: 'quizId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 696, b: 702, line: 30, col: 13 }] },
    },
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 706, b: 710, line: 30, col: 23 }] },
    },
  ],
  usedParamSet: { quizId: true, name: true },
  statement: {
    body:
      'INSERT INTO quiz_subcategories (quiz_id, name, created_at, updated_at)\n    VALUES (:quizId!, :name!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 612, b: 775, line: 29, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO quiz_subcategories (quiz_id, name, created_at, updated_at)
 *     VALUES (:quizId!, :name!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertQuizSubcategory = new PreparedQuery<
  IInsertQuizSubcategoryParams,
  IInsertQuizSubcategoryResult
>(insertQuizSubcategoryIR)

/** 'InsertQuizQuestion' parameters type */
export interface IInsertQuizQuestionParams {
  correctAnswer: string
  possibleAnswers: Json
  questionText: string
  subCategoryId: number
}

/** 'InsertQuizQuestion' return type */
export interface IInsertQuizQuestionResult {
  ok: number
}

/** 'InsertQuizQuestion' query type */
export interface IInsertQuizQuestionQuery {
  params: IInsertQuizQuestionParams
  result: IInsertQuizQuestionResult
}

const insertQuizQuestionIR: any = {
  name: 'insertQuizQuestion',
  params: [
    {
      name: 'correctAnswer',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 946, b: 959, line: 39, col: 13 }] },
    },
    {
      name: 'possibleAnswers',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 963, b: 978, line: 39, col: 30 }] },
    },
    {
      name: 'subCategoryId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 982, b: 995, line: 39, col: 49 }] },
    },
    {
      name: 'questionText',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 999, b: 1011, line: 39, col: 66 }] },
    },
  ],
  usedParamSet: {
    correctAnswer: true,
    possibleAnswers: true,
    subCategoryId: true,
    questionText: true,
  },
  statement: {
    body:
      'INSERT INTO quiz_questions (correct_answer, possible_answers, quiz_subcategory_id, question_text, created_at, updated_at)\n    VALUES (:correctAnswer!, :possibleAnswers!, :subCategoryId!, :questionText!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 811, b: 1076, line: 38, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO quiz_questions (correct_answer, possible_answers, quiz_subcategory_id, question_text, created_at, updated_at)
 *     VALUES (:correctAnswer!, :possibleAnswers!, :subCategoryId!, :questionText!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertQuizQuestion = new PreparedQuery<
  IInsertQuizQuestionParams,
  IInsertQuizQuestionResult
>(insertQuizQuestionIR)

/** 'InsertSubject' parameters type */
export interface IInsertSubjectParams {
  displayName: string
  displayOrder: number
  name: string
  toolTypeId: number
  topicId: number
}

/** 'InsertSubject' return type */
export interface IInsertSubjectResult {
  ok: number
}

/** 'InsertSubject' query type */
export interface IInsertSubjectQuery {
  params: IInsertSubjectParams
  result: IInsertSubjectResult
}

const insertSubjectIR: any = {
  name: 'insertSubject',
  params: [
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1225, b: 1229, line: 48, col: 13 }] },
    },
    {
      name: 'displayName',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1233, b: 1244, line: 48, col: 21 }] },
    },
    {
      name: 'displayOrder',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1248, b: 1260, line: 48, col: 36 }] },
    },
    {
      name: 'toolTypeId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1264, b: 1274, line: 48, col: 52 }] },
    },
    {
      name: 'topicId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1278, b: 1285, line: 48, col: 66 }] },
    },
  ],
  usedParamSet: {
    name: true,
    displayName: true,
    displayOrder: true,
    toolTypeId: true,
    topicId: true,
  },
  statement: {
    body:
      'INSERT INTO subjects (name, display_name, display_order, tool_type_id, topic_id, created_at, updated_at)\n    VALUES (:name!, :displayName!, :displayOrder!, :toolTypeId!, :topicId!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 1107, b: 1350, line: 47, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO subjects (name, display_name, display_order, tool_type_id, topic_id, created_at, updated_at)
 *     VALUES (:name!, :displayName!, :displayOrder!, :toolTypeId!, :topicId!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertSubject = new PreparedQuery<
  IInsertSubjectParams,
  IInsertSubjectResult
>(insertSubjectIR)

/** 'InsertCertificationSubjectUnlocks' parameters type */
export interface IInsertCertificationSubjectUnlocksParams {
  certificationId: number
  subjectId: number
}

/** 'InsertCertificationSubjectUnlocks' return type */
export interface IInsertCertificationSubjectUnlocksResult {
  ok: number
}

/** 'InsertCertificationSubjectUnlocks' query type */
export interface IInsertCertificationSubjectUnlocksQuery {
  params: IInsertCertificationSubjectUnlocksParams
  result: IInsertCertificationSubjectUnlocksResult
}

const insertCertificationSubjectUnlocksIR: any = {
  name: 'insertCertificationSubjectUnlocks',
  params: [
    {
      name: 'certificationId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1511, b: 1526, line: 57, col: 13 }] },
    },
    {
      name: 'subjectId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1530, b: 1539, line: 57, col: 32 }] },
    },
  ],
  usedParamSet: { certificationId: true, subjectId: true },
  statement: {
    body:
      'INSERT INTO certification_subject_unlocks (certification_id, subject_id, created_at, updated_at)\n    VALUES (:certificationId!, :subjectId!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    subject_id AS ok',
    loc: { a: 1401, b: 1612, line: 56, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO certification_subject_unlocks (certification_id, subject_id, created_at, updated_at)
 *     VALUES (:certificationId!, :subjectId!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     subject_id AS ok
 * ```
 */
export const insertCertificationSubjectUnlocks = new PreparedQuery<
  IInsertCertificationSubjectUnlocksParams,
  IInsertCertificationSubjectUnlocksResult
>(insertCertificationSubjectUnlocksIR)

/** 'InsertToolType' parameters type */
export interface IInsertToolTypeParams {
  name: string
}

/** 'InsertToolType' return type */
export interface IInsertToolTypeResult {
  ok: number
}

/** 'InsertToolType' query type */
export interface IInsertToolTypeQuery {
  params: IInsertToolTypeParams
  result: IInsertToolTypeResult
}

const insertToolTypeIR: any = {
  name: 'insertToolType',
  params: [
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1711, b: 1715, line: 66, col: 13 }] },
    },
  ],
  usedParamSet: { name: true },
  statement: {
    body:
      'INSERT INTO tool_types (name, created_at, updated_at)\n    VALUES (:name!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 1644, b: 1780, line: 65, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO tool_types (name, created_at, updated_at)
 *     VALUES (:name!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertToolType = new PreparedQuery<
  IInsertToolTypeParams,
  IInsertToolTypeResult
>(insertToolTypeIR)

/** 'InsertTopic' parameters type */
export interface IInsertTopicParams {
  dashboardOrder: number
  displayName: string
  name: string
}

/** 'InsertTopic' return type */
export interface IInsertTopicResult {
  ok: number
}

/** 'InsertTopic' query type */
export interface IInsertTopicQuery {
  params: IInsertTopicParams
  result: IInsertTopicResult
}

const insertTopicIR: any = {
  name: 'insertTopic',
  params: [
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1903, b: 1907, line: 75, col: 13 }] },
    },
    {
      name: 'displayName',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1911, b: 1922, line: 75, col: 21 }] },
    },
    {
      name: 'dashboardOrder',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1926, b: 1940, line: 75, col: 36 }] },
    },
  ],
  usedParamSet: { name: true, displayName: true, dashboardOrder: true },
  statement: {
    body:
      'INSERT INTO topics (name, display_name, dashboard_order, created_at, updated_at)\n    VALUES (:name!, :displayName!, :dashboardOrder!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 1809, b: 2005, line: 74, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO topics (name, display_name, dashboard_order, created_at, updated_at)
 *     VALUES (:name!, :displayName!, :dashboardOrder!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertTopic = new PreparedQuery<
  IInsertTopicParams,
  IInsertTopicResult
>(insertTopicIR)

/** 'InsertTrainingCourse' parameters type */
export interface IInsertTrainingCourseParams {
  name: string
}

/** 'InsertTrainingCourse' return type */
export interface IInsertTrainingCourseResult {
  ok: string
}

/** 'InsertTrainingCourse' query type */
export interface IInsertTrainingCourseQuery {
  params: IInsertTrainingCourseParams
  result: IInsertTrainingCourseResult
}

const insertTrainingCourseIR: any = {
  name: 'insertTrainingCourse',
  params: [
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2116, b: 2120, line: 84, col: 13 }] },
    },
  ],
  usedParamSet: { name: true },
  statement: {
    body:
      'INSERT INTO training_courses (name, created_at, updated_at)\n    VALUES (:name!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    name AS ok',
    loc: { a: 2043, b: 2187, line: 83, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO training_courses (name, created_at, updated_at)
 *     VALUES (:name!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     name AS ok
 * ```
 */
export const insertTrainingCourse = new PreparedQuery<
  IInsertTrainingCourseParams,
  IInsertTrainingCourseResult
>(insertTrainingCourseIR)

/** 'GetCertifications' parameters type */
export type IGetCertificationsParams = void

/** 'GetCertifications' return type */
export interface IGetCertificationsResult {
  id: number
  name: string
}

/** 'GetCertifications' query type */
export interface IGetCertificationsQuery {
  params: IGetCertificationsParams
  result: IGetCertificationsResult
}

const getCertificationsIR: any = {
  name: 'getCertifications',
  params: [],
  usedParamSet: {},
  statement: {
    body: 'SELECT\n    id,\n    name\nFROM\n    certifications',
    loc: { a: 2222, b: 2268, line: 92, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     name
 * FROM
 *     certifications
 * ```
 */
export const getCertifications = new PreparedQuery<
  IGetCertificationsParams,
  IGetCertificationsResult
>(getCertificationsIR)

/** 'GetQuizzes' parameters type */
export type IGetQuizzesParams = void

/** 'GetQuizzes' return type */
export interface IGetQuizzesResult {
  id: number
  name: string
}

/** 'GetQuizzes' query type */
export interface IGetQuizzesQuery {
  params: IGetQuizzesParams
  result: IGetQuizzesResult
}

const getQuizzesIR: any = {
  name: 'getQuizzes',
  params: [],
  usedParamSet: {},
  statement: {
    body: 'SELECT\n    id,\n    name\nFROM\n    quizzes',
    loc: { a: 2296, b: 2335, line: 100, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     name
 * FROM
 *     quizzes
 * ```
 */
export const getQuizzes = new PreparedQuery<
  IGetQuizzesParams,
  IGetQuizzesResult
>(getQuizzesIR)
