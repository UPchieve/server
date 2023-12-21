/** Types generated for queries found in "server/models/Session/session.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type stringArray = (string)[];

/** 'AddNotification' parameters type */
export interface IAddNotificationParams {
  id: string;
  method: string;
  priorityGroup: string;
  sessionId: string;
  type: string;
  volunteer: string;
  wasSuccessful: boolean;
}

/** 'AddNotification' return type */
export interface IAddNotificationResult {
  ok: string;
}

/** 'AddNotification' query type */
export interface IAddNotificationQuery {
  params: IAddNotificationParams;
  result: IAddNotificationResult;
}

const addNotificationIR: any = {"name":"addNotification","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":178,"b":180,"line":6,"col":5}]}},{"name":"volunteer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":188,"b":197,"line":7,"col":5}]}},{"name":"wasSuccessful","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":309,"b":322,"line":12,"col":5}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":330,"b":339,"line":13,"col":5}]}},{"name":"type","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":512,"b":516,"line":21,"col":31}]}},{"name":"method","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":557,"b":563,"line":22,"col":39}]}},{"name":"priorityGroup","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":610,"b":623,"line":23,"col":45}]}}],"usedParamSet":{"id":true,"volunteer":true,"wasSuccessful":true,"sessionId":true,"type":true,"method":true,"priorityGroup":true},"statement":{"body":"INSERT INTO notifications (id, user_id, sent_at, type_id, method_id, priority_group_id, successful, session_id, created_at, updated_at)\nSELECT\n    :id!,\n    :volunteer!,\n    NOW(),\n    notification_types.id,\n    notification_methods.id,\n    notification_priority_groups.id,\n    :wasSuccessful!,\n    :sessionId!,\n    NOW(),\n    NOW()\nFROM\n    notification_types\n    JOIN notification_methods ON TRUE\n    JOIN notification_priority_groups ON TRUE\nWHERE\n    notification_types.type = :type!\n    AND notification_methods.method = :method!\n    AND notification_priority_groups.name = :priorityGroup!\nRETURNING\n    id AS ok","loc":{"a":30,"b":646,"line":4,"col":0}}};

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
export const addNotification = new PreparedQuery<IAddNotificationParams,IAddNotificationResult>(addNotificationIR);


/** 'GetUnfilledSessions' parameters type */
export interface IGetUnfilledSessionsParams {
  start: Date;
}

/** 'GetUnfilledSessions' return type */
export interface IGetUnfilledSessionsResult {
  createdAt: Date;
  id: string;
  isFirstTimeStudent: boolean | null;
  studentFirstName: string;
  studentTestUser: boolean;
  subjectDisplayName: string;
  subTopic: string;
  type: string;
  volunteer: string | null;
}

/** 'GetUnfilledSessions' query type */
export interface IGetUnfilledSessionsQuery {
  params: IGetUnfilledSessionsParams;
  result: IGetUnfilledSessionsResult;
}

const getUnfilledSessionsIR: any = {"name":"getUnfilledSessions","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1477,"b":1482,"line":54,"col":31}]}}],"usedParamSet":{"start":true},"statement":{"body":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.volunteer_id AS volunteer,\n    sessions.created_at,\n    users.first_name AS student_first_name,\n    users.test_user AS student_test_user,\n    session_count.total = 1 AS is_first_time_student,\n    subjects.display_name AS subject_display_name\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    JOIN LATERAL (\n        SELECT\n            COUNT(*) AS total\n        FROM\n            sessions\n        WHERE\n            student_id = users.id) AS session_count ON TRUE\nWHERE\n    sessions.volunteer_id IS NULL\n    AND sessions.ended_at IS NULL\n    AND sessions.created_at > :start!\n    AND users.banned IS FALSE\nORDER BY\n    sessions.created_at","loc":{"a":683,"b":1545,"line":29,"col":0}}};

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
 *     session_count.total = 1 AS is_first_time_student,
 *     subjects.display_name AS subject_display_name
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
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
export const getUnfilledSessions = new PreparedQuery<IGetUnfilledSessionsParams,IGetUnfilledSessionsResult>(getUnfilledSessionsIR);


/** 'GetSessionById' parameters type */
export interface IGetSessionByIdParams {
  sessionId: string;
}

/** 'GetSessionById' return type */
export interface IGetSessionByIdResult {
  createdAt: Date;
  endedAt: Date | null;
  endedByRole: string;
  flags: stringArray | null;
  hasWhiteboardDoc: boolean;
  id: string;
  quillDoc: string | null;
  reported: boolean | null;
  reviewed: boolean;
  studentBanned: boolean | null;
  studentId: string;
  subject: string;
  subjectDisplayName: string;
  timeTutored: number | null;
  toolType: string;
  topic: string;
  toReview: boolean;
  updatedAt: Date;
  volunteerId: string | null;
  volunteerJoinedAt: Date | null;
}

/** 'GetSessionById' query type */
export interface IGetSessionByIdQuery {
  params: IGetSessionByIdParams;
  result: IGetSessionByIdResult;
}

const getSessionByIdIR: any = {"name":"getSessionById","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3040,"b":3049,"line":105,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    student_id,\n    volunteer_id,\n    subjects.name AS subject,\n    subjects.display_name AS subject_display_name,\n    topics.name AS topic,\n    has_whiteboard_doc,\n    quill_doc,\n    volunteer_joined_at,\n    ended_at,\n    user_roles.name AS ended_by_role,\n    reviewed,\n    to_review,\n    student_banned,\n    (time_tutored)::float,\n    sessions.created_at,\n    sessions.updated_at,\n    session_reported_count.total <> 0 AS reported,\n    COALESCE(session_flag_array.flags, ARRAY[]::text[]) AS flags,\n    tool_types.name AS tool_type\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id\n    LEFT JOIN session_reports ON session_reports.session_id = sessions.id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(name) AS flags\n        FROM\n            sessions_session_flags\n            LEFT JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id\n        WHERE\n            sessions_session_flags.session_id = sessions.id) AS session_flag_array ON TRUE\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\nWHERE\n    sessions.id = :sessionId!","loc":{"a":1577,"b":3049,"line":61,"col":0}}};

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
export const getSessionById = new PreparedQuery<IGetSessionByIdParams,IGetSessionByIdResult>(getSessionByIdIR);


/** 'InsertSessionFlagById' parameters type */
export interface IInsertSessionFlagByIdParams {
  flag: string;
  sessionId: string;
}

/** 'InsertSessionFlagById' return type */
export interface IInsertSessionFlagByIdResult {
  ok: string;
}

/** 'InsertSessionFlagById' query type */
export interface IInsertSessionFlagByIdQuery {
  params: IInsertSessionFlagByIdParams;
  result: IInsertSessionFlagByIdResult;
}

const insertSessionFlagByIdIR: any = {"name":"insertSessionFlagById","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3189,"b":3198,"line":111,"col":5}]}},{"name":"flag","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3285,"b":3289,"line":118,"col":12}]}}],"usedParamSet":{"sessionId":true,"flag":true},"statement":{"body":"INSERT INTO sessions_session_flags (session_id, session_flag_id, created_at, updated_at)\nSELECT\n    :sessionId!,\n    session_flags.id,\n    NOW(),\n    NOW()\nFROM\n    session_flags\nWHERE\n    name = :flag!\nON CONFLICT (session_id,\n    session_flag_id)\n    DO UPDATE SET\n        updated_at = NOW()\n    RETURNING\n        session_id AS ok","loc":{"a":3088,"b":3419,"line":109,"col":0}}};

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
export const insertSessionFlagById = new PreparedQuery<IInsertSessionFlagByIdParams,IInsertSessionFlagByIdResult>(insertSessionFlagByIdIR);


/** 'UpdateSessionToReview' parameters type */
export interface IUpdateSessionToReviewParams {
  reviewed: boolean | null | void;
  sessionId: string;
}

/** 'UpdateSessionToReview' return type */
export interface IUpdateSessionToReviewResult {
  ok: string;
}

/** 'UpdateSessionToReview' query type */
export interface IUpdateSessionToReviewQuery {
  params: IUpdateSessionToReviewParams;
  result: IUpdateSessionToReviewResult;
}

const updateSessionToReviewIR: any = {"name":"updateSessionToReview","params":[{"name":"reviewed","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3529,"b":3536,"line":132,"col":25}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3565,"b":3574,"line":134,"col":10}]}}],"usedParamSet":{"reviewed":true,"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    to_review = TRUE,\n    reviewed = COALESCE(:reviewed, reviewed)\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":3458,"b":3597,"line":128,"col":0}}};

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
export const updateSessionToReview = new PreparedQuery<IUpdateSessionToReviewParams,IUpdateSessionToReviewResult>(updateSessionToReviewIR);


/** 'UpdateSessionReviewedStatusById' parameters type */
export interface IUpdateSessionReviewedStatusByIdParams {
  reviewed: boolean;
  sessionId: string;
  toReview: boolean;
}

/** 'UpdateSessionReviewedStatusById' return type */
export interface IUpdateSessionReviewedStatusByIdResult {
  ok: string;
}

/** 'UpdateSessionReviewedStatusById' query type */
export interface IUpdateSessionReviewedStatusByIdQuery {
  params: IUpdateSessionReviewedStatusByIdParams;
  result: IUpdateSessionReviewedStatusByIdResult;
}

const updateSessionReviewedStatusByIdIR: any = {"name":"updateSessionReviewedStatusById","params":[{"name":"reviewed","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3686,"b":3694,"line":143,"col":16}]}},{"name":"toReview","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3714,"b":3722,"line":144,"col":17}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3764,"b":3773,"line":147,"col":10}]}}],"usedParamSet":{"reviewed":true,"toReview":true,"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    reviewed = :reviewed!,\n    to_review = :toReview!,\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":3646,"b":3796,"line":140,"col":0}}};

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
export const updateSessionReviewedStatusById = new PreparedQuery<IUpdateSessionReviewedStatusByIdParams,IUpdateSessionReviewedStatusByIdResult>(updateSessionReviewedStatusByIdIR);


/** 'GetSessionToEndById' parameters type */
export interface IGetSessionToEndByIdParams {
  sessionId: string;
}

/** 'GetSessionToEndById' return type */
export interface IGetSessionToEndByIdResult {
  createdAt: Date;
  endedAt: Date | null;
  id: string;
  reported: boolean | null;
  studentEmail: string;
  studentFirstName: string;
  studentId: string;
  studentNumPastSessions: number | null;
  subject: string;
  topic: string;
  updatedAt: Date;
  volunteerEmail: string;
  volunteerFirstName: string;
  volunteerId: string | null;
  volunteerJoinedAt: Date | null;
  volunteerNumPastSessions: number | null;
  volunteerPartnerOrg: string;
}

