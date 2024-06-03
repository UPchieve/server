"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateSponsorOrgAssociatedPartners = exports.migrateStudentPartnerOrgAssociatedPartners = exports.getAssociatedPartnerByVolunteerPartnerKey = exports.getAssociatedPartnerByPartnerOrgKey = exports.getAssociatedPartnerBySponsorOrgKey = exports.getAssociatedPartnerByKey = exports.getAssociatedPartners = void 0;
/** Types generated for queries found in "server/models/AssociatedPartner/associated_partners.sql" */
const query_1 = require("@pgtyped/query");
const getAssociatedPartnersIR = { "name": "getAssociatedPartners", "params": [], "usedParamSet": {}, "statement": { "body": "SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id", "loc": { "a": 34, "b": 618, "line": 2, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ap.key AS KEY,
 *     vpo.id AS volunteer_partner_org_id,
 *     vpo.key AS volunteer_partner_org,
 *     vpo.name AS volunteer_org_display,
 *     spo.id AS student_partner_org_id,
 *     spo.key AS student_partner_org,
 *     coalesce(spo.name, so.name) AS student_org_display,
 *     so.id AS student_sponsor_org_id,
 *     so.key AS student_sponsor_org
 * FROM
 *     associated_partners ap
 *     JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id
 *     JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id
 *     JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id
 * ```
 */
exports.getAssociatedPartners = new query_1.PreparedQuery(getAssociatedPartnersIR);
const getAssociatedPartnerByKeyIR = { "name": "getAssociatedPartnerByKey", "params": [{ "name": "key", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1277, "b": 1280, "line": 36, "col": 14 }] } }], "usedParamSet": { "key": true }, "statement": { "body": "SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id\nWHERE\n    ap.key = :key!", "loc": { "a": 661, "b": 1280, "line": 20, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ap.key AS KEY,
 *     vpo.id AS volunteer_partner_org_id,
 *     vpo.key AS volunteer_partner_org,
 *     vpo.name AS volunteer_org_display,
 *     spo.id AS student_partner_org_id,
 *     spo.key AS student_partner_org,
 *     coalesce(spo.name, so.name) AS student_org_display,
 *     so.id AS student_sponsor_org_id,
 *     so.key AS student_sponsor_org
 * FROM
 *     associated_partners ap
 *     JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id
 *     LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id
 *     LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id
 * WHERE
 *     ap.key = :key!
 * ```
 */
exports.getAssociatedPartnerByKey = new query_1.PreparedQuery(getAssociatedPartnerByKeyIR);
const getAssociatedPartnerBySponsorOrgKeyIR = { "name": "getAssociatedPartnerBySponsorOrgKey", "params": [{ "name": "key", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1949, "b": 1952, "line": 56, "col": 14 }] } }], "usedParamSet": { "key": true }, "statement": { "body": "SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id\nWHERE\n    so.key = :key!", "loc": { "a": 1333, "b": 1952, "line": 40, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ap.key AS KEY,
 *     vpo.id AS volunteer_partner_org_id,
 *     vpo.key AS volunteer_partner_org,
 *     vpo.name AS volunteer_org_display,
 *     spo.id AS student_partner_org_id,
 *     spo.key AS student_partner_org,
 *     coalesce(spo.name, so.name) AS student_org_display,
 *     so.id AS student_sponsor_org_id,
 *     so.key AS student_sponsor_org
 * FROM
 *     associated_partners ap
 *     JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id
 *     LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id
 *     LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id
 * WHERE
 *     so.key = :key!
 * ```
 */
exports.getAssociatedPartnerBySponsorOrgKey = new query_1.PreparedQuery(getAssociatedPartnerBySponsorOrgKeyIR);
const getAssociatedPartnerByPartnerOrgKeyIR = { "name": "getAssociatedPartnerByPartnerOrgKey", "params": [{ "name": "key", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2622, "b": 2625, "line": 76, "col": 15 }] } }], "usedParamSet": { "key": true }, "statement": { "body": "SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id\nWHERE\n    spo.key = :key!", "loc": { "a": 2005, "b": 2625, "line": 60, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ap.key AS KEY,
 *     vpo.id AS volunteer_partner_org_id,
 *     vpo.key AS volunteer_partner_org,
 *     vpo.name AS volunteer_org_display,
 *     spo.id AS student_partner_org_id,
 *     spo.key AS student_partner_org,
 *     coalesce(spo.name, so.name) AS student_org_display,
 *     so.id AS student_sponsor_org_id,
 *     so.key AS student_sponsor_org
 * FROM
 *     associated_partners ap
 *     JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id
 *     LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id
 *     LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id
 * WHERE
 *     spo.key = :key!
 * ```
 */
exports.getAssociatedPartnerByPartnerOrgKey = new query_1.PreparedQuery(getAssociatedPartnerByPartnerOrgKeyIR);
const getAssociatedPartnerByVolunteerPartnerKeyIR = { "name": "getAssociatedPartnerByVolunteerPartnerKey", "params": [{ "name": "key", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3301, "b": 3304, "line": 96, "col": 15 }] } }], "usedParamSet": { "key": true }, "statement": { "body": "SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id\nWHERE\n    vpo.key = :key!", "loc": { "a": 2684, "b": 3304, "line": 80, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ap.key AS KEY,
 *     vpo.id AS volunteer_partner_org_id,
 *     vpo.key AS volunteer_partner_org,
 *     vpo.name AS volunteer_org_display,
 *     spo.id AS student_partner_org_id,
 *     spo.key AS student_partner_org,
 *     coalesce(spo.name, so.name) AS student_org_display,
 *     so.id AS student_sponsor_org_id,
 *     so.key AS student_sponsor_org
 * FROM
 *     associated_partners ap
 *     JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id
 *     LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id
 *     LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id
 * WHERE
 *     vpo.key = :key!
 * ```
 */
exports.getAssociatedPartnerByVolunteerPartnerKey = new query_1.PreparedQuery(getAssociatedPartnerByVolunteerPartnerKeyIR);
const migrateStudentPartnerOrgAssociatedPartnersIR = { "name": "migrateStudentPartnerOrgAssociatedPartners", "params": [], "usedParamSet": {}, "statement": { "body": "INSERT INTO student_partner_orgs_volunteer_partner_orgs_instances (student_partner_org_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    ap.student_partner_org_id,\n    ap.volunteer_partner_org_id,\n    ap.created_at,\n    NOW()\nFROM\n    associated_partners ap\nWHERE\n    ap.student_partner_org_id IS NOT NULL", "loc": { "a": 3364, "b": 3683, "line": 100, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs_volunteer_partner_orgs_instances (student_partner_org_id, volunteer_partner_org_id, created_at, updated_at)
 * SELECT
 *     ap.student_partner_org_id,
 *     ap.volunteer_partner_org_id,
 *     ap.created_at,
 *     NOW()
 * FROM
 *     associated_partners ap
 * WHERE
 *     ap.student_partner_org_id IS NOT NULL
 * ```
 */
exports.migrateStudentPartnerOrgAssociatedPartners = new query_1.PreparedQuery(migrateStudentPartnerOrgAssociatedPartnersIR);
const migrateSponsorOrgAssociatedPartnersIR = { "name": "migrateSponsorOrgAssociatedPartners", "params": [], "usedParamSet": {}, "statement": { "body": "INSERT INTO sponsor_orgs_volunteer_partner_orgs_instances (sponsor_org_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    ap.student_sponsor_org_id,\n    ap.volunteer_partner_org_id,\n    ap.created_at,\n    NOW()\nFROM\n    associated_partners ap\nWHERE\n    ap.student_sponsor_org_id IS NOT NULL", "loc": { "a": 3736, "b": 4039, "line": 113, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sponsor_orgs_volunteer_partner_orgs_instances (sponsor_org_id, volunteer_partner_org_id, created_at, updated_at)
 * SELECT
 *     ap.student_sponsor_org_id,
 *     ap.volunteer_partner_org_id,
 *     ap.created_at,
 *     NOW()
 * FROM
 *     associated_partners ap
 * WHERE
 *     ap.student_sponsor_org_id IS NOT NULL
 * ```
 */
exports.migrateSponsorOrgAssociatedPartners = new query_1.PreparedQuery(migrateSponsorOrgAssociatedPartnersIR);
