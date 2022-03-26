-- migrate:up
ALTER TABLE upchieve.contact_form_submissions
  DROP CONSTRAINT contact_form_submissions_user_email_key,
  ALTER COLUMN user_email DROP NOT NULL;

-- migrate:down
ALTER TABLE upchieve.contact_form_submissions
  ADD UNIQUE (user_email)
  ALTER COLUMN user_email SET NOT NULL;
