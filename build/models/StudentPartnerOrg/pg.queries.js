"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateExistingPartnerSchoolRelationships = exports.migrateExistingStudentPartnerOrgRelationships = exports.migratePartnerSchoolsToPartnerOrgs = exports.deactivateUserStudentPartnerOrgInstance = exports.deactivateStudentPartnerOrg = exports.createSchoolStudentPartnerOrg = exports.createStudentPartnerOrgInstance = exports.backfillStudentPartnerOrgStartDates = exports.migrateExistingStudentPartnerOrgs = exports.createUserStudentPartnerOrgInstance = exports.getStudentPartnerOrgKeyByCode = exports.getStudentPartnerOrgs = exports.getFullStudentPartnerOrgByKey = exports.getStudentPartnerOrgBySchoolId = exports.getStudentPartnerOrgByKey = exports.getStudentPartnerOrgForRegistrationByKey = void 0;
/** Types generated for queries found in "server/models/StudentPartnerOrg/student_partner_orgs.sql" */
const query_1 = require("@pgtyped/query");
const getStudentPartnerOrgForRegistrationByKeyIR = { "name": "getStudentPartnerOrgForRegistrationByKey", "params": [{ "name": "key", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 399, "b": 402, "line": 17, "col": 15 }] } }], "usedParamSet": { "key": true }, "statement": { "body": "SELECT\n    KEY,\n    spo.name,\n    spo.school_signup_required,\n    sites.sites\nFROM\n    student_partner_orgs spo\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(name) AS sites\n        FROM\n            student_partner_org_sites spos\n        WHERE\n            spo.id = spos.student_partner_org_id) AS sites ON TRUE\nWHERE\n    spo.key = :key!", "loc": { "a": 53, "b": 402, "line": 2, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY,
 *     spo.name,
 *     spo.school_signup_required,
 *     sites.sites
 * FROM
 *     student_partner_orgs spo
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(name) AS sites
 *         FROM
 *             student_partner_org_sites spos
 *         WHERE
 *             spo.id = spos.student_partner_org_id) AS sites ON TRUE
 * WHERE
 *     spo.key = :key!
 * ```
 */
exports.getStudentPartnerOrgForRegistrationByKey = new query_1.PreparedQuery(getStudentPartnerOrgForRegistrationByKeyIR);
const getStudentPartnerOrgByKeyIR = { "name": "getStudentPartnerOrgByKey", "params": [{ "name": "partnerKey", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 759, "b": 769, "line": 32, "col": 15 }] } }, { "name": "partnerSite", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 782, "b": 792, "line": 33, "col": 11 }, { "a": 833, "b": 843, "line": 34, "col": 24 }] } }], "usedParamSet": { "partnerKey": true, "partnerSite": true }, "statement": { "body": "SELECT\n    spo.id AS partner_id,\n    spo.key AS partner_key,\n    spo.name AS partner_name,\n    spos.id AS site_id,\n    spos.name AS site_name,\n    spo.school_id AS school_id\nFROM\n    student_partner_orgs spo\n    LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id\nWHERE\n    spo.key = :partnerKey!\n    AND ((:partnerSite)::text IS NULL\n        OR spos.name = :partnerSite)", "loc": { "a": 445, "b": 844, "line": 21, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     spo.id AS partner_id,
 *     spo.key AS partner_key,
 *     spo.name AS partner_name,
 *     spos.id AS site_id,
 *     spos.name AS site_name,
 *     spo.school_id AS school_id
 * FROM
 *     student_partner_orgs spo
 *     LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id
 * WHERE
 *     spo.key = :partnerKey!
 *     AND ((:partnerSite)::text IS NULL
 *         OR spos.name = :partnerSite)
 * ```
 */
exports.getStudentPartnerOrgByKey = new query_1.PreparedQuery(getStudentPartnerOrgByKeyIR);
const getStudentPartnerOrgBySchoolIdIR = { "name": "getStudentPartnerOrgBySchoolId", "params": [{ "name": "schoolId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1266, "b": 1274, "line": 50, "col": 17 }] } }], "usedParamSet": { "schoolId": true }, "statement": { "body": "SELECT\n    spo.id AS partner_id,\n    spo.key AS partner_key,\n    spo.name AS partner_name,\n    spos.id AS site_id,\n    spos.name AS site_name,\n    spo.school_id AS school_id\nFROM\n    student_partner_orgs spo\n    LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id\n    LEFT JOIN schools school ON spo.school_id = school.id\nWHERE\n    school.id = :schoolId!\n    AND school.partner = TRUE", "loc": { "a": 892, "b": 1304, "line": 38, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     spo.id AS partner_id,
 *     spo.key AS partner_key,
 *     spo.name AS partner_name,
 *     spos.id AS site_id,
 *     spos.name AS site_name,
 *     spo.school_id AS school_id
 * FROM
 *     student_partner_orgs spo
 *     LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id
 *     LEFT JOIN schools school ON spo.school_id = school.id
 * WHERE
 *     school.id = :schoolId!
 *     AND school.partner = TRUE
 * ```
 */
exports.getStudentPartnerOrgBySchoolId = new query_1.PreparedQuery(getStudentPartnerOrgBySchoolIdIR);
const getFullStudentPartnerOrgByKeyIR = { "name": "getFullStudentPartnerOrgByKey", "params": [{ "name": "key", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2328, "b": 2331, "line": 93, "col": 11 }] } }], "usedParamSet": { "key": true }, "statement": { "body": "SELECT\n    KEY,\n    spo.name,\n    signup_code,\n    high_school_signup,\n    college_signup,\n    school_signup_required,\n    sites.sites,\n    (\n        CASE WHEN school_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_school,\n    CASE WHEN spoui.deactivated_on IS NULL THEN\n        FALSE\n    ELSE\n        TRUE\n    END AS deactivated\nFROM\n    student_partner_orgs spo\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(name) AS sites\n        FROM\n            student_partner_org_sites spos\n        WHERE\n            spo.id = spos.student_partner_org_id) AS sites ON TRUE\n    JOIN ( SELECT DISTINCT ON (student_partner_org_id)\n            student_partner_org_id,\n            deactivated_on\n        FROM\n            student_partner_orgs_upchieve_instances\n        ORDER BY\n            student_partner_org_id,\n            created_at DESC,\n            updated_at DESC) AS spoui ON spo.id = spoui.student_partner_org_id\nWHERE\n    KEY = :key!", "loc": { "a": 1351, "b": 2331, "line": 55, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY,
 *     spo.name,
 *     signup_code,
 *     high_school_signup,
 *     college_signup,
 *     school_signup_required,
 *     sites.sites,
 *     (
 *         CASE WHEN school_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_school,
 *     CASE WHEN spoui.deactivated_on IS NULL THEN
 *         FALSE
 *     ELSE
 *         TRUE
 *     END AS deactivated
 * FROM
 *     student_partner_orgs spo
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(name) AS sites
 *         FROM
 *             student_partner_org_sites spos
 *         WHERE
 *             spo.id = spos.student_partner_org_id) AS sites ON TRUE
 *     JOIN ( SELECT DISTINCT ON (student_partner_org_id)
 *             student_partner_org_id,
 *             deactivated_on
 *         FROM
 *             student_partner_orgs_upchieve_instances
 *         ORDER BY
 *             student_partner_org_id,
 *             created_at DESC,
 *             updated_at DESC) AS spoui ON spo.id = spoui.student_partner_org_id
 * WHERE
 *     KEY = :key!
 * ```
 */
exports.getFullStudentPartnerOrgByKey = new query_1.PreparedQuery(getFullStudentPartnerOrgByKeyIR);
const getStudentPartnerOrgsIR = { "name": "getStudentPartnerOrgs", "params": [], "usedParamSet": {}, "statement": { "body": "SELECT\n    KEY,\n    spo.name AS name,\n    signup_code,\n    high_school_signup,\n    college_signup,\n    school_signup_required,\n    sites.sites,\n    (\n        CASE WHEN school_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_school,\n    CASE WHEN spoui.deactivated_on IS NULL THEN\n        FALSE\n    ELSE\n        TRUE\n    END AS deactivated\nFROM\n    student_partner_orgs spo\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(name) AS sites\n        FROM\n            student_partner_org_sites spos\n        WHERE\n            spo.id = spos.student_partner_org_id) AS sites ON TRUE\n    JOIN ( SELECT DISTINCT ON (student_partner_org_id)\n            student_partner_org_id,\n            deactivated_on\n        FROM\n            student_partner_orgs_upchieve_instances\n        ORDER BY\n            student_partner_org_id,\n            created_at DESC) AS spoui ON spo.id = spoui.student_partner_org_id", "loc": { "a": 2370, "b": 3307, "line": 97, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY,
 *     spo.name AS name,
 *     signup_code,
 *     high_school_signup,
 *     college_signup,
 *     school_signup_required,
 *     sites.sites,
 *     (
 *         CASE WHEN school_id IS NOT NULL THEN
 *             TRUE
 *         ELSE
 *             FALSE
 *         END) AS is_school,
 *     CASE WHEN spoui.deactivated_on IS NULL THEN
 *         FALSE
 *     ELSE
 *         TRUE
 *     END AS deactivated
 * FROM
 *     student_partner_orgs spo
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(name) AS sites
 *         FROM
 *             student_partner_org_sites spos
 *         WHERE
 *             spo.id = spos.student_partner_org_id) AS sites ON TRUE
 *     JOIN ( SELECT DISTINCT ON (student_partner_org_id)
 *             student_partner_org_id,
 *             deactivated_on
 *         FROM
 *             student_partner_orgs_upchieve_instances
 *         ORDER BY
 *             student_partner_org_id,
 *             created_at DESC) AS spoui ON spo.id = spoui.student_partner_org_id
 * ```
 */
exports.getStudentPartnerOrgs = new query_1.PreparedQuery(getStudentPartnerOrgsIR);
const getStudentPartnerOrgKeyByCodeIR = { "name": "getStudentPartnerOrgKeyByCode", "params": [{ "name": "signupCode", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3424, "b": 3434, "line": 141, "col": 19 }] } }], "usedParamSet": { "signupCode": true }, "statement": { "body": "SELECT\n    KEY\nFROM\n    student_partner_orgs\nWHERE\n    signup_code = :signupCode!", "loc": { "a": 3354, "b": 3434, "line": 136, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY
 * FROM
 *     student_partner_orgs
 * WHERE
 *     signup_code = :signupCode!
 * ```
 */
exports.getStudentPartnerOrgKeyByCode = new query_1.PreparedQuery(getStudentPartnerOrgKeyByCodeIR);
const createUserStudentPartnerOrgInstanceIR = { "name": "createUserStudentPartnerOrgInstance", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3612, "b": 3618, "line": 146, "col": 13 }] } }, { "name": "spoId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3622, "b": 3627, "line": 146, "col": 23 }] } }, { "name": "sposId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 3631, "b": 3636, "line": 146, "col": 32 }] } }], "usedParamSet": { "userId": true, "spoId": true, "sposId": true }, "statement": { "body": "INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id)\n    VALUES (:userId!, :spoId!, :sposId)", "loc": { "a": 3487, "b": 3637, "line": 145, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id)
 *     VALUES (:userId!, :spoId!, :sposId)
 * ```
 */
exports.createUserStudentPartnerOrgInstance = new query_1.PreparedQuery(createUserStudentPartnerOrgInstanceIR);
const migrateExistingStudentPartnerOrgsIR = { "name": "migrateExistingStudentPartnerOrgs", "params": [], "usedParamSet": {}, "statement": { "body": "INSERT INTO student_partner_orgs_upchieve_instances (id, student_partner_org_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    spo.id,\n    spo.created_at,\n    NOW()\nFROM\n    student_partner_orgs spo", "loc": { "a": 3688, "b": 3896, "line": 150, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs_upchieve_instances (id, student_partner_org_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     spo.id,
 *     spo.created_at,
 *     NOW()
 * FROM
 *     student_partner_orgs spo
 * ```
 */
exports.migrateExistingStudentPartnerOrgs = new query_1.PreparedQuery(migrateExistingStudentPartnerOrgsIR);
const backfillStudentPartnerOrgStartDatesIR = { "name": "backfillStudentPartnerOrgStartDates", "params": [{ "name": "createdAt", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 4022, "b": 4031, "line": 164, "col": 18 }] } }, { "name": "endedAt", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 4056, "b": 4062, "line": 165, "col": 22 }] } }, { "name": "spoName", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 4224, "b": 4231, "line": 171, "col": 20 }] } }], "usedParamSet": { "createdAt": true, "endedAt": true, "spoName": true }, "statement": { "body": "UPDATE\n    student_partner_orgs_upchieve_instances\nSET\n    created_at = :createdAt!,\n    deactivated_on = :endedAt,\n    updated_at = NOW()\nFROM\n    student_partner_orgs spo\nWHERE\n    spo.id = student_partner_orgs_upchieve_instances.student_partner_org_id\n    AND spo.name = :spoName!\nRETURNING\n    student_partner_orgs_upchieve_instances.id AS ok", "loc": { "a": 3949, "b": 4294, "line": 161, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     student_partner_orgs_upchieve_instances
 * SET
 *     created_at = :createdAt!,
 *     deactivated_on = :endedAt,
 *     updated_at = NOW()
 * FROM
 *     student_partner_orgs spo
 * WHERE
 *     spo.id = student_partner_orgs_upchieve_instances.student_partner_org_id
 *     AND spo.name = :spoName!
 * RETURNING
 *     student_partner_orgs_upchieve_instances.id AS ok
 * ```
 */
exports.backfillStudentPartnerOrgStartDates = new query_1.PreparedQuery(backfillStudentPartnerOrgStartDatesIR);
const createStudentPartnerOrgInstanceIR = { "name": "createStudentPartnerOrgInstance", "params": [{ "name": "spoName", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 4575, "b": 4582, "line": 186, "col": 16 }] } }], "usedParamSet": { "spoName": true }, "statement": { "body": "INSERT INTO student_partner_orgs_upchieve_instances (id, student_partner_org_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    spo.id,\n    spo.created_at,\n    NOW()\nFROM\n    student_partner_orgs spo\nWHERE\n    spo.name = :spoName!", "loc": { "a": 4343, "b": 4582, "line": 177, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs_upchieve_instances (id, student_partner_org_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     spo.id,
 *     spo.created_at,
 *     NOW()
 * FROM
 *     student_partner_orgs spo
 * WHERE
 *     spo.name = :spoName!
 * ```
 */
exports.createStudentPartnerOrgInstance = new query_1.PreparedQuery(createStudentPartnerOrgInstanceIR);
const createSchoolStudentPartnerOrgIR = { "name": "createSchoolStudentPartnerOrg", "params": [{ "name": "schoolName", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 5082, "b": 5092, "line": 206, "col": 16 }] } }], "usedParamSet": { "schoolName": true }, "statement": { "body": "INSERT INTO student_partner_orgs (id, KEY, name, signup_code, high_school_signup, college_signup, school_signup_required, school_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    TRANSLATE(BTRIM(LOWER(schools.name)), ' ', '-'),\n    schools.name,\n    TRANSLATE(BTRIM(UPPER(schools.name)), ' ', '-'),\n    TRUE,\n    FALSE,\n    TRUE,\n    COALESCE(schools.id, NULL),\n    NOW(),\n    NOW()\nFROM\n    schools\nWHERE\n    partner IS TRUE\n    AND name = :schoolName!\nON CONFLICT (name)\n    DO UPDATE SET\n        updated_at = NOW()", "loc": { "a": 4629, "b": 5156, "line": 190, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs (id, KEY, name, signup_code, high_school_signup, college_signup, school_signup_required, school_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     TRANSLATE(BTRIM(LOWER(schools.name)), ' ', '-'),
 *     schools.name,
 *     TRANSLATE(BTRIM(UPPER(schools.name)), ' ', '-'),
 *     TRUE,
 *     FALSE,
 *     TRUE,
 *     COALESCE(schools.id, NULL),
 *     NOW(),
 *     NOW()
 * FROM
 *     schools
 * WHERE
 *     partner IS TRUE
 *     AND name = :schoolName!
 * ON CONFLICT (name)
 *     DO UPDATE SET
 *         updated_at = NOW()
 * ```
 */
exports.createSchoolStudentPartnerOrg = new query_1.PreparedQuery(createSchoolStudentPartnerOrgIR);
const deactivateStudentPartnerOrgIR = { "name": "deactivateStudentPartnerOrg", "params": [{ "name": "spoName", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 5443, "b": 5450, "line": 222, "col": 20 }] } }], "usedParamSet": { "spoName": true }, "statement": { "body": "UPDATE\n    student_partner_orgs_upchieve_instances\nSET\n    deactivated_on = NOW(),\n    updated_at = NOW()\nFROM\n    student_partner_orgs spo\nWHERE\n    spo.id = student_partner_orgs_upchieve_instances.student_partner_org_id\n    AND spo.name = :spoName!\nRETURNING\n    student_partner_orgs_upchieve_instances.id AS ok", "loc": { "a": 5201, "b": 5513, "line": 213, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     student_partner_orgs_upchieve_instances
 * SET
 *     deactivated_on = NOW(),
 *     updated_at = NOW()
 * FROM
 *     student_partner_orgs spo
 * WHERE
 *     spo.id = student_partner_orgs_upchieve_instances.student_partner_org_id
 *     AND spo.name = :spoName!
 * RETURNING
 *     student_partner_orgs_upchieve_instances.id AS ok
 * ```
 */
exports.deactivateStudentPartnerOrg = new query_1.PreparedQuery(deactivateStudentPartnerOrgIR);
const deactivateUserStudentPartnerOrgInstanceIR = { "name": "deactivateUserStudentPartnerOrgInstance", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 5694, "b": 5700, "line": 234, "col": 15 }] } }, { "name": "spoId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 5736, "b": 5741, "line": 235, "col": 34 }] } }], "usedParamSet": { "userId": true, "spoId": true }, "statement": { "body": "UPDATE\n    users_student_partner_orgs_instances\nSET\n    deactivated_on = NOW(),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\n    AND student_partner_org_id = :spoId!", "loc": { "a": 5570, "b": 5741, "line": 228, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users_student_partner_orgs_instances
 * SET
 *     deactivated_on = NOW(),
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 *     AND student_partner_org_id = :spoId!
 * ```
 */
exports.deactivateUserStudentPartnerOrgInstance = new query_1.PreparedQuery(deactivateUserStudentPartnerOrgInstanceIR);
const migratePartnerSchoolsToPartnerOrgsIR = { "name": "migratePartnerSchoolsToPartnerOrgs", "params": [{ "name": "createdAt", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 6155, "b": 6164, "line": 249, "col": 5 }] } }, { "name": "schoolName", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 6236, "b": 6246, "line": 255, "col": 16 }] } }], "usedParamSet": { "createdAt": true, "schoolName": true }, "statement": { "body": "INSERT INTO student_partner_orgs (id, KEY, name, signup_code, high_school_signup, college_signup, school_signup_required, school_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    TRANSLATE(BTRIM(LOWER(schools.name)), ' ', '-'),\n    schools.name,\n    TRANSLATE(BTRIM(UPPER(schools.name)), ' ', '-'),\n    TRUE,\n    FALSE,\n    TRUE,\n    schools.id,\n    :createdAt!,\n    NOW()\nFROM\n    schools\nWHERE\n    partner IS TRUE\n    AND name = :schoolName!", "loc": { "a": 5793, "b": 6246, "line": 239, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs (id, KEY, name, signup_code, high_school_signup, college_signup, school_signup_required, school_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     TRANSLATE(BTRIM(LOWER(schools.name)), ' ', '-'),
 *     schools.name,
 *     TRANSLATE(BTRIM(UPPER(schools.name)), ' ', '-'),
 *     TRUE,
 *     FALSE,
 *     TRUE,
 *     schools.id,
 *     :createdAt!,
 *     NOW()
 * FROM
 *     schools
 * WHERE
 *     partner IS TRUE
 *     AND name = :schoolName!
 * ```
 */
exports.migratePartnerSchoolsToPartnerOrgs = new query_1.PreparedQuery(migratePartnerSchoolsToPartnerOrgsIR);
const migrateExistingStudentPartnerOrgRelationshipsIR = { "name": "migrateExistingStudentPartnerOrgRelationships", "params": [], "usedParamSet": {}, "statement": { "body": "INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, student_partner_org_user_id, created_at, updated_at)\nSELECT\n    users.id,\n    sp.student_partner_org_id,\n    sp.student_partner_org_site_id,\n    sp.student_partner_org_user_id,\n    sp.created_at,\n    NOW()\nFROM\n    users\n    JOIN student_profiles sp ON sp.user_id = users.id\nWHERE\n    sp.student_partner_org_id IS NOT NULL", "loc": { "a": 6309, "b": 6742, "line": 259, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, student_partner_org_user_id, created_at, updated_at)
 * SELECT
 *     users.id,
 *     sp.student_partner_org_id,
 *     sp.student_partner_org_site_id,
 *     sp.student_partner_org_user_id,
 *     sp.created_at,
 *     NOW()
 * FROM
 *     users
 *     JOIN student_profiles sp ON sp.user_id = users.id
 * WHERE
 *     sp.student_partner_org_id IS NOT NULL
 * ```
 */
exports.migrateExistingStudentPartnerOrgRelationships = new query_1.PreparedQuery(migrateExistingStudentPartnerOrgRelationshipsIR);
const migrateExistingPartnerSchoolRelationshipsIR = { "name": "migrateExistingPartnerSchoolRelationships", "params": [], "usedParamSet": {}, "statement": { "body": "INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, student_partner_org_user_id, created_at, updated_at)\nSELECT\n    users.id,\n    spo.id,\n    NULL,\n    NULL,\n    sp.created_at,\n    NOW()\nFROM\n    users\n    JOIN student_profiles sp ON sp.user_id = users.id\n    JOIN student_partner_orgs spo ON spo.school_id = sp.school_id", "loc": { "a": 6801, "b": 7181, "line": 275, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, student_partner_org_user_id, created_at, updated_at)
 * SELECT
 *     users.id,
 *     spo.id,
 *     NULL,
 *     NULL,
 *     sp.created_at,
 *     NOW()
 * FROM
 *     users
 *     JOIN student_profiles sp ON sp.user_id = users.id
 *     JOIN student_partner_orgs spo ON spo.school_id = sp.school_id
 * ```
 */
exports.migrateExistingPartnerSchoolRelationships = new query_1.PreparedQuery(migrateExistingPartnerSchoolRelationshipsIR);
