/** Types generated for queries found in "server/models/StudentPartnerOrg/student_partner_orgs.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** Query 'GetStudentPartnerOrgForRegistrationByKey' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetStudentPartnerOrgForRegistrationByKeyResult = never;

/** Query 'GetStudentPartnerOrgForRegistrationByKey' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetStudentPartnerOrgForRegistrationByKeyParams = never;

const getStudentPartnerOrgForRegistrationByKeyIR: any = {"usedParamSet":{"key":true},"params":[{"name":"key","required":true,"transform":{"type":"scalar"},"locs":[{"a":345,"b":349}]}],"statement":"SELECT\n    KEY,\n    spo.name,\n    spo.school_signup_required,\n    sites.sites\nFROM\n    student_partner_orgs spo\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(name) AS sites\n        FROM\n            student_partner_org_sites spos\n        WHERE\n            spo.id = spos.student_partner_org_id) AS sites ON TRUE\nWHERE\n    spo.key = :key!"};

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
export const getStudentPartnerOrgForRegistrationByKey = new PreparedQuery<IGetStudentPartnerOrgForRegistrationByKeyParams,IGetStudentPartnerOrgForRegistrationByKeyResult>(getStudentPartnerOrgForRegistrationByKeyIR);


/** Query 'GetStudentPartnerOrgByKey' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetStudentPartnerOrgByKeyResult = never;

/** Query 'GetStudentPartnerOrgByKey' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetStudentPartnerOrgByKeyParams = never;

const getStudentPartnerOrgByKeyIR: any = {"usedParamSet":{"partnerKey":true,"partnerSite":true},"params":[{"name":"partnerKey","required":true,"transform":{"type":"scalar"},"locs":[{"a":313,"b":324}]},{"name":"partnerSite","required":false,"transform":{"type":"scalar"},"locs":[{"a":336,"b":347},{"a":387,"b":398}]}],"statement":"SELECT\n    spo.id AS partner_id,\n    spo.key AS partner_key,\n    spo.name AS partner_name,\n    spos.id AS site_id,\n    spos.name AS site_name,\n    spo.school_id AS school_id\nFROM\n    student_partner_orgs spo\n    LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id\nWHERE\n    spo.key = :partnerKey!\n    AND ((:partnerSite)::text IS NULL\n        OR spos.name = :partnerSite)"};

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
export const getStudentPartnerOrgByKey = new PreparedQuery<IGetStudentPartnerOrgByKeyParams,IGetStudentPartnerOrgByKeyResult>(getStudentPartnerOrgByKeyIR);


/** Query 'GetStudentPartnerOrgBySchoolId' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetStudentPartnerOrgBySchoolIdResult = never;

/** Query 'GetStudentPartnerOrgBySchoolId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetStudentPartnerOrgBySchoolIdParams = never;

const getStudentPartnerOrgBySchoolIdIR: any = {"usedParamSet":{"schoolId":true},"params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":373,"b":382}]}],"statement":"SELECT\n    spo.id AS partner_id,\n    spo.key AS partner_key,\n    spo.name AS partner_name,\n    spos.id AS site_id,\n    spos.name AS site_name,\n    spo.school_id AS school_id\nFROM\n    student_partner_orgs spo\n    LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id\n    LEFT JOIN schools school ON spo.school_id = school.id\nWHERE\n    school.id = :schoolId!\n    AND school.partner = TRUE"};

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
export const getStudentPartnerOrgBySchoolId = new PreparedQuery<IGetStudentPartnerOrgBySchoolIdParams,IGetStudentPartnerOrgBySchoolIdResult>(getStudentPartnerOrgBySchoolIdIR);


/** Query 'GetFullStudentPartnerOrgByKey' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetFullStudentPartnerOrgByKeyResult = never;

/** Query 'GetFullStudentPartnerOrgByKey' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetFullStudentPartnerOrgByKeyParams = never;

const getFullStudentPartnerOrgByKeyIR: any = {"usedParamSet":{"key":true},"params":[{"name":"key","required":true,"transform":{"type":"scalar"},"locs":[{"a":976,"b":980}]}],"statement":"SELECT\n    KEY,\n    spo.name,\n    signup_code,\n    high_school_signup,\n    college_signup,\n    school_signup_required,\n    sites.sites,\n    (\n        CASE WHEN school_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_school,\n    CASE WHEN spoui.deactivated_on IS NULL THEN\n        FALSE\n    ELSE\n        TRUE\n    END AS deactivated\nFROM\n    student_partner_orgs spo\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(name) AS sites\n        FROM\n            student_partner_org_sites spos\n        WHERE\n            spo.id = spos.student_partner_org_id) AS sites ON TRUE\n    JOIN ( SELECT DISTINCT ON (student_partner_org_id)\n            student_partner_org_id,\n            deactivated_on\n        FROM\n            student_partner_orgs_upchieve_instances\n        ORDER BY\n            student_partner_org_id,\n            created_at DESC,\n            updated_at DESC) AS spoui ON spo.id = spoui.student_partner_org_id\nWHERE\n    KEY = :key!"};

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
export const getFullStudentPartnerOrgByKey = new PreparedQuery<IGetFullStudentPartnerOrgByKeyParams,IGetFullStudentPartnerOrgByKeyResult>(getFullStudentPartnerOrgByKeyIR);


/** Query 'GetStudentPartnerOrgs' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetStudentPartnerOrgsResult = never;

/** Query 'GetStudentPartnerOrgs' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetStudentPartnerOrgsParams = never;

const getStudentPartnerOrgsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    KEY,\n    spo.name AS name,\n    signup_code,\n    high_school_signup,\n    college_signup,\n    school_signup_required,\n    sites.sites,\n    (\n        CASE WHEN school_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_school,\n    CASE WHEN spoui.deactivated_on IS NULL THEN\n        FALSE\n    ELSE\n        TRUE\n    END AS deactivated\nFROM\n    student_partner_orgs spo\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(name) AS sites\n        FROM\n            student_partner_org_sites spos\n        WHERE\n            spo.id = spos.student_partner_org_id) AS sites ON TRUE\n    JOIN ( SELECT DISTINCT ON (student_partner_org_id)\n            student_partner_org_id,\n            deactivated_on\n        FROM\n            student_partner_orgs_upchieve_instances\n        ORDER BY\n            student_partner_org_id,\n            created_at DESC) AS spoui ON spo.id = spoui.student_partner_org_id"};

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
export const getStudentPartnerOrgs = new PreparedQuery<IGetStudentPartnerOrgsParams,IGetStudentPartnerOrgsResult>(getStudentPartnerOrgsIR);


/** Query 'GetStudentPartnerOrgKeyByCode' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetStudentPartnerOrgKeyByCodeResult = never;

/** Query 'GetStudentPartnerOrgKeyByCode' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetStudentPartnerOrgKeyByCodeParams = never;

const getStudentPartnerOrgKeyByCodeIR: any = {"usedParamSet":{"signupCode":true},"params":[{"name":"signupCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":69,"b":80}]}],"statement":"SELECT\n    KEY\nFROM\n    student_partner_orgs\nWHERE\n    signup_code = :signupCode!"};

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
export const getStudentPartnerOrgKeyByCode = new PreparedQuery<IGetStudentPartnerOrgKeyByCodeParams,IGetStudentPartnerOrgKeyByCodeResult>(getStudentPartnerOrgKeyByCodeIR);


/** Query 'CreateUserStudentPartnerOrgInstance' is invalid, so its result is assigned type 'never'.
 *  */
