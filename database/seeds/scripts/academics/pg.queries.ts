/** Types generated for queries found in "database/seeds/scripts/academics/academics.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'InsertCertification' parameters type */
export interface IInsertCertificationParams {
  name: string;
}

/** 'InsertCertification' return type */
export interface IInsertCertificationResult {
  ok: number | null;
}

/** 'InsertCertification' query type */
export interface IInsertCertificationQuery {
  params: IInsertCertificationParams;
  result: IInsertCertificationResult;
}

const insertCertificationIR: any = {"name":"insertCertification","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":124,"b":128,"line":4,"col":17},{"a":289,"b":293,"line":12,"col":52}]}}],"usedParamSet":{"name":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO certifications (name, created_at, updated_at)\n        VALUES (:name!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM certifications WHERE name=:name!","loc":{"a":32,"b":293,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO certifications (name, created_at, updated_at)
 *         VALUES (:name!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM certifications WHERE name=:name!
 * ```
 */
export const insertCertification = new PreparedQuery<IInsertCertificationParams,IInsertCertificationResult>(insertCertificationIR);


/** 'InsertQuiz' parameters type */
export interface IInsertQuizParams {
  name: string;
}

/** 'InsertQuiz' return type */
export interface IInsertQuizResult {
  ok: number | null;
}

/** 'InsertQuiz' query type */
export interface IInsertQuizQuery {
  params: IInsertQuizParams;
  result: IInsertQuizResult;
}

const insertQuizIR: any = {"name":"insertQuiz","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":406,"b":410,"line":18,"col":17},{"a":564,"b":568,"line":26,"col":45}]}}],"usedParamSet":{"name":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO quizzes (name, created_at, updated_at)\n        VALUES (:name!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM quizzes WHERE name=:name!","loc":{"a":321,"b":568,"line":16,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO quizzes (name, created_at, updated_at)
 *         VALUES (:name!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM quizzes WHERE name=:name!
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
  ok: number | null;
}

/** 'InsertCertificationGrant' query type */
export interface IInsertCertificationGrantQuery {
  params: IInsertCertificationGrantParams;
  result: IInsertCertificationGrantResult;
}

const insertCertificationGrantIR: any = {"name":"insertCertificationGrant","params":[{"name":"quizId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":734,"b":740,"line":32,"col":17},{"a":944,"b":950,"line":40,"col":71}]}},{"name":"certificationId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":744,"b":759,"line":32,"col":27},{"a":974,"b":989,"line":40,"col":101}]}}],"usedParamSet":{"quizId":true,"certificationId":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO quiz_certification_grants (quiz_id, certification_id, created_at, updated_at)\n        VALUES (:quizId!, :certificationId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        quiz_id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT quiz_id AS ok FROM quiz_certification_grants WHERE quiz_id=:quizId! AND certification_id=:certificationId!","loc":{"a":610,"b":989,"line":30,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO quiz_certification_grants (quiz_id, certification_id, created_at, updated_at)
 *         VALUES (:quizId!, :certificationId!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         quiz_id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT quiz_id AS ok FROM quiz_certification_grants WHERE quiz_id=:quizId! AND certification_id=:certificationId!
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
  ok: string | null;
}

/** 'InsertQuizSubcategory' query type */
export interface IInsertQuizSubcategoryQuery {
  params: IInsertQuizSubcategoryParams;
  result: IInsertQuizSubcategoryResult;
}

const insertQuizSubcategoryIR: any = {"name":"insertQuizSubcategory","params":[{"name":"quizId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1133,"b":1139,"line":46,"col":17},{"a":1319,"b":1325,"line":54,"col":61}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1143,"b":1147,"line":46,"col":27},{"a":1337,"b":1341,"line":54,"col":79}]}}],"usedParamSet":{"quizId":true,"name":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO quiz_subcategories (quiz_id, name, created_at, updated_at)\n        VALUES (:quizId!, :name!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        name AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT name AS ok FROM quiz_subcategories WHERE quiz_id=:quizId! AND name=:name!","loc":{"a":1028,"b":1341,"line":44,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO quiz_subcategories (quiz_id, name, created_at, updated_at)
 *         VALUES (:quizId!, :name!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         name AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT name AS ok FROM quiz_subcategories WHERE quiz_id=:quizId! AND name=:name!
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
  ok: number | null;
}

/** 'InsertSubject' query type */
export interface IInsertSubjectQuery {
  params: IInsertSubjectParams;
  result: IInsertSubjectResult;
}

const insertSubjectIR: any = {"name":"insertSubject","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1511,"b":1515,"line":60,"col":17},{"a":1726,"b":1730,"line":68,"col":46}]}},{"name":"displayName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1519,"b":1530,"line":60,"col":25}]}},{"name":"displayOrder","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1534,"b":1546,"line":60,"col":40}]}},{"name":"toolTypeId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1550,"b":1560,"line":60,"col":56}]}},{"name":"topicId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1564,"b":1571,"line":60,"col":70}]}}],"usedParamSet":{"name":true,"displayName":true,"displayOrder":true,"toolTypeId":true,"topicId":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO subjects (name, display_name, display_order, tool_type_id, topic_id, created_at, updated_at)\n        VALUES (:name!, :displayName!, :displayOrder!, :toolTypeId!, :topicId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM subjects WHERE name=:name!","loc":{"a":1372,"b":1730,"line":58,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO subjects (name, display_name, display_order, tool_type_id, topic_id, created_at, updated_at)
 *         VALUES (:name!, :displayName!, :displayOrder!, :toolTypeId!, :topicId!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM subjects WHERE name=:name!
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
  ok: number | null;
}

/** 'InsertCertificationSubjectUnlocks' query type */
export interface IInsertCertificationSubjectUnlocksQuery {
  params: IInsertCertificationSubjectUnlocksParams;
  result: IInsertCertificationSubjectUnlocksResult;
}

const insertCertificationSubjectUnlocksIR: any = {"name":"insertCertificationSubjectUnlocks","params":[{"name":"certificationId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1912,"b":1927,"line":74,"col":17},{"a":2144,"b":2159,"line":82,"col":87}]}},{"name":"subjectId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1931,"b":1940,"line":74,"col":36},{"a":2177,"b":2186,"line":82,"col":120}]}}],"usedParamSet":{"certificationId":true,"subjectId":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO certification_subject_unlocks (certification_id, subject_id, created_at, updated_at)\n        VALUES (:certificationId!, :subjectId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        subject_id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT subject_id AS ok FROM certification_subject_unlocks WHERE certification_id=:certificationId! AND subject_id=:subjectId!","loc":{"a":1781,"b":2186,"line":72,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO certification_subject_unlocks (certification_id, subject_id, created_at, updated_at)
 *         VALUES (:certificationId!, :subjectId!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         subject_id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT subject_id AS ok FROM certification_subject_unlocks WHERE certification_id=:certificationId! AND subject_id=:subjectId!
 * ```
 */
export const insertCertificationSubjectUnlocks = new PreparedQuery<IInsertCertificationSubjectUnlocksParams,IInsertCertificationSubjectUnlocksResult>(insertCertificationSubjectUnlocksIR);


/** 'InsertToolType' parameters type */
export interface IInsertToolTypeParams {
  name: string;
}

/** 'InsertToolType' return type */
export interface IInsertToolTypeResult {
  ok: number | null;
}

/** 'InsertToolType' query type */
export interface IInsertToolTypeQuery {
  params: IInsertToolTypeParams;
  result: IInsertToolTypeResult;
}

const insertToolTypeIR: any = {"name":"insertToolType","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2306,"b":2310,"line":88,"col":17},{"a":2467,"b":2471,"line":96,"col":48}]}}],"usedParamSet":{"name":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO tool_types (name, created_at, updated_at)\n        VALUES (:name!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM tool_types WHERE name=:name!","loc":{"a":2218,"b":2471,"line":86,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO tool_types (name, created_at, updated_at)
 *         VALUES (:name!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM tool_types WHERE name=:name!
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
  ok: number | null;
}

/** 'InsertTopic' query type */
export interface IInsertTopicQuery {
  params: IInsertTopicParams;
  result: IInsertTopicResult;
}

const insertTopicIR: any = {"name":"insertTopic","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2615,"b":2619,"line":102,"col":17},{"a":2805,"b":2809,"line":110,"col":44}]}},{"name":"displayName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2623,"b":2634,"line":102,"col":25}]}},{"name":"dashboardOrder","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2638,"b":2652,"line":102,"col":40}]}}],"usedParamSet":{"name":true,"displayName":true,"dashboardOrder":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO topics (name, display_name, dashboard_order, created_at, updated_at)\n        VALUES (:name!, :displayName!, :dashboardOrder!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM topics WHERE name=:name!","loc":{"a":2500,"b":2809,"line":100,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO topics (name, display_name, dashboard_order, created_at, updated_at)
 *         VALUES (:name!, :displayName!, :dashboardOrder!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM topics WHERE name=:name!
 * ```
 */
export const insertTopic = new PreparedQuery<IInsertTopicParams,IInsertTopicResult>(insertTopicIR);


/** 'InsertTrainingCourse' parameters type */
export interface IInsertTrainingCourseParams {
  name: string;
}

/** 'InsertTrainingCourse' return type */
export interface IInsertTrainingCourseResult {
  ok: string | null;
}

/** 'InsertTrainingCourse' query type */
export interface IInsertTrainingCourseQuery {
  params: IInsertTrainingCourseParams;
  result: IInsertTrainingCourseResult;
}

const insertTrainingCourseIR: any = {"name":"insertTrainingCourse","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2941,"b":2945,"line":116,"col":17},{"a":3112,"b":3116,"line":124,"col":56}]}}],"usedParamSet":{"name":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO training_courses (name, created_at, updated_at)\n        VALUES (:name!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        name AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT name AS ok FROM training_courses WHERE name=:name!","loc":{"a":2847,"b":3116,"line":114,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO training_courses (name, created_at, updated_at)
 *         VALUES (:name!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         name AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT name AS ok FROM training_courses WHERE name=:name!
 * ```
 */
export const insertTrainingCourse = new PreparedQuery<IInsertTrainingCourseParams,IInsertTrainingCourseResult>(insertTrainingCourseIR);