/** 'GetSessionToEndById' query type */
export interface IGetSessionToEndByIdQuery {
  params: IGetSessionToEndByIdParams;
  result: IGetSessionToEndByIdResult;
}

const getSessionToEndByIdIR: any = {"name":"getSessionToEndById","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5543,"b":5552,"line":201,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    student_id,\n    volunteer_id,\n    subjects.name AS subject,\n    topics.name AS topic,\n    volunteer_joined_at,\n    ended_at,\n    sessions.created_at,\n    sessions.updated_at,\n    students.first_name AS student_first_name,\n    students.email AS student_email,\n    student_sessions.total AS student_num_past_sessions,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.email AS volunteer_email,\n    volunteer_sessions.total AS volunteer_num_past_sessions,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    session_reported_count.total <> 0 AS reported\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users students ON students.id = sessions.student_id\n    LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.student_id = students.id) AS student_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = volunteers.id) AS volunteer_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = volunteers.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    sessions.id = :sessionId!","loc":{"a":3833,"b":5552,"line":153,"col":0}}};

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
export const getSessionToEndById = new PreparedQuery<IGetSessionToEndByIdParams,IGetSessionToEndByIdResult>(getSessionToEndByIdIR);


/** 'GetSessionsToReview' parameters type */
export interface IGetSessionsToReviewParams {
  limit: number;
  offset: number;
  withStudentFirstName: string | null | void;
}

/** 'GetSessionsToReview' return type */
export interface IGetSessionsToReviewResult {
  createdAt: Date;
  endedAt: Date | null;
  flags: stringArray | null;
  id: string;
  isReported: boolean | null;
  reviewReasons: stringArray | null;
  studentCounselingFeedback: Json | null;
  studentFirstName: string;
  subTopic: string;
  toReview: boolean;
  totalMessages: number | null;
  type: string;
  volunteer: string | null;
}

/** 'GetSessionsToReview' query type */
export interface IGetSessionsToReviewQuery {
  params: IGetSessionsToReviewParams;
  result: IGetSessionsToReviewResult;
}

const getSessionsToReviewIR: any = {"name":"getSessionsToReview","params":[{"name":"withStudentFirstName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7626,"b":7645,"line":261,"col":61}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7723,"b":7728,"line":264,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7745,"b":7751,"line":264,"col":30}]}}],"usedParamSet":{"withStudentFirstName":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    sessions.id,\n    sessions.ended_at,\n    sessions.created_at,\n    sessions.volunteer_id AS volunteer,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    students.first_name AS student_first_name,\n    session_reported_count.total <> 0 AS is_reported,\n    flags.flags,\n    messages.total AS total_messages,\n    session_review_reason.review_reasons,\n    sessions.to_review,\n    student_feedback.student_counseling_feedback\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users students ON students.id = sessions.student_id\n    LEFT JOIN feedbacks student_feedback ON (student_feedback.session_id = sessions.id\n            AND student_feedback.user_id = sessions.student_id)\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS flags\n        FROM\n            sessions_session_flags\n            JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id\n        WHERE\n            session_id = sessions.id\n        GROUP BY\n            session_id) AS flags ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_messages\n        WHERE\n            session_messages.session_id = sessions.id) AS messages ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS review_reasons\n        FROM\n            session_review_reasons\n            LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\n        WHERE\n            session_review_reasons.session_id = sessions.id) AS session_review_reason ON TRUE\nWHERE\n    sessions.to_review IS TRUE\n    AND sessions.reviewed IS FALSE\n    AND LOWER(students.first_name) = LOWER(COALESCE(NULLIF (:withStudentFirstName, ''), students.first_name))\nORDER BY\n    (sessions.created_at) DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":5589,"b":7757,"line":205,"col":0}}};

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
export const getSessionsToReview = new PreparedQuery<IGetSessionsToReviewParams,IGetSessionsToReviewResult>(getSessionsToReviewIR);


/** 'GetTotalTimeTutoredForDateRange' parameters type */
export interface IGetTotalTimeTutoredForDateRangeParams {
  end: Date;
  start: Date;
  volunteerId: string;
}

/** 'GetTotalTimeTutoredForDateRange' return type */
export interface IGetTotalTimeTutoredForDateRangeResult {
  total: string | null;
}

/** 'GetTotalTimeTutoredForDateRange' query type */
export interface IGetTotalTimeTutoredForDateRangeQuery {
  params: IGetTotalTimeTutoredForDateRangeParams;
  result: IGetTotalTimeTutoredForDateRangeResult;
}

const getTotalTimeTutoredForDateRangeIR: any = {"name":"getTotalTimeTutoredForDateRange","params":[{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7896,"b":7907,"line":273,"col":20}]}},{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7932,"b":7937,"line":274,"col":23}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7962,"b":7965,"line":275,"col":23}]}}],"usedParamSet":{"volunteerId":true,"start":true,"end":true},"statement":{"body":"SELECT\n    SUM(time_tutored)::bigint AS total\nFROM\n    sessions\nWHERE\n    volunteer_id = :volunteerId!\n    AND created_at >= :start!\n    AND created_at <= :end!","loc":{"a":7806,"b":7965,"line":268,"col":0}}};

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
export const getTotalTimeTutoredForDateRange = new PreparedQuery<IGetTotalTimeTutoredForDateRangeParams,IGetTotalTimeTutoredForDateRangeResult>(getTotalTimeTutoredForDateRangeIR);


/** 'GetActiveSessionVolunteers' parameters type */
export type IGetActiveSessionVolunteersParams = void;

/** 'GetActiveSessionVolunteers' return type */
export interface IGetActiveSessionVolunteersResult {
  volunteerId: string | null;
}

/** 'GetActiveSessionVolunteers' query type */
export interface IGetActiveSessionVolunteersQuery {
  params: IGetActiveSessionVolunteersParams;
  result: IGetActiveSessionVolunteersResult;
}

const getActiveSessionVolunteersIR: any = {"name":"getActiveSessionVolunteers","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    volunteer_id\nFROM\n    sessions\nWHERE\n    ended_at IS NULL\n    AND NOT volunteer_id IS NULL","loc":{"a":8009,"b":8109,"line":279,"col":0}}};

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
export const getActiveSessionVolunteers = new PreparedQuery<IGetActiveSessionVolunteersParams,IGetActiveSessionVolunteersResult>(getActiveSessionVolunteersIR);


/** 'UpdateSessionReported' parameters type */
export interface IUpdateSessionReportedParams {
  id: string;
  reportMessage: string;
  reportReason: string;
  sessionId: string;
}

/** 'UpdateSessionReported' return type */
export interface IUpdateSessionReportedResult {
  ok: string;
}

/** 'UpdateSessionReported' query type */
export interface IUpdateSessionReportedQuery {
  params: IUpdateSessionReportedParams;
  result: IUpdateSessionReportedResult;
}

