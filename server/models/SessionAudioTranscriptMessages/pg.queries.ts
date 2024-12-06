/** Types generated for queries found in "server/models/SessionAudioTranscriptMessages/session-audio-transcript-messages.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'InsertSessionAudioTranscriptMessage' parameters type */
export interface IInsertSessionAudioTranscriptMessageParams {
  id: string;
  message: string;
  saidAt: Date;
  sessionId: string;
  userId: string;
}

/** 'InsertSessionAudioTranscriptMessage' return type */
export interface IInsertSessionAudioTranscriptMessageResult {
  id: string;
}

/** 'InsertSessionAudioTranscriptMessage' query type */
export interface IInsertSessionAudioTranscriptMessageQuery {
  params: IInsertSessionAudioTranscriptMessageParams;
  result: IInsertSessionAudioTranscriptMessageResult;
}

const insertSessionAudioTranscriptMessageIR: any = {"name":"insertSessionAudioTranscriptMessage","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":151,"b":153,"line":3,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":157,"b":163,"line":3,"col":19}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":167,"b":176,"line":3,"col":29}]}},{"name":"message","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":180,"b":187,"line":3,"col":42}]}},{"name":"saidAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":191,"b":197,"line":3,"col":53}]}}],"usedParamSet":{"id":true,"userId":true,"sessionId":true,"message":true,"saidAt":true},"statement":{"body":"INSERT INTO session_audio_transcript_messages (id, user_id, session_id, message, said_at)\n    VALUES (:id!, :userId!, :sessionId!, :message!, :saidAt!)\nRETURNING\n    id","loc":{"a":48,"b":215,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_audio_transcript_messages (id, user_id, session_id, message, said_at)
 *     VALUES (:id!, :userId!, :sessionId!, :message!, :saidAt!)
 * RETURNING
 *     id
 * ```
 */
export const insertSessionAudioTranscriptMessage = new PreparedQuery<IInsertSessionAudioTranscriptMessageParams,IInsertSessionAudioTranscriptMessageResult>(insertSessionAudioTranscriptMessageIR);


