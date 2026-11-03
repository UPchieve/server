/** Types generated for queries found in "server/models/DirectMessage/direct_message.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type NumberOrString = number | string;

/** 'CreateConversationIfEligible' parameters type */
export interface ICreateConversationIfEligibleParams {
  id: string;
  minSessionLength: NumberOrString;
  studentId: string;
  volunteerId: string;
}

/** 'CreateConversationIfEligible' return type */
export type ICreateConversationIfEligibleResult = void;

/** 'CreateConversationIfEligible' query type */
export interface ICreateConversationIfEligibleQuery {
  params: ICreateConversationIfEligibleParams;
  result: ICreateConversationIfEligibleResult;
}

const createConversationIfEligibleIR: any = {"usedParamSet":{"id":true,"studentId":true,"volunteerId":true,"minSessionLength":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":107,"b":110}]},{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":117,"b":127},{"a":291,"b":301}]},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":134,"b":146},{"a":334,"b":346}]},{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"locs":[{"a":416,"b":433}]}],"statement":"INSERT INTO direct_message_conversations (id, student_id, volunteer_id, created_at, updated_at)\nSELECT\n    :id!,\n    :studentId!,\n    :volunteerId!,\n    NOW(),\n    NOW()\nWHERE\n    EXISTS (\n        SELECT\n            1\n        FROM\n            sessions\n        WHERE\n            student_id = :studentId!\n            AND volunteer_id = :volunteerId!\n            AND ended_at IS NOT NULL\n            AND time_tutored > :minSessionLength!)\nON CONFLICT (volunteer_id,\n    student_id)\n    DO NOTHING"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO direct_message_conversations (id, student_id, volunteer_id, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :studentId!,
 *     :volunteerId!,
 *     NOW(),
 *     NOW()
 * WHERE
 *     EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             sessions
 *         WHERE
 *             student_id = :studentId!
 *             AND volunteer_id = :volunteerId!
 *             AND ended_at IS NOT NULL
 *             AND time_tutored > :minSessionLength!)
 * ON CONFLICT (volunteer_id,
 *     student_id)
 *     DO NOTHING
 * ```
 */
export const createConversationIfEligible = new PreparedQuery<ICreateConversationIfEligibleParams,ICreateConversationIfEligibleResult>(createConversationIfEligibleIR);


/** 'GetConversationByParticipants' parameters type */
export interface IGetConversationByParticipantsParams {
  studentId: string;
  volunteerId: string;
}

/** 'GetConversationByParticipants' return type */
export interface IGetConversationByParticipantsResult {
  /** not_pii */
  createdAt: Date;
  /** not_pii: Primary key */
  id: string;
  /** not_pii: Foreign key */
  studentId: string;
  /** not_pii: When the student last viewed the conversation */
  studentLastSeen: Date | null;
  /** not_pii: Foreign key */
  volunteerId: string;
  /** not_pii: When the volunteer last viewed the conversation */
  volunteerLastSeen: Date | null;
}

/** 'GetConversationByParticipants' query type */
export interface IGetConversationByParticipantsQuery {
  params: IGetConversationByParticipantsParams;
  result: IGetConversationByParticipantsResult;
}

const getConversationByParticipantsIR: any = {"usedParamSet":{"studentId":true,"volunteerId":true},"params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":173,"b":183}]},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":208,"b":220}]}],"statement":"SELECT\n    id,\n    student_id,\n    volunteer_id,\n    student_last_seen,\n    volunteer_last_seen,\n    created_at\nFROM\n    direct_message_conversations\nWHERE\n    student_id = :studentId!\n    AND volunteer_id = :volunteerId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     student_id,
 *     volunteer_id,
 *     student_last_seen,
 *     volunteer_last_seen,
 *     created_at
 * FROM
 *     direct_message_conversations
 * WHERE
 *     student_id = :studentId!
 *     AND volunteer_id = :volunteerId!
 * ```
 */
export const getConversationByParticipants = new PreparedQuery<IGetConversationByParticipantsParams,IGetConversationByParticipantsResult>(getConversationByParticipantsIR);


/** 'GetConversationForParticipant' parameters type */
export interface IGetConversationForParticipantParams {
  conversationId: string;
  userId: string;
}

/** 'GetConversationForParticipant' return type */
export interface IGetConversationForParticipantResult {
  /** not_pii */
  createdAt: Date;
  /** not_pii: Primary key */
  id: string;
  /** not_pii: Foreign key */
  studentId: string;
  /** not_pii: When the student last viewed the conversation */
  studentLastSeen: Date | null;
  /** not_pii: Foreign key */
  volunteerId: string;
  /** not_pii: When the volunteer last viewed the conversation */
  volunteerLastSeen: Date | null;
}

