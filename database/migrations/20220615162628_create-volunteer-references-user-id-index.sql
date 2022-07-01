-- migrate:up
ALTER TABLE upchieve.volunteer_references
  DROP CONSTRAINT IF EXISTS user_id_ref_email_unique;
  
-- migrate:down
ALTER TABLE upchieve.volunteer_references
  ADD CONSTRAINT user_id_ref_email_unique UNIQUE (user_id, email);
