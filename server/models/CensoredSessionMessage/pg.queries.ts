/** Types generated for queries found in "server/models/CensoredSessionMessage/censored_session_message.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type moderation_system = 'regex';

/** 'CreateCensoredMessage' parameters type */
export interface ICreateCensoredMessageParams {
  censoredBy: moderation_system;
  id: string;
  message: string;
  senderId: string;
  sentAt: Date;
  sessionId: string;
}

/** 'CreateCensoredMessage' return type */
export interface ICreateCensoredMessageResult {
  censoredBy: moderation_system;
  id: string;
  message: string | null;
  senderId: string;
  sentAt: Date;
  sessionId: string;
}

/** 'CreateCensoredMessage' query type */
export interface ICreateCensoredMessageQuery {
  params: ICreateCensoredMessageParams;
  result: ICreateCensoredMessageResult;
}

const createCensoredMessageIR: any = {"name":"createCensoredMessage","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":144,"b":146,"line":3,"col":13}]}},{"name":"senderId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":150,"b":158,"line":3,"col":19}]}},{"name":"message","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":162,"b":169,"line":3,"col":31}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":173,"b":182,"line":3,"col":42}]}},{"name":"censoredBy","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":186,"b":196,"line":3,"col":55}]}},{"name":"sentAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":200,"b":206,"line":3,"col":69}]}}],"usedParamSet":{"id":true,"senderId":true,"message":true,"sessionId":true,"censoredBy":true,"sentAt":true},"statement":{"body":"INSERT INTO censored_session_messages (id, sender_id, message, session_id, censored_by, sent_at)\n    VALUES (:id!, :senderId!, :message!, :sessionId!, :censoredBy!, :sentAt!)\nRETURNING\n    id, sender_id, message, session_id, censored_by, sent_at","loc":{"a":34,"b":278,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO censored_session_messages (id, sender_id, message, session_id, censored_by, sent_at)
 *     VALUES (:id!, :senderId!, :message!, :sessionId!, :censoredBy!, :sentAt!)
 * RETURNING
 *     id, sender_id, message, session_id, censored_by, sent_at
 * ```
 */
export const createCensoredMessage = new PreparedQuery<ICreateCensoredMessageParams,ICreateCensoredMessageResult>(createCensoredMessageIR);


