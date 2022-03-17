/** Types generated for queries found in "server/models/ZipCode/zipcode.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetZipCodeByZipCode' parameters type */
export interface IGetZipCodeByZipCodeParams {
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

const getZipCodeByZipCodeIR: any = {"name":"getZipCodeByZipCode","params":[{"name":"zipCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":165,"b":172,"line":9,"col":12}]}}],"usedParamSet":{"zipCode":true},"statement":{"body":"SELECT\n    code AS zip_code,\n    income AS median_income,\n    income >= 60000 AS is_eligible\nFROM\n    postal_codes\nWHERE\n    code = :zipCode!","loc":{"a":32,"b":172,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     code AS zip_code,
 *     income AS median_income,
 *     income >= 60000 AS is_eligible
 * FROM
 *     postal_codes
 * WHERE
 *     code = :zipCode!
 * ```
 */
export const getZipCodeByZipCode = new PreparedQuery<IGetZipCodeByZipCodeParams,IGetZipCodeByZipCodeResult>(getZipCodeByZipCodeIR);


