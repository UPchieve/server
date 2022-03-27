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


/** 'SaveFeedback' parameters type */
export interface ISaveFeedbackParams {
  comment: string | null | void;
  id: string;
  sessionId: string;
  studentCounselingFeedback: Json | null | void;
  studentTutoringFeedback: Json | null | void;
  userRole: string;
  volunteerFeedback: Json | null | void;
}

/** 'SaveFeedback' return type */
export interface ISaveFeedbackResult {
  id: string;
}

/** 'SaveFeedback' query type */
export interface ISaveFeedbackQuery {
  params: ISaveFeedbackParams;
  result: ISaveFeedbackResult;
}

const saveFeedbackIR: any = {"name":"saveFeedback","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1891,"b":1893,"line":68,"col":5}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1968,"b":1977,"line":72,"col":5},{"a":2336,"b":2345,"line":83,"col":21}]}},{"name":"studentTutoringFeedback","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1985,"b":2007,"line":73,"col":5}]}},{"name":"studentCounselingFeedback","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2015,"b":2039,"line":74,"col":5}]}},{"name":"volunteerFeedback","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2047,"b":2063,"line":75,"col":5}]}},{"name":"comment","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2071,"b":2077,"line":76,"col":5}]}},{"name":"userRole","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2096,"b":2104,"line":77,"col":16},{"a":2305,"b":2313,"line":82,"col":38}]}}],"usedParamSet":{"id":true,"sessionId":true,"studentTutoringFeedback":true,"studentCounselingFeedback":true,"volunteerFeedback":true,"comment":true,"userRole":true},"statement":{"body":"INSERT INTO feedbacks (id, topic_id, subject_id, user_role_id, session_id, student_tutoring_feedback, student_counseling_feedback, volunteer_feedback, comment, user_id, created_at, updated_at)\nSELECT\n    :id!,\n    subjects.topic_id,\n    sessions.subject_id,\n    user_roles.id,\n    :sessionId!,\n    :studentTutoringFeedback,\n    :studentCounselingFeedback,\n    :volunteerFeedback,\n    :comment,\n    (CASE WHEN :userRole! = 'student' THEN sessions.student_id ELSE sessions.volunteer_id END),\n    NOW(),\n    NOW()\nFROM sessions\nLEFT JOIN subjects ON subjects.id = sessions.subject_id\nJOIN user_roles ON user_roles.name = :userRole!\nWHERE sessions.id = :sessionId!\nRETURNING feedbacks.id","loc":{"a":1686,"b":2368,"line":66,"col":0}}};

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
 *     (CASE WHEN :userRole! = 'student' THEN sessions.student_id ELSE sessions.volunteer_id END),
 *     NOW(),
 *     NOW()
 * FROM sessions
 * LEFT JOIN subjects ON subjects.id = sessions.subject_id
 * JOIN user_roles ON user_roles.name = :userRole!
 * WHERE sessions.id = :sessionId!
 * RETURNING feedbacks.id
 * ```
 */
export const saveFeedback = new PreparedQuery<ISaveFeedbackParams,ISaveFeedbackResult>(saveFeedbackIR);