export type ICreateUserStudentPartnerOrgInstanceResult = never;

/** Query 'CreateUserStudentPartnerOrgInstance' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ICreateUserStudentPartnerOrgInstanceParams = never;

const createUserStudentPartnerOrgInstanceIR: any = {"usedParamSet":{"userId":true,"spoId":true,"sposId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":124,"b":131}]},{"name":"spoId","required":true,"transform":{"type":"scalar"},"locs":[{"a":134,"b":140}]},{"name":"sposId","required":false,"transform":{"type":"scalar"},"locs":[{"a":143,"b":149}]}],"statement":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id)\n    VALUES (:userId!, :spoId!, :sposId)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id)
 *     VALUES (:userId!, :spoId!, :sposId)
 * ```
 */
export const createUserStudentPartnerOrgInstance = new PreparedQuery<ICreateUserStudentPartnerOrgInstanceParams,ICreateUserStudentPartnerOrgInstanceResult>(createUserStudentPartnerOrgInstanceIR);


/** Query 'MigrateExistingStudentPartnerOrgs' is invalid, so its result is assigned type 'never'.
 *  */
export type IMigrateExistingStudentPartnerOrgsResult = never;

/** Query 'MigrateExistingStudentPartnerOrgs' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IMigrateExistingStudentPartnerOrgsParams = never;

const migrateExistingStudentPartnerOrgsIR: any = {"usedParamSet":{},"params":[],"statement":"INSERT INTO student_partner_orgs_upchieve_instances (id, student_partner_org_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    spo.id,\n    spo.created_at,\n    NOW()\nFROM\n    student_partner_orgs spo"};

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
export const migrateExistingStudentPartnerOrgs = new PreparedQuery<IMigrateExistingStudentPartnerOrgsParams,IMigrateExistingStudentPartnerOrgsResult>(migrateExistingStudentPartnerOrgsIR);


/** Query 'BackfillStudentPartnerOrgStartDates' is invalid, so its result is assigned type 'never'.
 *  */
export type IBackfillStudentPartnerOrgStartDatesResult = never;

