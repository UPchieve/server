/** Types generated for queries found in "server/models/Auth/auth.sql" */
import { PreparedQuery } from '@pgtyped/query';

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

const deleteAuthSessionsForUserIR: any = {"name":"deleteAuthSessionsForUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":104,"b":110,"line":3,"col":41}]}}],"usedParamSet":{"userId":true},"statement":{"body":"DELETE FROM auth.session\nWHERE (sess -> 'passport') ->> 'user' = :userId!\nRETURNING\n    sid AS ok","loc":{"a":38,"b":134,"line":2,"col":0}}};

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


