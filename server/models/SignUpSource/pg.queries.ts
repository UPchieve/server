/** Types generated for queries found in "server/models/SignUpSource/signUpSource.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetSignUpSourceByName' parameters type */
export interface IGetSignUpSourceByNameParams {
  name: string;
}

/** 'GetSignUpSourceByName' return type */
export interface IGetSignUpSourceByNameResult {
  id: number;
  name: string;
}

/** 'GetSignUpSourceByName' query type */
export interface IGetSignUpSourceByNameQuery {
  params: IGetSignUpSourceByNameParams;
  result: IGetSignUpSourceByNameResult;
}

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


