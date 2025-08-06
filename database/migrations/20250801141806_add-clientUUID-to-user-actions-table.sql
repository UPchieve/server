-- migrate:up
ALTER TABLE upchieve.user_actions
    ADD COLUMN clientUUID UUID DEFAULT NULL;

-- migrate:down
ALTER TABLE upchieve.user_actions
    DROP COLUMN clientUUID;