const updateSessionReportedIR: any = {"name":"updateSessionReported","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8300,"b":8302,"line":291,"col":5}]}},{"name":"reportMessage","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8333,"b":8346,"line":293,"col":5}]}},{"name":"reportReason","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8509,"b":8521,"line":301,"col":52}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8548,"b":8557,"line":303,"col":19}]}}],"usedParamSet":{"id":true,"reportMessage":true,"reportReason":true,"sessionId":true},"statement":{"body":"INSERT INTO session_reports (id, report_reason_id, report_message, reporting_user_id, session_id, reported_user_id, created_at, updated_at)\nSELECT\n    :id!,\n    report_reasons.id,\n    :reportMessage!,\n    sessions.volunteer_id,\n    sessions.id,\n    sessions.student_id,\n    NOW(),\n    NOW()\nFROM\n    sessions\n    JOIN report_reasons ON report_reasons.reason = :reportReason!\nWHERE\n    sessions.id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":8148,"b":8580,"line":289,"col":0}}};

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
export const updateSessionReported = new PreparedQuery<IUpdateSessionReportedParams,IUpdateSessionReportedResult>(updateSessionReportedIR);


/** 'UpdateSessionTimeTutored' parameters type */
export interface IUpdateSessionTimeTutoredParams {
  sessionId: string;
  timeTutored: number;
}

/** 'UpdateSessionTimeTutored' return type */
export interface IUpdateSessionTimeTutoredResult {
  ok: string;
}

/** 'UpdateSessionTimeTutored' query type */
export interface IUpdateSessionTimeTutoredQuery {
  params: IUpdateSessionTimeTutoredParams;
  result: IUpdateSessionTimeTutoredResult;
}

const updateSessionTimeTutoredIR: any = {"name":"updateSessionTimeTutored","params":[{"name":"timeTutored","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8667,"b":8678,"line":312,"col":21}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8726,"b":8735,"line":315,"col":10}]}}],"usedParamSet":{"timeTutored":true,"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    time_tutored = (:timeTutored!)::int,\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":8622,"b":8758,"line":309,"col":0}}};

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
export const updateSessionTimeTutored = new PreparedQuery<IUpdateSessionTimeTutoredParams,IUpdateSessionTimeTutoredResult>(updateSessionTimeTutoredIR);


/** 'UpdateSessionQuillDoc' parameters type */
export interface IUpdateSessionQuillDocParams {
  quillDoc: string;
  sessionId: string;
}

/** 'UpdateSessionQuillDoc' return type */
export interface IUpdateSessionQuillDocResult {
  ok: string;
}

/** 'UpdateSessionQuillDoc' query type */
export interface IUpdateSessionQuillDocQuery {
  params: IUpdateSessionQuillDocParams;
  result: IUpdateSessionQuillDocResult;
}

const updateSessionQuillDocIR: any = {"name":"updateSessionQuillDoc","params":[{"name":"quillDoc","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8839,"b":8847,"line":324,"col":18}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8890,"b":8899,"line":327,"col":10}]}}],"usedParamSet":{"quillDoc":true,"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    quill_doc = (:quillDoc!),\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":8797,"b":8922,"line":321,"col":0}}};

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
export const updateSessionQuillDoc = new PreparedQuery<IUpdateSessionQuillDocParams,IUpdateSessionQuillDocResult>(updateSessionQuillDocIR);


/** 'UpdateSessionHasWhiteboardDoc' parameters type */
export interface IUpdateSessionHasWhiteboardDocParams {
  hasWhiteboardDoc: boolean;
  sessionId: string;
}

/** 'UpdateSessionHasWhiteboardDoc' return type */
export interface IUpdateSessionHasWhiteboardDocResult {
  ok: string;
}

/** 'UpdateSessionHasWhiteboardDoc' query type */
export interface IUpdateSessionHasWhiteboardDocQuery {
  params: IUpdateSessionHasWhiteboardDocParams;
  result: IUpdateSessionHasWhiteboardDocResult;
}

const updateSessionHasWhiteboardDocIR: any = {"name":"updateSessionHasWhiteboardDoc","params":[{"name":"hasWhiteboardDoc","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9020,"b":9036,"line":336,"col":27}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9088,"b":9097,"line":339,"col":10}]}}],"usedParamSet":{"hasWhiteboardDoc":true,"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    has_whiteboard_doc = (:hasWhiteboardDoc!)::boolean,\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":8969,"b":9120,"line":333,"col":0}}};

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
export const updateSessionHasWhiteboardDoc = new PreparedQuery<IUpdateSessionHasWhiteboardDocParams,IUpdateSessionHasWhiteboardDocResult>(updateSessionHasWhiteboardDocIR);


/** 'UpdateSessionToEnd' parameters type */
export interface IUpdateSessionToEndParams {
  endedAt: Date;
  endedBy: string | null | void;
  sessionId: string;
}

/** 'UpdateSessionToEnd' return type */
export interface IUpdateSessionToEndResult {
  ok: string;
}

/** 'UpdateSessionToEnd' query type */
export interface IUpdateSessionToEndQuery {
  params: IUpdateSessionToEndParams;
  result: IUpdateSessionToEndResult;
}

const updateSessionToEndIR: any = {"name":"updateSessionToEnd","params":[{"name":"endedAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9196,"b":9203,"line":348,"col":16}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9389,"b":9398,"line":358,"col":19},{"a":9663,"b":9672,"line":368,"col":19}]}},{"name":"endedBy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9471,"b":9477,"line":360,"col":43},{"a":9544,"b":9550,"line":362,"col":36}]}}],"usedParamSet":{"endedAt":true,"sessionId":true,"endedBy":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    ended_at = :endedAt!,\n    ended_by_role_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        user_roles.id\n    FROM\n        sessions\n    LEFT JOIN user_roles ON TRUE\nWHERE\n    sessions.id = :sessionId!\n    AND user_roles.name = (\n        CASE WHEN sessions.volunteer_id = :endedBy THEN\n            'volunteer'\n        WHEN sessions.student_id = :endedBy THEN\n            'student'\n        ELSE\n            'admin'\n        END)) AS subquery\nWHERE\n    sessions.id = :sessionId!\nRETURNING\n    sessions.id AS ok","loc":{"a":9156,"b":9704,"line":345,"col":0}}};

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
export const updateSessionToEnd = new PreparedQuery<IUpdateSessionToEndParams,IUpdateSessionToEndResult>(updateSessionToEndIR);


/** 'GetLongRunningSessions' parameters type */
export interface IGetLongRunningSessionsParams {
  end: Date;
  start: Date;
}

/** 'GetLongRunningSessions' return type */
export interface IGetLongRunningSessionsResult {
  id: string;
}

/** 'GetLongRunningSessions' query type */
export interface IGetLongRunningSessionsQuery {
  params: IGetLongRunningSessionsParams;
  result: IGetLongRunningSessionsResult;
}

const getLongRunningSessionsIR: any = {"name":"getLongRunningSessions","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9810,"b":9815,"line":379,"col":19}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9840,"b":9843,"line":380,"col":23}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    sessions.id\nFROM\n    sessions\nWHERE\n    created_at >= :start!\n    AND created_at <= :end!\n    AND ended_at IS NULL","loc":{"a":9744,"b":9868,"line":374,"col":0}}};

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
export const getLongRunningSessions = new PreparedQuery<IGetLongRunningSessionsParams,IGetLongRunningSessionsResult>(getLongRunningSessionsIR);


/** 'GetPublicSessionById' parameters type */
export interface IGetPublicSessionByIdParams {
  sessionId: string;
}

/** 'GetPublicSessionById' return type */
export interface IGetPublicSessionByIdResult {
  createdAt: Date;
  endedAt: Date | null;
  id: string;
  studentFirstName: string;
  studentId: string;
  subTopic: string;
  type: string;
  volunteerFirstName: string;
  volunteerId: string | null;
}

/** 'GetPublicSessionById' query type */
export interface IGetPublicSessionByIdQuery {
  params: IGetPublicSessionByIdParams;
  result: IGetPublicSessionByIdResult;
}

const getPublicSessionByIdIR: any = {"name":"getPublicSessionById","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10479,"b":10488,"line":402,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    sessions.ended_at,\n    sessions.created_at,\n    sessions.student_id,\n    sessions.volunteer_id,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    students.first_name AS student_first_name,\n    volunteers.first_name AS volunteer_first_name\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users students ON students.id = sessions.student_id\n    LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id\nWHERE\n    sessions.id = :sessionId!","loc":{"a":9906,"b":10488,"line":385,"col":0}}};

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
export const getPublicSessionById = new PreparedQuery<IGetPublicSessionByIdParams,IGetPublicSessionByIdResult>(getPublicSessionByIdIR);


/** 'GetSessionForAdminView' parameters type */
export interface IGetSessionForAdminViewParams {
  sessionId: string;
}

/** 'GetSessionForAdminView' return type */
export interface IGetSessionForAdminViewResult {
  createdAt: Date;
  endedAt: Date | null;
  endedBy: string | null;
  id: string;
  photos: stringArray | null;
  quillDoc: string | null;
  reportMessage: string | null;
  reportReason: string;
  reviewReasons: stringArray | null;
  subTopic: string;
  timeTutored: number | null;
  toolType: string;
  toReview: boolean;
  type: string;
  volunteerJoinedAt: Date | null;
}

/** 'GetSessionForAdminView' query type */
export interface IGetSessionForAdminViewQuery {
  params: IGetSessionForAdminViewParams;
  result: IGetSessionForAdminViewResult;
}

const getSessionForAdminViewIR: any = {"name":"getSessionForAdminView","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11599,"b":11608,"line":442,"col":26},{"a":12436,"b":12445,"line":464,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.ended_at,\n    sessions.volunteer_joined_at,\n    sessions.quill_doc,\n    sessions.time_tutored::int,\n    (\n        CASE WHEN user_roles.name = 'volunteer' THEN\n            sessions.volunteer_id\n        WHEN user_roles.name = 'student' THEN\n            sessions.student_id\n        ELSE\n            NULL\n        END) AS ended_by,\n    session_reports.report_message,\n    report_reasons.reason AS report_reason,\n    session_review_reason.review_reasons,\n    session_photo.photos,\n    sessions.to_review,\n    tool_types.name AS tool_type\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id\n    LEFT JOIN (\n        SELECT\n            report_reason_id,\n            report_message\n        FROM\n            session_reports\n        WHERE\n            session_id = :sessionId!\n        ORDER BY\n            created_at DESC\n        LIMIT 1) AS session_reports ON TRUE\n    LEFT JOIN report_reasons ON report_reasons.id = session_reports.report_reason_id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS review_reasons\n        FROM\n            session_review_reasons\n            LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\n        WHERE\n            session_review_reasons.session_id = sessions.id) AS session_review_reason ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(photo_key) AS photos\n        FROM\n            session_photos\n        WHERE\n            session_photos.session_id = sessions.id) AS session_photo ON TRUE\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\nWHERE\n    sessions.id = :sessionId!","loc":{"a":10528,"b":12445,"line":406,"col":0}}};

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
export const getSessionForAdminView = new PreparedQuery<IGetSessionForAdminViewParams,IGetSessionForAdminViewResult>(getSessionForAdminViewIR);


/** 'GetSessionUserAgent' parameters type */
export interface IGetSessionUserAgentParams {
  sessionId: string;
}

/** 'GetSessionUserAgent' return type */
export interface IGetSessionUserAgentResult {
  browser: string | null;
  browserVersion: string | null;
  device: string | null;
  operatingSystem: string | null;
  operatingSystemVersion: string | null;
}

/** 'GetSessionUserAgent' query type */
export interface IGetSessionUserAgentQuery {
  params: IGetSessionUserAgentParams;
  result: IGetSessionUserAgentResult;
}

const getSessionUserAgentIR: any = {"name":"getSessionUserAgent","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12645,"b":12654,"line":477,"col":31}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    device,\n    browser,\n    browser_version,\n    operating_system,\n    operating_system_version\nFROM\n    user_actions\nWHERE\n    user_actions.session_id = :sessionId!\n    AND user_actions.action = 'REQUESTED SESSION'\nLIMIT 1","loc":{"a":12482,"b":12712,"line":468,"col":0}}};

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
export const getSessionUserAgent = new PreparedQuery<IGetSessionUserAgentParams,IGetSessionUserAgentResult>(getSessionUserAgentIR);


/** 'GetUserForSessionAdminView' parameters type */
export interface IGetUserForSessionAdminViewParams {
  sessionId: string;
}

/** 'GetUserForSessionAdminView' return type */
export interface IGetUserForSessionAdminViewResult {
  createdAt: Date;
  firstname: string;
  id: string;
  isVolunteer: boolean | null;
  pastSessions: stringArray | null;
}

/** 'GetUserForSessionAdminView' query type */
export interface IGetUserForSessionAdminViewQuery {
  params: IGetUserForSessionAdminViewParams;
  result: IGetUserForSessionAdminViewResult;
}

const getUserForSessionAdminViewIR: any = {"name":"getUserForSessionAdminView","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13489,"b":13498,"line":508,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name AS firstname,\n    users.created_at,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    past_sessions.total AS past_sessions\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\n    LEFT JOIN sessions ON sessions.student_id = users.id\n        OR sessions.volunteer_id = users.id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(sessions.id ORDER BY sessions.created_at) AS total\n        FROM\n            sessions\n        WHERE\n            student_id = users.id\n            OR volunteer_id = users.id) AS past_sessions ON TRUE\nWHERE\n    sessions.id = :sessionId!\nGROUP BY\n    users.id,\n    volunteer_profiles.user_id,\n    past_sessions.total","loc":{"a":12756,"b":13577,"line":483,"col":0}}};

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
export const getUserForSessionAdminView = new PreparedQuery<IGetUserForSessionAdminViewParams,IGetUserForSessionAdminViewResult>(getUserForSessionAdminViewIR);


/** 'GetSessionMessagesForFrontend' parameters type */
export interface IGetSessionMessagesForFrontendParams {
  sessionId: string;
}

/** 'GetSessionMessagesForFrontend' return type */
export interface IGetSessionMessagesForFrontendResult {
  contents: string;
  createdAt: Date;
  id: string;
  sessionId: string;
  user: string;
}

/** 'GetSessionMessagesForFrontend' query type */
export interface IGetSessionMessagesForFrontendQuery {
  params: IGetSessionMessagesForFrontendParams;
  result: IGetSessionMessagesForFrontendResult;
}

const getSessionMessagesForFrontendIR: any = {"name":"getSessionMessagesForFrontend","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13757,"b":13766,"line":525,"col":18}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    id,\n    sender_id AS USER,\n    contents,\n    created_at,\n    session_id\nFROM\n    session_messages\nWHERE\n    session_id = :sessionId!\nORDER BY\n    created_at","loc":{"a":13624,"b":13790,"line":516,"col":0}}};

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
export const getSessionMessagesForFrontend = new PreparedQuery<IGetSessionMessagesForFrontendParams,IGetSessionMessagesForFrontendResult>(getSessionMessagesForFrontendIR);


/** 'CreateSession' parameters type */
export interface ICreateSessionParams {
  id: string;
  studentBanned: boolean;
  studentId: string;
  subject: string;
}

/** 'CreateSession' return type */
export interface ICreateSessionResult {
  id: string;
}

/** 'CreateSession' query type */
export interface ICreateSessionQuery {
  params: ICreateSessionParams;
  result: ICreateSessionResult;
}

const createSessionIR: any = {"name":"createSession","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13923,"b":13925,"line":533,"col":5}]}},{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13933,"b":13942,"line":534,"col":5}]}},{"name":"studentBanned","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13967,"b":13980,"line":536,"col":5}]}},{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14049,"b":14056,"line":542,"col":21}]}}],"usedParamSet":{"id":true,"studentId":true,"studentBanned":true,"subject":true},"statement":{"body":"INSERT INTO sessions (id, student_id, subject_id, student_banned, created_at, updated_at)\nSELECT\n    :id!,\n    :studentId!,\n    subjects.id,\n    :studentBanned!,\n    NOW(),\n    NOW()\nFROM\n    subjects\nWHERE\n    subjects.name = :subject!\nRETURNING\n    sessions.id","loc":{"a":13821,"b":14082,"line":531,"col":0}}};

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
export const createSession = new PreparedQuery<ICreateSessionParams,ICreateSessionResult>(createSessionIR);


