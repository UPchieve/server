-- migrate:up
ALTER TABLE upchieve.user_actions
    ADD COLUMN ban_reason text;

-- migrate:down
ALTER TABLE upchieve.user_actions
    DROP COLUMN ban_reason;

