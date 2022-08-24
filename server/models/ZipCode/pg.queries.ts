/** Types generated for queries found in "server/models/ZipCode/zipcode.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetZipCodeByZipCode' parameters type */
export interface IGetZipCodeByZipCodeParams {
  medianIncomeThreshold: number;
  zipCode: string;
}

/** 'GetZipCodeByZipCode' return type */
export interface IGetZipCodeByZipCodeResult {
  isEligible: boolean | null;
  medianIncome: number | null;
  zipCode: string;
}

/** 'GetZipCodeByZipCode' query type */
export interface IGetZipCodeByZipCodeQuery {
  params: IGetZipCodeByZipCodeParams;
  result: IGetZipCodeByZipCodeResult;
}

const getZipCodeByZipCodeIR: any = {"name":"getZipCodeByZipCode","params":[{"name":"medianIncomeThreshold","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":105,"b":126,"line":5,"col":15}]}},{"name":"zipCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":183,"b":190,"line":9,"col":12}]}}],"usedParamSet":{"medianIncomeThreshold":true,"zipCode":true},"statement":{"body":"SELECT\n    code AS zip_code,\n    income AS median_income,\n    income <= :medianIncomeThreshold! AS is_eligible\nFROM\n    postal_codes\nWHERE\n    code = :zipCode!","loc":{"a":32,"b":190,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     code AS zip_code,
 *     income AS median_income,
 *     income <= :medianIncomeThreshold! AS is_eligible
 * FROM
 *     postal_codes
 * WHERE
 *     code = :zipCode!
 * ```
 */
export const getZipCodeByZipCode = new PreparedQuery<IGetZipCodeByZipCodeParams,IGetZipCodeByZipCodeResult>(getZipCodeByZipCodeIR);


/** 'UpsertZipCode' parameters type */
export interface IUpsertZipCodeParams {
  code: string;
  income: number;
  latitude: number;
  longitude: number;
  usStateCode: string;
}

/** 'UpsertZipCode' return type */
export interface IUpsertZipCodeResult {
  ok: string;
}

/** 'UpsertZipCode' query type */
export interface IUpsertZipCodeQuery {
  params: IUpsertZipCodeParams;
  result: IUpsertZipCodeResult;
}

const upsertZipCodeIR: any = {"name":"upsertZipCode","params":[{"name":"code","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":323,"b":327,"line":14,"col":13},{"a":566,"b":570,"line":19,"col":29}]}},{"name":"usStateCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":331,"b":342,"line":14,"col":21}]}},{"name":"income","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":346,"b":352,"line":14,"col":36},{"a":456,"b":462,"line":17,"col":18}]}},{"name":"latitude","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":362,"b":370,"line":14,"col":52},{"a":483,"b":491,"line":17,"col":45}]}},{"name":"longitude","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":374,"b":383,"line":14,"col":64},{"a":495,"b":504,"line":17,"col":57}]}}],"usedParamSet":{"code":true,"usStateCode":true,"income":true,"latitude":true,"longitude":true},"statement":{"body":"INSERT INTO postal_codes (code, us_state_code, income, LOCATION, created_at, updated_at)\n    VALUES (:code!, :usStateCode!, :income!, POINT(:latitude!, :longitude!), NOW(), NOW())\nON CONFLICT (code)\n    DO UPDATE SET\n        income = :income!, LOCATION = POINT(:latitude!, :longitude!), updated_at = NOW()\n    WHERE\n        postal_codes.code = :code!\n    RETURNING\n        postal_codes.code AS ok","loc":{"a":221,"b":616,"line":13,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO postal_codes (code, us_state_code, income, LOCATION, created_at, updated_at)
 *     VALUES (:code!, :usStateCode!, :income!, POINT(:latitude!, :longitude!), NOW(), NOW())
 * ON CONFLICT (code)
 *     DO UPDATE SET
 *         income = :income!, LOCATION = POINT(:latitude!, :longitude!), updated_at = NOW()
 *     WHERE
 *         postal_codes.code = :code!
 *     RETURNING
 *         postal_codes.code AS ok
 * ```
 */
export const upsertZipCode = new PreparedQuery<IUpsertZipCodeParams,IUpsertZipCodeResult>(upsertZipCodeIR);


