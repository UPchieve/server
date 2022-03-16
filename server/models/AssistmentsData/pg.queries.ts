/** Types generated for queries found in "server/models/AssistmentsData/assistments_data.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetAssistmentsDataBySession' parameters type */
export interface IGetAssistmentsDataBySessionParams {
  sessionId: string;
}

/** 'GetAssistmentsDataBySession' return type */
export interface IGetAssistmentsDataBySessionResult {
  assignmentId: string;
  createdAt: Date;
  id: string;
  problemId: number;
  sent: boolean | null;
  sentAt: Date | null;
  sessionId: string;
  studentId: string;
  updatedAt: Date;
}

/** 'GetAssistmentsDataBySession' query type */
export interface IGetAssistmentsDataBySessionQuery {
  params: IGetAssistmentsDataBySessionParams;
  result: IGetAssistmentsDataBySessionResult;
}

const getAssistmentsDataBySessionIR: any = {"name":"getAssistmentsDataBySession","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":226,"b":235,"line":15,"col":18}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    id,\n    problem_id,\n    assignment_id,\n    student_id,\n    session_id,\n    sent,\n    sent_at,\n    created_at,\n    updated_at\nFROM\n    assistments_data\nWHERE\n    session_id = :sessionId!","loc":{"a":40,"b":235,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     problem_id,
 *     assignment_id,
 *     student_id,
 *     session_id,
 *     sent,
 *     sent_at,
 *     created_at,
 *     updated_at
 * FROM
 *     assistments_data
 * WHERE
 *     session_id = :sessionId!
 * ```
 */
export const getAssistmentsDataBySession = new PreparedQuery<IGetAssistmentsDataBySessionParams,IGetAssistmentsDataBySessionResult>(getAssistmentsDataBySessionIR);


/** 'UpdateAssistmentsDataSentById' parameters type */
export interface IUpdateAssistmentsDataSentByIdParams {
  assistmentsDataId: string;
}

/** 'UpdateAssistmentsDataSentById' return type */
export interface IUpdateAssistmentsDataSentByIdResult {
  id: string;
}

/** 'UpdateAssistmentsDataSentById' query type */
export interface IUpdateAssistmentsDataSentByIdQuery {
  params: IUpdateAssistmentsDataSentByIdParams;
  result: IUpdateAssistmentsDataSentByIdResult;
}

const updateAssistmentsDataSentByIdIR: any = {"name":"updateAssistmentsDataSentById","params":[{"name":"assistmentsDataId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":346,"b":363,"line":24,"col":10}]}}],"usedParamSet":{"assistmentsDataId":true},"statement":{"body":"UPDATE\n    assistments_data\nSET\n    sent = TRUE\nWHERE\n    id = :assistmentsDataId!\nRETURNING\n    id","loc":{"a":282,"b":380,"line":19,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     assistments_data
 * SET
 *     sent = TRUE
 * WHERE
 *     id = :assistmentsDataId!
 * RETURNING
 *     id
 * ```
 */
export const updateAssistmentsDataSentById = new PreparedQuery<IUpdateAssistmentsDataSentByIdParams,IUpdateAssistmentsDataSentByIdResult>(updateAssistmentsDataSentByIdIR);


/** 'CreateAssistmentsDataBySessionId' parameters type */
export interface ICreateAssistmentsDataBySessionIdParams {
  assignmentId: string;
  id: string;
  problemId: number;
  sessionId: string;
  studentId: string;
}

/** 'CreateAssistmentsDataBySessionId' return type */
export interface ICreateAssistmentsDataBySessionIdResult {
  assignmentId: string;
  createdAt: Date;
  id: string;
  problemId: number;
  sent: boolean | null;
  sentAt: Date | null;
  sessionId: string;
  studentId: string;
  updatedAt: Date;
}

/** 'CreateAssistmentsDataBySessionId' query type */
export interface ICreateAssistmentsDataBySessionIdQuery {
  params: ICreateAssistmentsDataBySessionIdParams;
  result: ICreateAssistmentsDataBySessionIdResult;
}

const createAssistmentsDataBySessionIdIR: any = {"name":"createAssistmentsDataBySessionId","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":557,"b":559,"line":32,"col":5}]}},{"name":"problemId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":567,"b":576,"line":33,"col":5}]}},{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":584,"b":596,"line":34,"col":5}]}},{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":604,"b":613,"line":35,"col":5}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":621,"b":630,"line":36,"col":5},{"a":811,"b":820,"line":47,"col":26}]}}],"usedParamSet":{"id":true,"problemId":true,"assignmentId":true,"studentId":true,"sessionId":true},"statement":{"body":"INSERT INTO assistments_data (id, problem_id, assignment_id, student_id, session_id, sent, created_at, updated_at)\nSELECT\n    :id!,\n    :problemId!,\n    :assignmentId!,\n    :studentId!,\n    :sessionId!,\n    FALSE,\n    NOW()::date,\n    NOW()::date\nWHERE\n    NOT EXISTS (\n        SELECT\n            1\n        FROM\n            assistments_data\n        WHERE\n            session_id = :sessionId!)\nRETURNING\n    id,\n    problem_id,\n    assignment_id,\n    student_id,\n    session_id,\n    sent,\n    sent_at,\n    created_at,\n    updated_at","loc":{"a":430,"b":960,"line":30,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO assistments_data (id, problem_id, assignment_id, student_id, session_id, sent, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :problemId!,
 *     :assignmentId!,
 *     :studentId!,
 *     :sessionId!,
 *     FALSE,
 *     NOW()::date,
 *     NOW()::date
 * WHERE
 *     NOT EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             assistments_data
 *         WHERE
 *             session_id = :sessionId!)
 * RETURNING
 *     id,
 *     problem_id,
 *     assignment_id,
 *     student_id,
 *     session_id,
 *     sent,
 *     sent_at,
 *     created_at,
 *     updated_at
 * ```
 */
export const createAssistmentsDataBySessionId = new PreparedQuery<ICreateAssistmentsDataBySessionIdParams,ICreateAssistmentsDataBySessionIdResult>(createAssistmentsDataBySessionIdIR);


