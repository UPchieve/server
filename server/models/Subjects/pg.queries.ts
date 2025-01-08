/** Types generated for queries found in "server/models/Subjects/subjects.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** Query 'GetSubjectAndTopic' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetSubjectAndTopicResult = never;

/** Query 'GetSubjectAndTopic' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetSubjectAndTopicParams = never;

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


/** Query 'GetSubjects' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetSubjectsResult = never;

/** Query 'GetSubjects' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetSubjectsParams = never;

const getSubjectsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    subjects.id AS id,\n    subjects.name AS name,\n    subjects.display_name AS display_name,\n    subjects.display_order AS display_order,\n    subjects.active AS active,\n    topics.name AS topic_name,\n    topics.display_name AS topic_display_name,\n    topics.dashboard_order AS topic_dashboard_order,\n    topics.training_order AS topic_training_order,\n    topics.id AS topic_id,\n    topics.icon_link AS topic_icon_link,\n    topics.color AS topic_color\nFROM\n    subjects\n    JOIN topics ON subjects.topic_id = topics.id"};

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


/** Query 'GetTopics' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetTopicsResult = never;

/** Query 'GetTopics' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetTopicsParams = never;

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


/** Query 'GetTrainingCourses' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetTrainingCoursesResult = never;

/** Query 'GetTrainingCourses' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetTrainingCoursesParams = never;

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


/** Query 'GetQuizCertUnlocks' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetQuizCertUnlocksResult = never;

/** Query 'GetQuizCertUnlocks' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetQuizCertUnlocksParams = never;

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


/** Query 'GetCertSubjectUnlocks' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetCertSubjectUnlocksResult = never;

/** Query 'GetCertSubjectUnlocks' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetCertSubjectUnlocksParams = never;

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


/** Query 'GetComputedSubjectUnlocks' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetComputedSubjectUnlocksResult = never;

/** Query 'GetComputedSubjectUnlocks' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetComputedSubjectUnlocksParams = never;

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


/** Query 'GetSubjectType' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetSubjectTypeResult = never;

/** Query 'GetSubjectType' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetSubjectTypeParams = never;

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


/** Query 'GetSubjectNameIdMapping' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetSubjectNameIdMappingResult = never;

/** Query 'GetSubjectNameIdMapping' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetSubjectNameIdMappingParams = never;

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


