/** Types generated for queries found in "server/models/ZipCode/zipcode.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetZipCodeByZipCode' parameters type */
export interface IGetZipCodeByZipCodeParams {
  medianIncomeThreshold: number;
  zipCode: string;
}

/** 'GetZipCodeByZipCode' return type */
export interface IGetZipCodeByZipCodeResult {
  cbsaIncome: number | null;
  isEligible: boolean | null;
  isEligibleOld: boolean | null;
  medianIncome: number | null;
  stateIncome: number | null;
  zipCode: string;
}

/** 'GetZipCodeByZipCode' query type */
export interface IGetZipCodeByZipCodeQuery {
  params: IGetZipCodeByZipCodeParams;
  result: IGetZipCodeByZipCodeResult;
}

const getZipCodeByZipCodeIR: any = {"name":"getZipCodeByZipCode","params":[{"name":"medianIncomeThreshold","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":211,"b":232,"line":8,"col":22},{"a":266,"b":287,"line":9,"col":15}]}},{"name":"zipCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":348,"b":355,"line":13,"col":12}]}}],"usedParamSet":{"medianIncomeThreshold":true,"zipCode":true},"statement":{"body":"SELECT\n    code AS zip_code,\n    income AS median_income,\n    cbsa_income,\n    state_income,\n    (income <= GREATEST (cbsa_income * 0.8, state_income * 0.8)\n        OR income <= :medianIncomeThreshold!) AS is_eligible,\n    income <= :medianIncomeThreshold! AS is_eligible_old\nFROM\n    postal_codes\nWHERE\n    code = :zipCode!","loc":{"a":32,"b":355,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     code AS zip_code,
 *     income AS median_income,
 *     cbsa_income,
 *     state_income,
 *     (income <= GREATEST (cbsa_income * 0.8, state_income * 0.8)
 *         OR income <= :medianIncomeThreshold!) AS is_eligible,
 *     income <= :medianIncomeThreshold! AS is_eligible_old
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

const upsertZipCodeIR: any = {"name":"upsertZipCode","params":[{"name":"code","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":488,"b":492,"line":18,"col":13},{"a":731,"b":735,"line":23,"col":29}]}},{"name":"usStateCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":496,"b":507,"line":18,"col":21}]}},{"name":"income","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":511,"b":517,"line":18,"col":36},{"a":621,"b":627,"line":21,"col":18}]}},{"name":"latitude","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":527,"b":535,"line":18,"col":52},{"a":648,"b":656,"line":21,"col":45}]}},{"name":"longitude","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":539,"b":548,"line":18,"col":64},{"a":660,"b":669,"line":21,"col":57}]}}],"usedParamSet":{"code":true,"usStateCode":true,"income":true,"latitude":true,"longitude":true},"statement":{"body":"INSERT INTO postal_codes (code, us_state_code, income, LOCATION, created_at, updated_at)\n    VALUES (:code!, :usStateCode!, :income!, POINT(:latitude!, :longitude!), NOW(), NOW())\nON CONFLICT (code)\n    DO UPDATE SET\n        income = :income!, LOCATION = POINT(:latitude!, :longitude!), updated_at = NOW()\n    WHERE\n        postal_codes.code = :code!\n    RETURNING\n        postal_codes.code AS ok","loc":{"a":386,"b":781,"line":17,"col":0}}};

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


