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


/** 'GetSignupSources' parameters type */
export interface IGetSignupSourcesParams {
  role?: string | null | void;
}

/** 'GetSignupSources' return type */
export interface IGetSignupSourcesResult {
  id: number;
  name: string;
}

/** 'GetSignupSources' query type */
export interface IGetSignupSourcesQuery {
  params: IGetSignupSourcesParams;
  result: IGetSignupSourcesResult;
}

const getSignupSourcesIR: any = {"usedParamSet":{"role":true},"params":[{"name":"role","required":false,"transform":{"type":"scalar"},"locs":[{"a":162,"b":166},{"a":193,"b":197},{"a":229,"b":233}]}],"statement":"SELECT\n    id,\n    name\nFROM\n    signup_sources\nWHERE\n    -- Do not include Roster in general\n    name <> 'Roster'\n    -- Exclude YouTube for volunteers\n    AND (:role::text IS NULL\n        OR :role::text = 'student'\n        OR (:role::text = 'volunteer'\n            AND name <> 'Youtube'))\nORDER BY\n    RANDOM()"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     name
 * FROM
 *     signup_sources
 * WHERE
 *     -- Do not include Roster in general
 *     name <> 'Roster'
 *     -- Exclude YouTube for volunteers
 *     AND (:role::text IS NULL
 *         OR :role::text = 'student'
 *         OR (:role::text = 'volunteer'
 *             AND name <> 'Youtube'))
 * ORDER BY
 *     RANDOM()
 * ```
 */
export const getSignupSources = new PreparedQuery<IGetSignupSourcesParams,IGetSignupSourcesResult>(getSignupSourcesIR);


