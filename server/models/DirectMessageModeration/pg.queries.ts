/** Types generated for queries found in "server/models/DirectMessageModeration/direct_message_moderation.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type moderation_system = 'ai' | 'regex';

export type NumberOrString = number | string;

export type stringArray = (string)[];

/** 'CreateCensoredDirectMessage' parameters type */
export interface ICreateCensoredDirectMessageParams {
  blocked: boolean;
  censoredBy: moderation_system;
  conversationId: string;
  id: string;
  message: string;
  reasons: stringArray;
  senderId: string;
}

/** 'CreateCensoredDirectMessage' return type */
export interface ICreateCensoredDirectMessageResult {
  /** not_pii: Primary key */
  id: string;
}

/** 'CreateCensoredDirectMessage' query type */
export interface ICreateCensoredDirectMessageQuery {
  params: ICreateCensoredDirectMessageParams;
  result: ICreateCensoredDirectMessageResult;
}

const createCensoredDirectMessageIR: any = {"usedParamSet":{"id":true,"conversationId":true,"senderId":true,"message":true,"censoredBy":true,"reasons":true,"blocked":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":122,"b":125}]},{"name":"conversationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":128,"b":143}]},{"name":"senderId","required":true,"transform":{"type":"scalar"},"locs":[{"a":146,"b":155}]},{"name":"message","required":true,"transform":{"type":"scalar"},"locs":[{"a":158,"b":166}]},{"name":"censoredBy","required":true,"transform":{"type":"scalar"},"locs":[{"a":169,"b":180}]},{"name":"reasons","required":true,"transform":{"type":"scalar"},"locs":[{"a":183,"b":191}]},{"name":"blocked","required":true,"transform":{"type":"scalar"},"locs":[{"a":202,"b":210}]}],"statement":"INSERT INTO censored_direct_messages (id, conversation_id, sender_id, message, censored_by, reasons, blocked)\n    VALUES (:id!, :conversationId!, :senderId!, :message!, :censoredBy!, :reasons!::text[], :blocked!)\nRETURNING\n    id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO censored_direct_messages (id, conversation_id, sender_id, message, censored_by, reasons, blocked)
 *     VALUES (:id!, :conversationId!, :senderId!, :message!, :censoredBy!, :reasons!::text[], :blocked!)
 * RETURNING
 *     id
 * ```
 */
export const createCensoredDirectMessage = new PreparedQuery<ICreateCensoredDirectMessageParams,ICreateCensoredDirectMessageResult>(createCensoredDirectMessageIR);


/** 'CreateDirectMessageFlag' parameters type */
export interface ICreateDirectMessageFlagParams {
  censoredMessageId: string;
  conversationId: string;
  flagName: string;
  id: string;
}

/** 'CreateDirectMessageFlag' return type */
export interface ICreateDirectMessageFlagResult {
  /** not_pii: Primary key */
  id: string;
}

/** 'CreateDirectMessageFlag' query type */
export interface ICreateDirectMessageFlagQuery {
  params: ICreateDirectMessageFlagParams;
  result: ICreateDirectMessageFlagResult;
}

const createDirectMessageFlagIR: any = {"usedParamSet":{"id":true,"flagName":true,"censoredMessageId":true,"conversationId":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":104,"b":107}]},{"name":"flagName","required":true,"transform":{"type":"scalar"},"locs":[{"a":258,"b":267}]},{"name":"censoredMessageId","required":true,"transform":{"type":"scalar"},"locs":[{"a":293,"b":311}]},{"name":"conversationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":348,"b":363}]}],"statement":"INSERT INTO direct_message_flags (id, conversation_id, session_flag_id, censored_message_id)\nSELECT\n    :id!,\n    censored.conversation_id,\n    flags.id,\n    censored.id\nFROM\n    censored_direct_messages censored\n    JOIN session_flags flags ON flags.name = :flagName!\nWHERE\n    censored.id = :censoredMessageId!\n    AND censored.conversation_id = :conversationId!\nRETURNING\n    id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO direct_message_flags (id, conversation_id, session_flag_id, censored_message_id)
 * SELECT
 *     :id!,
 *     censored.conversation_id,
 *     flags.id,
 *     censored.id
 * FROM
 *     censored_direct_messages censored
 *     JOIN session_flags flags ON flags.name = :flagName!
 * WHERE
 *     censored.id = :censoredMessageId!
 *     AND censored.conversation_id = :conversationId!
 * RETURNING
 *     id
 * ```
 */
export const createDirectMessageFlag = new PreparedQuery<ICreateDirectMessageFlagParams,ICreateDirectMessageFlagResult>(createDirectMessageFlagIR);


/** 'GetRecentMessages' parameters type */
export interface IGetRecentMessagesParams {
  conversationId: string;
  limit: NumberOrString;
}

/** 'GetRecentMessages' return type */
export interface IGetRecentMessagesResult {
  /** not_pii: Text content of the chat message */
  contents: string;
  /** not_pii */
  createdAt: Date;
  /** not_pii: Primary key */
  id: string;
  /** not_pii: Foreign key */
  senderId: string;
}

/** 'GetRecentMessages' query type */
export interface IGetRecentMessagesQuery {
  params: IGetRecentMessagesParams;
  result: IGetRecentMessagesResult;
}

const getRecentMessagesIR: any = {"usedParamSet":{"conversationId":true,"limit":true},"params":[{"name":"conversationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":112,"b":127}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":177,"b":183}]}],"statement":"SELECT\n    id,\n    sender_id,\n    contents,\n    created_at\nFROM\n    direct_messages\nWHERE\n    conversation_id = :conversationId!\nORDER BY\n    created_at DESC,\n    id DESC\nLIMIT :limit!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     sender_id,
 *     contents,
 *     created_at
 * FROM
 *     direct_messages
 * WHERE
 *     conversation_id = :conversationId!
 * ORDER BY
 *     created_at DESC,
 *     id DESC
 * LIMIT :limit!
 * ```
 */
export const getRecentMessages = new PreparedQuery<IGetRecentMessagesParams,IGetRecentMessagesResult>(getRecentMessagesIR);


