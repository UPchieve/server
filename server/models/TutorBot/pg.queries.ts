/** Types generated for queries found in "server/models/TutorBot/tutor-bot.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type tutor_bot_conversation_user_type = 'bot' | 'student' | 'volunteer';

/** 'GetTutorBotConversationById' parameters type */
export interface IGetTutorBotConversationByIdParams {
  conversationId: string;
}

/** 'GetTutorBotConversationById' return type */
export interface IGetTutorBotConversationByIdResult {
  /** not_pii */
  createdAt: Date;
  /** not_pii: Primary key */
  id: string;
  /** not_pii: Foreign key to upchieve.sessions */
  sessionId: string | null;
  /** not_pii: Foreign key to upchieve.subjects */
  subjectId: number;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'GetTutorBotConversationById' query type */
export interface IGetTutorBotConversationByIdQuery {
  params: IGetTutorBotConversationByIdParams;
  result: IGetTutorBotConversationByIdResult;
}

const getTutorBotConversationByIdIR: any = {"usedParamSet":{"conversationId":true},"params":[{"name":"conversationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":123,"b":138}]}],"statement":"SELECT\n    id,\n    user_id,\n    session_id,\n    created_at,\n    subject_id\nFROM\n    tutor_bot_conversations\nWHERE\n    id = :conversationId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     user_id,
 *     session_id,
 *     created_at,
 *     subject_id
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
  /** not_pii */
  createdAt: Date;
  /** not_pii: Primary key */
  id: string;
  /** not_pii: Foreign key to upchieve.sessions */
  sessionId: string | null;
  /** not_pii: Foreign key to upchieve.subjects */
  subjectId: number;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'GetTutorBotConversationBySessionId' query type */
export interface IGetTutorBotConversationBySessionIdQuery {
  params: IGetTutorBotConversationBySessionIdParams;
  result: IGetTutorBotConversationBySessionIdResult;
}

const getTutorBotConversationBySessionIdIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":131,"b":141}]}],"statement":"SELECT\n    id,\n    user_id,\n    session_id,\n    created_at,\n    subject_id\nFROM\n    tutor_bot_conversations\nWHERE\n    session_id = :sessionId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     user_id,
 *     session_id,
 *     created_at,
 *     subject_id
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
  /** not_pii */
  createdAt: Date;
  /** not_pii: Message text content */
  message: string;
  /** not_pii: Role of the message sender (student, bot, or volunteer) */
  senderUserType: tutor_bot_conversation_user_type;
  /** not_pii: Foreign key to upchieve.tutor_bot_conversations */
  tutorBotConversationId: string;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'GetTutorBotConversationMessagesById' query type */
export interface IGetTutorBotConversationMessagesByIdQuery {
  params: IGetTutorBotConversationMessagesByIdParams;
  result: IGetTutorBotConversationMessagesByIdResult;
}

const getTutorBotConversationMessagesByIdIR: any = {"usedParamSet":{"conversationId":true},"params":[{"name":"conversationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":180,"b":195}]}],"statement":"SELECT\n    tutor_bot_conversation_id,\n    user_id,\n    sender_user_type,\n    message,\n    created_at\nFROM\n    tutor_bot_conversation_messages\nWHERE\n    tutor_bot_conversation_id = :conversationId!\nORDER BY\n    created_at ASC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     tutor_bot_conversation_id,
 *     user_id,
 *     sender_user_type,
 *     message,
 *     created_at
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
  /** not_pii: Primary key */
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
  /** not_pii */
  createdAt: Date;
  /** not_pii: Message text content */
  message: string;
  /** not_pii: Role of the message sender (student, bot, or volunteer) */
  senderUserType: tutor_bot_conversation_user_type;
  /** not_pii: Foreign key to upchieve.tutor_bot_conversations */
  tutorBotConversationId: string;
  /** not_pii: Foreign key to upchieve.users */
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


