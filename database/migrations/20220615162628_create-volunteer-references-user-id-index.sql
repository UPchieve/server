-- migrate:up
ALTER TABLE upchieve.volunteer_references
    DROP CONSTRAINT IF EXISTS user_id_ref_email_unique;

-- migrate:down
-- drop constraint before adding so it doesn't get double-added
ALTER TABLE upchieve.volunteer_references
    DROP CONSTRAINT IF EXISTS user_id_ref_email_unique,
    ADD CONSTRAINT user_id_ref_email_unique UNIQUE (user_id, email);

