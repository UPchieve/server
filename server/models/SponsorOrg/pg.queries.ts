/** Types generated for queries found in "server/models/SponsorOrg/sponsor_orgs.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type stringArray = (string)[];

/** 'GetSponsorOrgs' parameters type */
export type IGetSponsorOrgsParams = void;

/** 'GetSponsorOrgs' return type */
export interface IGetSponsorOrgsResult {
  key: string;
  name: string;
  schoolIds: stringArray | null;
  studentPartnerOrgIds: stringArray | null;
  studentPartnerOrgKeys: stringArray | null;
}

/** 'GetSponsorOrgs' query type */
export interface IGetSponsorOrgsQuery {
  params: IGetSponsorOrgsParams;
  result: IGetSponsorOrgsResult;
}

const getSponsorOrgsIR: any = {"name":"getSponsorOrgs","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    so.key,\n    so.name,\n    COALESCE(array_agg(sso.school_id) FILTER (WHERE sso.school_id IS NOT NULL), '{}') AS school_ids,\n    COALESCE(array_agg(spo.key) FILTER (WHERE spo.key IS NOT NULL), '{}') AS student_partner_org_keys,\n    COALESCE(array_agg(spo.id) FILTER (WHERE spo.id IS NOT NULL), '{}') AS student_partner_org_ids\nFROM\n    sponsor_orgs so\n    LEFT JOIN schools_sponsor_orgs sso ON so.id = sso.sponsor_org_id\n    LEFT JOIN student_partner_orgs_sponsor_orgs sposo ON so.id = sposo.sponsor_org_id\n    LEFT JOIN student_partner_orgs spo ON sposo.student_partner_org_id = spo.id\nGROUP BY\n    so.key, so.name","loc":{"a":27,"b":649,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     so.key,
 *     so.name,
 *     COALESCE(array_agg(sso.school_id) FILTER (WHERE sso.school_id IS NOT NULL), '{}') AS school_ids,
 *     COALESCE(array_agg(spo.key) FILTER (WHERE spo.key IS NOT NULL), '{}') AS student_partner_org_keys,
 *     COALESCE(array_agg(spo.id) FILTER (WHERE spo.id IS NOT NULL), '{}') AS student_partner_org_ids
 * FROM
 *     sponsor_orgs so
 *     LEFT JOIN schools_sponsor_orgs sso ON so.id = sso.sponsor_org_id
 *     LEFT JOIN student_partner_orgs_sponsor_orgs sposo ON so.id = sposo.sponsor_org_id
 *     LEFT JOIN student_partner_orgs spo ON sposo.student_partner_org_id = spo.id
 * GROUP BY
 *     so.key, so.name
 * ```
 */
export const getSponsorOrgs = new PreparedQuery<IGetSponsorOrgsParams,IGetSponsorOrgsResult>(getSponsorOrgsIR);


/** 'GetSponsorOrgsByKey' parameters type */
export interface IGetSponsorOrgsByKeyParams {
  sponsorOrg: string;
}

/** 'GetSponsorOrgsByKey' return type */
export interface IGetSponsorOrgsByKeyResult {
  key: string;
  name: string;
  schoolIds: stringArray | null;
  studentPartnerOrgIds: stringArray | null;
  studentPartnerOrgKeys: stringArray | null;
}

/** 'GetSponsorOrgsByKey' query type */
export interface IGetSponsorOrgsByKeyQuery {
  params: IGetSponsorOrgsByKeyParams;
  result: IGetSponsorOrgsByKeyResult;
}

const getSponsorOrgsByKeyIR: any = {"name":"getSponsorOrgsByKey","params":[{"name":"sponsorOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1301,"b":1311,"line":30,"col":14}]}}],"usedParamSet":{"sponsorOrg":true},"statement":{"body":"SELECT\n    so.key,\n    so.name,\n    COALESCE(array_agg(sso.school_id) FILTER (WHERE sso.school_id IS NOT NULL), '{}') AS school_ids,\n    COALESCE(array_agg(spo.key) FILTER (WHERE spo.key IS NOT NULL), '{}') AS student_partner_org_keys,\n    COALESCE(array_agg(spo.id) FILTER (WHERE spo.id IS NOT NULL), '{}') AS student_partner_org_ids\nFROM\n    sponsor_orgs so\n    LEFT JOIN schools_sponsor_orgs sso ON so.id = sso.sponsor_org_id\n    LEFT JOIN student_partner_orgs_sponsor_orgs sposo ON so.id = sposo.sponsor_org_id\n    LEFT JOIN student_partner_orgs spo ON sposo.student_partner_org_id = spo.id\nWHERE\n    so.key = :sponsorOrg!\nGROUP BY\n    so.key, so.name","loc":{"a":686,"b":1340,"line":18,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     so.key,
 *     so.name,
 *     COALESCE(array_agg(sso.school_id) FILTER (WHERE sso.school_id IS NOT NULL), '{}') AS school_ids,
 *     COALESCE(array_agg(spo.key) FILTER (WHERE spo.key IS NOT NULL), '{}') AS student_partner_org_keys,
 *     COALESCE(array_agg(spo.id) FILTER (WHERE spo.id IS NOT NULL), '{}') AS student_partner_org_ids
 * FROM
 *     sponsor_orgs so
 *     LEFT JOIN schools_sponsor_orgs sso ON so.id = sso.sponsor_org_id
 *     LEFT JOIN student_partner_orgs_sponsor_orgs sposo ON so.id = sposo.sponsor_org_id
 *     LEFT JOIN student_partner_orgs spo ON sposo.student_partner_org_id = spo.id
 * WHERE
 *     so.key = :sponsorOrg!
 * GROUP BY
 *     so.key, so.name
 * ```
 */
export const getSponsorOrgsByKey = new PreparedQuery<IGetSponsorOrgsByKeyParams,IGetSponsorOrgsByKeyResult>(getSponsorOrgsByKeyIR);


