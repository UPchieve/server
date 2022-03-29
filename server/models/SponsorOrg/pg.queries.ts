/** Types generated for queries found in "server/models/SponsorOrg/sponsor_orgs.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type stringArray = (string)[];

/** 'GetSponsorOrgs' parameters type */
export type IGetSponsorOrgsParams = void;

/** 'GetSponsorOrgs' return type */
export interface IGetSponsorOrgsResult {
  key: string | null;
  name: string | null;
  schoolIds: stringArray | null;
  studentPartnerOrgKeys: stringArray | null;
}

/** 'GetSponsorOrgs' query type */
export interface IGetSponsorOrgsQuery {
  params: IGetSponsorOrgsParams;
  result: IGetSponsorOrgsResult;
}

const getSponsorOrgsIR: any = {"name":"getSponsorOrgs","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    so.key,\n    max(so.name) AS name,\n    array_agg(sso.school_id) AS school_ids,\n    array_agg(spo.key) AS student_partner_org_keys\nFROM\n    sponsor_orgs so\n    JOIN schools_sponsor_orgs sso ON so.id = sso.sponsor_org_id\n    JOIN student_partner_orgs_sponsor_orgs sposo ON so.id = sposo.sponsor_org_id\n    JOIN student_partner_orgs spo ON sposo.student_partner_org_id = spo.id\nGROUP BY\n    so.key","loc":{"a":27,"b":430,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     so.key,
 *     max(so.name) AS name,
 *     array_agg(sso.school_id) AS school_ids,
 *     array_agg(spo.key) AS student_partner_org_keys
 * FROM
 *     sponsor_orgs so
 *     JOIN schools_sponsor_orgs sso ON so.id = sso.sponsor_org_id
 *     JOIN student_partner_orgs_sponsor_orgs sposo ON so.id = sposo.sponsor_org_id
 *     JOIN student_partner_orgs spo ON sposo.student_partner_org_id = spo.id
 * GROUP BY
 *     so.key
 * ```
 */
export const getSponsorOrgs = new PreparedQuery<IGetSponsorOrgsParams,IGetSponsorOrgsResult>(getSponsorOrgsIR);


/** 'GetSponsorOrgsByKey' parameters type */
export interface IGetSponsorOrgsByKeyParams {
  sponsorOrg: string;
}

/** 'GetSponsorOrgsByKey' return type */
export interface IGetSponsorOrgsByKeyResult {
  key: string | null;
  name: string | null;
  schoolIds: stringArray | null;
  studentPartnerOrgKeys: stringArray | null;
}

/** 'GetSponsorOrgsByKey' query type */
export interface IGetSponsorOrgsByKeyQuery {
  params: IGetSponsorOrgsByKeyParams;
  result: IGetSponsorOrgsByKeyResult;
}

const getSponsorOrgsByKeyIR: any = {"name":"getSponsorOrgsByKey","params":[{"name":"sponsorOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":872,"b":882,"line":28,"col":14}]}}],"usedParamSet":{"sponsorOrg":true},"statement":{"body":"SELECT\n    so.key,\n    max(so.name) AS name,\n    array_agg(sso.school_id) AS school_ids,\n    array_agg(spo.key) AS student_partner_org_keys\nFROM\n    sponsor_orgs so\n    JOIN schools_sponsor_orgs sso ON so.id = sso.sponsor_org_id\n    JOIN student_partner_orgs_sponsor_orgs sposo ON so.id = sposo.sponsor_org_id\n    JOIN student_partner_orgs spo ON sposo.student_partner_org_id = spo.id\nWHERE\n    so.key = :sponsorOrg!\nGROUP BY\n    so.key","loc":{"a":467,"b":902,"line":17,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     so.key,
 *     max(so.name) AS name,
 *     array_agg(sso.school_id) AS school_ids,
 *     array_agg(spo.key) AS student_partner_org_keys
 * FROM
 *     sponsor_orgs so
 *     JOIN schools_sponsor_orgs sso ON so.id = sso.sponsor_org_id
 *     JOIN student_partner_orgs_sponsor_orgs sposo ON so.id = sposo.sponsor_org_id
 *     JOIN student_partner_orgs spo ON sposo.student_partner_org_id = spo.id
 * WHERE
 *     so.key = :sponsorOrg!
 * GROUP BY
 *     so.key
 * ```
 */
export const getSponsorOrgsByKey = new PreparedQuery<IGetSponsorOrgsByKeyParams,IGetSponsorOrgsByKeyResult>(getSponsorOrgsByKeyIR);


