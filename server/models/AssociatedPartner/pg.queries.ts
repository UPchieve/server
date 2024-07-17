/** Types generated for queries found in "server/models/AssociatedPartner/associated_partners.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetAssociatedPartners' parameters type */
export type IGetAssociatedPartnersParams = void;

/** 'GetAssociatedPartners' return type */
export interface IGetAssociatedPartnersResult {
  key: string;
  studentOrgDisplay: string | null;
  studentPartnerOrg: string;
  studentPartnerOrgId: string;
  studentSponsorOrg: string;
  studentSponsorOrgId: string;
  volunteerOrgDisplay: string;
  volunteerPartnerOrg: string;
  volunteerPartnerOrgId: string;
}

/** 'GetAssociatedPartners' query type */
export interface IGetAssociatedPartnersQuery {
  params: IGetAssociatedPartnersParams;
  result: IGetAssociatedPartnersResult;
}

const getAssociatedPartnersIR: any = {"name":"getAssociatedPartners","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id","loc":{"a":34,"b":618,"line":2,"col":0}}};

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
export const getAssociatedPartners = new PreparedQuery<IGetAssociatedPartnersParams,IGetAssociatedPartnersResult>(getAssociatedPartnersIR);


/** 'GetAssociatedPartnerByKey' parameters type */
export interface IGetAssociatedPartnerByKeyParams {
  key: string;
}

/** 'GetAssociatedPartnerByKey' return type */
export interface IGetAssociatedPartnerByKeyResult {
  key: string;
  studentOrgDisplay: string | null;
  studentPartnerOrg: string;
  studentPartnerOrgId: string;
  studentSponsorOrg: string;
  studentSponsorOrgId: string;
  volunteerOrgDisplay: string;
  volunteerPartnerOrg: string;
  volunteerPartnerOrgId: string;
}

/** 'GetAssociatedPartnerByKey' query type */
export interface IGetAssociatedPartnerByKeyQuery {
  params: IGetAssociatedPartnerByKeyParams;
  result: IGetAssociatedPartnerByKeyResult;
}

const getAssociatedPartnerByKeyIR: any = {"name":"getAssociatedPartnerByKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1277,"b":1280,"line":36,"col":14}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id\nWHERE\n    ap.key = :key!","loc":{"a":661,"b":1280,"line":20,"col":0}}};

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
export const getAssociatedPartnerByKey = new PreparedQuery<IGetAssociatedPartnerByKeyParams,IGetAssociatedPartnerByKeyResult>(getAssociatedPartnerByKeyIR);


/** 'GetAssociatedPartnerBySponsorOrgKey' parameters type */
export interface IGetAssociatedPartnerBySponsorOrgKeyParams {
  key: string;
}

/** 'GetAssociatedPartnerBySponsorOrgKey' return type */
export interface IGetAssociatedPartnerBySponsorOrgKeyResult {
  key: string;
  studentOrgDisplay: string | null;
  studentPartnerOrg: string;
  studentPartnerOrgId: string;
  studentSponsorOrg: string;
  studentSponsorOrgId: string;
  volunteerOrgDisplay: string;
  volunteerPartnerOrg: string;
  volunteerPartnerOrgId: string;
}

/** 'GetAssociatedPartnerBySponsorOrgKey' query type */
export interface IGetAssociatedPartnerBySponsorOrgKeyQuery {
  params: IGetAssociatedPartnerBySponsorOrgKeyParams;
  result: IGetAssociatedPartnerBySponsorOrgKeyResult;
}

const getAssociatedPartnerBySponsorOrgKeyIR: any = {"name":"getAssociatedPartnerBySponsorOrgKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1949,"b":1952,"line":56,"col":14}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id\nWHERE\n    so.key = :key!","loc":{"a":1333,"b":1952,"line":40,"col":0}}};

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
export const getAssociatedPartnerBySponsorOrgKey = new PreparedQuery<IGetAssociatedPartnerBySponsorOrgKeyParams,IGetAssociatedPartnerBySponsorOrgKeyResult>(getAssociatedPartnerBySponsorOrgKeyIR);


/** 'GetAssociatedPartnerByPartnerOrgKey' parameters type */
export interface IGetAssociatedPartnerByPartnerOrgKeyParams {
  key: string;
}

/** 'GetAssociatedPartnerByPartnerOrgKey' return type */
export interface IGetAssociatedPartnerByPartnerOrgKeyResult {
  key: string;
  studentOrgDisplay: string | null;
  studentPartnerOrg: string;
  studentPartnerOrgId: string;
  studentSponsorOrg: string;
  studentSponsorOrgId: string;
  volunteerOrgDisplay: string;
  volunteerPartnerOrg: string;
  volunteerPartnerOrgId: string;
}

/** 'GetAssociatedPartnerByPartnerOrgKey' query type */
export interface IGetAssociatedPartnerByPartnerOrgKeyQuery {
  params: IGetAssociatedPartnerByPartnerOrgKeyParams;
  result: IGetAssociatedPartnerByPartnerOrgKeyResult;
}

