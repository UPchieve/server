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

const getAssociatedPartnerBySponsorOrgKeyIR: any = {"name":"getAssociatedPartnerBySponsorOrgKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1948,"b":1951,"line":55,"col":14}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id\nWHERE\n    so.key = :key!","loc":{"a":1332,"b":1951,"line":39,"col":0}}};

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

const getAssociatedPartnerByPartnerOrgKeyIR: any = {"name":"getAssociatedPartnerByPartnerOrgKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2620,"b":2623,"line":74,"col":15}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id\nWHERE\n    spo.key = :key!","loc":{"a":2003,"b":2623,"line":58,"col":0}}};

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

const getAssociatedPartnerByVolunteerPartnerKeyIR: any = {"name":"getAssociatedPartnerByVolunteerPartnerKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3299,"b":3302,"line":94,"col":15}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n    ap.key AS KEY,\n    vpo.id AS volunteer_partner_org_id,\n    vpo.key AS volunteer_partner_org,\n    vpo.name AS volunteer_org_display,\n    spo.id AS student_partner_org_id,\n    spo.key AS student_partner_org,\n    coalesce(spo.name, so.name) AS student_org_display,\n    so.id AS student_sponsor_org_id,\n    so.key AS student_sponsor_org\nFROM\n    associated_partners ap\n    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\n    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\n    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id\nWHERE\n    vpo.key = :key!","loc":{"a":2682,"b":3302,"line":78,"col":0}}};

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


