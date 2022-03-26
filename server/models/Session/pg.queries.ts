/** Types generated for queries found in "server/models/Session/session.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type stringArray = (string)[];

/** 'AddNotification' parameters type */
export interface IAddNotificationParams {
  id: string;
  method: string;
  priorityGroup: string;
  sentAt: Date;
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

const addNotificationIR: any = {"name":"addNotification","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":178,"b":180,"line":6,"col":5}]}},{"name":"volunteer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":188,"b":197,"line":7,"col":5}]}},{"name":"sentAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":205,"b":211,"line":8,"col":5}]}},{"name":"wasSuccessful","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":312,"b":325,"line":12,"col":5}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":333,"b":342,"line":13,"col":5}]}},{"name":"type","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":515,"b":519,"line":21,"col":31}]}},{"name":"method","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":560,"b":566,"line":22,"col":39}]}},{"name":"priorityGroup","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":613,"b":626,"line":23,"col":45}]}}],"usedParamSet":{"id":true,"volunteer":true,"sentAt":true,"wasSuccessful":true,"sessionId":true,"type":true,"method":true,"priorityGroup":true},"statement":{"body":"INSERT INTO notifications (id, user_id, sent_at, type_id, method_id, priority_group_id, successful, session_id, created_at, updated_at)\nSELECT\n    :id!,\n    :volunteer!,\n    :sentAt!,\n    notification_types.id,\n    notification_methods.id,\n    notification_priority_groups.id,\n    :wasSuccessful!,\n    :sessionId!,\n    NOW(),\n    NOW()\nFROM\n    notification_types\n    JOIN notification_methods ON TRUE\n    JOIN notification_priority_groups ON TRUE\nWHERE\n    notification_types.type = :type!\n    AND notification_methods.method = :method!\n    AND notification_priority_groups.name = :priorityGroup!\nRETURNING\n    id AS ok","loc":{"a":30,"b":649,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO notifications (id, user_id, sent_at, type_id, method_id, priority_group_id, successful, session_id, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :volunteer!,
 *     :sentAt!,
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
  subTopic: string;
  type: string;
  volunteer: string | null;
}

/** 'GetUnfilledSessions' query type */
export interface IGetUnfilledSessionsQuery {
  params: IGetUnfilledSessionsParams;
  result: IGetUnfilledSessionsResult;
}

const getUnfilledSessionsIR: any = {"name":"getUnfilledSessions","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1429,"b":1434,"line":53,"col":31}]}}],"usedParamSet":{"start":true},"statement":{"body":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.volunteer_id AS volunteer,\n    sessions.created_at,\n    users.first_name AS student_first_name,\n    users.test_user AS student_test_user,\n    session_count.total = 1 AS is_first_time_student\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    JOIN LATERAL (\n        SELECT\n            COUNT(*) AS total\n        FROM\n            sessions\n        WHERE\n            student_id = users.id) AS session_count ON TRUE\nWHERE\n    sessions.volunteer_id IS NULL\n    AND sessions.ended_at IS NULL\n    AND sessions.created_at > :start!\n    AND users.banned IS FALSE\nORDER BY\n    sessions.created_at","loc":{"a":686,"b":1497,"line":29,"col":0}}};

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
 *     session_count.total = 1 AS is_first_time_student
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
  hasWhiteboardDoc: boolean;
  id: string;
  quillDoc: string | null;
  reported: boolean | null;
  reviewed: boolean;
  studentBanned: boolean | null;
  studentId: string;
  subject: string;
  timeTutored: number | null;
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

const getSessionByIdIR: any = {"name":"getSessionById","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2454,"b":2463,"line":92,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    student_id,\n    volunteer_id,\n    subjects.name AS subject,\n    topics.name AS topic,\n    has_whiteboard_doc,\n    quill_doc,\n    volunteer_joined_at,\n    ended_at,\n    user_roles.name AS ended_by_role,\n    reviewed,\n    to_review,\n    student_banned,\n    (time_tutored)::float,\n    sessions.created_at,\n    sessions.updated_at,\n    session_reported_count.total <> 0 AS reported\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id\n    LEFT JOIN session_reports ON session_reports.session_id = sessions.id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE\nWHERE\n    sessions.id = :sessionId!","loc":{"a":1529,"b":2463,"line":60,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     student_id,
 *     volunteer_id,
 *     subjects.name AS subject,
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
 *     session_reported_count.total <> 0 AS reported
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

const insertSessionFlagByIdIR: any = {"name":"insertSessionFlagById","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2603,"b":2612,"line":98,"col":5}]}},{"name":"flag","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2699,"b":2703,"line":105,"col":12}]}}],"usedParamSet":{"sessionId":true,"flag":true},"statement":{"body":"INSERT INTO sessions_session_flags (session_id, session_flag_id, created_at, updated_at)\nSELECT\n    :sessionId!,\n    session_flags.id,\n    NOW(),\n    NOW()\nFROM\n    session_flags\nWHERE\n    name = :flag!\nON CONFLICT (session_id,\n    session_flag_id)\n    DO UPDATE SET\n        updated_at = NOW()\n    RETURNING\n        session_id AS ok","loc":{"a":2502,"b":2833,"line":96,"col":0}}};

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

