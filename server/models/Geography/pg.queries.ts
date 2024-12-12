/** Types generated for queries found in "server/models/Geography/geography.sql" */
import { PreparedQuery } from '@pgtyped/query';

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

const upsertCityIR: any = {"name":"upsertCity","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":95,"b":99,"line":4,"col":17},{"a":319,"b":323,"line":19,"col":16}]}},{"name":"state","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":103,"b":108,"line":4,"col":25},{"a":358,"b":362,"line":20,"col":33}]}}],"usedParamSet":{"name":true,"state":true},"statement":{"body":"WITH ins AS (\nINSERT INTO cities (name, us_state_code)\n        VALUES (:name!, :state!)\n    ON CONFLICT (name, us_state_code)\n        DO NOTHING\n    RETURNING\n        id)\n    SELECT\n        id\n    FROM\n        ins\n    UNION\n    SELECT\n        id\n    FROM\n        cities\n    WHERE\n        name = :name!\n            AND us_state_code = :state","loc":{"a":23,"b":362,"line":2,"col":0}}};

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


