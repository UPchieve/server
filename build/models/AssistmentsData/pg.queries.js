"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssistmentsDataBySessionId = exports.updateAssistmentsDataSentById = exports.getAssistmentsDataBySession = void 0;
/** Types generated for queries found in "server/models/AssistmentsData/assistments_data.sql" */
const query_1 = require("@pgtyped/query");
const getAssistmentsDataBySessionIR = { "name": "getAssistmentsDataBySession", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 226, "b": 235, "line": 15, "col": 18 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    id,\n    problem_id,\n    assignment_id,\n    student_id,\n    session_id,\n    sent,\n    sent_at,\n    created_at,\n    updated_at\nFROM\n    assistments_data\nWHERE\n    session_id = :sessionId!", "loc": { "a": 40, "b": 235, "line": 2, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     problem_id,
 *     assignment_id,
 *     student_id,
 *     session_id,
 *     sent,
 *     sent_at,
 *     created_at,
 *     updated_at
 * FROM
 *     assistments_data
 * WHERE
 *     session_id = :sessionId!
 * ```
 */
exports.getAssistmentsDataBySession = new query_1.PreparedQuery(getAssistmentsDataBySessionIR);
const updateAssistmentsDataSentByIdIR = { "name": "updateAssistmentsDataSentById", "params": [{ "name": "assistmentsDataId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 391, "b": 408, "line": 26, "col": 10 }] } }], "usedParamSet": { "assistmentsDataId": true }, "statement": { "body": "UPDATE\n    assistments_data\nSET\n    sent = TRUE,\n    sent_at = NOW(),\n    updated_at = NOW()\nWHERE\n    id = :assistmentsDataId!\nRETURNING\n    id", "loc": { "a": 282, "b": 425, "line": 19, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     assistments_data
 * SET
 *     sent = TRUE,
 *     sent_at = NOW(),
 *     updated_at = NOW()
 * WHERE
 *     id = :assistmentsDataId!
 * RETURNING
 *     id
 * ```
 */
exports.updateAssistmentsDataSentById = new query_1.PreparedQuery(updateAssistmentsDataSentByIdIR);
const createAssistmentsDataBySessionIdIR = { "name": "createAssistmentsDataBySessionId", "params": [{ "name": "id", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 602, "b": 604, "line": 34, "col": 5 }] } }, { "name": "problemId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 612, "b": 621, "line": 35, "col": 5 }] } }, { "name": "assignmentId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 629, "b": 641, "line": 36, "col": 5 }] } }, { "name": "studentId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 649, "b": 658, "line": 37, "col": 5 }] } }, { "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 666, "b": 675, "line": 38, "col": 5 }, { "a": 844, "b": 853, "line": 49, "col": 26 }] } }], "usedParamSet": { "id": true, "problemId": true, "assignmentId": true, "studentId": true, "sessionId": true }, "statement": { "body": "INSERT INTO assistments_data (id, problem_id, assignment_id, student_id, session_id, sent, created_at, updated_at)\nSELECT\n    :id!,\n    :problemId!,\n    :assignmentId!,\n    :studentId!,\n    :sessionId!,\n    FALSE,\n    NOW(),\n    NOW()\nWHERE\n    NOT EXISTS (\n        SELECT\n            1\n        FROM\n            assistments_data\n        WHERE\n            session_id = :sessionId!)\nRETURNING\n    id,\n    problem_id,\n    assignment_id,\n    student_id,\n    session_id,\n    sent,\n    sent_at,\n    created_at,\n    updated_at", "loc": { "a": 475, "b": 993, "line": 32, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO assistments_data (id, problem_id, assignment_id, student_id, session_id, sent, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :problemId!,
 *     :assignmentId!,
 *     :studentId!,
 *     :sessionId!,
 *     FALSE,
 *     NOW(),
 *     NOW()
 * WHERE
 *     NOT EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             assistments_data
 *         WHERE
 *             session_id = :sessionId!)
 * RETURNING
 *     id,
 *     problem_id,
 *     assignment_id,
 *     student_id,
 *     session_id,
 *     sent,
 *     sent_at,
 *     created_at,
 *     updated_at
 * ```
 */
exports.createAssistmentsDataBySessionId = new query_1.PreparedQuery(createAssistmentsDataBySessionIdIR);
