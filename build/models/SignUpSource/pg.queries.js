"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignUpSourceByName = void 0;
/** Types generated for queries found in "server/models/SignUpSource/signUpSource.sql" */
const query_1 = require("@pgtyped/query");
const getSignUpSourceByNameIR = { "name": "getSignUpSourceByName", "params": [{ "name": "name", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 100, "b": 104, "line": 8, "col": 12 }] } }], "usedParamSet": { "name": true }, "statement": { "body": "SELECT\n    id,\n    name\nFROM\n    signup_sources\nWHERE\n    name = :name!", "loc": { "a": 34, "b": 104, "line": 2, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     name
 * FROM
 *     signup_sources
 * WHERE
 *     name = :name!
 * ```
 */
exports.getSignUpSourceByName = new query_1.PreparedQuery(getSignUpSourceByNameIR);
