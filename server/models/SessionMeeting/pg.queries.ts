/** Types generated for queries found in "server/models/SessionMeeting/session-meetings.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetSessionMeetingBySessionId' parameters type */
export interface IGetSessionMeetingBySessionIdParams {
  sessionId: string;
}

/** 'GetSessionMeetingBySessionId' return type */
export interface IGetSessionMeetingBySessionIdResult {
  createdAt: Date;
  externalId: string;
  id: string;
  provider: string;
  recordingId: string | null;
  sessionId: string;
  updatedAt: Date;
}

/** 'GetSessionMeetingBySessionId' query type */
export interface IGetSessionMeetingBySessionIdQuery {
  params: IGetSessionMeetingBySessionIdParams;
  result: IGetSessionMeetingBySessionIdResult;
}

const getSessionMeetingBySessionIdIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":62,"b":72}]}],"statement":"SELECT\n    *\nFROM\n    session_meetings\nWHERE\n    session_id = :sessionId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     session_meetings
 * WHERE
 *     session_id = :sessionId!
 * ```
 */
export const getSessionMeetingBySessionId = new PreparedQuery<IGetSessionMeetingBySessionIdParams,IGetSessionMeetingBySessionIdResult>(getSessionMeetingBySessionIdIR);


/** 'InsertSessionMeeting' parameters type */
export interface IInsertSessionMeetingParams {
  externalId: string;
  id: string;
  provider: string;
  sessionId: string;
}

/** 'InsertSessionMeeting' return type */
export interface IInsertSessionMeetingResult {
  createdAt: Date;
  externalId: string;
  id: string;
  provider: string;
  recordingId: string | null;
  sessionId: string;
  updatedAt: Date;
}

/** 'InsertSessionMeeting' query type */
export interface IInsertSessionMeetingQuery {
  params: IInsertSessionMeetingParams;
  result: IInsertSessionMeetingResult;
}

const insertSessionMeetingIR: any = {"usedParamSet":{"id":true,"externalId":true,"provider":true,"sessionId":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":105,"b":108}]},{"name":"externalId","required":true,"transform":{"type":"scalar"},"locs":[{"a":111,"b":122}]},{"name":"provider","required":true,"transform":{"type":"scalar"},"locs":[{"a":125,"b":134}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":137,"b":147}]}],"statement":"INSERT INTO session_meetings (id, external_id, provider, session_id, created_at, updated_at)\n    VALUES (:id!, :externalId!, :provider!, :sessionId!, NOW(), NOW())\nRETURNING\n    *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_meetings (id, external_id, provider, session_id, created_at, updated_at)
 *     VALUES (:id!, :externalId!, :provider!, :sessionId!, NOW(), NOW())
 * RETURNING
 *     *
 * ```
 */
export const insertSessionMeeting = new PreparedQuery<IInsertSessionMeetingParams,IInsertSessionMeetingResult>(insertSessionMeetingIR);


