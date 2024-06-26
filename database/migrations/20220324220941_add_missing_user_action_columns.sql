-- migrate:up
ALTER TABLE upchieve.user_actions
    ADD COLUMN reference_email text,
    ADD COLUMN volunteer_id uuid;

-- migrate:down
ALTER TABLE upchieve.user_actions
    DROP COLUMN reference_email,
    DROP COLUMN volunteer_id;

