/** Types generated for queries found in "server/models/UserCensorships/user-censorships.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type session_medium = 'audio' | 'video';

/** 'InsertUserCensorship' parameters type */
export interface IInsertUserCensorshipParams {
  active: boolean;
  id: string;
  medium: session_medium;
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

const insertUserCensorshipIR: any = {"name":"insertUserCensorship","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":151,"b":153,"line":4,"col":17}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":157,"b":163,"line":4,"col":23},{"a":375,"b":381,"line":11,"col":27}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":167,"b":176,"line":4,"col":33},{"a":413,"b":422,"line":12,"col":30}]}},{"name":"medium","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":180,"b":186,"line":4,"col":46}]}},{"name":"reason","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":190,"b":196,"line":4,"col":56}]}},{"name":"active","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":200,"b":206,"line":4,"col":66}]}}],"usedParamSet":{"id":true,"userId":true,"sessionId":true,"medium":true,"reason":true,"active":true},"statement":{"body":"WITH insert_rows AS (\nINSERT INTO user_censorships (id, user_id, session_id, medium, reason, active)\n        VALUES (:id!, :userId!, :sessionId!, :medium!, :reason!, :active!))\n    SELECT\n        1 + count(*) AS count_censorships_by_user_in_session\n    FROM\n        user_censorships\n    WHERE\n        active = TRUE\n            AND user_id = :userId!\n            AND session_id = :sessionId!","loc":{"a":33,"b":422,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH insert_rows AS (
 * INSERT INTO user_censorships (id, user_id, session_id, medium, reason, active)
 *         VALUES (:id!, :userId!, :sessionId!, :medium!, :reason!, :active!))
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
  createdAt: Date;
  id: string;
  medium: session_medium;
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

const getUserCensorshipsBySessionIdIR: any = {"name":"getUserCensorshipsBySessionId","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":532,"b":541,"line":21,"col":18}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    *\nFROM\n    user_censorships\nWHERE\n    session_id = :sessionId!","loc":{"a":469,"b":541,"line":16,"col":0}}};

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


