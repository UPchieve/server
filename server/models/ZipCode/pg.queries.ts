/** Types generated for queries found in "server/models/ZipCode/zipcode.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetZipCodeByZipCode' parameters type */
export interface IGetZipCodeByZipCodeParams {
  medianIncomeThreshold: number;
  zipCode: string;
}

/** 'GetZipCodeByZipCode' return type */
export interface IGetZipCodeByZipCodeResult {
  cbsaIncome: number | null;
  isEligible: boolean | null;
  medianIncome: number | null;
  stateIncome: number | null;
  zipCode: string;
}

/** 'GetZipCodeByZipCode' query type */
export interface IGetZipCodeByZipCodeQuery {
  params: IGetZipCodeByZipCodeParams;
  result: IGetZipCodeByZipCodeResult;
}

const getZipCodeByZipCodeIR: any = {"usedParamSet":{"medianIncomeThreshold":true,"zipCode":true},"params":[{"name":"medianIncomeThreshold","required":true,"transform":{"type":"scalar"},"locs":[{"a":204,"b":226}]},{"name":"zipCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":283,"b":291}]}],"statement":"SELECT\n    code AS zip_code,\n    income AS median_income,\n    cbsa_income,\n    state_income,\n    (income <= GREATEST (COALESCE(cbsa_income, 0) * 0.8, COALESCE(state_income, 0) * 0.8)\n        OR income <= :medianIncomeThreshold!) AS is_eligible\nFROM\n    postal_codes\nWHERE\n    code = :zipCode!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     code AS zip_code,
 *     income AS median_income,
 *     cbsa_income,
 *     state_income,
 *     (income <= GREATEST (COALESCE(cbsa_income, 0) * 0.8, COALESCE(state_income, 0) * 0.8)
 *         OR income <= :medianIncomeThreshold!) AS is_eligible
 * FROM
 *     postal_codes
 * WHERE
 *     code = :zipCode!
 * ```
 */
export const getZipCodeByZipCode = new PreparedQuery<IGetZipCodeByZipCodeParams,IGetZipCodeByZipCodeResult>(getZipCodeByZipCodeIR);


/** 'UpsertZipCode' parameters type */
export interface IUpsertZipCodeParams {
  cbsaIncome?: number | null | void;
  code: string;
  income: number;
  latitude: number;
  longitude: number;
  stateIncome?: number | null | void;
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

const upsertZipCodeIR: any = {"usedParamSet":{"code":true,"usStateCode":true,"income":true,"cbsaIncome":true,"stateIncome":true,"latitude":true,"longitude":true},"params":[{"name":"code","required":true,"transform":{"type":"scalar"},"locs":[{"a":128,"b":133},{"a":454,"b":459}]},{"name":"usStateCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":136,"b":148}]},{"name":"income","required":true,"transform":{"type":"scalar"},"locs":[{"a":151,"b":158},{"a":288,"b":295}]},{"name":"cbsaIncome","required":false,"transform":{"type":"scalar"},"locs":[{"a":161,"b":171},{"a":312,"b":322}]},{"name":"stateIncome","required":false,"transform":{"type":"scalar"},"locs":[{"a":174,"b":185},{"a":340,"b":351}]},{"name":"latitude","required":true,"transform":{"type":"scalar"},"locs":[{"a":194,"b":203},{"a":371,"b":380}]},{"name":"longitude","required":true,"transform":{"type":"scalar"},"locs":[{"a":206,"b":216},{"a":383,"b":393}]}],"statement":"INSERT INTO postal_codes (code, us_state_code, income, cbsa_income, state_income, LOCATION, created_at, updated_at)\n    VALUES (:code!, :usStateCode!, :income!, :cbsaIncome, :stateIncome, POINT(:latitude!, :longitude!), NOW(), NOW())\nON CONFLICT (code)\n    DO UPDATE SET\n        income = :income!, cbsa_income = :cbsaIncome, state_income = :stateIncome, LOCATION = POINT(:latitude!, :longitude!), updated_at = NOW()\n    WHERE\n        postal_codes.code = :code!\n    RETURNING\n        postal_codes.code AS ok"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO postal_codes (code, us_state_code, income, cbsa_income, state_income, LOCATION, created_at, updated_at)
 *     VALUES (:code!, :usStateCode!, :income!, :cbsaIncome, :stateIncome, POINT(:latitude!, :longitude!), NOW(), NOW())
 * ON CONFLICT (code)
 *     DO UPDATE SET
 *         income = :income!, cbsa_income = :cbsaIncome, state_income = :stateIncome, LOCATION = POINT(:latitude!, :longitude!), updated_at = NOW()
 *     WHERE
 *         postal_codes.code = :code!
 *     RETURNING
 *         postal_codes.code AS ok
 * ```
 */
export const upsertZipCode = new PreparedQuery<IUpsertZipCodeParams,IUpsertZipCodeResult>(upsertZipCodeIR);