/** 'GetCurrentSessionByUserId' parameters type */
export interface IGetCurrentSessionByUserIdParams {
  userId: string;
}

/** 'GetCurrentSessionByUserId' return type */
export interface IGetCurrentSessionByUserIdResult {
  createdAt: Date;
  endedAt: Date | null;
  id: string;
  studentId: string;
  subTopic: string;
  toolType: string;
  type: string;
  volunteerId: string | null;
  volunteerJoinedAt: Date | null;
}

/** 'GetCurrentSessionByUserId' query type */
export interface IGetCurrentSessionByUserIdQuery {
  params: IGetCurrentSessionByUserIdParams;
  result: IGetCurrentSessionByUserIdResult;
}

const getCurrentSessionByUserIdIR: any = {"name":"getCurrentSessionByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14645,"b":14651,"line":564,"col":30},{"a":14685,"b":14691,"line":565,"col":32}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.volunteer_joined_at,\n    sessions.volunteer_id,\n    sessions.student_id,\n    sessions.ended_at,\n    tool_types.name AS tool_type\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\nWHERE (sessions.student_id = :userId!\n    OR sessions.volunteer_id = :userId!)\nAND sessions.ended_at IS NULL","loc":{"a":14125,"b":14722,"line":548,"col":0}}};

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
export const getCurrentSessionByUserId = new PreparedQuery<IGetCurrentSessionByUserIdParams,IGetCurrentSessionByUserIdResult>(getCurrentSessionByUserIdIR);


/** 'GetRecapSessionForDmsBySessionId' parameters type */
export interface IGetRecapSessionForDmsBySessionIdParams {
  sessionId: string;
}

/** 'GetRecapSessionForDmsBySessionId' return type */
export interface IGetRecapSessionForDmsBySessionIdResult {
  createdAt: Date;
  endedAt: Date | null;
  id: string;
  studentId: string;
  subTopic: string;
  toolType: string;
  type: string;
  volunteerId: string | null;
  volunteerJoinedAt: Date | null;
}

/** 'GetRecapSessionForDmsBySessionId' query type */
export interface IGetRecapSessionForDmsBySessionIdQuery {
  params: IGetRecapSessionForDmsBySessionIdParams;
  result: IGetRecapSessionForDmsBySessionIdResult;
}

const getRecapSessionForDmsBySessionIdIR: any = {"name":"getRecapSessionForDmsBySessionId","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15287,"b":15296,"line":587,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.volunteer_joined_at,\n    sessions.volunteer_id,\n    sessions.student_id,\n    sessions.ended_at,\n    tool_types.name AS tool_type\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\nWHERE\n    sessions.id = :sessionId!\n    AND sessions.ended_at IS NOT NULL","loc":{"a":14772,"b":15334,"line":570,"col":0}}};

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
export const getRecapSessionForDmsBySessionId = new PreparedQuery<IGetRecapSessionForDmsBySessionIdParams,IGetRecapSessionForDmsBySessionIdResult>(getRecapSessionForDmsBySessionIdIR);


/** 'GetMessageInfoByMessageId' parameters type */
export interface IGetMessageInfoByMessageIdParams {
  messageId: string;
}

/** 'GetMessageInfoByMessageId' return type */
export interface IGetMessageInfoByMessageIdResult {
  contents: string;
  createdAt: Date;
  senderId: string;
  sentAfterSession: boolean | null;
  sessionEndedAt: Date | null;
  sessionId: string;
  studentEmail: string;
  studentFirstName: string;
  studentUserId: string;
  volunteerEmail: string;
  volunteerFirstName: string;
  volunteerUserId: string;
}

/** 'GetMessageInfoByMessageId' query type */
export interface IGetMessageInfoByMessageIdQuery {
  params: IGetMessageInfoByMessageIdParams;
  result: IGetMessageInfoByMessageIdResult;
}

const getMessageInfoByMessageIdIR: any = {"name":"getMessageInfoByMessageId","params":[{"name":"messageId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16189,"b":16198,"line":615,"col":27}]}}],"usedParamSet":{"messageId":true},"statement":{"body":"SELECT\n    sessions.id AS session_id,\n    sessions.ended_at AS session_ended_at,\n    students.id AS student_user_id,\n    students.first_name AS student_first_name,\n    students.email AS student_email,\n    volunteers.id AS volunteer_user_id,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.email AS volunteer_email,\n    session_messages.contents,\n    session_messages.created_at,\n    session_messages.sender_id,\n    CASE WHEN session_messages.created_at > sessions.ended_at THEN\n        TRUE\n    ELSE\n        FALSE\n    END AS sent_after_session\nFROM\n    session_messages\n    JOIN sessions ON session_messages.session_id = sessions.id\n    JOIN users students ON students.id = sessions.student_id\n    JOIN users volunteers ON volunteers.id = sessions.volunteer_id\nWHERE\n    session_messages.id = :messageId!\n    AND sessions.ended_at IS NOT NULL","loc":{"a":15377,"b":16236,"line":592,"col":0}}};

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
export const getMessageInfoByMessageId = new PreparedQuery<IGetMessageInfoByMessageIdParams,IGetMessageInfoByMessageIdResult>(getMessageInfoByMessageIdIR);


/** 'GetCurrentSessionBySessionId' parameters type */
export interface IGetCurrentSessionBySessionIdParams {
  sessionId: string | null | void;
}

/** 'GetCurrentSessionBySessionId' return type */
export interface IGetCurrentSessionBySessionIdResult {
  createdAt: Date;
  endedAt: Date | null;
  id: string;
  studentId: string;
  subTopic: string;
  toolType: string;
  type: string;
  volunteerId: string | null;
  volunteerJoinedAt: Date | null;
}

/** 'GetCurrentSessionBySessionId' query type */
export interface IGetCurrentSessionBySessionIdQuery {
  params: IGetCurrentSessionBySessionIdParams;
  result: IGetCurrentSessionBySessionIdResult;
}

const getCurrentSessionBySessionIdIR: any = {"name":"getCurrentSessionBySessionId","params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16797,"b":16805,"line":637,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.volunteer_joined_at,\n    sessions.volunteer_id,\n    sessions.student_id,\n    sessions.ended_at,\n    tool_types.name AS tool_type\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\nWHERE\n    sessions.id = :sessionId","loc":{"a":16282,"b":16805,"line":620,"col":0}}};

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
export const getCurrentSessionBySessionId = new PreparedQuery<IGetCurrentSessionBySessionIdParams,IGetCurrentSessionBySessionIdResult>(getCurrentSessionBySessionIdIR);


/** 'GetCurrentSessionUser' parameters type */
export interface IGetCurrentSessionUserParams {
  sessionId: string;
}

/** 'GetCurrentSessionUser' return type */
export interface IGetCurrentSessionUserResult {
  firstname: string;
  firstName: string;
  id: string;
  isVolunteer: boolean | null;
}

/** 'GetCurrentSessionUser' query type */
export interface IGetCurrentSessionUserQuery {
  params: IGetCurrentSessionUserParams;
  result: IGetCurrentSessionUserResult;
}

const getCurrentSessionUserIR: any = {"name":"getCurrentSessionUser","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17292,"b":17301,"line":657,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name AS firstname,\n    users.first_name AS first_name,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NULL THEN\n            FALSE\n        ELSE\n            TRUE\n        END) AS is_volunteer\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN sessions ON sessions.student_id = users.id\n        OR sessions.volunteer_id = users.id\nWHERE\n    sessions.id = :sessionId!","loc":{"a":16844,"b":17301,"line":641,"col":0}}};

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
export const getCurrentSessionUser = new PreparedQuery<IGetCurrentSessionUserParams,IGetCurrentSessionUserResult>(getCurrentSessionUserIR);


/** 'GetLatestSessionByStudentId' parameters type */
export interface IGetLatestSessionByStudentIdParams {
  studentId: string;
}

/** 'GetLatestSessionByStudentId' return type */
export interface IGetLatestSessionByStudentIdResult {
  createdAt: Date;
  id: string;
  subject: string;
  timeTutored: number | null;
}

/** 'GetLatestSessionByStudentId' query type */
export interface IGetLatestSessionByStudentIdQuery {
  params: IGetLatestSessionByStudentIdParams;
  result: IGetLatestSessionByStudentIdResult;
}

const getLatestSessionByStudentIdIR: any = {"name":"getLatestSessionByStudentId","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17553,"b":17562,"line":670,"col":27}]}}],"usedParamSet":{"studentId":true},"statement":{"body":"SELECT\n    sessions.id,\n    sessions.created_at,\n    time_tutored::int,\n    subjects.name AS subject\nFROM\n    sessions\n    JOIN subjects ON sessions.subject_id = subjects.id\nWHERE\n    sessions.student_id = :studentId!\nORDER BY\n    created_at DESC\nLIMIT 1","loc":{"a":17346,"b":17599,"line":661,"col":0}}};

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
export const getLatestSessionByStudentId = new PreparedQuery<IGetLatestSessionByStudentIdParams,IGetLatestSessionByStudentIdResult>(getLatestSessionByStudentIdIR);


/** 'UpdateSessionVolunteerById' parameters type */
export interface IUpdateSessionVolunteerByIdParams {
  sessionId: string;
  volunteerId: string;
}

/** 'UpdateSessionVolunteerById' return type */
export interface IUpdateSessionVolunteerByIdResult {
  ok: string;
}

/** 'UpdateSessionVolunteerById' query type */
export interface IUpdateSessionVolunteerByIdQuery {
  params: IUpdateSessionVolunteerByIdParams;
  result: IUpdateSessionVolunteerByIdResult;
}

const updateSessionVolunteerByIdIR: any = {"name":"updateSessionVolunteerById","params":[{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17687,"b":17698,"line":680,"col":20}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17773,"b":17782,"line":684,"col":10}]}}],"usedParamSet":{"volunteerId":true,"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    volunteer_id = :volunteerId!,\n    volunteer_joined_at = NOW(),\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":17643,"b":17805,"line":677,"col":0}}};

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
export const updateSessionVolunteerById = new PreparedQuery<IUpdateSessionVolunteerByIdParams,IUpdateSessionVolunteerByIdResult>(updateSessionVolunteerByIdIR);


