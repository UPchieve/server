/** Types generated for queries found in "server/models/Session/session.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type ban_types = 'complete' | 'live_media' | 'shadow';

export type tutor_bot_session_user_type = 'bot' | 'student';

export type DateOrString = Date | string;

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

const addNotificationIR: any = {"usedParamSet":{"id":true,"volunteer":true,"wasSuccessful":true,"sessionId":true,"type":true,"method":true,"priorityGroup":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":147,"b":150}]},{"name":"volunteer","required":true,"transform":{"type":"scalar"},"locs":[{"a":157,"b":167}]},{"name":"wasSuccessful","required":true,"transform":{"type":"scalar"},"locs":[{"a":278,"b":292}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":299,"b":309}]},{"name":"type","required":true,"transform":{"type":"scalar"},"locs":[{"a":481,"b":486}]},{"name":"method","required":true,"transform":{"type":"scalar"},"locs":[{"a":526,"b":533}]},{"name":"priorityGroup","required":true,"transform":{"type":"scalar"},"locs":[{"a":579,"b":593}]}],"statement":"INSERT INTO notifications (id, user_id, sent_at, type_id, method_id, priority_group_id, successful, session_id, created_at, updated_at)\nSELECT\n    :id!,\n    :volunteer!,\n    NOW(),\n    notification_types.id,\n    notification_methods.id,\n    notification_priority_groups.id,\n    :wasSuccessful!,\n    :sessionId!,\n    NOW(),\n    NOW()\nFROM\n    notification_types\n    JOIN notification_methods ON TRUE\n    JOIN notification_priority_groups ON TRUE\nWHERE\n    notification_types.type = :type!\n    AND notification_methods.method = :method!\n    AND notification_priority_groups.name = :priorityGroup!\nRETURNING\n    id AS ok"};

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
  start: DateOrString;
}

/** 'GetUnfilledSessions' return type */
export interface IGetUnfilledSessionsResult {
  createdAt: Date;
  id: string;
  isFirstTimeStudent: boolean | null;
  studentBanType: ban_types | null;
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

const getUnfilledSessionsIR: any = {"usedParamSet":{"start":true},"params":[{"name":"start","required":true,"transform":{"type":"scalar"},"locs":[{"a":833,"b":839}]}],"statement":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.volunteer_id AS volunteer,\n    sessions.created_at,\n    users.first_name AS student_first_name,\n    users.test_user AS student_test_user,\n    users.ban_type AS student_ban_type,\n    session_count.total = 1 AS is_first_time_student,\n    subjects.display_name AS subject_display_name\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    JOIN LATERAL (\n        SELECT\n            COUNT(*) AS total\n        FROM\n            sessions\n        WHERE\n            student_id = users.id) AS session_count ON TRUE\nWHERE\n    sessions.volunteer_id IS NULL\n    AND sessions.ended_at IS NULL\n    AND sessions.created_at > :start!\n    AND users.ban_type IS DISTINCT FROM 'complete'\nORDER BY\n    sessions.created_at"};

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
 *     users.ban_type AS student_ban_type,
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
 *     AND users.ban_type IS DISTINCT FROM 'complete'
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
  shadowbanned: boolean | null;
  studentId: string;
  subject: string;
  subjectDisplayName: string;
  subjectId: number;
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

const getSessionByIdIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1491,"b":1501}]}],"statement":"SELECT\n    sessions.id,\n    student_id,\n    volunteer_id,\n    subjects.id AS subject_id,\n    subjects.name AS subject,\n    subjects.display_name AS subject_display_name,\n    topics.name AS topic,\n    has_whiteboard_doc,\n    quill_doc,\n    volunteer_joined_at,\n    ended_at,\n    user_roles.name AS ended_by_role,\n    reviewed,\n    to_review,\n    shadowbanned,\n    (time_tutored)::float,\n    sessions.created_at,\n    sessions.updated_at,\n    session_reported_count.total <> 0 AS reported,\n    COALESCE(session_flag_array.flags, ARRAY[]::text[]) AS flags,\n    tool_types.name AS tool_type\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id\n    LEFT JOIN session_reports ON session_reports.session_id = sessions.id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(name) AS flags\n        FROM\n            sessions_session_flags\n            LEFT JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id\n        WHERE\n            sessions_session_flags.session_id = sessions.id) AS session_flag_array ON TRUE\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\nWHERE\n    sessions.id = :sessionId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     student_id,
 *     volunteer_id,
 *     subjects.id AS subject_id,
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
 *     shadowbanned,
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


/** 'InsertSessionFlagsById' parameters type */
export interface IInsertSessionFlagsByIdParams {
  flags: stringArray;
  sessionId: string;
}

/** 'InsertSessionFlagsById' return type */
export interface IInsertSessionFlagsByIdResult {
  ok: string;
}

/** 'InsertSessionFlagsById' query type */
export interface IInsertSessionFlagsByIdQuery {
  params: IInsertSessionFlagsByIdParams;
  result: IInsertSessionFlagsByIdResult;
}

