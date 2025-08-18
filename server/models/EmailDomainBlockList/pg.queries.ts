/** Types generated for queries found in "server/models/EmailDomainBlockList/email_domain_blocklist.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** Query 'GetBlockedEmailDomainByDomain' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetBlockedEmailDomainByDomainResult = never;

/** Query 'GetBlockedEmailDomainByDomain' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetBlockedEmailDomainByDomainParams = never;

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


