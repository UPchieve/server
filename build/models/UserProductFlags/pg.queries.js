"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaidTutorsPilotGroup = exports.updateFallIncentiveProgram = exports.updateSentInactiveNinetyDayEmail = exports.updateSentInactiveSixtyDayEmail = exports.updateSentInactiveThirtyDayEmail = exports.getPublicUpfByUserId = exports.getUpfByUserId = exports.createUpfByUserId = void 0;
/** Types generated for queries found in "server/models/UserProductFlags/user_product_flags.sql" */
const query_1 = require("@pgtyped/query");
const createUpfByUserIdIR = { "name": "createUpfByUserId", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 107, "b": 113, "line": 4, "col": 5 }, { "a": 270, "b": 276, "line": 14, "col": 23 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "INSERT INTO user_product_flags (user_id, created_at, updated_at)\nSELECT\n    :userId!,\n    NOW(),\n    NOW()\nWHERE\n    NOT EXISTS (\n        SELECT\n            1\n        FROM\n            user_product_flags\n        WHERE\n            user_id = :userId!)\nRETURNING\n    user_id,\n    sent_ready_to_coach_email,\n    sent_hour_summary_intro_email,\n    sent_inactive_thirty_day_email,\n    sent_inactive_sixty_day_email,\n    sent_inactive_ninety_day_email,\n    gates_qualified,\n    fall_incentive_program,\n    paid_tutors_pilot_group,\n    created_at,\n    updated_at", "loc": { "a": 30, "b": 582, "line": 2, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_product_flags (user_id, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     NOW(),
 *     NOW()
 * WHERE
 *     NOT EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             user_product_flags
 *         WHERE
 *             user_id = :userId!)
 * RETURNING
 *     user_id,
 *     sent_ready_to_coach_email,
 *     sent_hour_summary_intro_email,
 *     sent_inactive_thirty_day_email,
 *     sent_inactive_sixty_day_email,
 *     sent_inactive_ninety_day_email,
 *     gates_qualified,
 *     fall_incentive_program,
 *     paid_tutors_pilot_group,
 *     created_at,
 *     updated_at
 * ```
 */
exports.createUpfByUserId = new query_1.PreparedQuery(createUpfByUserIdIR);
const getUpfByUserIdIR = { "name": "getUpfByUserId", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 965, "b": 971, "line": 45, "col": 15 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "SELECT\n    user_id,\n    sent_ready_to_coach_email,\n    sent_hour_summary_intro_email,\n    sent_inactive_thirty_day_email,\n    sent_inactive_sixty_day_email,\n    sent_inactive_ninety_day_email,\n    gates_qualified,\n    fall_incentive_program,\n    paid_tutors_pilot_group,\n    created_at,\n    updated_at\nFROM\n    user_product_flags\nWHERE\n    user_id = :userId!", "loc": { "a": 614, "b": 971, "line": 30, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     sent_ready_to_coach_email,
 *     sent_hour_summary_intro_email,
 *     sent_inactive_thirty_day_email,
 *     sent_inactive_sixty_day_email,
 *     sent_inactive_ninety_day_email,
 *     gates_qualified,
 *     fall_incentive_program,
 *     paid_tutors_pilot_group,
 *     created_at,
 *     updated_at
 * FROM
 *     user_product_flags
 * WHERE
 *     user_id = :userId!
 * ```
 */
exports.getUpfByUserId = new query_1.PreparedQuery(getUpfByUserIdIR);
const getPublicUpfByUserIdIR = { "name": "getPublicUpfByUserId", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1126, "b": 1132, "line": 56, "col": 15 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "SELECT\n    user_id,\n    gates_qualified,\n    fall_incentive_program\nFROM\n    user_product_flags\nWHERE\n    user_id = :userId!", "loc": { "a": 1009, "b": 1132, "line": 49, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     gates_qualified,
 *     fall_incentive_program
 * FROM
 *     user_product_flags
 * WHERE
 *     user_id = :userId!
 * ```
 */
exports.getPublicUpfByUserId = new query_1.PreparedQuery(getPublicUpfByUserIdIR);
const updateSentInactiveThirtyDayEmailIR = { "name": "updateSentInactiveThirtyDayEmail", "params": [{ "name": "sentInactiveThirtyDayEmail", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1254, "b": 1280, "line": 63, "col": 38 }] } }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1327, "b": 1333, "line": 66, "col": 15 }] } }], "usedParamSet": { "sentInactiveThirtyDayEmail": true, "userId": true }, "statement": { "body": "UPDATE\n    user_product_flags\nSET\n    sent_inactive_thirty_day_email = :sentInactiveThirtyDayEmail!,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok", "loc": { "a": 1182, "b": 1361, "line": 60, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_inactive_thirty_day_email = :sentInactiveThirtyDayEmail!,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.updateSentInactiveThirtyDayEmail = new query_1.PreparedQuery(updateSentInactiveThirtyDayEmailIR);
const updateSentInactiveSixtyDayEmailIR = { "name": "updateSentInactiveSixtyDayEmail", "params": [{ "name": "sentInactiveSixtyDayEmail", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1481, "b": 1506, "line": 75, "col": 37 }] } }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1553, "b": 1559, "line": 78, "col": 15 }] } }], "usedParamSet": { "sentInactiveSixtyDayEmail": true, "userId": true }, "statement": { "body": "UPDATE\n    user_product_flags\nSET\n    sent_inactive_sixty_day_email = :sentInactiveSixtyDayEmail!,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok", "loc": { "a": 1410, "b": 1587, "line": 72, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_inactive_sixty_day_email = :sentInactiveSixtyDayEmail!,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.updateSentInactiveSixtyDayEmail = new query_1.PreparedQuery(updateSentInactiveSixtyDayEmailIR);
const updateSentInactiveNinetyDayEmailIR = { "name": "updateSentInactiveNinetyDayEmail", "params": [{ "name": "sentInactiveNinetyDayEmail", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1709, "b": 1735, "line": 87, "col": 38 }] } }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1782, "b": 1788, "line": 90, "col": 15 }] } }], "usedParamSet": { "sentInactiveNinetyDayEmail": true, "userId": true }, "statement": { "body": "UPDATE\n    user_product_flags\nSET\n    sent_inactive_ninety_day_email = :sentInactiveNinetyDayEmail!,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok", "loc": { "a": 1637, "b": 1816, "line": 84, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_inactive_ninety_day_email = :sentInactiveNinetyDayEmail!,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.updateSentInactiveNinetyDayEmail = new query_1.PreparedQuery(updateSentInactiveNinetyDayEmailIR);
const updateFallIncentiveProgramIR = { "name": "updateFallIncentiveProgram", "params": [{ "name": "status", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1924, "b": 1930, "line": 99, "col": 30 }] } }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1977, "b": 1983, "line": 102, "col": 15 }] } }], "usedParamSet": { "status": true, "userId": true }, "statement": { "body": "UPDATE\n    user_product_flags\nSET\n    fall_incentive_program = :status!,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok", "loc": { "a": 1860, "b": 2011, "line": 96, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     fall_incentive_program = :status!,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.updateFallIncentiveProgram = new query_1.PreparedQuery(updateFallIncentiveProgramIR);
const updatePaidTutorsPilotGroupIR = { "name": "updatePaidTutorsPilotGroup", "params": [{ "name": "group", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2120, "b": 2125, "line": 111, "col": 31 }] } }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2172, "b": 2178, "line": 114, "col": 15 }] } }], "usedParamSet": { "group": true, "userId": true }, "statement": { "body": "UPDATE\n    user_product_flags\nSET\n    paid_tutors_pilot_group = :group!,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok", "loc": { "a": 2055, "b": 2206, "line": 108, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     paid_tutors_pilot_group = :group!,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.updatePaidTutorsPilotGroup = new query_1.PreparedQuery(updatePaidTutorsPilotGroupIR);
