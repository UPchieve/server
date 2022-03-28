/** Types generated for queries found in "server/models/SponsorOrg/sponsor_orgs.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type stringArray = (string)[];

/** 'GetSponsorOrgs' parameters type */
export type IGetSponsorOrgsParams = void;

/** 'GetSponsorOrgs' return type */
export interface IGetSponsorOrgsResult {
  key: string;
  name: string | null;
  schoolIds: stringArray | null;
  studentPartnerOrgKeys: stringArray | null;
}

/** 'GetSponsorOrgs' query type */
export interface IGetSponsorOrgsQuery {
  params: IGetSponsorOrgsParams;
  result: IGetSponsorOrgsResult;
}

const getSponsorOrgsIR: any = {"name":"getSponsorOrgs","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n       so.key,\n       max(so.name) as name,\n       array_agg(sso.school_id) as school_ids,\n       array_agg(spo.key) as student_partner_org_keys\nfrom sponsor_orgs so\njoin schools_sponsor_orgs sso on so.id = sso.sponsor_org_id\njoin student_partner_orgs_sponsor_orgs sposo on so.id = sposo.sponsor_org_id\njoin student_partner_orgs spo on sposo.student_partner_org_id = spo.id\ngroup by so.key","loc":{"a":27,"b":422,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *        so.key,
 *        max(so.name) as name,
 *        array_agg(sso.school_id) as school_ids,
 *        array_agg(spo.key) as student_partner_org_keys
 * from sponsor_orgs so
 * join schools_sponsor_orgs sso on so.id = sso.sponsor_org_id
 * join student_partner_orgs_sponsor_orgs sposo on so.id = sposo.sponsor_org_id
 * join student_partner_orgs spo on sposo.student_partner_org_id = spo.id
 * group by so.key
 * ```
 */
export const getSponsorOrgs = new PreparedQuery<IGetSponsorOrgsParams,IGetSponsorOrgsResult>(getSponsorOrgsIR);