const updateSessionReviewedStatusByIdIR: any = {"name":"updateSessionReviewedStatusById","params":[{"name":"reviewed","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2922,"b":2930,"line":118,"col":16}]}},{"name":"toReview","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2950,"b":2958,"line":119,"col":17}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3000,"b":3009,"line":122,"col":10}]}}],"usedParamSet":{"reviewed":true,"toReview":true,"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    reviewed = :reviewed!,\n    to_review = :toReview!,\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":2882,"b":3032,"line":115,"col":0}}};

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

const getSessionToEndByIdIR: any = {"name":"getSessionToEndById","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4779,"b":4788,"line":176,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    student_id,\n    volunteer_id,\n    subjects.name AS subject,\n    topics.name AS topic,\n    volunteer_joined_at,\n    ended_at,\n    sessions.created_at,\n    sessions.updated_at,\n    students.first_name AS student_first_name,\n    students.email AS student_email,\n    student_sessions.total AS student_num_past_sessions,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.email AS volunteer_email,\n    volunteer_sessions.total AS volunteer_num_past_sessions,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    session_reported_count.total <> 0 AS reported\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users students ON students.id = sessions.student_id\n    LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.student_id = students.id) AS student_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = volunteers.id) AS volunteer_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = volunteers.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    sessions.id = :sessionId!","loc":{"a":3069,"b":4788,"line":128,"col":0}}};

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
}

/** 'GetSessionsToReview' return type */
export interface IGetSessionsToReviewResult {
  createdAt: Date;
  endedAt: Date | null;
  flags: stringArray | null;
  id: string;
  isReported: boolean | null;
  reviewReasons: stringArray | null;
  studentFirstName: string;
  subTopic: string;
  totalMessages: number | null;
  type: string;
  volunteer: string | null;
}

/** 'GetSessionsToReview' query type */
export interface IGetSessionsToReviewQuery {
  params: IGetSessionsToReviewParams;
  result: IGetSessionsToReviewResult;
}

const getSessionsToReviewIR: any = {"name":"getSessionsToReview","params":[{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6584,"b":6589,"line":232,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6606,"b":6612,"line":232,"col":30}]}}],"usedParamSet":{"limit":true,"offset":true},"statement":{"body":"SELECT\n    sessions.id,\n    sessions.ended_at,\n    sessions.created_at,\n    sessions.volunteer_id AS volunteer,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    students.first_name AS student_first_name,\n    session_reported_count.total <> 0 AS is_reported,\n    flags.flags,\n    messages.total AS total_messages,\n    session_review_reason.review_reasons\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users students ON students.id = sessions.student_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS flags\n        FROM\n            sessions_session_flags\n            JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id\n        WHERE\n            session_id = sessions.id\n        GROUP BY\n            session_id) AS flags ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_messages\n        WHERE\n            session_messages.session_id = sessions.id) AS messages ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS review_reasons\n        FROM\n            session_review_reasons\n            LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\n        WHERE\n            session_review_reasons.session_id = sessions.id) AS session_review_reason ON TRUE\nWHERE\n    sessions.to_review IS TRUE\n    AND sessions.reviewed IS FALSE\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":4825,"b":6618,"line":180,"col":0}}};

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
 *     session_review_reason.review_reasons
 * FROM
 *     sessions
 *     LEFT JOIN subjects ON subjects.id = sessions.subject_id
 *     LEFT JOIN topics ON topics.id = subjects.topic_id
 *     LEFT JOIN users students ON students.id = sessions.student_id
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
  total: number | null;
}

/** 'GetTotalTimeTutoredForDateRange' query type */
export interface IGetTotalTimeTutoredForDateRangeQuery {
  params: IGetTotalTimeTutoredForDateRangeParams;
  result: IGetTotalTimeTutoredForDateRangeResult;
}

