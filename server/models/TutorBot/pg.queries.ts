/** Types generated for queries found in "server/models/TutorBot/tutor-bot.sql" */
import { PreparedQuery } from '@pgtyped/query';

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

const getTutorBotConversationsByUserIdIR: any = {"name":"getTutorBotConversationsByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":377,"b":383,"line":10,"col":23},{"a":613,"b":619,"line":20,"col":19}]}}],"usedParamSet":{"userId":true},"statement":{"body":"WITH ranked_on_created_at AS (\n    SELECT\n        tbcm.*,\n        row_number() OVER (PARTITION BY tbcm.tutor_bot_conversation_id ORDER BY tbcm.created_at) AS rn\n    FROM\n        tutor_bot_conversation_messages tbcm\n        JOIN tutor_bot_conversations tbc ON tbc.id = tbcm.tutor_bot_conversation_id\n    WHERE\n        tbc.user_id = :userId!\n)\nSELECT\n    tbc.*,\n    ranked.message AS message_preview\nFROM\n    tutor_bot_conversations tbc\n    JOIN ranked_on_created_at ranked ON ranked.tutor_bot_conversation_id = tbc.id\n        AND ranked.rn = 1\nWHERE\n    tbc.user_id = :userId!","loc":{"a":45,"b":619,"line":2,"col":0}}};

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

const getTutorBotConversationByIdIR: any = {"name":"getTutorBotConversationById","params":[{"name":"conversationId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":726,"b":740,"line":29,"col":10}]}}],"usedParamSet":{"conversationId":true},"statement":{"body":"SELECT\n    *\nFROM\n    tutor_bot_conversations\nWHERE\n    id = :conversationId!","loc":{"a":664,"b":740,"line":24,"col":0}}};

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

const getTutorBotConversationMessagesByIdIR: any = {"name":"getTutorBotConversationMessagesById","params":[{"name":"conversationId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":886,"b":900,"line":38,"col":33}]}}],"usedParamSet":{"conversationId":true},"statement":{"body":"SELECT\n    *\nFROM\n    tutor_bot_conversation_messages\nWHERE\n    tutor_bot_conversation_id = :conversationId!\nORDER BY\n    created_at ASC","loc":{"a":793,"b":928,"line":33,"col":0}}};

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
  sessionId: string | null | void;
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

const insertTutorBotConversationIR: any = {"name":"insertTutorBotConversation","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1083,"b":1085,"line":45,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1089,"b":1095,"line":45,"col":19}]}},{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1099,"b":1107,"line":45,"col":29}]}},{"name":"subjectId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1125,"b":1134,"line":45,"col":55}]}}],"usedParamSet":{"id":true,"userId":true,"sessionId":true,"subjectId":true},"statement":{"body":"INSERT INTO tutor_bot_conversations (id, user_id, session_id, created_at, updated_at, subject_id)\n    VALUES (:id!, :userId!, :sessionId, NOW(), NOW(), :subjectId!)\nRETURNING\n    id","loc":{"a":972,"b":1152,"line":44,"col":0}}};

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

const insertTutorBotConversationMessageIR: any = {"name":"insertTutorBotConversationMessage","params":[{"name":"conversationId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1336,"b":1350,"line":52,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1354,"b":1360,"line":52,"col":31}]}},{"name":"senderUserType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1364,"b":1378,"line":52,"col":41}]}},{"name":"message","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1382,"b":1389,"line":52,"col":59}]}}],"usedParamSet":{"conversationId":true,"userId":true,"senderUserType":true,"message":true},"statement":{"body":"INSERT INTO tutor_bot_conversation_messages (tutor_bot_conversation_id, user_id, sender_user_type, message, created_at)\n    VALUES (:conversationId!, :userId!, :senderUserType!, :message!, NOW())\nRETURNING\n    tutor_bot_conversation_id, user_id, sender_user_type, message, created_at","loc":{"a":1203,"b":1485,"line":51,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO tutor_bot_conversation_messages (tutor_bot_conversation_id, user_id, sender_user_type, message, created_at)
 *     VALUES (:conversationId!, :userId!, :senderUserType!, :message!, NOW())
 * RETURNING
 *     tutor_bot_conversation_id, user_id, sender_user_type, message, created_at
 * ```
 */
export const insertTutorBotConversationMessage = new PreparedQuery<IInsertTutorBotConversationMessageParams,IInsertTutorBotConversationMessageResult>(insertTutorBotConversationMessageIR);


