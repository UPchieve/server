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

const addSessionSummaryIR: any = {"usedParamSet":{"id":true,"sessionId":true,"summary":true,"userType":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":106,"b":109}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":112,"b":122}]},{"name":"summary","required":true,"transform":{"type":"scalar"},"locs":[{"a":125,"b":133}]},{"name":"userType","required":true,"transform":{"type":"scalar"},"locs":[{"a":261,"b":270}]}],"statement":"INSERT INTO session_summaries (id, session_id, summary, user_type_id, created_at, updated_at)\n    VALUES (:id!, :sessionId!, :summary!, (\n            SELECT\n                id\n            FROM\n                user_roles\n            WHERE\n                name = :userType!), NOW(), NOW())\nRETURNING\n    id,\n    session_id,\n    summary,\n    (\n        SELECT\n            name\n        FROM\n            user_roles\n        WHERE\n            id = session_summaries.user_type_id) AS user_type,\n    created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_summaries (id, session_id, summary, user_type_id, created_at, updated_at)
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
  userType: string;
}

/** 'GetSessionSummaryBySessionId' query type */
export interface IGetSessionSummaryBySessionIdQuery {
  params: IGetSessionSummaryBySessionIdParams;
  result: IGetSessionSummaryBySessionIdResult;
}

const getSessionSummaryBySessionIdIR: any = {"usedParamSet":{"sessionId":true,"userType":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":203,"b":213}]},{"name":"userType","required":true,"transform":{"type":"scalar"},"locs":[{"a":233,"b":242}]}],"statement":"SELECT\n    ss.id,\n    ss.session_id,\n    ss.summary,\n    ur.name AS user_type,\n    ss.created_at\nFROM\n    session_summaries ss\n    JOIN user_roles ur ON ss.user_type_id = ur.id\nWHERE\n    ss.session_id = :sessionId!\n    AND ur.name = :userType!\nORDER BY\n    ss.created_at DESC\nLIMIT 1"};

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


