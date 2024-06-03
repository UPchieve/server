"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSessionStats = exports.getUserSessionsByUserId = exports.sessionHasBannedParticipant = exports.volunteerSentMessageAfterSessionEnded = exports.getSessionRecap = exports.getTotalSessionHistory = exports.getSessionHistoryIdsByUserId = exports.isEligibleForSessionRecap = exports.getSessionHistory = exports.getSessionsForVolunteerHourSummary = exports.insertSessionPhotoKey = exports.insertSessionFailedJoin = exports.insertSessionReviewReason = exports.getSessionsForAdminFilter = exports.getVolunteerForEmailFirstSession = exports.getStudentForEmailFirstSession = exports.getVolunteersForGentleWarning = exports.getSessionsForReferCoworker = exports.getSessionsWithAvgWaitTimePerDayAndHour = exports.insertNewMessage = exports.getSessionForChatbot = exports.updateSessionVolunteerById = exports.getLatestSessionByStudentId = exports.getCurrentSessionUser = exports.getCurrentSessionBySessionId = exports.getMessageInfoByMessageId = exports.getRecapSessionForDmsBySessionId = exports.getCurrentSessionByUserId = exports.createSession = exports.getSessionMessagesForFrontend = exports.getUserForSessionAdminView = exports.getSessionUserAgent = exports.getSessionForAdminView = exports.getPublicSessionById = exports.getLongRunningSessions = exports.updateSessionToEnd = exports.updateSessionHasWhiteboardDoc = exports.updateSessionQuillDoc = exports.updateSessionTimeTutored = exports.updateSessionReported = exports.getActiveSessionVolunteers = exports.getTotalTimeTutoredForDateRange = exports.getSessionsToReview = exports.getSessionToEndById = exports.updateSessionReviewedStatusById = exports.updateSessionToReview = exports.insertSessionFlagById = exports.getSessionById = exports.getUnfilledSessions = exports.addNotification = void 0;
/** Types generated for queries found in "server/models/Session/session.sql" */
const query_1 = require("@pgtyped/query");
const addNotificationIR = { "name": "addNotification", "params": [{ "name": "id", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 178, "b": 180, "line": 6, "col": 5 }] } }, { "name": "volunteer", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 188, "b": 197, "line": 7, "col": 5 }] } }, { "name": "wasSuccessful", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 309, "b": 322, "line": 12, "col": 5 }] } }, { "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 330, "b": 339, "line": 13, "col": 5 }] } }, { "name": "type", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 512, "b": 516, "line": 21, "col": 31 }] } }, { "name": "method", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 557, "b": 563, "line": 22, "col": 39 }] } }, { "name": "priorityGroup", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 610, "b": 623, "line": 23, "col": 45 }] } }], "usedParamSet": { "id": true, "volunteer": true, "wasSuccessful": true, "sessionId": true, "type": true, "method": true, "priorityGroup": true }, "statement": { "body": "INSERT INTO notifications (id, user_id, sent_at, type_id, method_id, priority_group_id, successful, session_id, created_at, updated_at)\nSELECT\n    :id!,\n    :volunteer!,\n    NOW(),\n    notification_types.id,\n    notification_methods.id,\n    notification_priority_groups.id,\n    :wasSuccessful!,\n    :sessionId!,\n    NOW(),\n    NOW()\nFROM\n    notification_types\n    JOIN notification_methods ON TRUE\n    JOIN notification_priority_groups ON TRUE\nWHERE\n    notification_types.type = :type!\n    AND notification_methods.method = :method!\n    AND notification_priority_groups.name = :priorityGroup!\nRETURNING\n    id AS ok", "loc": { "a": 30, "b": 646, "line": 4, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO notifications (id, user_id, sent_at, type_id, method_id, priority_group_id, successful, session_id, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :volunteer!,
 *     NOW(),
 *     notification_types.id,
 *     notification_methods.id,
 *     notification_priority_groups.id,
 *     :wasSuccessful!,
 *     :sessionId!,
 *     NOW(),
 *     NOW()
 * FROM
 *     notification_types
 *     JOIN notification_methods ON TRUE
 *     JOIN notification_priority_groups ON TRUE
 * WHERE
 *     notification_types.type = :type!
 *     AND notification_methods.method = :method!
 *     AND notification_priority_groups.name = :priorityGroup!
 * RETURNING
 *     id AS ok
 * ```
 */
exports.addNotification = new query_1.PreparedQuery(addNotificationIR);
const getUnfilledSessionsIR = { "name": "getUnfilledSessions", "params": [{ "name": "start", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1610, "b": 1615, "line": 56, "col": 31 }] } }], "usedParamSet": { "start": true }, "statement": { "body": "SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.volunteer_id AS volunteer,\n    sessions.created_at,\n    users.first_name AS student_first_name,\n    users.test_user AS student_test_user,\n    user_product_flags.paid_tutors_pilot_group,\n    session_count.total = 1 AS is_first_time_student,\n    subjects.display_name AS subject_display_name\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN user_product_flags ON user_product_flags.user_id = sessions.student_id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    JOIN LATERAL (\n        SELECT\n            COUNT(*) AS total\n        FROM\n            sessions\n        WHERE\n            student_id = users.id) AS session_count ON TRUE\nWHERE\n    sessions.volunteer_id IS NULL\n    AND sessions.ended_at IS NULL\n    AND sessions.created_at > :start!\n    AND users.banned IS FALSE\nORDER BY\n    sessions.created_at", "loc": { "a": 683, "b": 1678, "line": 29, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     subjects.name AS sub_topic,
 *     topics.name AS TYPE,
 *     sessions.volunteer_id AS volunteer,
 *     sessions.created_at,
 *     users.first_name AS student_first_name,
 *     users.test_user AS student_test_user,
 *     user_product_flags.paid_tutors_pilot_group,
 *     session_count.total = 1 AS is_first_time_student,
 *     subjects.display_name AS subject_display_name
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
 *     LEFT JOIN user_product_flags ON user_product_flags.user_id = sessions.student_id
 *     LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
 *     JOIN LATERAL (
 *         SELECT
 *             COUNT(*) AS total
 *         FROM
 *             sessions
 *         WHERE
 *             student_id = users.id) AS session_count ON TRUE
 * WHERE
 *     sessions.volunteer_id IS NULL
 *     AND sessions.ended_at IS NULL
 *     AND sessions.created_at > :start!
 *     AND users.banned IS FALSE
 * ORDER BY
 *     sessions.created_at
 * ```
 */
exports.getUnfilledSessions = new query_1.PreparedQuery(getUnfilledSessionsIR);
const getSessionByIdIR = { "name": "getSessionById", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3173, "b": 3182, "line": 107, "col": 19 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    sessions.id,\n    student_id,\n    volunteer_id,\n    subjects.name AS subject,\n    subjects.display_name AS subject_display_name,\n    topics.name AS topic,\n    has_whiteboard_doc,\n    quill_doc,\n    volunteer_joined_at,\n    ended_at,\n    user_roles.name AS ended_by_role,\n    reviewed,\n    to_review,\n    student_banned,\n    (time_tutored)::float,\n    sessions.created_at,\n    sessions.updated_at,\n    session_reported_count.total <> 0 AS reported,\n    COALESCE(session_flag_array.flags, ARRAY[]::text[]) AS flags,\n    tool_types.name AS tool_type\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id\n    LEFT JOIN session_reports ON session_reports.session_id = sessions.id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(name) AS flags\n        FROM\n            sessions_session_flags\n            LEFT JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id\n        WHERE\n            sessions_session_flags.session_id = sessions.id) AS session_flag_array ON TRUE\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\nWHERE\n    sessions.id = :sessionId!", "loc": { "a": 1710, "b": 3182, "line": 63, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     student_id,
 *     volunteer_id,
 *     subjects.name AS subject,
 *     subjects.display_name AS subject_display_name,
 *     topics.name AS topic,
 *     has_whiteboard_doc,
 *     quill_doc,
 *     volunteer_joined_at,
 *     ended_at,
 *     user_roles.name AS ended_by_role,
 *     reviewed,
 *     to_review,
 *     student_banned,
 *     (time_tutored)::float,
 *     sessions.created_at,
 *     sessions.updated_at,
 *     session_reported_count.total <> 0 AS reported,
 *     COALESCE(session_flag_array.flags, ARRAY[]::text[]) AS flags,
 *     tool_types.name AS tool_type
 * FROM
 *     sessions
 *     LEFT JOIN subjects ON subjects.id = sessions.subject_id
 *     LEFT JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id
 *     LEFT JOIN session_reports ON session_reports.session_id = sessions.id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             session_reports
 *         WHERE
 *             session_reports.session_id = sessions.id) AS session_reported_count ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(name) AS flags
 *         FROM
 *             sessions_session_flags
 *             LEFT JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id
 *         WHERE
 *             sessions_session_flags.session_id = sessions.id) AS session_flag_array ON TRUE
 *     JOIN tool_types ON subjects.tool_type_id = tool_types.id
 * WHERE
 *     sessions.id = :sessionId!
 * ```
 */
exports.getSessionById = new query_1.PreparedQuery(getSessionByIdIR);
const insertSessionFlagByIdIR = { "name": "insertSessionFlagById", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3322, "b": 3331, "line": 113, "col": 5 }] } }, { "name": "flag", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3418, "b": 3422, "line": 120, "col": 12 }] } }], "usedParamSet": { "sessionId": true, "flag": true }, "statement": { "body": "INSERT INTO sessions_session_flags (session_id, session_flag_id, created_at, updated_at)\nSELECT\n    :sessionId!,\n    session_flags.id,\n    NOW(),\n    NOW()\nFROM\n    session_flags\nWHERE\n    name = :flag!\nON CONFLICT (session_id,\n    session_flag_id)\n    DO UPDATE SET\n        updated_at = NOW()\n    RETURNING\n        session_id AS ok", "loc": { "a": 3221, "b": 3552, "line": 111, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sessions_session_flags (session_id, session_flag_id, created_at, updated_at)
 * SELECT
 *     :sessionId!,
 *     session_flags.id,
 *     NOW(),
 *     NOW()
 * FROM
 *     session_flags
 * WHERE
 *     name = :flag!
 * ON CONFLICT (session_id,
 *     session_flag_id)
 *     DO UPDATE SET
 *         updated_at = NOW()
 *     RETURNING
 *         session_id AS ok
 * ```
 */
