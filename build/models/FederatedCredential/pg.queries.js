"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertFederatedCredential = exports.getFederatedCredential = void 0;
/** Types generated for queries found in "server/models/FederatedCredential/federated_credential.sql" */
const query_1 = require("@pgtyped/query");
const getFederatedCredentialIR = { "name": "getFederatedCredential", "params": [{ "name": "id", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 95, "b": 97, "line": 7, "col": 10 }] } }, { "name": "issuer", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 117, "b": 123, "line": 8, "col": 18 }] } }], "usedParamSet": { "id": true, "issuer": true }, "statement": { "body": "SELECT\n    *\nFROM\n    federated_credentials\nWHERE\n    id = :id!\n    AND issuer = :issuer!", "loc": { "a": 35, "b": 123, "line": 2, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     federated_credentials
 * WHERE
 *     id = :id!
 *     AND issuer = :issuer!
 * ```
 */
exports.getFederatedCredential = new query_1.PreparedQuery(getFederatedCredentialIR);
const insertFederatedCredentialIR = { "name": "insertFederatedCredential", "params": [{ "name": "id", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 235, "b": 237, "line": 13, "col": 13 }] } }, { "name": "issuer", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 241, "b": 247, "line": 13, "col": 19 }] } }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 251, "b": 257, "line": 13, "col": 29 }] } }], "usedParamSet": { "id": true, "issuer": true, "userId": true }, "statement": { "body": "INSERT INTO federated_credentials (id, issuer, user_id)\n    VALUES (:id!, :issuer!, :userId!)", "loc": { "a": 166, "b": 258, "line": 12, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO federated_credentials (id, issuer, user_id)
 *     VALUES (:id!, :issuer!, :userId!)
 * ```
 */
exports.insertFederatedCredential = new query_1.PreparedQuery(insertFederatedCredentialIR);
