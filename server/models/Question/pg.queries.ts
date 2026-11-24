/** Types generated for queries found in "server/models/Question/question.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type numberArray = (number)[];

/** 'List' parameters type */
export interface IListParams {
  category: string;
  subcategory?: string | null | void;
}

/** 'List' return type */
export interface IListResult {
  /** not_pii: Human-readable name */
  category: string;
  /** not_pii: The correct answer text */
  correctAnswer: string;
  /** not_pii */
  createdAt: Date;
  /** not_pii: Primary key */
  id: number;
  /** not_pii: URL or path to an image associated with the quiz question */
  imageSrc: string | null;
  /** not_pii: JSON array of possible answer options */
  possibleAnswers: Json | null;
  /** not_pii: Text of the quiz question */
  questionText: string;
  /** not_pii: Human-readable name */
  subcategory: string;
  /** not_pii */
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


/** 'GetSubcategoriesForQuiz' parameters type */
export interface IGetSubcategoriesForQuizParams {
  quizName: string;
}

/** 'GetSubcategoriesForQuiz' return type */
export interface IGetSubcategoriesForQuizResult {
  /** not_pii: Human-readable name */
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
  /** not_pii: Human-readable name */
  category: string;
  /** not_pii: The correct answer text */
  correctAnswer: string;
  /** not_pii */
  createdAt: Date;
  /** not_pii: Primary key */
  id: number;
  /** not_pii: URL or path to an image associated with the quiz question */
  imageSrc: string | null;
  /** not_pii: JSON array of possible answer options */
  possibleAnswers: Json | null;
  /** not_pii: Text of the quiz question */
  questionText: string;
  /** not_pii: Human-readable name */
  subcategory: string;
  /** not_pii */
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


/** 'GetQuizReviewMaterials' parameters type */
export interface IGetQuizReviewMaterialsParams {
  category: string;
}

/** 'GetQuizReviewMaterials' return type */
export interface IGetQuizReviewMaterialsResult {
  /** not_pii: Human-readable name */
  category: string;
  /** not_pii: URL or path to the review material cover image */
  image: string;
  /** not_pii: URL or path to the review material PDF */
  pdf: string;
  /** not_pii: Title of the record */
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
  isSubjectCertification: boolean | null;
  /** not_pii: User-facing display name */
  quizDisplayName: string;
  /** not_pii: Sort order for UI display */
  quizDisplayOrder: number;
  /** not_pii: Human-readable name */
  quizName: string;
  /** not_pii: Sort order on the student subject dashboard */
  topicDashboardOrder: number;
  /** not_pii: User-facing display name */
  topicDisplayName: string;
  /** not_pii: Human-readable name */
  topicName: string;
  /** not_pii: Sort order in the volunteer training flow */
  topicTrainingOrder: number;
  /** not_pii: User-facing display name */
  unlockedCertDisplayName: string;
  /** not_pii: Sort order for UI display */
  unlockedCertDisplayOrder: number;
  /** not_pii: Human-readable name of the certification */
  unlockedCertName: string;
}

/** 'GetQuizCertUnlocksByQuizName' query type */
export interface IGetQuizCertUnlocksByQuizNameQuery {
  params: IGetQuizCertUnlocksByQuizNameParams;
  result: IGetQuizCertUnlocksByQuizNameResult;
}

const getQuizCertUnlocksByQuizNameIR: any = {"usedParamSet":{"quizName":true},"params":[{"name":"quizName","required":true,"transform":{"type":"scalar"},"locs":[{"a":1024,"b":1033}]}],"statement":"SELECT\n    quizzes.name AS quiz_name,\n    CASE WHEN topics.name IS NULL THEN\n        FALSE\n    ELSE\n        TRUE\n    END AS is_subject_certification,\n    subject_quiz_info.display_name AS quiz_display_name,\n    subject_quiz_info.display_order AS quiz_display_order,\n    certs.name AS unlocked_cert_name,\n    subject_cert_info.display_name AS unlocked_cert_display_name,\n    subject_cert_info.display_order AS unlocked_cert_display_order,\n    topics.name AS topic_name,\n    topics.display_name AS topic_display_name,\n    topics.dashboard_order AS topic_dashboard_order,\n    topics.training_order AS topic_training_order\nFROM\n    quiz_certification_grants qcg\n    JOIN quizzes ON quizzes.id = qcg.quiz_id\n    JOIN certifications certs ON certs.id = qcg.certification_id\n    LEFT JOIN subjects AS subject_quiz_info ON subject_quiz_info.name = quizzes.name\n    LEFT JOIN subjects AS subject_cert_info ON subject_cert_info.name = certs.name\n    LEFT JOIN topics ON topics.id = subject_cert_info.topic_id\nWHERE\n    quizzes.name = :quizName!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     quizzes.name AS quiz_name,
 *     CASE WHEN topics.name IS NULL THEN
 *         FALSE
 *     ELSE
 *         TRUE
 *     END AS is_subject_certification,
 *     subject_quiz_info.display_name AS quiz_display_name,
 *     subject_quiz_info.display_order AS quiz_display_order,
 *     certs.name AS unlocked_cert_name,
 *     subject_cert_info.display_name AS unlocked_cert_display_name,
 *     subject_cert_info.display_order AS unlocked_cert_display_order,
 *     topics.name AS topic_name,
 *     topics.display_name AS topic_display_name,
 *     topics.dashboard_order AS topic_dashboard_order,
 *     topics.training_order AS topic_training_order
 * FROM
 *     quiz_certification_grants qcg
 *     JOIN quizzes ON quizzes.id = qcg.quiz_id
 *     JOIN certifications certs ON certs.id = qcg.certification_id
 *     LEFT JOIN subjects AS subject_quiz_info ON subject_quiz_info.name = quizzes.name
 *     LEFT JOIN subjects AS subject_cert_info ON subject_cert_info.name = certs.name
 *     LEFT JOIN topics ON topics.id = subject_cert_info.topic_id
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
  /** not_pii: Whether this quiz is currently available to volunteers */
  active: boolean;
  /** not_pii: Primary key */
  id: number;
  /** not_pii: Human-readable name */
  name: string;
  /** not_pii: Number of questions drawn per subcategory per quiz attempt */
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