const insertSessionFlagsByIdIR: any = {"usedParamSet":{"sessionId":true,"flags":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":100,"b":110}]},{"name":"flags","required":true,"transform":{"type":"scalar"},"locs":[{"a":201,"b":207}]}],"statement":"INSERT INTO sessions_session_flags (session_id, session_flag_id, created_at, updated_at)\nSELECT\n    :sessionId!,\n    session_flags.id,\n    NOW(),\n    NOW()\nFROM\n    session_flags\nWHERE\n    name = ANY (:flags!::text[])\nON CONFLICT (session_id,\n    session_flag_id)\n    DO UPDATE SET\n        updated_at = NOW()\n    RETURNING\n        session_id AS ok"};

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
 *     name = ANY (:flags!::text[])
 * ON CONFLICT (session_id,
 *     session_flag_id)
 *     DO UPDATE SET
 *         updated_at = NOW()
 *     RETURNING
 *         session_id AS ok
 * ```
 */
export const insertSessionFlagsById = new PreparedQuery<IInsertSessionFlagsByIdParams,IInsertSessionFlagsByIdResult>(insertSessionFlagsByIdIR);


/** 'UpdateSessionToReview' parameters type */
export interface IUpdateSessionToReviewParams {
  reviewed?: boolean | null | void;
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

const updateSessionToReviewIR: any = {"usedParamSet":{"reviewed":true,"sessionId":true},"params":[{"name":"reviewed","required":false,"transform":{"type":"scalar"},"locs":[{"a":70,"b":78}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":106,"b":116}]}],"statement":"UPDATE\n    sessions\nSET\n    to_review = TRUE,\n    reviewed = COALESCE(:reviewed, reviewed)\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok"};

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

const updateSessionReviewedStatusByIdIR: any = {"usedParamSet":{"reviewed":true,"toReview":true,"sessionId":true},"params":[{"name":"reviewed","required":true,"transform":{"type":"scalar"},"locs":[{"a":39,"b":48}]},{"name":"toReview","required":true,"transform":{"type":"scalar"},"locs":[{"a":67,"b":76}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":117,"b":127}]}],"statement":"UPDATE\n    sessions\nSET\n    reviewed = :reviewed!,\n    to_review = :toReview!,\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok"};

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

const getSessionToEndByIdIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1709,"b":1719}]}],"statement":"SELECT\n    sessions.id,\n    student_id,\n    volunteer_id,\n    subjects.name AS subject,\n    topics.name AS topic,\n    volunteer_joined_at,\n    ended_at,\n    sessions.created_at,\n    sessions.updated_at,\n    students.first_name AS student_first_name,\n    students.email AS student_email,\n    student_sessions.total AS student_num_past_sessions,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.email AS volunteer_email,\n    volunteer_sessions.total AS volunteer_num_past_sessions,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    session_reported_count.total <> 0 AS reported\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users students ON students.id = sessions.student_id\n    LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.student_id = students.id) AS student_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = volunteers.id) AS volunteer_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = volunteers.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    sessions.id = :sessionId!"};

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
  withStudentFirstName?: string | null | void;
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
  volunteerFirstName: string;
}

/** 'GetSessionsToReview' query type */
export interface IGetSessionsToReviewQuery {
  params: IGetSessionsToReviewParams;
  result: IGetSessionsToReviewResult;
}

const getSessionsToReviewIR: any = {"usedParamSet":{"withStudentFirstName":true,"limit":true,"offset":true},"params":[{"name":"withStudentFirstName","required":false,"transform":{"type":"scalar"},"locs":[{"a":2159,"b":2179}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":2256,"b":2262}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":2278,"b":2285}]}],"statement":"SELECT\n    sessions.id,\n    sessions.ended_at,\n    sessions.created_at,\n    sessions.volunteer_id AS volunteer,\n    volunteers.first_name AS volunteer_first_name,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    students.first_name AS student_first_name,\n    session_reported_count.total <> 0 AS is_reported,\n    flags.flags,\n    messages.total AS total_messages,\n    session_review_reason.review_reasons,\n    sessions.to_review,\n    student_feedback.student_counseling_feedback\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users students ON students.id = sessions.student_id\n    LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id\n    LEFT JOIN feedbacks student_feedback ON (student_feedback.session_id = sessions.id\n            AND student_feedback.user_id = sessions.student_id)\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS flags\n        FROM\n            sessions_session_flags\n            JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id\n        WHERE\n            session_id = sessions.id\n        GROUP BY\n            session_id) AS flags ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_messages\n        WHERE\n            session_messages.session_id = sessions.id) AS messages ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS review_reasons\n        FROM\n            session_review_reasons\n            LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\n        WHERE\n            session_review_reasons.session_id = sessions.id) AS session_review_reason ON TRUE\nWHERE\n    sessions.to_review IS TRUE\n    AND sessions.reviewed IS FALSE\n    AND LOWER(students.first_name) = LOWER(COALESCE(NULLIF (:withStudentFirstName, ''), students.first_name))\nORDER BY\n    (sessions.created_at) DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     sessions.ended_at,
 *     sessions.created_at,
 *     sessions.volunteer_id AS volunteer,
 *     volunteers.first_name AS volunteer_first_name,
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
 *     LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id
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
  end: DateOrString;
  start: DateOrString;
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

const getTotalTimeTutoredForDateRangeIR: any = {"usedParamSet":{"volunteerId":true,"start":true,"end":true},"params":[{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":89,"b":101}]},{"name":"start","required":true,"transform":{"type":"scalar"},"locs":[{"a":125,"b":131}]},{"name":"end","required":true,"transform":{"type":"scalar"},"locs":[{"a":155,"b":159}]}],"statement":"SELECT\n    SUM(time_tutored)::bigint AS total\nFROM\n    sessions\nWHERE\n    volunteer_id = :volunteerId!\n    AND created_at >= :start!\n    AND created_at <= :end!"};

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

const getActiveSessionVolunteersIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    volunteer_id\nFROM\n    sessions\nWHERE\n    ended_at IS NULL\n    AND NOT volunteer_id IS NULL"};

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

const updateSessionReportedIR: any = {"usedParamSet":{"id":true,"reportMessage":true,"reportReason":true,"sessionId":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":151,"b":154}]},{"name":"reportMessage","required":true,"transform":{"type":"scalar"},"locs":[{"a":184,"b":198}]},{"name":"reportReason","required":true,"transform":{"type":"scalar"},"locs":[{"a":360,"b":373}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":399,"b":409}]}],"statement":"INSERT INTO session_reports (id, report_reason_id, report_message, reporting_user_id, session_id, reported_user_id, created_at, updated_at)\nSELECT\n    :id!,\n    report_reasons.id,\n    :reportMessage!,\n    sessions.volunteer_id,\n    sessions.id,\n    sessions.student_id,\n    NOW(),\n    NOW()\nFROM\n    sessions\n    JOIN report_reasons ON report_reasons.reason = :reportReason!\nWHERE\n    sessions.id = :sessionId!\nRETURNING\n    id AS ok"};

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

const updateSessionTimeTutoredIR: any = {"usedParamSet":{"timeTutored":true,"sessionId":true},"params":[{"name":"timeTutored","required":true,"transform":{"type":"scalar"},"locs":[{"a":44,"b":56}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":103,"b":113}]}],"statement":"UPDATE\n    sessions\nSET\n    time_tutored = (:timeTutored!)::int,\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok"};

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

const updateSessionQuillDocIR: any = {"usedParamSet":{"quillDoc":true,"sessionId":true},"params":[{"name":"quillDoc","required":true,"transform":{"type":"scalar"},"locs":[{"a":41,"b":50}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":92,"b":102}]}],"statement":"UPDATE\n    sessions\nSET\n    quill_doc = (:quillDoc!),\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok"};

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

const updateSessionHasWhiteboardDocIR: any = {"usedParamSet":{"hasWhiteboardDoc":true,"sessionId":true},"params":[{"name":"hasWhiteboardDoc","required":true,"transform":{"type":"scalar"},"locs":[{"a":50,"b":67}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":118,"b":128}]}],"statement":"UPDATE\n    sessions\nSET\n    has_whiteboard_doc = (:hasWhiteboardDoc!)::boolean,\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok"};

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
  endedAt: DateOrString;
  endedBy?: string | null | void;
  sessionId: string;
}

/** 'UpdateSessionToEnd' return type */
export interface IUpdateSessionToEndResult {
  createdAt: Date;
  endedAt: Date | null;
  endedBy: string | null;
  endedByUserRole: string | null;
  id: string;
  volunteerJoinedAt: Date | null;
}

/** 'UpdateSessionToEnd' query type */
export interface IUpdateSessionToEndQuery {
  params: IUpdateSessionToEndParams;
  result: IUpdateSessionToEndResult;
}

const updateSessionToEndIR: any = {"usedParamSet":{"endedAt":true,"endedBy":true,"sessionId":true},"params":[{"name":"endedAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":39,"b":47}]},{"name":"endedBy","required":false,"transform":{"type":"scalar"},"locs":[{"a":73,"b":80},{"a":255,"b":262},{"a":321,"b":328},{"a":392,"b":399}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":130,"b":140}]}],"statement":"UPDATE\n    sessions\nSET\n    ended_at = :endedAt!,\n    ended_by_user_id = :endedBy,\n    updated_at = NOW()\nWHERE\n    sessions.id = :sessionId!\nRETURNING\n    sessions.id,\n    sessions.created_at,\n    sessions.ended_at,\n    sessions.volunteer_joined_at,\n    :endedBy::uuid AS ended_by,\n    CASE WHEN sessions.volunteer_id = :endedBy::uuid THEN\n        'volunteer'\n    WHEN sessions.student_id = :endedBy::uuid THEN\n        'student'\n    ELSE\n        'admin'\n    END AS ended_by_user_role"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     sessions
 * SET
 *     ended_at = :endedAt!,
 *     ended_by_user_id = :endedBy,
 *     updated_at = NOW()
 * WHERE
 *     sessions.id = :sessionId!
 * RETURNING
 *     sessions.id,
 *     sessions.created_at,
 *     sessions.ended_at,
 *     sessions.volunteer_joined_at,
 *     :endedBy::uuid AS ended_by,
 *     CASE WHEN sessions.volunteer_id = :endedBy::uuid THEN
 *         'volunteer'
 *     WHEN sessions.student_id = :endedBy::uuid THEN
 *         'student'
 *     ELSE
 *         'admin'
 *     END AS ended_by_user_role
 * ```
 */
export const updateSessionToEnd = new PreparedQuery<IUpdateSessionToEndParams,IUpdateSessionToEndResult>(updateSessionToEndIR);


/** 'GetLongRunningSessions' parameters type */
export interface IGetLongRunningSessionsParams {
  end: DateOrString;
  start: DateOrString;
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

const getLongRunningSessionsIR: any = {"usedParamSet":{"start":true,"end":true},"params":[{"name":"start","required":true,"transform":{"type":"scalar"},"locs":[{"a":65,"b":71}]},{"name":"end","required":true,"transform":{"type":"scalar"},"locs":[{"a":95,"b":99}]}],"statement":"SELECT\n    sessions.id\nFROM\n    sessions\nWHERE\n    created_at >= :start!\n    AND created_at <= :end!\n    AND ended_at IS NULL"};

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

const getPublicSessionByIdIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":572,"b":582}]}],"statement":"SELECT\n    sessions.id,\n    sessions.ended_at,\n    sessions.created_at,\n    sessions.student_id,\n    sessions.volunteer_id,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    students.first_name AS student_first_name,\n    volunteers.first_name AS volunteer_first_name\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users students ON students.id = sessions.student_id\n    LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id\nWHERE\n    sessions.id = :sessionId!"};

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
  studentId: string;
  subTopic: string;
  timeTutored: number | null;
  toolType: string;
  toReview: boolean;
  type: string;
  volunteerId: string | null;
  volunteerJoinedAt: Date | null;
}

/** 'GetSessionForAdminView' query type */
export interface IGetSessionForAdminViewQuery {
  params: IGetSessionForAdminViewParams;
  result: IGetSessionForAdminViewResult;
}

const getSessionForAdminViewIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1122,"b":1132},{"a":1959,"b":1969}]}],"statement":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.ended_at,\n    sessions.volunteer_joined_at,\n    sessions.quill_doc,\n    sessions.time_tutored::int,\n    (\n        CASE WHEN user_roles.name = 'volunteer' THEN\n            sessions.volunteer_id\n        WHEN user_roles.name = 'student' THEN\n            sessions.student_id\n        ELSE\n            NULL\n        END) AS ended_by,\n    session_reports.report_message,\n    report_reasons.reason AS report_reason,\n    session_review_reason.review_reasons,\n    session_photo.photos,\n    sessions.to_review,\n    tool_types.name AS tool_type,\n    sessions.student_id,\n    sessions.volunteer_id\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id\n    LEFT JOIN (\n        SELECT\n            report_reason_id,\n            report_message\n        FROM\n            session_reports\n        WHERE\n            session_id = :sessionId!\n        ORDER BY\n            created_at DESC\n        LIMIT 1) AS session_reports ON TRUE\n    LEFT JOIN report_reasons ON report_reasons.id = session_reports.report_reason_id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS review_reasons\n        FROM\n            session_review_reasons\n            LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\n        WHERE\n            session_review_reasons.session_id = sessions.id) AS session_review_reason ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(photo_key) AS photos\n        FROM\n            session_photos\n        WHERE\n            session_photos.session_id = sessions.id) AS session_photo ON TRUE\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\nWHERE\n    sessions.id = :sessionId!"};

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
 *     tool_types.name AS tool_type,
 *     sessions.student_id,
 *     sessions.volunteer_id
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

const getSessionMessagesForFrontendIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":132,"b":142}]}],"statement":"SELECT\n    id,\n    sender_id AS USER,\n    contents,\n    created_at,\n    session_id\nFROM\n    session_messages\nWHERE\n    session_id = :sessionId!\nORDER BY\n    created_at"};

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


/** 'GetSessionVoiceMessagesForFrontend' parameters type */
export interface IGetSessionVoiceMessagesForFrontendParams {
  sessionId: string;
}

/** 'GetSessionVoiceMessagesForFrontend' return type */
export interface IGetSessionVoiceMessagesForFrontendResult {
  createdAt: Date;
  id: string;
  sessionId: string;
  transcript: string | null;
  user: string;
}

/** 'GetSessionVoiceMessagesForFrontend' query type */
export interface IGetSessionVoiceMessagesForFrontendQuery {
  params: IGetSessionVoiceMessagesForFrontendParams;
  result: IGetSessionVoiceMessagesForFrontendResult;
}

const getSessionVoiceMessagesForFrontendIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":140,"b":150}]}],"statement":"SELECT\n    id,\n    sender_id AS USER,\n    created_at,\n    session_id,\n    transcript\nFROM\n    session_voice_messages\nWHERE\n    session_id = :sessionId!\nORDER BY\n    created_at"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     sender_id AS USER,
 *     created_at,
 *     session_id,
 *     transcript
 * FROM
 *     session_voice_messages
 * WHERE
 *     session_id = :sessionId!
 * ORDER BY
 *     created_at
 * ```
 */
export const getSessionVoiceMessagesForFrontend = new PreparedQuery<IGetSessionVoiceMessagesForFrontendParams,IGetSessionVoiceMessagesForFrontendResult>(getSessionVoiceMessagesForFrontendIR);


/** 'GetSessionAudioTranscriptMessagesForFrontend' parameters type */
export interface IGetSessionAudioTranscriptMessagesForFrontendParams {
  sessionId: string;
}

/** 'GetSessionAudioTranscriptMessagesForFrontend' return type */
export interface IGetSessionAudioTranscriptMessagesForFrontendResult {
  createdAt: Date;
  id: string;
  message: string;
  sessionId: string;
  user: string;
}

/** 'GetSessionAudioTranscriptMessagesForFrontend' query type */
export interface IGetSessionAudioTranscriptMessagesForFrontendQuery {
  params: IGetSessionAudioTranscriptMessagesForFrontendParams;
  result: IGetSessionAudioTranscriptMessagesForFrontendResult;
}

const getSessionAudioTranscriptMessagesForFrontendIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":157,"b":167}]}],"statement":"SELECT\n    id,\n    user_id AS USER,\n    session_id,\n    message,\n    said_at AS created_at\nFROM\n    session_audio_transcript_messages\nWHERE\n    session_id = :sessionId!\nORDER BY\n    said_at"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     user_id AS USER,
 *     session_id,
 *     message,
 *     said_at AS created_at
 * FROM
 *     session_audio_transcript_messages
 * WHERE
 *     session_id = :sessionId!
 * ORDER BY
 *     said_at
 * ```
 */
export const getSessionAudioTranscriptMessagesForFrontend = new PreparedQuery<IGetSessionAudioTranscriptMessagesForFrontendParams,IGetSessionAudioTranscriptMessagesForFrontendResult>(getSessionAudioTranscriptMessagesForFrontendIR);


/** 'CreateSession' parameters type */
export interface ICreateSessionParams {
  id: string;
  shadowbanned: boolean;
  studentId: string;
  subject: string;
}

/** 'CreateSession' return type */
export interface ICreateSessionResult {
  createdAt: Date;
  endedAt: Date | null;
  endedByRoleId: number | null;
  endedByUserId: string | null;
  hasWhiteboardDoc: boolean;
  id: string;
  mongoId: string | null;
  quillDoc: string | null;
  reviewed: boolean;
  shadowbanned: boolean | null;
  studentBanned: boolean | null;
  studentId: string;
  subjectId: number;
  timeTutored: string;
  toReview: boolean;
  updatedAt: Date;
  volunteerId: string | null;
  volunteerJoinedAt: Date | null;
}

/** 'CreateSession' query type */
export interface ICreateSessionQuery {
  params: ICreateSessionParams;
  result: ICreateSessionResult;
}

const createSessionIR: any = {"usedParamSet":{"id":true,"studentId":true,"shadowbanned":true,"subject":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":99,"b":102}]},{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":109,"b":119}]},{"name":"shadowbanned","required":true,"transform":{"type":"scalar"},"locs":[{"a":143,"b":156}]},{"name":"subject","required":true,"transform":{"type":"scalar"},"locs":[{"a":224,"b":232}]}],"statement":"INSERT INTO sessions (id, student_id, subject_id, shadowbanned, created_at, updated_at)\nSELECT\n    :id!,\n    :studentId!,\n    subjects.id,\n    :shadowbanned!,\n    NOW(),\n    NOW()\nFROM\n    subjects\nWHERE\n    subjects.name = :subject!\nRETURNING\n    *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sessions (id, student_id, subject_id, shadowbanned, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :studentId!,
 *     subjects.id,
 *     :shadowbanned!,
 *     NOW(),
 *     NOW()
 * FROM
 *     subjects
 * WHERE
 *     subjects.name = :subject!
 * RETURNING
 *     *
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
  studentBannedFromLiveMedia: boolean | null;
  studentId: string;
  subTopic: string;
  toolType: string;
  type: string;
  volunteerBannedFromLiveMedia: boolean | null;
  volunteerId: string | null;
  volunteerJoinedAt: Date | null;
  volunteerLanguages: stringArray | null;
}

/** 'GetCurrentSessionByUserId' query type */
export interface IGetCurrentSessionByUserIdQuery {
  params: IGetCurrentSessionByUserIdParams;
  result: IGetCurrentSessionByUserIdResult;
}

const getCurrentSessionByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1207,"b":1214},{"a":1247,"b":1254}]}],"statement":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.volunteer_joined_at,\n    sessions.volunteer_id,\n    sessions.student_id,\n    sessions.ended_at,\n    tool_types.name AS tool_type,\n    volunteer_profiles.languages AS volunteer_languages,\n    CASE WHEN sessions.volunteer_id IS NULL THEN\n        FALSE\n    WHEN (\n        SELECT\n            ban_type\n        FROM\n            upchieve.users\n        WHERE\n            id = sessions.volunteer_id) = 'live_media' THEN\n        TRUE\n    ELSE\n        FALSE\n    END AS volunteer_banned_from_live_media, CASE WHEN (\n        SELECT\n            ban_type\n        FROM\n            upchieve.users\n        WHERE\n            id = sessions.student_id) = 'live_media' THEN\n        TRUE\n    ELSE\n        FALSE\n    END AS student_banned_from_live_media\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = sessions.volunteer_id\nWHERE (sessions.student_id = :userId!\n    OR sessions.volunteer_id = :userId!)\nAND sessions.ended_at IS NULL"};

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
 *     tool_types.name AS tool_type,
 *     volunteer_profiles.languages AS volunteer_languages,
 *     CASE WHEN sessions.volunteer_id IS NULL THEN
 *         FALSE
 *     WHEN (
 *         SELECT
 *             ban_type
 *         FROM
 *             upchieve.users
 *         WHERE
 *             id = sessions.volunteer_id) = 'live_media' THEN
 *         TRUE
 *     ELSE
 *         FALSE
 *     END AS volunteer_banned_from_live_media, CASE WHEN (
 *         SELECT
 *             ban_type
 *         FROM
 *             upchieve.users
 *         WHERE
 *             id = sessions.student_id) = 'live_media' THEN
 *         TRUE
 *     ELSE
 *         FALSE
 *     END AS student_banned_from_live_media
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
 *     LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
 *     JOIN tool_types ON subjects.tool_type_id = tool_types.id
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = sessions.volunteer_id
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

const getRecapSessionForDmsBySessionIdIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":514,"b":524}]}],"statement":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.volunteer_joined_at,\n    sessions.volunteer_id,\n    sessions.student_id,\n    sessions.ended_at,\n    tool_types.name AS tool_type\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\nWHERE\n    sessions.id = :sessionId!\n    AND sessions.ended_at IS NOT NULL"};

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

const getMessageInfoByMessageIdIR: any = {"usedParamSet":{"messageId":true},"params":[{"name":"messageId","required":true,"transform":{"type":"scalar"},"locs":[{"a":811,"b":821}]}],"statement":"SELECT\n    sessions.id AS session_id,\n    sessions.ended_at AS session_ended_at,\n    students.id AS student_user_id,\n    students.first_name AS student_first_name,\n    students.email AS student_email,\n    volunteers.id AS volunteer_user_id,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.email AS volunteer_email,\n    session_messages.contents,\n    session_messages.created_at,\n    session_messages.sender_id,\n    CASE WHEN session_messages.created_at > sessions.ended_at THEN\n        TRUE\n    ELSE\n        FALSE\n    END AS sent_after_session\nFROM\n    session_messages\n    JOIN sessions ON session_messages.session_id = sessions.id\n    JOIN users students ON students.id = sessions.student_id\n    JOIN users volunteers ON volunteers.id = sessions.volunteer_id\nWHERE\n    session_messages.id = :messageId!\n    AND sessions.ended_at IS NOT NULL"};

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
  sessionId?: string | null | void;
}

/** 'GetCurrentSessionBySessionId' return type */
export interface IGetCurrentSessionBySessionIdResult {
  createdAt: Date;
  endedAt: Date | null;
  endedBy: string | null;
  id: string;
  studentBannedFromLiveMedia: boolean | null;
  studentId: string;
  subTopic: string;
  toolType: string;
  type: string;
  volunteerBannedFromLiveMedia: boolean | null;
  volunteerId: string | null;
  volunteerJoinedAt: Date | null;
  volunteerLanguages: stringArray | null;
}

/** 'GetCurrentSessionBySessionId' query type */
export interface IGetCurrentSessionBySessionIdQuery {
  params: IGetCurrentSessionBySessionIdParams;
  result: IGetCurrentSessionBySessionIdResult;
}

const getCurrentSessionBySessionIdIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":1499,"b":1508}]}],"statement":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.volunteer_joined_at,\n    sessions.volunteer_id,\n    sessions.student_id,\n    sessions.ended_at,\n    volunteer_profiles.languages AS volunteer_languages,\n    (\n        CASE WHEN user_roles.name = 'volunteer' THEN\n            sessions.volunteer_id\n        WHEN user_roles.name = 'student' THEN\n            sessions.student_id\n        ELSE\n            NULL\n        END) AS ended_by,\n    tool_types.name AS tool_type,\n    CASE WHEN sessions.volunteer_id IS NULL THEN\n        FALSE\n    WHEN (\n        SELECT\n            ban_type\n        FROM\n            upchieve.users\n        WHERE\n            id = sessions.volunteer_id) = 'live_media' THEN\n        TRUE\n    ELSE\n        FALSE\n    END AS volunteer_banned_from_live_media, CASE WHEN (\n        SELECT\n            ban_type\n        FROM\n            upchieve.users\n        WHERE\n            id = sessions.student_id) = 'live_media' THEN\n        TRUE\n    ELSE\n        FALSE\n    END AS student_banned_from_live_media\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    JOIN tool_types ON subjects.tool_type_id = tool_types.id\n    LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = sessions.volunteer_id\nWHERE\n    sessions.id = :sessionId"};

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
 *     volunteer_profiles.languages AS volunteer_languages,
 *     (
 *         CASE WHEN user_roles.name = 'volunteer' THEN
 *             sessions.volunteer_id
 *         WHEN user_roles.name = 'student' THEN
 *             sessions.student_id
 *         ELSE
 *             NULL
 *         END) AS ended_by,
 *     tool_types.name AS tool_type,
 *     CASE WHEN sessions.volunteer_id IS NULL THEN
 *         FALSE
 *     WHEN (
 *         SELECT
 *             ban_type
 *         FROM
 *             upchieve.users
 *         WHERE
 *             id = sessions.volunteer_id) = 'live_media' THEN
 *         TRUE
 *     ELSE
 *         FALSE
 *     END AS volunteer_banned_from_live_media, CASE WHEN (
 *         SELECT
 *             ban_type
 *         FROM
 *             upchieve.users
 *         WHERE
 *             id = sessions.student_id) = 'live_media' THEN
 *         TRUE
 *     ELSE
 *         FALSE
 *     END AS student_banned_from_live_media
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
 *     LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
 *     JOIN tool_types ON subjects.tool_type_id = tool_types.id
 *     LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = sessions.volunteer_id
 * WHERE
 *     sessions.id = :sessionId
 * ```
 */
export const getCurrentSessionBySessionId = new PreparedQuery<IGetCurrentSessionBySessionIdParams,IGetCurrentSessionBySessionIdResult>(getCurrentSessionBySessionIdIR);


/** 'GetSessionUsers' parameters type */
export interface IGetSessionUsersParams {
  sessionId: string;
}

/** 'GetSessionUsers' return type */
export interface IGetSessionUsersResult {
  createdAt: Date;
  firstname: string;
  firstName: string;
  gradeLevel: string | null;
  id: string;
  pastSessions: stringArray | null;
}

/** 'GetSessionUsers' query type */
export interface IGetSessionUsersQuery {
  params: IGetSessionUsersParams;
  result: IGetSessionUsersResult;
}

const getSessionUsersIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":758,"b":768}]}],"statement":"SELECT\n    users.created_at,\n    users.id,\n    users.first_name AS firstname,\n    users.first_name,\n    past_sessions.total AS past_sessions,\n    cgl.current_grade_name AS grade_level\nFROM\n    users\n    LEFT JOIN sessions ON sessions.student_id = users.id\n        OR sessions.volunteer_id = users.id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(sessions.id ORDER BY sessions.created_at) AS total\n        FROM\n            sessions\n        WHERE\n            sessions.student_id = users.id\n            OR sessions.volunteer_id = users.id) AS past_sessions ON TRUE\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN current_grade_levels_mview cgl ON cgl.user_id = student_profiles.user_id\nWHERE\n    sessions.id = :sessionId!\nGROUP BY\n    users.id,\n    past_sessions.total,\n    cgl.current_grade_name"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.created_at,
 *     users.id,
 *     users.first_name AS firstname,
 *     users.first_name,
 *     past_sessions.total AS past_sessions,
 *     cgl.current_grade_name AS grade_level
 * FROM
 *     users
 *     LEFT JOIN sessions ON sessions.student_id = users.id
 *         OR sessions.volunteer_id = users.id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(sessions.id ORDER BY sessions.created_at) AS total
 *         FROM
 *             sessions
 *         WHERE
 *             sessions.student_id = users.id
 *             OR sessions.volunteer_id = users.id) AS past_sessions ON TRUE
 *     LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 *     LEFT JOIN current_grade_levels_mview cgl ON cgl.user_id = student_profiles.user_id
 * WHERE
 *     sessions.id = :sessionId!
 * GROUP BY
 *     users.id,
 *     past_sessions.total,
 *     cgl.current_grade_name
 * ```
 */
export const getSessionUsers = new PreparedQuery<IGetSessionUsersParams,IGetSessionUsersResult>(getSessionUsersIR);


/** 'GetLatestSession' parameters type */
export interface IGetLatestSessionParams {
  role: string;
  userId: string;
}

/** 'GetLatestSession' return type */
export interface IGetLatestSessionResult {
  createdAt: Date;
  endedAt: Date | null;
  endedByUserId: string | null;
  id: string;
  studentId: string;
  subject: string;
  timeTutored: number | null;
  volunteerId: string | null;
}

/** 'GetLatestSession' query type */
export interface IGetLatestSessionQuery {
  params: IGetLatestSessionParams;
  result: IGetLatestSessionResult;
}

const getLatestSessionIR: any = {"usedParamSet":{"role":true,"userId":true},"params":[{"name":"role","required":true,"transform":{"type":"scalar"},"locs":[{"a":287,"b":292},{"a":366,"b":371}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":342,"b":349},{"a":429,"b":436}]}],"statement":"SELECT\n    sessions.id,\n    sessions.created_at,\n    time_tutored::int,\n    subjects.name AS subject,\n    sessions.student_id,\n    sessions.volunteer_id,\n    sessions.ended_by_user_id,\n    sessions.ended_at\nFROM\n    sessions\n    JOIN subjects ON sessions.subject_id = subjects.id\nWHERE (:role!::text = 'student'\n    AND sessions.student_id = :userId!::uuid)\n    OR (:role!::text = 'volunteer'\n        AND sessions.volunteer_id = :userId!::uuid)\nORDER BY\n    created_at DESC\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     sessions.created_at,
 *     time_tutored::int,
 *     subjects.name AS subject,
 *     sessions.student_id,
 *     sessions.volunteer_id,
 *     sessions.ended_by_user_id,
 *     sessions.ended_at
 * FROM
 *     sessions
 *     JOIN subjects ON sessions.subject_id = subjects.id
 * WHERE (:role!::text = 'student'
 *     AND sessions.student_id = :userId!::uuid)
 *     OR (:role!::text = 'volunteer'
 *         AND sessions.volunteer_id = :userId!::uuid)
 * ORDER BY
 *     created_at DESC
 * LIMIT 1
 * ```
 */
export const getLatestSession = new PreparedQuery<IGetLatestSessionParams,IGetLatestSessionResult>(getLatestSessionIR);


/** 'UpdateSessionVolunteerById' parameters type */
export interface IUpdateSessionVolunteerByIdParams {
  sessionId: string;
  volunteerId: string;
}

/** 'UpdateSessionVolunteerById' return type */
export type IUpdateSessionVolunteerByIdResult = void;

/** 'UpdateSessionVolunteerById' query type */
export interface IUpdateSessionVolunteerByIdQuery {
  params: IUpdateSessionVolunteerByIdParams;
  result: IUpdateSessionVolunteerByIdResult;
}

const updateSessionVolunteerByIdIR: any = {"usedParamSet":{"volunteerId":true,"sessionId":true},"params":[{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":43,"b":55}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":129,"b":139}]}],"statement":"UPDATE\n    sessions\nSET\n    volunteer_id = :volunteerId!,\n    volunteer_joined_at = NOW(),\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\n    AND volunteer_id IS NULL"};

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
 *     AND volunteer_id IS NULL
 * ```
 */
export const updateSessionVolunteerById = new PreparedQuery<IUpdateSessionVolunteerByIdParams,IUpdateSessionVolunteerByIdResult>(updateSessionVolunteerByIdIR);


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

const insertNewMessageIR: any = {"usedParamSet":{"id":true,"senderId":true,"contents":true,"sessionId":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":103,"b":106}]},{"name":"senderId","required":true,"transform":{"type":"scalar"},"locs":[{"a":109,"b":118}]},{"name":"contents","required":true,"transform":{"type":"scalar"},"locs":[{"a":121,"b":130}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":133,"b":143}]}],"statement":"INSERT INTO session_messages (id, sender_id, contents, session_id, created_at, updated_at)\n    VALUES (:id!, :senderId!, :contents!, :sessionId!, NOW(), NOW())\nRETURNING\n    id"};

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
  end: DateOrString;
  start: DateOrString;
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

const getSessionsWithAvgWaitTimePerDayAndHourIR: any = {"usedParamSet":{"start":true,"end":true},"params":[{"name":"start","required":true,"transform":{"type":"scalar"},"locs":[{"a":511,"b":517}]},{"name":"end","required":true,"transform":{"type":"scalar"},"locs":[{"a":549,"b":553}]}],"statement":"SELECT\n    extract(isodow FROM sessions.created_at)::int AS day,\n    extract(hour FROM sessions.created_at)::int AS hour,\n    COALESCE(AVG(\n            CASE WHEN sessions.volunteer_id IS NULL THEN\n                EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at))\n            ELSE\n                EXTRACT('epoch' FROM (sessions.volunteer_joined_at - sessions.created_at))\n            END), 0)::float * 1000 AS average_wait_time -- in milliseconds\nFROM\n    sessions\nWHERE\n    sessions.created_at >= :start!\n    AND sessions.created_at < :end!\n    AND NOT sessions.ended_at IS NULL\n    AND EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) > 60\nGROUP BY\n    day,\n    hour"};

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

const getSessionsForReferCoworkerIR: any = {"usedParamSet":{"volunteerId":true},"params":[{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":402,"b":414}]}],"statement":"SELECT\n    sessions.id,\n    feedbacks.volunteer_feedback\nFROM\n    sessions\n    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id\n    LEFT JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id\n    LEFT JOIN feedbacks ON feedbacks.session_id = sessions.id\n        AND feedbacks.user_id = sessions.volunteer_id\nWHERE\n    sessions.volunteer_id = :volunteerId!\n    AND sessions.time_tutored >= 15 * 60 * 1000\n    AND (session_flags.name IS NULL\n        OR NOT session_flags.name = ANY ('{\"Absent student\", \"Absent volunteer\"}'))"};

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
  mongoSessionId?: string | null | void;
  sessionId?: string | null | void;
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

const getVolunteersForGentleWarningIR: any = {"usedParamSet":{"sessionId":true,"mongoSessionId":true},"params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":782,"b":791}]},{"name":"mongoSessionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":835,"b":849}]}],"statement":"SELECT\n    users.id,\n    users.email,\n    users.first_name,\n    notification_count.total AS total_notifications\nFROM\n    notifications\n    LEFT JOIN users ON users.id = notifications.user_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = users.id) AS session_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            notifications\n        WHERE\n            notifications.user_id = users.id) AS notification_count ON TRUE\nWHERE\n    users.ban_type IS DISTINCT FROM 'complete'\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND session_count.total = 0\n    AND (notifications.session_id::uuid = :sessionId\n        OR notifications.mongo_id::text = :mongoSessionId)\nGROUP BY\n    users.id,\n    notification_count.total"};

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
 *     users.ban_type IS DISTINCT FROM 'complete'
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
  mongoSessionId?: string | null | void;
  sessionId?: string | null | void;
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

const getStudentForEmailFirstSessionIR: any = {"usedParamSet":{"sessionId":true,"mongoSessionId":true},"params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":335,"b":344}]},{"name":"mongoSessionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":379,"b":393}]}],"statement":"SELECT\n    users.id,\n    users.first_name,\n    users.email\nFROM\n    sessions\n    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id\n    LEFT JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id\n    LEFT JOIN users ON users.id = sessions.student_id\nWHERE (sessions.id::uuid = :sessionId\n    OR sessions.mongo_id::text = :mongoSessionId)\nAND (session_flags.name IS NULL\n    OR NOT session_flags.name = ANY ('{\"Absent student\", \"Absent volunteer\", \"Low coach rating from student\", \"Low session rating from student\" }'))\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE"};

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
  mongoSessionId?: string | null | void;
  sessionId?: string | null | void;
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

