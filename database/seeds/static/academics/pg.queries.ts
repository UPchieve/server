/** Types generated for queries found in "database/seeds/static/academics/academics.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'InsertCertification' parameters type */
export interface IInsertCertificationParams {
  name: string;
}

/** 'InsertCertification' return type */
export interface IInsertCertificationResult {
  ok: number;
}

/** 'InsertCertification' query type */
export interface IInsertCertificationQuery {
  params: IInsertCertificationParams;
  result: IInsertCertificationResult;
}

const insertCertificationIR: any = {"name":"insertCertification","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":99,"b":103,"line":2,"col":67}]}}],"usedParamSet":{"name":true},"statement":{"body":"INSERT INTO certifications (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":32,"b":160,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO certifications (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertCertification = new PreparedQuery<IInsertCertificationParams,IInsertCertificationResult>(insertCertificationIR);


/** 'InsertQuiz' parameters type */
export interface IInsertQuizParams {
  name: string;
}

/** 'InsertQuiz' return type */
export interface IInsertQuizResult {
  ok: number;
}

/** 'InsertQuiz' query type */
export interface IInsertQuizQuery {
  params: IInsertQuizParams;
  result: IInsertQuizResult;
}

const insertQuizIR: any = {"name":"insertQuiz","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":247,"b":251,"line":5,"col":60}]}}],"usedParamSet":{"name":true},"statement":{"body":"INSERT INTO quizzes (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":187,"b":308,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO quizzes (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertQuiz = new PreparedQuery<IInsertQuizParams,IInsertQuizResult>(insertQuizIR);


/** 'InsertCertificationGrant' parameters type */
export interface IInsertCertificationGrantParams {
  certificationId: number;
  quizId: number;
}

/** 'InsertCertificationGrant' return type */
export interface IInsertCertificationGrantResult {
  ok: number;
}

/** 'InsertCertificationGrant' query type */
export interface IInsertCertificationGrantQuery {
  params: IInsertCertificationGrantParams;
  result: IInsertCertificationGrantResult;
}

const insertCertificationGrantIR: any = {"name":"insertCertificationGrant","params":[{"name":"quizId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":448,"b":454,"line":8,"col":99}]}},{"name":"certificationId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":458,"b":473,"line":8,"col":109}]}}],"usedParamSet":{"quizId":true,"certificationId":true},"statement":{"body":"INSERT INTO quiz_certification_grants (quiz_id, certification_id, created_at, updated_at) VALUES (:quizId!, :certificationId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING quiz_id AS ok","loc":{"a":349,"b":535,"line":8,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO quiz_certification_grants (quiz_id, certification_id, created_at, updated_at) VALUES (:quizId!, :certificationId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING quiz_id AS ok
 * ```
 */
export const insertCertificationGrant = new PreparedQuery<IInsertCertificationGrantParams,IInsertCertificationGrantResult>(insertCertificationGrantIR);


/** 'InsertQuizSubcategory' parameters type */
export interface IInsertQuizSubcategoryParams {
  name: string;
  quizId: number;
}

/** 'InsertQuizSubcategory' return type */
export interface IInsertQuizSubcategoryResult {
  ok: string;
}

/** 'InsertQuizSubcategory' query type */
export interface IInsertQuizSubcategoryQuery {
  params: IInsertQuizSubcategoryParams;
  result: IInsertQuizSubcategoryResult;
}

const insertQuizSubcategoryIR: any = {"name":"insertQuizSubcategory","params":[{"name":"quizId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":653,"b":659,"line":11,"col":80}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":663,"b":667,"line":11,"col":90}]}}],"usedParamSet":{"quizId":true,"name":true},"statement":{"body":"INSERT INTO quiz_subcategories (quiz_id, name, created_at, updated_at) VALUES (:quizId!, :name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING name AS ok","loc":{"a":573,"b":726,"line":11,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO quiz_subcategories (quiz_id, name, created_at, updated_at) VALUES (:quizId!, :name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING name AS ok
 * ```
 */
export const insertQuizSubcategory = new PreparedQuery<IInsertQuizSubcategoryParams,IInsertQuizSubcategoryResult>(insertQuizSubcategoryIR);


/** 'InsertSubject' parameters type */
export interface IInsertSubjectParams {
  displayName: string;
  displayOrder: number;
  name: string;
  toolTypeId: number;
  topicId: number;
}

/** 'InsertSubject' return type */
export interface IInsertSubjectResult {
  ok: number;
}

/** 'InsertSubject' query type */
export interface IInsertSubjectQuery {
  params: IInsertSubjectParams;
  result: IInsertSubjectResult;
}

const insertSubjectIR: any = {"name":"insertSubject","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":870,"b":874,"line":14,"col":114}]}},{"name":"displayName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":878,"b":889,"line":14,"col":122}]}},{"name":"displayOrder","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":893,"b":905,"line":14,"col":137}]}},{"name":"toolTypeId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":909,"b":919,"line":14,"col":153}]}},{"name":"topicId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":923,"b":930,"line":14,"col":167}]}}],"usedParamSet":{"name":true,"displayName":true,"displayOrder":true,"toolTypeId":true,"topicId":true},"statement":{"body":"INSERT INTO subjects (name, display_name, display_order, tool_type_id, topic_id, created_at, updated_at) VALUES (:name!, :displayName!, :displayOrder!, :toolTypeId!, :topicId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":756,"b":987,"line":14,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO subjects (name, display_name, display_order, tool_type_id, topic_id, created_at, updated_at) VALUES (:name!, :displayName!, :displayOrder!, :toolTypeId!, :topicId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertSubject = new PreparedQuery<IInsertSubjectParams,IInsertSubjectResult>(insertSubjectIR);


/** 'InsertCertificationSubjectUnlocks' parameters type */
export interface IInsertCertificationSubjectUnlocksParams {
  certificationId: number;
  subjectId: number;
}

/** 'InsertCertificationSubjectUnlocks' return type */
export interface IInsertCertificationSubjectUnlocksResult {
  ok: number;
}

/** 'InsertCertificationSubjectUnlocks' query type */
export interface IInsertCertificationSubjectUnlocksQuery {
  params: IInsertCertificationSubjectUnlocksParams;
  result: IInsertCertificationSubjectUnlocksResult;
}

const insertCertificationSubjectUnlocksIR: any = {"name":"insertCertificationSubjectUnlocks","params":[{"name":"certificationId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1143,"b":1158,"line":17,"col":106}]}},{"name":"subjectId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1162,"b":1171,"line":17,"col":125}]}}],"usedParamSet":{"certificationId":true,"subjectId":true},"statement":{"body":"INSERT INTO certification_subject_unlocks (certification_id, subject_id, created_at, updated_at) VALUES (:certificationId!, :subjectId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING subject_id AS ok","loc":{"a":1037,"b":1236,"line":17,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO certification_subject_unlocks (certification_id, subject_id, created_at, updated_at) VALUES (:certificationId!, :subjectId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING subject_id AS ok
 * ```
 */
export const insertCertificationSubjectUnlocks = new PreparedQuery<IInsertCertificationSubjectUnlocksParams,IInsertCertificationSubjectUnlocksResult>(insertCertificationSubjectUnlocksIR);


/** 'InsertToolType' parameters type */
export interface IInsertToolTypeParams {
  name: string;
}

/** 'InsertToolType' return type */
export interface IInsertToolTypeResult {
  ok: number;
}

/** 'InsertToolType' query type */
export interface IInsertToolTypeQuery {
  params: IInsertToolTypeParams;
  result: IInsertToolTypeResult;
}

const insertToolTypeIR: any = {"name":"insertToolType","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1330,"b":1334,"line":20,"col":63}]}}],"usedParamSet":{"name":true},"statement":{"body":"INSERT INTO tool_types (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":1267,"b":1391,"line":20,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO tool_types (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertToolType = new PreparedQuery<IInsertToolTypeParams,IInsertToolTypeResult>(insertToolTypeIR);


/** 'InsertTopic' parameters type */
export interface IInsertTopicParams {
  dashboardOrder: number;
  displayName: string;
  name: string;
}

/** 'InsertTopic' return type */
export interface IInsertTopicResult {
  ok: number;
}

/** 'InsertTopic' query type */
export interface IInsertTopicQuery {
  params: IInsertTopicParams;
  result: IInsertTopicResult;
}

const insertTopicIR: any = {"name":"insertTopic","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1509,"b":1513,"line":23,"col":90}]}},{"name":"displayName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1517,"b":1528,"line":23,"col":98}]}},{"name":"dashboardOrder","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1532,"b":1546,"line":23,"col":113}]}}],"usedParamSet":{"name":true,"displayName":true,"dashboardOrder":true},"statement":{"body":"INSERT INTO topics (name, display_name, dashboard_order, created_at, updated_at) VALUES (:name!, :displayName!, :dashboardOrder!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":1419,"b":1603,"line":23,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO topics (name, display_name, dashboard_order, created_at, updated_at) VALUES (:name!, :displayName!, :dashboardOrder!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertTopic = new PreparedQuery<IInsertTopicParams,IInsertTopicResult>(insertTopicIR);


/** 'InsertTrainingCourse' parameters type */
export interface IInsertTrainingCourseParams {
  name: string;
}

/** 'InsertTrainingCourse' return type */
export interface IInsertTrainingCourseResult {
  ok: string;
}

/** 'InsertTrainingCourse' query type */
export interface IInsertTrainingCourseQuery {
  params: IInsertTrainingCourseParams;
  result: IInsertTrainingCourseResult;
}

const insertTrainingCourseIR: any = {"name":"insertTrainingCourse","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1709,"b":1713,"line":26,"col":69}]}}],"usedParamSet":{"name":true},"statement":{"body":"INSERT INTO training_courses (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING name AS ok","loc":{"a":1640,"b":1772,"line":26,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO training_courses (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING name AS ok
 * ```
 */
export const insertTrainingCourse = new PreparedQuery<IInsertTrainingCourseParams,IInsertTrainingCourseResult>(insertTrainingCourseIR);


/** 'GetCertifications' parameters type */
export type IGetCertificationsParams = void;

/** 'GetCertifications' return type */
export interface IGetCertificationsResult {
  id: number;
  name: string;
}

/** 'GetCertifications' query type */
export interface IGetCertificationsQuery {
  params: IGetCertificationsParams;
  result: IGetCertificationsResult;
}

const getCertificationsIR: any = {"name":"getCertifications","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    id,\n    name\nFROM\n    certifications","loc":{"a":1806,"b":1852,"line":29,"col":0}}};

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
export const getCertifications = new PreparedQuery<IGetCertificationsParams,IGetCertificationsResult>(getCertificationsIR);


/** 'GetQuizzes' parameters type */
export type IGetQuizzesParams = void;

/** 'GetQuizzes' return type */
export interface IGetQuizzesResult {
  id: number;
  name: string;
}

/** 'GetQuizzes' query type */
export interface IGetQuizzesQuery {
  params: IGetQuizzesParams;
  result: IGetQuizzesResult;
}

const getQuizzesIR: any = {"name":"getQuizzes","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    id,\n    name\nFROM\n    quizzes","loc":{"a":1879,"b":1918,"line":36,"col":0}}};

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
export const getQuizzes = new PreparedQuery<IGetQuizzesParams,IGetQuizzesResult>(getQuizzesIR);


