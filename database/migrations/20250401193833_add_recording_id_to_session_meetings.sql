-- migrate:up
ALTER TABLE upchieve.session_meetings
    ADD COLUMN recording_url TEXT;

-- migrate:down
ALTER TABLE upchieve.session_meetings
    DROP COLUMN recording_url;