exports.insertSessionFlagById = new query_1.PreparedQuery(insertSessionFlagByIdIR);
const updateSessionToReviewIR = { "name": "updateSessionToReview", "params": [{ "name": "reviewed", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3662, "b": 3669, "line": 134, "col": 25 }] } }, { "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3698, "b": 3707, "line": 136, "col": 10 }] } }], "usedParamSet": { "reviewed": true, "sessionId": true }, "statement": { "body": "UPDATE\n    sessions\nSET\n    to_review = TRUE,\n    reviewed = COALESCE(:reviewed, reviewed)\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok", "loc": { "a": 3591, "b": 3730, "line": 130, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     sessions
 * SET
 *     to_review = TRUE,
 *     reviewed = COALESCE(:reviewed, reviewed)
 * WHERE
 *     id = :sessionId!
 * RETURNING
 *     id AS ok
 * ```
 */
exports.updateSessionToReview = new query_1.PreparedQuery(updateSessionToReviewIR);
const updateSessionReviewedStatusByIdIR = { "name": "updateSessionReviewedStatusById", "params": [{ "name": "reviewed", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3819, "b": 3827, "line": 145, "col": 16 }] } }, { "name": "toReview", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3847, "b": 3855, "line": 146, "col": 17 }] } }, { "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3897, "b": 3906, "line": 149, "col": 10 }] } }], "usedParamSet": { "reviewed": true, "toReview": true, "sessionId": true }, "statement": { "body": "UPDATE\n    sessions\nSET\n    reviewed = :reviewed!,\n    to_review = :toReview!,\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok", "loc": { "a": 3779, "b": 3929, "line": 142, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     sessions
 * SET
 *     reviewed = :reviewed!,
 *     to_review = :toReview!,
 *     updated_at = NOW()
 * WHERE
 *     id = :sessionId!
 * RETURNING
 *     id AS ok
 * ```
 */
exports.updateSessionReviewedStatusById = new query_1.PreparedQuery(updateSessionReviewedStatusByIdIR);
const getSessionToEndByIdIR = { "name": "getSessionToEndById", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 5676, "b": 5685, "line": 203, "col": 19 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    sessions.id,\n    student_id,\n    volunteer_id,\n    subjects.name AS subject,\n    topics.name AS topic,\n    volunteer_joined_at,\n    ended_at,\n    sessions.created_at,\n    sessions.updated_at,\n    students.first_name AS student_first_name,\n    students.email AS student_email,\n    student_sessions.total AS student_num_past_sessions,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.email AS volunteer_email,\n    volunteer_sessions.total AS volunteer_num_past_sessions,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    session_reported_count.total <> 0 AS reported\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users students ON students.id = sessions.student_id\n    LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.student_id = students.id) AS student_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = volunteers.id) AS volunteer_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = volunteers.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    sessions.id = :sessionId!", "loc": { "a": 3966, "b": 5685, "line": 155, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     student_id,
 *     volunteer_id,
 *     subjects.name AS subject,
 *     topics.name AS topic,
 *     volunteer_joined_at,
 *     ended_at,
 *     sessions.created_at,
 *     sessions.updated_at,
 *     students.first_name AS student_first_name,
 *     students.email AS student_email,
 *     student_sessions.total AS student_num_past_sessions,
 *     volunteers.first_name AS volunteer_first_name,
 *     volunteers.email AS volunteer_email,
 *     volunteer_sessions.total AS volunteer_num_past_sessions,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     session_reported_count.total <> 0 AS reported
 * FROM
 *     sessions
 *     LEFT JOIN subjects ON subjects.id = sessions.subject_id
 *     LEFT JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN users students ON students.id = sessions.student_id
 *     LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             sessions
 *         WHERE
 *             sessions.student_id = students.id) AS student_sessions ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             sessions
 *         WHERE
 *             sessions.volunteer_id = volunteers.id) AS volunteer_sessions ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             session_reports
 *         WHERE
 *             session_reports.session_id = sessions.id) AS session_reported_count ON TRUE
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = volunteers.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     sessions.id = :sessionId!
 * ```
 */
exports.getSessionToEndById = new query_1.PreparedQuery(getSessionToEndByIdIR);
const getSessionsToReviewIR = { "name": "getSessionsToReview", "params": [{ "name": "withStudentFirstName", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 7759, "b": 7778, "line": 263, "col": 61 }] } }, { "name": "limit", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 7856, "b": 7861, "line": 266, "col": 8 }] } }, { "name": "offset", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 7878, "b": 7884, "line": 266, "col": 30 }] } }], "usedParamSet": { "withStudentFirstName": true, "limit": true, "offset": true }, "statement": { "body": "SELECT\n    sessions.id,\n    sessions.ended_at,\n    sessions.created_at,\n    sessions.volunteer_id AS volunteer,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    students.first_name AS student_first_name,\n    session_reported_count.total <> 0 AS is_reported,\n    flags.flags,\n    messages.total AS total_messages,\n    session_review_reason.review_reasons,\n    sessions.to_review,\n    student_feedback.student_counseling_feedback\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users students ON students.id = sessions.student_id\n    LEFT JOIN feedbacks student_feedback ON (student_feedback.session_id = sessions.id\n            AND student_feedback.user_id = sessions.student_id)\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS flags\n        FROM\n            sessions_session_flags\n            JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id\n        WHERE\n            session_id = sessions.id\n        GROUP BY\n            session_id) AS flags ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_messages\n        WHERE\n            session_messages.session_id = sessions.id) AS messages ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS review_reasons\n        FROM\n            session_review_reasons\n            LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\n        WHERE\n            session_review_reasons.session_id = sessions.id) AS session_review_reason ON TRUE\nWHERE\n    sessions.to_review IS TRUE\n    AND sessions.reviewed IS FALSE\n    AND LOWER(students.first_name) = LOWER(COALESCE(NULLIF (:withStudentFirstName, ''), students.first_name))\nORDER BY\n    (sessions.created_at) DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int", "loc": { "a": 5722, "b": 7890, "line": 207, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     sessions.ended_at,
 *     sessions.created_at,
 *     sessions.volunteer_id AS volunteer,
 *     topics.name AS TYPE,
 *     subjects.name AS sub_topic,
 *     students.first_name AS student_first_name,
 *     session_reported_count.total <> 0 AS is_reported,
 *     flags.flags,
 *     messages.total AS total_messages,
 *     session_review_reason.review_reasons,
 *     sessions.to_review,
 *     student_feedback.student_counseling_feedback
 * FROM
 *     sessions
 *     LEFT JOIN subjects ON subjects.id = sessions.subject_id
 *     LEFT JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN users students ON students.id = sessions.student_id
 *     LEFT JOIN feedbacks student_feedback ON (student_feedback.session_id = sessions.id
 *             AND student_feedback.user_id = sessions.student_id)
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             session_reports
 *         WHERE
 *             session_reports.session_id = sessions.id) AS session_reported_count ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(session_flags.name) AS flags
 *         FROM
 *             sessions_session_flags
 *             JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id
 *         WHERE
 *             session_id = sessions.id
 *         GROUP BY
 *             session_id) AS flags ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             session_messages
 *         WHERE
 *             session_messages.session_id = sessions.id) AS messages ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(session_flags.name) AS review_reasons
 *         FROM
 *             session_review_reasons
 *             LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id
 *         WHERE
 *             session_review_reasons.session_id = sessions.id) AS session_review_reason ON TRUE
 * WHERE
 *     sessions.to_review IS TRUE
 *     AND sessions.reviewed IS FALSE
 *     AND LOWER(students.first_name) = LOWER(COALESCE(NULLIF (:withStudentFirstName, ''), students.first_name))
 * ORDER BY
 *     (sessions.created_at) DESC
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
exports.getSessionsToReview = new query_1.PreparedQuery(getSessionsToReviewIR);
const getTotalTimeTutoredForDateRangeIR = { "name": "getTotalTimeTutoredForDateRange", "params": [{ "name": "volunteerId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8029, "b": 8040, "line": 275, "col": 20 }] } }, { "name": "start", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8065, "b": 8070, "line": 276, "col": 23 }] } }, { "name": "end", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8095, "b": 8098, "line": 277, "col": 23 }] } }], "usedParamSet": { "volunteerId": true, "start": true, "end": true }, "statement": { "body": "SELECT\n    SUM(time_tutored)::bigint AS total\nFROM\n    sessions\nWHERE\n    volunteer_id = :volunteerId!\n    AND created_at >= :start!\n    AND created_at <= :end!", "loc": { "a": 7939, "b": 8098, "line": 270, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     SUM(time_tutored)::bigint AS total
 * FROM
 *     sessions
 * WHERE
 *     volunteer_id = :volunteerId!
 *     AND created_at >= :start!
 *     AND created_at <= :end!
 * ```
 */
