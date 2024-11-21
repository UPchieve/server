/** Types generated for queries found in "server/models/Feedback/feedback.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetFeedbackBySessionId' parameters type */
export interface IGetFeedbackBySessionIdParams {
  sessionId: string;
}

/** 'GetFeedbackBySessionId' return type */
export interface IGetFeedbackBySessionIdResult {
  id: string;
  sessionId: string;
  studentCounselingFeedback: Json | null;
  studentTutoringFeedback: Json | null;
  subTopic: string;
  type: string;
  userId: string;
  userRole: string;
  volunteerFeedback: Json | null;
}

/** 'GetFeedbackBySessionId' query type */
export interface IGetFeedbackBySessionIdQuery {
  params: IGetFeedbackBySessionIdParams;
  result: IGetFeedbackBySessionIdResult;
}

const getFeedbackBySessionIdIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":452,"b":462}]}],"statement":"SELECT\n    feedbacks.id,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    user_roles.name AS user_role,\n    user_id,\n    session_id,\n    student_tutoring_feedback,\n    student_counseling_feedback,\n    volunteer_feedback\nFROM\n    feedbacks\n    LEFT JOIN topics ON feedbacks.topic_id = topics.id\n    LEFT JOIN subjects ON feedbacks.subject_id = subjects.id\n    JOIN user_roles ON feedbacks.user_role_id = user_roles.id\nWHERE\n    session_id = :sessionId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     feedbacks.id,
 *     topics.name AS TYPE,
 *     subjects.name AS sub_topic,
 *     user_roles.name AS user_role,
 *     user_id,
 *     session_id,
 *     student_tutoring_feedback,
 *     student_counseling_feedback,
 *     volunteer_feedback
 * FROM
 *     feedbacks
 *     LEFT JOIN topics ON feedbacks.topic_id = topics.id
 *     LEFT JOIN subjects ON feedbacks.subject_id = subjects.id
 *     JOIN user_roles ON feedbacks.user_role_id = user_roles.id
 * WHERE
 *     session_id = :sessionId!
 * ```
 */
export const getFeedbackBySessionId = new PreparedQuery<IGetFeedbackBySessionIdParams,IGetFeedbackBySessionIdResult>(getFeedbackBySessionIdIR);


/** 'GetFeedbackById' parameters type */
export interface IGetFeedbackByIdParams {
  id: string;
}

/** 'GetFeedbackById' return type */
export interface IGetFeedbackByIdResult {
  id: string;
  sessionId: string;
  studentCounselingFeedback: Json | null;
  studentTutoringFeedback: Json | null;
  subTopic: string;
  type: string;
  userId: string;
  userRole: string;
  volunteerFeedback: Json | null;
}

/** 'GetFeedbackById' query type */
export interface IGetFeedbackByIdQuery {
  params: IGetFeedbackByIdParams;
  result: IGetFeedbackByIdResult;
}

const getFeedbackByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":454,"b":457}]}],"statement":"SELECT\n    feedbacks.id,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    user_roles.name AS user_role,\n    user_id,\n    session_id,\n    student_tutoring_feedback,\n    student_counseling_feedback,\n    volunteer_feedback\nFROM\n    feedbacks\n    LEFT JOIN topics ON feedbacks.topic_id = topics.id\n    LEFT JOIN subjects ON feedbacks.subject_id = subjects.id\n    JOIN user_roles ON feedbacks.user_role_id = user_roles.id\nWHERE\n    feedbacks.id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     feedbacks.id,
 *     topics.name AS TYPE,
 *     subjects.name AS sub_topic,
 *     user_roles.name AS user_role,
 *     user_id,
 *     session_id,
 *     student_tutoring_feedback,
 *     student_counseling_feedback,
 *     volunteer_feedback
 * FROM
 *     feedbacks
 *     LEFT JOIN topics ON feedbacks.topic_id = topics.id
 *     LEFT JOIN subjects ON feedbacks.subject_id = subjects.id
 *     JOIN user_roles ON feedbacks.user_role_id = user_roles.id
 * WHERE
 *     feedbacks.id = :id!
 * ```
 */
export const getFeedbackById = new PreparedQuery<IGetFeedbackByIdParams,IGetFeedbackByIdResult>(getFeedbackByIdIR);


/** 'GetFeedbackBySessionIdUserType' parameters type */
export interface IGetFeedbackBySessionIdUserTypeParams {
  sessionId: string;
  userRole: string;
}

