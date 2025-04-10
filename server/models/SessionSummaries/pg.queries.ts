/** Types generated for queries found in "server/models/SessionSummaries/summaries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AddSessionSummary' parameters type */
export interface IAddSessionSummaryParams {
  id: string;
  sessionId: string;
  summary?: string | null | void;
  userType: string;
}

/** 'AddSessionSummary' return type */
export interface IAddSessionSummaryResult {
  createdAt: Date;
  id: string;
  sessionId: string;
  summary: string | null;
  userType: number | null;
}

/** 'AddSessionSummary' query type */
export interface IAddSessionSummaryQuery {
  params: IAddSessionSummaryParams;
  result: IAddSessionSummaryResult;
}

const addSessionSummaryIR: any = {"usedParamSet":{"id":true,"sessionId":true,"summary":true,"userType":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":103,"b":106}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":109,"b":119}]},{"name":"summary","required":false,"transform":{"type":"scalar"},"locs":[{"a":122,"b":129}]},{"name":"userType","required":true,"transform":{"type":"scalar"},"locs":[{"a":257,"b":266}]}],"statement":"INSERT INTO session_summaries (id, session_id, summary, user_type, created_at, updated_at)\n    VALUES (:id!, :sessionId!, :summary, (\n            SELECT\n                id\n            FROM\n                user_roles\n            WHERE\n                name = :userType!), NOW(), NOW())\nRETURNING\n    id,\n    session_id,\n    summary,\n    user_type,\n    created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_summaries (id, session_id, summary, user_type, created_at, updated_at)
 *     VALUES (:id!, :sessionId!, :summary, (
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
 *     user_type,
 *     created_at
 * ```
 */
export const addSessionSummary = new PreparedQuery<IAddSessionSummaryParams,IAddSessionSummaryResult>(addSessionSummaryIR);


/** 'GetSessionSummariesBySessionId' parameters type */
export interface IGetSessionSummariesBySessionIdParams {
  sessionId: string;
}

/** 'GetSessionSummariesBySessionId' return type */
export interface IGetSessionSummariesBySessionIdResult {
  createdAt: Date;
  id: string;
  sessionId: string;
  summary: string | null;
  userType: number | null;
}

/** 'GetSessionSummariesBySessionId' query type */
export interface IGetSessionSummariesBySessionIdQuery {
  params: IGetSessionSummariesBySessionIdParams;
  result: IGetSessionSummariesBySessionIdResult;
}

const getSessionSummariesBySessionIdIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":124,"b":134}]}],"statement":"SELECT\n    id,\n    session_id,\n    summary,\n    user_type,\n    created_at\nFROM\n    session_summaries\nWHERE\n    session_id = :sessionId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     session_id,
 *     summary,
 *     user_type,
 *     created_at
 * FROM
 *     session_summaries
 * WHERE
 *     session_id = :sessionId!
 * ```
 */
export const getSessionSummariesBySessionId = new PreparedQuery<IGetSessionSummariesBySessionIdParams,IGetSessionSummariesBySessionIdResult>(getSessionSummariesBySessionIdIR);


