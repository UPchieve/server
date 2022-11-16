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
      codeRefs: { used: [{ a: 157, b: 159, line: 2, col: 119 }] },
    },
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 163, b: 167, line: 2, col: 125 }] },
    },
    {
      name: 'key',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 171, b: 174, line: 2, col: 133 }] },
    },
    {
      name: 'receiveWeeklyHourSummaryEmail',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 178, b: 207, line: 2, col: 140 }] },
    },
  ],
  usedParamSet: {
    id: true,
    name: true,
    key: true,
    receiveWeeklyHourSummaryEmail: true,
  },
  statement: {
    body:
      'INSERT INTO volunteer_partner_orgs (id, name, key, receive_weekly_hour_summary_email, created_at, updated_at) VALUES (:id!, :name!, :key!, :receiveWeeklyHourSummaryEmail!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 38, b: 264, line: 2, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO volunteer_partner_orgs (id, name, key, receive_weekly_hour_summary_email, created_at, updated_at) VALUES (:id!, :name!, :key!, :receiveWeeklyHourSummaryEmail!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
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
      codeRefs: { used: [{ a: 459, b: 461, line: 5, col: 155 }] },
    },
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 465, b: 469, line: 5, col: 161 }] },
    },
    {
      name: 'key',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 473, b: 476, line: 5, col: 169 }] },
    },
    {
      name: 'highSchoolSignup',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 480, b: 496, line: 5, col: 176 }] },
    },
    {
      name: 'collegeSignup',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 500, b: 513, line: 5, col: 196 }] },
    },
    {
      name: 'schoolSignupRequired',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 517, b: 537, line: 5, col: 213 }] },
    },
    {
      name: 'signupCode',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 541, b: 551, line: 5, col: 237 }] },
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
    body:
      'INSERT INTO student_partner_orgs (id, name, key, high_school_signup, college_signup, school_signup_required, signup_code, created_at, updated_at) VALUES (:id!, :name!, :key!, :highSchoolSignup!, :collegeSignup!, :schoolSignupRequired!, :signupCode!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 304, b: 608, line: 5, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs (id, name, key, high_school_signup, college_signup, school_signup_required, signup_code, created_at, updated_at) VALUES (:id!, :name!, :key!, :highSchoolSignup!, :collegeSignup!, :schoolSignupRequired!, :signupCode!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
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
      codeRefs: { used: [{ a: 758, b: 760, line: 8, col: 106 }] },
    },
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 764, b: 768, line: 8, col: 112 }] },
    },
    {
      name: 'studentPartnerOrgId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 772, b: 791, line: 8, col: 120 }] },
    },
  ],
  usedParamSet: { id: true, name: true, studentPartnerOrgId: true },
  statement: {
    body:
      'INSERT INTO student_partner_org_sites (id, name, student_partner_org_id, created_at, updated_at) VALUES (:id!, :name!, :studentPartnerOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 652, b: 848, line: 8, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_org_sites (id, name, student_partner_org_id, created_at, updated_at) VALUES (:id!, :name!, :studentPartnerOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
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
      codeRefs: { used: [{ a: 997, b: 999, line: 11, col: 107 }] },
    },
    {
      name: 'domain',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1003, b: 1009, line: 11, col: 113 }] },
    },
    {
      name: 'volunteerPartnerOrgId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1013, b: 1034, line: 11, col: 123 }] },
    },
  ],
  usedParamSet: { id: true, domain: true, volunteerPartnerOrgId: true },
  statement: {
    body:
      'INSERT INTO required_email_domains (id, domain, volunteer_partner_org_id, created_at, updated_at) VALUES (:id!, :domain!, :volunteerPartnerOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 890, b: 1091, line: 11, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO required_email_domains (id, domain, volunteer_partner_org_id, created_at, updated_at) VALUES (:id!, :domain!, :volunteerPartnerOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
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
      codeRefs: { used: [{ a: 1280, b: 1282, line: 14, col: 149 }] },
    },
    {
      name: 'key',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1286, b: 1289, line: 14, col: 155 }] },
    },
    {
      name: 'vpoId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1293, b: 1298, line: 14, col: 162 }] },
    },
    {
      name: 'spoId',
      required: false,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1302, b: 1306, line: 14, col: 171 }] },
    },
    {
      name: 'soId',
      required: false,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1310, b: 1313, line: 14, col: 179 }] },
    },
  ],
  usedParamSet: { id: true, key: true, vpoId: true, spoId: true, soId: true },
  statement: {
    body:
      'INSERT INTO associated_partners (id, key, volunteer_partner_org_id, student_partner_org_id, student_sponsor_org_id, created_at, updated_at) VALUES (:id!, :key!, :vpoId!, :spoId, :soId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 1131, b: 1370, line: 14, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO associated_partners (id, key, volunteer_partner_org_id, student_partner_org_id, student_sponsor_org_id, created_at, updated_at) VALUES (:id!, :key!, :vpoId!, :spoId, :soId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
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
      codeRefs: { used: [{ a: 1477, b: 1479, line: 17, col: 74 }] },
    },
    {
      name: 'key',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1483, b: 1486, line: 17, col: 80 }] },
    },
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1490, b: 1494, line: 17, col: 87 }] },
    },
  ],
  usedParamSet: { id: true, key: true, name: true },
  statement: {
    body:
      'INSERT INTO sponsor_orgs (id, key, name, created_at, updated_at) VALUES (:id!, :key!, :name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 1403, b: 1551, line: 17, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sponsor_orgs (id, key, name, created_at, updated_at) VALUES (:id!, :key!, :name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
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
      codeRefs: { used: [{ a: 1685, b: 1693, line: 20, col: 94 }] },
    },
    {
      name: 'sponsorOrgId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1697, b: 1709, line: 20, col: 106 }] },
    },
  ],
  usedParamSet: { schoolId: true, sponsorOrgId: true },
  statement: {
    body:
      'INSERT INTO schools_sponsor_orgs (school_id, sponsor_org_id, created_at, updated_at) VALUES (:schoolId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING school_id AS ok',
    loc: { a: 1591, b: 1773, line: 20, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO schools_sponsor_orgs (school_id, sponsor_org_id, created_at, updated_at) VALUES (:schoolId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING school_id AS ok
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
      codeRefs: { used: [{ a: 1940, b: 1945, line: 23, col: 120 }] },
    },
    {
      name: 'sponsorOrgId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1949, b: 1961, line: 23, col: 129 }] },
    },
  ],
  usedParamSet: { spoId: true, sponsorOrgId: true },
  statement: {
    body:
      'INSERT INTO student_partner_orgs_sponsor_orgs (student_partner_org_id, sponsor_org_id, created_at, updated_at) VALUES (:spoId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING student_partner_org_id AS ok',
    loc: { a: 1820, b: 2038, line: 23, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs_sponsor_orgs (student_partner_org_id, sponsor_org_id, created_at, updated_at) VALUES (:spoId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING student_partner_org_id AS ok
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
    body:
      'INSERT INTO student_partner_orgs_upchieve_instances (id, student_partner_org_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    spo.id,\n    spo.created_at,\n    NOW()\nFROM\n    student_partner_orgs spo',
    loc: { a: 2087, b: 2295, line: 26, col: 0 },
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
    body:
      'INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, student_partner_org_user_id, created_at, updated_at)\nSELECT\n    users.id,\n    sp.student_partner_org_id,\n    sp.student_partner_org_site_id,\n    sp.student_partner_org_user_id,\n    sp.created_at,\n    NOW()\nFROM\n    users\n    JOIN student_profiles sp ON sp.user_id = users.id\nWHERE\n    sp.student_partner_org_id IS NOT NULL',
    loc: { a: 2357, b: 2790, line: 37, col: 0 },
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
    body:
      'INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, student_partner_org_user_id, created_at, updated_at)\nSELECT\n    users.id,\n    spo.id,\n    NULL,\n    NULL,\n    sp.created_at,\n    NOW()\nFROM\n    users\n    JOIN student_profiles sp ON sp.user_id = users.id\n    JOIN student_partner_orgs spo ON spo.school_id = sp.school_id',
    loc: { a: 2848, b: 3228, line: 53, col: 0 },
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
    body:
      'INSERT INTO volunteer_partner_orgs_upchieve_instances (id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    vpo.id,\n    vpo.created_at,\n    NOW()\nFROM\n    volunteer_partner_orgs vpo',
    loc: { a: 3281, b: 3495, line: 69, col: 0 },
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
    body:
      'INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    users.id,\n    vp.volunteer_partner_org_id,\n    vp.created_at,\n    NOW()\nFROM\n    users\n    JOIN volunteer_profiles vp ON vp.user_id = users.id\nWHERE\n    vp.volunteer_partner_org_id IS NOT NULL',
    loc: { a: 3559, b: 3872, line: 80, col: 0 },
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
    body:
      'INSERT INTO sponsor_orgs_upchieve_instances (id, sponsor_org_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    so.id,\n    so.created_at,\n    NOW()\nFROM\n    sponsor_orgs so',
    loc: { a: 3915, b: 4096, line: 94, col: 0 },
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
    body:
      'INSERT INTO student_partner_orgs_sponsor_orgs_instances (student_partner_org_id, sponsor_org_id, created_at, updated_at)\nSELECT\n    sposo.student_partner_org_id,\n    sposo.sponsor_org_id,\n    sposo.created_at,\n    NOW()\nFROM\n    student_partner_orgs_sponsor_orgs sposo',
    loc: { a: 4161, b: 4428, line: 105, col: 0 },
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
export const insertExistingPartnerOrgSponsorOrgRelationships = new PreparedQuery<
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
    body:
      'INSERT INTO schools_sponsor_orgs_instances (school_id, sponsor_org_id, created_at, updated_at)\nSELECT\n    sso.school_id,\n    sso.sponsor_org_id,\n    sso.created_at,\n    NOW()\nFROM\n    schools_sponsor_orgs sso',
    loc: { a: 4490, b: 4697, line: 116, col: 0 },
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
    body:
      'INSERT INTO student_partner_orgs_volunteer_partner_orgs_instances (student_partner_org_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    ap.student_partner_org_id,\n    ap.volunteer_partner_org_id,\n    ap.created_at,\n    NOW()\nFROM\n    associated_partners ap\nWHERE\n    ap.student_partner_org_id IS NOT NULL',
    loc: { a: 4756, b: 5075, line: 127, col: 0 },
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
    body:
      'INSERT INTO sponsor_orgs_volunteer_partner_orgs_instances (sponsor_org_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    ap.student_sponsor_org_id,\n    ap.volunteer_partner_org_id,\n    ap.created_at,\n    NOW()\nFROM\n    associated_partners ap\nWHERE\n    ap.student_sponsor_org_id IS NOT NULL',
    loc: { a: 5127, b: 5430, line: 140, col: 0 },
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
