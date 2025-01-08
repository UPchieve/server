/** Types generated for queries found in "server/models/Auth/auth.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** Query 'DeleteAuthSessionsForUser' is invalid, so its result is assigned type 'never'.
 *  */
export type IDeleteAuthSessionsForUserResult = never;

/** Query 'DeleteAuthSessionsForUser' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IDeleteAuthSessionsForUserParams = never;

const deleteAuthSessionsForUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":65,"b":72}]}],"statement":"DELETE FROM auth.session\nWHERE (sess -> 'passport') ->> 'user' = :userId!\nRETURNING\n    sid AS ok"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM auth.session
 * WHERE (sess -> 'passport') ->> 'user' = :userId!
 * RETURNING
 *     sid AS ok
 * ```
 */
export const deleteAuthSessionsForUser = new PreparedQuery<IDeleteAuthSessionsForUserParams,IDeleteAuthSessionsForUserResult>(deleteAuthSessionsForUserIR);


