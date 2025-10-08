/** Types generated for queries found in "server/models/AssociatedPartner/associated_partners.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

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

const getAssociatedPartnersIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id"};

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

const getAssociatedPartnerByKeyIR: any = {"usedParamSet":{"key":true},"params":[{"name":"key","required":true,"transform":{"type":"scalar"},"locs":[{"a":615,"b":619}]}],"statement":"SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id\nWHERE\n    ap.key = :key!"};

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

const getAssociatedPartnerBySponsorOrgKeyIR: any = {"usedParamSet":{"key":true},"params":[{"name":"key","required":true,"transform":{"type":"scalar"},"locs":[{"a":615,"b":619}]}],"statement":"SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id\nWHERE\n    so.key = :key!"};

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


/** 'GetAssociatedPartnerByStudentPartnerOrgKey' parameters type */
export interface IGetAssociatedPartnerByStudentPartnerOrgKeyParams {
  key: string;
}

/** 'GetAssociatedPartnerByStudentPartnerOrgKey' return type */
export interface IGetAssociatedPartnerByStudentPartnerOrgKeyResult {
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

/** 'GetAssociatedPartnerByStudentPartnerOrgKey' query type */
export interface IGetAssociatedPartnerByStudentPartnerOrgKeyQuery {
  params: IGetAssociatedPartnerByStudentPartnerOrgKeyParams;
  result: IGetAssociatedPartnerByStudentPartnerOrgKeyResult;
}

const getAssociatedPartnerByStudentPartnerOrgKeyIR: any = {"usedParamSet":{"key":true},"params":[{"name":"key","required":true,"transform":{"type":"scalar"},"locs":[{"a":616,"b":620}]}],"statement":"SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id\nWHERE\n    spo.key = :key!"};

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
export const getAssociatedPartnerByStudentPartnerOrgKey = new PreparedQuery<IGetAssociatedPartnerByStudentPartnerOrgKeyParams,IGetAssociatedPartnerByStudentPartnerOrgKeyResult>(getAssociatedPartnerByStudentPartnerOrgKeyIR);


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

const getAssociatedPartnerByVolunteerPartnerKeyIR: any = {"usedParamSet":{"key":true},"params":[{"name":"key","required":true,"transform":{"type":"scalar"},"locs":[{"a":616,"b":620}]}],"statement":"SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id\nWHERE\n    vpo.key = :key!"};

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

const migrateStudentPartnerOrgAssociatedPartnersIR: any = {"usedParamSet":{},"params":[],"statement":"INSERT INTO student_partner_orgs_volunteer_partner_orgs_instances (student_partner_org_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    ap.student_partner_org_id,\n    ap.volunteer_partner_org_id,\n    ap.created_at,\n    NOW()\nFROM\n    associated_partners ap\nWHERE\n    ap.student_partner_org_id IS NOT NULL"};

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

const migrateSponsorOrgAssociatedPartnersIR: any = {"usedParamSet":{},"params":[],"statement":"INSERT INTO sponsor_orgs_volunteer_partner_orgs_instances (sponsor_org_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    ap.student_sponsor_org_id,\n    ap.volunteer_partner_org_id,\n    ap.created_at,\n    NOW()\nFROM\n    associated_partners ap\nWHERE\n    ap.student_sponsor_org_id IS NOT NULL"};

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