/** 'GetSessionForChatbot' parameters type */
export interface IGetSessionForChatbotParams {
  sessionId: string;
}

/** 'GetSessionForChatbot' return type */
export interface IGetSessionForChatbotResult {
  createdAt: Date;
  endedAt: Date | null;
  id: string;
  student: string;
  studentFirstName: string;
  subject: string;
  toolType: string;
  topic: string;
  volunteerJoinedAt: Date | null;
}

/** 'GetSessionForChatbot' query type */
export interface IGetSessionForChatbotQuery {
  params: IGetSessionForChatbotParams;
  result: IGetSessionForChatbotResult;
}

const getSessionForChatbotIR: any = {"name":"getSessionForChatbot","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18385,"b":18394,"line":707,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    subjects.name AS subject,\n    topics.name AS topic,\n    sessions.created_at,\n    sessions.ended_at,\n    sessions.volunteer_joined_at,\n    sessions.student_id AS student,\n    users.first_name AS student_first_name,\n    tool_types.name AS tool_type\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\nWHERE\n    sessions.id = :sessionId!","loc":{"a":17843,"b":18394,"line":690,"col":0}}};

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
export const getSessionForChatbot = new PreparedQuery<IGetSessionForChatbotParams,IGetSessionForChatbotResult>(getSessionForChatbotIR);


/** 'InsertNewMessage' parameters type */
export interface IInsertNewMessageParams {
  contents: string;
  id: string;
  senderId: string;
  sessionId: string;
}

/** 'InsertNewMessage' return type */
export interface IInsertNewMessageResult {
  id: string;
}

/** 'InsertNewMessage' query type */
export interface IInsertNewMessageQuery {
  params: IInsertNewMessageParams;
  result: IInsertNewMessageResult;
}

