/** Types generated for queries found in "server/models/SessionSummaries/summaries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AddSessionSummary' parameters type */
export interface IAddSessionSummaryParams {
  id: string;
  sessionId: string;
  summary: string;
  userType: string;
}

/** 'AddSessionSummary' return type */
export interface IAddSessionSummaryResult {
  createdAt: Date;
  id: string;
  sessionId: string;
  summary: string;
  userType: string | null;
}

/** 'AddSessionSummary' query type */
export interface IAddSessionSummaryQuery {
  params: IAddSessionSummaryParams;
  result: IAddSessionSummaryResult;
}

const addSessionSummaryIR: any = {"usedParamSet":{"id":true,"sessionId":true,"summary":true,"userType":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":103,"b":106}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":109,"b":119}]},{"name":"summary","required":true,"transform":{"type":"scalar"},"locs":[{"a":122,"b":130}]},{"name":"userType","required":true,"transform":{"type":"scalar"},"locs":[{"a":258,"b":267}]}],"statement":"INSERT INTO session_summaries (id, session_id, summary, user_type, created_at, updated_at)\n    VALUES (:id!, :sessionId!, :summary!, (\n            SELECT\n                id\n            FROM\n                user_roles\n            WHERE\n                name = :userType!), NOW(), NOW())\nRETURNING\n    id,\n    session_id,\n    summary,\n   (SELECT name FROM user_roles WHERE id = session_summaries.user_type) AS user_type,\n    created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_summaries (id, session_id, summary, user_type, created_at, updated_at)
 *     VALUES (:id!, :sessionId!, :summary!, (
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
 *    (SELECT name FROM user_roles WHERE id = session_summaries.user_type) AS user_type,
 *     created_at
 * ```
 */
export const addSessionSummary = new PreparedQuery<IAddSessionSummaryParams,IAddSessionSummaryResult>(addSessionSummaryIR);


/** 'GetSessionSummariesBySessionId' parameters type */
export interface IGetSessionSummariesBySessionIdParams {
  sessionId: string;
  userType: string;
}

/** 'GetSessionSummariesBySessionId' return type */
export interface IGetSessionSummariesBySessionIdResult {
  createdAt: Date;
  id: string;
  sessionId: string;
  summary: string;
  userType: string;
}

/** 'GetSessionSummariesBySessionId' query type */
export interface IGetSessionSummariesBySessionIdQuery {
  params: IGetSessionSummariesBySessionIdParams;
  result: IGetSessionSummariesBySessionIdResult;
}

const getSessionSummariesBySessionIdIR: any = {"usedParamSet":{"sessionId":true,"userType":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":200,"b":210}]},{"name":"userType","required":true,"transform":{"type":"scalar"},"locs":[{"a":230,"b":239}]}],"statement":"SELECT\n    ss.id,\n    ss.session_id,\n    ss.summary,\n    ur.name AS user_type,\n    ss.created_at\nFROM\n    session_summaries ss\nJOIN\n    user_roles ur ON ss.user_type = ur.id\nWHERE\n    ss.session_id = :sessionId!\n    AND ur.name = :userType!\nORDER BY\n    ss.created_at DESC\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ss.id,
 *     ss.session_id,
 *     ss.summary,
 *     ur.name AS user_type,
 *     ss.created_at
 * FROM
 *     session_summaries ss
 * JOIN
 *     user_roles ur ON ss.user_type = ur.id
 * WHERE
 *     ss.session_id = :sessionId!
 *     AND ur.name = :userType!
 * ORDER BY
 *     ss.created_at DESC
 * LIMIT 1
 * ```
 */
export const getSessionSummariesBySessionId = new PreparedQuery<IGetSessionSummariesBySessionIdParams,IGetSessionSummariesBySessionIdResult>(getSessionSummariesBySessionIdIR);