/** 'GetConversationForParticipant' query type */
export interface IGetConversationForParticipantQuery {
  params: IGetConversationForParticipantParams;
  result: IGetConversationForParticipantResult;
}

const getConversationForParticipantIR: any = {"usedParamSet":{"conversationId":true,"userId":true},"params":[{"name":"conversationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":165,"b":180}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":204,"b":211},{"a":239,"b":246}]}],"statement":"SELECT\n    id,\n    student_id,\n    volunteer_id,\n    student_last_seen,\n    volunteer_last_seen,\n    created_at\nFROM\n    direct_message_conversations\nWHERE\n    id = :conversationId!\n    AND (student_id = :userId!\n        OR volunteer_id = :userId!)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     student_id,
 *     volunteer_id,
 *     student_last_seen,
 *     volunteer_last_seen,
 *     created_at
 * FROM
 *     direct_message_conversations
 * WHERE
 *     id = :conversationId!
 *     AND (student_id = :userId!
 *         OR volunteer_id = :userId!)
 * ```
 */
export const getConversationForParticipant = new PreparedQuery<IGetConversationForParticipantParams,IGetConversationForParticipantResult>(getConversationForParticipantIR);


/** 'CreateDirectMessage' parameters type */
export interface ICreateDirectMessageParams {
  contents: string;
  conversationId: string;
  id: string;
  senderId: string;
}

/** 'CreateDirectMessage' return type */
export interface ICreateDirectMessageResult {
  /** not_pii: Text content of the chat message */
  contents: string;
  /** not_pii: Foreign key */
  conversationId: string;
  /** not_pii */
  createdAt: Date;
  /** not_pii: Primary key */
  id: string;
  /** not_pii: Foreign key */
  senderId: string;
}

/** 'CreateDirectMessage' query type */
export interface ICreateDirectMessageQuery {
  params: ICreateDirectMessageParams;
  result: ICreateDirectMessageResult;
}

const createDirectMessageIR: any = {"usedParamSet":{"id":true,"conversationId":true,"senderId":true,"contents":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":107,"b":110}]},{"name":"conversationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":113,"b":128}]},{"name":"senderId","required":true,"transform":{"type":"scalar"},"locs":[{"a":131,"b":140}]},{"name":"contents","required":true,"transform":{"type":"scalar"},"locs":[{"a":143,"b":152}]}],"statement":"INSERT INTO direct_messages (id, conversation_id, sender_id, contents, created_at, updated_at)\n    VALUES (:id!, :conversationId!, :senderId!, :contents!, NOW(), NOW())\nRETURNING\n    id, conversation_id, sender_id, contents, created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO direct_messages (id, conversation_id, sender_id, contents, created_at, updated_at)
 *     VALUES (:id!, :conversationId!, :senderId!, :contents!, NOW(), NOW())
 * RETURNING
 *     id, conversation_id, sender_id, contents, created_at
 * ```
 */
export const createDirectMessage = new PreparedQuery<ICreateDirectMessageParams,ICreateDirectMessageResult>(createDirectMessageIR);


/** 'GetDirectMessagesForConversation' parameters type */
export interface IGetDirectMessagesForConversationParams {
  conversationId: string;
}

/** 'GetDirectMessagesForConversation' return type */
export interface IGetDirectMessagesForConversationResult {
  /** not_pii: Text content of the chat message */
  contents: string;
  /** not_pii: Foreign key */
  conversationId: string;
  /** not_pii */
  createdAt: Date;
  /** not_pii: Primary key */
  id: string;
  /** not_pii: Foreign key */
  senderId: string;
}

/** 'GetDirectMessagesForConversation' query type */
export interface IGetDirectMessagesForConversationQuery {
  params: IGetDirectMessagesForConversationParams;
  result: IGetDirectMessagesForConversationResult;
}

const getDirectMessagesForConversationIR: any = {"usedParamSet":{"conversationId":true},"params":[{"name":"conversationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":133,"b":148}]}],"statement":"SELECT\n    id,\n    conversation_id,\n    sender_id,\n    contents,\n    created_at\nFROM\n    direct_messages\nWHERE\n    conversation_id = :conversationId!\nORDER BY\n    created_at"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     conversation_id,
 *     sender_id,
 *     contents,
 *     created_at
 * FROM
 *     direct_messages
 * WHERE
 *     conversation_id = :conversationId!
 * ORDER BY
 *     created_at
 * ```
 */
export const getDirectMessagesForConversation = new PreparedQuery<IGetDirectMessagesForConversationParams,IGetDirectMessagesForConversationResult>(getDirectMessagesForConversationIR);


