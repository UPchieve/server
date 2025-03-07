/** Types generated for queries found in "database/seeds/testData/partners/partners.sql" */
import { PreparedQuery } from '@pgtyped/query'

/** 'InsertVolunteerPartnerOrg' parameters type */
export interface IInsertVolunteerPartnerOrgParams {
  id: string
  key: string
  name: string
  receiveWeeklyHourSummaryEmail: boolean
}

/** 'InsertVolunteerPartnerOrg' return type */
export interface IInsertVolunteerPartnerOrgResult {
  ok: string
}

/** 'InsertVolunteerPartnerOrg' query type */
export interface IInsertVolunteerPartnerOrgQuery {
  params: IInsertVolunteerPartnerOrgParams
  result: IInsertVolunteerPartnerOrgResult
}

const insertVolunteerPartnerOrgIR: any = {
  name: 'insertVolunteerPartnerOrg',
  params: [
    {
      name: 'id',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 161, b: 163, line: 3, col: 13 }] },
    },
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 167, b: 171, line: 3, col: 19 }] },
    },
    {
      name: 'key',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 175, b: 178, line: 3, col: 27 }] },
    },
    {
      name: 'receiveWeeklyHourSummaryEmail',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 182, b: 211, line: 3, col: 34 }] },
    },
  ],
  usedParamSet: {
    id: true,
    name: true,
    key: true,
    receiveWeeklyHourSummaryEmail: true,
  },
  statement: {
    body: 'INSERT INTO volunteer_partner_orgs (id, name, KEY, receive_weekly_hour_summary_email, created_at, updated_at)\n    VALUES (:id!, :name!, :key!, :receiveWeeklyHourSummaryEmail!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 38, b: 276, line: 2, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO volunteer_partner_orgs (id, name, KEY, receive_weekly_hour_summary_email, created_at, updated_at)
 *     VALUES (:id!, :name!, :key!, :receiveWeeklyHourSummaryEmail!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertVolunteerPartnerOrg = new PreparedQuery<
  IInsertVolunteerPartnerOrgParams,
  IInsertVolunteerPartnerOrgResult
>(insertVolunteerPartnerOrgIR)

/** 'InsertStudentPartnerOrg' parameters type */
export interface IInsertStudentPartnerOrgParams {
  collegeSignup: boolean
  highSchoolSignup: boolean
  id: string
  key: string
  name: string
  schoolSignupRequired: boolean
  signupCode: string
}

/** 'InsertStudentPartnerOrg' return type */
export interface IInsertStudentPartnerOrgResult {
  ok: string
}

/** 'InsertStudentPartnerOrg' query type */
export interface IInsertStudentPartnerOrgQuery {
  params: IInsertStudentPartnerOrgParams
  result: IInsertStudentPartnerOrgResult
}

const insertStudentPartnerOrgIR: any = {
  name: 'insertStudentPartnerOrg',
  params: [
    {
      name: 'id',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 476, b: 478, line: 12, col: 13 }] },
    },
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 482, b: 486, line: 12, col: 19 }] },
    },
    {
      name: 'key',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 490, b: 493, line: 12, col: 27 }] },
    },
    {
      name: 'highSchoolSignup',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 497, b: 513, line: 12, col: 34 }] },
    },
    {
      name: 'collegeSignup',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 517, b: 530, line: 12, col: 54 }] },
    },
    {
      name: 'schoolSignupRequired',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 534, b: 554, line: 12, col: 71 }] },
    },
    {
      name: 'signupCode',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 558, b: 568, line: 12, col: 95 }] },
    },
  ],
  usedParamSet: {
    id: true,
    name: true,
    key: true,
    highSchoolSignup: true,
    collegeSignup: true,
    schoolSignupRequired: true,
    signupCode: true,
  },
  statement: {
    body: 'INSERT INTO student_partner_orgs (id, name, KEY, high_school_signup, college_signup, school_signup_required, signup_code, created_at, updated_at)\n    VALUES (:id!, :name!, :key!, :highSchoolSignup!, :collegeSignup!, :schoolSignupRequired!, :signupCode!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 317, b: 633, line: 11, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs (id, name, KEY, high_school_signup, college_signup, school_signup_required, signup_code, created_at, updated_at)
 *     VALUES (:id!, :name!, :key!, :highSchoolSignup!, :collegeSignup!, :schoolSignupRequired!, :signupCode!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertStudentPartnerOrg = new PreparedQuery<
  IInsertStudentPartnerOrgParams,
  IInsertStudentPartnerOrgResult
>(insertStudentPartnerOrgIR)

/** 'InsertStudentPartnerOrgSite' parameters type */
export interface IInsertStudentPartnerOrgSiteParams {
  id: string
  name: string
  studentPartnerOrgId: string
}

/** 'InsertStudentPartnerOrgSite' return type */
export interface IInsertStudentPartnerOrgSiteResult {
  ok: string
}

/** 'InsertStudentPartnerOrgSite' query type */
export interface IInsertStudentPartnerOrgSiteQuery {
  params: IInsertStudentPartnerOrgSiteParams
  result: IInsertStudentPartnerOrgSiteResult
}

const insertStudentPartnerOrgSiteIR: any = {
  name: 'insertStudentPartnerOrgSite',
  params: [
    {
      name: 'id',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 788, b: 790, line: 21, col: 13 }] },
    },
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 794, b: 798, line: 21, col: 19 }] },
    },
    {
      name: 'studentPartnerOrgId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 802, b: 821, line: 21, col: 27 }] },
    },
  ],
  usedParamSet: { id: true, name: true, studentPartnerOrgId: true },
  statement: {
    body: 'INSERT INTO student_partner_org_sites (id, name, student_partner_org_id, created_at, updated_at)\n    VALUES (:id!, :name!, :studentPartnerOrgId!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 678, b: 886, line: 20, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_org_sites (id, name, student_partner_org_id, created_at, updated_at)
 *     VALUES (:id!, :name!, :studentPartnerOrgId!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertStudentPartnerOrgSite = new PreparedQuery<
  IInsertStudentPartnerOrgSiteParams,
  IInsertStudentPartnerOrgSiteResult
>(insertStudentPartnerOrgSiteIR)

/** 'InsertRequiredEmailDomain' parameters type */
export interface IInsertRequiredEmailDomainParams {
  domain: string
  id: string
  volunteerPartnerOrgId: string
}

/** 'InsertRequiredEmailDomain' return type */
export interface IInsertRequiredEmailDomainResult {
  ok: string
}

/** 'InsertRequiredEmailDomain' query type */
export interface IInsertRequiredEmailDomainQuery {
  params: IInsertRequiredEmailDomainParams
  result: IInsertRequiredEmailDomainResult
}

const insertRequiredEmailDomainIR: any = {
  name: 'insertRequiredEmailDomain',
  params: [
    {
      name: 'id',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1040, b: 1042, line: 30, col: 13 }] },
    },
    {
      name: 'domain',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1046, b: 1052, line: 30, col: 19 }] },
    },
    {
      name: 'volunteerPartnerOrgId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1056, b: 1077, line: 30, col: 29 }] },
    },
  ],
  usedParamSet: { id: true, domain: true, volunteerPartnerOrgId: true },
  statement: {
    body: 'INSERT INTO required_email_domains (id, DOMAIN, volunteer_partner_org_id, created_at, updated_at)\n    VALUES (:id!, :domain!, :volunteerPartnerOrgId!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 929, b: 1142, line: 29, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO required_email_domains (id, DOMAIN, volunteer_partner_org_id, created_at, updated_at)
 *     VALUES (:id!, :domain!, :volunteerPartnerOrgId!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertRequiredEmailDomain = new PreparedQuery<
  IInsertRequiredEmailDomainParams,
  IInsertRequiredEmailDomainResult
>(insertRequiredEmailDomainIR)

/** 'InsertAssociatedPartner' parameters type */
export interface IInsertAssociatedPartnerParams {
  id: string
  key: string
  soId: string | null | void
  spoId: string | null | void
  vpoId: string
}

/** 'InsertAssociatedPartner' return type */
export interface IInsertAssociatedPartnerResult {
  ok: string
}

/** 'InsertAssociatedPartner' query type */
export interface IInsertAssociatedPartnerQuery {
  params: IInsertAssociatedPartnerParams
  result: IInsertAssociatedPartnerResult
}

const insertAssociatedPartnerIR: any = {
  name: 'insertAssociatedPartner',
  params: [
    {
      name: 'id',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1336, b: 1338, line: 39, col: 13 }] },
    },
    {
      name: 'key',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1342, b: 1345, line: 39, col: 19 }] },
    },
    {
      name: 'vpoId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1349, b: 1354, line: 39, col: 26 }] },
    },
    {
      name: 'spoId',
      required: false,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1358, b: 1362, line: 39, col: 35 }] },
    },
    {
      name: 'soId',
      required: false,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1366, b: 1369, line: 39, col: 43 }] },
    },
  ],
  usedParamSet: { id: true, key: true, vpoId: true, spoId: true, soId: true },
  statement: {
    body: 'INSERT INTO associated_partners (id, KEY, volunteer_partner_org_id, student_partner_org_id, student_sponsor_org_id, created_at, updated_at)\n    VALUES (:id!, :key!, :vpoId!, :spoId, :soId, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 1183, b: 1434, line: 38, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO associated_partners (id, KEY, volunteer_partner_org_id, student_partner_org_id, student_sponsor_org_id, created_at, updated_at)
 *     VALUES (:id!, :key!, :vpoId!, :spoId, :soId, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertAssociatedPartner = new PreparedQuery<
  IInsertAssociatedPartnerParams,
  IInsertAssociatedPartnerResult
>(insertAssociatedPartnerIR)

/** 'InsertSponsorOrg' parameters type */
export interface IInsertSponsorOrgParams {
  id: string
  key: string
  name: string
}

/** 'InsertSponsorOrg' return type */
export interface IInsertSponsorOrgResult {
  ok: string
}

/** 'InsertSponsorOrg' query type */
export interface IInsertSponsorOrgQuery {
  params: IInsertSponsorOrgParams
  result: IInsertSponsorOrgResult
}

const insertSponsorOrgIR: any = {
  name: 'insertSponsorOrg',
  params: [
    {
      name: 'id',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1546, b: 1548, line: 48, col: 13 }] },
    },
    {
      name: 'key',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1552, b: 1555, line: 48, col: 19 }] },
    },
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1559, b: 1563, line: 48, col: 26 }] },
    },
  ],
  usedParamSet: { id: true, key: true, name: true },
  statement: {
    body: 'INSERT INTO sponsor_orgs (id, KEY, name, created_at, updated_at)\n    VALUES (:id!, :key!, :name!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 1468, b: 1628, line: 47, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sponsor_orgs (id, KEY, name, created_at, updated_at)
 *     VALUES (:id!, :key!, :name!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertSponsorOrg = new PreparedQuery<
  IInsertSponsorOrgParams,
  IInsertSponsorOrgResult
>(insertSponsorOrgIR)

/** 'InsertSchoolsSponsorOrg' parameters type */
export interface IInsertSchoolsSponsorOrgParams {
  schoolId: string
  sponsorOrgId: string
}

/** 'InsertSchoolsSponsorOrg' return type */
export interface IInsertSchoolsSponsorOrgResult {
  ok: string
}

/** 'InsertSchoolsSponsorOrg' query type */
export interface IInsertSchoolsSponsorOrgQuery {
  params: IInsertSchoolsSponsorOrgParams
  result: IInsertSchoolsSponsorOrgResult
}

const insertSchoolsSponsorOrgIR: any = {
  name: 'insertSchoolsSponsorOrg',
  params: [
    {
      name: 'schoolId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1767, b: 1775, line: 57, col: 13 }] },
    },
    {
      name: 'sponsorOrgId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1779, b: 1791, line: 57, col: 25 }] },
    },
  ],
  usedParamSet: { schoolId: true, sponsorOrgId: true },
  statement: {
    body: 'INSERT INTO schools_sponsor_orgs (school_id, sponsor_org_id, created_at, updated_at)\n    VALUES (:schoolId!, :sponsorOrgId!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    school_id AS ok',
    loc: { a: 1669, b: 1863, line: 56, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO schools_sponsor_orgs (school_id, sponsor_org_id, created_at, updated_at)
 *     VALUES (:schoolId!, :sponsorOrgId!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     school_id AS ok
 * ```
 */
export const insertSchoolsSponsorOrg = new PreparedQuery<
  IInsertSchoolsSponsorOrgParams,
  IInsertSchoolsSponsorOrgResult
>(insertSchoolsSponsorOrgIR)

/** 'InsertStudentPartnerSponsorOrg' parameters type */
export interface IInsertStudentPartnerSponsorOrgParams {
  spoId: string
  sponsorOrgId: string
}

/** 'InsertStudentPartnerSponsorOrg' return type */
export interface IInsertStudentPartnerSponsorOrgResult {
  ok: string
}

/** 'InsertStudentPartnerSponsorOrg' query type */
export interface IInsertStudentPartnerSponsorOrgQuery {
  params: IInsertStudentPartnerSponsorOrgParams
  result: IInsertStudentPartnerSponsorOrgResult
}

const insertStudentPartnerSponsorOrgIR: any = {
  name: 'insertStudentPartnerSponsorOrg',
  params: [
    {
      name: 'spoId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2035, b: 2040, line: 66, col: 13 }] },
    },
    {
      name: 'sponsorOrgId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2044, b: 2056, line: 66, col: 22 }] },
    },
  ],
  usedParamSet: { spoId: true, sponsorOrgId: true },
  statement: {
    body: 'INSERT INTO student_partner_orgs_sponsor_orgs (student_partner_org_id, sponsor_org_id, created_at, updated_at)\n    VALUES (:spoId!, :sponsorOrgId!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    student_partner_org_id AS ok',
    loc: { a: 1911, b: 2141, line: 65, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs_sponsor_orgs (student_partner_org_id, sponsor_org_id, created_at, updated_at)
 *     VALUES (:spoId!, :sponsorOrgId!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     student_partner_org_id AS ok
 * ```
 */
export const insertStudentPartnerSponsorOrg = new PreparedQuery<
  IInsertStudentPartnerSponsorOrgParams,
  IInsertStudentPartnerSponsorOrgResult
>(insertStudentPartnerSponsorOrgIR)

/** 'InsertStudentPartnerOrgInstances' parameters type */
export type IInsertStudentPartnerOrgInstancesParams = void

/** 'InsertStudentPartnerOrgInstances' return type */
export type IInsertStudentPartnerOrgInstancesResult = void

/** 'InsertStudentPartnerOrgInstances' query type */
export interface IInsertStudentPartnerOrgInstancesQuery {
  params: IInsertStudentPartnerOrgInstancesParams
  result: IInsertStudentPartnerOrgInstancesResult
}

const insertStudentPartnerOrgInstancesIR: any = {
  name: 'insertStudentPartnerOrgInstances',
  params: [],
  usedParamSet: {},
  statement: {
    body: 'INSERT INTO student_partner_orgs_upchieve_instances (id, student_partner_org_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    spo.id,\n    spo.created_at,\n    NOW()\nFROM\n    student_partner_orgs spo',
    loc: { a: 2191, b: 2399, line: 74, col: 0 },
  },
}

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
export const insertStudentPartnerOrgInstances = new PreparedQuery<
  IInsertStudentPartnerOrgInstancesParams,
  IInsertStudentPartnerOrgInstancesResult
>(insertStudentPartnerOrgInstancesIR)

/** 'InsertExistingStudentPartnerOrgRelationships' parameters type */
export type IInsertExistingStudentPartnerOrgRelationshipsParams = void

/** 'InsertExistingStudentPartnerOrgRelationships' return type */
export type IInsertExistingStudentPartnerOrgRelationshipsResult = void

/** 'InsertExistingStudentPartnerOrgRelationships' query type */
export interface IInsertExistingStudentPartnerOrgRelationshipsQuery {
  params: IInsertExistingStudentPartnerOrgRelationshipsParams
  result: IInsertExistingStudentPartnerOrgRelationshipsResult
}

const insertExistingStudentPartnerOrgRelationshipsIR: any = {
  name: 'insertExistingStudentPartnerOrgRelationships',
  params: [],
  usedParamSet: {},
  statement: {
    body: 'INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, student_partner_org_user_id, created_at, updated_at)\nSELECT\n    users.id,\n    sp.student_partner_org_id,\n    sp.student_partner_org_site_id,\n    sp.student_partner_org_user_id,\n    sp.created_at,\n    NOW()\nFROM\n    users\n    JOIN student_profiles sp ON sp.user_id = users.id\nWHERE\n    sp.student_partner_org_id IS NOT NULL',
    loc: { a: 2461, b: 2894, line: 85, col: 0 },
  },
}

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
export const insertExistingStudentPartnerOrgRelationships = new PreparedQuery<
  IInsertExistingStudentPartnerOrgRelationshipsParams,
  IInsertExistingStudentPartnerOrgRelationshipsResult
>(insertExistingStudentPartnerOrgRelationshipsIR)

/** 'InsertExistingPartnerSchoolRelationships' parameters type */
export type IInsertExistingPartnerSchoolRelationshipsParams = void

/** 'InsertExistingPartnerSchoolRelationships' return type */
export type IInsertExistingPartnerSchoolRelationshipsResult = void

/** 'InsertExistingPartnerSchoolRelationships' query type */
export interface IInsertExistingPartnerSchoolRelationshipsQuery {
  params: IInsertExistingPartnerSchoolRelationshipsParams
  result: IInsertExistingPartnerSchoolRelationshipsResult
}

const insertExistingPartnerSchoolRelationshipsIR: any = {
  name: 'insertExistingPartnerSchoolRelationships',
  params: [],
  usedParamSet: {},
  statement: {
    body: 'INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, student_partner_org_user_id, created_at, updated_at)\nSELECT\n    users.id,\n    spo.id,\n    NULL,\n    NULL,\n    sp.created_at,\n    NOW()\nFROM\n    users\n    JOIN student_profiles sp ON sp.user_id = users.id\n    JOIN student_partner_orgs spo ON spo.school_id = sp.school_id',
    loc: { a: 2952, b: 3332, line: 101, col: 0 },
  },
}

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
export const insertExistingPartnerSchoolRelationships = new PreparedQuery<
  IInsertExistingPartnerSchoolRelationshipsParams,
  IInsertExistingPartnerSchoolRelationshipsResult
>(insertExistingPartnerSchoolRelationshipsIR)

/** 'InsertExistingVolunteerPartnerOrgs' parameters type */
export type IInsertExistingVolunteerPartnerOrgsParams = void

/** 'InsertExistingVolunteerPartnerOrgs' return type */
export type IInsertExistingVolunteerPartnerOrgsResult = void

/** 'InsertExistingVolunteerPartnerOrgs' query type */
export interface IInsertExistingVolunteerPartnerOrgsQuery {
  params: IInsertExistingVolunteerPartnerOrgsParams
  result: IInsertExistingVolunteerPartnerOrgsResult
}

const insertExistingVolunteerPartnerOrgsIR: any = {
  name: 'insertExistingVolunteerPartnerOrgs',
  params: [],
  usedParamSet: {},
  statement: {
    body: 'INSERT INTO volunteer_partner_orgs_upchieve_instances (id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    vpo.id,\n    vpo.created_at,\n    NOW()\nFROM\n    volunteer_partner_orgs vpo',
    loc: { a: 3384, b: 3598, line: 116, col: 0 },
  },
}

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
export const insertExistingVolunteerPartnerOrgs = new PreparedQuery<
  IInsertExistingVolunteerPartnerOrgsParams,
  IInsertExistingVolunteerPartnerOrgsResult
>(insertExistingVolunteerPartnerOrgsIR)

/** 'InsertExistingVolunteerPartnerOrgRelationships' parameters type */
export type IInsertExistingVolunteerPartnerOrgRelationshipsParams = void

/** 'InsertExistingVolunteerPartnerOrgRelationships' return type */
export type IInsertExistingVolunteerPartnerOrgRelationshipsResult = void

/** 'InsertExistingVolunteerPartnerOrgRelationships' query type */
export interface IInsertExistingVolunteerPartnerOrgRelationshipsQuery {
  params: IInsertExistingVolunteerPartnerOrgRelationshipsParams
  result: IInsertExistingVolunteerPartnerOrgRelationshipsResult
}

const insertExistingVolunteerPartnerOrgRelationshipsIR: any = {
  name: 'insertExistingVolunteerPartnerOrgRelationships',
  params: [],
  usedParamSet: {},
  statement: {
    body: 'INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    users.id,\n    vp.volunteer_partner_org_id,\n    vp.created_at,\n    NOW()\nFROM\n    users\n    JOIN volunteer_profiles vp ON vp.user_id = users.id\nWHERE\n    vp.volunteer_partner_org_id IS NOT NULL',
    loc: { a: 3662, b: 3975, line: 127, col: 0 },
  },
}

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
export const insertExistingVolunteerPartnerOrgRelationships = new PreparedQuery<
  IInsertExistingVolunteerPartnerOrgRelationshipsParams,
  IInsertExistingVolunteerPartnerOrgRelationshipsResult
>(insertExistingVolunteerPartnerOrgRelationshipsIR)

/** 'InsertExistingSponsorOrgs' parameters type */
export type IInsertExistingSponsorOrgsParams = void

/** 'InsertExistingSponsorOrgs' return type */
export type IInsertExistingSponsorOrgsResult = void

/** 'InsertExistingSponsorOrgs' query type */
export interface IInsertExistingSponsorOrgsQuery {
  params: IInsertExistingSponsorOrgsParams
  result: IInsertExistingSponsorOrgsResult
}

const insertExistingSponsorOrgsIR: any = {
  name: 'insertExistingSponsorOrgs',
  params: [],
  usedParamSet: {},
  statement: {
    body: 'INSERT INTO sponsor_orgs_upchieve_instances (id, sponsor_org_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    so.id,\n    so.created_at,\n    NOW()\nFROM\n    sponsor_orgs so',
    loc: { a: 4018, b: 4199, line: 141, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sponsor_orgs_upchieve_instances (id, sponsor_org_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     so.id,
 *     so.created_at,
 *     NOW()
 * FROM
 *     sponsor_orgs so
 * ```
 */
export const insertExistingSponsorOrgs = new PreparedQuery<
  IInsertExistingSponsorOrgsParams,
  IInsertExistingSponsorOrgsResult
>(insertExistingSponsorOrgsIR)

/** 'InsertExistingPartnerOrgSponsorOrgRelationships' parameters type */
export type IInsertExistingPartnerOrgSponsorOrgRelationshipsParams = void

/** 'InsertExistingPartnerOrgSponsorOrgRelationships' return type */
export type IInsertExistingPartnerOrgSponsorOrgRelationshipsResult = void

/** 'InsertExistingPartnerOrgSponsorOrgRelationships' query type */
export interface IInsertExistingPartnerOrgSponsorOrgRelationshipsQuery {
  params: IInsertExistingPartnerOrgSponsorOrgRelationshipsParams
  result: IInsertExistingPartnerOrgSponsorOrgRelationshipsResult
}

const insertExistingPartnerOrgSponsorOrgRelationshipsIR: any = {
  name: 'insertExistingPartnerOrgSponsorOrgRelationships',
  params: [],
  usedParamSet: {},
  statement: {
    body: 'INSERT INTO student_partner_orgs_sponsor_orgs_instances (student_partner_org_id, sponsor_org_id, created_at, updated_at)\nSELECT\n    sposo.student_partner_org_id,\n    sposo.sponsor_org_id,\n    sposo.created_at,\n    NOW()\nFROM\n    student_partner_orgs_sponsor_orgs sposo',
    loc: { a: 4264, b: 4531, line: 152, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs_sponsor_orgs_instances (student_partner_org_id, sponsor_org_id, created_at, updated_at)
 * SELECT
 *     sposo.student_partner_org_id,
 *     sposo.sponsor_org_id,
 *     sposo.created_at,
 *     NOW()
 * FROM
 *     student_partner_orgs_sponsor_orgs sposo
 * ```
 */
export const insertExistingPartnerOrgSponsorOrgRelationships =
  new PreparedQuery<
    IInsertExistingPartnerOrgSponsorOrgRelationshipsParams,
    IInsertExistingPartnerOrgSponsorOrgRelationshipsResult
  >(insertExistingPartnerOrgSponsorOrgRelationshipsIR)

/** 'InsertExistingSchoolsSponsorOrgRelationships' parameters type */
export type IInsertExistingSchoolsSponsorOrgRelationshipsParams = void

/** 'InsertExistingSchoolsSponsorOrgRelationships' return type */
export type IInsertExistingSchoolsSponsorOrgRelationshipsResult = void

/** 'InsertExistingSchoolsSponsorOrgRelationships' query type */
export interface IInsertExistingSchoolsSponsorOrgRelationshipsQuery {
  params: IInsertExistingSchoolsSponsorOrgRelationshipsParams
  result: IInsertExistingSchoolsSponsorOrgRelationshipsResult
}

const insertExistingSchoolsSponsorOrgRelationshipsIR: any = {
  name: 'insertExistingSchoolsSponsorOrgRelationships',
  params: [],
  usedParamSet: {},
  statement: {
    body: 'INSERT INTO schools_sponsor_orgs_instances (school_id, sponsor_org_id, created_at, updated_at)\nSELECT\n    sso.school_id,\n    sso.sponsor_org_id,\n    sso.created_at,\n    NOW()\nFROM\n    schools_sponsor_orgs sso',
    loc: { a: 4593, b: 4800, line: 163, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO schools_sponsor_orgs_instances (school_id, sponsor_org_id, created_at, updated_at)
 * SELECT
 *     sso.school_id,
 *     sso.sponsor_org_id,
 *     sso.created_at,
 *     NOW()
 * FROM
 *     schools_sponsor_orgs sso
 * ```
 */
export const insertExistingSchoolsSponsorOrgRelationships = new PreparedQuery<
  IInsertExistingSchoolsSponsorOrgRelationshipsParams,
  IInsertExistingSchoolsSponsorOrgRelationshipsResult
>(insertExistingSchoolsSponsorOrgRelationshipsIR)

/** 'InsertStudentPartnerOrgAssociatedPartners' parameters type */
export type IInsertStudentPartnerOrgAssociatedPartnersParams = void

/** 'InsertStudentPartnerOrgAssociatedPartners' return type */
export type IInsertStudentPartnerOrgAssociatedPartnersResult = void

/** 'InsertStudentPartnerOrgAssociatedPartners' query type */
export interface IInsertStudentPartnerOrgAssociatedPartnersQuery {
  params: IInsertStudentPartnerOrgAssociatedPartnersParams
  result: IInsertStudentPartnerOrgAssociatedPartnersResult
}

const insertStudentPartnerOrgAssociatedPartnersIR: any = {
  name: 'insertStudentPartnerOrgAssociatedPartners',
  params: [],
  usedParamSet: {},
  statement: {
    body: 'INSERT INTO student_partner_orgs_volunteer_partner_orgs_instances (student_partner_org_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    ap.student_partner_org_id,\n    ap.volunteer_partner_org_id,\n    ap.created_at,\n    NOW()\nFROM\n    associated_partners ap\nWHERE\n    ap.student_partner_org_id IS NOT NULL',
    loc: { a: 4859, b: 5178, line: 174, col: 0 },
  },
}

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
export const insertStudentPartnerOrgAssociatedPartners = new PreparedQuery<
  IInsertStudentPartnerOrgAssociatedPartnersParams,
  IInsertStudentPartnerOrgAssociatedPartnersResult
>(insertStudentPartnerOrgAssociatedPartnersIR)

/** 'InsertSponsorOrgAssociatedPartners' parameters type */
export type IInsertSponsorOrgAssociatedPartnersParams = void

/** 'InsertSponsorOrgAssociatedPartners' return type */
export type IInsertSponsorOrgAssociatedPartnersResult = void

/** 'InsertSponsorOrgAssociatedPartners' query type */
export interface IInsertSponsorOrgAssociatedPartnersQuery {
  params: IInsertSponsorOrgAssociatedPartnersParams
  result: IInsertSponsorOrgAssociatedPartnersResult
}

const insertSponsorOrgAssociatedPartnersIR: any = {
  name: 'insertSponsorOrgAssociatedPartners',
  params: [],
  usedParamSet: {},
  statement: {
    body: 'INSERT INTO sponsor_orgs_volunteer_partner_orgs_instances (sponsor_org_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    ap.student_sponsor_org_id,\n    ap.volunteer_partner_org_id,\n    ap.created_at,\n    NOW()\nFROM\n    associated_partners ap\nWHERE\n    ap.student_sponsor_org_id IS NOT NULL',
    loc: { a: 5230, b: 5533, line: 187, col: 0 },
  },
}

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
export const insertSponsorOrgAssociatedPartners = new PreparedQuery<
  IInsertSponsorOrgAssociatedPartnersParams,
  IInsertSponsorOrgAssociatedPartnersResult
>(insertSponsorOrgAssociatedPartnersIR)
