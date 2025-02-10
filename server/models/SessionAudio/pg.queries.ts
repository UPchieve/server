/** Types generated for queries found in "server/models/SessionAudio/session-audio.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

/** 'GetSessionAudioBySessionId' parameters type */
export interface IGetSessionAudioBySessionIdParams {
  sessionId: string;
}

/** 'GetSessionAudioBySessionId' return type */
export interface IGetSessionAudioBySessionIdResult {
  createdAt: Date;
  id: string;
  resourceUri: string | null;
  sessionId: string;
  studentJoinedAt: Date | null;
  updatedAt: Date;
  volunteerJoinedAt: Date | null;
}

/** 'GetSessionAudioBySessionId' query type */
export interface IGetSessionAudioBySessionIdQuery {
  params: IGetSessionAudioBySessionIdParams;
  result: IGetSessionAudioBySessionIdResult;
}

const getSessionAudioBySessionIdIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":59,"b":69}]}],"statement":"SELECT\n    *\nFROM\n    session_audio\nWHERE\n    session_id = :sessionId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     session_audio
 * WHERE
 *     session_id = :sessionId!
 * ```
 */
export const getSessionAudioBySessionId = new PreparedQuery<IGetSessionAudioBySessionIdParams,IGetSessionAudioBySessionIdResult>(getSessionAudioBySessionIdIR);


/** 'CreateSessionAudio' parameters type */
export interface ICreateSessionAudioParams {
  id: string;
  resourceUri?: string | null | void;
  sessionId: string;
  studentJoinedAt?: DateOrString | null | void;
  volunteerJoinedAt?: DateOrString | null | void;
}

/** 'CreateSessionAudio' return type */
export interface ICreateSessionAudioResult {
  createdAt: Date;
  id: string;
  resourceUri: string | null;
  sessionId: string;
  studentJoinedAt: Date | null;
  updatedAt: Date;
  volunteerJoinedAt: Date | null;
}

/** 'CreateSessionAudio' query type */
export interface ICreateSessionAudioQuery {
  params: ICreateSessionAudioParams;
  result: ICreateSessionAudioResult;
}

const createSessionAudioIR: any = {"usedParamSet":{"id":true,"sessionId":true,"resourceUri":true,"studentJoinedAt":true,"volunteerJoinedAt":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":133,"b":136}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":139,"b":149}]},{"name":"resourceUri","required":false,"transform":{"type":"scalar"},"locs":[{"a":152,"b":163}]},{"name":"studentJoinedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":166,"b":181}]},{"name":"volunteerJoinedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":184,"b":201}]}],"statement":"INSERT INTO session_audio (id, session_id, resource_uri, student_joined_at, volunteer_joined_at, created_at, updated_at)\n    VALUES (:id!, :sessionId!, :resourceUri, :studentJoinedAt, :volunteerJoinedAt, NOW(), NOW())\nRETURNING\n    *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_audio (id, session_id, resource_uri, student_joined_at, volunteer_joined_at, created_at, updated_at)
 *     VALUES (:id!, :sessionId!, :resourceUri, :studentJoinedAt, :volunteerJoinedAt, NOW(), NOW())
 * RETURNING
 *     *
 * ```
 */
export const createSessionAudio = new PreparedQuery<ICreateSessionAudioParams,ICreateSessionAudioResult>(createSessionAudioIR);


/** 'UpdateSessionAudio' parameters type */
export interface IUpdateSessionAudioParams {
  resourceUri?: string | null | void;
  sessionId: string;
  studentJoinedAt?: DateOrString | null | void;
  volunteerJoinedAt?: DateOrString | null | void;
}

/** 'UpdateSessionAudio' return type */
export interface IUpdateSessionAudioResult {
  createdAt: Date;
  id: string;
  resourceUri: string | null;
  sessionId: string;
  studentJoinedAt: Date | null;
  updatedAt: Date;
  volunteerJoinedAt: Date | null;
}

/** 'UpdateSessionAudio' query type */
export interface IUpdateSessionAudioQuery {
  params: IUpdateSessionAudioParams;
  result: IUpdateSessionAudioResult;
}

const updateSessionAudioIR: any = {"usedParamSet":{"studentJoinedAt":true,"volunteerJoinedAt":true,"resourceUri":true,"sessionId":true},"params":[{"name":"studentJoinedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":62,"b":77}]},{"name":"volunteerJoinedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":135,"b":152}]},{"name":"resourceUri","required":false,"transform":{"type":"scalar"},"locs":[{"a":205,"b":216}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":280,"b":290}]}],"statement":"UPDATE\n    session_audio\nSET\n    student_joined_at = COALESCE(:studentJoinedAt, student_joined_at),\n    volunteer_joined_at = COALESCE(:volunteerJoinedAt, volunteer_joined_at),\n    resource_uri = COALESCE(:resourceUri, resource_uri),\n    updated_at = NOW()\nWHERE\n    session_id = :sessionId!\nRETURNING\n    *"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     session_audio
 * SET
 *     student_joined_at = COALESCE(:studentJoinedAt, student_joined_at),
 *     volunteer_joined_at = COALESCE(:volunteerJoinedAt, volunteer_joined_at),
 *     resource_uri = COALESCE(:resourceUri, resource_uri),
 *     updated_at = NOW()
 * WHERE
 *     session_id = :sessionId!
 * RETURNING
 *     *
 * ```
 */
export const updateSessionAudio = new PreparedQuery<IUpdateSessionAudioParams,IUpdateSessionAudioResult>(updateSessionAudioIR);