exports.getTotalTimeTutoredForDateRange = new query_1.PreparedQuery(getTotalTimeTutoredForDateRangeIR);
const getActiveSessionVolunteersIR = { "name": "getActiveSessionVolunteers", "params": [], "usedParamSet": {}, "statement": { "body": "SELECT\n    volunteer_id\nFROM\n    sessions\nWHERE\n    ended_at IS NULL\n    AND NOT volunteer_id IS NULL", "loc": { "a": 8142, "b": 8242, "line": 281, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_id
 * FROM
 *     sessions
 * WHERE
 *     ended_at IS NULL
 *     AND NOT volunteer_id IS NULL
 * ```
 */
exports.getActiveSessionVolunteers = new query_1.PreparedQuery(getActiveSessionVolunteersIR);
const updateSessionReportedIR = { "name": "updateSessionReported", "params": [{ "name": "id", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8433, "b": 8435, "line": 293, "col": 5 }] } }, { "name": "reportMessage", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8466, "b": 8479, "line": 295, "col": 5 }] } }, { "name": "reportReason", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8642, "b": 8654, "line": 303, "col": 52 }] } }, { "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8681, "b": 8690, "line": 305, "col": 19 }] } }], "usedParamSet": { "id": true, "reportMessage": true, "reportReason": true, "sessionId": true }, "statement": { "body": "INSERT INTO session_reports (id, report_reason_id, report_message, reporting_user_id, session_id, reported_user_id, created_at, updated_at)\nSELECT\n    :id!,\n    report_reasons.id,\n    :reportMessage!,\n    sessions.volunteer_id,\n    sessions.id,\n    sessions.student_id,\n    NOW(),\n    NOW()\nFROM\n    sessions\n    JOIN report_reasons ON report_reasons.reason = :reportReason!\nWHERE\n    sessions.id = :sessionId!\nRETURNING\n    id AS ok", "loc": { "a": 8281, "b": 8713, "line": 291, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_reports (id, report_reason_id, report_message, reporting_user_id, session_id, reported_user_id, created_at, updated_at)
 * SELECT
 *     :id!,
 *     report_reasons.id,
 *     :reportMessage!,
 *     sessions.volunteer_id,
 *     sessions.id,
 *     sessions.student_id,
 *     NOW(),
 *     NOW()
 * FROM
 *     sessions
 *     JOIN report_reasons ON report_reasons.reason = :reportReason!
 * WHERE
 *     sessions.id = :sessionId!
 * RETURNING
 *     id AS ok
 * ```
 */
exports.updateSessionReported = new query_1.PreparedQuery(updateSessionReportedIR);
const updateSessionTimeTutoredIR = { "name": "updateSessionTimeTutored", "params": [{ "name": "timeTutored", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8800, "b": 8811, "line": 314, "col": 21 }] } }, { "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8859, "b": 8868, "line": 317, "col": 10 }] } }], "usedParamSet": { "timeTutored": true, "sessionId": true }, "statement": { "body": "UPDATE\n    sessions\nSET\n    time_tutored = (:timeTutored!)::int,\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok", "loc": { "a": 8755, "b": 8891, "line": 311, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     sessions
 * SET
 *     time_tutored = (:timeTutored!)::int,
 *     updated_at = NOW()
 * WHERE
 *     id = :sessionId!
 * RETURNING
 *     id AS ok
 * ```
 */
exports.updateSessionTimeTutored = new query_1.PreparedQuery(updateSessionTimeTutoredIR);
const updateSessionQuillDocIR = { "name": "updateSessionQuillDoc", "params": [{ "name": "quillDoc", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8972, "b": 8980, "line": 326, "col": 18 }] } }, { "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 9023, "b": 9032, "line": 329, "col": 10 }] } }], "usedParamSet": { "quillDoc": true, "sessionId": true }, "statement": { "body": "UPDATE\n    sessions\nSET\n    quill_doc = (:quillDoc!),\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok", "loc": { "a": 8930, "b": 9055, "line": 323, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     sessions
 * SET
 *     quill_doc = (:quillDoc!),
 *     updated_at = NOW()
 * WHERE
 *     id = :sessionId!
 * RETURNING
 *     id AS ok
 * ```
 */
exports.updateSessionQuillDoc = new query_1.PreparedQuery(updateSessionQuillDocIR);
const updateSessionHasWhiteboardDocIR = { "name": "updateSessionHasWhiteboardDoc", "params": [{ "name": "hasWhiteboardDoc", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 9153, "b": 9169, "line": 338, "col": 27 }] } }, { "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 9221, "b": 9230, "line": 341, "col": 10 }] } }], "usedParamSet": { "hasWhiteboardDoc": true, "sessionId": true }, "statement": { "body": "UPDATE\n    sessions\nSET\n    has_whiteboard_doc = (:hasWhiteboardDoc!)::boolean,\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok", "loc": { "a": 9102, "b": 9253, "line": 335, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     sessions
 * SET
 *     has_whiteboard_doc = (:hasWhiteboardDoc!)::boolean,
 *     updated_at = NOW()
 * WHERE
 *     id = :sessionId!
 * RETURNING
 *     id AS ok
 * ```
 */
exports.updateSessionHasWhiteboardDoc = new query_1.PreparedQuery(updateSessionHasWhiteboardDocIR);
const updateSessionToEndIR = { "name": "updateSessionToEnd", "params": [{ "name": "endedAt", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 9329, "b": 9336, "line": 350, "col": 16 }] } }, { "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 9522, "b": 9531, "line": 360, "col": 19 }, { "a": 9796, "b": 9805, "line": 370, "col": 19 }] } }, { "name": "endedBy", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 9604, "b": 9610, "line": 362, "col": 43 }, { "a": 9677, "b": 9683, "line": 364, "col": 36 }] } }], "usedParamSet": { "endedAt": true, "sessionId": true, "endedBy": true }, "statement": { "body": "UPDATE\n    sessions\nSET\n    ended_at = :endedAt!,\n    ended_by_role_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        user_roles.id\n    FROM\n        sessions\n    LEFT JOIN user_roles ON TRUE\nWHERE\n    sessions.id = :sessionId!\n    AND user_roles.name = (\n        CASE WHEN sessions.volunteer_id = :endedBy THEN\n            'volunteer'\n        WHEN sessions.student_id = :endedBy THEN\n            'student'\n        ELSE\n            'admin'\n        END)) AS subquery\nWHERE\n    sessions.id = :sessionId!\nRETURNING\n    sessions.id AS ok", "loc": { "a": 9289, "b": 9837, "line": 347, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     sessions
 * SET
 *     ended_at = :endedAt!,
 *     ended_by_role_id = subquery.id,
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         user_roles.id
 *     FROM
 *         sessions
 *     LEFT JOIN user_roles ON TRUE
 * WHERE
 *     sessions.id = :sessionId!
 *     AND user_roles.name = (
 *         CASE WHEN sessions.volunteer_id = :endedBy THEN
 *             'volunteer'
 *         WHEN sessions.student_id = :endedBy THEN
 *             'student'
 *         ELSE
 *             'admin'
 *         END)) AS subquery
 * WHERE
 *     sessions.id = :sessionId!
 * RETURNING
 *     sessions.id AS ok
 * ```
 */
exports.updateSessionToEnd = new query_1.PreparedQuery(updateSessionToEndIR);
const getLongRunningSessionsIR = { "name": "getLongRunningSessions", "params": [{ "name": "start", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 9943, "b": 9948, "line": 381, "col": 19 }] } }, { "name": "end", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 9973, "b": 9976, "line": 382, "col": 23 }] } }], "usedParamSet": { "start": true, "end": true }, "statement": { "body": "SELECT\n    sessions.id\nFROM\n    sessions\nWHERE\n    created_at >= :start!\n    AND created_at <= :end!\n    AND ended_at IS NULL", "loc": { "a": 9877, "b": 10001, "line": 376, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id
 * FROM
 *     sessions
 * WHERE
 *     created_at >= :start!
 *     AND created_at <= :end!
 *     AND ended_at IS NULL
 * ```
 */
exports.getLongRunningSessions = new query_1.PreparedQuery(getLongRunningSessionsIR);
const getPublicSessionByIdIR = { "name": "getPublicSessionById", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 10612, "b": 10621, "line": 404, "col": 19 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    sessions.id,\n    sessions.ended_at,\n    sessions.created_at,\n    sessions.student_id,\n    sessions.volunteer_id,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    students.first_name AS student_first_name,\n    volunteers.first_name AS volunteer_first_name\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users students ON students.id = sessions.student_id\n    LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id\nWHERE\n    sessions.id = :sessionId!", "loc": { "a": 10039, "b": 10621, "line": 387, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     sessions.ended_at,
 *     sessions.created_at,
 *     sessions.student_id,
 *     sessions.volunteer_id,
 *     topics.name AS TYPE,
 *     subjects.name AS sub_topic,
 *     students.first_name AS student_first_name,
 *     volunteers.first_name AS volunteer_first_name
 * FROM
 *     sessions
 *     LEFT JOIN subjects ON subjects.id = sessions.subject_id
 *     LEFT JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN users students ON students.id = sessions.student_id
 *     LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id
 * WHERE
 *     sessions.id = :sessionId!
 * ```
 */
exports.getPublicSessionById = new query_1.PreparedQuery(getPublicSessionByIdIR);
const getSessionForAdminViewIR = { "name": "getSessionForAdminView", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 11732, "b": 11741, "line": 444, "col": 26 }, { "a": 12569, "b": 12578, "line": 466, "col": 19 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.ended_at,\n    sessions.volunteer_joined_at,\n    sessions.quill_doc,\n    sessions.time_tutored::int,\n    (\n        CASE WHEN user_roles.name = 'volunteer' THEN\n            sessions.volunteer_id\n        WHEN user_roles.name = 'student' THEN\n            sessions.student_id\n        ELSE\n            NULL\n        END) AS ended_by,\n    session_reports.report_message,\n    report_reasons.reason AS report_reason,\n    session_review_reason.review_reasons,\n    session_photo.photos,\n    sessions.to_review,\n    tool_types.name AS tool_type\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id\n    LEFT JOIN (\n        SELECT\n            report_reason_id,\n            report_message\n        FROM\n            session_reports\n        WHERE\n            session_id = :sessionId!\n        ORDER BY\n            created_at DESC\n        LIMIT 1) AS session_reports ON TRUE\n    LEFT JOIN report_reasons ON report_reasons.id = session_reports.report_reason_id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS review_reasons\n        FROM\n            session_review_reasons\n            LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\n        WHERE\n            session_review_reasons.session_id = sessions.id) AS session_review_reason ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(photo_key) AS photos\n        FROM\n            session_photos\n        WHERE\n            session_photos.session_id = sessions.id) AS session_photo ON TRUE\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\nWHERE\n    sessions.id = :sessionId!", "loc": { "a": 10661, "b": 12578, "line": 408, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     subjects.name AS sub_topic,
 *     topics.name AS TYPE,
 *     sessions.created_at,
 *     sessions.ended_at,
 *     sessions.volunteer_joined_at,
 *     sessions.quill_doc,
 *     sessions.time_tutored::int,
 *     (
 *         CASE WHEN user_roles.name = 'volunteer' THEN
 *             sessions.volunteer_id
 *         WHEN user_roles.name = 'student' THEN
 *             sessions.student_id
 *         ELSE
 *             NULL
 *         END) AS ended_by,
 *     session_reports.report_message,
 *     report_reasons.reason AS report_reason,
 *     session_review_reason.review_reasons,
 *     session_photo.photos,
 *     sessions.to_review,
 *     tool_types.name AS tool_type
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
 *     LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
 *     LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id
 *     LEFT JOIN (
 *         SELECT
 *             report_reason_id,
 *             report_message
 *         FROM
 *             session_reports
 *         WHERE
 *             session_id = :sessionId!
 *         ORDER BY
 *             created_at DESC
 *         LIMIT 1) AS session_reports ON TRUE
 *     LEFT JOIN report_reasons ON report_reasons.id = session_reports.report_reason_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(session_flags.name) AS review_reasons
 *         FROM
 *             session_review_reasons
 *             LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id
 *         WHERE
 *             session_review_reasons.session_id = sessions.id) AS session_review_reason ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(photo_key) AS photos
 *         FROM
 *             session_photos
 *         WHERE
 *             session_photos.session_id = sessions.id) AS session_photo ON TRUE
 *     JOIN tool_types ON subjects.tool_type_id = tool_types.id
 * WHERE
 *     sessions.id = :sessionId!
 * ```
 */
exports.getSessionForAdminView = new query_1.PreparedQuery(getSessionForAdminViewIR);
const getSessionUserAgentIR = { "name": "getSessionUserAgent", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 12778, "b": 12787, "line": 479, "col": 31 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    device,\n    browser,\n    browser_version,\n    operating_system,\n    operating_system_version\nFROM\n    user_actions\nWHERE\n    user_actions.session_id = :sessionId!\n    AND user_actions.action = 'REQUESTED SESSION'\nLIMIT 1", "loc": { "a": 12615, "b": 12845, "line": 470, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     device,
 *     browser,
 *     browser_version,
 *     operating_system,
 *     operating_system_version
 * FROM
 *     user_actions
 * WHERE
 *     user_actions.session_id = :sessionId!
 *     AND user_actions.action = 'REQUESTED SESSION'
 * LIMIT 1
 * ```
 */
