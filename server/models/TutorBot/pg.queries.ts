/** Types generated for queries found in "server/models/TutorBot/tutor-bot.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type tutor_bot_conversation_user_type = 'bot' | 'student' | 'volunteer';

/** 'GetTutorBotConversationsByUserId' parameters type */
export interface IGetTutorBotConversationsByUserIdParams {
  userId: string;
}

/** 'GetTutorBotConversationsByUserId' return type */
export interface IGetTutorBotConversationsByUserIdResult {
  createdAt: Date;
  id: string;
  messagePreview: string;
  sessionId: string | null;
  subjectId: number;
  updatedAt: Date;
  userId: string;
}

/** 'GetTutorBotConversationsByUserId' query type */
export interface IGetTutorBotConversationsByUserIdQuery {
  params: IGetTutorBotConversationsByUserIdParams;
  result: IGetTutorBotConversationsByUserIdResult;
}

const getTutorBotConversationsByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":331,"b":338},{"a":567,"b":574}]}],"statement":"WITH ranked_on_created_at AS (\n    SELECT\n        tbcm.*,\n        row_number() OVER (PARTITION BY tbcm.tutor_bot_conversation_id ORDER BY tbcm.created_at) AS rn\n    FROM\n        tutor_bot_conversation_messages tbcm\n        JOIN tutor_bot_conversations tbc ON tbc.id = tbcm.tutor_bot_conversation_id\n    WHERE\n        tbc.user_id = :userId!\n)\nSELECT\n    tbc.*,\n    ranked.message AS message_preview\nFROM\n    tutor_bot_conversations tbc\n    JOIN ranked_on_created_at ranked ON ranked.tutor_bot_conversation_id = tbc.id\n        AND ranked.rn = 1\nWHERE\n    tbc.user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * WITH ranked_on_created_at AS (
 *     SELECT
 *         tbcm.*,
 *         row_number() OVER (PARTITION BY tbcm.tutor_bot_conversation_id ORDER BY tbcm.created_at) AS rn
 *     FROM
 *         tutor_bot_conversation_messages tbcm
 *         JOIN tutor_bot_conversations tbc ON tbc.id = tbcm.tutor_bot_conversation_id
 *     WHERE
 *         tbc.user_id = :userId!
 * )
 * SELECT
 *     tbc.*,
 *     ranked.message AS message_preview
 * FROM
 *     tutor_bot_conversations tbc
 *     JOIN ranked_on_created_at ranked ON ranked.tutor_bot_conversation_id = tbc.id
 *         AND ranked.rn = 1
 * WHERE
 *     tbc.user_id = :userId!
 * ```
 */
export const getTutorBotConversationsByUserId = new PreparedQuery<IGetTutorBotConversationsByUserIdParams,IGetTutorBotConversationsByUserIdResult>(getTutorBotConversationsByUserIdIR);


/** 'GetTutorBotConversationById' parameters type */
export interface IGetTutorBotConversationByIdParams {
  conversationId: string;
}

/** 'GetTutorBotConversationById' return type */
export interface IGetTutorBotConversationByIdResult {
  createdAt: Date;
  id: string;
  sessionId: string | null;
  subjectId: number;
  updatedAt: Date;
  userId: string;
}

/** 'GetTutorBotConversationById' query type */
export interface IGetTutorBotConversationByIdQuery {
  params: IGetTutorBotConversationByIdParams;
  result: IGetTutorBotConversationByIdResult;
}

const getTutorBotConversationByIdIR: any = {"usedParamSet":{"conversationId":true},"params":[{"name":"conversationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":61,"b":76}]}],"statement":"SELECT\n    *\nFROM\n    tutor_bot_conversations\nWHERE\n    id = :conversationId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     tutor_bot_conversations
 * WHERE
 *     id = :conversationId!
 * ```
 */
