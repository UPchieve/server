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