exports.getSessionUserAgent = new query_1.PreparedQuery(getSessionUserAgentIR);
const getUserForSessionAdminViewIR = { "name": "getUserForSessionAdminView", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 13622, "b": 13631, "line": 510, "col": 19 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    users.id,\n    first_name AS firstname,\n    users.created_at,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    past_sessions.total AS past_sessions\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\n    LEFT JOIN sessions ON sessions.student_id = users.id\n        OR sessions.volunteer_id = users.id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(sessions.id ORDER BY sessions.created_at) AS total\n        FROM\n            sessions\n        WHERE\n            student_id = users.id\n            OR volunteer_id = users.id) AS past_sessions ON TRUE\nWHERE\n    sessions.id = :sessionId!\nGROUP BY\n    users.id,\n    volunteer_profiles.user_id,\n    past_sessions.total", "loc": { "a": 12889, "b": 13710, "line": 485, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name AS firstname,
 *     users.created_at,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_volunteer,
 *     past_sessions.total AS past_sessions
 * FROM
 *     users
 *     LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id
 *     LEFT JOIN sessions ON sessions.student_id = users.id
 *         OR sessions.volunteer_id = users.id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(sessions.id ORDER BY sessions.created_at) AS total
 *         FROM
 *             sessions
 *         WHERE
 *             student_id = users.id
 *             OR volunteer_id = users.id) AS past_sessions ON TRUE
 * WHERE
 *     sessions.id = :sessionId!
 * GROUP BY
 *     users.id,
 *     volunteer_profiles.user_id,
 *     past_sessions.total
 * ```
 */
exports.getUserForSessionAdminView = new query_1.PreparedQuery(getUserForSessionAdminViewIR);
const getSessionMessagesForFrontendIR = { "name": "getSessionMessagesForFrontend", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 13890, "b": 13899, "line": 527, "col": 18 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    id,\n    sender_id AS USER,\n    contents,\n    created_at,\n    session_id\nFROM\n    session_messages\nWHERE\n    session_id = :sessionId!\nORDER BY\n    created_at", "loc": { "a": 13757, "b": 13923, "line": 518, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     sender_id AS USER,
 *     contents,
 *     created_at,
 *     session_id
 * FROM
 *     session_messages
 * WHERE
 *     session_id = :sessionId!
 * ORDER BY
 *     created_at
 * ```
 */
