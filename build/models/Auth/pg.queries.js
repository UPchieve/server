"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAuthSessionsForUser = void 0;
/** Types generated for queries found in "server/models/Auth/auth.sql" */
const query_1 = require("@pgtyped/query");
const deleteAuthSessionsForUserIR = { "name": "deleteAuthSessionsForUser", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 104, "b": 110, "line": 3, "col": 41 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "DELETE FROM auth.session\nWHERE (sess -> 'passport') ->> 'user' = :userId!\nRETURNING\n    sid AS ok", "loc": { "a": 38, "b": 134, "line": 2, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * DELETE FROM auth.session
 * WHERE (sess -> 'passport') ->> 'user' = :userId!
 * RETURNING
 *     sid AS ok
 * ```
 */
exports.deleteAuthSessionsForUser = new query_1.PreparedQuery(deleteAuthSessionsForUserIR);
