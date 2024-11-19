/** Types generated for queries found in "server/models/UserCensorships/user-censorships.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type session_medium = 'audio' | 'video';

/** 'InsertUserCensorship' parameters type */
export interface IInsertUserCensorshipParams {
  active: boolean;
  comment: string | null | void;
  id: string;
  medium: session_medium;
  messageSentAt: Date;
  reason: string;
  sessionId: string;
  userId: string;
}

/** 'InsertUserCensorship' return type */
export interface IInsertUserCensorshipResult {
  countCensorshipsByUserInSession: string | null;
}

/** 'InsertUserCensorship' query type */
export interface IInsertUserCensorshipQuery {
  params: IInsertUserCensorshipParams;
  result: IInsertUserCensorshipResult;
}

const insertUserCensorshipIR: any = {"name":"insertUserCensorship","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":177,"b":179,"line":4,"col":17}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":183,"b":189,"line":4,"col":23},{"a":428,"b":434,"line":11,"col":27}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":193,"b":202,"line":4,"col":33},{"a":466,"b":475,"line":12,"col":30}]}},{"name":"medium","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":206,"b":212,"line":4,"col":46}]}},{"name":"reason","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":216,"b":222,"line":4,"col":56}]}},{"name":"active","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":226,"b":232,"line":4,"col":66}]}},{"name":"comment","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":236,"b":242,"line":4,"col":76}]}},{"name":"messageSentAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":246,"b":259,"line":4,"col":86}]}}],"usedParamSet":{"id":true,"userId":true,"sessionId":true,"medium":true,"reason":true,"active":true,"comment":true,"messageSentAt":true},"statement":{"body":"WITH insert_rows AS (\nINSERT INTO user_censorships (id, user_id, session_id, medium, reason, active, comment, message_sent_at)\n        VALUES (:id!, :userId!, :sessionId!, :medium!, :reason!, :active!, :comment, :messageSentAt!))\n    SELECT\n        1 + count(*) AS count_censorships_by_user_in_session\n    FROM\n        user_censorships\n    WHERE\n        active = TRUE\n            AND user_id = :userId!\n            AND session_id = :sessionId!","loc":{"a":33,"b":475,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH insert_rows AS (
 * INSERT INTO user_censorships (id, user_id, session_id, medium, reason, active, comment, message_sent_at)
 *         VALUES (:id!, :userId!, :sessionId!, :medium!, :reason!, :active!, :comment, :messageSentAt!))
 *     SELECT
 *         1 + count(*) AS count_censorships_by_user_in_session
 *     FROM
 *         user_censorships
 *     WHERE
 *         active = TRUE
 *             AND user_id = :userId!
 *             AND session_id = :sessionId!
 * ```
 */
export const insertUserCensorship = new PreparedQuery<IInsertUserCensorshipParams,IInsertUserCensorshipResult>(insertUserCensorshipIR);


/** 'GetUserCensorshipsBySessionId' parameters type */
export interface IGetUserCensorshipsBySessionIdParams {
  sessionId: string;
}

/** 'GetUserCensorshipsBySessionId' return type */
export interface IGetUserCensorshipsBySessionIdResult {
  active: boolean;
  comment: string | null;
  createdAt: Date;
  id: string;
  medium: session_medium;
  messageSentAt: Date;
  reason: string;
  sessionId: string;
  updatedAt: Date;
  userId: string;
}

/** 'GetUserCensorshipsBySessionId' query type */
export interface IGetUserCensorshipsBySessionIdQuery {
  params: IGetUserCensorshipsBySessionIdParams;
  result: IGetUserCensorshipsBySessionIdResult;
}

const getUserCensorshipsBySessionIdIR: any = {"name":"getUserCensorshipsBySessionId","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":585,"b":594,"line":21,"col":18}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    *\nFROM\n    user_censorships\nWHERE\n    session_id = :sessionId!","loc":{"a":522,"b":594,"line":16,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     user_censorships
 * WHERE
 *     session_id = :sessionId!
 * ```
 */
export const getUserCensorshipsBySessionId = new PreparedQuery<IGetUserCensorshipsBySessionIdParams,IGetUserCensorshipsBySessionIdResult>(getUserCensorshipsBySessionIdIR);


