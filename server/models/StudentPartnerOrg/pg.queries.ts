/** Types generated for queries found in "server/models/StudentPartnerOrg/student_partner_orgs.sql" */
import { PreparedQuery } from '@pgtyped/query';

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

const getStudentPartnerOrgForRegistrationByKeyIR: any = {"name":"getStudentPartnerOrgForRegistrationByKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":399,"b":402,"line":17,"col":15}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n    KEY,\n    spo.name,\n    spo.school_signup_required,\n    sites.sites\nFROM\n    student_partner_orgs spo\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(name) AS sites\n        FROM\n            student_partner_org_sites spos\n        WHERE\n            spo.id = spos.student_partner_org_id) AS sites ON TRUE\nWHERE\n    spo.key = :key!","loc":{"a":53,"b":402,"line":2,"col":0}}};

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


/** 'GetFullStudentPartnerOrgByKey' parameters type */
export interface IGetFullStudentPartnerOrgByKeyParams {
  key: string;
}

/** 'GetFullStudentPartnerOrgByKey' return type */
export interface IGetFullStudentPartnerOrgByKeyResult {
  collegeSignup: boolean;
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

const getFullStudentPartnerOrgByKeyIR: any = {"name":"getFullStudentPartnerOrgByKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":974,"b":977,"line":45,"col":11}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n    KEY,\n    spo.name,\n    signup_code,\n    high_school_signup,\n    college_signup,\n    school_signup_required,\n    sites.sites,\n    (\n        CASE WHEN school_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_school\nFROM\n    student_partner_orgs spo\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(name) AS sites\n        FROM\n            student_partner_org_sites spos\n        WHERE\n            spo.id = spos.student_partner_org_id) AS sites ON TRUE\nWHERE\n    KEY = :key!","loc":{"a":449,"b":977,"line":21,"col":0}}};

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
 *         END) AS is_school
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
 *     KEY = :key!
 * ```
 */
export const getFullStudentPartnerOrgByKey = new PreparedQuery<IGetFullStudentPartnerOrgByKeyParams,IGetFullStudentPartnerOrgByKeyResult>(getFullStudentPartnerOrgByKeyIR);


/** 'GetStudentPartnerOrgs' parameters type */
export type IGetStudentPartnerOrgsParams = void;

/** 'GetStudentPartnerOrgs' return type */
export interface IGetStudentPartnerOrgsResult {
  collegeSignup: boolean;
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

const getStudentPartnerOrgsIR: any = {"name":"getStudentPartnerOrgs","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    KEY,\n    spo.name AS name,\n    signup_code,\n    high_school_signup,\n    college_signup,\n    school_signup_required,\n    sites.sites,\n    (\n        CASE WHEN school_id IS NOT NULL THEN\n            TRUE\n        ELSE\n            FALSE\n        END) AS is_school\nFROM\n    student_partner_orgs spo\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(name) AS sites\n        FROM\n            student_partner_org_sites spos\n        WHERE\n            spo.id = spos.student_partner_org_id) AS sites ON TRUE","loc":{"a":1016,"b":1530,"line":49,"col":0}}};

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
 *         END) AS is_school
 * FROM
 *     student_partner_orgs spo
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(name) AS sites
 *         FROM
 *             student_partner_org_sites spos
 *         WHERE
 *             spo.id = spos.student_partner_org_id) AS sites ON TRUE
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

const getStudentPartnerOrgKeyByCodeIR: any = {"name":"getStudentPartnerOrgKeyByCode","params":[{"name":"signupCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1647,"b":1657,"line":80,"col":19}]}}],"usedParamSet":{"signupCode":true},"statement":{"body":"SELECT\n    KEY\nFROM\n    student_partner_orgs\nWHERE\n    signup_code = :signupCode!","loc":{"a":1577,"b":1657,"line":75,"col":0}}};

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


/** 'MigrateExistingStudentPartnerOrgs' parameters type */
export type IMigrateExistingStudentPartnerOrgsParams = void;

/** 'MigrateExistingStudentPartnerOrgs' return type */
export type IMigrateExistingStudentPartnerOrgsResult = void;

/** 'MigrateExistingStudentPartnerOrgs' query type */
export interface IMigrateExistingStudentPartnerOrgsQuery {
  params: IMigrateExistingStudentPartnerOrgsParams;
  result: IMigrateExistingStudentPartnerOrgsResult;
}

const migrateExistingStudentPartnerOrgsIR: any = {"name":"migrateExistingStudentPartnerOrgs","params":[],"usedParamSet":{},"statement":{"body":"INSERT INTO student_partner_orgs_upchieve_instances (id, student_partner_org_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    spo.id,\n    spo.created_at,\n    NOW()\nFROM\n    student_partner_orgs spo","loc":{"a":1708,"b":1916,"line":84,"col":0}}};

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
  createdAt: Date;
  endedAt: Date | null | void;
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

const backfillStudentPartnerOrgStartDatesIR: any = {"name":"backfillStudentPartnerOrgStartDates","params":[{"name":"createdAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2042,"b":2051,"line":98,"col":18}]}},{"name":"endedAt","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2076,"b":2082,"line":99,"col":22}]}},{"name":"spoName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2244,"b":2251,"line":105,"col":20}]}}],"usedParamSet":{"createdAt":true,"endedAt":true,"spoName":true},"statement":{"body":"UPDATE\n    student_partner_orgs_upchieve_instances\nSET\n    created_at = :createdAt!,\n    deactivated_on = :endedAt,\n    updated_at = NOW()\nFROM\n    student_partner_orgs spo\nWHERE\n    spo.id = student_partner_orgs_upchieve_instances.student_partner_org_id\n    AND spo.name = :spoName!\nRETURNING\n    student_partner_orgs_upchieve_instances.id AS ok","loc":{"a":1969,"b":2314,"line":95,"col":0}}};

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


/** 'MigratePartnerSchoolsToPartnerOrgs' parameters type */
export interface IMigratePartnerSchoolsToPartnerOrgsParams {
  createdAt: Date;
  schoolName: string;
}

/** 'MigratePartnerSchoolsToPartnerOrgs' return type */
export type IMigratePartnerSchoolsToPartnerOrgsResult = void;

/** 'MigratePartnerSchoolsToPartnerOrgs' query type */
export interface IMigratePartnerSchoolsToPartnerOrgsQuery {
  params: IMigratePartnerSchoolsToPartnerOrgsParams;
  result: IMigratePartnerSchoolsToPartnerOrgsResult;
}

const migratePartnerSchoolsToPartnerOrgsIR: any = {"name":"migratePartnerSchoolsToPartnerOrgs","params":[{"name":"createdAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2728,"b":2737,"line":121,"col":5}]}},{"name":"schoolName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2809,"b":2819,"line":127,"col":16}]}}],"usedParamSet":{"createdAt":true,"schoolName":true},"statement":{"body":"INSERT INTO student_partner_orgs (id, KEY, name, signup_code, high_school_signup, college_signup, school_signup_required, school_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    TRANSLATE(BTRIM(LOWER(schools.name)), ' ', '-'),\n    schools.name,\n    TRANSLATE(BTRIM(UPPER(schools.name)), ' ', '-'),\n    TRUE,\n    FALSE,\n    TRUE,\n    schools.id,\n    :createdAt!,\n    NOW()\nFROM\n    schools\nWHERE\n    partner IS TRUE\n    AND name = :schoolName!","loc":{"a":2366,"b":2819,"line":111,"col":0}}};

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

const migrateExistingStudentPartnerOrgRelationshipsIR: any = {"name":"migrateExistingStudentPartnerOrgRelationships","params":[],"usedParamSet":{},"statement":{"body":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, student_partner_org_user_id, created_at, updated_at)\nSELECT\n    users.id,\n    sp.student_partner_org_id,\n    sp.student_partner_org_site_id,\n    sp.student_partner_org_user_id,\n    sp.created_at,\n    NOW()\nFROM\n    users\n    JOIN student_profiles sp ON sp.user_id = users.id\nWHERE\n    sp.student_partner_org_id IS NOT NULL","loc":{"a":2882,"b":3315,"line":131,"col":0}}};

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

const migrateExistingPartnerSchoolRelationshipsIR: any = {"name":"migrateExistingPartnerSchoolRelationships","params":[],"usedParamSet":{},"statement":{"body":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, student_partner_org_user_id, created_at, updated_at)\nSELECT\n    users.id,\n    sp.student_partner_org_id,\n    NULL,\n    NULL,\n    sp.created_at,\n    NOW()\nFROM\n    users\n    JOIN student_profiles sp ON sp.user_id = users.id\n    JOIN student_partner_orgs spo ON spo.school_id = sp.school_id","loc":{"a":3374,"b":3773,"line":147,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, student_partner_org_user_id, created_at, updated_at)
 * SELECT
 *     users.id,
 *     sp.student_partner_org_id,
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


