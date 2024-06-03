"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertZipCode = exports.getZipCodeByZipCode = void 0;
/** Types generated for queries found in "server/models/ZipCode/zipcode.sql" */
const query_1 = require("@pgtyped/query");
const getZipCodeByZipCodeIR = { "name": "getZipCodeByZipCode", "params": [{ "name": "medianIncomeThreshold", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 237, "b": 258, "line": 8, "col": 22 }] } }, { "name": "zipCode", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 316, "b": 323, "line": 12, "col": 12 }] } }], "usedParamSet": { "medianIncomeThreshold": true, "zipCode": true }, "statement": { "body": "SELECT\n    code AS zip_code,\n    income AS median_income,\n    cbsa_income,\n    state_income,\n    (income <= GREATEST (COALESCE(cbsa_income, 0) * 0.8, COALESCE(state_income, 0) * 0.8)\n        OR income <= :medianIncomeThreshold!) AS is_eligible\nFROM\n    postal_codes\nWHERE\n    code = :zipCode!", "loc": { "a": 32, "b": 323, "line": 2, "col": 0 } } };
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
exports.getZipCodeByZipCode = new query_1.PreparedQuery(getZipCodeByZipCodeIR);
const upsertZipCodeIR = { "name": "upsertZipCode", "params": [{ "name": "code", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 483, "b": 487, "line": 17, "col": 13 }, { "a": 809, "b": 813, "line": 22, "col": 29 }] } }, { "name": "usStateCode", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 491, "b": 502, "line": 17, "col": 21 }] } }, { "name": "income", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 506, "b": 512, "line": 17, "col": 36 }, { "a": 643, "b": 649, "line": 20, "col": 18 }] } }, { "name": "cbsaIncome", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 516, "b": 525, "line": 17, "col": 46 }, { "a": 667, "b": 676, "line": 20, "col": 42 }] } }, { "name": "stateIncome", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 529, "b": 539, "line": 17, "col": 59 }, { "a": 695, "b": 705, "line": 20, "col": 70 }] } }, { "name": "latitude", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 549, "b": 557, "line": 17, "col": 79 }, { "a": 726, "b": 734, "line": 20, "col": 101 }] } }, { "name": "longitude", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 561, "b": 570, "line": 17, "col": 91 }, { "a": 738, "b": 747, "line": 20, "col": 113 }] } }], "usedParamSet": { "code": true, "usStateCode": true, "income": true, "cbsaIncome": true, "stateIncome": true, "latitude": true, "longitude": true }, "statement": { "body": "INSERT INTO postal_codes (code, us_state_code, income, cbsa_income, state_income, LOCATION, created_at, updated_at)\n    VALUES (:code!, :usStateCode!, :income!, :cbsaIncome, :stateIncome, POINT(:latitude!, :longitude!), NOW(), NOW())\nON CONFLICT (code)\n    DO UPDATE SET\n        income = :income!, cbsa_income = :cbsaIncome, state_income = :stateIncome, LOCATION = POINT(:latitude!, :longitude!), updated_at = NOW()\n    WHERE\n        postal_codes.code = :code!\n    RETURNING\n        postal_codes.code AS ok", "loc": { "a": 354, "b": 859, "line": 16, "col": 0 } } };
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
exports.upsertZipCode = new query_1.PreparedQuery(upsertZipCodeIR);
