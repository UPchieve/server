/** Types generated for queries found in "server/models/Feedback/feedback.sql" */
import { PreparedQuery } from '@pgtyped/query';

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

const getFeedbackBySessionIdIR: any = {"name":"getFeedbackBySessionId","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":488,"b":497,"line":18,"col":18}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    feedbacks.id,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    user_roles.name AS user_role,\n    user_id,\n    session_id,\n    student_tutoring_feedback,\n    student_counseling_feedback,\n    volunteer_feedback\nFROM\n    feedbacks\n    LEFT JOIN topics ON feedbacks.topic_id = topics.id\n    LEFT JOIN subjects ON feedbacks.subject_id = subjects.id\n    JOIN user_roles ON feedbacks.user_role_id = user_roles.id\nWHERE\n    session_id = :sessionId!","loc":{"a":35,"b":497,"line":2,"col":0}}};

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

const getFeedbackByIdIR: any = {"name":"getFeedbackById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":985,"b":987,"line":38,"col":20}]}}],"usedParamSet":{"id":true},"statement":{"body":"SELECT\n    feedbacks.id,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    user_roles.name AS user_role,\n    user_id,\n    session_id,\n    student_tutoring_feedback,\n    student_counseling_feedback,\n    volunteer_feedback\nFROM\n    feedbacks\n    LEFT JOIN topics ON feedbacks.topic_id = topics.id\n    LEFT JOIN subjects ON feedbacks.subject_id = subjects.id\n    JOIN user_roles ON feedbacks.user_role_id = user_roles.id\nWHERE\n    feedbacks.id = :id!","loc":{"a":530,"b":987,"line":22,"col":0}}};

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

const getFeedbackBySessionIdUserTypeIR: any = {"name":"getFeedbackBySessionIdUserType","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1611,"b":1620,"line":62,"col":28}]}},{"name":"userRole","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1649,"b":1657,"line":63,"col":27}]}}],"usedParamSet":{"sessionId":true,"userRole":true},"statement":{"body":"SELECT\n    feedbacks.id,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    user_roles.name AS user_role,\n    user_id,\n    session_id,\n    student_tutoring_feedback,\n    student_counseling_feedback,\n    volunteer_feedback,\n    legacy_feedbacks,\n    legacy_feedbacks AS response_data,\n    feedbacks.created_at,\n    feedbacks.updated_at\nFROM\n    feedbacks\n    LEFT JOIN topics ON feedbacks.topic_id = topics.id\n    LEFT JOIN subjects ON feedbacks.subject_id = subjects.id\n    JOIN user_roles ON feedbacks.user_role_id = user_roles.id\nWHERE\n    feedbacks.session_id = :sessionId!\n    AND user_roles.name = :userRole!","loc":{"a":1035,"b":1657,"line":42,"col":0}}};

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
  comment: string | null | void;
  id: string;
  sessionId: string;
  studentCounselingFeedback: Json | null | void;
  studentTutoringFeedback: Json | null | void;
  userRole: string;
  volunteerFeedback: Json | null | void;
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

const upsertFeedbackIR: any = {"name":"upsertFeedback","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1894,"b":1896,"line":69,"col":5}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1971,"b":1980,"line":73,"col":5},{"a":2404,"b":2413,"line":91,"col":19}]}},{"name":"studentTutoringFeedback","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1988,"b":2010,"line":74,"col":5}]}},{"name":"studentCounselingFeedback","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2018,"b":2042,"line":75,"col":5}]}},{"name":"volunteerFeedback","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2050,"b":2066,"line":76,"col":5}]}},{"name":"comment","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2074,"b":2080,"line":77,"col":5}]}},{"name":"userRole","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2108,"b":2116,"line":79,"col":19},{"a":2369,"b":2377,"line":89,"col":42}]}}],"usedParamSet":{"id":true,"sessionId":true,"studentTutoringFeedback":true,"studentCounselingFeedback":true,"volunteerFeedback":true,"comment":true,"userRole":true},"statement":{"body":"INSERT INTO feedbacks (id, topic_id, subject_id, user_role_id, session_id, student_tutoring_feedback, student_counseling_feedback, volunteer_feedback, comment, user_id, created_at, updated_at)\nSELECT\n    :id!,\n    subjects.topic_id,\n    sessions.subject_id,\n    user_roles.id,\n    :sessionId!,\n    :studentTutoringFeedback,\n    :studentCounselingFeedback,\n    :volunteerFeedback,\n    :comment,\n    (\n        CASE WHEN :userRole! = 'student' THEN\n            sessions.student_id\n        ELSE\n            sessions.volunteer_id\n        END),\n    NOW(),\n    NOW()\nFROM\n    sessions\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    JOIN user_roles ON user_roles.name = :userRole!\nWHERE\n    sessions.id = :sessionId!\nON CONFLICT (user_id,\n    session_id)\n    DO NOTHING\nRETURNING\n    feedbacks.id","loc":{"a":1689,"b":2493,"line":67,"col":0}}};

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

const getFeedbackByUserIdIR: any = {"name":"getFeedbackByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3103,"b":3109,"line":120,"col":25}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    feedbacks.id,\n    topics.name AS TYPE,\n    subjects.name AS sub_topic,\n    user_id,\n    user_roles.name AS user_role,\n    session_id,\n    student_tutoring_feedback,\n    student_counseling_feedback,\n    volunteer_feedback,\n    legacy_feedbacks,\n    legacy_feedbacks AS response_data,\n    feedbacks.created_at,\n    feedbacks.updated_at\nFROM\n    feedbacks\n    LEFT JOIN topics ON feedbacks.topic_id = topics.id\n    LEFT JOIN subjects ON feedbacks.subject_id = subjects.id\n    JOIN user_roles ON feedbacks.user_role_id = user_roles.id\nWHERE\n    feedbacks.user_id = :userId!","loc":{"a":2530,"b":3109,"line":100,"col":0}}};

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


