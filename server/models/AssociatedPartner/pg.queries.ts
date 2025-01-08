/** Types generated for queries found in "server/models/AssociatedPartner/associated_partners.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** Query 'GetAssociatedPartners' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetAssociatedPartnersResult = never;

/** Query 'GetAssociatedPartners' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetAssociatedPartnersParams = never;

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


/** Query 'GetAssociatedPartnerByKey' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetAssociatedPartnerByKeyResult = never;

/** Query 'GetAssociatedPartnerByKey' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetAssociatedPartnerByKeyParams = never;

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


/** Query 'GetAssociatedPartnerBySponsorOrgKey' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetAssociatedPartnerBySponsorOrgKeyResult = never;

/** Query 'GetAssociatedPartnerBySponsorOrgKey' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetAssociatedPartnerBySponsorOrgKeyParams = never;

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


/** Query 'GetAssociatedPartnerByPartnerOrgKey' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetAssociatedPartnerByPartnerOrgKeyResult = never;

/** Query 'GetAssociatedPartnerByPartnerOrgKey' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetAssociatedPartnerByPartnerOrgKeyParams = never;

const getAssociatedPartnerByPartnerOrgKeyIR: any = {"usedParamSet":{"key":true},"params":[{"name":"key","required":true,"transform":{"type":"scalar"},"locs":[{"a":616,"b":620}]}],"statement":"SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id\nWHERE\n    spo.key = :key!"};

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


/** Query 'GetAssociatedPartnerByVolunteerPartnerKey' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetAssociatedPartnerByVolunteerPartnerKeyResult = never;

/** Query 'GetAssociatedPartnerByVolunteerPartnerKey' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetAssociatedPartnerByVolunteerPartnerKeyParams = never;

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


/** Query 'MigrateStudentPartnerOrgAssociatedPartners' is invalid, so its result is assigned type 'never'.
 *  */
export type IMigrateStudentPartnerOrgAssociatedPartnersResult = never;

/** Query 'MigrateStudentPartnerOrgAssociatedPartners' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IMigrateStudentPartnerOrgAssociatedPartnersParams = never;

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


/** Query 'MigrateSponsorOrgAssociatedPartners' is invalid, so its result is assigned type 'never'.
 *  */
export type IMigrateSponsorOrgAssociatedPartnersResult = never;

/** Query 'MigrateSponsorOrgAssociatedPartners' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IMigrateSponsorOrgAssociatedPartnersParams = never;

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


