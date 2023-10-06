/** Types generated for queries found in "server/models/Subjects/subjects.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetSubjectAndTopic' parameters type */
export interface IGetSubjectAndTopicParams {
  subject: string;
  topic: string;
}

/** 'GetSubjectAndTopic' return type */
export interface IGetSubjectAndTopicResult {
  subjectDisplayName: string;
  subjectName: string;
  topicDisplayName: string;
  topicName: string;
}

/** 'GetSubjectAndTopic' query type */
export interface IGetSubjectAndTopicQuery {
  params: IGetSubjectAndTopicParams;
  result: IGetSubjectAndTopicResult;
}

const getSubjectAndTopicIR: any = {"name":"getSubjectAndTopic","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":295,"b":302,"line":11,"col":21}]}},{"name":"topic","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":327,"b":332,"line":12,"col":23}]}}],"usedParamSet":{"subject":true,"topic":true},"statement":{"body":"SELECT\n    subjects.name AS subject_name,\n    subjects.display_name AS subject_display_name,\n    topics.name AS topic_name,\n    topics.display_name AS topic_display_name\nFROM\n    subjects\n    JOIN topics ON subjects.topic_id = topics.id\nWHERE\n    subjects.name = :subject!\n    AND topics.name = :topic!","loc":{"a":31,"b":332,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     subjects.name AS subject_name,
 *     subjects.display_name AS subject_display_name,
 *     topics.name AS topic_name,
 *     topics.display_name AS topic_display_name
 * FROM
 *     subjects
 *     JOIN topics ON subjects.topic_id = topics.id
 * WHERE
 *     subjects.name = :subject!
 *     AND topics.name = :topic!
 * ```
 */
export const getSubjectAndTopic = new PreparedQuery<IGetSubjectAndTopicParams,IGetSubjectAndTopicResult>(getSubjectAndTopicIR);


/** 'GetSubjects' parameters type */
export type IGetSubjectsParams = void;

/** 'GetSubjects' return type */
export interface IGetSubjectsResult {
  active: boolean;
  displayName: string;
  displayOrder: number;
  id: number;
  name: string;
  topicColor: string | null;
  topicDashboardOrder: number;
  topicDisplayName: string;
  topicIconLink: string | null;
  topicId: number;
  topicName: string;
  topicTrainingOrder: number;
}

/** 'GetSubjects' query type */
export interface IGetSubjectsQuery {
  params: IGetSubjectsParams;
  result: IGetSubjectsResult;
}

const getSubjectsIR: any = {"name":"getSubjects","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    subjects.id AS id,\n    subjects.name AS name,\n    subjects.display_name AS display_name,\n    subjects.display_order AS display_order,\n    subjects.active AS active,\n    topics.name AS topic_name,\n    topics.display_name AS topic_display_name,\n    topics.dashboard_order AS topic_dashboard_order,\n    topics.training_order AS topic_training_order,\n    topics.id AS topic_id,\n    topics.icon_link AS topic_icon_link,\n    topics.color AS topic_color\nFROM\n    subjects\n    JOIN topics ON subjects.topic_id = topics.id","loc":{"a":361,"b":884,"line":16,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     subjects.id AS id,
 *     subjects.name AS name,
 *     subjects.display_name AS display_name,
 *     subjects.display_order AS display_order,
 *     subjects.active AS active,
 *     topics.name AS topic_name,
 *     topics.display_name AS topic_display_name,
 *     topics.dashboard_order AS topic_dashboard_order,
 *     topics.training_order AS topic_training_order,
 *     topics.id AS topic_id,
 *     topics.icon_link AS topic_icon_link,
 *     topics.color AS topic_color
 * FROM
 *     subjects
 *     JOIN topics ON subjects.topic_id = topics.id
 * ```
 */
export const getSubjects = new PreparedQuery<IGetSubjectsParams,IGetSubjectsResult>(getSubjectsIR);


/** 'GetTopics' parameters type */
export type IGetTopicsParams = void;

/** 'GetTopics' return type */
export interface IGetTopicsResult {
  dashboardOrder: number;
  displayName: string;
  iconLink: string | null;
  id: number;
  name: string;
  trainingOrder: number;
}

/** 'GetTopics' query type */
export interface IGetTopicsQuery {
  params: IGetTopicsParams;
  result: IGetTopicsResult;
}

const getTopicsIR: any = {"name":"getTopics","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    id,\n    name,\n    display_name,\n    icon_link,\n    dashboard_order,\n    training_order\nFROM\n    topics","loc":{"a":911,"b":1023,"line":35,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     name,
 *     display_name,
 *     icon_link,
 *     dashboard_order,
 *     training_order
 * FROM
 *     topics
 * ```
 */
export const getTopics = new PreparedQuery<IGetTopicsParams,IGetTopicsResult>(getTopicsIR);


/** 'GetTrainingCourses' parameters type */
export type IGetTrainingCoursesParams = void;

/** 'GetTrainingCourses' return type */
export interface IGetTrainingCoursesResult {
  displayName: string | null;
  id: number;
  name: string;
}

/** 'GetTrainingCourses' query type */
export interface IGetTrainingCoursesQuery {
  params: IGetTrainingCoursesParams;
  result: IGetTrainingCoursesResult;
}

const getTrainingCoursesIR: any = {"name":"getTrainingCourses","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    id,\n    name,\n    display_name\nFROM\n    training_courses","loc":{"a":1059,"b":1125,"line":47,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     name,
 *     display_name
 * FROM
 *     training_courses
 * ```
 */
export const getTrainingCourses = new PreparedQuery<IGetTrainingCoursesParams,IGetTrainingCoursesResult>(getTrainingCoursesIR);


/** 'GetQuizCertUnlocks' parameters type */
export type IGetQuizCertUnlocksParams = void;

/** 'GetQuizCertUnlocks' return type */
export interface IGetQuizCertUnlocksResult {
  quizDisplayName: string;
  quizDisplayOrder: number;
  quizIsActive: boolean;
  quizName: string;
  topicDashboardOrder: number;
  topicDisplayName: string;
  topicName: string;
  topicTrainingOrder: number;
  unlockedCertDisplayName: string;
  unlockedCertDisplayOrder: number;
  unlockedCertName: string;
}

/** 'GetQuizCertUnlocks' query type */
export interface IGetQuizCertUnlocksQuery {
  params: IGetQuizCertUnlocksParams;
  result: IGetQuizCertUnlocksResult;
}

const getQuizCertUnlocksIR: any = {"name":"getQuizCertUnlocks","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    quizzes.name AS quiz_name,\n    quiz_info.display_name AS quiz_display_name,\n    quiz_info.display_order AS quiz_display_order,\n    certs.name AS unlocked_cert_name,\n    cert_info.display_name AS unlocked_cert_display_name,\n    cert_info.display_order AS unlocked_cert_display_order,\n    topics.name AS topic_name,\n    topics.display_name AS topic_display_name,\n    topics.dashboard_order AS topic_dashboard_order,\n    topics.training_order AS topic_training_order,\n    quizzes.active AS quiz_is_active\nFROM\n    quiz_certification_grants qcg\n    JOIN quizzes ON quizzes.id = qcg.quiz_id\n    JOIN subjects AS quiz_info ON quiz_info.name = quizzes.name\n    JOIN certifications certs ON certs.id = qcg.certification_id\n    JOIN subjects AS cert_info ON cert_info.name = certs.name\n    JOIN topics ON topics.id = cert_info.topic_id","loc":{"a":1161,"b":1997,"line":56,"col":0}}};

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
 *     topics.training_order AS topic_training_order,
 *     quizzes.active AS quiz_is_active
 * FROM
 *     quiz_certification_grants qcg
 *     JOIN quizzes ON quizzes.id = qcg.quiz_id
 *     JOIN subjects AS quiz_info ON quiz_info.name = quizzes.name
 *     JOIN certifications certs ON certs.id = qcg.certification_id
 *     JOIN subjects AS cert_info ON cert_info.name = certs.name
 *     JOIN topics ON topics.id = cert_info.topic_id
 * ```
 */
export const getQuizCertUnlocks = new PreparedQuery<IGetQuizCertUnlocksParams,IGetQuizCertUnlocksResult>(getQuizCertUnlocksIR);


/** 'GetCertSubjectUnlocks' parameters type */
export type IGetCertSubjectUnlocksParams = void;

/** 'GetCertSubjectUnlocks' return type */
export interface IGetCertSubjectUnlocksResult {
  certDisplayName: string;
  certDisplayOrder: number;
  certName: string;
  topicName: string;
  unlockedSubjectDisplayName: string;
  unlockedSubjectDisplayOrder: number;
  unlockedSubjectName: string;
}

/** 'GetCertSubjectUnlocks' query type */
export interface IGetCertSubjectUnlocksQuery {
  params: IGetCertSubjectUnlocksParams;
  result: IGetCertSubjectUnlocksResult;
}

const getCertSubjectUnlocksIR: any = {"name":"getCertSubjectUnlocks","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    unlocked_subject.name AS unlocked_subject_name,\n    unlocked_subject.display_name AS unlocked_subject_display_name,\n    unlocked_subject.display_order AS unlocked_subject_display_order,\n    certifications.name AS cert_name,\n    cert_info.display_name AS cert_display_name,\n    cert_info.display_order AS cert_display_order,\n    topics.name AS topic_name\nFROM\n    certification_subject_unlocks csu\n    JOIN subjects AS unlocked_subject ON unlocked_subject.id = csu.subject_id\n    JOIN certifications ON certifications.id = csu.certification_id\n    JOIN topics ON topics.id = unlocked_subject.topic_id\n    JOIN subjects AS cert_info ON cert_info.name = certifications.name","loc":{"a":2036,"b":2716,"line":78,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     unlocked_subject.name AS unlocked_subject_name,
 *     unlocked_subject.display_name AS unlocked_subject_display_name,
 *     unlocked_subject.display_order AS unlocked_subject_display_order,
 *     certifications.name AS cert_name,
 *     cert_info.display_name AS cert_display_name,
 *     cert_info.display_order AS cert_display_order,
 *     topics.name AS topic_name
 * FROM
 *     certification_subject_unlocks csu
 *     JOIN subjects AS unlocked_subject ON unlocked_subject.id = csu.subject_id
 *     JOIN certifications ON certifications.id = csu.certification_id
 *     JOIN topics ON topics.id = unlocked_subject.topic_id
 *     JOIN subjects AS cert_info ON cert_info.name = certifications.name
 * ```
 */
export const getCertSubjectUnlocks = new PreparedQuery<IGetCertSubjectUnlocksParams,IGetCertSubjectUnlocksResult>(getCertSubjectUnlocksIR);


/** 'GetComputedSubjectUnlocks' parameters type */
export type IGetComputedSubjectUnlocksParams = void;

/** 'GetComputedSubjectUnlocks' return type */
export interface IGetComputedSubjectUnlocksResult {
  certDisplayName: string;
  certDisplayOrder: number;
  certName: string;
  topicName: string;
  unlockedSubjectDisplayName: string;
  unlockedSubjectDisplayOrder: number;
  unlockedSubjectName: string;
}

/** 'GetComputedSubjectUnlocks' query type */
export interface IGetComputedSubjectUnlocksQuery {
  params: IGetComputedSubjectUnlocksParams;
  result: IGetComputedSubjectUnlocksResult;
}

const getComputedSubjectUnlocksIR: any = {"name":"getComputedSubjectUnlocks","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    unlocked_subject.name AS unlocked_subject_name,\n    unlocked_subject.display_name AS unlocked_subject_display_name,\n    unlocked_subject.display_order AS unlocked_subject_display_order,\n    certifications.name AS cert_name,\n    cert_info.display_name AS cert_display_name,\n    cert_info.display_order AS cert_display_order,\n    topics.name AS topic_name\nFROM\n    computed_subject_unlocks csu\n    JOIN subjects AS unlocked_subject ON unlocked_subject.id = csu.subject_id\n    JOIN certifications ON certifications.id = csu.certification_id\n    JOIN topics ON topics.id = unlocked_subject.topic_id\n    JOIN subjects AS cert_info ON cert_info.name = certifications.name","loc":{"a":2759,"b":3434,"line":95,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     unlocked_subject.name AS unlocked_subject_name,
 *     unlocked_subject.display_name AS unlocked_subject_display_name,
 *     unlocked_subject.display_order AS unlocked_subject_display_order,
 *     certifications.name AS cert_name,
 *     cert_info.display_name AS cert_display_name,
 *     cert_info.display_order AS cert_display_order,
 *     topics.name AS topic_name
 * FROM
 *     computed_subject_unlocks csu
 *     JOIN subjects AS unlocked_subject ON unlocked_subject.id = csu.subject_id
 *     JOIN certifications ON certifications.id = csu.certification_id
 *     JOIN topics ON topics.id = unlocked_subject.topic_id
 *     JOIN subjects AS cert_info ON cert_info.name = certifications.name
 * ```
 */
export const getComputedSubjectUnlocks = new PreparedQuery<IGetComputedSubjectUnlocksParams,IGetComputedSubjectUnlocksResult>(getComputedSubjectUnlocksIR);


/** 'GetSubjectType' parameters type */
export interface IGetSubjectTypeParams {
  subject: string;
}

/** 'GetSubjectType' return type */
export interface IGetSubjectTypeResult {
  subjectType: string | null;
}

/** 'GetSubjectType' query type */
export interface IGetSubjectTypeQuery {
  params: IGetSubjectTypeParams;
  result: IGetSubjectTypeResult;
}

const getSubjectTypeIR: any = {"name":"getSubjectType","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3845,"b":3852,"line":126,"col":20}]}}],"usedParamSet":{"subject":true},"statement":{"body":"SELECT\n    CASE WHEN topics.name IS NOT NULL THEN\n        topics.name\n    WHEN tc.name IS NOT NULL THEN\n        'training'\n    ELSE\n        ''\n    END AS subject_type\nFROM\n    quizzes\n    LEFT JOIN subjects ON subjects.name = quizzes.name\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN training_courses tc ON tc.name = quizzes.name\nWHERE\n    quizzes.name = :subject!","loc":{"a":3466,"b":3852,"line":112,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     CASE WHEN topics.name IS NOT NULL THEN
 *         topics.name
 *     WHEN tc.name IS NOT NULL THEN
 *         'training'
 *     ELSE
 *         ''
 *     END AS subject_type
 * FROM
 *     quizzes
 *     LEFT JOIN subjects ON subjects.name = quizzes.name
 *     LEFT JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN training_courses tc ON tc.name = quizzes.name
 * WHERE
 *     quizzes.name = :subject!
 * ```
 */
export const getSubjectType = new PreparedQuery<IGetSubjectTypeParams,IGetSubjectTypeResult>(getSubjectTypeIR);


/** 'GetSubjectNameIdMapping' parameters type */
export type IGetSubjectNameIdMappingParams = void;

/** 'GetSubjectNameIdMapping' return type */
export interface IGetSubjectNameIdMappingResult {
  id: number;
  name: string;
}

/** 'GetSubjectNameIdMapping' query type */
export interface IGetSubjectNameIdMappingQuery {
  params: IGetSubjectNameIdMappingParams;
  result: IGetSubjectNameIdMappingResult;
}

const getSubjectNameIdMappingIR: any = {"name":"getSubjectNameIdMapping","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    subjects.name,\n    subjects.id\nFROM\n    upchieve.subjects","loc":{"a":3893,"b":3960,"line":130,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     subjects.name,
 *     subjects.id
 * FROM
 *     upchieve.subjects
 * ```
 */
export const getSubjectNameIdMapping = new PreparedQuery<IGetSubjectNameIdMappingParams,IGetSubjectNameIdMappingResult>(getSubjectNameIdMappingIR);


