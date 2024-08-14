-- migrate:up
ALTER TABLE upchieve.session_voice_messages
    ADD COLUMN transcript text;

-- migrate:down
ALTER TABLE upchieve.session_voice_messages
    DROP COLUMN transcript;

