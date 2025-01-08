/** Types generated for queries found in "server/models/CensoredSessionMessage/censored_session_message.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** Query 'CreateCensoredMessage' is invalid, so its result is assigned type 'never'.
 *  */
export type ICreateCensoredMessageResult = never;

/** Query 'CreateCensoredMessage' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ICreateCensoredMessageParams = never;

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


