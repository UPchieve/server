/** Types generated for queries found in "server/models/SessionAudioTranscriptMessages/session-audio-transcript-messages.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

/** 'InsertSessionAudioTranscriptMessage' parameters type */
export interface IInsertSessionAudioTranscriptMessageParams {
  id: string;
  message: string;
  saidAt: DateOrString;
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

const insertSessionAudioTranscriptMessageIR: any = {"usedParamSet":{"id":true,"userId":true,"sessionId":true,"message":true,"saidAt":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":102,"b":105}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":108,"b":115}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":118,"b":128}]},{"name":"message","required":true,"transform":{"type":"scalar"},"locs":[{"a":131,"b":139}]},{"name":"saidAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":142,"b":149}]}],"statement":"INSERT INTO session_audio_transcript_messages (id, user_id, session_id, message, said_at)\n    VALUES (:id!, :userId!, :sessionId!, :message!, :saidAt!)\nRETURNING\n    id"};

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


