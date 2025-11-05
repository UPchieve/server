-- migrate:up
CREATE UNIQUE INDEX users_lower_case_email_key ON upchieve.users ((lower(email)) text_ops);

-- migrate:down
DROP INDEX upchieve.users_lower_case_email_key;

