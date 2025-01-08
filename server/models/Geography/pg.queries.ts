/** Types generated for queries found in "server/models/Geography/geography.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UpsertCity' parameters type */
export interface IUpsertCityParams {
  name: string;
  state: string;
}

/** 'UpsertCity' return type */
export interface IUpsertCityResult {
  id: number | null;
}

/** 'UpsertCity' query type */
export interface IUpsertCityQuery {
  params: IUpsertCityParams;
  result: IUpsertCityResult;
}

const upsertCityIR: any = {"usedParamSet":{"name":true,"state":true},"params":[{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":71,"b":76},{"a":295,"b":300}]},{"name":"state","required":true,"transform":{"type":"scalar"},"locs":[{"a":79,"b":85},{"a":334,"b":339}]}],"statement":"WITH ins AS (\nINSERT INTO cities (name, us_state_code)\n        VALUES (:name!, :state!)\n    ON CONFLICT (name, us_state_code)\n        DO NOTHING\n    RETURNING\n        id)\n    SELECT\n        id\n    FROM\n        ins\n    UNION\n    SELECT\n        id\n    FROM\n        cities\n    WHERE\n        name = :name!\n            AND us_state_code = :state"};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS (
 * INSERT INTO cities (name, us_state_code)
 *         VALUES (:name!, :state!)
 *     ON CONFLICT (name, us_state_code)
 *         DO NOTHING
 *     RETURNING
 *         id)
 *     SELECT
 *         id
 *     FROM
 *         ins
 *     UNION
 *     SELECT
 *         id
 *     FROM
 *         cities
 *     WHERE
 *         name = :name!
 *             AND us_state_code = :state
 * ```
 */
export const upsertCity = new PreparedQuery<IUpsertCityParams,IUpsertCityResult>(upsertCityIR);


