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

const getTutorBotConversationsByUserIdIR: any = {"name":"getTutorBotConversationsByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":112,"b":118,"line":7,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    *\nFROM\n    tutor_bot_conversations\nWHERE\n    user_id = :userId!","loc":{"a":45,"b":118,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     tutor_bot_conversations
 * WHERE
 *     user_id = :userId!
 * ```
 */
export const getTutorBotConversationsByUserId = new PreparedQuery<IGetTutorBotConversationsByUserIdParams,IGetTutorBotConversationsByUserIdResult>(getTutorBotConversationsByUserIdIR);


/** 'GetTutorBotConversationMessagesByConversationId' parameters type */
export interface IGetTutorBotConversationMessagesByConversationIdParams {
  conversationId: string;
}

/** 'GetTutorBotConversationMessagesByConversationId' return type */
export interface IGetTutorBotConversationMessagesByConversationIdResult {
  createdAt: Date;
  message: string;
  senderUserType: tutor_bot_conversation_user_type;
  tutorBotConversationId: string;
  userId: string;
}

/** 'GetTutorBotConversationMessagesByConversationId' query type */
export interface IGetTutorBotConversationMessagesByConversationIdQuery {
  params: IGetTutorBotConversationMessagesByConversationIdParams;
  result: IGetTutorBotConversationMessagesByConversationIdResult;
}

const getTutorBotConversationMessagesByConversationIdIR: any = {"name":"getTutorBotConversationMessagesByConversationId","params":[{"name":"conversationId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":276,"b":290,"line":16,"col":33}]}}],"usedParamSet":{"conversationId":true},"statement":{"body":"SELECT\n    *\nFROM\n    tutor_bot_conversation_messages\nWHERE\n    tutor_bot_conversation_id = :conversationId!","loc":{"a":183,"b":290,"line":11,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     tutor_bot_conversation_messages
 * WHERE
 *     tutor_bot_conversation_id = :conversationId!
 * ```
 */
export const getTutorBotConversationMessagesByConversationId = new PreparedQuery<IGetTutorBotConversationMessagesByConversationIdParams,IGetTutorBotConversationMessagesByConversationIdResult>(getTutorBotConversationMessagesByConversationIdIR);


/** 'GetTutorBotConversationById' parameters type */
export interface IGetTutorBotConversationByIdParams {
  conversationId: string | null | void;
}

/** 'GetTutorBotConversationById' return type */
export interface IGetTutorBotConversationByIdResult {
  createdAt: Date;
  message: string;
  senderUserType: tutor_bot_conversation_user_type;
  tutorBotConversationId: string;
  userId: string;
}

/** 'GetTutorBotConversationById' query type */
export interface IGetTutorBotConversationByIdQuery {
  params: IGetTutorBotConversationByIdParams;
  result: IGetTutorBotConversationByIdResult;
}

const getTutorBotConversationByIdIR: any = {"name":"getTutorBotConversationById","params":[{"name":"conversationId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":437,"b":450,"line":25,"col":33}]}}],"usedParamSet":{"conversationId":true},"statement":{"body":"SELECT\n    *\nFROM\n    upchieve.tutor_bot_conversation_messages\nWHERE\n    tutor_bot_conversation_id = :conversationId\nORDER BY\n    created_at ASC","loc":{"a":335,"b":478,"line":20,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     upchieve.tutor_bot_conversation_messages
 * WHERE
 *     tutor_bot_conversation_id = :conversationId
 * ORDER BY
 *     created_at ASC
 * ```
 */
export const getTutorBotConversationById = new PreparedQuery<IGetTutorBotConversationByIdParams,IGetTutorBotConversationByIdResult>(getTutorBotConversationByIdIR);


/** 'InsertTutorBotConversationMessage' parameters type */
export interface IInsertTutorBotConversationMessageParams {
  conversationId: string;
  message: string;
  senderUserType: tutor_bot_conversation_user_type;
  userId: string;
}

/** 'InsertTutorBotConversationMessage' return type */
export type IInsertTutorBotConversationMessageResult = void;

/** 'InsertTutorBotConversationMessage' query type */
export interface IInsertTutorBotConversationMessageQuery {
  params: IInsertTutorBotConversationMessageParams;
  result: IInsertTutorBotConversationMessageResult;
}

const insertTutorBotConversationMessageIR: any = {"name":"insertTutorBotConversationMessage","params":[{"name":"conversationId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":662,"b":676,"line":32,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":680,"b":686,"line":32,"col":31}]}},{"name":"senderUserType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":690,"b":704,"line":32,"col":41}]}},{"name":"message","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":708,"b":715,"line":32,"col":59}]}}],"usedParamSet":{"conversationId":true,"userId":true,"senderUserType":true,"message":true},"statement":{"body":"INSERT INTO tutor_bot_conversation_messages (tutor_bot_conversation_id, user_id, sender_user_type, message, created_at)\n    VALUES (:conversationId!, :userId!, :senderUserType!, :message!, NOW())","loc":{"a":529,"b":723,"line":31,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO tutor_bot_conversation_messages (tutor_bot_conversation_id, user_id, sender_user_type, message, created_at)
 *     VALUES (:conversationId!, :userId!, :senderUserType!, :message!, NOW())
 * ```
 */
export const insertTutorBotConversationMessage = new PreparedQuery<IInsertTutorBotConversationMessageParams,IInsertTutorBotConversationMessageResult>(insertTutorBotConversationMessageIR);


