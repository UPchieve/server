/** Types generated for queries found in "server/models/StudentPartnerOrg/student_partner_orgs.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

export type stringArray = (string)[];

/** 'GetStudentPartnerOrgForRegistrationByKey' parameters type */
export interface IGetStudentPartnerOrgForRegistrationByKeyParams {
  key: string;
}

/** 'GetStudentPartnerOrgForRegistrationByKey' return type */
export interface IGetStudentPartnerOrgForRegistrationByKeyResult {
  key: string;
  name: string;
  schoolSignupRequired: boolean;
  sites: stringArray | null;
}

/** 'GetStudentPartnerOrgForRegistrationByKey' query type */
export interface IGetStudentPartnerOrgForRegistrationByKeyQuery {
  params: IGetStudentPartnerOrgForRegistrationByKeyParams;
  result: IGetStudentPartnerOrgForRegistrationByKeyResult;
}

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


/** 'GetStudentPartnerOrgByKey' parameters type */
export interface IGetStudentPartnerOrgByKeyParams {
  partnerKey: string;
  partnerSite?: string | null | void;
}

/** 'GetStudentPartnerOrgByKey' return type */
export interface IGetStudentPartnerOrgByKeyResult {
  partnerId: string;
  partnerKey: string;
  partnerName: string;
  schoolId: string | null;
  siteId: string;
  siteName: string;
}

/** 'GetStudentPartnerOrgByKey' query type */
export interface IGetStudentPartnerOrgByKeyQuery {
  params: IGetStudentPartnerOrgByKeyParams;
  result: IGetStudentPartnerOrgByKeyResult;
}

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


/** 'GetStudentPartnerOrgBySchoolId' parameters type */
export interface IGetStudentPartnerOrgBySchoolIdParams {
  schoolId: string;
}

/** 'GetStudentPartnerOrgBySchoolId' return type */
export interface IGetStudentPartnerOrgBySchoolIdResult {
  partnerId: string;
  partnerKey: string;
  partnerName: string;
  schoolId: string | null;
  siteId: string;
  siteName: string;
}

/** 'GetStudentPartnerOrgBySchoolId' query type */
export interface IGetStudentPartnerOrgBySchoolIdQuery {
  params: IGetStudentPartnerOrgBySchoolIdParams;
  result: IGetStudentPartnerOrgBySchoolIdResult;
}

