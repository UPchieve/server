/** Types generated for queries found in "server/models/Subjects/subjects.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetSubjectAndTopic' parameters type */
export interface IGetSubjectAndTopicParams {
  subject: string;
  topic?: string | null | void;
}

/** 'GetSubjectAndTopic' return type */
export interface IGetSubjectAndTopicResult {
  subjectDisplayName: string;
  subjectName: string;
  toolType: string;
  topicDisplayName: string;
  topicName: string;
}

/** 'GetSubjectAndTopic' query type */
export interface IGetSubjectAndTopicQuery {
  params: IGetSubjectAndTopicParams;
  result: IGetSubjectAndTopicResult;
}

const getSubjectAndTopicIR: any = {"usedParamSet":{"subject":true,"topic":true},"params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"locs":[{"a":358,"b":366}]},{"name":"topic","required":false,"transform":{"type":"scalar"},"locs":[{"a":378,"b":383},{"a":426,"b":431}]}],"statement":"SELECT\n    subjects.name AS subject_name,\n    subjects.display_name AS subject_display_name,\n    topics.name AS topic_name,\n    topics.display_name AS topic_display_name,\n    tool_types.name AS tool_type\nFROM\n    subjects\n    JOIN topics ON subjects.topic_id = topics.id\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\nWHERE\n    subjects.name = :subject!\n    AND ((:topic)::text IS NULL\n        OR topics.name = (:topic)::text)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     subjects.name AS subject_name,
 *     subjects.display_name AS subject_display_name,
 *     topics.name AS topic_name,
 *     topics.display_name AS topic_display_name,
 *     tool_types.name AS tool_type
 * FROM
 *     subjects
 *     JOIN topics ON subjects.topic_id = topics.id
 *     JOIN tool_types ON subjects.tool_type_id = tool_types.id
 * WHERE
 *     subjects.name = :subject!
 *     AND ((:topic)::text IS NULL
 *         OR topics.name = (:topic)::text)
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
  isComputedUnlock: boolean | null;
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

const getSubjectsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    subjects.id AS id,\n    subjects.name AS name,\n    subjects.display_name AS display_name,\n    subjects.display_order AS display_order,\n    subjects.active AS active,\n    topics.name AS topic_name,\n    topics.display_name AS topic_display_name,\n    topics.dashboard_order AS topic_dashboard_order,\n    topics.training_order AS topic_training_order,\n    topics.id AS topic_id,\n    topics.icon_link AS topic_icon_link,\n    topics.color AS topic_color,\n    CASE WHEN EXISTS (\n        SELECT\n            1\n        FROM\n            computed_subject_unlocks\n        WHERE\n            subject_id = subjects.id) THEN\n        TRUE\n    ELSE\n        FALSE\n    END AS is_computed_unlock\nFROM\n    subjects\n    JOIN topics ON subjects.topic_id = topics.id"};

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
 *     topics.color AS topic_color,
 *     CASE WHEN EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             computed_subject_unlocks
 *         WHERE
 *             subject_id = subjects.id) THEN
 *         TRUE
 *     ELSE
 *         FALSE
 *     END AS is_computed_unlock
 * FROM
 *     subjects
 *     JOIN topics ON subjects.topic_id = topics.id
 * ```
 */
export const getSubjects = new PreparedQuery<IGetSubjectsParams,IGetSubjectsResult>(getSubjectsIR);


/** 'GetTopics' parameters type */
export interface IGetTopicsParams {
  topicId?: number | null | void;
}

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

const getTopicsIR: any = {"usedParamSet":{"topicId":true},"params":[{"name":"topicId","required":false,"transform":{"type":"scalar"},"locs":[{"a":121,"b":128},{"a":159,"b":166}]}],"statement":"SELECT\n    id,\n    name,\n    display_name,\n    icon_link,\n    dashboard_order,\n    training_order\nFROM\n    topics\nWHERE (:topicId::integer IS NULL\n    OR id = :topicId)"};

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
 * WHERE (:topicId::integer IS NULL
 *     OR id = :topicId)
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

const getTrainingCoursesIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    id,\n    name,\n    display_name\nFROM\n    training_courses"};

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

const getQuizCertUnlocksIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    quizzes.name AS quiz_name,\n    quiz_info.display_name AS quiz_display_name,\n    quiz_info.display_order AS quiz_display_order,\n    certs.name AS unlocked_cert_name,\n    cert_info.display_name AS unlocked_cert_display_name,\n    cert_info.display_order AS unlocked_cert_display_order,\n    topics.name AS topic_name,\n    topics.display_name AS topic_display_name,\n    topics.dashboard_order AS topic_dashboard_order,\n    topics.training_order AS topic_training_order,\n    quizzes.active AS quiz_is_active\nFROM\n    quiz_certification_grants qcg\n    JOIN quizzes ON quizzes.id = qcg.quiz_id\n    JOIN subjects AS quiz_info ON quiz_info.name = quizzes.name\n    JOIN certifications certs ON certs.id = qcg.certification_id\n    JOIN subjects AS cert_info ON cert_info.name = certs.name\n    JOIN topics ON topics.id = cert_info.topic_id"};

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

const getCertSubjectUnlocksIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    unlocked_subject.name AS unlocked_subject_name,\n    unlocked_subject.display_name AS unlocked_subject_display_name,\n    unlocked_subject.display_order AS unlocked_subject_display_order,\n    certifications.name AS cert_name,\n    cert_info.display_name AS cert_display_name,\n    cert_info.display_order AS cert_display_order,\n    topics.name AS topic_name\nFROM\n    certification_subject_unlocks csu\n    JOIN subjects AS unlocked_subject ON unlocked_subject.id = csu.subject_id\n    JOIN certifications ON certifications.id = csu.certification_id\n    JOIN topics ON topics.id = unlocked_subject.topic_id\n    JOIN subjects AS cert_info ON cert_info.name = certifications.name"};

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

const getComputedSubjectUnlocksIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    unlocked_subject.name AS unlocked_subject_name,\n    unlocked_subject.display_name AS unlocked_subject_display_name,\n    unlocked_subject.display_order AS unlocked_subject_display_order,\n    certifications.name AS cert_name,\n    cert_info.display_name AS cert_display_name,\n    cert_info.display_order AS cert_display_order,\n    topics.name AS topic_name\nFROM\n    computed_subject_unlocks csu\n    JOIN subjects AS unlocked_subject ON unlocked_subject.id = csu.subject_id\n    JOIN certifications ON certifications.id = csu.certification_id\n    JOIN topics ON topics.id = unlocked_subject.topic_id\n    JOIN subjects AS cert_info ON cert_info.name = certifications.name"};

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

const getSubjectTypeIR: any = {"usedParamSet":{"subject":true},"params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"locs":[{"a":378,"b":386}]}],"statement":"SELECT\n    CASE WHEN topics.name IS NOT NULL THEN\n        topics.name\n    WHEN tc.name IS NOT NULL THEN\n        'training'\n    ELSE\n        ''\n    END AS subject_type\nFROM\n    quizzes\n    LEFT JOIN subjects ON subjects.name = quizzes.name\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN training_courses tc ON tc.name = quizzes.name\nWHERE\n    quizzes.name = :subject!"};

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

const getSubjectNameIdMappingIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    subjects.name,\n    subjects.id\nFROM\n    upchieve.subjects"};

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


/** 'GetTopicIdFromName' parameters type */
export interface IGetTopicIdFromNameParams {
  topicName: string;
}

/** 'GetTopicIdFromName' return type */
export interface IGetTopicIdFromNameResult {
  id: number;
}

/** 'GetTopicIdFromName' query type */
export interface IGetTopicIdFromNameQuery {
  params: IGetTopicIdFromNameParams;
  result: IGetTopicIdFromNameResult;
}

const getTopicIdFromNameIR: any = {"usedParamSet":{"topicName":true},"params":[{"name":"topicName","required":true,"transform":{"type":"scalar"},"locs":[{"a":56,"b":66}]}],"statement":"SELECT\n    id\nFROM\n    upchieve.topics\nWHERE\n    name = :topicName!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id
 * FROM
 *     upchieve.topics
 * WHERE
 *     name = :topicName!
 * ```
 */