const getAssociatedPartnerByPartnerOrgKeyIR: any = {"name":"getAssociatedPartnerByPartnerOrgKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2622,"b":2625,"line":76,"col":15}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id\nWHERE\n    spo.key = :key!","loc":{"a":2005,"b":2625,"line":60,"col":0}}};

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
export const getAssociatedPartnerByPartnerOrgKey = new PreparedQuery<IGetAssociatedPartnerByPartnerOrgKeyParams,IGetAssociatedPartnerByPartnerOrgKeyResult>(getAssociatedPartnerByPartnerOrgKeyIR);


/** 'GetAssociatedPartnerByVolunteerPartnerKey' parameters type */
export interface IGetAssociatedPartnerByVolunteerPartnerKeyParams {
  key: string;
}

/** 'GetAssociatedPartnerByVolunteerPartnerKey' return type */
export interface IGetAssociatedPartnerByVolunteerPartnerKeyResult {
  key: string;
  studentOrgDisplay: string | null;
  studentPartnerOrg: string;
  studentPartnerOrgId: string;
  studentSponsorOrg: string;
  studentSponsorOrgId: string;
  volunteerOrgDisplay: string;
  volunteerPartnerOrg: string;
  volunteerPartnerOrgId: string;
}

/** 'GetAssociatedPartnerByVolunteerPartnerKey' query type */
export interface IGetAssociatedPartnerByVolunteerPartnerKeyQuery {
  params: IGetAssociatedPartnerByVolunteerPartnerKeyParams;
  result: IGetAssociatedPartnerByVolunteerPartnerKeyResult;
}

const getAssociatedPartnerByVolunteerPartnerKeyIR: any = {"name":"getAssociatedPartnerByVolunteerPartnerKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3301,"b":3304,"line":96,"col":15}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id\nWHERE\n    vpo.key = :key!","loc":{"a":2684,"b":3304,"line":80,"col":0}}};

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
export const getAssociatedPartnerByVolunteerPartnerKey = new PreparedQuery<IGetAssociatedPartnerByVolunteerPartnerKeyParams,IGetAssociatedPartnerByVolunteerPartnerKeyResult>(getAssociatedPartnerByVolunteerPartnerKeyIR);


/** 'MigrateStudentPartnerOrgAssociatedPartners' parameters type */
export type IMigrateStudentPartnerOrgAssociatedPartnersParams = void;

/** 'MigrateStudentPartnerOrgAssociatedPartners' return type */
export type IMigrateStudentPartnerOrgAssociatedPartnersResult = void;

/** 'MigrateStudentPartnerOrgAssociatedPartners' query type */
export interface IMigrateStudentPartnerOrgAssociatedPartnersQuery {
  params: IMigrateStudentPartnerOrgAssociatedPartnersParams;
  result: IMigrateStudentPartnerOrgAssociatedPartnersResult;
}

const migrateStudentPartnerOrgAssociatedPartnersIR: any = {"name":"migrateStudentPartnerOrgAssociatedPartners","params":[],"usedParamSet":{},"statement":{"body":"INSERT INTO student_partner_orgs_volunteer_partner_orgs_instances (student_partner_org_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    ap.student_partner_org_id,\n    ap.volunteer_partner_org_id,\n    ap.created_at,\n    NOW()\nFROM\n    associated_partners ap\nWHERE\n    ap.student_partner_org_id IS NOT NULL","loc":{"a":3364,"b":3683,"line":100,"col":0}}};

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
export const migrateStudentPartnerOrgAssociatedPartners = new PreparedQuery<IMigrateStudentPartnerOrgAssociatedPartnersParams,IMigrateStudentPartnerOrgAssociatedPartnersResult>(migrateStudentPartnerOrgAssociatedPartnersIR);


/** 'MigrateSponsorOrgAssociatedPartners' parameters type */
export type IMigrateSponsorOrgAssociatedPartnersParams = void;

/** 'MigrateSponsorOrgAssociatedPartners' return type */
export type IMigrateSponsorOrgAssociatedPartnersResult = void;

/** 'MigrateSponsorOrgAssociatedPartners' query type */
export interface IMigrateSponsorOrgAssociatedPartnersQuery {
  params: IMigrateSponsorOrgAssociatedPartnersParams;
  result: IMigrateSponsorOrgAssociatedPartnersResult;
}

const migrateSponsorOrgAssociatedPartnersIR: any = {"name":"migrateSponsorOrgAssociatedPartners","params":[],"usedParamSet":{},"statement":{"body":"INSERT INTO sponsor_orgs_volunteer_partner_orgs_instances (sponsor_org_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    ap.student_sponsor_org_id,\n    ap.volunteer_partner_org_id,\n    ap.created_at,\n    NOW()\nFROM\n    associated_partners ap\nWHERE\n    ap.student_sponsor_org_id IS NOT NULL","loc":{"a":3736,"b":4039,"line":113,"col":0}}};

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
export const migrateSponsorOrgAssociatedPartners = new PreparedQuery<IMigrateSponsorOrgAssociatedPartnersParams,IMigrateSponsorOrgAssociatedPartnersResult>(migrateSponsorOrgAssociatedPartnersIR);


