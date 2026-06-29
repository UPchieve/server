/** Types generated for queries found in "server/models/CensoredSessionMessage/censored_session_message.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type moderation_system = 'regex';

export type DateOrString = Date | string;

/** 'CreateCensoredMessage' parameters type */
export interface ICreateCensoredMessageParams {
  censoredBy: moderation_system;
  id: string;
  message: string;
  senderId: string;
  sentAt: DateOrString;
  sessionId: string;
  shown: boolean;
}

/** 'CreateCensoredMessage' return type */
export interface ICreateCensoredMessageResult {
  /** not_pii: Moderation system that flagged the message */
  censoredBy: moderation_system;
  /** not_pii: Primary key */
  id: string;
  /** not_pii: Message text content */
  message: string | null;
  /** not_pii: Foreign key to upchieve.users (the message sender) */
  senderId: string;
  /** not_pii: Timestamp when the message was sent */
  sentAt: Date;
  /** not_pii: Foreign key to upchieve.sessions */
  sessionId: string;
  /** not_pii: Whether the non-censored message was shown to the recipient */
  shown: boolean;
}

/** 'CreateCensoredMessage' query type */
export interface ICreateCensoredMessageQuery {
  params: ICreateCensoredMessageParams;
  result: ICreateCensoredMessageResult;
}

const createCensoredMessageIR: any = {"usedParamSet":{"id":true,"senderId":true,"message":true,"sessionId":true,"censoredBy":true,"sentAt":true,"shown":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":116,"b":119}]},{"name":"senderId","required":true,"transform":{"type":"scalar"},"locs":[{"a":122,"b":131}]},{"name":"message","required":true,"transform":{"type":"scalar"},"locs":[{"a":134,"b":142}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":145,"b":155}]},{"name":"censoredBy","required":true,"transform":{"type":"scalar"},"locs":[{"a":158,"b":169}]},{"name":"sentAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":172,"b":179}]},{"name":"shown","required":true,"transform":{"type":"scalar"},"locs":[{"a":182,"b":188}]}],"statement":"INSERT INTO censored_session_messages (id, sender_id, message, session_id, censored_by, sent_at, shown)\n    VALUES (:id!, :senderId!, :message!, :sessionId!, :censoredBy!, :sentAt!, :shown!)\nRETURNING\n    id, sender_id, message, session_id, censored_by, sent_at, shown"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO censored_session_messages (id, sender_id, message, session_id, censored_by, sent_at, shown)
 *     VALUES (:id!, :senderId!, :message!, :sessionId!, :censoredBy!, :sentAt!, :shown!)
 * RETURNING
 *     id, sender_id, message, session_id, censored_by, sent_at, shown
 * ```
 */
export const createCensoredMessage = new PreparedQuery<ICreateCensoredMessageParams,ICreateCensoredMessageResult>(createCensoredMessageIR);