export const getTopicIdFromName = new PreparedQuery<IGetTopicIdFromNameParams,IGetTopicIdFromNameResult>(getTopicIdFromNameIR);


/** 'GetSubjectsForTopicByTopicId' parameters type */
export interface IGetSubjectsForTopicByTopicIdParams {
  topicId: number;
}

/** 'GetSubjectsForTopicByTopicId' return type */
export interface IGetSubjectsForTopicByTopicIdResult {
  active: boolean;
  displayName: string;
  displayOrder: number;
  id: number;
  isComputedUnlock: boolean | null;
  name: string;
  topicColor: string | null;
  topicDashboardOrder: number;
  topicDisplayName: string;
  topicIconLink: string | null;
  topicId: number;
  topicName: string;
  topicTrainingOrder: number;
}

/** 'GetSubjectsForTopicByTopicId' query type */
export interface IGetSubjectsForTopicByTopicIdQuery {
  params: IGetSubjectsForTopicByTopicIdParams;
  result: IGetSubjectsForTopicByTopicIdResult;
}

const getSubjectsForTopicByTopicIdIR: any = {"usedParamSet":{"topicId":true},"params":[{"name":"topicId","required":true,"transform":{"type":"scalar"},"locs":[{"a":773,"b":781}]}],"statement":"SELECT\n    subjects.id AS id,\n    subjects.name AS name,\n    subjects.display_name AS display_name,\n    subjects.display_order AS display_order,\n    subjects.active AS active,\n    topics.name AS topic_name,\n    topics.display_name AS topic_display_name,\n    topics.dashboard_order AS topic_dashboard_order,\n    topics.training_order AS topic_training_order,\n    topics.id AS topic_id,\n    topics.icon_link AS topic_icon_link,\n    topics.color AS topic_color,\n    CASE WHEN EXISTS (\n        SELECT\n            1\n        FROM\n            computed_subject_unlocks\n        WHERE\n            subject_id = subjects.id) THEN\n        TRUE\n    ELSE\n        FALSE\n    END AS is_computed_unlock\nFROM\n    topics\n    JOIN subjects ON subjects.topic_id = topics.id\nWHERE\n    topics.id = :topicId!\n    AND subjects.active IS TRUE"};

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
 *     topics.color AS topic_color,
 *     CASE WHEN EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             computed_subject_unlocks
 *         WHERE
 *             subject_id = subjects.id) THEN
 *         TRUE
 *     ELSE
 *         FALSE
 *     END AS is_computed_unlock
 * FROM
 *     topics
 *     JOIN subjects ON subjects.topic_id = topics.id
 * WHERE
 *     topics.id = :topicId!
 *     AND subjects.active IS TRUE
 * ```
 */
export const getSubjectsForTopicByTopicId = new PreparedQuery<IGetSubjectsForTopicByTopicIdParams,IGetSubjectsForTopicByTopicIdResult>(getSubjectsForTopicByTopicIdIR);


