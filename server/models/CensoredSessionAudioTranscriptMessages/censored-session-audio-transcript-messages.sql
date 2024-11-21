/* @name insertCensoredSessionAudioTranscriptMessage */
INSERT INTO censored_session_audio_transcript_messages (session_audio_transcript_message_id, message)
    VALUES (:sessionAudioTranscriptMessageId!, :message!)
RETURNING
    *;