/** 'GetFeedbackBySessionIdUserType' return type */
export interface IGetFeedbackBySessionIdUserTypeResult {
  createdAt: Date;
  id: string;
  legacyFeedbacks: Json | null;
  responseData: Json | null;
  sessionId: string;
  studentCounselingFeedback: Json | null;
  studentTutoringFeedback: Json | null;
  subTopic: string;
  type: string;
  updatedAt: Date;
  userId: string;
  userRole: string;
  volunteerFeedback: Json | null;
}

/** 'GetFeedbackBySessionIdUserType' query type */
export interface IGetFeedbackBySessionIdUserTypeQuery {
  params: IGetFeedbackBySessionIdUserTypeParams;
  result: IGetFeedbackBySessionIdUserTypeResult;
}

const getFeedbackBySessionIdUserTypeIR: any = {"usedParamSet":{"sessionId":true,"userRole":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":575,"b":585}]},{"name":"userRole","required":true,"transform":{"type":"scalar"},"locs":[{"a":613,"b":622}]}],"statement":"SELECT\n    feedbacks.id,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    user_roles.name AS user_role,\n    user_id,\n    session_id,\n    student_tutoring_feedback,\n    student_counseling_feedback,\n    volunteer_feedback,\n    legacy_feedbacks,\n    legacy_feedbacks AS response_data,\n    feedbacks.created_at,\n    feedbacks.updated_at\nFROM\n    feedbacks\n    LEFT JOIN topics ON feedbacks.topic_id = topics.id\n    LEFT JOIN subjects ON feedbacks.subject_id = subjects.id\n    JOIN user_roles ON feedbacks.user_role_id = user_roles.id\nWHERE\n    feedbacks.session_id = :sessionId!\n    AND user_roles.name = :userRole!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     feedbacks.id,
 *     topics.name AS TYPE,
 *     subjects.name AS sub_topic,
 *     user_roles.name AS user_role,
 *     user_id,
 *     session_id,
 *     student_tutoring_feedback,
 *     student_counseling_feedback,
 *     volunteer_feedback,
 *     legacy_feedbacks,
 *     legacy_feedbacks AS response_data,
 *     feedbacks.created_at,
 *     feedbacks.updated_at
 * FROM
 *     feedbacks
 *     LEFT JOIN topics ON feedbacks.topic_id = topics.id
 *     LEFT JOIN subjects ON feedbacks.subject_id = subjects.id
 *     JOIN user_roles ON feedbacks.user_role_id = user_roles.id
 * WHERE
 *     feedbacks.session_id = :sessionId!
 *     AND user_roles.name = :userRole!
 * ```
 */
export const getFeedbackBySessionIdUserType = new PreparedQuery<IGetFeedbackBySessionIdUserTypeParams,IGetFeedbackBySessionIdUserTypeResult>(getFeedbackBySessionIdUserTypeIR);


/** 'UpsertFeedback' parameters type */
export interface IUpsertFeedbackParams {
  comment?: string | null | void;
  id: string;
  sessionId: string;
  studentCounselingFeedback?: Json | null | void;
  studentTutoringFeedback?: Json | null | void;
  userRole: string;
  volunteerFeedback?: Json | null | void;
}

/** 'UpsertFeedback' return type */
export interface IUpsertFeedbackResult {
  id: string;
}

/** 'UpsertFeedback' query type */
export interface IUpsertFeedbackQuery {
  params: IUpsertFeedbackParams;
  result: IUpsertFeedbackResult;
}

const upsertFeedbackIR: any = {"usedParamSet":{"id":true,"sessionId":true,"studentTutoringFeedback":true,"studentCounselingFeedback":true,"volunteerFeedback":true,"comment":true,"userRole":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":204,"b":207}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":281,"b":291},{"a":714,"b":724}]},{"name":"studentTutoringFeedback","required":false,"transform":{"type":"scalar"},"locs":[{"a":298,"b":321}]},{"name":"studentCounselingFeedback","required":false,"transform":{"type":"scalar"},"locs":[{"a":328,"b":353}]},{"name":"volunteerFeedback","required":false,"transform":{"type":"scalar"},"locs":[{"a":360,"b":377}]},{"name":"comment","required":false,"transform":{"type":"scalar"},"locs":[{"a":384,"b":391}]},{"name":"userRole","required":true,"transform":{"type":"scalar"},"locs":[{"a":418,"b":427},{"a":679,"b":688}]}],"statement":"INSERT INTO feedbacks (id, topic_id, subject_id, user_role_id, session_id, student_tutoring_feedback, student_counseling_feedback, volunteer_feedback, comment, user_id, created_at, updated_at)\nSELECT\n    :id!,\n    subjects.topic_id,\n    sessions.subject_id,\n    user_roles.id,\n    :sessionId!,\n    :studentTutoringFeedback,\n    :studentCounselingFeedback,\n    :volunteerFeedback,\n    :comment,\n    (\n        CASE WHEN :userRole! = 'student' THEN\n            sessions.student_id\n        ELSE\n            sessions.volunteer_id\n        END),\n    NOW(),\n    NOW()\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN user_roles ON user_roles.name = :userRole!\nWHERE\n    sessions.id = :sessionId!\nON CONFLICT (user_id,\n    session_id)\n    DO NOTHING\nRETURNING\n    feedbacks.id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO feedbacks (id, topic_id, subject_id, user_role_id, session_id, student_tutoring_feedback, student_counseling_feedback, volunteer_feedback, comment, user_id, created_at, updated_at)
 * SELECT
 *     :id!,
 *     subjects.topic_id,
 *     sessions.subject_id,
 *     user_roles.id,
 *     :sessionId!,
 *     :studentTutoringFeedback,
 *     :studentCounselingFeedback,
 *     :volunteerFeedback,
 *     :comment,
 *     (
 *         CASE WHEN :userRole! = 'student' THEN
 *             sessions.student_id
 *         ELSE
 *             sessions.volunteer_id
 *         END),
 *     NOW(),
 *     NOW()
 * FROM
 *     sessions
 *     LEFT JOIN subjects ON subjects.id = sessions.subject_id
 *     JOIN user_roles ON user_roles.name = :userRole!
 * WHERE
 *     sessions.id = :sessionId!
 * ON CONFLICT (user_id,
 *     session_id)
 *     DO NOTHING
 * RETURNING
 *     feedbacks.id
 * ```
 */
export const upsertFeedback = new PreparedQuery<IUpsertFeedbackParams,IUpsertFeedbackResult>(upsertFeedbackIR);


/** 'GetFeedbackByUserId' parameters type */
export interface IGetFeedbackByUserIdParams {
  userId: string;
}

/** 'GetFeedbackByUserId' return type */
export interface IGetFeedbackByUserIdResult {
  createdAt: Date;
  id: string;
  legacyFeedbacks: Json | null;
  responseData: Json | null;
  sessionId: string;
  studentCounselingFeedback: Json | null;
  studentTutoringFeedback: Json | null;
  subTopic: string;
  type: string;
  updatedAt: Date;
  userId: string;
  userRole: string;
  volunteerFeedback: Json | null;
}

/** 'GetFeedbackByUserId' query type */
export interface IGetFeedbackByUserIdQuery {
  params: IGetFeedbackByUserIdParams;
  result: IGetFeedbackByUserIdResult;
}

const getFeedbackByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":572,"b":579}]}],"statement":"SELECT\n    feedbacks.id,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    user_id,\n    user_roles.name AS user_role,\n    session_id,\n    student_tutoring_feedback,\n    student_counseling_feedback,\n    volunteer_feedback,\n    legacy_feedbacks,\n    legacy_feedbacks AS response_data,\n    feedbacks.created_at,\n    feedbacks.updated_at\nFROM\n    feedbacks\n    LEFT JOIN topics ON feedbacks.topic_id = topics.id\n    LEFT JOIN subjects ON feedbacks.subject_id = subjects.id\n    JOIN user_roles ON feedbacks.user_role_id = user_roles.id\nWHERE\n    feedbacks.user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     feedbacks.id,
 *     topics.name AS TYPE,
 *     subjects.name AS sub_topic,
 *     user_id,
 *     user_roles.name AS user_role,
 *     session_id,
 *     student_tutoring_feedback,
 *     student_counseling_feedback,
 *     volunteer_feedback,
 *     legacy_feedbacks,
 *     legacy_feedbacks AS response_data,
 *     feedbacks.created_at,
 *     feedbacks.updated_at
 * FROM
 *     feedbacks
 *     LEFT JOIN topics ON feedbacks.topic_id = topics.id
 *     LEFT JOIN subjects ON feedbacks.subject_id = subjects.id
 *     JOIN user_roles ON feedbacks.user_role_id = user_roles.id
 * WHERE
 *     feedbacks.user_id = :userId!
 * ```
 */
export const getFeedbackByUserId = new PreparedQuery<IGetFeedbackByUserIdParams,IGetFeedbackByUserIdResult>(getFeedbackByUserIdIR);


