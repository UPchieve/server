/** Types generated for queries found in "database/seeds/scripts/geography/geography.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'InsertUsState' parameters type */
export interface IInsertUsStateParams {
  code: string;
  name: string;
}

/** 'InsertUsState' return type */
export interface IInsertUsStateResult {
  ok: string;
}

/** 'InsertUsState' query type */
export interface IInsertUsStateQuery {
  params: IInsertUsStateParams;
  result: IInsertUsStateResult;
}

const insertUsStateIR: any = {"name":"insertUsState","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":94,"b":98,"line":2,"col":68}]}},{"name":"code","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":102,"b":106,"line":2,"col":76}]}}],"usedParamSet":{"name":true,"code":true},"statement":{"body":"INSERT INTO us_states (name, code, created_at, updated_at) VALUES (:name!, :code!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING name AS ok","loc":{"a":26,"b":165,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO us_states (name, code, created_at, updated_at) VALUES (:name!, :code!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING name AS ok
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
  ok: string;
}

/** 'InsertZipCode' query type */
export interface IInsertZipCodeQuery {
  params: IInsertZipCodeParams;
  result: IInsertZipCodeResult;
}

const insertZipCodeIR: any = {"name":"insertZipCode","params":[{"name":"code","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":293,"b":297,"line":5,"col":98}]}},{"name":"usStateCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":301,"b":312,"line":5,"col":106}]}},{"name":"income","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":316,"b":322,"line":5,"col":121}]}},{"name":"lattitude","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":332,"b":341,"line":5,"col":137}]}},{"name":"longitude","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":345,"b":354,"line":5,"col":150}]}}],"usedParamSet":{"code":true,"usStateCode":true,"income":true,"lattitude":true,"longitude":true},"statement":{"body":"INSERT INTO postal_codes (code, us_state_code, income, location, created_at, updated_at) VALUES (:code!, :usStateCode!, :income!, POINT(:lattitude!, :longitude!), NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING code AS ok","loc":{"a":195,"b":414,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO postal_codes (code, us_state_code, income, location, created_at, updated_at) VALUES (:code!, :usStateCode!, :income!, POINT(:lattitude!, :longitude!), NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING code AS ok
 * ```
 */
export const insertZipCode = new PreparedQuery<IInsertZipCodeParams,IInsertZipCodeResult>(insertZipCodeIR);


