/** Types generated for queries found in "server/models/ShareableDomains/shareableDomains.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetAllShareableDomains' parameters type */
export type IGetAllShareableDomainsParams = void;

/** 'GetAllShareableDomains' return type */
export interface IGetAllShareableDomainsResult {
  domain: string;
  id: number;
}

/** 'GetAllShareableDomains' query type */
export interface IGetAllShareableDomainsQuery {
  params: IGetAllShareableDomainsParams;
  result: IGetAllShareableDomainsResult;
}

const getAllShareableDomainsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    id,\n    DOMAIN\nFROM\n    shareable_domains"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     DOMAIN
 * FROM
 *     shareable_domains
 * ```
 */
export const getAllShareableDomains = new PreparedQuery<IGetAllShareableDomainsParams,IGetAllShareableDomainsResult>(getAllShareableDomainsIR);