const getTotalTimeTutoredForDateRangeIR: any = {"name":"getTotalTimeTutoredForDateRange","params":[{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6754,"b":6765,"line":241,"col":20}]}},{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6790,"b":6795,"line":242,"col":23}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6820,"b":6823,"line":243,"col":23}]}}],"usedParamSet":{"volunteerId":true,"start":true,"end":true},"statement":{"body":"SELECT\n    SUM(time_tutored)::int AS total\nFROM\n    sessions\nWHERE\n    volunteer_id = :volunteerId!\n    AND created_at >= :start!\n    AND created_at <= :end!","loc":{"a":6667,"b":6823,"line":236,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     SUM(time_tutored)::int AS total
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

const getActiveSessionVolunteersIR: any = {"name":"getActiveSessionVolunteers","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    volunteer_id\nFROM\n    sessions\nWHERE\n    ended_at IS NULL\n    AND NOT volunteer_id IS NULL","loc":{"a":6867,"b":6967,"line":247,"col":0}}};

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

const updateSessionReportedIR: any = {"name":"updateSessionReported","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7158,"b":7160,"line":259,"col":5}]}},{"name":"reportMessage","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7191,"b":7204,"line":261,"col":5}]}},{"name":"reportReason","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7367,"b":7379,"line":269,"col":52}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7406,"b":7415,"line":271,"col":19}]}}],"usedParamSet":{"id":true,"reportMessage":true,"reportReason":true,"sessionId":true},"statement":{"body":"INSERT INTO session_reports (id, report_reason_id, report_message, reporting_user_id, session_id, reported_user_id, created_at, updated_at)\nSELECT\n    :id!,\n    report_reasons.id,\n    :reportMessage!,\n    sessions.volunteer_id,\n    sessions.id,\n    sessions.student_id,\n    NOW(),\n    NOW()\nFROM\n    sessions\n    JOIN report_reasons ON report_reasons.reason = :reportReason!\nWHERE\n    sessions.id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":7006,"b":7438,"line":257,"col":0}}};

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

const updateSessionTimeTutoredIR: any = {"name":"updateSessionTimeTutored","params":[{"name":"timeTutored","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7525,"b":7536,"line":280,"col":21}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7584,"b":7593,"line":283,"col":10}]}}],"usedParamSet":{"timeTutored":true,"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    time_tutored = (:timeTutored!)::int,\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":7480,"b":7616,"line":277,"col":0}}};

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

const updateSessionQuillDocIR: any = {"name":"updateSessionQuillDoc","params":[{"name":"quillDoc","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7697,"b":7705,"line":292,"col":18}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7748,"b":7757,"line":295,"col":10}]}}],"usedParamSet":{"quillDoc":true,"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    quill_doc = (:quillDoc!),\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":7655,"b":7780,"line":289,"col":0}}};

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

const updateSessionHasWhiteboardDocIR: any = {"name":"updateSessionHasWhiteboardDoc","params":[{"name":"hasWhiteboardDoc","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7878,"b":7894,"line":304,"col":27}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7946,"b":7955,"line":307,"col":10}]}}],"usedParamSet":{"hasWhiteboardDoc":true,"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    has_whiteboard_doc = (:hasWhiteboardDoc!)::boolean,\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":7827,"b":7978,"line":301,"col":0}}};

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


/** 'UpdatedSessionToEnd' parameters type */
export interface IUpdatedSessionToEndParams {
  endedAt: Date;
  roleName: string | null | void;
  sessionId: string;
}

/** 'UpdatedSessionToEnd' return type */
export interface IUpdatedSessionToEndResult {
  ok: string;
}

/** 'UpdatedSessionToEnd' query type */
export interface IUpdatedSessionToEndQuery {
  params: IUpdatedSessionToEndParams;
  result: IUpdatedSessionToEndResult;
}

const updatedSessionToEndIR: any = {"name":"updatedSessionToEnd","params":[{"name":"endedAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8055,"b":8062,"line":316,"col":16}]}},{"name":"roleName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8227,"b":8234,"line":325,"col":25}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8279,"b":8288,"line":327,"col":19}]}}],"usedParamSet":{"endedAt":true,"roleName":true,"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    ended_at = :endedAt!,\n    ended_by_role_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        user_roles.id\n    FROM\n        user_roles\n    WHERE\n        name = COALESCE(:roleName, '')) AS subquery\nWHERE\n    sessions.id = :sessionId!\nRETURNING\n    sessions.id AS ok","loc":{"a":8015,"b":8320,"line":313,"col":0}}};

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
 *         user_roles
 *     WHERE
 *         name = COALESCE(:roleName, '')) AS subquery
 * WHERE
 *     sessions.id = :sessionId!
 * RETURNING
 *     sessions.id AS ok
 * ```
 */
export const updatedSessionToEnd = new PreparedQuery<IUpdatedSessionToEndParams,IUpdatedSessionToEndResult>(updatedSessionToEndIR);


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

const getLongRunningSessionsIR: any = {"name":"getLongRunningSessions","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8426,"b":8431,"line":338,"col":19}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8456,"b":8459,"line":339,"col":23}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    sessions.id\nFROM\n    sessions\nWHERE\n    created_at >= :start!\n    AND created_at <= :end!\n    AND ended_at IS NULL","loc":{"a":8360,"b":8484,"line":333,"col":0}}};

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

const getPublicSessionByIdIR: any = {"name":"getPublicSessionById","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9095,"b":9104,"line":361,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    sessions.ended_at,\n    sessions.created_at,\n    sessions.student_id,\n    sessions.volunteer_id,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    students.first_name AS student_first_name,\n    volunteers.first_name AS volunteer_first_name\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN users students ON students.id = sessions.student_id\n    LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id\nWHERE\n    sessions.id = :sessionId!","loc":{"a":8522,"b":9104,"line":344,"col":0}}};

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
  type: string;
  volunteerJoinedAt: Date | null;
}

/** 'GetSessionForAdminView' query type */
export interface IGetSessionForAdminViewQuery {
  params: IGetSessionForAdminViewParams;
  result: IGetSessionForAdminViewResult;
}

const getSessionForAdminViewIR: any = {"name":"getSessionForAdminView","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10738,"b":10747,"line":410,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.ended_at,\n    sessions.volunteer_joined_at,\n    sessions.quill_doc,\n    sessions.time_tutored::int,\n    (\n        CASE WHEN user_roles.name = 'volunteer' THEN\n            sessions.volunteer_id\n        WHEN user_roles.name = 'student' THEN\n            sessions.student_id\n        ELSE\n            NULL\n        END) AS ended_by,\n    session_reports.report_message,\n    report_reasons.reason AS report_reason,\n    session_review_reason.review_reasons,\n    session_photo.photos\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\n    LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id\n    LEFT JOIN session_reports ON session_reports.session_id = sessions.id\n    LEFT JOIN report_reasons ON report_reasons.id = session_reports.report_reason_id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(session_flags.name) AS review_reasons\n        FROM\n            session_review_reasons\n            LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\n        WHERE\n            session_review_reasons.session_id = sessions.id) AS session_review_reason ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(photo_key) AS photos\n        FROM\n            session_photos\n        WHERE\n            session_photos.session_id = sessions.id) AS session_photo ON TRUE\nWHERE\n    sessions.id = :sessionId!","loc":{"a":9144,"b":10747,"line":365,"col":0}}};

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
 *     session_photo.photos
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
 *     LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
 *     LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id
 *     LEFT JOIN session_reports ON session_reports.session_id = sessions.id
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
 * WHERE
 *     sessions.id = :sessionId!
 * ```
 */
export const getSessionForAdminView = new PreparedQuery<IGetSessionForAdminViewParams,IGetSessionForAdminViewResult>(getSessionForAdminViewIR);


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

const getUserForSessionAdminViewIR: any = {"name":"getUserForSessionAdminView","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11297,"b":11306,"line":431,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name AS firstname,\n    users.created_at,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_volunteer,\n    array_agg(sessions.id ORDER BY sessions.created_at) AS past_sessions\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\n    LEFT JOIN sessions ON sessions.student_id = users.id\n        OR sessions.volunteer_id = users.id\nWHERE\n    sessions.id = :sessionId!\nGROUP BY\n    users.id,\n    volunteer_profiles.user_id","loc":{"a":10791,"b":11360,"line":414,"col":0}}};

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
 *     array_agg(sessions.id ORDER BY sessions.created_at) AS past_sessions
 * FROM
 *     users
 *     LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id
 *     LEFT JOIN sessions ON sessions.student_id = users.id
 *         OR sessions.volunteer_id = users.id
 * WHERE
 *     sessions.id = :sessionId!
 * GROUP BY
 *     users.id,
 *     volunteer_profiles.user_id
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

const getSessionMessagesForFrontendIR: any = {"name":"getSessionMessagesForFrontend","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11540,"b":11549,"line":447,"col":18}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    id,\n    sender_id AS USER,\n    contents,\n    created_at,\n    session_id\nFROM\n    session_messages\nWHERE\n    session_id = :sessionId!\nORDER BY\n    created_at","loc":{"a":11407,"b":11573,"line":438,"col":0}}};

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

const createSessionIR: any = {"name":"createSession","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11706,"b":11708,"line":455,"col":5}]}},{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11716,"b":11725,"line":456,"col":5}]}},{"name":"studentBanned","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11750,"b":11763,"line":458,"col":5}]}},{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11832,"b":11839,"line":464,"col":21}]}}],"usedParamSet":{"id":true,"studentId":true,"studentBanned":true,"subject":true},"statement":{"body":"INSERT INTO sessions (id, student_id, subject_id, student_banned, created_at, updated_at)\nSELECT\n    :id!,\n    :studentId!,\n    subjects.id,\n    :studentBanned!,\n    NOW(),\n    NOW()\nFROM\n    subjects\nWHERE\n    subjects.name = :subject!\nRETURNING\n    sessions.id","loc":{"a":11604,"b":11865,"line":453,"col":0}}};

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
  id: string;
  studentId: string;
  subTopic: string;
  type: string;
  volunteerId: string | null;
  volunteerJoinedAt: Date | null;
}

