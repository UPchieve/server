/** Types generated for queries found in "server/models/Geography/geography.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'UpsertCity' parameters type */
export interface IUpsertCityParams {
  name: string;
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

const upsertCityIR: any = {"name":"upsertCity","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":101,"b":105,"line":4,"col":13},{"a":232,"b":236,"line":10,"col":34}]}}],"usedParamSet":{"name":true},"statement":{"body":"WITH ins AS(\n  INSERT INTO cities (name, created_at, updated_at)\n    VALUES (:name!, NOW(), NOW())\n    ON CONFLICT(name) DO NOTHING\n    RETURNING id\n)\nSELECT * FROM ins\nUNION\nSELECT id FROM cities WHERE name=:name!","loc":{"a":23,"b":236,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *   INSERT INTO cities (name, created_at, updated_at)
 *     VALUES (:name!, NOW(), NOW())
 *     ON CONFLICT(name) DO NOTHING
 *     RETURNING id
 * )
 * SELECT * FROM ins
 * UNION
 * SELECT id FROM cities WHERE name=:name!
 * ```
 */
export const upsertCity = new PreparedQuery<IUpsertCityParams,IUpsertCityResult>(upsertCityIR);


