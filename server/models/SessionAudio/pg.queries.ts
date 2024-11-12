/** Types generated for queries found in "server/models/SessionAudio/session-audio.sql" */
import { PreparedQuery } from '@pgtyped/query';

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

const getSessionAudioBySessionIdIR: any = {"name":"getSessionAudioBySessionId","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":99,"b":108,"line":7,"col":18}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    *\nFROM\n    session_audio\nWHERE\n    session_id = :sessionId!","loc":{"a":39,"b":108,"line":2,"col":0}}};

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
  resourceUri: string | null | void;
  sessionId: string;
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

const createSessionAudioIR: any = {"name":"createSessionAudio","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":278,"b":280,"line":12,"col":13}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":284,"b":293,"line":12,"col":19}]}},{"name":"resourceUri","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":297,"b":307,"line":12,"col":32}]}}],"usedParamSet":{"id":true,"sessionId":true,"resourceUri":true},"statement":{"body":"INSERT INTO session_audio (id, session_id, resource_uri, student_joined_at, volunteer_joined_at, created_at, updated_at)\n    VALUES (:id!, :sessionId!, :resourceUri, NULL, NULL, NOW(), NOW())\nRETURNING\n    *","loc":{"a":144,"b":350,"line":11,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_audio (id, session_id, resource_uri, student_joined_at, volunteer_joined_at, created_at, updated_at)
 *     VALUES (:id!, :sessionId!, :resourceUri, NULL, NULL, NOW(), NOW())
 * RETURNING
 *     *
 * ```
 */
export const createSessionAudio = new PreparedQuery<ICreateSessionAudioParams,ICreateSessionAudioResult>(createSessionAudioIR);


/** 'UpdateSessionAudio' parameters type */
export interface IUpdateSessionAudioParams {
  resourceUri: string | null | void;
  sessionId: string;
  studentJoinedAt: Date | null | void;
  volunteerJoinedAt: Date | null | void;
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

const updateSessionAudioIR: any = {"name":"updateSessionAudio","params":[{"name":"studentJoinedAt","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":449,"b":463,"line":21,"col":34}]}},{"name":"volunteerJoinedAt","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":522,"b":538,"line":22,"col":36}]}},{"name":"resourceUri","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":592,"b":602,"line":23,"col":29}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":667,"b":676,"line":26,"col":18}]}}],"usedParamSet":{"studentJoinedAt":true,"volunteerJoinedAt":true,"resourceUri":true,"sessionId":true},"statement":{"body":"UPDATE\n    session_audio\nSET\n    student_joined_at = COALESCE(:studentJoinedAt, student_joined_at),\n    volunteer_joined_at = COALESCE(:volunteerJoinedAt, volunteer_joined_at),\n    resource_uri = COALESCE(:resourceUri, resource_uri),\n    updated_at = NOW()\nWHERE\n    session_id = :sessionId!\nRETURNING\n    *","loc":{"a":386,"b":692,"line":18,"col":0}}};

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