const getVolunteerForEmailFirstSessionIR: any = {"usedParamSet":{"sessionId":true,"mongoSessionId":true},"params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":337,"b":346}]},{"name":"mongoSessionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":381,"b":395}]}],"statement":"SELECT\n    users.id,\n    users.first_name,\n    users.email\nFROM\n    sessions\n    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id\n    LEFT JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id\n    LEFT JOIN users ON users.id = sessions.volunteer_id\nWHERE (sessions.id::uuid = :sessionId\n    OR sessions.mongo_id::text = :mongoSessionId)\nAND (session_flags.name IS NULL\n    OR NOT session_flags.name = ANY ('{\"Absent student\", \"Absent volunteer\", \"Low coach rating from student\", \"Low session rating from student\" }'))\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE"};

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
  end: DateOrString;
  firstTimeStudent?: boolean | null | void;
  firstTimeVolunteer?: boolean | null | void;
  limit: number;
  messageCount?: number | null | void;
  offset: number;
  reported?: boolean | null | void;
  sessionLength?: number | null | void;
  showBannedUsers?: boolean | null | void;
  showTestUsers?: boolean | null | void;
  start: DateOrString;
}

/** 'GetSessionsForAdminFilter' return type */
export interface IGetSessionsForAdminFilterResult {
  createdAt: Date;
  endedAt: Date | null;
  id: string;
  reviewReasons: stringArray | null;
  studentBanType: ban_types | null;
  studentEmail: string;
  studentFirstName: string;
  studentTestUser: boolean;
  studentTotalPastSessions: number | null;
  subTopic: string;
  totalMessages: number | null;
  type: string;
  volunteerBanType: ban_types | null;
  volunteerEmail: string;
  volunteerFirstName: string;
  volunteerTestUser: boolean;
  volunteerTotalPastSessions: number | null;
}

/** 'GetSessionsForAdminFilter' query type */
export interface IGetSessionsForAdminFilterQuery {
  params: IGetSessionsForAdminFilterParams;
  result: IGetSessionsForAdminFilterResult;
}

const getSessionsForAdminFilterIR: any = {"usedParamSet":{"start":true,"end":true,"messageCount":true,"sessionLength":true,"reported":true,"showBannedUsers":true,"showTestUsers":true,"firstTimeStudent":true,"firstTimeVolunteer":true,"limit":true,"offset":true},"params":[{"name":"start","required":true,"transform":{"type":"scalar"},"locs":[{"a":2815,"b":2821}]},{"name":"end","required":true,"transform":{"type":"scalar"},"locs":[{"a":2854,"b":2858}]},{"name":"messageCount","required":false,"transform":{"type":"scalar"},"locs":[{"a":2870,"b":2882},{"a":2933,"b":2945}]},{"name":"sessionLength","required":false,"transform":{"type":"scalar"},"locs":[{"a":2964,"b":2977},{"a":3078,"b":3091}]},{"name":"reported","required":false,"transform":{"type":"scalar"},"locs":[{"a":3110,"b":3118},{"a":3150,"b":3158}]},{"name":"showBannedUsers","required":false,"transform":{"type":"scalar"},"locs":[{"a":3388,"b":3403}]},{"name":"showTestUsers","required":false,"transform":{"type":"scalar"},"locs":[{"a":3434,"b":3447},{"a":3479,"b":3492}]},{"name":"firstTimeStudent","required":false,"transform":{"type":"scalar"},"locs":[{"a":3562,"b":3578},{"a":3610,"b":3626}]},{"name":"firstTimeVolunteer","required":false,"transform":{"type":"scalar"},"locs":[{"a":3696,"b":3714},{"a":3746,"b":3764}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":3873,"b":3879}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":3895,"b":3902}]}],"statement":"SELECT\n    sessions.id,\n    sessions.created_at,\n    sessions.ended_at,\n    message_count.total AS total_messages,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    students.first_name AS student_first_name,\n    students.email AS student_email,\n    students.ban_type AS student_ban_type,\n    students.test_user AS student_test_user,\n    student_sessions.total AS student_total_past_sessions,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.email AS volunteer_email,\n    volunteers.ban_type AS volunteer_ban_type,\n    volunteers.test_user AS volunteer_test_user,\n    volunteer_sessions.total AS volunteer_total_past_sessions,\n    review_reasons.review_reasons\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS review_reasons\n        FROM\n            session_review_reasons\n            LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\n        WHERE\n            session_id = sessions.id) AS review_reasons ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            first_name,\n            id,\n            email,\n            ban_type,\n            test_user\n        FROM\n            users\n        WHERE\n            users.id = sessions.student_id) AS students ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            first_name,\n            id,\n            email,\n            ban_type,\n            test_user\n        FROM\n            users\n        WHERE\n            users.id = sessions.volunteer_id) AS volunteers ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            session_messages\n        WHERE\n            session_messages.session_id = sessions.id) AS message_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            sessions.id = session_reports.session_id) AS session_reported_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.student_id = students.id) AS student_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = volunteers.id) AS volunteer_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            MAX(created_at) AS last_banned_at\n        FROM\n            user_actions\n        WHERE\n            user_actions.user_id = sessions.student_id\n            AND user_actions.action = 'BANNED') AS student_banned ON TRUE\nWHERE\n    NOT sessions.ended_at IS NULL\n    AND sessions.created_at >= :start!\n    AND sessions.created_at <= :end!\n    AND ((:messageCount)::int IS NULL\n        OR message_count.total >= (:messageCount)::int)\n    AND ((:sessionLength)::int IS NULL\n        OR (EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) / 60) > (:sessionLength)::int)\n    AND ((:reported)::boolean IS NULL\n        OR (:reported)::boolean IS FALSE\n        OR session_reported_count.total > 0)\n    AND (student_banned.last_banned_at IS NULL\n        OR sessions.created_at < student_banned.last_banned_at\n        OR sessions.shadowbanned IS FALSE\n        OR (:showBannedUsers)::boolean IS TRUE)\n    AND ((:showTestUsers)::boolean IS NULL\n        OR (:showTestUsers)::boolean IS TRUE\n        OR students.test_user IS FALSE)\n    AND ((:firstTimeStudent)::boolean IS NULL\n        OR (:firstTimeStudent)::boolean IS FALSE\n        OR student_sessions.total = 1)\n    AND ((:firstTimeVolunteer)::boolean IS NULL\n        OR (:firstTimeVolunteer)::boolean IS FALSE\n        OR volunteer_sessions.total = 1)\nORDER BY\n    (sessions.created_at) DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int"};

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
 *     students.ban_type AS student_ban_type,
 *     students.test_user AS student_test_user,
 *     student_sessions.total AS student_total_past_sessions,
 *     volunteers.first_name AS volunteer_first_name,
 *     volunteers.email AS volunteer_email,
 *     volunteers.ban_type AS volunteer_ban_type,
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
 *             ban_type,
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
 *             ban_type,
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
 *         OR sessions.shadowbanned IS FALSE
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


/** 'InsertSessionReviewReasons' parameters type */
export interface IInsertSessionReviewReasonsParams {
  reviewReasons: stringArray;
  sessionId: string;
}

/** 'InsertSessionReviewReasons' return type */
export interface IInsertSessionReviewReasonsResult {
  ok: string;
}

/** 'InsertSessionReviewReasons' query type */
export interface IInsertSessionReviewReasonsQuery {
  params: IInsertSessionReviewReasonsParams;
  result: IInsertSessionReviewReasonsResult;
}

