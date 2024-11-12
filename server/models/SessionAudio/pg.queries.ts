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
  createdId: string;
}

/** 'CreateSessionAudio' query type */
export interface ICreateSessionAudioQuery {
  params: ICreateSessionAudioParams;
  result: ICreateSessionAudioResult;
}

const createSessionAudioIR: any = {"name":"createSessionAudio","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":278,"b":280,"line":12,"col":13}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":284,"b":293,"line":12,"col":19}]}},{"name":"resourceUri","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":297,"b":307,"line":12,"col":32}]}}],"usedParamSet":{"id":true,"sessionId":true,"resourceUri":true},"statement":{"body":"INSERT INTO session_audio (id, session_id, resource_uri, student_joined_at, volunteer_joined_at, created_at, updated_at)\n    VALUES (:id!, :sessionId!, :resourceUri, NULL, NULL, NOW(), NOW())\nRETURNING\n    id AS created_id","loc":{"a":144,"b":365,"line":11,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_audio (id, session_id, resource_uri, student_joined_at, volunteer_joined_at, created_at, updated_at)
 *     VALUES (:id!, :sessionId!, :resourceUri, NULL, NULL, NOW(), NOW())
 * RETURNING
 *     id AS created_id
 * ```
 */
export const createSessionAudio = new PreparedQuery<ICreateSessionAudioParams,ICreateSessionAudioResult>(createSessionAudioIR);


/** 'UpdateSessionAudioJoinedAtBySessionId' parameters type */
export interface IUpdateSessionAudioJoinedAtBySessionIdParams {
  sessionId: string;
  studentJoinedAt: Date | null | void;
  volunteerJoinedAt: Date | null | void;
}

/** 'UpdateSessionAudioJoinedAtBySessionId' return type */
export type IUpdateSessionAudioJoinedAtBySessionIdResult = void;

/** 'UpdateSessionAudioJoinedAtBySessionId' query type */
export interface IUpdateSessionAudioJoinedAtBySessionIdQuery {
  params: IUpdateSessionAudioJoinedAtBySessionIdParams;
  result: IUpdateSessionAudioJoinedAtBySessionIdResult;
}

const updateSessionAudioJoinedAtBySessionIdIR: any = {"name":"updateSessionAudioJoinedAtBySessionId","params":[{"name":"studentJoinedAt","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":483,"b":497,"line":21,"col":34}]}},{"name":"volunteerJoinedAt","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":556,"b":572,"line":22,"col":36}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":644,"b":653,"line":25,"col":18}]}}],"usedParamSet":{"studentJoinedAt":true,"volunteerJoinedAt":true,"sessionId":true},"statement":{"body":"UPDATE\n    session_audio\nSET\n    student_joined_at = COALESCE(:studentJoinedAt, student_joined_at),\n    volunteer_joined_at = COALESCE(:volunteerJoinedAt, volunteer_joined_at),\n    updated_at = NOW()\nWHERE\n    session_id = :sessionId!","loc":{"a":420,"b":653,"line":18,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     session_audio
 * SET
 *     student_joined_at = COALESCE(:studentJoinedAt, student_joined_at),
 *     volunteer_joined_at = COALESCE(:volunteerJoinedAt, volunteer_joined_at),
 *     updated_at = NOW()
 * WHERE
 *     session_id = :sessionId!
 * ```
 */
export const updateSessionAudioJoinedAtBySessionId = new PreparedQuery<IUpdateSessionAudioJoinedAtBySessionIdParams,IUpdateSessionAudioJoinedAtBySessionIdResult>(updateSessionAudioJoinedAtBySessionIdIR);


/** 'UpdateSessionAudioResourceUriBySessionId' parameters type */
export interface IUpdateSessionAudioResourceUriBySessionIdParams {
  resourceUri: string;
  sessionId: string;
}

/** 'UpdateSessionAudioResourceUriBySessionId' return type */
export type IUpdateSessionAudioResourceUriBySessionIdResult = void;

/** 'UpdateSessionAudioResourceUriBySessionId' query type */
export interface IUpdateSessionAudioResourceUriBySessionIdQuery {
  params: IUpdateSessionAudioResourceUriBySessionIdParams;
  result: IUpdateSessionAudioResourceUriBySessionIdResult;
}

const updateSessionAudioResourceUriBySessionIdIR: any = {"name":"updateSessionAudioResourceUriBySessionId","params":[{"name":"resourceUri","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":760,"b":771,"line":32,"col":20}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":821,"b":830,"line":35,"col":18}]}}],"usedParamSet":{"resourceUri":true,"sessionId":true},"statement":{"body":"UPDATE\n    session_audio\nSET\n    resource_uri = :resourceUri!,\n    updated_at = NOW()\nWHERE\n    session_id = :sessionId!","loc":{"a":711,"b":830,"line":29,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     session_audio
 * SET
 *     resource_uri = :resourceUri!,
 *     updated_at = NOW()
 * WHERE
 *     session_id = :sessionId!
 * ```
 */
export const updateSessionAudioResourceUriBySessionId = new PreparedQuery<IUpdateSessionAudioResourceUriBySessionIdParams,IUpdateSessionAudioResourceUriBySessionIdResult>(updateSessionAudioResourceUriBySessionIdIR);


