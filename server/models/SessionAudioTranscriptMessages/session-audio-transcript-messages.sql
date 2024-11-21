/* @name insertSessionAudioTranscriptMessage */
INSERT INTO session_audio_transcript_messages (id, user_id, session_id, message, said_at)
    VALUES (:id!, :userId!, :sessionId!, :message!, :saidAt!)
RETURNING
    id;