const insertNewMessageIR: any = {"name":"insertNewMessage","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18532,"b":18534,"line":712,"col":13}]}},{"name":"senderId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18538,"b":18546,"line":712,"col":19}]}},{"name":"contents","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18550,"b":18558,"line":712,"col":31}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18562,"b":18571,"line":712,"col":43}]}}],"usedParamSet":{"id":true,"senderId":true,"contents":true,"sessionId":true},"statement":{"body":"INSERT INTO session_messages (id, sender_id, contents, session_id, created_at, updated_at)\n    VALUES (:id!, :senderId!, :contents!, :sessionId!, NOW(), NOW())\nRETURNING\n    id","loc":{"a":18428,"b":18603,"line":711,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_messages (id, sender_id, contents, session_id, created_at, updated_at)
 *     VALUES (:id!, :senderId!, :contents!, :sessionId!, NOW(), NOW())
 * RETURNING
 *     id
 * ```
 */
export const insertNewMessage = new PreparedQuery<IInsertNewMessageParams,IInsertNewMessageResult>(insertNewMessageIR);


/** 'GetSessionsWithAvgWaitTimePerDayAndHour' parameters type */
export interface IGetSessionsWithAvgWaitTimePerDayAndHourParams {
  end: Date;
  start: Date;
}

/** 'GetSessionsWithAvgWaitTimePerDayAndHour' return type */
export interface IGetSessionsWithAvgWaitTimePerDayAndHourResult {
  averageWaitTime: number | null;
  day: number | null;
  hour: number | null;
}

/** 'GetSessionsWithAvgWaitTimePerDayAndHour' query type */
export interface IGetSessionsWithAvgWaitTimePerDayAndHourQuery {
  params: IGetSessionsWithAvgWaitTimePerDayAndHourParams;
  result: IGetSessionsWithAvgWaitTimePerDayAndHourResult;
}

const getSessionsWithAvgWaitTimePerDayAndHourIR: any = {"name":"getSessionsWithAvgWaitTimePerDayAndHour","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19172,"b":19177,"line":730,"col":28}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19210,"b":19213,"line":731,"col":31}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    extract(isodow FROM sessions.created_at)::int AS day,\n    extract(hour FROM sessions.created_at)::int AS hour,\n    COALESCE(AVG(\n            CASE WHEN sessions.volunteer_id IS NULL THEN\n                EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at))\n            ELSE\n                EXTRACT('epoch' FROM (sessions.volunteer_joined_at - sessions.created_at))\n            END), 0)::float * 1000 AS average_wait_time -- in milliseconds\nFROM\n    sessions\nWHERE\n    sessions.created_at >= :start!\n    AND sessions.created_at < :end!\n    AND NOT sessions.ended_at IS NULL\n    AND EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) > 60\nGROUP BY\n    day,\n    hour","loc":{"a":18660,"b":19355,"line":718,"col":0}}};

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
export const getSessionsWithAvgWaitTimePerDayAndHour = new PreparedQuery<IGetSessionsWithAvgWaitTimePerDayAndHourParams,IGetSessionsWithAvgWaitTimePerDayAndHourResult>(getSessionsWithAvgWaitTimePerDayAndHourIR);


/** 'GetSessionsForReferCoworker' parameters type */
export interface IGetSessionsForReferCoworkerParams {
  volunteerId: string;
}

/** 'GetSessionsForReferCoworker' return type */
export interface IGetSessionsForReferCoworkerResult {
  id: string;
  volunteerFeedback: Json | null;
}

/** 'GetSessionsForReferCoworker' query type */
export interface IGetSessionsForReferCoworkerQuery {
  params: IGetSessionsForReferCoworkerParams;
  result: IGetSessionsForReferCoworkerResult;
}

const getSessionsForReferCoworkerIR: any = {"name":"getSessionsForReferCoworker","params":[{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19803,"b":19814,"line":750,"col":29}]}}],"usedParamSet":{"volunteerId":true},"statement":{"body":"SELECT\n    sessions.id,\n    feedbacks.volunteer_feedback\nFROM\n    sessions\n    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id\n    LEFT JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id\n    LEFT JOIN feedbacks ON feedbacks.session_id = sessions.id\n        AND feedbacks.user_id = sessions.volunteer_id\nWHERE\n    sessions.volunteer_id = :volunteerId!\n    AND sessions.time_tutored >= 15 * 60 * 1000\n    AND (session_flags.name IS NULL\n        OR NOT session_flags.name = ANY ('{\"Absent student\", \"Absent volunteer\"}'))","loc":{"a":19400,"b":19982,"line":740,"col":0}}};

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
export const getSessionsForReferCoworker = new PreparedQuery<IGetSessionsForReferCoworkerParams,IGetSessionsForReferCoworkerResult>(getSessionsForReferCoworkerIR);


/** 'GetVolunteersForGentleWarning' parameters type */
export interface IGetVolunteersForGentleWarningParams {
  mongoSessionId: string | null | void;
  sessionId: string | null | void;
}

/** 'GetVolunteersForGentleWarning' return type */
export interface IGetVolunteersForGentleWarningResult {
  email: string;
  firstName: string;
  id: string;
  totalNotifications: number | null;
}

/** 'GetVolunteersForGentleWarning' query type */
export interface IGetVolunteersForGentleWarningQuery {
  params: IGetVolunteersForGentleWarningParams;
  result: IGetVolunteersForGentleWarningResult;
}

const getVolunteersForGentleWarningIR: any = {"name":"getVolunteersForGentleWarning","params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20791,"b":20799,"line":784,"col":43}]}},{"name":"mongoSessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20844,"b":20857,"line":785,"col":43}]}}],"usedParamSet":{"sessionId":true,"mongoSessionId":true},"statement":{"body":"SELECT\n    users.id,\n    users.email,\n    users.first_name,\n    notification_count.total AS total_notifications\nFROM\n    notifications\n    LEFT JOIN users ON users.id = notifications.user_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = users.id) AS session_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            notifications\n        WHERE\n            notifications.user_id = users.id) AS notification_count ON TRUE\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND session_count.total = 0\n    AND (notifications.session_id::uuid = :sessionId\n        OR notifications.mongo_id::text = :mongoSessionId)\nGROUP BY\n    users.id,\n    notification_count.total","loc":{"a":20029,"b":20910,"line":757,"col":0}}};

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
export const getVolunteersForGentleWarning = new PreparedQuery<IGetVolunteersForGentleWarningParams,IGetVolunteersForGentleWarningResult>(getVolunteersForGentleWarningIR);


/** 'GetStudentForEmailFirstSession' parameters type */
export interface IGetStudentForEmailFirstSessionParams {
  mongoSessionId: string | null | void;
  sessionId: string | null | void;
}

/** 'GetStudentForEmailFirstSession' return type */
export interface IGetStudentForEmailFirstSessionResult {
  email: string;
  firstName: string;
  id: string;
}

/** 'GetStudentForEmailFirstSession' query type */
export interface IGetStudentForEmailFirstSessionQuery {
  params: IGetStudentForEmailFirstSessionParams;
  result: IGetStudentForEmailFirstSessionResult;
}

const getStudentForEmailFirstSessionIR: any = {"name":"getStudentForEmailFirstSession","params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21294,"b":21302,"line":801,"col":28}]}},{"name":"mongoSessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21338,"b":21351,"line":802,"col":34}]}}],"usedParamSet":{"sessionId":true,"mongoSessionId":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name,\n    users.email\nFROM\n    sessions\n    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id\n    LEFT JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id\n    LEFT JOIN users ON users.id = sessions.student_id\nWHERE (sessions.id::uuid = :sessionId\n    OR sessions.mongo_id::text = :mongoSessionId)\nAND (session_flags.name IS NULL\n    OR NOT session_flags.name = ANY ('{\"Absent student\", \"Absent volunteer\", \"Low coach rating from student\", \"Low session rating from student\" }'))\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE","loc":{"a":20958,"b":21593,"line":792,"col":0}}};

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
export const getStudentForEmailFirstSession = new PreparedQuery<IGetStudentForEmailFirstSessionParams,IGetStudentForEmailFirstSessionResult>(getStudentForEmailFirstSessionIR);


/** 'GetVolunteerForEmailFirstSession' parameters type */
export interface IGetVolunteerForEmailFirstSessionParams {
  mongoSessionId: string | null | void;
  sessionId: string | null | void;
}

/** 'GetVolunteerForEmailFirstSession' return type */
export interface IGetVolunteerForEmailFirstSessionResult {
  email: string;
  firstName: string;
  id: string;
}

/** 'GetVolunteerForEmailFirstSession' query type */
export interface IGetVolunteerForEmailFirstSessionQuery {
  params: IGetVolunteerForEmailFirstSessionParams;
  result: IGetVolunteerForEmailFirstSessionResult;
}

const getVolunteerForEmailFirstSessionIR: any = {"name":"getVolunteerForEmailFirstSession","params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21981,"b":21989,"line":819,"col":28}]}},{"name":"mongoSessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22025,"b":22038,"line":820,"col":34}]}}],"usedParamSet":{"sessionId":true,"mongoSessionId":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name,\n    users.email\nFROM\n    sessions\n    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id\n    LEFT JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id\n    LEFT JOIN users ON users.id = sessions.volunteer_id\nWHERE (sessions.id::uuid = :sessionId\n    OR sessions.mongo_id::text = :mongoSessionId)\nAND (session_flags.name IS NULL\n    OR NOT session_flags.name = ANY ('{\"Absent student\", \"Absent volunteer\", \"Low coach rating from student\", \"Low session rating from student\" }'))\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE","loc":{"a":21643,"b":22280,"line":810,"col":0}}};

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
export const getVolunteerForEmailFirstSession = new PreparedQuery<IGetVolunteerForEmailFirstSessionParams,IGetVolunteerForEmailFirstSessionResult>(getVolunteerForEmailFirstSessionIR);


/** 'GetSessionsForAdminFilter' parameters type */
export interface IGetSessionsForAdminFilterParams {
  end: Date;
  firstTimeStudent: boolean | null | void;
  firstTimeVolunteer: boolean | null | void;
  limit: number;
  messageCount: number | null | void;
  offset: number;
  reported: boolean | null | void;
  sessionLength: number | null | void;
  showBannedUsers: boolean | null | void;
  showTestUsers: boolean | null | void;
  start: Date;
}

/** 'GetSessionsForAdminFilter' return type */
export interface IGetSessionsForAdminFilterResult {
  createdAt: Date;
  endedAt: Date | null;
  id: string;
  reviewReasons: stringArray | null;
  studentEmail: string;
  studentFirstName: string;
  studentIsBanned: boolean;
  studentTestUser: boolean;
  studentTotalPastSessions: number | null;
  subTopic: string;
  totalMessages: number | null;
  type: string;
  volunteerEmail: string;
  volunteerFirstName: string;
  volunteerIsBanned: boolean;
  volunteerTestUser: boolean;
  volunteerTotalPastSessions: number | null;
}

/** 'GetSessionsForAdminFilter' query type */
export interface IGetSessionsForAdminFilterQuery {
  params: IGetSessionsForAdminFilterParams;
  result: IGetSessionsForAdminFilterResult;
}

const getSessionsForAdminFilterIR: any = {"name":"getSessionsForAdminFilter","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25133,"b":25138,"line":918,"col":32}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25172,"b":25175,"line":919,"col":32}]}},{"name":"messageCount","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25188,"b":25199,"line":920,"col":11},{"a":25251,"b":25262,"line":921,"col":36}]}},{"name":"sessionLength","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25282,"b":25294,"line":922,"col":11},{"a":25396,"b":25408,"line":923,"col":86}]}},{"name":"reported","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25428,"b":25435,"line":924,"col":11},{"a":25468,"b":25475,"line":925,"col":13}]}},{"name":"showBannedUsers","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25708,"b":25722,"line":930,"col":13}]}},{"name":"showTestUsers","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25754,"b":25766,"line":931,"col":11},{"a":25799,"b":25811,"line":932,"col":13}]}},{"name":"firstTimeStudent","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":25882,"b":25897,"line":934,"col":11},{"a":25930,"b":25945,"line":935,"col":13}]}},{"name":"firstTimeVolunteer","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26016,"b":26033,"line":937,"col":11},{"a":26066,"b":26083,"line":938,"col":13}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26193,"b":26198,"line":942,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26215,"b":26221,"line":942,"col":30}]}}],"usedParamSet":{"start":true,"end":true,"messageCount":true,"sessionLength":true,"reported":true,"showBannedUsers":true,"showTestUsers":true,"firstTimeStudent":true,"firstTimeVolunteer":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    sessions.id,\n    sessions.created_at,\n    sessions.ended_at,\n    message_count.total AS total_messages,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    students.first_name AS student_first_name,\n    students.email AS student_email,\n    students.banned AS student_is_banned,\n    students.test_user AS student_test_user,\n    student_sessions.total AS student_total_past_sessions,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.email AS volunteer_email,\n    volunteers.banned AS volunteer_is_banned,\n    volunteers.test_user AS volunteer_test_user,\n    volunteer_sessions.total AS volunteer_total_past_sessions,\n    review_reasons.review_reasons\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS review_reasons\n        FROM\n            session_review_reasons\n            LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\n        WHERE\n            session_id = sessions.id) AS review_reasons ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            first_name,\n            id,\n            email,\n            banned,\n            test_user\n        FROM\n            users\n        WHERE\n            users.id = sessions.student_id) AS students ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            first_name,\n            id,\n            email,\n            banned,\n            test_user\n        FROM\n            users\n        WHERE\n            users.id = sessions.volunteer_id) AS volunteers ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            session_messages\n        WHERE\n            session_messages.session_id = sessions.id) AS message_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            sessions.id = session_reports.session_id) AS session_reported_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.student_id = students.id) AS student_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = volunteers.id) AS volunteer_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            MAX(created_at) AS last_banned_at\n        FROM\n            user_actions\n        WHERE\n            user_actions.user_id = sessions.student_id\n            AND user_actions.action = 'BANNED') AS student_banned ON TRUE\nWHERE\n    NOT sessions.ended_at IS NULL\n    AND sessions.created_at >= :start!\n    AND sessions.created_at <= :end!\n    AND ((:messageCount)::int IS NULL\n        OR message_count.total >= (:messageCount)::int)\n    AND ((:sessionLength)::int IS NULL\n        OR (EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) / 60) > (:sessionLength)::int)\n    AND ((:reported)::boolean IS NULL\n        OR (:reported)::boolean IS FALSE\n        OR session_reported_count.total > 0)\n    AND (student_banned.last_banned_at IS NULL\n        OR sessions.created_at < student_banned.last_banned_at\n        OR sessions.student_banned IS FALSE\n        OR (:showBannedUsers)::boolean IS TRUE)\n    AND ((:showTestUsers)::boolean IS NULL\n        OR (:showTestUsers)::boolean IS TRUE\n        OR students.test_user IS FALSE)\n    AND ((:firstTimeStudent)::boolean IS NULL\n        OR (:firstTimeStudent)::boolean IS FALSE\n        OR student_sessions.total = 1)\n    AND ((:firstTimeVolunteer)::boolean IS NULL\n        OR (:firstTimeVolunteer)::boolean IS FALSE\n        OR volunteer_sessions.total = 1)\nORDER BY\n    (sessions.created_at) DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":22323,"b":26227,"line":828,"col":0}}};

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
export const getSessionsForAdminFilter = new PreparedQuery<IGetSessionsForAdminFilterParams,IGetSessionsForAdminFilterResult>(getSessionsForAdminFilterIR);


/** 'InsertSessionReviewReason' parameters type */
export interface IInsertSessionReviewReasonParams {
  flag: string;
  sessionId: string;
}

/** 'InsertSessionReviewReason' return type */
export interface IInsertSessionReviewReasonResult {
  ok: string | null;
}

/** 'InsertSessionReviewReason' query type */
export interface IInsertSessionReviewReasonQuery {
  params: IInsertSessionReviewReasonParams;
  result: IInsertSessionReviewReasonResult;
}

const insertSessionReviewReasonIR: any = {"name":"insertSessionReviewReason","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26393,"b":26402,"line":949,"col":9}]}},{"name":"flag","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26531,"b":26535,"line":956,"col":30},{"a":26820,"b":26824,"line":973,"col":26}]}}],"usedParamSet":{"sessionId":true,"flag":true},"statement":{"body":"WITH ins AS (\nINSERT INTO session_review_reasons (session_id, session_flag_id, created_at, updated_at)\n    SELECT\n        :sessionId!,\n        session_flags.id,\n        NOW(),\n        NOW()\n    FROM\n        session_flags\n    WHERE\n        session_flags.name = :flag!\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        session_id AS ok\n)\nSELECT\n    *\nFROM\n    ins\nUNION\nSELECT\n    session_id\nFROM\n    session_review_reasons\n    LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\nWHERE\n    session_flags.name = :flag!","loc":{"a":26270,"b":26824,"line":946,"col":0}}};

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
export const insertSessionReviewReason = new PreparedQuery<IInsertSessionReviewReasonParams,IInsertSessionReviewReasonResult>(insertSessionReviewReasonIR);


/** 'InsertSessionFailedJoin' parameters type */
export interface IInsertSessionFailedJoinParams {
  sessionId: string;
  userId: string;
}

/** 'InsertSessionFailedJoin' return type */
export interface IInsertSessionFailedJoinResult {
  ok: string;
}

/** 'InsertSessionFailedJoin' query type */
export interface IInsertSessionFailedJoinQuery {
  params: IInsertSessionFailedJoinParams;
  result: IInsertSessionFailedJoinResult;
}

const insertSessionFailedJoinIR: any = {"name":"insertSessionFailedJoin","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26957,"b":26966,"line":978,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":26970,"b":26976,"line":978,"col":26}]}}],"usedParamSet":{"sessionId":true,"userId":true},"statement":{"body":"INSERT INTO session_failed_joins (session_id, user_id, created_at, updated_at)\n    VALUES (:sessionId!, :userId!, NOW(), NOW())\nRETURNING\n    session_id AS ok","loc":{"a":26865,"b":27022,"line":977,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_failed_joins (session_id, user_id, created_at, updated_at)
 *     VALUES (:sessionId!, :userId!, NOW(), NOW())
 * RETURNING
 *     session_id AS ok
 * ```
 */
export const insertSessionFailedJoin = new PreparedQuery<IInsertSessionFailedJoinParams,IInsertSessionFailedJoinResult>(insertSessionFailedJoinIR);


/** 'InsertSessionPhotoKey' parameters type */
export interface IInsertSessionPhotoKeyParams {
  photoKey: string;
  sessionId: string;
}

/** 'InsertSessionPhotoKey' return type */
export interface IInsertSessionPhotoKeyResult {
  ok: string;
}

/** 'InsertSessionPhotoKey' query type */
export interface IInsertSessionPhotoKeyQuery {
  params: IInsertSessionPhotoKeyParams;
  result: IInsertSessionPhotoKeyResult;
}

const insertSessionPhotoKeyIR: any = {"name":"insertSessionPhotoKey","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27149,"b":27158,"line":985,"col":13}]}},{"name":"photoKey","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27162,"b":27170,"line":985,"col":26}]}}],"usedParamSet":{"sessionId":true,"photoKey":true},"statement":{"body":"INSERT INTO session_photos (session_id, photo_key, created_at, updated_at)\n    VALUES (:sessionId!, :photoKey!, NOW(), NOW())\nRETURNING\n    session_id AS ok","loc":{"a":27061,"b":27216,"line":984,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_photos (session_id, photo_key, created_at, updated_at)
 *     VALUES (:sessionId!, :photoKey!, NOW(), NOW())
 * RETURNING
 *     session_id AS ok
 * ```
 */
export const insertSessionPhotoKey = new PreparedQuery<IInsertSessionPhotoKeyParams,IInsertSessionPhotoKeyResult>(insertSessionPhotoKeyIR);


/** 'GetSessionsForVolunteerHourSummary' parameters type */
export interface IGetSessionsForVolunteerHourSummaryParams {
  end: Date;
  start: Date;
  volunteerId: string;
}

/** 'GetSessionsForVolunteerHourSummary' return type */
export interface IGetSessionsForVolunteerHourSummaryResult {
  createdAt: Date;
  endedAt: Date | null;
  sessionId: string;
  subject: string;
  timeTutored: number | null;
  topic: string;
  volunteerJoinedAt: Date | null;
}

/** 'GetSessionsForVolunteerHourSummary' query type */
export interface IGetSessionsForVolunteerHourSummaryQuery {
  params: IGetSessionsForVolunteerHourSummaryParams;
  result: IGetSessionsForVolunteerHourSummaryResult;
}

const getSessionsForVolunteerHourSummaryIR: any = {"name":"getSessionsForVolunteerHourSummary","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27745,"b":27750,"line":1005,"col":28}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27784,"b":27787,"line":1006,"col":32}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":27860,"b":27871,"line":1008,"col":33}]}}],"usedParamSet":{"start":true,"end":true,"volunteerId":true},"statement":{"body":"SELECT\n    sessions.id AS session_id,\n    sessions.created_at AS created_at,\n    sessions.ended_at AS ended_at,\n    sessions.time_tutored::int AS time_tutored,\n    subjects.name AS subject,\n    topics.name AS topic,\n    sessions.volunteer_joined_at AS volunteer_joined_at\nFROM\n    sessions\n    JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN topics ON topics.id = subjects.topic_id\n    JOIN users ON users.id = sessions.student_id\nWHERE\n    sessions.created_at >= :start!\n    AND sessions.created_at <= :end!\n    AND sessions.ended_at IS NOT NULL\n    AND sessions.volunteer_id = :volunteerId!\n    AND users.test_user = FALSE","loc":{"a":27268,"b":27903,"line":991,"col":0}}};

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
export const getSessionsForVolunteerHourSummary = new PreparedQuery<IGetSessionsForVolunteerHourSummaryParams,IGetSessionsForVolunteerHourSummaryResult>(getSessionsForVolunteerHourSummaryIR);


/** 'GetSessionHistory' parameters type */
export interface IGetSessionHistoryParams {
  limit: number;
  minSessionLength: number;
  offset: number;
  userId: string;
}

/** 'GetSessionHistory' return type */
export interface IGetSessionHistoryResult {
  createdAt: Date;
  id: string;
  isFavorited: boolean | null;
  studentFirstName: string;
  studentId: string;
  subject: string;
  timeTutored: number | null;
  topic: string;
  topicIconLink: string | null;
  volunteerFirstName: string;
  volunteerId: string;
}

/** 'GetSessionHistory' query type */
export interface IGetSessionHistoryQuery {
  params: IGetSessionHistoryParams;
  result: IGetSessionHistoryResult;
}

const getSessionHistoryIR: any = {"name":"getSessionHistory","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29042,"b":29048,"line":1039,"col":26},{"a":29078,"b":29084,"line":1040,"col":28}]}},{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29240,"b":29256,"line":1044,"col":33}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29437,"b":29442,"line":1056,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29459,"b":29465,"line":1056,"col":30}]}}],"usedParamSet":{"userId":true,"minSessionLength":true,"limit":true,"offset":true},"statement":{"body":"WITH results AS (\n    SELECT DISTINCT ON (sessions.id)\n        sessions.id,\n        sessions.created_at AS created_at,\n        sessions.time_tutored::int AS time_tutored,\n        subjects.display_name AS subject,\n        topics.name AS topic,\n        topics.icon_link AS topic_icon_link,\n        volunteers.first_name AS volunteer_first_name,\n        volunteers.id AS volunteer_id,\n        students.id AS student_id,\n        students.first_name AS student_first_name,\n        (\n            CASE WHEN favorited.volunteer_id = sessions.volunteer_id THEN\n                TRUE\n            ELSE\n                FALSE\n            END) AS is_favorited\n    FROM\n        sessions\n        JOIN subjects ON subjects.id = sessions.subject_id\n        JOIN topics ON topics.id = subjects.topic_id\n        LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id\n        LEFT JOIN users students ON sessions.student_id = students.id\n        LEFT JOIN student_favorite_volunteers favorited ON students.id = favorited.student_id\n            AND volunteers.id = favorited.volunteer_id\n    WHERE (students.id = :userId!\n        OR volunteers.id = :userId!)\n    AND sessions.created_at BETWEEN (NOW() - INTERVAL '1 YEAR')\n    AND NOW()\n    AND sessions.time_tutored IS NOT NULL\n    AND sessions.time_tutored > :minSessionLength!::int\n    AND sessions.volunteer_id IS NOT NULL\n    AND sessions.ended_at IS NOT NULL\nORDER BY\n    sessions.id\n)\nSELECT\n    *\nFROM\n    results\nORDER BY\n    created_at DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":27938,"b":29471,"line":1013,"col":0}}};

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
export const getSessionHistory = new PreparedQuery<IGetSessionHistoryParams,IGetSessionHistoryResult>(getSessionHistoryIR);


/** 'IsEligibleForSessionRecap' parameters type */
export interface IIsEligibleForSessionRecapParams {
  minSessionLength: number;
  sessionId: string;
}

/** 'IsEligibleForSessionRecap' return type */
export interface IIsEligibleForSessionRecapResult {
  isEligible: boolean | null;
}

/** 'IsEligibleForSessionRecap' query type */
export interface IIsEligibleForSessionRecapQuery {
  params: IIsEligibleForSessionRecapParams;
  result: IIsEligibleForSessionRecapResult;
}

const isEligibleForSessionRecapIR: any = {"name":"isEligibleForSessionRecap","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29666,"b":29675,"line":1069,"col":19}]}},{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":29752,"b":29768,"line":1071,"col":33}]}}],"usedParamSet":{"sessionId":true,"minSessionLength":true},"statement":{"body":"SELECT\n    CASE WHEN sessions.id IS NOT NULL THEN\n        TRUE\n    ELSE\n        FALSE\n    END AS is_eligible\nFROM\n    sessions\nWHERE\n    sessions.id = :sessionId!\n    AND sessions.time_tutored IS NOT NULL\n    AND sessions.time_tutored > :minSessionLength!::int\n    AND sessions.volunteer_id IS NOT NULL\n    AND sessions.ended_at IS NOT NULL","loc":{"a":29514,"b":29853,"line":1060,"col":0}}};

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
export const isEligibleForSessionRecap = new PreparedQuery<IIsEligibleForSessionRecapParams,IIsEligibleForSessionRecapResult>(isEligibleForSessionRecapIR);


/** 'GetSessionHistoryIdsByUserId' parameters type */
export interface IGetSessionHistoryIdsByUserIdParams {
  minSessionLength: number;
  userId: string;
}

/** 'GetSessionHistoryIdsByUserId' return type */
export interface IGetSessionHistoryIdsByUserIdResult {
  id: string;
}

/** 'GetSessionHistoryIdsByUserId' query type */
export interface IGetSessionHistoryIdsByUserIdQuery {
  params: IGetSessionHistoryIdsByUserIdParams;
  result: IGetSessionHistoryIdsByUserIdResult;
}

const getSessionHistoryIdsByUserIdIR: any = {"name":"getSessionHistoryIdsByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":30204,"b":30210,"line":1085,"col":22},{"a":30236,"b":30242,"line":1086,"col":24}]}},{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":30382,"b":30398,"line":1090,"col":29}]}}],"usedParamSet":{"userId":true,"minSessionLength":true},"statement":{"body":"SELECT\n    sessions.id\nFROM\n    sessions\n    JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id\n    LEFT JOIN users students ON sessions.student_id = students.id\nWHERE (students.id = :userId!\n    OR volunteers.id = :userId!)\nAND sessions.created_at BETWEEN (NOW() - INTERVAL '1 YEAR')\nAND NOW()\nAND sessions.time_tutored IS NOT NULL\nAND sessions.time_tutored > :minSessionLength!::int\nAND sessions.volunteer_id IS NOT NULL\nAND sessions.ended_at IS NOT NULL\nORDER BY\n    sessions.created_at DESC","loc":{"a":29899,"b":30513,"line":1077,"col":0}}};

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
export const getSessionHistoryIdsByUserId = new PreparedQuery<IGetSessionHistoryIdsByUserIdParams,IGetSessionHistoryIdsByUserIdResult>(getSessionHistoryIdsByUserIdIR);


/** 'GetTotalSessionHistory' parameters type */
export interface IGetTotalSessionHistoryParams {
  minSessionLength: number;
  userId: string;
}

/** 'GetTotalSessionHistory' return type */
export interface IGetTotalSessionHistoryResult {
  total: number | null;
}

/** 'GetTotalSessionHistory' query type */
export interface IGetTotalSessionHistoryQuery {
  params: IGetTotalSessionHistoryParams;
  result: IGetTotalSessionHistoryResult;
}

const getTotalSessionHistoryIR: any = {"name":"getTotalSessionHistory","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":30765,"b":30771,"line":1104,"col":22},{"a":30797,"b":30803,"line":1105,"col":24}]}},{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":30943,"b":30959,"line":1109,"col":29}]}}],"usedParamSet":{"userId":true,"minSessionLength":true},"statement":{"body":"SELECT\n    count(*)::int AS total\nFROM\n    sessions\n    LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id\n    LEFT JOIN users students ON sessions.student_id = students.id\nWHERE (students.id = :userId!\n    OR volunteers.id = :userId!)\nAND sessions.created_at BETWEEN (NOW() - INTERVAL '1 YEAR')\nAND NOW()\nAND sessions.time_tutored IS NOT NULL\nAND sessions.time_tutored > :minSessionLength!::int\nAND sessions.volunteer_id IS NOT NULL","loc":{"a":30553,"b":31002,"line":1098,"col":0}}};

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
export const getTotalSessionHistory = new PreparedQuery<IGetTotalSessionHistoryParams,IGetTotalSessionHistoryResult>(getTotalSessionHistoryIR);


/** 'GetSessionRecap' parameters type */
export interface IGetSessionRecapParams {
  sessionId: string;
}

/** 'GetSessionRecap' return type */
export interface IGetSessionRecapResult {
  createdAt: Date;
  endedAt: Date | null;
  hasWhiteboardDoc: boolean;
  id: string;
  isFavorited: boolean | null;
  quillDoc: string | null;
  studentFirstName: string;
  studentId: string;
  subject: string;
  subjectKey: string;
  timeTutored: number | null;
  topic: string;
  topicIconLink: string | null;
  volunteerFirstName: string;
  volunteerId: string;
}

/** 'GetSessionRecap' query type */
export interface IGetSessionRecapQuery {
  params: IGetSessionRecapParams;
  result: IGetSessionRecapResult;
}

const getSessionRecapIR: any = {"name":"getSessionRecap","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":32078,"b":32087,"line":1144,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    sessions.created_at,\n    sessions.ended_at,\n    sessions.time_tutored::int,\n    subjects.display_name AS subject,\n    subjects.name AS subject_key,\n    topics.name AS topic,\n    topics.icon_link AS topic_icon_link,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.id AS volunteer_id,\n    students.id AS student_id,\n    students.first_name AS student_first_name,\n    (\n        CASE WHEN favorited.volunteer_id = sessions.volunteer_id THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_favorited,\n    sessions.quill_doc,\n    sessions.has_whiteboard_doc\nFROM\n    sessions\n    JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id\n    LEFT JOIN users students ON sessions.student_id = students.id\n    LEFT JOIN student_favorite_volunteers favorited ON students.id = favorited.student_id\n        AND volunteers.id = favorited.volunteer_id\nWHERE\n    sessions.id = :sessionId!","loc":{"a":31035,"b":32087,"line":1114,"col":0}}};

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
export const getSessionRecap = new PreparedQuery<IGetSessionRecapParams,IGetSessionRecapResult>(getSessionRecapIR);


/** 'VolunteerSentMessageAfterSessionEnded' parameters type */
export interface IVolunteerSentMessageAfterSessionEndedParams {
  sessionId: string | null | void;
}

/** 'VolunteerSentMessageAfterSessionEnded' return type */
export interface IVolunteerSentMessageAfterSessionEndedResult {
  id: string;
}

/** 'VolunteerSentMessageAfterSessionEnded' query type */
export interface IVolunteerSentMessageAfterSessionEndedQuery {
  params: IVolunteerSentMessageAfterSessionEndedParams;
  result: IVolunteerSentMessageAfterSessionEndedResult;
}

const volunteerSentMessageAfterSessionEndedIR: any = {"name":"volunteerSentMessageAfterSessionEnded","params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":32287,"b":32295,"line":1154,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    session_messages.id\nFROM\n    sessions\n    JOIN session_messages ON sessions.id = session_messages.session_id\nWHERE\n    sessions.id = :sessionId\n    AND session_messages.sender_id = sessions.volunteer_id\n    AND session_messages.created_at > sessions.ended_at\nLIMIT 1","loc":{"a":32142,"b":32418,"line":1148,"col":0}}};

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
export const volunteerSentMessageAfterSessionEnded = new PreparedQuery<IVolunteerSentMessageAfterSessionEndedParams,IVolunteerSentMessageAfterSessionEndedResult>(volunteerSentMessageAfterSessionEndedIR);


/** 'SessionHasBannedParticipant' parameters type */
export interface ISessionHasBannedParticipantParams {
  sessionId: string;
}

/** 'SessionHasBannedParticipant' return type */
export interface ISessionHasBannedParticipantResult {
  id: string;
}

/** 'SessionHasBannedParticipant' query type */
export interface ISessionHasBannedParticipantQuery {
  params: ISessionHasBannedParticipantParams;
  result: ISessionHasBannedParticipantResult;
}

const sessionHasBannedParticipantIR: any = {"name":"sessionHasBannedParticipant","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":32830,"b":32839,"line":1170,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id\nFROM\n    sessions\n    JOIN student_profiles ON student_profiles.user_id = sessions.student_id\n    JOIN users students ON student_profiles.user_id = students.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = sessions.volunteer_id\n    JOIN users volunteers ON volunteer_profiles.user_id = volunteers.id\nWHERE\n    sessions.id = :sessionId!\n    AND (students.banned IS TRUE\n        OR volunteers.banned IS TRUE)\nLIMIT 1","loc":{"a":32463,"b":32918,"line":1161,"col":0}}};

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
export const sessionHasBannedParticipant = new PreparedQuery<ISessionHasBannedParticipantParams,ISessionHasBannedParticipantResult>(sessionHasBannedParticipantIR);


/** 'GetUserSessionsByUserId' parameters type */
export interface IGetUserSessionsByUserIdParams {
  end: Date | null | void;
  sessionId: string | null | void;
  start: Date | null | void;
  subject: string;
  topic: string | null | void;
  userId: string;
}

/** 'GetUserSessionsByUserId' return type */
export interface IGetUserSessionsByUserIdResult {
  createdAt: Date;
  id: string;
  quillDoc: string | null;
  studentId: string;
  subjectName: string;
  topicName: string;
  volunteerId: string | null;
}

/** 'GetUserSessionsByUserId' query type */
export interface IGetUserSessionsByUserIdQuery {
  params: IGetUserSessionsByUserIdParams;
  result: IGetUserSessionsByUserIdResult;
}

const getUserSessionsByUserIdIR: any = {"name":"getUserSessionsByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33292,"b":33298,"line":1189,"col":30},{"a":33332,"b":33338,"line":1190,"col":32}]}},{"name":"start","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33348,"b":33352,"line":1191,"col":7},{"a":33401,"b":33405,"line":1192,"col":32}]}},{"name":"end","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33422,"b":33424,"line":1193,"col":7},{"a":33473,"b":33475,"line":1194,"col":32}]}},{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33492,"b":33498,"line":1195,"col":7},{"a":33540,"b":33547,"line":1196,"col":25}]}},{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33563,"b":33571,"line":1197,"col":6},{"a":33609,"b":33617,"line":1198,"col":22}]}},{"name":"topic","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33633,"b":33637,"line":1199,"col":7},{"a":33677,"b":33681,"line":1200,"col":23}]}}],"usedParamSet":{"userId":true,"start":true,"end":true,"subject":true,"sessionId":true,"topic":true},"statement":{"body":"SELECT\n    sessions.id,\n    sessions.created_at,\n    subjects.name AS subject_name,\n    topics.name AS topic_name,\n    quill_doc,\n    sessions.student_id,\n    sessions.volunteer_id\nFROM\n    sessions\n    JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN topics ON topics.id = subjects.topic_id\nWHERE (sessions.student_id = :userId!\n    OR sessions.volunteer_id = :userId!)\nAND ((:start)::date IS NULL\n    OR sessions.created_at >= (:start)::date)\nAND ((:end)::date IS NULL\n    OR sessions.created_at <= (:end)::date)\nAND ((:subject)::text IS NULL\n    OR subjects.name = (:subject!)::text)\nAND (:sessionId::uuid IS NULL\n    OR sessions.id = :sessionId::uuid)\nAND ((:topic)::text IS NULL\n    OR topics.name = (:topic)::text)\nORDER BY\n    sessions.created_at DESC","loc":{"a":32959,"b":33727,"line":1177,"col":0}}};

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
export const getUserSessionsByUserId = new PreparedQuery<IGetUserSessionsByUserIdParams,IGetUserSessionsByUserIdResult>(getUserSessionsByUserIdIR);


/** 'GetUserSessionStats' parameters type */
export interface IGetUserSessionStatsParams {
  minSessionLength: number;
  userId: string;
}

/** 'GetUserSessionStats' return type */
export interface IGetUserSessionStatsResult {
  subjectName: string;
  topicName: string;
  totalHelped: number | null;
  totalRequested: number | null;
}

/** 'GetUserSessionStats' query type */
export interface IGetUserSessionStatsQuery {
  params: IGetUserSessionStatsParams;
  result: IGetUserSessionStatsResult;
}

const getUserSessionStatsIR: any = {"name":"getUserSessionStats","params":[{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":33938,"b":33954,"line":1211,"col":44}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":34204,"b":34210,"line":1220,"col":36},{"a":34252,"b":34258,"line":1221,"col":40}]}}],"usedParamSet":{"minSessionLength":true,"userId":true},"statement":{"body":"SELECT\n    subjects.name AS subject_name,\n    topics.name AS topic_name,\n    COUNT(sessions.id)::int AS total_requested,\n    SUM(\n        CASE WHEN sessions.time_tutored >= :minSessionLength!::int THEN\n            1\n        ELSE\n            0\n        END)::int AS total_helped\nFROM\n    subjects\n    JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN sessions ON subjects.id = sessions.subject_id\n        AND (sessions.student_id = :userId!\n            OR sessions.volunteer_id = :userId!)\nWHERE\n    subjects.active IS TRUE\nGROUP BY\n    subjects.name,\n    topics.name","loc":{"a":33764,"b":34337,"line":1206,"col":0}}};

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
export const getUserSessionStats = new PreparedQuery<IGetUserSessionStatsParams,IGetUserSessionStatsResult>(getUserSessionStatsIR);