/** 'GetCurrentSessionByUserId' query type */
export interface IGetCurrentSessionByUserIdQuery {
  params: IGetCurrentSessionByUserIdParams;
  result: IGetCurrentSessionByUserIdResult;
}

const getCurrentSessionByUserIdIR: any = {"name":"getCurrentSessionByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12310,"b":12316,"line":483,"col":30},{"a":12350,"b":12356,"line":484,"col":32}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.volunteer_joined_at,\n    sessions.volunteer_id,\n    sessions.student_id\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\nWHERE (sessions.student_id = :userId!\n    OR sessions.volunteer_id = :userId!)\nAND sessions.ended_at IS NULL","loc":{"a":11908,"b":12387,"line":470,"col":0}}};

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
 *     sessions.student_id
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
 *     LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
 * WHERE (sessions.student_id = :userId!
 *     OR sessions.volunteer_id = :userId!)
 * AND sessions.ended_at IS NULL
 * ```
 */
export const getCurrentSessionByUserId = new PreparedQuery<IGetCurrentSessionByUserIdParams,IGetCurrentSessionByUserIdResult>(getCurrentSessionByUserIdIR);


/** 'GetCurrentSessionBySessionId' parameters type */
export interface IGetCurrentSessionBySessionIdParams {
  sessionId: string | null | void;
}

/** 'GetCurrentSessionBySessionId' return type */
export interface IGetCurrentSessionBySessionIdResult {
  createdAt: Date;
  id: string;
  studentId: string;
  subTopic: string;
  type: string;
  volunteerId: string | null;
  volunteerJoinedAt: Date | null;
}

/** 'GetCurrentSessionBySessionId' query type */
export interface IGetCurrentSessionBySessionIdQuery {
  params: IGetCurrentSessionBySessionIdParams;
  result: IGetCurrentSessionBySessionIdResult;
}

const getCurrentSessionBySessionIdIR: any = {"name":"getCurrentSessionBySessionId","params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12830,"b":12838,"line":503,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    subjects.name AS sub_topic,\n    topics.name AS TYPE,\n    sessions.created_at,\n    sessions.volunteer_joined_at,\n    sessions.volunteer_id,\n    sessions.student_id\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\nWHERE\n    sessions.id = :sessionId","loc":{"a":12433,"b":12838,"line":489,"col":0}}};

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
 *     sessions.student_id
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
 *     LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
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
  id: string;
  isVolunteer: boolean | null;
}

/** 'GetCurrentSessionUser' query type */
export interface IGetCurrentSessionUserQuery {
  params: IGetCurrentSessionUserParams;
  result: IGetCurrentSessionUserResult;
}

const getCurrentSessionUserIR: any = {"name":"getCurrentSessionUser","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13289,"b":13298,"line":522,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name AS firstname,\n    (\n        CASE WHEN volunteer_profiles.user_id IS NULL THEN\n            FALSE\n        ELSE\n            TRUE\n        END) AS is_volunteer\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN sessions ON sessions.student_id = users.id\n        OR sessions.volunteer_id = users.id\nWHERE\n    sessions.id = :sessionId!","loc":{"a":12877,"b":13298,"line":507,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name AS firstname,
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
}

/** 'GetLatestSessionByStudentId' query type */
export interface IGetLatestSessionByStudentIdQuery {
  params: IGetLatestSessionByStudentIdParams;
  result: IGetLatestSessionByStudentIdResult;
}

const getLatestSessionByStudentIdIR: any = {"name":"getLatestSessionByStudentId","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13424,"b":13433,"line":532,"col":27}]}}],"usedParamSet":{"studentId":true},"statement":{"body":"SELECT\n    id,\n    created_at\nFROM\n    sessions\nWHERE\n    sessions.student_id = :studentId!\nORDER BY\n    created_at","loc":{"a":13343,"b":13457,"line":526,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     created_at
 * FROM
 *     sessions
 * WHERE
 *     sessions.student_id = :studentId!
 * ORDER BY
 *     created_at
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

const updateSessionVolunteerByIdIR: any = {"name":"updateSessionVolunteerById","params":[{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13545,"b":13556,"line":541,"col":20}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":13631,"b":13640,"line":545,"col":10}]}}],"usedParamSet":{"volunteerId":true,"sessionId":true},"statement":{"body":"UPDATE\n    sessions\nSET\n    volunteer_id = :volunteerId!,\n    volunteer_joined_at = NOW(),\n    updated_at = NOW()\nWHERE\n    id = :sessionId!\nRETURNING\n    id AS ok","loc":{"a":13501,"b":13663,"line":538,"col":0}}};

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
  topic: string;
  volunteerJoinedAt: Date | null;
}

/** 'GetSessionForChatbot' query type */
export interface IGetSessionForChatbotQuery {
  params: IGetSessionForChatbotParams;
  result: IGetSessionForChatbotResult;
}

const getSessionForChatbotIR: any = {"name":"getSessionForChatbot","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14148,"b":14157,"line":566,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sessions.id,\n    subjects.name AS subject,\n    topics.name AS topic,\n    sessions.created_at,\n    sessions.ended_at,\n    sessions.volunteer_joined_at,\n    sessions.student_id AS student,\n    users.first_name AS student_first_name\nFROM\n    sessions\n    JOIN users ON sessions.student_id = users.id\n    LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    LEFT JOIN topics ON subjects.topic_id = topics.id\nWHERE\n    sessions.id = :sessionId!","loc":{"a":13701,"b":14157,"line":551,"col":0}}};

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
 *     users.first_name AS student_first_name
 * FROM
 *     sessions
 *     JOIN users ON sessions.student_id = users.id
 *     LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     LEFT JOIN topics ON subjects.topic_id = topics.id
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
  ok: string;
}

/** 'InsertNewMessage' query type */
export interface IInsertNewMessageQuery {
  params: IInsertNewMessageParams;
  result: IInsertNewMessageResult;
}

const insertNewMessageIR: any = {"name":"insertNewMessage","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14295,"b":14297,"line":571,"col":13}]}},{"name":"senderId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14301,"b":14309,"line":571,"col":19}]}},{"name":"contents","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14313,"b":14321,"line":571,"col":31}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14325,"b":14334,"line":571,"col":43}]}}],"usedParamSet":{"id":true,"senderId":true,"contents":true,"sessionId":true},"statement":{"body":"INSERT INTO session_messages (id, sender_id, contents, session_id, created_at, updated_at)\n    VALUES (:id!, :senderId!, :contents!, :sessionId!, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":14191,"b":14372,"line":570,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_messages (id, sender_id, contents, session_id, created_at, updated_at)
 *     VALUES (:id!, :senderId!, :contents!, :sessionId!, NOW(), NOW())
 * RETURNING
 *     id AS ok
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

const getSessionsWithAvgWaitTimePerDayAndHourIR: any = {"name":"getSessionsWithAvgWaitTimePerDayAndHour","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14881,"b":14886,"line":589,"col":27}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14919,"b":14922,"line":590,"col":31}]}}],"usedParamSet":{"start":true,"end":true},"statement":{"body":"SELECT\n    extract(isodow FROM sessions.created_at)::int AS day,\n    extract(hour FROM sessions.created_at)::int AS hour,\n    AVG(\n        CASE WHEN sessions.volunteer_id IS NULL THEN\n            EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at))\n        ELSE\n            EXTRACT('epoch' FROM (sessions.volunteer_joined_at - sessions.created_at))\n        END)::float AS average_wait_time\nFROM\n    sessions\nWHERE\n    sessions.created_at > :start!\n    AND sessions.created_at < :end!\n    AND NOT sessions.ended_at IS NULL\n    AND EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) > 6000\nGROUP BY\n    day,\n    hour","loc":{"a":14429,"b":15066,"line":577,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     extract(isodow FROM sessions.created_at)::int AS day,
 *     extract(hour FROM sessions.created_at)::int AS hour,
 *     AVG(
 *         CASE WHEN sessions.volunteer_id IS NULL THEN
 *             EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at))
 *         ELSE
 *             EXTRACT('epoch' FROM (sessions.volunteer_joined_at - sessions.created_at))
 *         END)::float AS average_wait_time
 * FROM
 *     sessions
 * WHERE
 *     sessions.created_at > :start!
 *     AND sessions.created_at < :end!
 *     AND NOT sessions.ended_at IS NULL
 *     AND EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) > 6000
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
  volunteerFeedback: Json | null;
}

/** 'GetSessionsForReferCoworker' query type */
export interface IGetSessionsForReferCoworkerQuery {
  params: IGetSessionsForReferCoworkerParams;
  result: IGetSessionsForReferCoworkerResult;
}

const getSessionsForReferCoworkerIR: any = {"name":"getSessionsForReferCoworker","params":[{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15497,"b":15508,"line":608,"col":29},{"a":15667,"b":15678,"line":611,"col":29}]}}],"usedParamSet":{"volunteerId":true},"statement":{"body":"SELECT\n    feedbacks.volunteer_feedback\nFROM\n    sessions\n    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id\n    LEFT JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id\n    LEFT JOIN feedbacks ON feedbacks.session_id = sessions.id\n        AND feedbacks.user_id = sessions.volunteer_id\nWHERE\n    sessions.volunteer_id = :volunteerId!\n    AND sessions.time_tutored >= 15 * 60 * 1000\n    AND NOT session_flags.name = ANY ('{\"Absent student\", \"Absent volunteer\"}')\n    AND feedbacks.user_id = :volunteerId!\nLIMIT 1","loc":{"a":15111,"b":15686,"line":599,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
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
 *     AND NOT session_flags.name = ANY ('{"Absent student", "Absent volunteer"}')
 *     AND feedbacks.user_id = :volunteerId!
 * LIMIT 1
 * ```
 */
