/** Types generated for queries found in "server/models/VolunteerPartnerOrg/volunteer_partner_orgs.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type stringArray = (string)[];

/** 'GetVolunteerPartnerOrgForRegistrationByKey' parameters type */
export interface IGetVolunteerPartnerOrgForRegistrationByKeyParams {
  key: string;
}

/** 'GetVolunteerPartnerOrgForRegistrationByKey' return type */
export interface IGetVolunteerPartnerOrgForRegistrationByKeyResult {
  domains: stringArray | null;
  key: string;
}

/** 'GetVolunteerPartnerOrgForRegistrationByKey' query type */
export interface IGetVolunteerPartnerOrgForRegistrationByKeyQuery {
  params: IGetVolunteerPartnerOrgForRegistrationByKeyParams;
  result: IGetVolunteerPartnerOrgForRegistrationByKeyResult;
}

const getVolunteerPartnerOrgForRegistrationByKeyIR: any = {"name":"getVolunteerPartnerOrgForRegistrationByKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":212,"b":215,"line":5,"col":11}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT key, ARRAY_AGG(domain) AS domains\nFROM volunteer_partner_orgs vpo\nJOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id\nWHERE key=:key!\nGROUP BY key","loc":{"a":55,"b":228,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT key, ARRAY_AGG(domain) AS domains
 * FROM volunteer_partner_orgs vpo
 * JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id
 * WHERE key=:key!
 * GROUP BY key
 * ```
 */
export const getVolunteerPartnerOrgForRegistrationByKey = new PreparedQuery<IGetVolunteerPartnerOrgForRegistrationByKeyParams,IGetVolunteerPartnerOrgForRegistrationByKeyResult>(getVolunteerPartnerOrgForRegistrationByKeyIR);


/** 'GetFullVolunteerPartnerOrgByKey' parameters type */
export interface IGetFullVolunteerPartnerOrgByKeyParams {
  key: string;
}

/** 'GetFullVolunteerPartnerOrgByKey' return type */
export interface IGetFullVolunteerPartnerOrgByKeyResult {
  domains: stringArray | null;
  key: string;
  name: string | null;
  receiveWeeklyHourSummaryEmail: boolean | null;
}

/** 'GetFullVolunteerPartnerOrgByKey' query type */
export interface IGetFullVolunteerPartnerOrgByKeyQuery {
  params: IGetFullVolunteerPartnerOrgByKeyParams;
  result: IGetFullVolunteerPartnerOrgByKeyResult;
}

const getFullVolunteerPartnerOrgByKeyIR: any = {"name":"getFullVolunteerPartnerOrgByKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":562,"b":565,"line":16,"col":11}]}}],"usedParamSet":{"key":true},"statement":{"body":"select \n       key,\n       max(name) as name,\n       bool_or(receive_weekly_hour_summary_email) as receive_weekly_hour_summary_email,\n       array_agg(domain) as domains\nfrom volunteer_partner_orgs vpo\njoin required_email_domains red on vpo.id = red.volunteer_partner_org_id\nwhere key=:key!\ngroup by vpo.key","loc":{"a":276,"b":582,"line":9,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * select 
 *        key,
 *        max(name) as name,
 *        bool_or(receive_weekly_hour_summary_email) as receive_weekly_hour_summary_email,
 *        array_agg(domain) as domains
 * from volunteer_partner_orgs vpo
 * join required_email_domains red on vpo.id = red.volunteer_partner_org_id
 * where key=:key!
 * group by vpo.key
 * ```
 */
export const getFullVolunteerPartnerOrgByKey = new PreparedQuery<IGetFullVolunteerPartnerOrgByKeyParams,IGetFullVolunteerPartnerOrgByKeyResult>(getFullVolunteerPartnerOrgByKeyIR);


/** 'GetVolunteerPartnerOrgs' parameters type */
export type IGetVolunteerPartnerOrgsParams = void;

/** 'GetVolunteerPartnerOrgs' return type */
export interface IGetVolunteerPartnerOrgsResult {
  domains: stringArray | null;
  key: string;
  name: string | null;
  receiveWeeklyHourSummaryEmail: boolean | null;
}

/** 'GetVolunteerPartnerOrgs' query type */
export interface IGetVolunteerPartnerOrgsQuery {
  params: IGetVolunteerPartnerOrgsParams;
  result: IGetVolunteerPartnerOrgsResult;
}

const getVolunteerPartnerOrgsIR: any = {"name":"getVolunteerPartnerOrgs","params":[],"usedParamSet":{},"statement":{"body":"select \n       key,\n       max(name) as name,\n       bool_or(receive_weekly_hour_summary_email) as receive_weekly_hour_summary_email,\n       array_agg(domain) as domains\nfrom volunteer_partner_orgs vpo\njoin required_email_domains red on vpo.id = red.volunteer_partner_org_id\ngroup by vpo.key","loc":{"a":622,"b":912,"line":20,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * select 
 *        key,
 *        max(name) as name,
 *        bool_or(receive_weekly_hour_summary_email) as receive_weekly_hour_summary_email,
 *        array_agg(domain) as domains
 * from volunteer_partner_orgs vpo
 * join required_email_domains red on vpo.id = red.volunteer_partner_org_id
 * group by vpo.key
 * ```
 */
export const getVolunteerPartnerOrgs = new PreparedQuery<IGetVolunteerPartnerOrgsParams,IGetVolunteerPartnerOrgsResult>(getVolunteerPartnerOrgsIR);


