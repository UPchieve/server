-- migrate:up
ALTER TABLE upchieve.session_meetings
    ADD COLUMN recording_id TEXT;

-- migrate:down
ALTER TABLE upchieve.session_meetings
    DROP COLUMN recording_id;