/** Query 'BackfillStudentPartnerOrgStartDates' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IBackfillStudentPartnerOrgStartDatesParams = never;

const backfillStudentPartnerOrgStartDatesIR: any = {"usedParamSet":{"createdAt":true,"endedAt":true,"spoName":true},"params":[{"name":"createdAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":72,"b":82}]},{"name":"endedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":106,"b":113}]},{"name":"spoName","required":true,"transform":{"type":"scalar"},"locs":[{"a":274,"b":282}]}],"statement":"UPDATE\n    student_partner_orgs_upchieve_instances\nSET\n    created_at = :createdAt!,\n    deactivated_on = :endedAt,\n    updated_at = NOW()\nFROM\n    student_partner_orgs spo\nWHERE\n    spo.id = student_partner_orgs_upchieve_instances.student_partner_org_id\n    AND spo.name = :spoName!\nRETURNING\n    student_partner_orgs_upchieve_instances.id AS ok"};

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
export const backfillStudentPartnerOrgStartDates = new PreparedQuery<IBackfillStudentPartnerOrgStartDatesParams,IBackfillStudentPartnerOrgStartDatesResult>(backfillStudentPartnerOrgStartDatesIR);


/** Query 'CreateStudentPartnerOrgInstance' is invalid, so its result is assigned type 'never'.
 *  */
export type ICreateStudentPartnerOrgInstanceResult = never;

/** Query 'CreateStudentPartnerOrgInstance' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ICreateStudentPartnerOrgInstanceParams = never;

const createStudentPartnerOrgInstanceIR: any = {"usedParamSet":{"spoName":true},"params":[{"name":"spoName","required":true,"transform":{"type":"scalar"},"locs":[{"a":231,"b":239}]}],"statement":"INSERT INTO student_partner_orgs_upchieve_instances (id, student_partner_org_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    spo.id,\n    spo.created_at,\n    NOW()\nFROM\n    student_partner_orgs spo\nWHERE\n    spo.name = :spoName!"};

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
export const createStudentPartnerOrgInstance = new PreparedQuery<ICreateStudentPartnerOrgInstanceParams,ICreateStudentPartnerOrgInstanceResult>(createStudentPartnerOrgInstanceIR);


/** Query 'CreateSchoolStudentPartnerOrg' is invalid, so its result is assigned type 'never'.
 *  */
export type ICreateSchoolStudentPartnerOrgResult = never;

/** Query 'CreateSchoolStudentPartnerOrg' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ICreateSchoolStudentPartnerOrgParams = never;

const createSchoolStudentPartnerOrgIR: any = {"usedParamSet":{"schoolName":true},"params":[{"name":"schoolName","required":true,"transform":{"type":"scalar"},"locs":[{"a":452,"b":463}]}],"statement":"INSERT INTO student_partner_orgs (id, KEY, name, signup_code, high_school_signup, college_signup, school_signup_required, school_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    TRANSLATE(BTRIM(LOWER(schools.name)), ' ', '-'),\n    schools.name,\n    TRANSLATE(BTRIM(UPPER(schools.name)), ' ', '-'),\n    TRUE,\n    FALSE,\n    TRUE,\n    COALESCE(schools.id, NULL),\n    NOW(),\n    NOW()\nFROM\n    schools\nWHERE\n    partner IS TRUE\n    AND name = :schoolName!\nON CONFLICT (name)\n    DO UPDATE SET\n        updated_at = NOW()"};

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
export const createSchoolStudentPartnerOrg = new PreparedQuery<ICreateSchoolStudentPartnerOrgParams,ICreateSchoolStudentPartnerOrgResult>(createSchoolStudentPartnerOrgIR);


/** Query 'DeactivateStudentPartnerOrg' is invalid, so its result is assigned type 'never'.
 *  */
export type IDeactivateStudentPartnerOrgResult = never;

/** Query 'DeactivateStudentPartnerOrg' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IDeactivateStudentPartnerOrgParams = never;

const deactivateStudentPartnerOrgIR: any = {"usedParamSet":{"spoName":true},"params":[{"name":"spoName","required":true,"transform":{"type":"scalar"},"locs":[{"a":241,"b":249}]}],"statement":"UPDATE\n    student_partner_orgs_upchieve_instances\nSET\n    deactivated_on = NOW(),\n    updated_at = NOW()\nFROM\n    student_partner_orgs spo\nWHERE\n    spo.id = student_partner_orgs_upchieve_instances.student_partner_org_id\n    AND spo.name = :spoName!\nRETURNING\n    student_partner_orgs_upchieve_instances.id AS ok"};

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
export const deactivateStudentPartnerOrg = new PreparedQuery<IDeactivateStudentPartnerOrgParams,IDeactivateStudentPartnerOrgResult>(deactivateStudentPartnerOrgIR);


/** Query 'DeactivateUserStudentPartnerOrgInstance' is invalid, so its result is assigned type 'never'.
 *  */
