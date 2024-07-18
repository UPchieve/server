/** Types generated for queries found in "server/models/SignUpSource/signUpSource.sql" */
import { PreparedQuery } from '@pgtyped/query';

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

const getSignUpSourceByNameIR: any = {"name":"getSignUpSourceByName","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":100,"b":104,"line":8,"col":12}]}}],"usedParamSet":{"name":true},"statement":{"body":"SELECT\n    id,\n    name\nFROM\n    signup_sources\nWHERE\n    name = :name!","loc":{"a":34,"b":104,"line":2,"col":0}}};

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


