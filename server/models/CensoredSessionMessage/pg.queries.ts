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
  shown: boolean;
}

/** 'CreateCensoredMessage' return type */
export interface ICreateCensoredMessageResult {
  censoredBy: moderation_system;
  id: string;
  message: string | null;
  senderId: string;
  sentAt: Date;
  sessionId: string;
  shown: boolean;
}

/** 'CreateCensoredMessage' query type */
export interface ICreateCensoredMessageQuery {
  params: ICreateCensoredMessageParams;
  result: ICreateCensoredMessageResult;
}

const createCensoredMessageIR: any = {"name":"createCensoredMessage","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":151,"b":153,"line":3,"col":13}]}},{"name":"senderId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":157,"b":165,"line":3,"col":19}]}},{"name":"message","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":169,"b":176,"line":3,"col":31}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":180,"b":189,"line":3,"col":42}]}},{"name":"censoredBy","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":193,"b":203,"line":3,"col":55}]}},{"name":"sentAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":207,"b":213,"line":3,"col":69}]}},{"name":"shown","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":217,"b":222,"line":3,"col":79}]}}],"usedParamSet":{"id":true,"senderId":true,"message":true,"sessionId":true,"censoredBy":true,"sentAt":true,"shown":true},"statement":{"body":"INSERT INTO censored_session_messages (id, sender_id, message, session_id, censored_by, sent_at, shown)\n    VALUES (:id!, :senderId!, :message!, :sessionId!, :censoredBy!, :sentAt!, :shown!)\nRETURNING\n    id, sender_id, message, session_id, censored_by, sent_at, shown","loc":{"a":34,"b":301,"line":2,"col":0}}};

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