export type IDeactivateUserStudentPartnerOrgInstanceResult = never;

/** Query 'DeactivateUserStudentPartnerOrgInstance' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IDeactivateUserStudentPartnerOrgInstanceParams = never;

const deactivateUserStudentPartnerOrgInstanceIR: any = {"usedParamSet":{"userId":true,"spoId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":123,"b":130}]},{"name":"spoId","required":true,"transform":{"type":"scalar"},"locs":[{"a":165,"b":171}]}],"statement":"UPDATE\n    users_student_partner_orgs_instances\nSET\n    deactivated_on = NOW(),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\n    AND student_partner_org_id = :spoId!"};

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
export const deactivateUserStudentPartnerOrgInstance = new PreparedQuery<IDeactivateUserStudentPartnerOrgInstanceParams,IDeactivateUserStudentPartnerOrgInstanceResult>(deactivateUserStudentPartnerOrgInstanceIR);


/** Query 'MigratePartnerSchoolsToPartnerOrgs' is invalid, so its result is assigned type 'never'.
 *  */
export type IMigratePartnerSchoolsToPartnerOrgsResult = never;

/** Query 'MigratePartnerSchoolsToPartnerOrgs' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IMigratePartnerSchoolsToPartnerOrgsParams = never;

const migratePartnerSchoolsToPartnerOrgsIR: any = {"usedParamSet":{"createdAt":true,"schoolName":true},"params":[{"name":"createdAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":361,"b":371}]},{"name":"schoolName","required":true,"transform":{"type":"scalar"},"locs":[{"a":442,"b":453}]}],"statement":"INSERT INTO student_partner_orgs (id, KEY, name, signup_code, high_school_signup, college_signup, school_signup_required, school_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    TRANSLATE(BTRIM(LOWER(schools.name)), ' ', '-'),\n    schools.name,\n    TRANSLATE(BTRIM(UPPER(schools.name)), ' ', '-'),\n    TRUE,\n    FALSE,\n    TRUE,\n    schools.id,\n    :createdAt!,\n    NOW()\nFROM\n    schools\nWHERE\n    partner IS TRUE\n    AND name = :schoolName!"};

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
export const migratePartnerSchoolsToPartnerOrgs = new PreparedQuery<IMigratePartnerSchoolsToPartnerOrgsParams,IMigratePartnerSchoolsToPartnerOrgsResult>(migratePartnerSchoolsToPartnerOrgsIR);


/** Query 'MigrateExistingStudentPartnerOrgRelationships' is invalid, so its result is assigned type 'never'.
 *  */
export type IMigrateExistingStudentPartnerOrgRelationshipsResult = never;

/** Query 'MigrateExistingStudentPartnerOrgRelationships' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IMigrateExistingStudentPartnerOrgRelationshipsParams = never;

const migrateExistingStudentPartnerOrgRelationshipsIR: any = {"usedParamSet":{},"params":[],"statement":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, student_partner_org_user_id, created_at, updated_at)\nSELECT\n    users.id,\n    sp.student_partner_org_id,\n    sp.student_partner_org_site_id,\n    sp.student_partner_org_user_id,\n    sp.created_at,\n    NOW()\nFROM\n    users\n    JOIN student_profiles sp ON sp.user_id = users.id\nWHERE\n    sp.student_partner_org_id IS NOT NULL"};

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
export const migrateExistingStudentPartnerOrgRelationships = new PreparedQuery<IMigrateExistingStudentPartnerOrgRelationshipsParams,IMigrateExistingStudentPartnerOrgRelationshipsResult>(migrateExistingStudentPartnerOrgRelationshipsIR);


/** Query 'MigrateExistingPartnerSchoolRelationships' is invalid, so its result is assigned type 'never'.
 *  */
export type IMigrateExistingPartnerSchoolRelationshipsResult = never;

/** Query 'MigrateExistingPartnerSchoolRelationships' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IMigrateExistingPartnerSchoolRelationshipsParams = never;

const migrateExistingPartnerSchoolRelationshipsIR: any = {"usedParamSet":{},"params":[],"statement":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, student_partner_org_user_id, created_at, updated_at)\nSELECT\n    users.id,\n    spo.id,\n    NULL,\n    NULL,\n    sp.created_at,\n    NOW()\nFROM\n    users\n    JOIN student_profiles sp ON sp.user_id = users.id\n    JOIN student_partner_orgs spo ON spo.school_id = sp.school_id"};

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
export const migrateExistingPartnerSchoolRelationships = new PreparedQuery<IMigrateExistingPartnerSchoolRelationshipsParams,IMigrateExistingPartnerSchoolRelationshipsResult>(migrateExistingPartnerSchoolRelationshipsIR);


