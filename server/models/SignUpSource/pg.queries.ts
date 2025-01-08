/** Types generated for queries found in "server/models/SignUpSource/signUpSource.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** Query 'GetSignUpSourceByName' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetSignUpSourceByNameResult = never;

/** Query 'GetSignUpSourceByName' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetSignUpSourceByNameParams = never;

const getSignUpSourceByNameIR: any = {"usedParamSet":{"name":true},"params":[{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":65,"b":70}]}],"statement":"SELECT\n    id,\n    name\nFROM\n    signup_sources\nWHERE\n    name = :name!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     name
 * FROM
 *     signup_sources
 * WHERE
 *     name = :name!
 * ```
 */
export const getSignUpSourceByName = new PreparedQuery<IGetSignUpSourceByNameParams,IGetSignUpSourceByNameResult>(getSignUpSourceByNameIR);


