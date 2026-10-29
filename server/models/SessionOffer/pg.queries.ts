/** Types generated for queries found in "server/models/SessionOffer/session_offer.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'InsertSessionOffer' parameters type */
export interface IInsertSessionOfferParams {
  closedAt: DateOrString;
  id: string;
  offeredAt: DateOrString;
  outcome: string;
  output: Json;
  scorecardVersion: string;
  sessionId: string;
  volunteerId: string;
}

/** 'InsertSessionOffer' return type */
export interface IInsertSessionOfferResult {
  /** not_pii: Primary key */
  id: string;
}

/** 'InsertSessionOffer' query type */
export interface IInsertSessionOfferQuery {
  params: IInsertSessionOfferParams;
  result: IInsertSessionOfferResult;
}

const insertSessionOfferIR: any = {"usedParamSet":{"id":true,"sessionId":true,"volunteerId":true,"offeredAt":true,"outcome":true,"closedAt":true,"scorecardVersion":true,"output":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":129,"b":132}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":135,"b":145}]},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":148,"b":160}]},{"name":"offeredAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":163,"b":173}]},{"name":"outcome","required":true,"transform":{"type":"scalar"},"locs":[{"a":176,"b":184}]},{"name":"closedAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":187,"b":196}]},{"name":"scorecardVersion","required":true,"transform":{"type":"scalar"},"locs":[{"a":199,"b":216}]},{"name":"output","required":true,"transform":{"type":"scalar"},"locs":[{"a":219,"b":226}]}],"statement":"INSERT INTO session_offers (id, session_id, volunteer_id, offered_at, outcome, closed_at, scorecard_version, output)\n    VALUES (:id!, :sessionId!, :volunteerId!, :offeredAt!, :outcome!, :closedAt!, :scorecardVersion!, :output!)\nRETURNING\n    id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_offers (id, session_id, volunteer_id, offered_at, outcome, closed_at, scorecard_version, output)
 *     VALUES (:id!, :sessionId!, :volunteerId!, :offeredAt!, :outcome!, :closedAt!, :scorecardVersion!, :output!)
 * RETURNING
 *     id
 * ```
 */
export const insertSessionOffer = new PreparedQuery<IInsertSessionOfferParams,IInsertSessionOfferResult>(insertSessionOfferIR);