export const getSessionsForReferCoworker = new PreparedQuery<IGetSessionsForReferCoworkerParams,IGetSessionsForReferCoworkerResult>(getSessionsForReferCoworkerIR);


/** 'GetVolunteersForGentleWarning' parameters type */
export type IGetVolunteersForGentleWarningParams = void;

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

const getVolunteersForGentleWarningIR: any = {"name":"getVolunteersForGentleWarning","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    users.id,\n    users.email,\n    users.first_name,\n    COUNT(DISTINCT notifications.id)::int AS total_notifications\nFROM\n    notifications\n    LEFT JOIN users ON users.id = notifications.user_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = users.id) AS session_count ON TRUE\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND session_count.total = 0\nGROUP BY\n    users.id","loc":{"a":15733,"b":16282,"line":616,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.email,
 *     users.first_name,
 *     COUNT(DISTINCT notifications.id)::int AS total_notifications
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
 * WHERE
 *     users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND session_count.total = 0
 * GROUP BY
 *     users.id
 * ```
 */
export const getVolunteersForGentleWarning = new PreparedQuery<IGetVolunteersForGentleWarningParams,IGetVolunteersForGentleWarningResult>(getVolunteersForGentleWarningIR);


/** 'GetStudentForEmailFirstSession' parameters type */
export interface IGetStudentForEmailFirstSessionParams {
  sessionId: string;
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

const getStudentForEmailFirstSessionIR: any = {"name":"getStudentForEmailFirstSession","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16663,"b":16672,"line":651,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name,\n    users.email\nFROM\n    sessions\n    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id\n    LEFT JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id\n    LEFT JOIN users ON users.id = sessions.student_id\nWHERE\n    sessions.id = :sessionId!\n    AND NOT session_flags.name = ANY ('{\"Absent student\", \"Absent volunteer\", \"Low coach rating from student\", \"Low session rating from student\" }')\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE","loc":{"a":16330,"b":16889,"line":641,"col":0}}};

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
 * WHERE
 *     sessions.id = :sessionId!
 *     AND NOT session_flags.name = ANY ('{"Absent student", "Absent volunteer", "Low coach rating from student", "Low session rating from student" }')
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 * ```
 */
export const getStudentForEmailFirstSession = new PreparedQuery<IGetStudentForEmailFirstSessionParams,IGetStudentForEmailFirstSessionResult>(getStudentForEmailFirstSessionIR);


/** 'GetVolunteerForEmailFirstSession' parameters type */
export interface IGetVolunteerForEmailFirstSessionParams {
  sessionId: string;
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

const getVolunteerForEmailFirstSessionIR: any = {"name":"getVolunteerForEmailFirstSession","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17272,"b":17281,"line":668,"col":19}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    users.id,\n    users.first_name,\n    users.email\nFROM\n    sessions\n    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id\n    LEFT JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id\n    LEFT JOIN users ON users.id = sessions.student_id\nWHERE\n    sessions.id = :sessionId!\n    AND NOT session_flags.name = ANY ('{\"Absent student\", \"Absent volunteer\", \"Low session rating from coach\" }')\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE","loc":{"a":16939,"b":17463,"line":658,"col":0}}};

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
 * WHERE
 *     sessions.id = :sessionId!
 *     AND NOT session_flags.name = ANY ('{"Absent student", "Absent volunteer", "Low session rating from coach" }')
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
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
  studentCounselingFeedback: Json | null;
  studentEmail: string;
  studentFirstName: string;
  studentIsBanned: boolean;
  studentTestUser: boolean;
  studentTotalPastSessions: number | null;
  subTopic: string;
  totalMessages: number | null;
  type: string;
  volunteerEmail: string;
  volunteerFeedback: Json | null;
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

const getSessionsForAdminFilterIR: any = {"name":"getSessionsForAdminFilter","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20334,"b":20339,"line":761,"col":32}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20373,"b":20376,"line":762,"col":32}]}},{"name":"messageCount","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20389,"b":20400,"line":763,"col":11},{"a":20452,"b":20463,"line":764,"col":36}]}},{"name":"sessionLength","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20483,"b":20495,"line":765,"col":11},{"a":20590,"b":20602,"line":766,"col":79}]}},{"name":"reported","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20622,"b":20629,"line":767,"col":11}]}},{"name":"showBannedUsers","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20862,"b":20876,"line":772,"col":13}]}},{"name":"showTestUsers","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20908,"b":20920,"line":773,"col":11}]}},{"name":"firstTimeStudent","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20991,"b":21006,"line":775,"col":11}]}},{"name":"firstTimeVolunteer","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21077,"b":21094,"line":777,"col":11}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21164,"b":21169,"line":779,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21186,"b":21192,"line":779,"col":30}]}}],"usedParamSet":{"start":true,"end":true,"messageCount":true,"sessionLength":true,"reported":true,"showBannedUsers":true,"showTestUsers":true,"firstTimeStudent":true,"firstTimeVolunteer":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    sessions.created_at,\n    sessions.ended_at,\n    message_count.total AS total_messages,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    students.first_name AS student_first_name,\n    students.email AS student_email,\n    students.banned AS student_is_banned,\n    students.test_user AS student_test_user,\n    student_sessions.total AS student_total_past_sessions,\n    volunteers.first_name AS volunteer_first_name,\n    volunteers.email AS volunteer_email,\n    volunteers.banned AS volunteer_is_banned,\n    volunteers.test_user AS volunteer_test_user,\n    volunteer_sessions.total AS volunteer_total_past_sessions,\n    student_feedback.student_counseling_feedback,\n    volunteer_feedback.volunteer_feedback\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\n    LEFT JOIN LATERAL (\n        SELECT\n            first_name,\n            id,\n            email,\n            banned,\n            test_user\n        FROM\n            users\n        WHERE\n            users.id = sessions.student_id) AS students ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            first_name,\n            id,\n            email,\n            banned,\n            test_user\n        FROM\n            users\n        WHERE\n            users.id = sessions.volunteer_id) AS volunteers ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_messages\n        WHERE\n            session_messages.session_id = sessions.id) AS message_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            session_reports\n        WHERE\n            sessions.id = session_reports.session_id) AS session_reported_count ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.student_id = students.id) AS student_sessions ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(id)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = volunteers.id) AS volunteer_sessions ON TRUE\n    LEFT JOIN feedbacks student_feedback ON student_feedback.session_id = sessions.id\n        AND student_feedback.user_id = sessions.student_id\n    LEFT JOIN feedbacks volunteer_feedback ON volunteer_feedback.session_id = sessions.id\n        AND volunteer_feedback.user_id = sessions.volunteer_id\n    LEFT JOIN LATERAL (\n        SELECT\n            MAX(created_at) AS last_banned_at\n        FROM\n            user_actions\n        WHERE\n            user_actions.user_id = sessions.student_id\n            AND user_actions.action = 'BANNED') AS student_banned ON TRUE\nWHERE\n    NOT sessions.ended_at IS NULL\n    AND sessions.created_at >= :start!\n    AND sessions.created_at <= :end!\n    AND ((:messageCount)::int IS NULL\n        OR message_count.total >= (:messageCount)::int)\n    AND ((:sessionLength)::int IS NULL\n        OR EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) > (:sessionLength)::int)\n    AND ((:reported)::boolean IS FALSE\n        OR session_reported_count.total > 0)\n    AND (student_banned.last_banned_at IS NULL\n        OR sessions.created_at < student_banned.last_banned_at\n        OR sessions.student_banned IS FALSE\n        OR (:showBannedUsers)::boolean IS TRUE)\n    AND ((:showTestUsers)::boolean IS TRUE\n        OR students.test_user IS FALSE)\n    AND ((:firstTimeStudent)::boolean IS FALSE\n        OR student_sessions.total = 1)\n    AND ((:firstTimeVolunteer)::boolean IS FALSE\n        OR volunteer_sessions.total = 1)\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":17506,"b":21198,"line":675,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
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
 *     student_feedback.student_counseling_feedback,
 *     volunteer_feedback.volunteer_feedback
 * FROM
 *     sessions
 *     LEFT JOIN subjects ON subjects.id = sessions.subject_id
 *     LEFT JOIN topics ON topics.id = subjects.topic_id
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
 *             COUNT(id)::int AS total
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
 *     LEFT JOIN feedbacks student_feedback ON student_feedback.session_id = sessions.id
 *         AND student_feedback.user_id = sessions.student_id
 *     LEFT JOIN feedbacks volunteer_feedback ON volunteer_feedback.session_id = sessions.id
 *         AND volunteer_feedback.user_id = sessions.volunteer_id
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
 *         OR EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) > (:sessionLength)::int)
 *     AND ((:reported)::boolean IS FALSE
 *         OR session_reported_count.total > 0)
 *     AND (student_banned.last_banned_at IS NULL
 *         OR sessions.created_at < student_banned.last_banned_at
 *         OR sessions.student_banned IS FALSE
 *         OR (:showBannedUsers)::boolean IS TRUE)
 *     AND ((:showTestUsers)::boolean IS TRUE
 *         OR students.test_user IS FALSE)
 *     AND ((:firstTimeStudent)::boolean IS FALSE
 *         OR student_sessions.total = 1)
 *     AND ((:firstTimeVolunteer)::boolean IS FALSE
 *         OR volunteer_sessions.total = 1)
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

