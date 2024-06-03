"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backfillVolunteerPartnerOrgStartDates = exports.migrateExistingvolunteerPartnerOrgRelationships = exports.getVolunteerPartnerOrgIdByKey = exports.migrateExistingVolunteerPartnerOrgs = exports.getVolunteerPartnerOrgs = exports.getFullVolunteerPartnerOrgByKey = exports.getVolunteerPartnerOrgForRegistrationByKey = void 0;
/** Types generated for queries found in "server/models/VolunteerPartnerOrg/volunteer_partner_orgs.sql" */
const query_1 = require("@pgtyped/query");
const getVolunteerPartnerOrgForRegistrationByKeyIR = { "name": "getVolunteerPartnerOrgForRegistrationByKey", "params": [{ "name": "key", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 410, "b": 413, "line": 15, "col": 11 }] } }], "usedParamSet": { "key": true }, "statement": { "body": "SELECT\n    KEY,\n    COALESCE(domains.domains, '{}'::text[]) AS domains\nFROM\n    volunteer_partner_orgs vpo\n    LEFT JOIN LATERAL (\n        SELECT\n            ARRAY_AGG(DOMAIN) AS domains\n        FROM\n            required_email_domains\n        WHERE\n            required_email_domains.volunteer_partner_org_id = vpo.id) AS domains ON TRUE\nWHERE\n    KEY = :key!", "loc": { "a": 55, "b": 413, "line": 2, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY,
 *     COALESCE(domains.domains, '{}'::text[]) AS domains
 * FROM
 *     volunteer_partner_orgs vpo
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             ARRAY_AGG(DOMAIN) AS domains
 *         FROM
 *             required_email_domains
 *         WHERE
 *             required_email_domains.volunteer_partner_org_id = vpo.id) AS domains ON TRUE
 * WHERE
 *     KEY = :key!
 * ```
 */
exports.getVolunteerPartnerOrgForRegistrationByKey = new query_1.PreparedQuery(getVolunteerPartnerOrgForRegistrationByKeyIR);
const getFullVolunteerPartnerOrgByKeyIR = { "name": "getFullVolunteerPartnerOrgByKey", "params": [{ "name": "key", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1187, "b": 1190, "line": 41, "col": 11 }] } }], "usedParamSet": { "key": true }, "statement": { "body": "SELECT\n    KEY,\n    max(name) AS name,\n    bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,\n    array_agg(DOMAIN) AS domains,\n    CASE WHEN vpoui.deactivated_on IS NULL THEN\n        FALSE\n    ELSE\n        TRUE\n    END AS deactivated\nFROM\n    volunteer_partner_orgs vpo\n    LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id\n    JOIN ( SELECT DISTINCT ON (volunteer_partner_org_id)\n            volunteer_partner_org_id,\n            deactivated_on\n        FROM\n            volunteer_partner_orgs_upchieve_instances\n        ORDER BY\n            volunteer_partner_org_id,\n            created_at DESC) AS vpoui ON vpo.id = vpoui.volunteer_partner_org_id\nWHERE\n    KEY = :key!\nGROUP BY\n    vpo.key,\n    vpoui.deactivated_on", "loc": { "a": 462, "b": 1237, "line": 19, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY,
 *     max(name) AS name,
 *     bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,
 *     array_agg(DOMAIN) AS domains,
 *     CASE WHEN vpoui.deactivated_on IS NULL THEN
 *         FALSE
 *     ELSE
 *         TRUE
 *     END AS deactivated
 * FROM
 *     volunteer_partner_orgs vpo
 *     LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id
 *     JOIN ( SELECT DISTINCT ON (volunteer_partner_org_id)
 *             volunteer_partner_org_id,
 *             deactivated_on
 *         FROM
 *             volunteer_partner_orgs_upchieve_instances
 *         ORDER BY
 *             volunteer_partner_org_id,
 *             created_at DESC) AS vpoui ON vpo.id = vpoui.volunteer_partner_org_id
 * WHERE
 *     KEY = :key!
 * GROUP BY
 *     vpo.key,
 *     vpoui.deactivated_on
 * ```
 */
exports.getFullVolunteerPartnerOrgByKey = new query_1.PreparedQuery(getFullVolunteerPartnerOrgByKeyIR);
const getVolunteerPartnerOrgsIR = { "name": "getVolunteerPartnerOrgs", "params": [], "usedParamSet": {}, "statement": { "body": "SELECT\n    KEY,\n    max(name) AS name,\n    bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,\n    array_agg(DOMAIN) AS domains,\n    CASE WHEN vpoui.deactivated_on IS NULL THEN\n        FALSE\n    ELSE\n        TRUE\n    END AS deactivated\nFROM\n    volunteer_partner_orgs vpo\n    LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id\n    JOIN ( SELECT DISTINCT ON (volunteer_partner_org_id)\n            volunteer_partner_org_id,\n            deactivated_on\n        FROM\n            volunteer_partner_orgs_upchieve_instances\n        ORDER BY\n            volunteer_partner_org_id,\n            created_at DESC) AS vpoui ON vpo.id = vpoui.volunteer_partner_org_id\nGROUP BY\n    vpo.key,\n    vpoui.deactivated_on", "loc": { "a": 1278, "b": 2031, "line": 48, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY,
 *     max(name) AS name,
 *     bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,
 *     array_agg(DOMAIN) AS domains,
 *     CASE WHEN vpoui.deactivated_on IS NULL THEN
 *         FALSE
 *     ELSE
 *         TRUE
 *     END AS deactivated
 * FROM
 *     volunteer_partner_orgs vpo
 *     LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id
 *     JOIN ( SELECT DISTINCT ON (volunteer_partner_org_id)
 *             volunteer_partner_org_id,
 *             deactivated_on
 *         FROM
 *             volunteer_partner_orgs_upchieve_instances
 *         ORDER BY
 *             volunteer_partner_org_id,
 *             created_at DESC) AS vpoui ON vpo.id = vpoui.volunteer_partner_org_id
 * GROUP BY
 *     vpo.key,
 *     vpoui.deactivated_on
 * ```
 */
exports.getVolunteerPartnerOrgs = new query_1.PreparedQuery(getVolunteerPartnerOrgsIR);
const migrateExistingVolunteerPartnerOrgsIR = { "name": "migrateExistingVolunteerPartnerOrgs", "params": [], "usedParamSet": {}, "statement": { "body": "INSERT INTO volunteer_partner_orgs_upchieve_instances (id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    vpo.id,\n    vpo.created_at,\n    NOW()\nFROM\n    volunteer_partner_orgs vpo", "loc": { "a": 2084, "b": 2298, "line": 75, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO volunteer_partner_orgs_upchieve_instances (id, volunteer_partner_org_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     vpo.id,
 *     vpo.created_at,
 *     NOW()
 * FROM
 *     volunteer_partner_orgs vpo
 * ```
 */
exports.migrateExistingVolunteerPartnerOrgs = new query_1.PreparedQuery(migrateExistingVolunteerPartnerOrgsIR);
const getVolunteerPartnerOrgIdByKeyIR = { "name": "getVolunteerPartnerOrgIdByKey", "params": [{ "name": "volunteerPartnerOrg", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2408, "b": 2427, "line": 91, "col": 11 }] } }], "usedParamSet": { "volunteerPartnerOrg": true }, "statement": { "body": "SELECT\n    id\nFROM\n    volunteer_partner_orgs\nWHERE\n    KEY = :volunteerPartnerOrg!", "loc": { "a": 2345, "b": 2427, "line": 86, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id
 * FROM
 *     volunteer_partner_orgs
 * WHERE
 *     KEY = :volunteerPartnerOrg!
 * ```
 */
exports.getVolunteerPartnerOrgIdByKey = new query_1.PreparedQuery(getVolunteerPartnerOrgIdByKeyIR);
const migrateExistingvolunteerPartnerOrgRelationshipsIR = { "name": "migrateExistingvolunteerPartnerOrgRelationships", "params": [], "usedParamSet": {}, "statement": { "body": "INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    users.id,\n    vp.volunteer_partner_org_id,\n    vp.created_at,\n    NOW()\nFROM\n    users\n    JOIN volunteer_profiles vp ON vp.user_id = users.id\nWHERE\n    vp.volunteer_partner_org_id IS NOT NULL", "loc": { "a": 2492, "b": 2805, "line": 95, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)
 * SELECT
 *     users.id,
 *     vp.volunteer_partner_org_id,
 *     vp.created_at,
 *     NOW()
 * FROM
 *     users
 *     JOIN volunteer_profiles vp ON vp.user_id = users.id
 * WHERE
 *     vp.volunteer_partner_org_id IS NOT NULL
 * ```
 */
exports.migrateExistingvolunteerPartnerOrgRelationships = new query_1.PreparedQuery(migrateExistingvolunteerPartnerOrgRelationshipsIR);
const backfillVolunteerPartnerOrgStartDatesIR = { "name": "backfillVolunteerPartnerOrgStartDates", "params": [{ "name": "createdAt", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2935, "b": 2944, "line": 112, "col": 18 }] } }, { "name": "endedAt", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2969, "b": 2975, "line": 113, "col": 22 }] } }, { "name": "vpoName", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3143, "b": 3150, "line": 119, "col": 20 }] } }], "usedParamSet": { "createdAt": true, "endedAt": true, "vpoName": true }, "statement": { "body": "UPDATE\n    volunteer_partner_orgs_upchieve_instances\nSET\n    created_at = :createdAt!,\n    deactivated_on = :endedAt,\n    updated_at = NOW()\nFROM\n    volunteer_partner_orgs vpo\nWHERE\n    vpo.id = volunteer_partner_orgs_upchieve_instances.volunteer_partner_org_id\n    AND vpo.name = :vpoName!\nRETURNING\n    volunteer_partner_orgs_upchieve_instances.id AS ok", "loc": { "a": 2860, "b": 3215, "line": 109, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_partner_orgs_upchieve_instances
 * SET
 *     created_at = :createdAt!,
 *     deactivated_on = :endedAt,
 *     updated_at = NOW()
 * FROM
 *     volunteer_partner_orgs vpo
 * WHERE
 *     vpo.id = volunteer_partner_orgs_upchieve_instances.volunteer_partner_org_id
 *     AND vpo.name = :vpoName!
 * RETURNING
 *     volunteer_partner_orgs_upchieve_instances.id AS ok
 * ```
 */
exports.backfillVolunteerPartnerOrgStartDates = new query_1.PreparedQuery(backfillVolunteerPartnerOrgStartDatesIR);
