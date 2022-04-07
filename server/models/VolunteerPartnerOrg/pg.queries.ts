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

const getVolunteerPartnerOrgForRegistrationByKeyIR: any = {"name":"getVolunteerPartnerOrgForRegistrationByKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":367,"b":370,"line":12,"col":11}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n    KEY,\n    COALESCE(domains.domains, '{}'::text[]) as domains\nFROM\n    volunteer_partner_orgs vpo\n    LEFT JOIN LATERAL (\n      SELECT ARRAY_AGG(domain) as domains FROM required_email_domains\n      WHERE required_email_domains.volunteer_partner_org_id = vpo.id\n    ) AS domains ON true\nWHERE\n    KEY = :key!","loc":{"a":55,"b":370,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY,
 *     COALESCE(domains.domains, '{}'::text[]) as domains
 * FROM
 *     volunteer_partner_orgs vpo
 *     LEFT JOIN LATERAL (
 *       SELECT ARRAY_AGG(domain) as domains FROM required_email_domains
 *       WHERE required_email_domains.volunteer_partner_org_id = vpo.id
 *     ) AS domains ON true
 * WHERE
 *     KEY = :key!
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

const getFullVolunteerPartnerOrgByKeyIR: any = {"name":"getFullVolunteerPartnerOrgByKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":711,"b":714,"line":25,"col":11}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n    KEY,\n    max(name) AS name,\n    bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,\n    array_agg(DOMAIN) AS domains\nFROM\n    volunteer_partner_orgs vpo\n    LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id\nWHERE\n    KEY = :key!\nGROUP BY\n    vpo.key","loc":{"a":419,"b":735,"line":16,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY,
 *     max(name) AS name,
 *     bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,
 *     array_agg(DOMAIN) AS domains
 * FROM
 *     volunteer_partner_orgs vpo
 *     LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id
 * WHERE
 *     KEY = :key!
 * GROUP BY
 *     vpo.key
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

const getVolunteerPartnerOrgsIR: any = {"name":"getVolunteerPartnerOrgs","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    KEY,\n    max(name) AS name,\n    bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,\n    array_agg(DOMAIN) AS domains\nFROM\n    volunteer_partner_orgs vpo\n    LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id\nGROUP BY\n    vpo.key","loc":{"a":776,"b":1070,"line":31,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY,
 *     max(name) AS name,
 *     bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,
 *     array_agg(DOMAIN) AS domains
 * FROM
 *     volunteer_partner_orgs vpo
 *     LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id
 * GROUP BY
 *     vpo.key
 * ```
 */
export const getVolunteerPartnerOrgs = new PreparedQuery<IGetVolunteerPartnerOrgsParams,IGetVolunteerPartnerOrgsResult>(getVolunteerPartnerOrgsIR);


