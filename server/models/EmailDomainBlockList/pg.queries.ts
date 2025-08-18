/** Types generated for queries found in "server/models/EmailDomainBlockList/email_domain_blocklist.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetBlockedEmailDomainByDomain' parameters type */
export interface IGetBlockedEmailDomainByDomainParams {
  email_domain: string;
}

/** 'GetBlockedEmailDomainByDomain' return type */
export interface IGetBlockedEmailDomainByDomainResult {
  domain: string;
}

/** 'GetBlockedEmailDomainByDomain' query type */
export interface IGetBlockedEmailDomainByDomainQuery {
  params: IGetBlockedEmailDomainByDomainParams;
  result: IGetBlockedEmailDomainByDomainResult;
}

const getBlockedEmailDomainByDomainIR: any = {"usedParamSet":{"email_domain":true},"params":[{"name":"email_domain","required":true,"transform":{"type":"scalar"},"locs":[{"a":69,"b":82}]}],"statement":"SELECT\n    DOMAIN\nFROM\n    email_domain_blocklist\nWHERE\n    DOMAIN = :email_domain!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     DOMAIN
 * FROM
 *     email_domain_blocklist
 * WHERE
 *     DOMAIN = :email_domain!
 * ```
 */
export const getBlockedEmailDomainByDomain = new PreparedQuery<IGetBlockedEmailDomainByDomainParams,IGetBlockedEmailDomainByDomainResult>(getBlockedEmailDomainByDomainIR);


