/** Types generated for queries found in "database/seeds/scripts/geography/geography.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'InsertUsState' parameters type */
export interface IInsertUsStateParams {
  code: string;
  name: string;
}

/** 'InsertUsState' return type */
export interface IInsertUsStateResult {
  ok: string | null;
}

/** 'InsertUsState' query type */
export interface IInsertUsStateQuery {
  params: IInsertUsStateParams;
  result: IInsertUsStateResult;
}

const insertUsStateIR: any = {"name":"insertUsState","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":119,"b":123,"line":4,"col":17},{"a":291,"b":295,"line":12,"col":49}]}},{"name":"code","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":127,"b":131,"line":4,"col":25},{"a":307,"b":311,"line":12,"col":65}]}}],"usedParamSet":{"name":true,"code":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO us_states (name, code, created_at, updated_at)\n        VALUES (:name!, :code!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        name AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT name AS ok FROM us_states WHERE name=:name! AND code=:code!","loc":{"a":26,"b":311,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO us_states (name, code, created_at, updated_at)
 *         VALUES (:name!, :code!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         name AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT name AS ok FROM us_states WHERE name=:name! AND code=:code!
 * ```
 */
export const insertUsState = new PreparedQuery<IInsertUsStateParams,IInsertUsStateResult>(insertUsStateIR);


/** 'InsertZipCode' parameters type */
export interface IInsertZipCodeParams {
  code: string;
  income: number;
  lattitude: number;
  longitude: number;
  usStateCode: string;
}

/** 'InsertZipCode' return type */
export interface IInsertZipCodeResult {
  ok: string | null;
}

/** 'InsertZipCode' query type */
export interface IInsertZipCodeQuery {
  params: IInsertZipCodeParams;
  result: IInsertZipCodeResult;
}

const insertZipCodeIR: any = {"name":"insertZipCode","params":[{"name":"code","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":465,"b":469,"line":18,"col":17},{"a":690,"b":694,"line":26,"col":52}]}},{"name":"usStateCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":473,"b":484,"line":18,"col":25},{"a":715,"b":726,"line":26,"col":77}]}},{"name":"income","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":488,"b":494,"line":18,"col":40}]}},{"name":"lattitude","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":504,"b":513,"line":18,"col":56}]}},{"name":"longitude","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":517,"b":526,"line":18,"col":69}]}}],"usedParamSet":{"code":true,"usStateCode":true,"income":true,"lattitude":true,"longitude":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO postal_codes (code, us_state_code, income, LOCATION, created_at, updated_at)\n        VALUES (:code!, :usStateCode!, :income!, POINT(:lattitude!, :longitude!), NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        code AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT code AS ok FROM postal_codes WHERE code=:code! AND us_state_code=:usStateCode!","loc":{"a":342,"b":726,"line":16,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO postal_codes (code, us_state_code, income, LOCATION, created_at, updated_at)
 *         VALUES (:code!, :usStateCode!, :income!, POINT(:lattitude!, :longitude!), NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         code AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT code AS ok FROM postal_codes WHERE code=:code! AND us_state_code=:usStateCode!
 * ```
 */
export const insertZipCode = new PreparedQuery<IInsertZipCodeParams,IInsertZipCodeResult>(insertZipCodeIR);


/** 'InsertWeekday' parameters type */
export interface IInsertWeekdayParams {
  day: string;
}

/** 'InsertWeekday' return type */
export interface IInsertWeekdayResult {
  ok: number | null;
}

/** 'InsertWeekday' query type */
export interface IInsertWeekdayQuery {
  params: IInsertWeekdayParams;
  result: IInsertWeekdayResult;
}

const insertWeekdayIR: any = {"name":"insertWeekday","params":[{"name":"day","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":841,"b":844,"line":31,"col":17},{"a":998,"b":1001,"line":39,"col":45}]}}],"usedParamSet":{"day":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO weekdays (day, created_at, updated_at)\n        VALUES (:day!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM weekdays WHERE day=:day!","loc":{"a":756,"b":1001,"line":29,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO weekdays (day, created_at, updated_at)
 *         VALUES (:day!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM weekdays WHERE day=:day!
 * ```
 */
export const insertWeekday = new PreparedQuery<IInsertWeekdayParams,IInsertWeekdayResult>(insertWeekdayIR);


