-- migrate:up
ALTER TABLE upchieve.session_messages
    ADD COLUMN read_at date;

-- migrate:down
ALTER TABLE upchieve.session_messages
    DROP COLUMN read_at;

