/** Types generated for queries found in "server/models/Auth/auth.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteAuthSessionsForUser' parameters type */
export interface IDeleteAuthSessionsForUserParams {
  userId: string;
}

/** 'DeleteAuthSessionsForUser' return type */
export interface IDeleteAuthSessionsForUserResult {
  ok: string;
}

/** 'DeleteAuthSessionsForUser' query type */
export interface IDeleteAuthSessionsForUserQuery {
  params: IDeleteAuthSessionsForUserParams;
  result: IDeleteAuthSessionsForUserResult;
}

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


