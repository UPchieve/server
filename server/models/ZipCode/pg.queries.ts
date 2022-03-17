/** Types generated for queries found in "server/models/ZipCode/zipcode.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** Query 'GetZipCodeByZipCode' is invalid, so its result is assigned type 'never' */
export type IGetZipCodeByZipCodeResult = never;

/** Query 'GetZipCodeByZipCode' is invalid, so its parameters are assigned type 'never' */
export type IGetZipCodeByZipCodeParams = never;

const getZipCodeByZipCodeIR: any = {"name":"getZipCodeByZipCode","params":[{"name":"zipCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":130,"b":137,"line":8,"col":12}]}}],"usedParamSet":{"zipCode":true},"statement":{"body":"SELECT\n    code AS zip_code,\n    income AS median_income,\nFROM\n    postal_codes\nWHERE\n    code = :zipCode!","loc":{"a":32,"b":137,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     code AS zip_code,
 *     income AS median_income,
 * FROM
 *     postal_codes
 * WHERE
 *     code = :zipCode!
 * ```
 */
export const getZipCodeByZipCode = new PreparedQuery<IGetZipCodeByZipCodeParams,IGetZipCodeByZipCodeResult>(getZipCodeByZipCodeIR);


