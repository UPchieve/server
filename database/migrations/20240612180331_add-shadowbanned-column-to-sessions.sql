-- migrate:up
ALTER TABLE upchieve.sessions
    ADD COLUMN shadowbanned boolean;

-- migrate:down
ALTER TABLE upchieve.sessions
    DROP COLUMN shadowbanned;

