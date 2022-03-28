/** Types generated for queries found in "server/models/AssociatedPartner/associated_partners.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetAssociatedPartners' parameters type */
export type IGetAssociatedPartnersParams = void;

/** 'GetAssociatedPartners' return type */
export interface IGetAssociatedPartnersResult {
  key: string;
  studentOrgDisplay: string;
  studentPartnerOrg: string;
  studentSponsorOrg: string;
  volunteerOrgDisplay: string;
  volunteerPartnerOrg: string;
}

/** 'GetAssociatedPartners' query type */
export interface IGetAssociatedPartnersQuery {
  params: IGetAssociatedPartnersParams;
  result: IGetAssociatedPartnersResult;
}

const getAssociatedPartnersIR: any = {"name":"getAssociatedPartners","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n  ap.key as key,\n  vpo.key as volunteer_partner_org,\n  vpo.name as volunteer_org_display,\n  spo.key as student_partner_org,\n  spo.name as student_org_display,\n  so.key as student_sponsor_org\nFROM associated_partners ap\nJOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\nJOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\nJOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id","loc":{"a":34,"b":456,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   ap.key as key,
 *   vpo.key as volunteer_partner_org,
 *   vpo.name as volunteer_org_display,
 *   spo.key as student_partner_org,
 *   spo.name as student_org_display,
 *   so.key as student_sponsor_org
 * FROM associated_partners ap
 * JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id
 * JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id
 * JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id
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
  studentOrgDisplay: string;
  studentPartnerOrg: string;
  studentSponsorOrg: string;
  volunteerOrgDisplay: string;
  volunteerPartnerOrg: string;
}

/** 'GetAssociatedPartnerByKey' query type */
export interface IGetAssociatedPartnerByKeyQuery {
  params: IGetAssociatedPartnerByKeyParams;
  result: IGetAssociatedPartnerByKeyResult;
}

const getAssociatedPartnerByKeyIR: any = {"name":"getAssociatedPartnerByKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":936,"b":939,"line":26,"col":14}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n  ap.key as key,\n  vpo.key as volunteer_partner_org,\n  vpo.name as volunteer_org_display,\n  spo.key as student_partner_org,\n  spo.name as student_org_display,\n  so.key as student_sponsor_org\nFROM associated_partners ap\nJOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id\nJOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id\nJOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id\nWHERE ap.key=:key!","loc":{"a":498,"b":939,"line":15,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   ap.key as key,
 *   vpo.key as volunteer_partner_org,
 *   vpo.name as volunteer_org_display,
 *   spo.key as student_partner_org,
 *   spo.name as student_org_display,
 *   so.key as student_sponsor_org
 * FROM associated_partners ap
 * JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id
 * JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id
 * JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id
 * WHERE ap.key=:key!
 * ```
 */
export const getAssociatedPartnerByKey = new PreparedQuery<IGetAssociatedPartnerByKeyParams,IGetAssociatedPartnerByKeyResult>(getAssociatedPartnerByKeyIR);


