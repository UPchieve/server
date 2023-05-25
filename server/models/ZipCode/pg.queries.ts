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

const getZipCodeByZipCodeIR: any = {"name":"getZipCodeByZipCode","params":[{"name":"medianIncomeThreshold","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":237,"b":258,"line":8,"col":22},{"a":292,"b":313,"line":9,"col":15}]}},{"name":"zipCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":374,"b":381,"line":13,"col":12}]}}],"usedParamSet":{"medianIncomeThreshold":true,"zipCode":true},"statement":{"body":"SELECT\n    code AS zip_code,\n    income AS median_income,\n    cbsa_income,\n    state_income,\n    (income <= GREATEST (COALESCE(cbsa_income, 0) * 0.8, COALESCE(state_income, 0) * 0.8)\n        OR income <= :medianIncomeThreshold!) AS is_eligible,\n    income <= :medianIncomeThreshold! AS is_eligible_old\nFROM\n    postal_codes\nWHERE\n    code = :zipCode!","loc":{"a":32,"b":381,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     code AS zip_code,
 *     income AS median_income,
 *     cbsa_income,
 *     state_income,
 *     (income <= GREATEST (COALESCE(cbsa_income, 0) * 0.8, COALESCE(state_income, 0) * 0.8)
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
  cbsaIncome: number | null | void;
  code: string;
  income: number;
  latitude: number;
  longitude: number;
  stateIncome: number | null | void;
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

const upsertZipCodeIR: any = {"name":"upsertZipCode","params":[{"name":"code","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":541,"b":545,"line":18,"col":13},{"a":867,"b":871,"line":23,"col":29}]}},{"name":"usStateCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":549,"b":560,"line":18,"col":21}]}},{"name":"income","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":564,"b":570,"line":18,"col":36},{"a":701,"b":707,"line":21,"col":18}]}},{"name":"cbsaIncome","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":574,"b":583,"line":18,"col":46},{"a":725,"b":734,"line":21,"col":42}]}},{"name":"stateIncome","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":587,"b":597,"line":18,"col":59},{"a":753,"b":763,"line":21,"col":70}]}},{"name":"latitude","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":607,"b":615,"line":18,"col":79},{"a":784,"b":792,"line":21,"col":101}]}},{"name":"longitude","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":619,"b":628,"line":18,"col":91},{"a":796,"b":805,"line":21,"col":113}]}}],"usedParamSet":{"code":true,"usStateCode":true,"income":true,"cbsaIncome":true,"stateIncome":true,"latitude":true,"longitude":true},"statement":{"body":"INSERT INTO postal_codes (code, us_state_code, income, cbsa_income, state_income, LOCATION, created_at, updated_at)\n    VALUES (:code!, :usStateCode!, :income!, :cbsaIncome, :stateIncome, POINT(:latitude!, :longitude!), NOW(), NOW())\nON CONFLICT (code)\n    DO UPDATE SET\n        income = :income!, cbsa_income = :cbsaIncome, state_income = :stateIncome, LOCATION = POINT(:latitude!, :longitude!), updated_at = NOW()\n    WHERE\n        postal_codes.code = :code!\n    RETURNING\n        postal_codes.code AS ok","loc":{"a":412,"b":917,"line":17,"col":0}}};

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