const getStudentPartnerOrgBySchoolIdIR: any = {"usedParamSet":{"schoolId":true},"params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":373,"b":382}]}],"statement":"SELECT\n    spo.id AS partner_id,\n    spo.key AS partner_key,\n    spo.name AS partner_name,\n    spos.id AS site_id,\n    spos.name AS site_name,\n    spo.school_id AS school_id\nFROM\n    student_partner_orgs spo\n    LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id\n    LEFT JOIN schools school ON spo.school_id = school.id\nWHERE\n    school.id = :schoolId!"};

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
 * ```
 */
export const getStudentPartnerOrgBySchoolId = new PreparedQuery<IGetStudentPartnerOrgBySchoolIdParams,IGetStudentPartnerOrgBySchoolIdResult>(getStudentPartnerOrgBySchoolIdIR);


/** 'GetFullStudentPartnerOrgByKey' parameters type */
export interface IGetFullStudentPartnerOrgByKeyParams {
  key: string;
}

/** 'GetFullStudentPartnerOrgByKey' return type */
export interface IGetFullStudentPartnerOrgByKeyResult {
  collegeSignup: boolean;
  deactivated: boolean | null;
  highSchoolSignup: boolean;
  isSchool: boolean | null;
  key: string;
  name: string;
  schoolSignupRequired: boolean;
  signupCode: string | null;
  sites: stringArray | null;
}

/** 'GetFullStudentPartnerOrgByKey' query type */
export interface IGetFullStudentPartnerOrgByKeyQuery {
  params: IGetFullStudentPartnerOrgByKeyParams;
  result: IGetFullStudentPartnerOrgByKeyResult;
}

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


/** 'GetStudentPartnerOrgs' parameters type */
export type IGetStudentPartnerOrgsParams = void;

/** 'GetStudentPartnerOrgs' return type */
export interface IGetStudentPartnerOrgsResult {
  collegeSignup: boolean;
  deactivated: boolean | null;
  highSchoolSignup: boolean;
  isSchool: boolean | null;
  key: string;
  name: string;
  schoolSignupRequired: boolean;
  signupCode: string | null;
  sites: stringArray | null;
}

/** 'GetStudentPartnerOrgs' query type */
export interface IGetStudentPartnerOrgsQuery {
  params: IGetStudentPartnerOrgsParams;
  result: IGetStudentPartnerOrgsResult;
}

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


/** 'GetStudentPartnerOrgKeyByCode' parameters type */
export interface IGetStudentPartnerOrgKeyByCodeParams {
  signupCode: string;
}

/** 'GetStudentPartnerOrgKeyByCode' return type */
export interface IGetStudentPartnerOrgKeyByCodeResult {
  key: string;
}

/** 'GetStudentPartnerOrgKeyByCode' query type */
export interface IGetStudentPartnerOrgKeyByCodeQuery {
  params: IGetStudentPartnerOrgKeyByCodeParams;
  result: IGetStudentPartnerOrgKeyByCodeResult;
}

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


/** 'CreateUserStudentPartnerOrgInstance' parameters type */
export interface ICreateUserStudentPartnerOrgInstanceParams {
  spoId: string;
  sposId?: string | null | void;
  userId: string;
}

/** 'CreateUserStudentPartnerOrgInstance' return type */
export type ICreateUserStudentPartnerOrgInstanceResult = void;

/** 'CreateUserStudentPartnerOrgInstance' query type */
export interface ICreateUserStudentPartnerOrgInstanceQuery {
  params: ICreateUserStudentPartnerOrgInstanceParams;
  result: ICreateUserStudentPartnerOrgInstanceResult;
}

const createUserStudentPartnerOrgInstanceIR: any = {"usedParamSet":{"userId":true,"spoId":true,"sposId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":124,"b":131}]},{"name":"spoId","required":true,"transform":{"type":"scalar"},"locs":[{"a":134,"b":140}]},{"name":"sposId","required":false,"transform":{"type":"scalar"},"locs":[{"a":143,"b":149}]}],"statement":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id)\n    VALUES (:userId!, :spoId!, :sposId)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id)
 *     VALUES (:userId!, :spoId!, :sposId)
 * ```
 */
export const createUserStudentPartnerOrgInstance = new PreparedQuery<ICreateUserStudentPartnerOrgInstanceParams,ICreateUserStudentPartnerOrgInstanceResult>(createUserStudentPartnerOrgInstanceIR);


/** 'MigrateExistingStudentPartnerOrgs' parameters type */
export type IMigrateExistingStudentPartnerOrgsParams = void;

/** 'MigrateExistingStudentPartnerOrgs' return type */
export type IMigrateExistingStudentPartnerOrgsResult = void;

/** 'MigrateExistingStudentPartnerOrgs' query type */
export interface IMigrateExistingStudentPartnerOrgsQuery {
  params: IMigrateExistingStudentPartnerOrgsParams;
  result: IMigrateExistingStudentPartnerOrgsResult;
}

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


/** 'BackfillStudentPartnerOrgStartDates' parameters type */
export interface IBackfillStudentPartnerOrgStartDatesParams {
  createdAt: DateOrString;
  endedAt?: DateOrString | null | void;
  spoName: string;
}

/** 'BackfillStudentPartnerOrgStartDates' return type */
export interface IBackfillStudentPartnerOrgStartDatesResult {
  ok: string;
}

/** 'BackfillStudentPartnerOrgStartDates' query type */
export interface IBackfillStudentPartnerOrgStartDatesQuery {
  params: IBackfillStudentPartnerOrgStartDatesParams;
  result: IBackfillStudentPartnerOrgStartDatesResult;
}

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


/** 'CreateStudentPartnerOrgInstance' parameters type */
export interface ICreateStudentPartnerOrgInstanceParams {
  schoolId: string;
}