exports.getSessionMessagesForFrontend = new query_1.PreparedQuery(getSessionMessagesForFrontendIR);
const createSessionIR = { "name": "createSession", "params": [{ "name": "id", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 14056, "b": 14058, "line": 535, "col": 5 }] } }, { "name": "studentId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 14066, "b": 14075, "line": 536, "col": 5 }] } }, { "name": "studentBanned", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 14100, "b": 14113, "line": 538, "col": 5 }] } }, { "name": "subject", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 14182, "b": 14189, "line": 544, "col": 21 }] } }], "usedParamSet": { "id": true, "studentId": true, "studentBanned": true, "subject": true }, "statement": { "body": "INSERT INTO sessions (id, student_id, subject_id, student_banned, created_at, updated_at)\nSELECT\n    :id!,\n    :studentId!,\n    subjects.id,\n    :studentBanned!,\n    NOW(),\n    NOW()\nFROM\n    subjects\nWHERE\n    subjects.name = :subject!\nRETURNING\n    sessions.id", "loc": { "a": 13954, "b": 14215, "line": 533, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sessions (id, student_id, subject_id, student_banned, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :studentId!,
 *     subjects.id,
 *     :studentBanned!,
 *     NOW(),
 *     NOW()
 * FROM
 *     subjects
 * WHERE
 *     subjects.name = :subject!
 * RETURNING
 *     sessions.id
 * ```
 */
exports.createSession = new query_1.PreparedQuery(createSessionIR);
const getCurrentSessionByUserIdIR = { "name": "getCurrentSessionByUserId", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 14778, "b": 14784, "line": 566, "col": 30 }, { "a": 14818, "b": 14824, "line": 567, "col": 32 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.volunteer_joined_at,\n    sessions.volunteer_id,\n    sessions.student_id,\n    sessions.ended_at,\n    tool_types.name AS tool_type\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\nWHERE (sessions.student_id = :userId!\n    OR sessions.volunteer_id = :userId!)\nAND sessions.ended_at IS NULL", "loc": { "a": 14258, "b": 14855, "line": 550, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     subjects.name AS sub_topic,
 *     topics.name AS TYPE,
 *     sessions.created_at,
 *     sessions.volunteer_joined_at,
 *     sessions.volunteer_id,
 *     sessions.student_id,
 *     sessions.ended_at,
 *     tool_types.name AS tool_type
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
 *     LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
 *     JOIN tool_types ON subjects.tool_type_id = tool_types.id
 * WHERE (sessions.student_id = :userId!
 *     OR sessions.volunteer_id = :userId!)
 * AND sessions.ended_at IS NULL
 * ```
 */
exports.getCurrentSessionByUserId = new query_1.PreparedQuery(getCurrentSessionByUserIdIR);
const getRecapSessionForDmsBySessionIdIR = { "name": "getRecapSessionForDmsBySessionId", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 15420, "b": 15429, "line": 589, "col": 19 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.volunteer_joined_at,\n    sessions.volunteer_id,\n    sessions.student_id,\n    sessions.ended_at,\n    tool_types.name AS tool_type\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\nWHERE\n    sessions.id = :sessionId!\n    AND sessions.ended_at IS NOT NULL", "loc": { "a": 14905, "b": 15467, "line": 572, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     subjects.name AS sub_topic,
 *     topics.name AS TYPE,
 *     sessions.created_at,
 *     sessions.volunteer_joined_at,
 *     sessions.volunteer_id,
 *     sessions.student_id,
 *     sessions.ended_at,
 *     tool_types.name AS tool_type
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
 *     LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
 *     JOIN tool_types ON subjects.tool_type_id = tool_types.id
 * WHERE
 *     sessions.id = :sessionId!
 *     AND sessions.ended_at IS NOT NULL
 * ```
 */
exports.getRecapSessionForDmsBySessionId = new query_1.PreparedQuery(getRecapSessionForDmsBySessionIdIR);
const getMessageInfoByMessageIdIR = { "name": "getMessageInfoByMessageId", "params": [{ "name": "messageId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 16322, "b": 16331, "line": 617, "col": 27 }] } }], "usedParamSet": { "messageId": true }, "statement": { "body": "SELECT\n    sessions.id AS session_id,\n    sessions.ended_at AS session_ended_at,\n    students.id AS student_user_id,\n    students.first_name AS student_first_name,\n    students.email AS student_email,\n    volunteers.id AS volunteer_user_id,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.email AS volunteer_email,\n    session_messages.contents,\n    session_messages.created_at,\n    session_messages.sender_id,\n    CASE WHEN session_messages.created_at > sessions.ended_at THEN\n        TRUE\n    ELSE\n        FALSE\n    END AS sent_after_session\nFROM\n    session_messages\n    JOIN sessions ON session_messages.session_id = sessions.id\n    JOIN users students ON students.id = sessions.student_id\n    JOIN users volunteers ON volunteers.id = sessions.volunteer_id\nWHERE\n    session_messages.id = :messageId!\n    AND sessions.ended_at IS NOT NULL", "loc": { "a": 15510, "b": 16369, "line": 594, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id AS session_id,
 *     sessions.ended_at AS session_ended_at,
 *     students.id AS student_user_id,
 *     students.first_name AS student_first_name,
 *     students.email AS student_email,
 *     volunteers.id AS volunteer_user_id,
 *     volunteers.first_name AS volunteer_first_name,
 *     volunteers.email AS volunteer_email,
 *     session_messages.contents,
 *     session_messages.created_at,
 *     session_messages.sender_id,
 *     CASE WHEN session_messages.created_at > sessions.ended_at THEN
 *         TRUE
 *     ELSE
 *         FALSE
 *     END AS sent_after_session
 * FROM
 *     session_messages
 *     JOIN sessions ON session_messages.session_id = sessions.id
 *     JOIN users students ON students.id = sessions.student_id
 *     JOIN users volunteers ON volunteers.id = sessions.volunteer_id
 * WHERE
 *     session_messages.id = :messageId!
 *     AND sessions.ended_at IS NOT NULL
 * ```
 */
exports.getMessageInfoByMessageId = new query_1.PreparedQuery(getMessageInfoByMessageIdIR);
const getCurrentSessionBySessionIdIR = { "name": "getCurrentSessionBySessionId", "params": [{ "name": "sessionId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 16930, "b": 16938, "line": 639, "col": 19 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.volunteer_joined_at,\n    sessions.volunteer_id,\n    sessions.student_id,\n    sessions.ended_at,\n    tool_types.name AS tool_type\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\nWHERE\n    sessions.id = :sessionId", "loc": { "a": 16415, "b": 16938, "line": 622, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     subjects.name AS sub_topic,
 *     topics.name AS TYPE,
 *     sessions.created_at,
 *     sessions.volunteer_joined_at,
 *     sessions.volunteer_id,
 *     sessions.student_id,
 *     sessions.ended_at,
 *     tool_types.name AS tool_type
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
 *     LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
 *     JOIN tool_types ON subjects.tool_type_id = tool_types.id
 * WHERE
 *     sessions.id = :sessionId
 * ```
 */
exports.getCurrentSessionBySessionId = new query_1.PreparedQuery(getCurrentSessionBySessionIdIR);
const getCurrentSessionUserIR = { "name": "getCurrentSessionUser", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 17425, "b": 17434, "line": 659, "col": 19 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    users.id,\n    users.first_name AS firstname,\n    users.first_name AS first_name,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NULL THEN\n            FALSE\n        ELSE\n            TRUE\n        END) AS is_volunteer\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN sessions ON sessions.student_id = users.id\n        OR sessions.volunteer_id = users.id\nWHERE\n    sessions.id = :sessionId!", "loc": { "a": 16977, "b": 17434, "line": 643, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name AS firstname,
 *     users.first_name AS first_name,
 *     (
 *         CASE WHEN volunteer_profiles.user_id IS NULL THEN
 *             FALSE
 *         ELSE
 *             TRUE
 *         END) AS is_volunteer
 * FROM
 *     users
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN sessions ON sessions.student_id = users.id
 *         OR sessions.volunteer_id = users.id
 * WHERE
 *     sessions.id = :sessionId!
 * ```
 */
exports.getCurrentSessionUser = new query_1.PreparedQuery(getCurrentSessionUserIR);
const getLatestSessionByStudentIdIR = { "name": "getLatestSessionByStudentId", "params": [{ "name": "studentId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 17686, "b": 17695, "line": 672, "col": 27 }] } }], "usedParamSet": { "studentId": true }, "statement": { "body": "SELECT\n    sessions.id,\n    sessions.created_at,\n    time_tutored::int,\n    subjects.name AS subject\nFROM\n    sessions\n    JOIN subjects ON sessions.subject_id = subjects.id\nWHERE\n    sessions.student_id = :studentId!\nORDER BY\n    created_at DESC\nLIMIT 1", "loc": { "a": 17479, "b": 17732, "line": 663, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     sessions.created_at,
 *     time_tutored::int,
 *     subjects.name AS subject
 * FROM
 *     sessions
 *     JOIN subjects ON sessions.subject_id = subjects.id
 * WHERE
 *     sessions.student_id = :studentId!
 * ORDER BY
 *     created_at DESC
 * LIMIT 1
 * ```
 */
exports.getLatestSessionByStudentId = new query_1.PreparedQuery(getLatestSessionByStudentIdIR);
const updateSessionVolunteerByIdIR = { "name": "updateSessionVolunteerById", "params": [{ "name": "volunteerId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 17820, "b": 17831, "line": 682, "col": 20 }] } }, { "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 17906, "b": 17915, "line": 686, "col": 10 }] } }], "usedParamSet": { "volunteerId": true, "sessionId": true }, "statement": { "body": "UPDATE\n    sessions\nSET\n    volunteer_id = :volunteerId!,\n    volunteer_joined_at = NOW(),\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok", "loc": { "a": 17776, "b": 17938, "line": 679, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     sessions
 * SET
 *     volunteer_id = :volunteerId!,
 *     volunteer_joined_at = NOW(),
 *     updated_at = NOW()
 * WHERE
 *     id = :sessionId!
 * RETURNING
 *     id AS ok
 * ```
 */
exports.updateSessionVolunteerById = new query_1.PreparedQuery(updateSessionVolunteerByIdIR);
const getSessionForChatbotIR = { "name": "getSessionForChatbot", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 18518, "b": 18527, "line": 709, "col": 19 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    sessions.id,\n    subjects.name AS subject,\n    topics.name AS topic,\n    sessions.created_at,\n    sessions.ended_at,\n    sessions.volunteer_joined_at,\n    sessions.student_id AS student,\n    users.first_name AS student_first_name,\n    tool_types.name AS tool_type\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\nWHERE\n    sessions.id = :sessionId!", "loc": { "a": 17976, "b": 18527, "line": 692, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     subjects.name AS subject,
 *     topics.name AS topic,
 *     sessions.created_at,
 *     sessions.ended_at,
 *     sessions.volunteer_joined_at,
 *     sessions.student_id AS student,
 *     users.first_name AS student_first_name,
 *     tool_types.name AS tool_type
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
 *     LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
 *     JOIN tool_types ON subjects.tool_type_id = tool_types.id
 * WHERE
 *     sessions.id = :sessionId!
 * ```
 */
exports.getSessionForChatbot = new query_1.PreparedQuery(getSessionForChatbotIR);
const insertNewMessageIR = { "name": "insertNewMessage", "params": [{ "name": "id", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 18665, "b": 18667, "line": 714, "col": 13 }] } }, { "name": "senderId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 18671, "b": 18679, "line": 714, "col": 19 }] } }, { "name": "contents", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 18683, "b": 18691, "line": 714, "col": 31 }] } }, { "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 18695, "b": 18704, "line": 714, "col": 43 }] } }], "usedParamSet": { "id": true, "senderId": true, "contents": true, "sessionId": true }, "statement": { "body": "INSERT INTO session_messages (id, sender_id, contents, session_id, created_at, updated_at)\n    VALUES (:id!, :senderId!, :contents!, :sessionId!, NOW(), NOW())\nRETURNING\n    id", "loc": { "a": 18561, "b": 18736, "line": 713, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_messages (id, sender_id, contents, session_id, created_at, updated_at)
 *     VALUES (:id!, :senderId!, :contents!, :sessionId!, NOW(), NOW())
 * RETURNING
 *     id
 * ```
 */
exports.insertNewMessage = new query_1.PreparedQuery(insertNewMessageIR);
const getSessionsWithAvgWaitTimePerDayAndHourIR = { "name": "getSessionsWithAvgWaitTimePerDayAndHour", "params": [{ "name": "start", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 19305, "b": 19310, "line": 732, "col": 28 }] } }, { "name": "end", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 19343, "b": 19346, "line": 733, "col": 31 }] } }], "usedParamSet": { "start": true, "end": true }, "statement": { "body": "SELECT\n    extract(isodow FROM sessions.created_at)::int AS day,\n    extract(hour FROM sessions.created_at)::int AS hour,\n    COALESCE(AVG(\n            CASE WHEN sessions.volunteer_id IS NULL THEN\n                EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at))\n            ELSE\n                EXTRACT('epoch' FROM (sessions.volunteer_joined_at - sessions.created_at))\n            END), 0)::float * 1000 AS average_wait_time -- in milliseconds\nFROM\n    sessions\nWHERE\n    sessions.created_at >= :start!\n    AND sessions.created_at < :end!\n    AND NOT sessions.ended_at IS NULL\n    AND EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) > 60\nGROUP BY\n    day,\n    hour", "loc": { "a": 18793, "b": 19488, "line": 720, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     extract(isodow FROM sessions.created_at)::int AS day,
 *     extract(hour FROM sessions.created_at)::int AS hour,
 *     COALESCE(AVG(
 *             CASE WHEN sessions.volunteer_id IS NULL THEN
 *                 EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at))
 *             ELSE
 *                 EXTRACT('epoch' FROM (sessions.volunteer_joined_at - sessions.created_at))
 *             END), 0)::float * 1000 AS average_wait_time -- in milliseconds
 * FROM
 *     sessions
 * WHERE
 *     sessions.created_at >= :start!
 *     AND sessions.created_at < :end!
 *     AND NOT sessions.ended_at IS NULL
 *     AND EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) > 60
 * GROUP BY
 *     day,
 *     hour
 * ```
 */
exports.getSessionsWithAvgWaitTimePerDayAndHour = new query_1.PreparedQuery(getSessionsWithAvgWaitTimePerDayAndHourIR);
const getSessionsForReferCoworkerIR = { "name": "getSessionsForReferCoworker", "params": [{ "name": "volunteerId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 19936, "b": 19947, "line": 752, "col": 29 }] } }], "usedParamSet": { "volunteerId": true }, "statement": { "body": "SELECT\n    sessions.id,\n    feedbacks.volunteer_feedback\nFROM\n    sessions\n    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id\n    LEFT JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id\n    LEFT JOIN feedbacks ON feedbacks.session_id = sessions.id\n        AND feedbacks.user_id = sessions.volunteer_id\nWHERE\n    sessions.volunteer_id = :volunteerId!\n    AND sessions.time_tutored >= 15 * 60 * 1000\n    AND (session_flags.name IS NULL\n        OR NOT session_flags.name = ANY ('{\"Absent student\", \"Absent volunteer\"}'))", "loc": { "a": 19533, "b": 20115, "line": 742, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     feedbacks.volunteer_feedback
 * FROM
 *     sessions
 *     LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id
 *     LEFT JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id
 *     LEFT JOIN feedbacks ON feedbacks.session_id = sessions.id
 *         AND feedbacks.user_id = sessions.volunteer_id
 * WHERE
 *     sessions.volunteer_id = :volunteerId!
 *     AND sessions.time_tutored >= 15 * 60 * 1000
 *     AND (session_flags.name IS NULL
 *         OR NOT session_flags.name = ANY ('{"Absent student", "Absent volunteer"}'))
 * ```
 */
exports.getSessionsForReferCoworker = new query_1.PreparedQuery(getSessionsForReferCoworkerIR);
const getVolunteersForGentleWarningIR = { "name": "getVolunteersForGentleWarning", "params": [{ "name": "sessionId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 20924, "b": 20932, "line": 786, "col": 43 }] } }, { "name": "mongoSessionId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 20977, "b": 20990, "line": 787, "col": 43 }] } }], "usedParamSet": { "sessionId": true, "mongoSessionId": true }, "statement": { "body": "SELECT\n    users.id,\n    users.email,\n    users.first_name,\n    notification_count.total AS total_notifications\nFROM\n    notifications\n    LEFT JOIN users ON users.id = notifications.user_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = users.id) AS session_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            notifications\n        WHERE\n            notifications.user_id = users.id) AS notification_count ON TRUE\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND session_count.total = 0\n    AND (notifications.session_id::uuid = :sessionId\n        OR notifications.mongo_id::text = :mongoSessionId)\nGROUP BY\n    users.id,\n    notification_count.total", "loc": { "a": 20162, "b": 21043, "line": 759, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.email,
 *     users.first_name,
 *     notification_count.total AS total_notifications
 * FROM
 *     notifications
 *     LEFT JOIN users ON users.id = notifications.user_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(*)::int AS total
 *         FROM
 *             sessions
 *         WHERE
 *             sessions.volunteer_id = users.id) AS session_count ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(*)::int AS total
 *         FROM
 *             notifications
 *         WHERE
 *             notifications.user_id = users.id) AS notification_count ON TRUE
 * WHERE
 *     users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND session_count.total = 0
 *     AND (notifications.session_id::uuid = :sessionId
 *         OR notifications.mongo_id::text = :mongoSessionId)
 * GROUP BY
 *     users.id,
 *     notification_count.total
 * ```
 */
exports.getVolunteersForGentleWarning = new query_1.PreparedQuery(getVolunteersForGentleWarningIR);
const getStudentForEmailFirstSessionIR = { "name": "getStudentForEmailFirstSession", "params": [{ "name": "sessionId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 21427, "b": 21435, "line": 803, "col": 28 }] } }, { "name": "mongoSessionId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 21471, "b": 21484, "line": 804, "col": 34 }] } }], "usedParamSet": { "sessionId": true, "mongoSessionId": true }, "statement": { "body": "SELECT\n    users.id,\n    users.first_name,\n    users.email\nFROM\n    sessions\n    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id\n    LEFT JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id\n    LEFT JOIN users ON users.id = sessions.student_id\nWHERE (sessions.id::uuid = :sessionId\n    OR sessions.mongo_id::text = :mongoSessionId)\nAND (session_flags.name IS NULL\n    OR NOT session_flags.name = ANY ('{\"Absent student\", \"Absent volunteer\", \"Low coach rating from student\", \"Low session rating from student\" }'))\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE", "loc": { "a": 21091, "b": 21726, "line": 794, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name,
 *     users.email
 * FROM
 *     sessions
 *     LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id
 *     LEFT JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id
 *     LEFT JOIN users ON users.id = sessions.student_id
 * WHERE (sessions.id::uuid = :sessionId
 *     OR sessions.mongo_id::text = :mongoSessionId)
 * AND (session_flags.name IS NULL
 *     OR NOT session_flags.name = ANY ('{"Absent student", "Absent volunteer", "Low coach rating from student", "Low session rating from student" }'))
 * AND users.deactivated IS FALSE
 * AND users.test_user IS FALSE
 * ```
 */
exports.getStudentForEmailFirstSession = new query_1.PreparedQuery(getStudentForEmailFirstSessionIR);
const getVolunteerForEmailFirstSessionIR = { "name": "getVolunteerForEmailFirstSession", "params": [{ "name": "sessionId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 22114, "b": 22122, "line": 821, "col": 28 }] } }, { "name": "mongoSessionId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 22158, "b": 22171, "line": 822, "col": 34 }] } }], "usedParamSet": { "sessionId": true, "mongoSessionId": true }, "statement": { "body": "SELECT\n    users.id,\n    users.first_name,\n    users.email\nFROM\n    sessions\n    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id\n    LEFT JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id\n    LEFT JOIN users ON users.id = sessions.volunteer_id\nWHERE (sessions.id::uuid = :sessionId\n    OR sessions.mongo_id::text = :mongoSessionId)\nAND (session_flags.name IS NULL\n    OR NOT session_flags.name = ANY ('{\"Absent student\", \"Absent volunteer\", \"Low coach rating from student\", \"Low session rating from student\" }'))\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE", "loc": { "a": 21776, "b": 22413, "line": 812, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name,
 *     users.email
 * FROM
 *     sessions
 *     LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id
 *     LEFT JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id
 *     LEFT JOIN users ON users.id = sessions.volunteer_id
 * WHERE (sessions.id::uuid = :sessionId
 *     OR sessions.mongo_id::text = :mongoSessionId)
 * AND (session_flags.name IS NULL
 *     OR NOT session_flags.name = ANY ('{"Absent student", "Absent volunteer", "Low coach rating from student", "Low session rating from student" }'))
 * AND users.deactivated IS FALSE
 * AND users.test_user IS FALSE
 * ```
 */
exports.getVolunteerForEmailFirstSession = new query_1.PreparedQuery(getVolunteerForEmailFirstSessionIR);
const getSessionsForAdminFilterIR = { "name": "getSessionsForAdminFilter", "params": [{ "name": "start", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 25266, "b": 25271, "line": 920, "col": 32 }] } }, { "name": "end", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 25305, "b": 25308, "line": 921, "col": 32 }] } }, { "name": "messageCount", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 25321, "b": 25332, "line": 922, "col": 11 }, { "a": 25384, "b": 25395, "line": 923, "col": 36 }] } }, { "name": "sessionLength", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 25415, "b": 25427, "line": 924, "col": 11 }, { "a": 25529, "b": 25541, "line": 925, "col": 86 }] } }, { "name": "reported", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 25561, "b": 25568, "line": 926, "col": 11 }, { "a": 25601, "b": 25608, "line": 927, "col": 13 }] } }, { "name": "showBannedUsers", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 25841, "b": 25855, "line": 932, "col": 13 }] } }, { "name": "showTestUsers", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 25887, "b": 25899, "line": 933, "col": 11 }, { "a": 25932, "b": 25944, "line": 934, "col": 13 }] } }, { "name": "firstTimeStudent", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26015, "b": 26030, "line": 936, "col": 11 }, { "a": 26063, "b": 26078, "line": 937, "col": 13 }] } }, { "name": "firstTimeVolunteer", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26149, "b": 26166, "line": 939, "col": 11 }, { "a": 26199, "b": 26216, "line": 940, "col": 13 }] } }, { "name": "limit", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26326, "b": 26331, "line": 944, "col": 8 }] } }, { "name": "offset", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26348, "b": 26354, "line": 944, "col": 30 }] } }], "usedParamSet": { "start": true, "end": true, "messageCount": true, "sessionLength": true, "reported": true, "showBannedUsers": true, "showTestUsers": true, "firstTimeStudent": true, "firstTimeVolunteer": true, "limit": true, "offset": true }, "statement": { "body": "SELECT\n    sessions.id,\n    sessions.created_at,\n    sessions.ended_at,\n    message_count.total AS total_messages,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    students.first_name AS student_first_name,\n    students.email AS student_email,\n    students.banned AS student_is_banned,\n    students.test_user AS student_test_user,\n    student_sessions.total AS student_total_past_sessions,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.email AS volunteer_email,\n    volunteers.banned AS volunteer_is_banned,\n    volunteers.test_user AS volunteer_test_user,\n    volunteer_sessions.total AS volunteer_total_past_sessions,\n    review_reasons.review_reasons\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS review_reasons\n        FROM\n            session_review_reasons\n            LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\n        WHERE\n            session_id = sessions.id) AS review_reasons ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            first_name,\n            id,\n            email,\n            banned,\n            test_user\n        FROM\n            users\n        WHERE\n            users.id = sessions.student_id) AS students ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            first_name,\n            id,\n            email,\n            banned,\n            test_user\n        FROM\n            users\n        WHERE\n            users.id = sessions.volunteer_id) AS volunteers ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            session_messages\n        WHERE\n            session_messages.session_id = sessions.id) AS message_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            sessions.id = session_reports.session_id) AS session_reported_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.student_id = students.id) AS student_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = volunteers.id) AS volunteer_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            MAX(created_at) AS last_banned_at\n        FROM\n            user_actions\n        WHERE\n            user_actions.user_id = sessions.student_id\n            AND user_actions.action = 'BANNED') AS student_banned ON TRUE\nWHERE\n    NOT sessions.ended_at IS NULL\n    AND sessions.created_at >= :start!\n    AND sessions.created_at <= :end!\n    AND ((:messageCount)::int IS NULL\n        OR message_count.total >= (:messageCount)::int)\n    AND ((:sessionLength)::int IS NULL\n        OR (EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) / 60) > (:sessionLength)::int)\n    AND ((:reported)::boolean IS NULL\n        OR (:reported)::boolean IS FALSE\n        OR session_reported_count.total > 0)\n    AND (student_banned.last_banned_at IS NULL\n        OR sessions.created_at < student_banned.last_banned_at\n        OR sessions.student_banned IS FALSE\n        OR (:showBannedUsers)::boolean IS TRUE)\n    AND ((:showTestUsers)::boolean IS NULL\n        OR (:showTestUsers)::boolean IS TRUE\n        OR students.test_user IS FALSE)\n    AND ((:firstTimeStudent)::boolean IS NULL\n        OR (:firstTimeStudent)::boolean IS FALSE\n        OR student_sessions.total = 1)\n    AND ((:firstTimeVolunteer)::boolean IS NULL\n        OR (:firstTimeVolunteer)::boolean IS FALSE\n        OR volunteer_sessions.total = 1)\nORDER BY\n    (sessions.created_at) DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int", "loc": { "a": 22456, "b": 26360, "line": 830, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     sessions.created_at,
 *     sessions.ended_at,
 *     message_count.total AS total_messages,
 *     topics.name AS TYPE,
 *     subjects.name AS sub_topic,
 *     students.first_name AS student_first_name,
 *     students.email AS student_email,
 *     students.banned AS student_is_banned,
 *     students.test_user AS student_test_user,
 *     student_sessions.total AS student_total_past_sessions,
 *     volunteers.first_name AS volunteer_first_name,
 *     volunteers.email AS volunteer_email,
 *     volunteers.banned AS volunteer_is_banned,
 *     volunteers.test_user AS volunteer_test_user,
 *     volunteer_sessions.total AS volunteer_total_past_sessions,
 *     review_reasons.review_reasons
 * FROM
 *     sessions
 *     LEFT JOIN subjects ON subjects.id = sessions.subject_id
 *     LEFT JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(session_flags.name) AS review_reasons
 *         FROM
 *             session_review_reasons
 *             LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id
 *         WHERE
 *             session_id = sessions.id) AS review_reasons ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             first_name,
 *             id,
 *             email,
 *             banned,
 *             test_user
 *         FROM
 *             users
 *         WHERE
 *             users.id = sessions.student_id) AS students ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             first_name,
 *             id,
 *             email,
 *             banned,
 *             test_user
 *         FROM
 *             users
 *         WHERE
 *             users.id = sessions.volunteer_id) AS volunteers ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(*)::int AS total
 *         FROM
 *             session_messages
 *         WHERE
 *             session_messages.session_id = sessions.id) AS message_count ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             session_reports
 *         WHERE
 *             sessions.id = session_reports.session_id) AS session_reported_count ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             sessions
 *         WHERE
 *             sessions.student_id = students.id) AS student_sessions ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(id)::int AS total
 *         FROM
 *             sessions
 *         WHERE
 *             sessions.volunteer_id = volunteers.id) AS volunteer_sessions ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             MAX(created_at) AS last_banned_at
 *         FROM
 *             user_actions
 *         WHERE
 *             user_actions.user_id = sessions.student_id
 *             AND user_actions.action = 'BANNED') AS student_banned ON TRUE
 * WHERE
 *     NOT sessions.ended_at IS NULL
 *     AND sessions.created_at >= :start!
 *     AND sessions.created_at <= :end!
 *     AND ((:messageCount)::int IS NULL
 *         OR message_count.total >= (:messageCount)::int)
 *     AND ((:sessionLength)::int IS NULL
 *         OR (EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) / 60) > (:sessionLength)::int)
 *     AND ((:reported)::boolean IS NULL
 *         OR (:reported)::boolean IS FALSE
 *         OR session_reported_count.total > 0)
 *     AND (student_banned.last_banned_at IS NULL
 *         OR sessions.created_at < student_banned.last_banned_at
 *         OR sessions.student_banned IS FALSE
 *         OR (:showBannedUsers)::boolean IS TRUE)
 *     AND ((:showTestUsers)::boolean IS NULL
 *         OR (:showTestUsers)::boolean IS TRUE
 *         OR students.test_user IS FALSE)
 *     AND ((:firstTimeStudent)::boolean IS NULL
 *         OR (:firstTimeStudent)::boolean IS FALSE
 *         OR student_sessions.total = 1)
 *     AND ((:firstTimeVolunteer)::boolean IS NULL
 *         OR (:firstTimeVolunteer)::boolean IS FALSE
 *         OR volunteer_sessions.total = 1)
 * ORDER BY
 *     (sessions.created_at) DESC
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
exports.getSessionsForAdminFilter = new query_1.PreparedQuery(getSessionsForAdminFilterIR);
const insertSessionReviewReasonIR = { "name": "insertSessionReviewReason", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26526, "b": 26535, "line": 951, "col": 9 }] } }, { "name": "flag", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26664, "b": 26668, "line": 958, "col": 30 }, { "a": 26953, "b": 26957, "line": 975, "col": 26 }] } }], "usedParamSet": { "sessionId": true, "flag": true }, "statement": { "body": "WITH ins AS (\nINSERT INTO session_review_reasons (session_id, session_flag_id, created_at, updated_at)\n    SELECT\n        :sessionId!,\n        session_flags.id,\n        NOW(),\n        NOW()\n    FROM\n        session_flags\n    WHERE\n        session_flags.name = :flag!\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        session_id AS ok\n)\nSELECT\n    *\nFROM\n    ins\nUNION\nSELECT\n    session_id\nFROM\n    session_review_reasons\n    LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\nWHERE\n    session_flags.name = :flag!", "loc": { "a": 26403, "b": 26957, "line": 948, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * WITH ins AS (
 * INSERT INTO session_review_reasons (session_id, session_flag_id, created_at, updated_at)
 *     SELECT
 *         :sessionId!,
 *         session_flags.id,
 *         NOW(),
 *         NOW()
 *     FROM
 *         session_flags
 *     WHERE
 *         session_flags.name = :flag!
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         session_id AS ok
 * )
 * SELECT
 *     *
 * FROM
 *     ins
 * UNION
 * SELECT
 *     session_id
 * FROM
 *     session_review_reasons
 *     LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id
 * WHERE
 *     session_flags.name = :flag!
 * ```
 */
exports.insertSessionReviewReason = new query_1.PreparedQuery(insertSessionReviewReasonIR);
const insertSessionFailedJoinIR = { "name": "insertSessionFailedJoin", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27090, "b": 27099, "line": 980, "col": 13 }] } }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27103, "b": 27109, "line": 980, "col": 26 }] } }], "usedParamSet": { "sessionId": true, "userId": true }, "statement": { "body": "INSERT INTO session_failed_joins (session_id, user_id, created_at, updated_at)\n    VALUES (:sessionId!, :userId!, NOW(), NOW())\nRETURNING\n    session_id AS ok", "loc": { "a": 26998, "b": 27155, "line": 979, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_failed_joins (session_id, user_id, created_at, updated_at)
 *     VALUES (:sessionId!, :userId!, NOW(), NOW())
 * RETURNING
 *     session_id AS ok
 * ```
 */
exports.insertSessionFailedJoin = new query_1.PreparedQuery(insertSessionFailedJoinIR);
const insertSessionPhotoKeyIR = { "name": "insertSessionPhotoKey", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27282, "b": 27291, "line": 987, "col": 13 }] } }, { "name": "photoKey", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27295, "b": 27303, "line": 987, "col": 26 }] } }], "usedParamSet": { "sessionId": true, "photoKey": true }, "statement": { "body": "INSERT INTO session_photos (session_id, photo_key, created_at, updated_at)\n    VALUES (:sessionId!, :photoKey!, NOW(), NOW())\nRETURNING\n    session_id AS ok", "loc": { "a": 27194, "b": 27349, "line": 986, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_photos (session_id, photo_key, created_at, updated_at)
 *     VALUES (:sessionId!, :photoKey!, NOW(), NOW())
 * RETURNING
 *     session_id AS ok
 * ```
 */
exports.insertSessionPhotoKey = new query_1.PreparedQuery(insertSessionPhotoKeyIR);
const getSessionsForVolunteerHourSummaryIR = { "name": "getSessionsForVolunteerHourSummary", "params": [{ "name": "start", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27878, "b": 27883, "line": 1007, "col": 28 }] } }, { "name": "end", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27917, "b": 27920, "line": 1008, "col": 32 }] } }, { "name": "volunteerId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27993, "b": 28004, "line": 1010, "col": 33 }] } }], "usedParamSet": { "start": true, "end": true, "volunteerId": true }, "statement": { "body": "SELECT\n    sessions.id AS session_id,\n    sessions.created_at AS created_at,\n    sessions.ended_at AS ended_at,\n    sessions.time_tutored::int AS time_tutored,\n    subjects.name AS subject,\n    topics.name AS topic,\n    sessions.volunteer_joined_at AS volunteer_joined_at\nFROM\n    sessions\n    JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN topics ON topics.id = subjects.topic_id\n    JOIN users ON users.id = sessions.student_id\nWHERE\n    sessions.created_at >= :start!\n    AND sessions.created_at <= :end!\n    AND sessions.ended_at IS NOT NULL\n    AND sessions.volunteer_id = :volunteerId!\n    AND users.test_user = FALSE", "loc": { "a": 27401, "b": 28036, "line": 993, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id AS session_id,
 *     sessions.created_at AS created_at,
 *     sessions.ended_at AS ended_at,
 *     sessions.time_tutored::int AS time_tutored,
 *     subjects.name AS subject,
 *     topics.name AS topic,
 *     sessions.volunteer_joined_at AS volunteer_joined_at
 * FROM
 *     sessions
 *     JOIN subjects ON subjects.id = sessions.subject_id
 *     JOIN topics ON topics.id = subjects.topic_id
 *     JOIN users ON users.id = sessions.student_id
 * WHERE
 *     sessions.created_at >= :start!
 *     AND sessions.created_at <= :end!
 *     AND sessions.ended_at IS NOT NULL
 *     AND sessions.volunteer_id = :volunteerId!
 *     AND users.test_user = FALSE
 * ```
 */
exports.getSessionsForVolunteerHourSummary = new query_1.PreparedQuery(getSessionsForVolunteerHourSummaryIR);
const getSessionHistoryIR = { "name": "getSessionHistory", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 29175, "b": 29181, "line": 1041, "col": 26 }, { "a": 29211, "b": 29217, "line": 1042, "col": 28 }] } }, { "name": "minSessionLength", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 29373, "b": 29389, "line": 1046, "col": 33 }] } }, { "name": "limit", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 29570, "b": 29575, "line": 1058, "col": 8 }] } }, { "name": "offset", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 29592, "b": 29598, "line": 1058, "col": 30 }] } }], "usedParamSet": { "userId": true, "minSessionLength": true, "limit": true, "offset": true }, "statement": { "body": "WITH results AS (\n    SELECT DISTINCT ON (sessions.id)\n        sessions.id,\n        sessions.created_at AS created_at,\n        sessions.time_tutored::int AS time_tutored,\n        subjects.display_name AS subject,\n        topics.name AS topic,\n        topics.icon_link AS topic_icon_link,\n        volunteers.first_name AS volunteer_first_name,\n        volunteers.id AS volunteer_id,\n        students.id AS student_id,\n        students.first_name AS student_first_name,\n        (\n            CASE WHEN favorited.volunteer_id = sessions.volunteer_id THEN\n                TRUE\n            ELSE\n                FALSE\n            END) AS is_favorited\n    FROM\n        sessions\n        JOIN subjects ON subjects.id = sessions.subject_id\n        JOIN topics ON topics.id = subjects.topic_id\n        LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id\n        LEFT JOIN users students ON sessions.student_id = students.id\n        LEFT JOIN student_favorite_volunteers favorited ON students.id = favorited.student_id\n            AND volunteers.id = favorited.volunteer_id\n    WHERE (students.id = :userId!\n        OR volunteers.id = :userId!)\n    AND sessions.created_at BETWEEN (NOW() - INTERVAL '1 YEAR')\n    AND NOW()\n    AND sessions.time_tutored IS NOT NULL\n    AND sessions.time_tutored > :minSessionLength!::int\n    AND sessions.volunteer_id IS NOT NULL\n    AND sessions.ended_at IS NOT NULL\nORDER BY\n    sessions.id\n)\nSELECT\n    *\nFROM\n    results\nORDER BY\n    created_at DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int", "loc": { "a": 28071, "b": 29604, "line": 1015, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * WITH results AS (
 *     SELECT DISTINCT ON (sessions.id)
 *         sessions.id,
 *         sessions.created_at AS created_at,
 *         sessions.time_tutored::int AS time_tutored,
 *         subjects.display_name AS subject,
 *         topics.name AS topic,
 *         topics.icon_link AS topic_icon_link,
 *         volunteers.first_name AS volunteer_first_name,
 *         volunteers.id AS volunteer_id,
 *         students.id AS student_id,
 *         students.first_name AS student_first_name,
 *         (
 *             CASE WHEN favorited.volunteer_id = sessions.volunteer_id THEN
 *                 TRUE
 *             ELSE
 *                 FALSE
 *             END) AS is_favorited
 *     FROM
 *         sessions
 *         JOIN subjects ON subjects.id = sessions.subject_id
 *         JOIN topics ON topics.id = subjects.topic_id
 *         LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id
 *         LEFT JOIN users students ON sessions.student_id = students.id
 *         LEFT JOIN student_favorite_volunteers favorited ON students.id = favorited.student_id
 *             AND volunteers.id = favorited.volunteer_id
 *     WHERE (students.id = :userId!
 *         OR volunteers.id = :userId!)
 *     AND sessions.created_at BETWEEN (NOW() - INTERVAL '1 YEAR')
 *     AND NOW()
 *     AND sessions.time_tutored IS NOT NULL
 *     AND sessions.time_tutored > :minSessionLength!::int
 *     AND sessions.volunteer_id IS NOT NULL
 *     AND sessions.ended_at IS NOT NULL
 * ORDER BY
 *     sessions.id
 * )
 * SELECT
 *     *
 * FROM
 *     results
 * ORDER BY
 *     created_at DESC
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
exports.getSessionHistory = new query_1.PreparedQuery(getSessionHistoryIR);
const isEligibleForSessionRecapIR = { "name": "isEligibleForSessionRecap", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 29799, "b": 29808, "line": 1071, "col": 19 }] } }, { "name": "minSessionLength", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 29885, "b": 29901, "line": 1073, "col": 33 }] } }], "usedParamSet": { "sessionId": true, "minSessionLength": true }, "statement": { "body": "SELECT\n    CASE WHEN sessions.id IS NOT NULL THEN\n        TRUE\n    ELSE\n        FALSE\n    END AS is_eligible\nFROM\n    sessions\nWHERE\n    sessions.id = :sessionId!\n    AND sessions.time_tutored IS NOT NULL\n    AND sessions.time_tutored > :minSessionLength!::int\n    AND sessions.volunteer_id IS NOT NULL\n    AND sessions.ended_at IS NOT NULL", "loc": { "a": 29647, "b": 29986, "line": 1062, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     CASE WHEN sessions.id IS NOT NULL THEN
 *         TRUE
 *     ELSE
 *         FALSE
 *     END AS is_eligible
 * FROM
 *     sessions
 * WHERE
 *     sessions.id = :sessionId!
 *     AND sessions.time_tutored IS NOT NULL
 *     AND sessions.time_tutored > :minSessionLength!::int
 *     AND sessions.volunteer_id IS NOT NULL
 *     AND sessions.ended_at IS NOT NULL
 * ```
 */
exports.isEligibleForSessionRecap = new query_1.PreparedQuery(isEligibleForSessionRecapIR);
const getSessionHistoryIdsByUserIdIR = { "name": "getSessionHistoryIdsByUserId", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 30337, "b": 30343, "line": 1087, "col": 22 }, { "a": 30369, "b": 30375, "line": 1088, "col": 24 }] } }, { "name": "minSessionLength", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 30515, "b": 30531, "line": 1092, "col": 29 }] } }], "usedParamSet": { "userId": true, "minSessionLength": true }, "statement": { "body": "SELECT\n    sessions.id\nFROM\n    sessions\n    JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id\n    LEFT JOIN users students ON sessions.student_id = students.id\nWHERE (students.id = :userId!\n    OR volunteers.id = :userId!)\nAND sessions.created_at BETWEEN (NOW() - INTERVAL '1 YEAR')\nAND NOW()\nAND sessions.time_tutored IS NOT NULL\nAND sessions.time_tutored > :minSessionLength!::int\nAND sessions.volunteer_id IS NOT NULL\nAND sessions.ended_at IS NOT NULL\nORDER BY\n    sessions.created_at DESC", "loc": { "a": 30032, "b": 30646, "line": 1079, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id
 * FROM
 *     sessions
 *     JOIN subjects ON subjects.id = sessions.subject_id
 *     JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id
 *     LEFT JOIN users students ON sessions.student_id = students.id
 * WHERE (students.id = :userId!
 *     OR volunteers.id = :userId!)
 * AND sessions.created_at BETWEEN (NOW() - INTERVAL '1 YEAR')
 * AND NOW()
 * AND sessions.time_tutored IS NOT NULL
 * AND sessions.time_tutored > :minSessionLength!::int
 * AND sessions.volunteer_id IS NOT NULL
 * AND sessions.ended_at IS NOT NULL
 * ORDER BY
 *     sessions.created_at DESC
 * ```
 */
exports.getSessionHistoryIdsByUserId = new query_1.PreparedQuery(getSessionHistoryIdsByUserIdIR);
const getTotalSessionHistoryIR = { "name": "getTotalSessionHistory", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 30898, "b": 30904, "line": 1106, "col": 22 }, { "a": 30930, "b": 30936, "line": 1107, "col": 24 }] } }, { "name": "minSessionLength", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 31076, "b": 31092, "line": 1111, "col": 29 }] } }], "usedParamSet": { "userId": true, "minSessionLength": true }, "statement": { "body": "SELECT\n    count(*)::int AS total\nFROM\n    sessions\n    LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id\n    LEFT JOIN users students ON sessions.student_id = students.id\nWHERE (students.id = :userId!\n    OR volunteers.id = :userId!)\nAND sessions.created_at BETWEEN (NOW() - INTERVAL '1 YEAR')\nAND NOW()\nAND sessions.time_tutored IS NOT NULL\nAND sessions.time_tutored > :minSessionLength!::int\nAND sessions.volunteer_id IS NOT NULL", "loc": { "a": 30686, "b": 31135, "line": 1100, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     count(*)::int AS total
 * FROM
 *     sessions
 *     LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id
 *     LEFT JOIN users students ON sessions.student_id = students.id
 * WHERE (students.id = :userId!
 *     OR volunteers.id = :userId!)
 * AND sessions.created_at BETWEEN (NOW() - INTERVAL '1 YEAR')
 * AND NOW()
 * AND sessions.time_tutored IS NOT NULL
 * AND sessions.time_tutored > :minSessionLength!::int
 * AND sessions.volunteer_id IS NOT NULL
 * ```
 */
exports.getTotalSessionHistory = new query_1.PreparedQuery(getTotalSessionHistoryIR);
const getSessionRecapIR = { "name": "getSessionRecap", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 32211, "b": 32220, "line": 1146, "col": 19 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    sessions.id,\n    sessions.created_at,\n    sessions.ended_at,\n    sessions.time_tutored::int,\n    subjects.display_name AS subject,\n    subjects.name AS subject_key,\n    topics.name AS topic,\n    topics.icon_link AS topic_icon_link,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.id AS volunteer_id,\n    students.id AS student_id,\n    students.first_name AS student_first_name,\n    (\n        CASE WHEN favorited.volunteer_id = sessions.volunteer_id THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_favorited,\n    sessions.quill_doc,\n    sessions.has_whiteboard_doc\nFROM\n    sessions\n    JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id\n    LEFT JOIN users students ON sessions.student_id = students.id\n    LEFT JOIN student_favorite_volunteers favorited ON students.id = favorited.student_id\n        AND volunteers.id = favorited.volunteer_id\nWHERE\n    sessions.id = :sessionId!", "loc": { "a": 31168, "b": 32220, "line": 1116, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     sessions.created_at,
 *     sessions.ended_at,
 *     sessions.time_tutored::int,
 *     subjects.display_name AS subject,
 *     subjects.name AS subject_key,
 *     topics.name AS topic,
 *     topics.icon_link AS topic_icon_link,
 *     volunteers.first_name AS volunteer_first_name,
 *     volunteers.id AS volunteer_id,
 *     students.id AS student_id,
 *     students.first_name AS student_first_name,
 *     (
 *         CASE WHEN favorited.volunteer_id = sessions.volunteer_id THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_favorited,
 *     sessions.quill_doc,
 *     sessions.has_whiteboard_doc
 * FROM
 *     sessions
 *     JOIN subjects ON subjects.id = sessions.subject_id
 *     JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id
 *     LEFT JOIN users students ON sessions.student_id = students.id
 *     LEFT JOIN student_favorite_volunteers favorited ON students.id = favorited.student_id
 *         AND volunteers.id = favorited.volunteer_id
 * WHERE
 *     sessions.id = :sessionId!
 * ```
 */
exports.getSessionRecap = new query_1.PreparedQuery(getSessionRecapIR);
const volunteerSentMessageAfterSessionEndedIR = { "name": "volunteerSentMessageAfterSessionEnded", "params": [{ "name": "sessionId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 32420, "b": 32428, "line": 1156, "col": 19 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    session_messages.id\nFROM\n    sessions\n    JOIN session_messages ON sessions.id = session_messages.session_id\nWHERE\n    sessions.id = :sessionId\n    AND session_messages.sender_id = sessions.volunteer_id\n    AND session_messages.created_at > sessions.ended_at\nLIMIT 1", "loc": { "a": 32275, "b": 32551, "line": 1150, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     session_messages.id
 * FROM
 *     sessions
 *     JOIN session_messages ON sessions.id = session_messages.session_id
 * WHERE
 *     sessions.id = :sessionId
 *     AND session_messages.sender_id = sessions.volunteer_id
 *     AND session_messages.created_at > sessions.ended_at
 * LIMIT 1
 * ```
 */
exports.volunteerSentMessageAfterSessionEnded = new query_1.PreparedQuery(volunteerSentMessageAfterSessionEndedIR);
const sessionHasBannedParticipantIR = { "name": "sessionHasBannedParticipant", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 32963, "b": 32972, "line": 1172, "col": 19 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    sessions.id\nFROM\n    sessions\n    JOIN student_profiles ON student_profiles.user_id = sessions.student_id\n    JOIN users students ON student_profiles.user_id = students.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = sessions.volunteer_id\n    JOIN users volunteers ON volunteer_profiles.user_id = volunteers.id\nWHERE\n    sessions.id = :sessionId!\n    AND (students.banned IS TRUE\n        OR volunteers.banned IS TRUE)\nLIMIT 1", "loc": { "a": 32596, "b": 33051, "line": 1163, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id
 * FROM
 *     sessions
 *     JOIN student_profiles ON student_profiles.user_id = sessions.student_id
 *     JOIN users students ON student_profiles.user_id = students.id
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = sessions.volunteer_id
 *     JOIN users volunteers ON volunteer_profiles.user_id = volunteers.id
 * WHERE
 *     sessions.id = :sessionId!
 *     AND (students.banned IS TRUE
 *         OR volunteers.banned IS TRUE)
 * LIMIT 1
 * ```
 */
exports.sessionHasBannedParticipant = new query_1.PreparedQuery(sessionHasBannedParticipantIR);
const getUserSessionsByUserIdIR = { "name": "getUserSessionsByUserId", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 33425, "b": 33431, "line": 1191, "col": 30 }, { "a": 33465, "b": 33471, "line": 1192, "col": 32 }] } }, { "name": "start", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 33481, "b": 33485, "line": 1193, "col": 7 }, { "a": 33534, "b": 33538, "line": 1194, "col": 32 }] } }, { "name": "end", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 33555, "b": 33557, "line": 1195, "col": 7 }, { "a": 33606, "b": 33608, "line": 1196, "col": 32 }] } }, { "name": "subject", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 33625, "b": 33631, "line": 1197, "col": 7 }, { "a": 33673, "b": 33680, "line": 1198, "col": 25 }] } }, { "name": "sessionId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 33696, "b": 33704, "line": 1199, "col": 6 }, { "a": 33742, "b": 33750, "line": 1200, "col": 22 }] } }, { "name": "topic", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 33766, "b": 33770, "line": 1201, "col": 7 }, { "a": 33810, "b": 33814, "line": 1202, "col": 23 }] } }], "usedParamSet": { "userId": true, "start": true, "end": true, "subject": true, "sessionId": true, "topic": true }, "statement": { "body": "SELECT\n    sessions.id,\n    sessions.created_at,\n    subjects.name AS subject_name,\n    topics.name AS topic_name,\n    quill_doc,\n    sessions.student_id,\n    sessions.volunteer_id\nFROM\n    sessions\n    JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN topics ON topics.id = subjects.topic_id\nWHERE (sessions.student_id = :userId!\n    OR sessions.volunteer_id = :userId!)\nAND ((:start)::date IS NULL\n    OR sessions.created_at >= (:start)::date)\nAND ((:end)::date IS NULL\n    OR sessions.created_at <= (:end)::date)\nAND ((:subject)::text IS NULL\n    OR subjects.name = (:subject!)::text)\nAND (:sessionId::uuid IS NULL\n    OR sessions.id = :sessionId::uuid)\nAND ((:topic)::text IS NULL\n    OR topics.name = (:topic)::text)\nORDER BY\n    sessions.created_at DESC", "loc": { "a": 33092, "b": 33860, "line": 1179, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     sessions.created_at,
 *     subjects.name AS subject_name,
 *     topics.name AS topic_name,
 *     quill_doc,
 *     sessions.student_id,
 *     sessions.volunteer_id
 * FROM
 *     sessions
 *     JOIN subjects ON subjects.id = sessions.subject_id
 *     JOIN topics ON topics.id = subjects.topic_id
 * WHERE (sessions.student_id = :userId!
 *     OR sessions.volunteer_id = :userId!)
 * AND ((:start)::date IS NULL
 *     OR sessions.created_at >= (:start)::date)
 * AND ((:end)::date IS NULL
 *     OR sessions.created_at <= (:end)::date)
 * AND ((:subject)::text IS NULL
 *     OR subjects.name = (:subject!)::text)
 * AND (:sessionId::uuid IS NULL
 *     OR sessions.id = :sessionId::uuid)
 * AND ((:topic)::text IS NULL
 *     OR topics.name = (:topic)::text)
 * ORDER BY
 *     sessions.created_at DESC
 * ```
 */
exports.getUserSessionsByUserId = new query_1.PreparedQuery(getUserSessionsByUserIdIR);
const getUserSessionStatsIR = { "name": "getUserSessionStats", "params": [{ "name": "minSessionLength", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 34071, "b": 34087, "line": 1213, "col": 44 }] } }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 34337, "b": 34343, "line": 1222, "col": 36 }, { "a": 34385, "b": 34391, "line": 1223, "col": 40 }] } }], "usedParamSet": { "minSessionLength": true, "userId": true }, "statement": { "body": "SELECT\n    subjects.name AS subject_name,\n    topics.name AS topic_name,\n    COUNT(sessions.id)::int AS total_requested,\n    SUM(\n        CASE WHEN sessions.time_tutored >= :minSessionLength!::int THEN\n            1\n        ELSE\n            0\n        END)::int AS total_helped\nFROM\n    subjects\n    JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN sessions ON subjects.id = sessions.subject_id\n        AND (sessions.student_id = :userId!\n            OR sessions.volunteer_id = :userId!)\nWHERE\n    subjects.active IS TRUE\nGROUP BY\n    subjects.name,\n    topics.name", "loc": { "a": 33897, "b": 34470, "line": 1208, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     subjects.name AS subject_name,
 *     topics.name AS topic_name,
 *     COUNT(sessions.id)::int AS total_requested,
 *     SUM(
 *         CASE WHEN sessions.time_tutored >= :minSessionLength!::int THEN
 *             1
 *         ELSE
 *             0
 *         END)::int AS total_helped
 * FROM
 *     subjects
 *     JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN sessions ON subjects.id = sessions.subject_id
 *         AND (sessions.student_id = :userId!
 *             OR sessions.volunteer_id = :userId!)
 * WHERE
 *     subjects.active IS TRUE
 * GROUP BY
 *     subjects.name,
 *     topics.name
 * ```
 */
exports.getUserSessionStats = new query_1.PreparedQuery(getUserSessionStatsIR);