const insertSessionReviewReasonIR: any = {"name":"insertSessionReviewReason","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21364,"b":21373,"line":786,"col":9}]}},{"name":"flag","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21502,"b":21506,"line":793,"col":30},{"a":21791,"b":21795,"line":810,"col":26}]}}],"usedParamSet":{"sessionId":true,"flag":true},"statement":{"body":"WITH ins AS (\nINSERT INTO session_review_reasons (session_id, session_flag_id, created_at, updated_at)\n    SELECT\n        :sessionId!,\n        session_flags.id,\n        NOW(),\n        NOW()\n    FROM\n        session_flags\n    WHERE\n        session_flags.name = :flag!\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        session_id AS ok\n)\nSELECT\n    *\nFROM\n    ins\nUNION\nSELECT\n    session_id\nFROM\n    session_review_reasons\n    LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id\nWHERE\n    session_flags.name = :flag!","loc":{"a":21241,"b":21795,"line":783,"col":0}}};

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

const insertSessionFailedJoinIR: any = {"name":"insertSessionFailedJoin","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21928,"b":21937,"line":815,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21941,"b":21947,"line":815,"col":26}]}}],"usedParamSet":{"sessionId":true,"userId":true},"statement":{"body":"INSERT INTO session_failed_joins (session_id, user_id, created_at, updated_at)\n    VALUES (:sessionId!, :userId!, NOW(), NOW())\nRETURNING\n    session_id AS ok","loc":{"a":21836,"b":21993,"line":814,"col":0}}};

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

const insertSessionPhotoKeyIR: any = {"name":"insertSessionPhotoKey","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22120,"b":22129,"line":822,"col":13}]}},{"name":"photoKey","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":22133,"b":22141,"line":822,"col":26}]}}],"usedParamSet":{"sessionId":true,"photoKey":true},"statement":{"body":"INSERT INTO session_photos (session_id, photo_key, created_at, updated_at)\n    VALUES (:sessionId!, :photoKey!, NOW(), NOW())\nRETURNING\n    session_id AS ok","loc":{"a":22032,"b":22187,"line":821,"col":0}}};

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