/** 'CreateStudentPartnerOrgInstance' return type */
export type ICreateStudentPartnerOrgInstanceResult = void;

/** 'CreateStudentPartnerOrgInstance' query type */
export interface ICreateStudentPartnerOrgInstanceQuery {
  params: ICreateStudentPartnerOrgInstanceParams;
  result: ICreateStudentPartnerOrgInstanceResult;
}

const createStudentPartnerOrgInstanceIR: any = {"usedParamSet":{"schoolId":true},"params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":227,"b":236}]}],"statement":"INSERT INTO student_partner_orgs_upchieve_instances (id, student_partner_org_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    spo.id,\n    NOW(),\n    NOW()\nFROM\n    student_partner_orgs spo\nWHERE\n    spo.school_id = :schoolId!"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs_upchieve_instances (id, student_partner_org_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     spo.id,
 *     NOW(),
 *     NOW()
 * FROM
 *     student_partner_orgs spo
 * WHERE
 *     spo.school_id = :schoolId!
 * ```
 */
export const createStudentPartnerOrgInstance = new PreparedQuery<ICreateStudentPartnerOrgInstanceParams,ICreateStudentPartnerOrgInstanceResult>(createStudentPartnerOrgInstanceIR);


/** 'CreateSchoolStudentPartnerOrg' parameters type */
export interface ICreateSchoolStudentPartnerOrgParams {
  schoolId: string;
}

/** 'CreateSchoolStudentPartnerOrg' return type */
export type ICreateSchoolStudentPartnerOrgResult = void;

/** 'CreateSchoolStudentPartnerOrg' query type */
export interface ICreateSchoolStudentPartnerOrgQuery {
  params: ICreateSchoolStudentPartnerOrgParams;
  result: ICreateSchoolStudentPartnerOrgResult;
}

const createSchoolStudentPartnerOrgIR: any = {"usedParamSet":{"schoolId":true},"params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":450,"b":459}]}],"statement":"INSERT INTO student_partner_orgs (id, KEY, name, signup_code, high_school_signup, college_signup, school_signup_required, school_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    TRANSLATE(BTRIM(LOWER(schools.name)), ' ', '-'),\n    schools.name,\n    TRANSLATE(BTRIM(UPPER(schools.name)), ' ', '-'),\n    TRUE,\n    FALSE,\n    TRUE,\n    COALESCE(schools.id, NULL),\n    NOW(),\n    NOW()\nFROM\n    schools\nWHERE\n    partner IS TRUE\n    AND id = :schoolId!\nON CONFLICT (KEY)\n    DO UPDATE SET\n        school_id = EXCLUDED.school_id,\n        updated_at = NOW()\n    WHERE\n        student_partner_orgs.school_id IS NULL"};

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
 *     AND id = :schoolId!
 * ON CONFLICT (KEY)
 *     DO UPDATE SET
 *         school_id = EXCLUDED.school_id,
 *         updated_at = NOW()
 *     WHERE
 *         student_partner_orgs.school_id IS NULL
 * ```
 */
export const createSchoolStudentPartnerOrg = new PreparedQuery<ICreateSchoolStudentPartnerOrgParams,ICreateSchoolStudentPartnerOrgResult>(createSchoolStudentPartnerOrgIR);


/** 'DeactivateStudentPartnerOrg' parameters type */
export interface IDeactivateStudentPartnerOrgParams {
  schoolId: string;
}

/** 'DeactivateStudentPartnerOrg' return type */
export interface IDeactivateStudentPartnerOrgResult {
  ok: string;
}

/** 'DeactivateStudentPartnerOrg' query type */
export interface IDeactivateStudentPartnerOrgQuery {
  params: IDeactivateStudentPartnerOrgParams;
  result: IDeactivateStudentPartnerOrgResult;
}

const deactivateStudentPartnerOrgIR: any = {"usedParamSet":{"schoolId":true},"params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":128,"b":137}]}],"statement":"WITH school_student_partner_orgs AS (\n    SELECT\n        id\n    FROM\n        student_partner_orgs\n    WHERE\n        school_id = :schoolId!)\nUPDATE\n    student_partner_orgs_upchieve_instances\nSET\n    deactivated_on = NOW(),\n    updated_at = NOW()\nFROM\n    student_partner_orgs spo\nWHERE\n    spo.id IN (\n        SELECT\n            id\n        FROM\n            school_student_partner_orgs)\n    AND spo.id = student_partner_orgs_upchieve_instances.student_partner_org_id\nRETURNING\n    student_partner_orgs_upchieve_instances.id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * WITH school_student_partner_orgs AS (
 *     SELECT
 *         id
 *     FROM
 *         student_partner_orgs
 *     WHERE
 *         school_id = :schoolId!)
 * UPDATE
 *     student_partner_orgs_upchieve_instances
 * SET
 *     deactivated_on = NOW(),
 *     updated_at = NOW()
 * FROM
 *     student_partner_orgs spo
 * WHERE
 *     spo.id IN (
 *         SELECT
 *             id
 *         FROM
 *             school_student_partner_orgs)
 *     AND spo.id = student_partner_orgs_upchieve_instances.student_partner_org_id
 * RETURNING
 *     student_partner_orgs_upchieve_instances.id AS ok
 * ```
 */
export const deactivateStudentPartnerOrg = new PreparedQuery<IDeactivateStudentPartnerOrgParams,IDeactivateStudentPartnerOrgResult>(deactivateStudentPartnerOrgIR);


/** 'DeactivateUserStudentPartnerOrgInstance' parameters type */
export interface IDeactivateUserStudentPartnerOrgInstanceParams {
  spoId: string;
  userId: string;
}

/** 'DeactivateUserStudentPartnerOrgInstance' return type */
export type IDeactivateUserStudentPartnerOrgInstanceResult = void;

/** 'DeactivateUserStudentPartnerOrgInstance' query type */
export interface IDeactivateUserStudentPartnerOrgInstanceQuery {
  params: IDeactivateUserStudentPartnerOrgInstanceParams;
  result: IDeactivateUserStudentPartnerOrgInstanceResult;
}

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


/** 'MigratePartnerSchoolsToPartnerOrgs' parameters type */
export interface IMigratePartnerSchoolsToPartnerOrgsParams {
  createdAt: DateOrString;
  schoolName: string;
}

/** 'MigratePartnerSchoolsToPartnerOrgs' return type */
export type IMigratePartnerSchoolsToPartnerOrgsResult = void;

/** 'MigratePartnerSchoolsToPartnerOrgs' query type */
export interface IMigratePartnerSchoolsToPartnerOrgsQuery {
  params: IMigratePartnerSchoolsToPartnerOrgsParams;
  result: IMigratePartnerSchoolsToPartnerOrgsResult;
}

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


/** 'MigrateExistingStudentPartnerOrgRelationships' parameters type */
export type IMigrateExistingStudentPartnerOrgRelationshipsParams = void;

/** 'MigrateExistingStudentPartnerOrgRelationships' return type */
export type IMigrateExistingStudentPartnerOrgRelationshipsResult = void;

/** 'MigrateExistingStudentPartnerOrgRelationships' query type */
export interface IMigrateExistingStudentPartnerOrgRelationshipsQuery {
  params: IMigrateExistingStudentPartnerOrgRelationshipsParams;
  result: IMigrateExistingStudentPartnerOrgRelationshipsResult;
}

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


/** 'MigrateExistingPartnerSchoolRelationships' parameters type */
export type IMigrateExistingPartnerSchoolRelationshipsParams = void;

/** 'MigrateExistingPartnerSchoolRelationships' return type */
export type IMigrateExistingPartnerSchoolRelationshipsResult = void;

/** 'MigrateExistingPartnerSchoolRelationships' query type */
export interface IMigrateExistingPartnerSchoolRelationshipsQuery {
  params: IMigrateExistingPartnerSchoolRelationshipsParams;
  result: IMigrateExistingPartnerSchoolRelationshipsResult;
}

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


