/** Types generated for queries found in "server/models/CensoredSessionAudioTranscriptMessages/censored-session-audio-transcript-messages.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'InsertCensoredSessionAudioTranscriptMessage' parameters type */
export interface IInsertCensoredSessionAudioTranscriptMessageParams {
  message: string;
  sessionAudioTranscriptMessageId: string;
}

/** 'InsertCensoredSessionAudioTranscriptMessage' return type */
export interface IInsertCensoredSessionAudioTranscriptMessageResult {
  message: string;
  sessionAudioTranscriptMessageId: string;
}

/** 'InsertCensoredSessionAudioTranscriptMessage' query type */
export interface IInsertCensoredSessionAudioTranscriptMessageQuery {
  params: IInsertCensoredSessionAudioTranscriptMessageParams;
  result: IInsertCensoredSessionAudioTranscriptMessageResult;
}

const insertCensoredSessionAudioTranscriptMessageIR: any = {"name":"insertCensoredSessionAudioTranscriptMessage","params":[{"name":"sessionAudioTranscriptMessageId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":171,"b":202,"line":3,"col":13}]}},{"name":"message","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":206,"b":213,"line":3,"col":48}]}}],"usedParamSet":{"sessionAudioTranscriptMessageId":true,"message":true},"statement":{"body":"INSERT INTO censored_session_audio_transcript_messages (session_audio_transcript_message_id, message)\n    VALUES (:sessionAudioTranscriptMessageId!, :message!)\nRETURNING\n    *","loc":{"a":56,"b":230,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO censored_session_audio_transcript_messages (session_audio_transcript_message_id, message)
 *     VALUES (:sessionAudioTranscriptMessageId!, :message!)
 * RETURNING
 *     *
 * ```
 */
export const insertCensoredSessionAudioTranscriptMessage = new PreparedQuery<IInsertCensoredSessionAudioTranscriptMessageParams,IInsertCensoredSessionAudioTranscriptMessageResult>(insertCensoredSessionAudioTranscriptMessageIR);