const insertSessionReviewReasonsIR: any = {"usedParamSet":{"sessionId":true,"reviewReasons":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":100,"b":110}]},{"name":"reviewReasons","required":true,"transform":{"type":"scalar"},"locs":[{"a":215,"b":229}]}],"statement":"INSERT INTO session_review_reasons (session_id, session_flag_id, created_at, updated_at)\nSELECT\n    :sessionId!,\n    session_flags.id,\n    NOW(),\n    NOW()\nFROM\n    session_flags\nWHERE\n    session_flags.name = ANY (:reviewReasons!::text[])\nON CONFLICT (session_id,\n    session_flag_id)\n    DO UPDATE SET\n        updated_at = NOW()\n    RETURNING\n        session_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_review_reasons (session_id, session_flag_id, created_at, updated_at)
 * SELECT
 *     :sessionId!,
 *     session_flags.id,
 *     NOW(),
 *     NOW()
 * FROM
 *     session_flags
 * WHERE
 *     session_flags.name = ANY (:reviewReasons!::text[])
 * ON CONFLICT (session_id,
 *     session_flag_id)
 *     DO UPDATE SET
 *         updated_at = NOW()
 *     RETURNING
 *         session_id AS ok
 * ```
 */
export const insertSessionReviewReasons = new PreparedQuery<IInsertSessionReviewReasonsParams,IInsertSessionReviewReasonsResult>(insertSessionReviewReasonsIR);


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

const insertSessionFailedJoinIR: any = {"usedParamSet":{"sessionId":true,"userId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":91,"b":101}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":104,"b":111}]}],"statement":"INSERT INTO session_failed_joins (session_id, user_id, created_at, updated_at)\n    VALUES (:sessionId!, :userId!, NOW(), NOW())\nRETURNING\n    session_id AS ok"};

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

const insertSessionPhotoKeyIR: any = {"usedParamSet":{"sessionId":true,"photoKey":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":87,"b":97}]},{"name":"photoKey","required":true,"transform":{"type":"scalar"},"locs":[{"a":100,"b":109}]}],"statement":"INSERT INTO session_photos (session_id, photo_key, created_at, updated_at)\n    VALUES (:sessionId!, :photoKey!, NOW(), NOW())\nRETURNING\n    session_id AS ok"};

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
  end: DateOrString;
  start: DateOrString;
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

const getSessionsForVolunteerHourSummaryIR: any = {"usedParamSet":{"start":true,"end":true,"volunteerId":true},"params":[{"name":"start","required":true,"transform":{"type":"scalar"},"locs":[{"a":476,"b":482}]},{"name":"end","required":true,"transform":{"type":"scalar"},"locs":[{"a":515,"b":519}]},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":591,"b":603}]}],"statement":"SELECT\n    sessions.id AS session_id,\n    sessions.created_at AS created_at,\n    sessions.ended_at AS ended_at,\n    sessions.time_tutored::int AS time_tutored,\n    subjects.name AS subject,\n    topics.name AS topic,\n    sessions.volunteer_joined_at AS volunteer_joined_at\nFROM\n    sessions\n    JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN topics ON topics.id = subjects.topic_id\n    JOIN users ON users.id = sessions.student_id\nWHERE\n    sessions.created_at >= :start!\n    AND sessions.created_at <= :end!\n    AND sessions.ended_at IS NOT NULL\n    AND sessions.volunteer_id = :volunteerId!\n    AND users.test_user = FALSE"};

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


/** 'GetFilteredSessionHistory' parameters type */
export interface IGetFilteredSessionHistoryParams {
  limit: number;
  minSessionLength: number;
  offset: number;
  studentFirstName?: string | null | void;
  studentId?: string | null | void;
  subjectName?: string | null | void;
  userId: string;
  volunteerFirstName?: string | null | void;
  volunteerId?: string | null | void;
}

/** 'GetFilteredSessionHistory' return type */
export interface IGetFilteredSessionHistoryResult {
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
  volunteerId: string | null;
}

/** 'GetFilteredSessionHistory' query type */
export interface IGetFilteredSessionHistoryQuery {
  params: IGetFilteredSessionHistoryParams;
  result: IGetFilteredSessionHistoryResult;
}

const getFilteredSessionHistoryIR: any = {"usedParamSet":{"userId":true,"minSessionLength":true,"studentId":true,"volunteerId":true,"studentFirstName":true,"volunteerFirstName":true,"subjectName":true,"limit":true,"offset":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":220,"b":227},{"a":255,"b":262}]},{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"locs":[{"a":1268,"b":1285}]},{"name":"studentId","required":false,"transform":{"type":"scalar"},"locs":[{"a":1411,"b":1420}]},{"name":"volunteerId","required":false,"transform":{"type":"scalar"},"locs":[{"a":1491,"b":1502}]},{"name":"studentFirstName","required":false,"transform":{"type":"scalar"},"locs":[{"a":1543,"b":1559},{"a":1621,"b":1637}]},{"name":"volunteerFirstName","required":false,"transform":{"type":"scalar"},"locs":[{"a":1650,"b":1668},{"a":1732,"b":1750}]},{"name":"subjectName","required":false,"transform":{"type":"scalar"},"locs":[{"a":1763,"b":1774},{"a":1817,"b":1828}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":1867,"b":1873}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":1889,"b":1896}]}],"statement":"WITH sessions AS (\n    SELECT\n        id,\n        time_tutored,\n        volunteer_id,\n        student_id,\n        subject_id,\n        ended_at,\n        created_at\n    FROM\n        sessions\n    WHERE\n        student_id = :userId!\n        OR volunteer_id = :userId!\n)\nSELECT\n    sessions.id,\n    sessions.created_at AS created_at,\n    sessions.time_tutored::int AS time_tutored,\n    subjects.display_name AS subject,\n    topics.name AS topic,\n    topics.icon_link AS topic_icon_link,\n    volunteers.first_name AS volunteer_first_name,\n    students.first_name AS student_first_name,\n    sessions.volunteer_id,\n    sessions.student_id,\n    (\n        CASE WHEN favorited.volunteer_id = sessions.volunteer_id THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_favorited\nFROM\n    sessions\n    JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id\n    LEFT JOIN users students ON sessions.student_id = students.id\n    LEFT JOIN student_favorite_volunteers favorited ON (students.id = favorited.student_id\n            AND volunteers.id = favorited.volunteer_id)\nWHERE\n    sessions.time_tutored IS NOT NULL\n    AND sessions.time_tutored > :minSessionLength!::int\n    AND sessions.volunteer_id IS NOT NULL\n    AND sessions.ended_at IS NOT NULL\n    AND sessions.student_id = coalesce(:studentId::uuid, sessions.student_id)\n    AND sessions.volunteer_id = coalesce(:volunteerId::uuid, sessions.volunteer_id)\n    AND (:studentFirstName::text IS NULL\n        OR LOWER(students.first_name) = LOWER(:studentFirstName))\n    AND (:volunteerFirstName::text IS NULL\n        OR LOWER(volunteers.first_name) = LOWER(:volunteerFirstName))\n    AND (:subjectName::text IS NULL\n        OR subjects.name = :subjectName)\nORDER BY\n    created_at DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int"};

/**
 * Query generated from SQL:
 * ```
 * WITH sessions AS (
 *     SELECT
 *         id,
 *         time_tutored,
 *         volunteer_id,
 *         student_id,
 *         subject_id,
 *         ended_at,
 *         created_at
 *     FROM
 *         sessions
 *     WHERE
 *         student_id = :userId!
 *         OR volunteer_id = :userId!
 * )
 * SELECT
 *     sessions.id,
 *     sessions.created_at AS created_at,
 *     sessions.time_tutored::int AS time_tutored,
 *     subjects.display_name AS subject,
 *     topics.name AS topic,
 *     topics.icon_link AS topic_icon_link,
 *     volunteers.first_name AS volunteer_first_name,
 *     students.first_name AS student_first_name,
 *     sessions.volunteer_id,
 *     sessions.student_id,
 *     (
 *         CASE WHEN favorited.volunteer_id = sessions.volunteer_id THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_favorited
 * FROM
 *     sessions
 *     JOIN subjects ON subjects.id = sessions.subject_id
 *     JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id
 *     LEFT JOIN users students ON sessions.student_id = students.id
 *     LEFT JOIN student_favorite_volunteers favorited ON (students.id = favorited.student_id
 *             AND volunteers.id = favorited.volunteer_id)
 * WHERE
 *     sessions.time_tutored IS NOT NULL
 *     AND sessions.time_tutored > :minSessionLength!::int
 *     AND sessions.volunteer_id IS NOT NULL
 *     AND sessions.ended_at IS NOT NULL
 *     AND sessions.student_id = coalesce(:studentId::uuid, sessions.student_id)
 *     AND sessions.volunteer_id = coalesce(:volunteerId::uuid, sessions.volunteer_id)
 *     AND (:studentFirstName::text IS NULL
 *         OR LOWER(students.first_name) = LOWER(:studentFirstName))
 *     AND (:volunteerFirstName::text IS NULL
 *         OR LOWER(volunteers.first_name) = LOWER(:volunteerFirstName))
 *     AND (:subjectName::text IS NULL
 *         OR subjects.name = :subjectName)
 * ORDER BY
 *     created_at DESC
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
export const getFilteredSessionHistory = new PreparedQuery<IGetFilteredSessionHistoryParams,IGetFilteredSessionHistoryResult>(getFilteredSessionHistoryIR);


/** 'GetFilteredSessionHistoryTotalCount' parameters type */
export interface IGetFilteredSessionHistoryTotalCountParams {
  minSessionLength: number;
  studentFirstName?: string | null | void;
  studentId?: string | null | void;
  subjectName?: string | null | void;
  userId: string;
  volunteerFirstName?: string | null | void;
  volunteerId?: string | null | void;
}

/** 'GetFilteredSessionHistoryTotalCount' return type */
export interface IGetFilteredSessionHistoryTotalCountResult {
  count: number | null;
}

/** 'GetFilteredSessionHistoryTotalCount' query type */
export interface IGetFilteredSessionHistoryTotalCountQuery {
  params: IGetFilteredSessionHistoryTotalCountParams;
  result: IGetFilteredSessionHistoryTotalCountResult;
}

const getFilteredSessionHistoryTotalCountIR: any = {"usedParamSet":{"userId":true,"minSessionLength":true,"studentId":true,"volunteerId":true,"studentFirstName":true,"volunteerFirstName":true,"subjectName":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":220,"b":227},{"a":255,"b":262}]},{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"locs":[{"a":774,"b":791}]},{"name":"studentId","required":false,"transform":{"type":"scalar"},"locs":[{"a":917,"b":926}]},{"name":"volunteerId","required":false,"transform":{"type":"scalar"},"locs":[{"a":997,"b":1008}]},{"name":"studentFirstName","required":false,"transform":{"type":"scalar"},"locs":[{"a":1049,"b":1065},{"a":1127,"b":1143}]},{"name":"volunteerFirstName","required":false,"transform":{"type":"scalar"},"locs":[{"a":1156,"b":1174},{"a":1238,"b":1256}]},{"name":"subjectName","required":false,"transform":{"type":"scalar"},"locs":[{"a":1269,"b":1280},{"a":1323,"b":1334}]}],"statement":"WITH sessions AS (\n    SELECT\n        id,\n        time_tutored,\n        volunteer_id,\n        student_id,\n        subject_id,\n        ended_at,\n        created_at\n    FROM\n        sessions\n    WHERE\n        student_id = :userId!\n        OR volunteer_id = :userId!\n)\nSELECT\n    COUNT(*)::int\nFROM\n    sessions\n    JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id\n    LEFT JOIN users students ON sessions.student_id = students.id\n    LEFT JOIN student_favorite_volunteers favorited ON (students.id = favorited.student_id\n            AND volunteers.id = favorited.volunteer_id)\nWHERE\n    sessions.time_tutored IS NOT NULL\n    AND sessions.time_tutored > :minSessionLength!::int\n    AND sessions.volunteer_id IS NOT NULL\n    AND sessions.ended_at IS NOT NULL\n    AND sessions.student_id = coalesce(:studentId::uuid, sessions.student_id)\n    AND sessions.volunteer_id = coalesce(:volunteerId::uuid, sessions.volunteer_id)\n    AND (:studentFirstName::text IS NULL\n        OR LOWER(students.first_name) = LOWER(:studentFirstName))\n    AND (:volunteerFirstName::text IS NULL\n        OR LOWER(volunteers.first_name) = LOWER(:volunteerFirstName))\n    AND (:subjectName::text IS NULL\n        OR subjects.name = :subjectName)"};

/**
 * Query generated from SQL:
 * ```
 * WITH sessions AS (
 *     SELECT
 *         id,
 *         time_tutored,
 *         volunteer_id,
 *         student_id,
 *         subject_id,
 *         ended_at,
 *         created_at
 *     FROM
 *         sessions
 *     WHERE
 *         student_id = :userId!
 *         OR volunteer_id = :userId!
 * )
 * SELECT
 *     COUNT(*)::int
 * FROM
 *     sessions
 *     JOIN subjects ON subjects.id = sessions.subject_id
 *     JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id
 *     LEFT JOIN users students ON sessions.student_id = students.id
 *     LEFT JOIN student_favorite_volunteers favorited ON (students.id = favorited.student_id
 *             AND volunteers.id = favorited.volunteer_id)
 * WHERE
 *     sessions.time_tutored IS NOT NULL
 *     AND sessions.time_tutored > :minSessionLength!::int
 *     AND sessions.volunteer_id IS NOT NULL
 *     AND sessions.ended_at IS NOT NULL
 *     AND sessions.student_id = coalesce(:studentId::uuid, sessions.student_id)
 *     AND sessions.volunteer_id = coalesce(:volunteerId::uuid, sessions.volunteer_id)
 *     AND (:studentFirstName::text IS NULL
 *         OR LOWER(students.first_name) = LOWER(:studentFirstName))
 *     AND (:volunteerFirstName::text IS NULL
 *         OR LOWER(volunteers.first_name) = LOWER(:volunteerFirstName))
 *     AND (:subjectName::text IS NULL
 *         OR subjects.name = :subjectName)
 * ```
 */
export const getFilteredSessionHistoryTotalCount = new PreparedQuery<IGetFilteredSessionHistoryTotalCountParams,IGetFilteredSessionHistoryTotalCountResult>(getFilteredSessionHistoryTotalCountIR);


/** 'IsEligibleForSessionRecap' parameters type */
export interface IIsEligibleForSessionRecapParams {
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

const isEligibleForSessionRecapIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":151,"b":161}]}],"statement":"SELECT\n    CASE WHEN sessions.id IS NOT NULL THEN\n        TRUE\n    ELSE\n        FALSE\n    END AS is_eligible\nFROM\n    sessions\nWHERE\n    sessions.id = :sessionId!\n    AND sessions.volunteer_id IS NOT NULL\n    AND sessions.ended_at IS NOT NULL\n    AND EXISTS (\n        SELECT\n            1\n        FROM\n            session_messages\n        WHERE\n            session_id = sessions.id\n            AND sender_id = sessions.volunteer_id)\n    AND EXISTS (\n        SELECT\n            1\n        FROM\n            session_messages\n        WHERE\n            session_id = sessions.id\n            AND sender_id = sessions.student_id)"};

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
 *     AND sessions.volunteer_id IS NOT NULL
 *     AND sessions.ended_at IS NOT NULL
 *     AND EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             session_messages
 *         WHERE
 *             session_id = sessions.id
 *             AND sender_id = sessions.volunteer_id)
 *     AND EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             session_messages
 *         WHERE
 *             session_id = sessions.id
 *             AND sender_id = sessions.student_id)
 * ```
 */
export const isEligibleForSessionRecap = new PreparedQuery<IIsEligibleForSessionRecapParams,IIsEligibleForSessionRecapResult>(isEligibleForSessionRecapIR);


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

const getTotalSessionHistoryIR: any = {"usedParamSet":{"userId":true,"minSessionLength":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":211,"b":218},{"a":243,"b":250}]},{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"locs":[{"a":319,"b":336}]}],"statement":"SELECT\n    count(*)::int AS total\nFROM\n    sessions\n    LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id\n    LEFT JOIN users students ON sessions.student_id = students.id\nWHERE (students.id = :userId!\n    OR volunteers.id = :userId!)\nAND sessions.time_tutored IS NOT NULL\nAND sessions.time_tutored > :minSessionLength!::int\nAND sessions.volunteer_id IS NOT NULL"};

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

const getSessionRecapIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1042,"b":1052}]}],"statement":"SELECT\n    sessions.id,\n    sessions.created_at,\n    sessions.ended_at,\n    sessions.time_tutored::int,\n    subjects.display_name AS subject,\n    subjects.name AS subject_key,\n    topics.name AS topic,\n    topics.icon_link AS topic_icon_link,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.id AS volunteer_id,\n    students.id AS student_id,\n    students.first_name AS student_first_name,\n    (\n        CASE WHEN favorited.volunteer_id = sessions.volunteer_id THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_favorited,\n    sessions.quill_doc,\n    sessions.has_whiteboard_doc\nFROM\n    sessions\n    JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id\n    LEFT JOIN users students ON sessions.student_id = students.id\n    LEFT JOIN student_favorite_volunteers favorited ON students.id = favorited.student_id\n        AND volunteers.id = favorited.volunteer_id\nWHERE\n    sessions.id = :sessionId!"};

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
  sessionId?: string | null | void;
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

const volunteerSentMessageAfterSessionEndedIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":144,"b":153}]}],"statement":"SELECT\n    session_messages.id\nFROM\n    sessions\n    JOIN session_messages ON sessions.id = session_messages.session_id\nWHERE\n    sessions.id = :sessionId\n    AND session_messages.sender_id = sessions.volunteer_id\n    AND session_messages.created_at > sessions.ended_at\nLIMIT 1"};

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

const sessionHasBannedParticipantIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":366,"b":376}]}],"statement":"SELECT\n    sessions.id\nFROM\n    sessions\n    JOIN student_profiles ON student_profiles.user_id = sessions.student_id\n    JOIN users students ON student_profiles.user_id = students.id\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = sessions.volunteer_id\n    JOIN users volunteers ON volunteer_profiles.user_id = volunteers.id\nWHERE\n    sessions.id = :sessionId!\n    AND (students.ban_type = 'complete'\n        OR volunteers.ban_type = 'complete')\nLIMIT 1"};

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
 *     AND (students.ban_type = 'complete'
 *         OR volunteers.ban_type = 'complete')
 * LIMIT 1
 * ```
 */
export const sessionHasBannedParticipant = new PreparedQuery<ISessionHasBannedParticipantParams,ISessionHasBannedParticipantResult>(sessionHasBannedParticipantIR);


/** 'GetUserSessionsByUserId' parameters type */
export interface IGetUserSessionsByUserIdParams {
  end?: DateOrString | null | void;
  sessionId?: string | null | void;
  start?: DateOrString | null | void;
  subject: string;
  topic?: string | null | void;
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

const getUserSessionsByUserIdIR: any = {"usedParamSet":{"userId":true,"start":true,"end":true,"subject":true,"sessionId":true,"topic":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":332,"b":339},{"a":372,"b":379}]},{"name":"start","required":false,"transform":{"type":"scalar"},"locs":[{"a":388,"b":393},{"a":448,"b":453}]},{"name":"end","required":false,"transform":{"type":"scalar"},"locs":[{"a":476,"b":479},{"a":534,"b":537}]},{"name":"subject","required":true,"transform":{"type":"scalar"},"locs":[{"a":560,"b":567},{"a":608,"b":616}]},{"name":"sessionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":631,"b":640},{"a":677,"b":686}]},{"name":"topic","required":false,"transform":{"type":"scalar"},"locs":[{"a":701,"b":706},{"a":745,"b":750}]}],"statement":"SELECT\n    sessions.id,\n    sessions.created_at,\n    subjects.name AS subject_name,\n    topics.name AS topic_name,\n    quill_doc,\n    sessions.student_id,\n    sessions.volunteer_id\nFROM\n    sessions\n    JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN topics ON topics.id = subjects.topic_id\nWHERE (sessions.student_id = :userId!\n    OR sessions.volunteer_id = :userId!)\nAND ((:start)::timestamptz IS NULL\n    OR sessions.created_at >= (:start)::timestamptz)\nAND ((:end)::timestamptz IS NULL\n    OR sessions.created_at <= (:end)::timestamptz)\nAND ((:subject)::text IS NULL\n    OR subjects.name = (:subject!)::text)\nAND (:sessionId::uuid IS NULL\n    OR sessions.id = :sessionId::uuid)\nAND ((:topic)::text IS NULL\n    OR topics.name = (:topic)::text)\nORDER BY\n    sessions.created_at DESC"};

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
 * AND ((:start)::timestamptz IS NULL
 *     OR sessions.created_at >= (:start)::timestamptz)
 * AND ((:end)::timestamptz IS NULL
 *     OR sessions.created_at <= (:end)::timestamptz)
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

const getUserSessionStatsIR: any = {"usedParamSet":{"minSessionLength":true,"userId":true},"params":[{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"locs":[{"a":173,"b":190}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":439,"b":446},{"a":487,"b":494}]}],"statement":"SELECT\n    subjects.name AS subject_name,\n    topics.name AS topic_name,\n    COUNT(sessions.id)::int AS total_requested,\n    SUM(\n        CASE WHEN sessions.time_tutored >= :minSessionLength!::int THEN\n            1\n        ELSE\n            0\n        END)::int AS total_helped\nFROM\n    subjects\n    JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN sessions ON subjects.id = sessions.subject_id\n        AND (sessions.student_id = :userId!\n            OR sessions.volunteer_id = :userId!)\nWHERE\n    subjects.active IS TRUE\nGROUP BY\n    subjects.name,\n    topics.name"};

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


/** 'GetStudentSessionDetails' parameters type */
export interface IGetStudentSessionDetailsParams {
  studentId: string;
}

/** 'GetStudentSessionDetails' return type */
export interface IGetStudentSessionDetailsResult {
  createdAt: Date;
  endedAt: Date | null;
  firstName: string;
  id: string;
  lastName: string;
  messageCount: string | null;
  name: string;
  volunteerId: string | null;
}

/** 'GetStudentSessionDetails' query type */
export interface IGetStudentSessionDetailsQuery {
  params: IGetStudentSessionDetailsParams;
  result: IGetStudentSessionDetailsResult;
}

const getStudentSessionDetailsIR: any = {"usedParamSet":{"studentId":true},"params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":404,"b":414}]}],"statement":"SELECT\n    sessions.id,\n    sessions.volunteer_id,\n    subjects.name,\n    sessions.ended_at,\n    sessions.created_at,\n    users.first_name,\n    users.last_name,\n    COUNT(session_id) AS message_count\nFROM\n    sessions\n    LEFT JOIN session_messages ON sessions.id = session_id\n    JOIN subjects ON sessions.subject_id = subjects.id\n    JOIN users ON sessions.student_id = users.id\nWHERE\n    student_id = :studentId!\n    AND sessions.ended_at IS NOT NULL\nGROUP BY\n    sessions.id,\n    sessions.volunteer_id,\n    subjects.name,\n    sessions.ended_at,\n    sessions.created_at,\n    users.first_name,\n    users.last_name"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     sessions.volunteer_id,
 *     subjects.name,
 *     sessions.ended_at,
 *     sessions.created_at,
 *     users.first_name,
 *     users.last_name,
 *     COUNT(session_id) AS message_count
 * FROM
 *     sessions
 *     LEFT JOIN session_messages ON sessions.id = session_id
 *     JOIN subjects ON sessions.subject_id = subjects.id
 *     JOIN users ON sessions.student_id = users.id
 * WHERE
 *     student_id = :studentId!
 *     AND sessions.ended_at IS NOT NULL
 * GROUP BY
 *     sessions.id,
 *     sessions.volunteer_id,
 *     subjects.name,
 *     sessions.ended_at,
 *     sessions.created_at,
 *     users.first_name,
 *     users.last_name
 * ```
 */
export const getStudentSessionDetails = new PreparedQuery<IGetStudentSessionDetailsParams,IGetStudentSessionDetailsResult>(getStudentSessionDetailsIR);


/** 'GetTutorBotSessionMessagesBySessionId' parameters type */
export interface IGetTutorBotSessionMessagesBySessionIdParams {
  sessionId: string;
}

/** 'GetTutorBotSessionMessagesBySessionId' return type */
export interface IGetTutorBotSessionMessagesBySessionIdResult {
  createdAt: Date;
  id: string;
  message: string | null;
  sessionId: string;
  tutorBotSessionUserType: tutor_bot_session_user_type;
}

/** 'GetTutorBotSessionMessagesBySessionId' query type */
export interface IGetTutorBotSessionMessagesBySessionIdQuery {
  params: IGetTutorBotSessionMessagesBySessionIdParams;
  result: IGetTutorBotSessionMessagesBySessionIdResult;
}

const getTutorBotSessionMessagesBySessionIdIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":72,"b":82}]}],"statement":"SELECT\n    *\nFROM\n    tutor_bot_session_messages\nWHERE\n    session_id = :sessionId!\nORDER BY\n    created_at ASC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     tutor_bot_session_messages
 * WHERE
 *     session_id = :sessionId!
 * ORDER BY
 *     created_at ASC
 * ```
 */
export const getTutorBotSessionMessagesBySessionId = new PreparedQuery<IGetTutorBotSessionMessagesBySessionIdParams,IGetTutorBotSessionMessagesBySessionIdResult>(getTutorBotSessionMessagesBySessionIdIR);


/** 'InsertTutorBotSessionMessage' parameters type */
export interface IInsertTutorBotSessionMessageParams {
  id: string;
  message: string;
  sessionId: string;
  userType: tutor_bot_session_user_type;
}

/** 'InsertTutorBotSessionMessage' return type */
export interface IInsertTutorBotSessionMessageResult {
  createdAt: Date;
  id: string;
  message: string | null;
  sessionId: string;
  tutorBotSessionUserType: tutor_bot_session_user_type;
}

/** 'InsertTutorBotSessionMessage' query type */
export interface IInsertTutorBotSessionMessageQuery {
  params: IInsertTutorBotSessionMessageParams;
  result: IInsertTutorBotSessionMessageResult;
}

const insertTutorBotSessionMessageIR: any = {"usedParamSet":{"id":true,"sessionId":true,"message":true,"userType":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":106,"b":109}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":112,"b":122}]},{"name":"message","required":true,"transform":{"type":"scalar"},"locs":[{"a":125,"b":133}]},{"name":"userType","required":true,"transform":{"type":"scalar"},"locs":[{"a":136,"b":145}]}],"statement":"INSERT INTO tutor_bot_session_messages (id, session_id, message, tutor_bot_session_user_type)\n    VALUES (:id!, :sessionId!, :message!, :userType!)\nRETURNING\n    id, session_id, message, tutor_bot_session_user_type, created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO tutor_bot_session_messages (id, session_id, message, tutor_bot_session_user_type)
 *     VALUES (:id!, :sessionId!, :message!, :userType!)
 * RETURNING
 *     id, session_id, message, tutor_bot_session_user_type, created_at
 * ```
 */
export const insertTutorBotSessionMessage = new PreparedQuery<IInsertTutorBotSessionMessageParams,IInsertTutorBotSessionMessageResult>(insertTutorBotSessionMessageIR);


/** 'GetSessionTranscript' parameters type */
export interface IGetSessionTranscriptParams {
  sessionId: string;
}

/** 'GetSessionTranscript' return type */
export interface IGetSessionTranscriptResult {
  createdAt: Date | null;
  message: string | null;
  messageId: string | null;
  messageType: string | null;
  role: string | null;
  userId: string | null;
}

/** 'GetSessionTranscript' query type */
export interface IGetSessionTranscriptQuery {
  params: IGetSessionTranscriptParams;
  result: IGetSessionTranscriptResult;
}

const getSessionTranscriptIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":444,"b":454},{"a":871,"b":881},{"a":1297,"b":1307}]}],"statement":"SELECT\n    sm.id AS message_id,\n    sender_id AS user_id,\n    contents AS message,\n    sm.created_at,\n    CASE WHEN sm.created_at > s.ended_at THEN\n        'direct_message'\n    ELSE\n        'session_message'\n    END AS message_type,\n    CASE WHEN s.volunteer_id = sm.sender_id THEN\n        'volunteer'\n    ELSE\n        'student'\n    END AS ROLE\nFROM\n    session_messages sm\n    JOIN sessions s ON sm.session_id = s.id\nWHERE\n    sm.session_id = :sessionId!\nUNION\nSELECT\n    satm.id AS message_id,\n    satm.user_id,\n    satm.message,\n    satm.said_at AS created_at,\n    CASE WHEN TRUE THEN\n        'transcription'\n    END AS message_type,\n    CASE WHEN s.volunteer_id = satm.user_id THEN\n        'volunteer'\n    ELSE\n        'student'\n    END AS ROLE\nFROM\n    session_audio_transcript_messages satm\n    JOIN sessions s ON satm.session_id = s.id\nWHERE\n    satm.session_id = :sessionId!\nUNION\nSELECT\n    svm.id AS message_id,\n    svm.sender_id AS user_id,\n    svm.transcript AS message,\n    svm.created_at,\n    CASE WHEN TRUE THEN\n        'voice_message'\n    END AS message_type,\n    CASE WHEN s.volunteer_id = svm.sender_id THEN\n        'volunteer'\n    ELSE\n        'student'\n    END AS ROLE\nFROM\n    session_voice_messages svm\n    JOIN sessions s ON svm.session_id = s.id\nWHERE\n    svm.session_id = :sessionId!\nORDER BY\n    created_at ASC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sm.id AS message_id,
 *     sender_id AS user_id,
 *     contents AS message,
 *     sm.created_at,
 *     CASE WHEN sm.created_at > s.ended_at THEN
 *         'direct_message'
 *     ELSE
 *         'session_message'
 *     END AS message_type,
 *     CASE WHEN s.volunteer_id = sm.sender_id THEN
 *         'volunteer'
 *     ELSE
 *         'student'
 *     END AS ROLE
 * FROM
 *     session_messages sm
 *     JOIN sessions s ON sm.session_id = s.id
 * WHERE
 *     sm.session_id = :sessionId!
 * UNION
 * SELECT
 *     satm.id AS message_id,
 *     satm.user_id,
 *     satm.message,
 *     satm.said_at AS created_at,
 *     CASE WHEN TRUE THEN
 *         'transcription'
 *     END AS message_type,
 *     CASE WHEN s.volunteer_id = satm.user_id THEN
 *         'volunteer'
 *     ELSE
 *         'student'
 *     END AS ROLE
 * FROM
 *     session_audio_transcript_messages satm
 *     JOIN sessions s ON satm.session_id = s.id
 * WHERE
 *     satm.session_id = :sessionId!
 * UNION
 * SELECT
 *     svm.id AS message_id,
 *     svm.sender_id AS user_id,
 *     svm.transcript AS message,
 *     svm.created_at,
 *     CASE WHEN TRUE THEN
 *         'voice_message'
 *     END AS message_type,
 *     CASE WHEN s.volunteer_id = svm.sender_id THEN
 *         'volunteer'
 *     ELSE
 *         'student'
 *     END AS ROLE
 * FROM
 *     session_voice_messages svm
 *     JOIN sessions s ON svm.session_id = s.id
 * WHERE
 *     svm.session_id = :sessionId!
 * ORDER BY
 *     created_at ASC
 * ```
 */
export const getSessionTranscript = new PreparedQuery<IGetSessionTranscriptParams,IGetSessionTranscriptResult>(getSessionTranscriptIR);


/** 'GetUniqueStudentsHelpedCount' parameters type */
export interface IGetUniqueStudentsHelpedCountParams {
  minSessionLength: number;
  userId: string;
}

/** 'GetUniqueStudentsHelpedCount' return type */
export interface IGetUniqueStudentsHelpedCountResult {
  total: number | null;
}

/** 'GetUniqueStudentsHelpedCount' query type */
export interface IGetUniqueStudentsHelpedCountQuery {
  params: IGetUniqueStudentsHelpedCountParams;
  result: IGetUniqueStudentsHelpedCountResult;
}

const getUniqueStudentsHelpedCountIR: any = {"usedParamSet":{"userId":true,"minSessionLength":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":95,"b":102}]},{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"locs":[{"a":128,"b":145}]}],"statement":"SELECT\n    COUNT(DISTINCT student_id)::int AS total\nFROM\n    sessions\nWHERE\n    volunteer_id = :userId!\n    AND time_tutored >= :minSessionLength!::int\n    AND ended_at IS NOT NULL"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     COUNT(DISTINCT student_id)::int AS total
 * FROM
 *     sessions
 * WHERE
 *     volunteer_id = :userId!
 *     AND time_tutored >= :minSessionLength!::int
 *     AND ended_at IS NOT NULL
 * ```
 */
export const getUniqueStudentsHelpedCount = new PreparedQuery<IGetUniqueStudentsHelpedCountParams,IGetUniqueStudentsHelpedCountResult>(getUniqueStudentsHelpedCountIR);


