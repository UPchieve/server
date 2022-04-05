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

const upsertCityIR: any = {"name":"upsertCity","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":119,"b":123,"line":4,"col":17},{"a":356,"b":360,"line":19,"col":16}]}},{"name":"state","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":127,"b":132,"line":4,"col":25}]}}],"usedParamSet":{"name":true,"state":true},"statement":{"body":"WITH ins AS (\nINSERT INTO cities (name, us_state_code, created_at, updated_at)\n        VALUES (:name!, :state!, NOW(), NOW())\n    ON CONFLICT (name, us_state_code)\n        DO NOTHING\n    RETURNING\n        id)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id\n    FROM\n        cities\n    WHERE\n        name = :name!","loc":{"a":23,"b":360,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS (
 * INSERT INTO cities (name, us_state_code, created_at, updated_at)
 *         VALUES (:name!, :state!, NOW(), NOW())
 *     ON CONFLICT (name, us_state_code)
 *         DO NOTHING
 *     RETURNING
 *         id)
 *     SELECT
 *         *
 *     FROM
 *         ins
 *     UNION
 *     SELECT
 *         id
 *     FROM
 *         cities
 *     WHERE
 *         name = :name!
 * ```
 */
export const upsertCity = new PreparedQuery<IUpsertCityParams,IUpsertCityResult>(upsertCityIR);