export const getTutorBotConversationById = new PreparedQuery<IGetTutorBotConversationByIdParams,IGetTutorBotConversationByIdResult>(getTutorBotConversationByIdIR);


/** 'GetTutorBotConversationBySessionId' parameters type */
export interface IGetTutorBotConversationBySessionIdParams {
  sessionId: string;
}

/** 'GetTutorBotConversationBySessionId' return type */
export interface IGetTutorBotConversationBySessionIdResult {
  createdAt: Date;
  id: string;
  sessionId: string | null;
  subjectId: number;
  updatedAt: Date;
  userId: string;
}

/** 'GetTutorBotConversationBySessionId' query type */
export interface IGetTutorBotConversationBySessionIdQuery {
  params: IGetTutorBotConversationBySessionIdParams;
  result: IGetTutorBotConversationBySessionIdResult;
}

const getTutorBotConversationBySessionIdIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":69,"b":79}]}],"statement":"SELECT\n    *\nFROM\n    tutor_bot_conversations\nWHERE\n    session_id = :sessionId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     tutor_bot_conversations
 * WHERE
 *     session_id = :sessionId!
 * ```
 */
export const getTutorBotConversationBySessionId = new PreparedQuery<IGetTutorBotConversationBySessionIdParams,IGetTutorBotConversationBySessionIdResult>(getTutorBotConversationBySessionIdIR);


/** 'GetTutorBotConversationMessagesById' parameters type */
export interface IGetTutorBotConversationMessagesByIdParams {
  conversationId: string;
}

/** 'GetTutorBotConversationMessagesById' return type */
export interface IGetTutorBotConversationMessagesByIdResult {
  createdAt: Date;
  message: string;
  senderUserType: tutor_bot_conversation_user_type;
  tutorBotConversationId: string;
  userId: string;
}

/** 'GetTutorBotConversationMessagesById' query type */
export interface IGetTutorBotConversationMessagesByIdQuery {
  params: IGetTutorBotConversationMessagesByIdParams;
  result: IGetTutorBotConversationMessagesByIdResult;
}

const getTutorBotConversationMessagesByIdIR: any = {"usedParamSet":{"conversationId":true},"params":[{"name":"conversationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":92,"b":107}]}],"statement":"SELECT\n    *\nFROM\n    tutor_bot_conversation_messages\nWHERE\n    tutor_bot_conversation_id = :conversationId!\nORDER BY\n    created_at ASC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     tutor_bot_conversation_messages
 * WHERE
 *     tutor_bot_conversation_id = :conversationId!
 * ORDER BY
 *     created_at ASC
 * ```
 */
export const getTutorBotConversationMessagesById = new PreparedQuery<IGetTutorBotConversationMessagesByIdParams,IGetTutorBotConversationMessagesByIdResult>(getTutorBotConversationMessagesByIdIR);


/** 'InsertTutorBotConversation' parameters type */
export interface IInsertTutorBotConversationParams {
  id: string;
  sessionId?: string | null | void;
  subjectId: number;
  userId: string;
}

/** 'InsertTutorBotConversation' return type */
export interface IInsertTutorBotConversationResult {
  id: string;
}

/** 'InsertTutorBotConversation' query type */
export interface IInsertTutorBotConversationQuery {
  params: IInsertTutorBotConversationParams;
  result: IInsertTutorBotConversationResult;
}

