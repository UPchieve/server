/** Types generated for queries found in "server/models/SessionSummaries/summaries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AddSessionSummary' parameters type */
export interface IAddSessionSummaryParams {
  id: string;
  sessionId: string;
  summary: string;
  traceId: string;
  userType: string;
}

/** 'AddSessionSummary' return type */
export interface IAddSessionSummaryResult {
  createdAt: Date;
  id: string;
  sessionId: string;
  summary: string;
  traceId: string | null;
  userType: string | null;
}

/** 'AddSessionSummary' query type */
export interface IAddSessionSummaryQuery {
  params: IAddSessionSummaryParams;
  result: IAddSessionSummaryResult;
}

const addSessionSummaryIR: any = {"usedParamSet":{"id":true,"sessionId":true,"summary":true,"traceId":true,"userType":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":116,"b":119}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":122,"b":132}]},{"name":"summary","required":true,"transform":{"type":"scalar"},"locs":[{"a":135,"b":143}]},{"name":"traceId","required":true,"transform":{"type":"scalar"},"locs":[{"a":146,"b":154}]},{"name":"userType","required":true,"transform":{"type":"scalar"},"locs":[{"a":282,"b":291}]}],"statement":"INSERT INTO session_summaries (id, session_id, summary, trace_id, user_type_id, created_at, updated_at)\n    VALUES (:id!, :sessionId!, :summary!, :traceId!, (\n            SELECT\n                id\n            FROM\n                user_roles\n            WHERE\n                name = :userType!), NOW(), NOW())\nRETURNING\n    id,\n    session_id,\n    summary,\n    trace_id,\n    (\n        SELECT\n            name\n        FROM\n            user_roles\n        WHERE\n            id = session_summaries.user_type_id) AS user_type,\n    created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_summaries (id, session_id, summary, trace_id, user_type_id, created_at, updated_at)
 *     VALUES (:id!, :sessionId!, :summary!, :traceId!, (
 *             SELECT
 *                 id
 *             FROM
 *                 user_roles
 *             WHERE
 *                 name = :userType!), NOW(), NOW())
 * RETURNING
 *     id,
 *     session_id,
 *     summary,
 *     trace_id,
 *     (
 *         SELECT
 *             name
 *         FROM
 *             user_roles
 *         WHERE
 *             id = session_summaries.user_type_id) AS user_type,
 *     created_at
 * ```
 */
export const addSessionSummary = new PreparedQuery<IAddSessionSummaryParams,IAddSessionSummaryResult>(addSessionSummaryIR);


/** 'GetSessionSummaryBySessionId' parameters type */
export interface IGetSessionSummaryBySessionIdParams {
  sessionId: string;
  userType: string;
}

/** 'GetSessionSummaryBySessionId' return type */
export interface IGetSessionSummaryBySessionIdResult {
  createdAt: Date;
  id: string;
  sessionId: string;
  summary: string;
  traceId: string | null;
  userType: string;
}

/** 'GetSessionSummaryBySessionId' query type */
export interface IGetSessionSummaryBySessionIdQuery {
  params: IGetSessionSummaryBySessionIdParams;
  result: IGetSessionSummaryBySessionIdResult;
}

const getSessionSummaryBySessionIdIR: any = {"usedParamSet":{"sessionId":true,"userType":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":220,"b":230}]},{"name":"userType","required":true,"transform":{"type":"scalar"},"locs":[{"a":250,"b":259}]}],"statement":"SELECT\n    ss.id,\n    ss.session_id,\n    ss.summary,\n    ss.trace_id,\n    ur.name AS user_type,\n    ss.created_at\nFROM\n    session_summaries ss\n    JOIN user_roles ur ON ss.user_type_id = ur.id\nWHERE\n    ss.session_id = :sessionId!\n    AND ur.name = :userType!\nORDER BY\n    ss.created_at DESC\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ss.id,
 *     ss.session_id,
 *     ss.summary,
 *     ss.trace_id,
 *     ur.name AS user_type,
 *     ss.created_at
 * FROM
 *     session_summaries ss
 *     JOIN user_roles ur ON ss.user_type_id = ur.id
 * WHERE
 *     ss.session_id = :sessionId!
 *     AND ur.name = :userType!
 * ORDER BY
 *     ss.created_at DESC
 * LIMIT 1
 * ```
 */
export const getSessionSummaryBySessionId = new PreparedQuery<IGetSessionSummaryBySessionIdParams,IGetSessionSummaryBySessionIdResult>(getSessionSummaryBySessionIdIR);


