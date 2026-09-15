/** Types generated for queries found in "server/models/SessionEditorActivity/session-editor-activity.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetSessionEditorActivity' parameters type */
export interface IGetSessionEditorActivityParams {
  sessionId: string;
}

/** 'GetSessionEditorActivity' return type */
export interface IGetSessionEditorActivityResult {
  /** not_pii: Time of creation */
  createdAt: Date;
  /** not_pii: Primary key */
  id: string;
  /** not_pii: Foreign key to upchieve.sessions */
  sessionId: string;
  /** not_pii: An identifier for which tool was used */
  source: string;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'GetSessionEditorActivity' query type */
export interface IGetSessionEditorActivityQuery {
  params: IGetSessionEditorActivityParams;
  result: IGetSessionEditorActivityResult;
}

const getSessionEditorActivityIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":127,"b":137}]}],"statement":"SELECT\n    id,\n    user_id,\n    session_id,\n    source,\n    created_at\nFROM\n    session_editor_activity\nWHERE\n    session_id = :sessionId!\nORDER BY\n    created_at"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     user_id,
 *     session_id,
 *     source,
 *     created_at
 * FROM
 *     session_editor_activity
 * WHERE
 *     session_id = :sessionId!
 * ORDER BY
 *     created_at
 * ```
 */
export const getSessionEditorActivity = new PreparedQuery<IGetSessionEditorActivityParams,IGetSessionEditorActivityResult>(getSessionEditorActivityIR);


/** 'InsertSessionEditorActivity' parameters type */
export interface IInsertSessionEditorActivityParams {
  id: string;
  sessionId: string;
  source: string;
  userId: string;
}

/** 'InsertSessionEditorActivity' return type */
export interface IInsertSessionEditorActivityResult {
  /** not_pii: Primary key */
  id: string;
}

/** 'InsertSessionEditorActivity' query type */
export interface IInsertSessionEditorActivityQuery {
  params: IInsertSessionEditorActivityParams;
  result: IInsertSessionEditorActivityResult;
}

const insertSessionEditorActivityIR: any = {"usedParamSet":{"id":true,"sessionId":true,"userId":true,"source":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":82,"b":85}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":88,"b":98}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":101,"b":108}]},{"name":"source","required":true,"transform":{"type":"scalar"},"locs":[{"a":111,"b":118}]}],"statement":"INSERT INTO session_editor_activity (id, session_id, user_id, source)\n    VALUES (:id!, :sessionId!, :userId!, :source!)\nRETURNING\n    id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_editor_activity (id, session_id, user_id, source)
 *     VALUES (:id!, :sessionId!, :userId!, :source!)
 * RETURNING
 *     id
 * ```
 */
export const insertSessionEditorActivity = new PreparedQuery<IInsertSessionEditorActivityParams,IInsertSessionEditorActivityResult>(insertSessionEditorActivityIR);


