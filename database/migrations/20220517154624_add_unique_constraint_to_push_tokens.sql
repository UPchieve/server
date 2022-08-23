-- migrate:up
ALTER TABLE upchieve.push_tokens
    ADD CONSTRAINT user_id_token UNIQUE (user_id, token);

-- migrate:down
ALTER TABLE upchieve.push_tokens
    DROP CONSTRAINT user_id_token;

