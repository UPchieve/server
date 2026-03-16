/** Types generated for queries found in "server/models/EmailDomainBlocklist/email-domain-blocklist.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetEmailDomainBlocklistEntry' parameters type */
export interface IGetEmailDomainBlocklistEntryParams {
  domain: string;
}

/** 'GetEmailDomainBlocklistEntry' return type */
export interface IGetEmailDomainBlocklistEntryResult {
  domain: string;
  id: number;
}

/** 'GetEmailDomainBlocklistEntry' query type */
export interface IGetEmailDomainBlocklistEntryQuery {
  params: IGetEmailDomainBlocklistEntryParams;
  result: IGetEmailDomainBlocklistEntryResult;
}

const getEmailDomainBlocklistEntryIR: any = {"usedParamSet":{"domain":true},"params":[{"name":"domain","required":true,"transform":{"type":"scalar"},"locs":[{"a":86,"b":93}]}],"statement":"SELECT\n    id,\n    DOMAIN\nFROM\n    upchieve.email_domain_blocklist\nWHERE\n    DOMAIN = :domain!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     DOMAIN
 * FROM
 *     upchieve.email_domain_blocklist
 * WHERE
 *     DOMAIN = :domain!
 * ```
 */
export const getEmailDomainBlocklistEntry = new PreparedQuery<IGetEmailDomainBlocklistEntryParams,IGetEmailDomainBlocklistEntryResult>(getEmailDomainBlocklistEntryIR);


