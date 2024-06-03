"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubjectNameIdMapping = exports.getSubjectType = exports.getComputedSubjectUnlocks = exports.getCertSubjectUnlocks = exports.getQuizCertUnlocks = exports.getTrainingCourses = exports.getTopics = exports.getSubjects = exports.getSubjectAndTopic = void 0;
/** Types generated for queries found in "server/models/Subjects/subjects.sql" */
const query_1 = require("@pgtyped/query");
const getSubjectAndTopicIR = { "name": "getSubjectAndTopic", "params": [{ "name": "subject", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 390, "b": 397, "line": 13, "col": 21 }] } }, { "name": "topic", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 422, "b": 427, "line": 14, "col": 23 }] } }], "usedParamSet": { "subject": true, "topic": true }, "statement": { "body": "SELECT\n    subjects.name AS subject_name,\n    subjects.display_name AS subject_display_name,\n    topics.name AS topic_name,\n    topics.display_name AS topic_display_name,\n    tool_types.name AS tool_type\nFROM\n    subjects\n    JOIN topics ON subjects.topic_id = topics.id\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\nWHERE\n    subjects.name = :subject!\n    AND topics.name = :topic!", "loc": { "a": 31, "b": 427, "line": 2, "col": 0 } } };
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
 *     AND topics.name = :topic!
 * ```
 */
exports.getSubjectAndTopic = new query_1.PreparedQuery(getSubjectAndTopicIR);
const getSubjectsIR = { "name": "getSubjects", "params": [], "usedParamSet": {}, "statement": { "body": "SELECT\n    subjects.id AS id,\n    subjects.name AS name,\n    subjects.display_name AS display_name,\n    subjects.display_order AS display_order,\n    subjects.active AS active,\n    topics.name AS topic_name,\n    topics.display_name AS topic_display_name,\n    topics.dashboard_order AS topic_dashboard_order,\n    topics.training_order AS topic_training_order,\n    topics.id AS topic_id,\n    topics.icon_link AS topic_icon_link,\n    topics.color AS topic_color\nFROM\n    subjects\n    JOIN topics ON subjects.topic_id = topics.id", "loc": { "a": 456, "b": 979, "line": 18, "col": 0 } } };
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
exports.getSubjects = new query_1.PreparedQuery(getSubjectsIR);
const getTopicsIR = { "name": "getTopics", "params": [], "usedParamSet": {}, "statement": { "body": "SELECT\n    id,\n    name,\n    display_name,\n    icon_link,\n    dashboard_order,\n    training_order\nFROM\n    topics", "loc": { "a": 1006, "b": 1118, "line": 37, "col": 0 } } };
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
exports.getTopics = new query_1.PreparedQuery(getTopicsIR);
const getTrainingCoursesIR = { "name": "getTrainingCourses", "params": [], "usedParamSet": {}, "statement": { "body": "SELECT\n    id,\n    name,\n    display_name\nFROM\n    training_courses", "loc": { "a": 1154, "b": 1220, "line": 49, "col": 0 } } };
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
exports.getTrainingCourses = new query_1.PreparedQuery(getTrainingCoursesIR);
const getQuizCertUnlocksIR = { "name": "getQuizCertUnlocks", "params": [], "usedParamSet": {}, "statement": { "body": "SELECT\n    quizzes.name AS quiz_name,\n    quiz_info.display_name AS quiz_display_name,\n    quiz_info.display_order AS quiz_display_order,\n    certs.name AS unlocked_cert_name,\n    cert_info.display_name AS unlocked_cert_display_name,\n    cert_info.display_order AS unlocked_cert_display_order,\n    topics.name AS topic_name,\n    topics.display_name AS topic_display_name,\n    topics.dashboard_order AS topic_dashboard_order,\n    topics.training_order AS topic_training_order,\n    quizzes.active AS quiz_is_active\nFROM\n    quiz_certification_grants qcg\n    JOIN quizzes ON quizzes.id = qcg.quiz_id\n    JOIN subjects AS quiz_info ON quiz_info.name = quizzes.name\n    JOIN certifications certs ON certs.id = qcg.certification_id\n    JOIN subjects AS cert_info ON cert_info.name = certs.name\n    JOIN topics ON topics.id = cert_info.topic_id", "loc": { "a": 1256, "b": 2092, "line": 58, "col": 0 } } };
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
exports.getQuizCertUnlocks = new query_1.PreparedQuery(getQuizCertUnlocksIR);
const getCertSubjectUnlocksIR = { "name": "getCertSubjectUnlocks", "params": [], "usedParamSet": {}, "statement": { "body": "SELECT\n    unlocked_subject.name AS unlocked_subject_name,\n    unlocked_subject.display_name AS unlocked_subject_display_name,\n    unlocked_subject.display_order AS unlocked_subject_display_order,\n    certifications.name AS cert_name,\n    cert_info.display_name AS cert_display_name,\n    cert_info.display_order AS cert_display_order,\n    topics.name AS topic_name\nFROM\n    certification_subject_unlocks csu\n    JOIN subjects AS unlocked_subject ON unlocked_subject.id = csu.subject_id\n    JOIN certifications ON certifications.id = csu.certification_id\n    JOIN topics ON topics.id = unlocked_subject.topic_id\n    JOIN subjects AS cert_info ON cert_info.name = certifications.name", "loc": { "a": 2131, "b": 2811, "line": 80, "col": 0 } } };
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
exports.getCertSubjectUnlocks = new query_1.PreparedQuery(getCertSubjectUnlocksIR);
const getComputedSubjectUnlocksIR = { "name": "getComputedSubjectUnlocks", "params": [], "usedParamSet": {}, "statement": { "body": "SELECT\n    unlocked_subject.name AS unlocked_subject_name,\n    unlocked_subject.display_name AS unlocked_subject_display_name,\n    unlocked_subject.display_order AS unlocked_subject_display_order,\n    certifications.name AS cert_name,\n    cert_info.display_name AS cert_display_name,\n    cert_info.display_order AS cert_display_order,\n    topics.name AS topic_name\nFROM\n    computed_subject_unlocks csu\n    JOIN subjects AS unlocked_subject ON unlocked_subject.id = csu.subject_id\n    JOIN certifications ON certifications.id = csu.certification_id\n    JOIN topics ON topics.id = unlocked_subject.topic_id\n    JOIN subjects AS cert_info ON cert_info.name = certifications.name", "loc": { "a": 2854, "b": 3529, "line": 97, "col": 0 } } };
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
exports.getComputedSubjectUnlocks = new query_1.PreparedQuery(getComputedSubjectUnlocksIR);
const getSubjectTypeIR = { "name": "getSubjectType", "params": [{ "name": "subject", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3940, "b": 3947, "line": 128, "col": 20 }] } }], "usedParamSet": { "subject": true }, "statement": { "body": "SELECT\n    CASE WHEN topics.name IS NOT NULL THEN\n        topics.name\n    WHEN tc.name IS NOT NULL THEN\n        'training'\n    ELSE\n        ''\n    END AS subject_type\nFROM\n    quizzes\n    LEFT JOIN subjects ON subjects.name = quizzes.name\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN training_courses tc ON tc.name = quizzes.name\nWHERE\n    quizzes.name = :subject!", "loc": { "a": 3561, "b": 3947, "line": 114, "col": 0 } } };
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
exports.getSubjectType = new query_1.PreparedQuery(getSubjectTypeIR);
const getSubjectNameIdMappingIR = { "name": "getSubjectNameIdMapping", "params": [], "usedParamSet": {}, "statement": { "body": "SELECT\n    subjects.name,\n    subjects.id\nFROM\n    upchieve.subjects", "loc": { "a": 3988, "b": 4055, "line": 132, "col": 0 } } };
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
exports.getSubjectNameIdMapping = new query_1.PreparedQuery(getSubjectNameIdMappingIR);
