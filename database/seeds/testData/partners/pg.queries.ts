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