const insertTutorBotConversationIR: any = {"usedParamSet":{"id":true,"userId":true,"sessionId":true,"subjectId":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":110,"b":113}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":116,"b":123}]},{"name":"sessionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":126,"b":135}]},{"name":"subjectId","required":true,"transform":{"type":"scalar"},"locs":[{"a":152,"b":162}]}],"statement":"INSERT INTO tutor_bot_conversations (id, user_id, session_id, created_at, updated_at, subject_id)\n    VALUES (:id!, :userId!, :sessionId, NOW(), NOW(), :subjectId!)\nRETURNING\n    id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO tutor_bot_conversations (id, user_id, session_id, created_at, updated_at, subject_id)
 *     VALUES (:id!, :userId!, :sessionId, NOW(), NOW(), :subjectId!)
 * RETURNING
 *     id
 * ```
 */
export const insertTutorBotConversation = new PreparedQuery<IInsertTutorBotConversationParams,IInsertTutorBotConversationResult>(insertTutorBotConversationIR);


/** 'InsertTutorBotConversationMessage' parameters type */
export interface IInsertTutorBotConversationMessageParams {
  conversationId: string;
  message: string;
  senderUserType: tutor_bot_conversation_user_type;
  userId: string;
}

/** 'InsertTutorBotConversationMessage' return type */
export interface IInsertTutorBotConversationMessageResult {
  createdAt: Date;
  message: string;
  senderUserType: tutor_bot_conversation_user_type;
  tutorBotConversationId: string;
  userId: string;
}

/** 'InsertTutorBotConversationMessage' query type */
export interface IInsertTutorBotConversationMessageQuery {
  params: IInsertTutorBotConversationMessageParams;
  result: IInsertTutorBotConversationMessageResult;
}

const insertTutorBotConversationMessageIR: any = {"usedParamSet":{"conversationId":true,"userId":true,"senderUserType":true,"message":true},"params":[{"name":"conversationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":132,"b":147}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":150,"b":157}]},{"name":"senderUserType","required":true,"transform":{"type":"scalar"},"locs":[{"a":160,"b":175}]},{"name":"message","required":true,"transform":{"type":"scalar"},"locs":[{"a":178,"b":186}]}],"statement":"INSERT INTO tutor_bot_conversation_messages (tutor_bot_conversation_id, user_id, sender_user_type, message, created_at)\n    VALUES (:conversationId!, :userId!, :senderUserType!, :message!, CLOCK_TIMESTAMP())\nRETURNING\n    tutor_bot_conversation_id, user_id, sender_user_type, message, created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO tutor_bot_conversation_messages (tutor_bot_conversation_id, user_id, sender_user_type, message, created_at)
 *     VALUES (:conversationId!, :userId!, :senderUserType!, :message!, CLOCK_TIMESTAMP())
 * RETURNING
 *     tutor_bot_conversation_id, user_id, sender_user_type, message, created_at
 * ```
 */
export const insertTutorBotConversationMessage = new PreparedQuery<IInsertTutorBotConversationMessageParams,IInsertTutorBotConversationMessageResult>(insertTutorBotConversationMessageIR);


/** 'UpdateTutorBotConversationSessionId' parameters type */
export interface IUpdateTutorBotConversationSessionIdParams {
  conversationId: string;
  sessionId: string;
}

/** 'UpdateTutorBotConversationSessionId' return type */
export type IUpdateTutorBotConversationSessionIdResult = void;

/** 'UpdateTutorBotConversationSessionId' query type */
export interface IUpdateTutorBotConversationSessionIdQuery {
  params: IUpdateTutorBotConversationSessionIdParams;
  result: IUpdateTutorBotConversationSessionIdResult;
}

const updateTutorBotConversationSessionIdIR: any = {"usedParamSet":{"sessionId":true,"conversationId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":56,"b":66}]},{"name":"conversationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":107,"b":122}]}],"statement":"UPDATE\n    tutor_bot_conversations\nSET\n    session_id = :sessionId!,\n    updated_at = NOW()\nWHERE\n    id = :conversationId!::uuid\n    AND session_id IS NULL"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     tutor_bot_conversations
 * SET
 *     session_id = :sessionId!,
 *     updated_at = NOW()
 * WHERE
 *     id = :conversationId!::uuid
 *     AND session_id IS NULL
 * ```
 */
export const updateTutorBotConversationSessionId = new PreparedQuery<IUpdateTutorBotConversationSessionIdParams,IUpdateTutorBotConversationSessionIdResult>(updateTutorBotConversationSessionIdIR);


