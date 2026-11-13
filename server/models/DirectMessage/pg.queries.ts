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
  sentWhileShadowbanned: boolean;
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
  /** not_pii: true when the sender was shadow banned at send time */
  sentWhileShadowbanned: boolean | null;
}

/** 'CreateDirectMessage' query type */
export interface ICreateDirectMessageQuery {
  params: ICreateDirectMessageParams;
  result: ICreateDirectMessageResult;
}

const createDirectMessageIR: any = {"usedParamSet":{"id":true,"conversationId":true,"senderId":true,"contents":true,"sentWhileShadowbanned":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":132,"b":135}]},{"name":"conversationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":138,"b":153}]},{"name":"senderId","required":true,"transform":{"type":"scalar"},"locs":[{"a":156,"b":165}]},{"name":"contents","required":true,"transform":{"type":"scalar"},"locs":[{"a":168,"b":177}]},{"name":"sentWhileShadowbanned","required":true,"transform":{"type":"scalar"},"locs":[{"a":180,"b":202}]}],"statement":"INSERT INTO direct_messages (id, conversation_id, sender_id, contents, sent_while_shadowbanned, created_at, updated_at)\n    VALUES (:id!, :conversationId!, :senderId!, :contents!, :sentWhileShadowbanned!, NOW(), NOW())\nRETURNING\n    id, conversation_id, sender_id, contents, sent_while_shadowbanned, created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO direct_messages (id, conversation_id, sender_id, contents, sent_while_shadowbanned, created_at, updated_at)
 *     VALUES (:id!, :conversationId!, :senderId!, :contents!, :sentWhileShadowbanned!, NOW(), NOW())
 * RETURNING
 *     id, conversation_id, sender_id, contents, sent_while_shadowbanned, created_at
 * ```
 */
export const createDirectMessage = new PreparedQuery<ICreateDirectMessageParams,ICreateDirectMessageResult>(createDirectMessageIR);


/** 'GetDirectMessagesForConversation' parameters type */
export interface IGetDirectMessagesForConversationParams {
  conversationId: string;
  viewerId: string;
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
  /** not_pii: true when the sender was shadow banned at send time */
  sentWhileShadowbanned: boolean | null;
}

/** 'GetDirectMessagesForConversation' query type */
export interface IGetDirectMessagesForConversationQuery {
  params: IGetDirectMessagesForConversationParams;
  result: IGetDirectMessagesForConversationResult;
}

const getDirectMessagesForConversationIR: any = {"usedParamSet":{"conversationId":true,"viewerId":true},"params":[{"name":"conversationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":162,"b":177}]},{"name":"viewerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":247,"b":256}]}],"statement":"SELECT\n    id,\n    conversation_id,\n    sender_id,\n    contents,\n    sent_while_shadowbanned,\n    created_at\nFROM\n    direct_messages\nWHERE\n    conversation_id = :conversationId!\n    AND (sent_while_shadowbanned IS NOT TRUE\n        OR sender_id = :viewerId!)\nORDER BY\n    created_at"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     conversation_id,
 *     sender_id,
 *     contents,
 *     sent_while_shadowbanned,
 *     created_at
 * FROM
 *     direct_messages
 * WHERE
 *     conversation_id = :conversationId!
 *     AND (sent_while_shadowbanned IS NOT TRUE
 *         OR sender_id = :viewerId!)
 * ORDER BY
 *     created_at
 * ```
 */
export const getDirectMessagesForConversation = new PreparedQuery<IGetDirectMessagesForConversationParams,IGetDirectMessagesForConversationResult>(getDirectMessagesForConversationIR);


/** 'UpdateConversationLastSeen' parameters type */
export interface IUpdateConversationLastSeenParams {
  conversationId: string;
  userId: string;
}

/** 'UpdateConversationLastSeen' return type */
export interface IUpdateConversationLastSeenResult {
  /** not_pii: Primary key */
  id: string;
}

/** 'UpdateConversationLastSeen' query type */
export interface IUpdateConversationLastSeenQuery {
  params: IUpdateConversationLastSeenParams;
  result: IUpdateConversationLastSeenResult;
}

const updateConversationLastSeenIR: any = {"usedParamSet":{"userId":true,"conversationId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":91,"b":98},{"a":214,"b":221},{"a":341,"b":348},{"a":376,"b":383}]},{"name":"conversationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":302,"b":317}]}],"statement":"UPDATE\n    direct_message_conversations\nSET\n    student_last_seen = CASE WHEN student_id = :userId! THEN\n        NOW()\n    ELSE\n        student_last_seen\n    END,\n    volunteer_last_seen = CASE WHEN volunteer_id = :userId! THEN\n        NOW()\n    ELSE\n        volunteer_last_seen\n    END\nWHERE\n    id = :conversationId!\n    AND (student_id = :userId!\n        OR volunteer_id = :userId!)\nRETURNING\n    id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     direct_message_conversations
 * SET
 *     student_last_seen = CASE WHEN student_id = :userId! THEN
 *         NOW()
 *     ELSE
 *         student_last_seen
 *     END,
 *     volunteer_last_seen = CASE WHEN volunteer_id = :userId! THEN
 *         NOW()
 *     ELSE
 *         volunteer_last_seen
 *     END
 * WHERE
 *     id = :conversationId!
 *     AND (student_id = :userId!
 *         OR volunteer_id = :userId!)
 * RETURNING
 *     id
 * ```
 */
export const updateConversationLastSeen = new PreparedQuery<IUpdateConversationLastSeenParams,IUpdateConversationLastSeenResult>(updateConversationLastSeenIR);


/** 'GetUnreadDirectMessageSenderIds' parameters type */
export interface IGetUnreadDirectMessageSenderIdsParams {
  userId: string;
}

/** 'GetUnreadDirectMessageSenderIds' return type */
export interface IGetUnreadDirectMessageSenderIdsResult {
  /** not_pii: Foreign key */
  senderId: string;
}

/** 'GetUnreadDirectMessageSenderIds' query type */
export interface IGetUnreadDirectMessageSenderIdsQuery {
  params: IGetUnreadDirectMessageSenderIdsParams;
  result: IGetUnreadDirectMessageSenderIdsResult;
}

const getUnreadDirectMessageSenderIdsIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":318,"b":325},{"a":505,"b":512},{"a":620,"b":627},{"a":655,"b":662}]}],"statement":"SELECT\n    unread.sender_id\nFROM\n    direct_message_conversations dmc\n    CROSS JOIN LATERAL (\n        SELECT\n            dm.sender_id\n        FROM\n            direct_messages dm\n        WHERE\n            dm.conversation_id = dmc.id\n            AND dm.created_at > COALESCE(\n                CASE WHEN dmc.student_id = :userId! THEN\n                    dmc.student_last_seen\n                ELSE\n                    dmc.volunteer_last_seen\n                END, '-infinity')\n            AND dm.sender_id != :userId!\n            AND dm.sent_while_shadowbanned IS NOT TRUE\n        LIMIT 1) unread\nWHERE\n    dmc.student_id = :userId!\n    OR dmc.volunteer_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     unread.sender_id
 * FROM
 *     direct_message_conversations dmc
 *     CROSS JOIN LATERAL (
 *         SELECT
 *             dm.sender_id
 *         FROM
 *             direct_messages dm
 *         WHERE
 *             dm.conversation_id = dmc.id
 *             AND dm.created_at > COALESCE(
 *                 CASE WHEN dmc.student_id = :userId! THEN
 *                     dmc.student_last_seen
 *                 ELSE
 *                     dmc.volunteer_last_seen
 *                 END, '-infinity')
 *             AND dm.sender_id != :userId!
 *             AND dm.sent_while_shadowbanned IS NOT TRUE
 *         LIMIT 1) unread
 * WHERE
 *     dmc.student_id = :userId!
 *     OR dmc.volunteer_id = :userId!
 * ```
 */
export const getUnreadDirectMessageSenderIds = new PreparedQuery<IGetUnreadDirectMessageSenderIdsParams,IGetUnreadDirectMessageSenderIdsResult>(getUnreadDirectMessageSenderIdsIR);


